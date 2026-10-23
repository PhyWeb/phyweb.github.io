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

describe('Convergence Alglib et estimation de phase initiale (_estimateInitialGuess)', () => {
  const Alglib = createAlglib();
  const mockData = { parameters: {}, curves: [] };

  it('démontre le bug initial : avec c = 0, l\'ajustement d\'une oscillation amortie en opposition plante ou diverge dans Alglib', async () => {
    // Cas physique : oscillation amortie démarrant en opposition de phase
    // y = -5 * cos(20*t) * exp(-t/0.3) sur [0, 1]
    const N = 80;
    const data = [];
    for (let i = 0; i < N; i++) {
      const t = (i / (N - 1)) * 1.0;
      data.push([t, -5 * Math.cos(20 * t) * Math.exp(-t / 0.3)]);
    }

    const fCase = (an, x) => an[0] * Math.cos(an[1] * x + an[2]) * Math.exp(-x / an[3]) + an[4];
    const objective = (a) => {
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        sum += Math.pow(data[i][1] - fCase(a, data[i][0]), 2);
      }
      return Math.sqrt(sum);
    };

    // Estimation buggée avec c = 0
    const guessBuggy = [5.0, 20.0, 0, 1.0, 0];

    const solver = new Alglib();
    solver.add_function(objective);
    await solver.promise;

    let crashedOrDiverged = false;
    try {
      solver.solve('min', guessBuggy);
      const res = solver.get_results();
      // Si par hasard ça ne crash pas, vérifions si l'amplitude est quasi-nulle ou absurde
      const rmse = objective(res) / Math.sqrt(N);
      if (Math.abs(res[0]) < 0.5 || rmse > 1.0) {
        crashedOrDiverged = true;
      }
    } catch {
      crashedOrDiverged = true;
    } finally {
      solver.remove();
    }

    assert.ok(crashedOrDiverged, 'Le solveur avec c=0 doit échouer (crash WASM ou divergence) sur ce cas en opposition');
  });

  it('avec la nouvelle estimation de Model._estimateInitialGuess(), Alglib converge parfaitement sur l\'opposition de phase', async () => {
    const N = 80;
    const data = [];
    for (let i = 0; i < N; i++) {
      const t = (i / (N - 1)) * 1.0;
      data.push([t, -5 * Math.cos(20 * t) * Math.exp(-t / 0.3)]);
    }

    const model = new Model([], [], 'dampedcos', mockData);
    const guess = model._estimateInitialGuess(data);

    // Vérification que le guess estime bien la phase opposée
    const phaseError = Math.min(Math.abs(guess[2] - Math.PI), Math.abs(guess[2] + Math.PI));
    assert.ok(phaseError < 0.2, `La phase initiale estimée c doit être proche de ±pi (reçu: ${guess[2]})`);

    const fCase = (an, x) => an[0] * Math.cos(an[1] * x + an[2]) * Math.exp(-x / an[3]) + an[4];
    const objective = (a) => {
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        sum += Math.pow(data[i][1] - fCase(a, data[i][0]), 2);
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
    assert.ok(Math.abs(res[0] - 5.0) < 0.1, `Amplitude positive a attendue ~5.0 (reçu: ${res[0]})`);
    assert.ok(Math.abs(res[1] - 20.0) < 0.2, `Pulsation b attendue ~20.0 (reçu: ${res[1]})`);
    assert.ok(Math.abs(res[3] - 0.3) < 0.05, `Temps d'amortissement attendu ~0.3 (reçu: ${res[3]})`);
  });

  it('converge correctement pour sinus en opposition y = -3*sin(6*t) amorti', async () => {
    const N = 60;
    const data = [];
    for (let i = 0; i < N; i++) {
      const t = (i / (N - 1)) * 3.0;
      data.push([t, -3 * Math.sin(6 * t) * Math.exp(-t)]);
    }

    const model = new Model([], [], 'dampedsin', mockData);
    const guess = model._estimateInitialGuess(data);

    const fCase = (an, x) => an[0] * Math.sin(an[1] * x + an[2]) * Math.exp(-x / an[3]) + an[4];
    const objective = (a) => {
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        sum += Math.pow(data[i][1] - fCase(a, data[i][0]), 2);
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
    assert.ok(Math.abs(res[0] - 3.0) < 0.1, `Amplitude positive attendue ~3.0 (reçu: ${res[0]})`);
    assert.ok(Math.abs(res[1] - 6.0) < 0.2, `Pulsation attendue ~6.0 (reçu: ${res[1]})`);
  });
});

