import '../helpers/setup.mjs';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import Calculation from '../../grapher/modules/calculation.js';

describe('Vérification et non-régression du bug 4 : Complexes, Infinity, NaN dans les courbes', () => {
  const calc = new Calculation({ derivatePoints: 5, derivateEdges: false });

  it('convertit en null les valeurs complexes de asin, acos, acosh, atanh hors de leur domaine réel', () => {
    const scope = {
      x: [0.5, 1.5], // asin(1.5) donnerait un nombre complexe
      y: [0.5, 2],   // acos(2) donnerait un nombre complexe
      z: [0.5, 2],   // acosh(0.5) donnerait un nombre complexe
      w: [0.5, 2]    // atanh(2) donnerait un nombre complexe
    };

    const formulas = [
      { variableName: 'res_asin', expression: 'asin(x)', unit: '' },
      { variableName: 'res_acos', expression: 'acos(y)', unit: '' },
      { variableName: 'res_acosh', expression: 'acosh(z)', unit: '' },
      { variableName: 'res_atanh', expression: 'atanh(w)', unit: '' },
      { variableName: 'chained', expression: 'res_asin + 1', unit: '' }
    ];

    const { results, errors } = calc.evaluateBlock(formulas, scope);

    assert.equal(errors.length, 0, `Erreurs inattendues: ${JSON.stringify(errors)}`);

    const byName = Object.fromEntries(results.map(r => [r.variableName, r.data]));

    // asin(1.5) vaut null, asin(0.5) est calculé
    assert.equal(typeof byName.res_asin[0], 'number');
    assert.equal(byName.res_asin[1], null);

    // acos(2) vaut null
    assert.equal(typeof byName.res_acos[0], 'number');
    assert.equal(byName.res_acos[1], null);

    // acosh(0.5) vaut null
    assert.equal(byName.res_acosh[0], null);
    assert.equal(typeof byName.res_acosh[1], 'number');

    // atanh(2) vaut null
    assert.equal(typeof byName.res_atanh[0], 'number');
    assert.equal(byName.res_atanh[1], null);

    // chained = res_asin + 1 propage null sans concaténation de string "[object Object]1"
    assert.equal(typeof byName.chained[0], 'number');
    assert.equal(byName.chained[0], byName.res_asin[0] + 1);
    assert.equal(byName.chained[1], null);
  });

  it('convertit en null les divisions par zéro au lieu de laisser passer Infinity ou NaN', () => {
    const scope = {
      x: [1, 2, 0],
      t: [0, 2, 0]
    };

    const formulas = [
      { variableName: 'v', expression: 'x / t', unit: '' },
      { variableName: 'v_next', expression: 'v * 2', unit: '' }
    ];

    const { results, errors } = calc.evaluateBlock(formulas, scope);

    assert.equal(errors.length, 0);

    const byName = Object.fromEntries(results.map(r => [r.variableName, r.data]));

    // 1 / 0 -> null, 2 / 2 -> 1, 0 / 0 -> null
    assert.deepEqual(byName.v, [null, 1, null]);

    // Opération suivante : [null, 1, null] * 2 -> [null, 2, null]
    assert.deepEqual(byName.v_next, [null, 2, null]);
  });

  it('gère proprement les puissances négatives fractionnaires (base négative, exposant non-entier)', () => {
    const scope = {
      x: [-4, 4]
    };

    const formulas = [
      { variableName: 'root', expression: 'x ^ 0.5', unit: '' }
    ];

    const { results, errors } = calc.evaluateBlock(formulas, scope);

    assert.equal(errors.length, 0);
    const byName = Object.fromEntries(results.map(r => [r.variableName, r.data]));

    // (-4)^0.5 -> null, 4^0.5 -> 2
    assert.deepEqual(byName.root, [null, 2]);
  });
});
