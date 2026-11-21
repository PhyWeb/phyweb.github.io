import '../helpers/setup.mjs';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import Calculation from '../../grapher/modules/calculation.js';

describe('Bug 1 résolu : unaryMinus (-) et unaryPlus (+) sur les tableaux contenant null', () => {
  it('évalue avec succès -v, +v et -(m * g * z) même lorsque les tableaux contiennent des null', () => {
    // derivateEdges vaut false par défaut dans settingsManager.js
    const calc = new Calculation({ derivatePoints: 5, derivateEdges: false });

    const scope = {
      t: [0, 1, 2, 3, 4, 5],
      x: [0, 1, 4, 9, 16, 25],
      m: { value: 2, unit: 'kg' },
      g: { value: 9.81, unit: 'm/s^2' },
      z: [null, 1, 2, 3, 4, null]
    };

    const formulas = [
      { variableName: 'v', expression: 'diff(x, t)', unit: 'm/s' },
      { variableName: 'u', expression: '-v', unit: 'm/s' },
      { variableName: 'p', expression: '+v', unit: 'm/s' },
      { variableName: 'Ep', expression: '-(m * g * z)', unit: 'J' }
    ];

    const { results, errors } = calc.evaluateBlock(formulas, scope);

    // Aucune erreur ne doit être levée
    assert.equal(errors.length, 0, `Erreurs inattendues: ${JSON.stringify(errors)}`);

    const byName = Object.fromEntries(results.map(r => [r.variableName, r.data]));

    // v est calculé avec null aux extrémités
    assert.deepEqual(byName.v, [null, null, 4, 6, null, null]);

    // u = -v conserve les null et inverse le signe des valeurs numériques
    assert.deepEqual(byName.u, [null, null, -4, -6, null, null]);

    // p = +v conserve les null et les valeurs numériques
    assert.deepEqual(byName.p, [null, null, 4, 6, null, null]);

    // Ep = -(2 * 9.81 * z) conserve les null aux indices 0 et 5
    assert.equal(byName.Ep[0], null);
    assert.equal(byName.Ep[1], -(2 * 9.81 * 1));
    assert.equal(byName.Ep[2], -(2 * 9.81 * 2));
    assert.equal(byName.Ep[3], -(2 * 9.81 * 3));
    assert.equal(byName.Ep[4], -(2 * 9.81 * 4));
    assert.equal(byName.Ep[5], null);
  });
});
