import '../helpers/setup.mjs';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Data, { Model } from '../../grapher/modules/data.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
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

describe('Résolution du Bug 2.1 : Estimation initiale exp1 et exp2 (_estimateInitialGuess)', () => {
  const Alglib = createAlglib();
  const mockData = { parameters: {}, curves: [] };

  describe('Modèle exp2 : gestion des grandeurs négatives (a < 0)', () => {
    it('doit estimer a < 0 et b > 0 pour des ordonnées négatives y(t) = -5*(1 - exp(-t/0.1))', () => {
      const N = 30;
      const data = [];
      for (let i = 0; i < N; i++) {
        const t = (i / (N - 1)) * 0.5; // 0 à 5*tau
        const y = -5 * (1 - Math.exp(-t / 0.1));
        data.push([t, y]);
      }

      const model = new Model([], [], 'exp2', mockData);
      const guess = model._estimateInitialGuess(data);

      assert.ok(guess);
      assert.equal(guess.length, 2);
      assert.ok(guess[0] < 0, `a doit être négatif (reçu: ${guess[0]})`);
      assert.ok(Math.abs(guess[0] - (-5.25)) < 0.1, `a doit être proche de -5.25 (reçu: ${guess[0]})`);
      assert.ok(guess[1] > 0, `b doit être positif (reçu: ${guess[1]})`);
      assert.ok(Math.abs(guess[1] - 0.1) < 0.08, `b doit être dans l'ordre de grandeur de tau = 0.1 s (reçu: ${guess[1]})`);
    });

    it('permet à Alglib de converger parfaitement sur des données négatives grâce à l\'estimation corrigée', async () => {
      const N = 30;
      const data = [];
      for (let i = 0; i < N; i++) {
        const t = (i / (N - 1)) * 0.5;
        const y = -5 * (1 - Math.exp(-t / 0.1));
        data.push([t, y]);
      }

      const model = new Model([], [], 'exp2', mockData);
      const guess = model._estimateInitialGuess(data);

      const fExp2 = (an, x) => an[0] * (1 - Math.exp(-x / an[1]));
      const objective = (a) => {
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          sum += Math.pow(data[i][1] - fExp2(a, data[i][0]), 2);
        }
        return Math.sqrt(sum);
      };

      const solver = new Alglib();
      solver.add_function(objective);
      await solver.promise;
      solver.solve('min', guess);
      const res = solver.get_results();
      solver.remove();

      const rmse = objective(res) / Math.sqrt(N);
      assert.ok(rmse < 0.01, `RMSE après fit doit être négligeable (reçu: ${rmse})`);
      assert.ok(Math.abs(res[0] - (-5.0)) < 0.05, `Asymptote a attendue ~-5.0 (reçu: ${res[0]})`);
      assert.ok(Math.abs(res[1] - 0.1) < 0.01, `Tau attendu ~0.1 s (reçu: ${res[1]})`);
    });
  });

  describe('Modèle exp2 : constante de temps par défaut basée sur (maxX - minX) / 3', () => {
    it('doit initialiser b par défaut à (maxX - minX) / 3 au lieu de 1 s en cas d\'échec de régression', () => {
      const minX = 0;
      const maxX = 0.0025; // 2.5 ms
      const expectedTau = (maxX - minX) / 3; // ~0.000833 s

      const dataConstant = [
        [minX, 5.0],
        [maxX, 5.0]
      ];

      const model = new Model([], [], 'exp2', mockData);
      const guess = model._estimateInitialGuess(dataConstant);

      assert.ok(guess);
      assert.equal(guess.length, 2);
      assert.ok(Math.abs(guess[1] - expectedTau) < 1e-6, `b doit valoir (maxX - minX)/3 ~${expectedTau} s (reçu: ${guess[1]})`);
    });

    it('doit basculer sur defaultTau si la régression donne une pente non physique m >= 0', () => {
      const dataInverted = [
        [0.0, 1.0],
        [0.001, 0.5],
        [0.002, 0.2]
      ];
      const model = new Model([], [], 'exp2', mockData);
      const guess = model._estimateInitialGuess(dataInverted);

      const expectedTau = 0.002 / 3;
      assert.ok(guess);
      assert.ok(guess[1] > 0, `b doit rester strictement positif (reçu: ${guess[1]})`);
      assert.ok(Math.abs(guess[1] - expectedTau) < 1e-6, `b doit basculer sur defaultTau ~${expectedTau} s (reçu: ${guess[1]})`);
    });

    it('permet la convergence d\'Alglib sur une échelle rapide (tau = 0.5 ms) avec le guess adapté', async () => {
      const N = 25;
      const tau = 0.0005; // 0.5 ms
      const aReal = 5.0;
      const tMax = 0.0025; // 2.5 ms
      const data = [];
      for (let i = 0; i < N; i++) {
        const t = (i / (N - 1)) * tMax;
        data.push([t, aReal * (1 - Math.exp(-t / tau))]);
      }

      const model = new Model([], [], 'exp2', mockData);
      const guess = model._estimateInitialGuess(data);

      assert.ok(guess[1] < 0.01, `b estimé doit être dans l'ordre de grandeur des ms (reçu: ${guess[1]})`);

      const fExp2 = (an, x) => an[0] * (1 - Math.exp(-x / an[1]));
      const objective = (a) => {
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          sum += Math.pow(data[i][1] - fExp2(a, data[i][0]), 2);
        }
        return Math.sqrt(sum);
      };

      const solver = new Alglib();
      solver.add_function(objective);
      await solver.promise;
      solver.solve('min', guess);
      const res = solver.get_results();
      solver.remove();

      assert.ok(Math.abs(res[0] - aReal) < 0.05, `Amplitude a attendue ~5.0 (reçu: ${res[0]})`);
      assert.ok(Math.abs(res[1] - tau) < 1e-4, `Tau attendu ~0.0005 s (reçu: ${res[1]})`);
    });
  });

  describe('Modèle exp1 : gestion des grandeurs négatives (a < 0)', () => {
    it('doit estimer a < 0 et b > 0 pour des ordonnées négatives y(t) = -5*exp(-t/0.1)', () => {
      const N = 20;
      const data = [];
      for (let i = 0; i < N; i++) {
        const t = (i / (N - 1)) * 0.5;
        data.push([t, -5 * Math.exp(-t / 0.1)]);
      }

      const model = new Model([], [], 'exp1', mockData);
      const guess = model._estimateInitialGuess(data);

      assert.ok(guess);
      assert.equal(guess.length, 2);
      assert.ok(guess[0] < 0, `a doit être négatif (reçu: ${guess[0]})`);
      assert.ok(Math.abs(guess[0] - (-5.0)) < 0.1, `a doit être proche de -5.0 (reçu: ${guess[0]})`);
      assert.ok(guess[1] > 0, `b doit être positif (reçu: ${guess[1]})`);
      assert.ok(Math.abs(guess[1] - 0.1) < 0.02, `b doit être proche de tau = 0.1 s (reçu: ${guess[1]})`);
    });

    it('permet à Alglib de converger pour exp1 avec grandeurs négatives', async () => {
      const N = 20;
      const data = [];
      for (let i = 0; i < N; i++) {
        const t = (i / (N - 1)) * 0.5;
        data.push([t, -5 * Math.exp(-t / 0.1)]);
      }

      const model = new Model([], [], 'exp1', mockData);
      const guess = model._estimateInitialGuess(data);

      const fExp1 = (an, x) => an[0] * Math.exp(-x / an[1]);
      const objective = (a) => {
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          sum += Math.pow(data[i][1] - fExp1(a, data[i][0]), 2);
        }
        return Math.sqrt(sum);
      };

      const solver = new Alglib();
      solver.add_function(objective);
      await solver.promise;
      solver.solve('min', guess);
      const res = solver.get_results();
      solver.remove();

      assert.ok(Math.abs(res[0] - (-5.0)) < 0.05, `Amplitude a attendue ~-5.0 (reçu: ${res[0]})`);
      assert.ok(Math.abs(res[1] - 0.1) < 0.01, `Tau attendu ~0.1 s (reçu: ${res[1]})`);
    });

    it('doit utiliser defaultTau en cas d\'échec de régression sur exp1', () => {
      const minX = 0;
      const maxX = 0.003;
      const expectedTau = 0.001; // 0.003 / 3
      const data = [
        [minX, -2.0],
        [maxX, -2.0]
      ];

      const model = new Model([], [], 'exp1', mockData);
      const guess = model._estimateInitialGuess(data);

      assert.ok(guess);
      assert.ok(Math.abs(guess[1] - expectedTau) < 1e-6, `b doit valoir (maxX - minX)/3 ~${expectedTau} (reçu: ${guess[1]})`);
    });
  });

  describe('Modèle exp1 : décalage temporel et robustesse numérique', () => {
    it('ne doit pas produire d\'Infinity en présence d\'un grand décalage temporel x0 >> tau', () => {
      const N = 30;
      const t0 = 10;
      const tau = 0.001;
      const data = [];
      for (let i = 0; i < N; i++) {
        const t = t0 + (i / (N - 1)) * 0.005;
        data.push([t, 5 * Math.exp(-(t - t0) / tau)]);
      }

      const model = new Model([], [], 'exp1', mockData);
      const guess = model._estimateInitialGuess(data);

      assert.ok(guess);
      assert.equal(guess.length, 2);
      assert.ok(Number.isFinite(guess[0]), `a doit être fini (reçu: ${guess[0]})`);
      assert.ok(Number.isFinite(guess[1]), `b doit être fini (reçu: ${guess[1]})`);
      assert.ok(guess[1] > 0, `b doit être positif (reçu: ${guess[1]})`);
    });

    it('ne doit pas produire de NaN ni division par zéro si minY === maxY (données constantes)', () => {
      const data = [[0, 5], [1, 5], [2, 5], [3, 5]];
      
      const modelExp1 = new Model([], [], 'exp1', mockData);
      const guess1 = modelExp1._estimateInitialGuess(data);
      assert.ok(guess1);
      guess1.forEach(v => assert.ok(Number.isFinite(v), `Paramètre exp1 fini attendu (reçu: ${v})`));

      const modelExp2 = new Model([], [], 'exp2', mockData);
      const guess2 = modelExp2._estimateInitialGuess(data);
      assert.ok(guess2);
      guess2.forEach(v => assert.ok(Number.isFinite(v), `Paramètre exp2 fini attendu (reçu: ${v})`));
    });
  });
});
