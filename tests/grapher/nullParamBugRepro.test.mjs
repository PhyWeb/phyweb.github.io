import '../helpers/setup.mjs';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import Calculation from '../../grapher/modules/calculation.js';

describe('Vérification et non-régression du bug 3 : Calculs avec paramètres et valeurs nulles', () => {
  const calc = new Calculation({ derivatePoints: 5, derivateEdges: false });

  it('rejette à la source un paramètre non défini dans les réels (sqrt(-1)) et bloque les formules dépendantes', () => {
    const scope = {
      x: [1, 2, 3]
    };

    const formulas = [
      { variableName: 'p', expression: 'sqrt(-1)', unit: '' },
      { variableName: 'y', expression: 'x + p', unit: '' }
    ];

    const { results, errors } = calc.evaluateBlock(formulas, scope);

    // Les deux formules doivent échouer
    assert.equal(results.length, 0);
    assert.equal(errors.length, 2);

    const errorByName = Object.fromEntries(errors.map(e => [e.variableName, e.error]));

    // p est rejeté à la source avec un message explicite
    assert.match(errorByName.p, /pas défini dans les réels/);

    // y est bloqué car p n'a pas pu être créé
    assert.match(errorByName.y, /variable "p" n'est pas définie/);
  });

  it('rejette à la source un paramètre produisant une valeur non finie (1 / 0)', () => {
    const { results, errors } = calc.evaluateBlock([{ variableName: 'inf', expression: '1 / 0', unit: '' }], {});
    assert.equal(results.length, 0);
    assert.equal(errors.length, 1);
    assert.equal(errors[0].variableName, 'inf');
    assert.match(errors[0].error, /pas défini dans les réels|valeur non finie/);
  });

  it('rejette l\'utilisation d\'un paramètre null existant dans le scope initial', () => {
    const scope = {
      x: [1, 2, 3],
      p: { value: null, unit: '' }
    };

    const formulas = [
      { variableName: 'y', expression: 'x + p', unit: '' }
    ];

    const { results, errors } = calc.evaluateBlock(formulas, scope);
    assert.equal(results.length, 0);
    assert.equal(errors.length, 1);
    assert.equal(errors[0].variableName, 'y');
    assert.match(errors[0].error, /n'a pas de valeur valide/);
  });

  it('propage proprement null dans configureOperator et pow si une valeur null est passée directement', () => {
    // Test direct des fonctions mathématiques configurées (défense en profondeur)
    const m = calc.mathInstance;

    // Array et null
    assert.deepEqual(m.add([1, 2], null), [null, null]);
    assert.deepEqual(m.subtract([1, 2], null), [null, null]);
    assert.deepEqual(m.multiply([1, 2], null), [null, null]);
    assert.deepEqual(m.divide([1, 2], null), [null, null]);
    assert.deepEqual(m.pow([1, 2], null), [null, null]);

    // null et Array
    assert.deepEqual(m.add(null, [1, 2]), [null, null]);
    assert.deepEqual(m.subtract(null, [1, 2]), [null, null]);
    assert.deepEqual(m.multiply(null, [1, 2]), [null, null]);
    assert.deepEqual(m.divide(null, [1, 2]), [null, null]);
    assert.deepEqual(m.pow(null, [1, 2]), [null, null]);

    // Scalaires null
    assert.equal(m.add(null, 5), null);
    assert.equal(m.add(5, null), null);
    assert.equal(m.multiply(null, 5), null);
    assert.equal(m.pow(null, 2), null);
    assert.equal(m.pow(2, null), null);
  });
});
