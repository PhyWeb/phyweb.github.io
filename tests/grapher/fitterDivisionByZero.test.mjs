import '../helpers/setup.mjs';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workerFilePath = path.resolve(__dirname, '../../grapher/modules/fitter.worker.js');
const workerCode = fs.readFileSync(workerFilePath, 'utf8');

const alglibPath = path.resolve(__dirname, '../../common/alglib/alglib-v1.1.0.js');
const alglibCode = fs.readFileSync(alglibPath, 'utf8');

function createAlglib() {
  const sandbox = {
    self: null,
    console: console,
    Math,
    Array,
    Promise,
    WebAssembly,
    ArrayBuffer,
    Uint8Array,
    Float64Array,
    Float32Array,
    Int8Array,
    Int16Array,
    Int32Array,
    Uint16Array,
    Uint32Array,
    performance,
    setTimeout,
    clearTimeout
  };
  sandbox.self = sandbox;
  const context = vm.createContext(sandbox);
  vm.runInContext(alglibCode, context);
  return sandbox.Alglib;
}

function extractWorkerFn1(modelType, data) {
  let capturedFn = null;
  class CapturingAlglib {
    constructor() {
      this.promise = Promise.resolve();
    }
    add_function(fn) {
      capturedFn = fn;
    }
    solve() {}
    get_results() {
      return [1];
    }
    remove() {}
  }

  const sandbox = {
    self: null,
    Alglib: CapturingAlglib,
    importScripts: () => {},
    postMessage: () => {},
    console,
    Math,
    Array,
    Promise
  };
  sandbox.self = sandbox;
  const context = vm.createContext(sandbox);
  vm.runInContext(workerCode, context);

  sandbox.onmessage({
    data: {
      data,
      modelType,
      initialGuess: [1]
    }
  });

  return capturedFn;
}

describe('Bug 2.2 : Modèles exp1, exp2, dampedsin, dampedcos - Protection contre division par zéro et non-finitude', () => {
  const Alglib = createAlglib();

  describe('1. Protection de fn1 dans fitter.worker.js : renvoi de la pénalité 1e30 au lieu de NaN / Infinity', () => {
    it('modèle exp1 : fn1 renvoie 1e30 au lieu de NaN si an[1] === 0 avec un point en x=0 (division -0/0)', () => {
      const data = [[0, 2], [1, 1]];
      const fn1 = extractWorkerFn1('exp1', data);
      assert.ok(fn1, 'fn1 doit être extrait du worker');

      const result = fn1([1, 0]);
      assert.equal(result, 1e30, 'fn1 doit renvoyer la pénalité 1e30');
      assert.equal(Number.isFinite(result), true, 'fn1 doit être un nombre fini');
    });

    it('modèle exp1 : fn1 renvoie 1e30 au lieu de Infinity si an[1] < 0 et très proche de 0 avec x > 0', () => {
      const data = [[1, 2], [2, 1]];
      const fn1 = extractWorkerFn1('exp1', data);

      const result = fn1([1, -1e-6]);
      assert.equal(result, 1e30, 'fn1 doit renvoyer la pénalité 1e30');
      assert.equal(Number.isFinite(result), true);
    });

    it('modèle exp2 : fn1 renvoie 1e30 si an[1] === 0 avec un point en x=0', () => {
      const data = [[0, 0], [1, 2]];
      const fn1 = extractWorkerFn1('exp2', data);

      const result = fn1([1, 0]);
      assert.equal(result, 1e30);
      assert.equal(Number.isFinite(result), true);
    });

    it('modèle exp2 : fn1 renvoie 1e30 si an[1] < 0 et très proche de 0 avec x > 0', () => {
      const data = [[1, 2], [2, 3]];
      const fn1 = extractWorkerFn1('exp2', data);

      const result = fn1([1, -1e-6]);
      assert.equal(result, 1e30);
      assert.equal(Number.isFinite(result), true);
    });

    it('modèle dampedsin : fn1 renvoie 1e30 si an[3] === 0 avec x=0', () => {
      const data = [[0, 0], [1, 1]];
      const fn1 = extractWorkerFn1('dampedsin', data);

      const result = fn1([1, 1, 0, 0, 0]);
      assert.equal(result, 1e30);
      assert.equal(Number.isFinite(result), true);
    });

    it('modèle dampedsin : fn1 renvoie 1e30 si an[3] < 0 et très proche de 0 avec x > 0', () => {
      const data = [[1, 1], [2, 0.5]];
      const fn1 = extractWorkerFn1('dampedsin', data);

      const result = fn1([1, 1, 0, -1e-6, 0]);
      assert.equal(result, 1e30);
      assert.equal(Number.isFinite(result), true);
    });

    it('modèle dampedcos : fn1 renvoie 1e30 si an[3] === 0 avec x=0', () => {
      const data = [[0, 1], [1, 0.5]];
      const fn1 = extractWorkerFn1('dampedcos', data);

      const result = fn1([1, 1, 0, 0, 0]);
      assert.equal(result, 1e30);
      assert.equal(Number.isFinite(result), true);
    });

    it('modèle dampedcos : fn1 renvoie 1e30 si an[3] < 0 et très proche de 0 avec x > 0', () => {
      const data = [[1, 1], [2, 0.5]];
      const fn1 = extractWorkerFn1('dampedcos', data);

      const result = fn1([1, 1, 0, -1e-6, 0]);
      assert.equal(result, 1e30);
      assert.equal(Number.isFinite(result), true);
    });
  });

  describe('2. Intégration Alglib et résolution du Worker', () => {
    it('permet à Alglib de converger sans crash -8 lors d\'un ajustement exp1', async () => {
      const N = 25;
      const data = [];
      for (let i = 0; i < N; i++) {
        const t = (i / (N - 1)) * 1.0;
        data.push([t, 5 * Math.exp(-t / 0.2)]);
      }

      const fn1 = extractWorkerFn1('exp1', data);

      const solver = new Alglib();
      solver.add_function(fn1);
      await solver.promise;

      solver.solve('min', [4.5, 0.05]);
      const termType = solver.termType;
      const results = solver.get_results();
      solver.remove();

      assert.notEqual(termType, -8, 'Alglib ne doit pas subir l\'arrêt anormal -8');
      assert.ok(Math.abs(results[0] - 5.0) < 0.2, `Amplitude a attendue ~5.0 (reçu: ${results[0]})`);
      assert.ok(Math.abs(results[1] - 0.2) < 0.05, `Tau attendu ~0.2 (reçu: ${results[1]})`);
    });

    it('le Worker complet renvoie final_result avec succès sur des données réelles contenant x = 0', async () => {
      const messages = [];
      const sandbox = {
        self: null,
        Alglib: Alglib,
        importScripts: () => {},
        postMessage: (msg) => messages.push(msg),
        console,
        Math,
        Array,
        Promise,
        Float64Array
      };
      sandbox.self = sandbox;
      const context = vm.createContext(sandbox);
      vm.runInContext(workerCode, context);

      const N = 20;
      const data = [];
      for (let i = 0; i < N; i++) {
        const t = (i / (N - 1)) * 1.0;
        data.push([t, 3.5 * Math.exp(-t / 0.15)]);
      }

      await sandbox.onmessage({
        data: {
          data,
          modelType: 'exp1',
          initialGuess: [3, 0.1]
        }
      });

      const finalMsg = messages.find(m => m.type === 'final_result');
      assert.ok(finalMsg, 'Le worker doit poster un message de type final_result');
      assert.equal(finalMsg.success, true);
      assert.ok(Math.abs(finalMsg.params[0] - 3.5) < 0.2);
      assert.ok(Math.abs(finalMsg.params[1] - 0.15) < 0.05);
    });

    it('le Worker renvoie un message error si Alglib signale une divergence critique (termType === -8)', async () => {
      class DivergentAlglib {
        constructor() {
          this.promise = Promise.resolve();
          this.termType = 0;
        }
        add_function(fn) {
          this.fn = fn;
        }
        solve() {
          this.termType = -8;
        }
        get_results() {
          return [NaN, NaN];
        }
        remove() {}
      }

      const messages = [];
      const sandbox = {
        self: null,
        Alglib: DivergentAlglib,
        importScripts: () => {},
        postMessage: (msg) => messages.push(msg),
        console,
        Math,
        Array,
        Promise,
        Float64Array
      };
      sandbox.self = sandbox;
      const context = vm.createContext(sandbox);
      vm.runInContext(workerCode, context);

      await sandbox.onmessage({
        data: {
          data: [[0, 1], [1, 2]],
          modelType: 'exp1',
          initialGuess: [1, 1]
        }
      });

      assert.equal(messages.length, 1);
      assert.equal(messages[0].type, 'error');
      assert.equal(messages[0].success, false);
      assert.ok(messages[0].error.includes('divergence numérique'));
    });
  });
});
