import '../helpers/setup.mjs';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import Calculation from '../../grapher/modules/calculation.js';

describe('Bug résolu : opérations entre colonnes de longueurs différentes via evaluateBlock', () => {
  const calc = new Calculation({ derivatePoints: 3, derivateEdges: true });

  it('gère les opérations arithmétiques, diff et integrate avec des colonnes de longueurs inégales', () => {
    const scope = {
      x: [1, 2, 3, 4, 5],
      y: [10, 20, 30]
    };

    const formulas = [
      { variableName: 's', expression: 'x + y', unit: '' },
      { variableName: 'p', expression: 'x * y', unit: '' },
      { variableName: 'd', expression: 'diff(y, x)', unit: '' },
      { variableName: 'i', expression: 'integrate(y, x)', unit: '' }
    ];

    const { results, errors } = calc.evaluateBlock(formulas, scope);
    assert.equal(errors.length, 0, `Erreurs inattendues: ${JSON.stringify(errors)}`);
    assert.equal(results.length, 4);

    const byName = Object.fromEntries(results.map(r => [r.variableName, r.data]));
    assert.deepEqual(byName.s, [11, 22, 33, null, null]);
    assert.deepEqual(byName.p, [10, 40, 90, null, null]);
    assert.equal(byName.d.length, 5);
    assert.equal(byName.d[3], null);
    assert.equal(byName.d[4], null);
    assert.equal(byName.i.length, 5);
    assert.equal(byName.i[3], null);
    assert.equal(byName.i[4], null);
  });
});
