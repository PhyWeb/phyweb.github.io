import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  SUPPORTED_MODEL_TYPES,
  getModelFunction,
  getModelName,
  getModelParamCount
} from '../../grapher/modules/models/modelDefinitions.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORKER_PATH = path.resolve(__dirname, '../../grapher/modules/fitter.worker.js');

function loadWorkerGetFunction() {
  const source = fs.readFileSync(WORKER_PATH, 'utf8');
  const sandbox = {
    Math,
    Number,
    Array,
    Error,
    console: { error: () => {}, warn: () => {}, log: () => {} },
    importScripts: () => {},
    self: {
      postMessage: () => {}
    }
  };
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox, { filename: 'fitter.worker.js' });
  return sandbox.getFunction;
}

describe('Parité modelDefinitions.js <-> fitter.worker.js', () => {
  const workerGetFunction = loadWorkerGetFunction();

  const sampleParamsByCount = {
    1: [2.5],
    2: [3.2, 1.7],
    3: [0.5, -1.2, 4.0],
    4: [2.0, 1.5, 0.4, -0.8],
    5: [2.5, 1.8, 0.3, 4.5, -0.6]
  };

  const sampleXs = [0.25, 1.0, 2.5, 5.0];

  it('couvre exactement les 12 types de modèles et renvoie des valeurs identiques à fitter.worker.js', () => {
    assert.equal(SUPPORTED_MODEL_TYPES.size, 12);

    for (const type of SUPPORTED_MODEL_TYPES) {
      const paramCount = getModelParamCount(type);
      const params = sampleParamsByCount[paramCount];
      assert.ok(params, `Paramètres d'exemple manquants pour ${type} (${paramCount})`);

      const fMain = getModelFunction(type);
      const fWorker = workerGetFunction(type);

      for (const x of sampleXs) {
        const yMain = fMain(params, x);
        const yWorker = fWorker(params, x);
        assert.equal(
          yMain,
          yWorker,
          `Divergence pour le modèle "${type}" à x=${x}: main=${yMain} vs worker=${yWorker}`
        );
      }

      assert.notEqual(getModelName(type), 'Modèle inconnu');
    }
  });

  it('retourne 0 pour un type inconnu des deux côtés', () => {
    assert.equal(getModelFunction('unknown')([1, 2], 3), 0);
    assert.equal(workerGetFunction('unknown')([1, 2], 3), 0);
  });
});
