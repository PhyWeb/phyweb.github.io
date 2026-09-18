import '../helpers/setup.mjs';
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Data, { Model } from '../../grapher/modules/data.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workerFilePath = path.resolve(__dirname, '../../grapher/modules/fitter.worker.js');
const workerCode = fs.readFileSync(workerFilePath, 'utf8');

function createWorkerSandbox({ importScriptsMock, initialAlglib = undefined }) {
  const messages = [];
  const sandbox = {};
  sandbox.self = sandbox;
  sandbox.Alglib = initialAlglib;
  sandbox.importScripts = (...args) => {
    if (importScriptsMock) {
      importScriptsMock(sandbox, ...args);
    }
  };
  sandbox.postMessage = (msg) => {
    messages.push(msg);
  };
  sandbox.console = {
    error: () => {},
    warn: () => {},
    log: () => {}
  };
  sandbox.Math = Math;
  sandbox.Array = Array;
  sandbox.Promise = Promise;

  const context = vm.createContext(sandbox);
  vm.runInContext(workerCode, context);
  return { self: sandbox, messages };
}

describe('fitter.worker.js - Gestion du chargement d\'Alglib et erreurs', () => {
  it('doit poster un message d\'erreur au lieu de sortir silencieusement si importScripts échoue', async () => {
    const { self, messages } = createWorkerSandbox({
      importScriptsMock: () => {
        throw new Error("Failed to load script '../../common/alglib/alglib-v1.1.0.js': 404 Not Found");
      }
    });

    assert.equal(typeof self.onmessage, 'function', 'self.onmessage doit être défini par le worker');

    // On simule l'envoi d'une demande de fit depuis le thread principal
    await self.onmessage({
      data: {
        data: [[1, 2], [2, 4]],
        modelType: 'linear',
        initialGuess: [1]
      }
    });

    // Sans la correction (bug #L56: if (!self.Alglib) return;), messages reste vide et bloque l'UI
    assert.equal(messages.length, 1, 'Le worker doit poster exactement 1 message');
    assert.equal(messages[0].type, 'error');
    assert.equal(messages[0].success, false);
    assert.ok(
      messages[0].error.includes('Alglib') || messages[0].error.includes('404'),
      `Le message d'erreur doit mentionner l'échec de chargement d'Alglib (reçu: ${messages[0].error})`
    );
  });

  it('doit poster un message d\'erreur si self.Alglib n\'est pas défini après importScripts', async () => {
    const { self, messages } = createWorkerSandbox({
      importScriptsMock: () => {
        // Le script est lu sans erreur mais ne définit pas self.Alglib
      }
    });

    await self.onmessage({
      data: {
        data: [[1, 2], [2, 4]],
        modelType: 'linear',
        initialGuess: [1]
      }
    });

    assert.equal(messages.length, 1, 'Le worker doit poster un message d\'erreur');
    assert.equal(messages[0].type, 'error');
    assert.equal(messages[0].success, false);
    assert.ok(messages[0].error.includes('Alglib'), 'Le message doit expliciter l\'absence d\'Alglib');
  });

  it('doit effectuer le calcul et poster final_result si Alglib est disponible', async () => {
    class MockAlglib {
      constructor() {
        this.promise = Promise.resolve();
      }
      add_function(fn) {
        this.fn = fn;
      }
      solve(mode, initialGuess) {
        this.fn(initialGuess);
      }
      get_results() {
        return [2.0];
      }
      remove() {}
    }

    const { self, messages } = createWorkerSandbox({
      importScriptsMock: (sb) => {
        sb.Alglib = MockAlglib;
      }
    });

    await self.onmessage({
      data: {
        data: [[1, 2], [2, 4]],
        modelType: 'linear',
        initialGuess: [1]
      }
    });

    assert.equal(messages.length, 1);
    assert.equal(messages[0].type, 'final_result');
    assert.equal(messages[0].success, true);
    assert.deepEqual(messages[0].params, [2.0]);
  });

  it('doit poster un message d\'erreur si le solver Alglib lève une exception', async () => {
    class ThrowingAlglib {
      constructor() {
        this.promise = Promise.resolve();
      }
      add_function() {}
      solve() {
        throw new Error('Divergence numérique dans Alglib');
      }
      remove() {}
    }

    const { self, messages } = createWorkerSandbox({
      importScriptsMock: (sb) => {
        sb.Alglib = ThrowingAlglib;
      }
    });

    await self.onmessage({
      data: {
        data: [[1, 2], [2, 4]],
        modelType: 'linear',
        initialGuess: [1]
      }
    });

    assert.equal(messages.length, 1);
    assert.equal(messages[0].type, 'error');
    assert.equal(messages[0].success, false);
    assert.equal(messages[0].error, 'Divergence numérique dans Alglib');
  });
});

describe('Model.fit() - Intégration et gestion des réponses du Worker', () => {
  let originalWorker;
  let dispatchedEvents = [];
  const eventListener = (e) => {
    dispatchedEvents.push(e.type);
  };

  class MockWorkerInstance {
    constructor(scriptPath) {
      this.scriptPath = scriptPath;
      this.onmessage = null;
      this.onerror = null;
      this.terminated = false;
      MockWorkerInstance.latestInstance = this;
    }

    postMessage(data) {
      this.postedData = data;
      if (MockWorkerInstance.onPostMessage) {
        MockWorkerInstance.onPostMessage(this, data);
      }
    }

    terminate() {
      this.terminated = true;
    }
  }

  beforeEach(() => {
    originalWorker = global.Worker;
    global.Worker = MockWorkerInstance;
    MockWorkerInstance.latestInstance = null;
    MockWorkerInstance.onPostMessage = null;
    dispatchedEvents = [];
    document.addEventListener('model-fit-start', eventListener);
    document.addEventListener('model-fit-end', eventListener);
  });

  afterEach(() => {
    global.Worker = originalWorker;
    document.removeEventListener('model-fit-start', eventListener);
    document.removeEventListener('model-fit-end', eventListener);
  });

  const createTestModel = () => {
    const x = [1, 2, 3];
    const y = [2, 4, 6];
    const mockData = {
      parameters: {},
      curves: []
    };
    return new Model(x, y, 'linear', mockData);
  };

  it('doit rejeter la promesse model.fit() et déclencher model-fit-end si le worker renvoie une erreur', async () => {
    MockWorkerInstance.onPostMessage = (worker) => {
      // Simule la réponse d'erreur du worker
      setTimeout(() => {
        worker.onmessage({
          data: {
            type: 'error',
            success: false,
            error: "Alglib n'a pas pu être chargé dans le Web Worker."
          }
        });
      }, 5);
    };

    const model = createTestModel();
    await assert.rejects(
      async () => {
        await model.fit();
      },
      (err) => {
        assert.equal(err.message, "Alglib n'a pas pu être chargé dans le Web Worker.");
        return true;
      }
    );

    assert.equal(model.activeWorker, null, 'activeWorker doit être réinitialisé à null');
    assert.ok(dispatchedEvents.includes('model-fit-start'), 'model-fit-start doit avoir été émis');
    assert.ok(dispatchedEvents.includes('model-fit-end'), 'model-fit-end doit avoir été émis même en cas d\'erreur');
    assert.equal(MockWorkerInstance.latestInstance.terminated, true, 'Le worker doit être terminé pour éviter les fuites');
  });

  it('doit résoudre la promesse model.fit(), terminer le worker et déclencher model-fit-end en cas de succès', async () => {
    MockWorkerInstance.onPostMessage = (worker) => {
      setTimeout(() => {
        worker.onmessage({
          data: {
            type: 'final_result',
            success: true,
            params: [2.0]
          }
        });
      }, 5);
    };

    const model = createTestModel();
    const result = await model.fit();

    assert.equal(result, model);
    assert.equal(model.activeWorker, null);
    assert.ok(dispatchedEvents.includes('model-fit-start'));
    assert.ok(dispatchedEvents.includes('model-fit-end'));
    assert.equal(MockWorkerInstance.latestInstance.terminated, true, 'Le worker doit être terminé après le résultat final');
  });

  it('démontre que si le worker ne renvoie aucun message (bug initial), la promesse reste bloquée', async () => {
    MockWorkerInstance.onPostMessage = () => {
      // Simule le comportement défectueux : le worker fait "return;" et n'envoie rien
    };

    const model = createTestModel();
    let isSettled = false;
    model.fit().then(() => { isSettled = true; }, () => { isSettled = true; });

    await new Promise((resolve) => setTimeout(resolve, 30));

    assert.equal(isSettled, false, 'Sans message du worker, la promesse ne se résout ni ne se rejette jamais');
    assert.notEqual(model.activeWorker, null, 'Le worker reste actif indéfiniment');
    assert.equal(dispatchedEvents.includes('model-fit-end'), false, 'model-fit-end n\'est jamais émis et l\'UI reste bloquée');
  });
});
