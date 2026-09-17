import '../helpers/setup.mjs';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import Calculation from '../../grapher/modules/calculation.js';

describe('Calculation Module', () => {
  const calc = new Calculation({ derivatePoints: 5, derivateEdges: true });

  describe('evaluate() - Préservation et intégrité des formules', () => {
    const scope = { a: 2, t: 5, v0: 10, x: 9 };

    it('ne doit pas tronquer les formules avec espaces, parenthèses et opérations arithmétiques', () => {
      const result = calc.evaluate('a * (t - 2) + v0 / 2', scope);
      assert.equal(result, 11);
    });

    it('doit convertir correctement le caractère spécial ² en ^2', () => {
      const result = calc.evaluate('x² + 1', scope);
      assert.equal(result, 82);
    });

    it('doit normaliser la casse des fonctions mathématiques connues (ex: SQRT -> sqrt)', () => {
      const result = calc.evaluate('SQRT(x) + 1', scope);
      assert.equal(result, 4);
    });
  });

  describe('evaluateBlock() - Évaluation de blocs de formules', () => {
    const initialScope = {
      t: [0, 1, 2, 3, 4],
      x: [0, 2, 4, 6, 8],
      m: { value: 2, unit: 'kg' }
    };

    it('doit évaluer avec succès un bloc valide (dérivée numérique, puissance, constantes)', () => {
      const formulas = [
        { variableName: 'v', expression: 'diff(x, t)', unit: 'm/s' },
        { variableName: 'Ec', expression: '0.5 * m * v²', unit: 'J' },
        { variableName: 'racine', expression: 'SQRT(x)', unit: '' }
      ];

      const { results, errors } = calc.evaluateBlock(formulas, initialScope);
      assert.equal(errors.length, 0);
      assert.equal(results.length, 3);

      // Vérification des valeurs calculées
      assert.equal(results[0].variableName, 'v');
      assert.equal(results[0].data[1], 2); // dx/dt = 2

      assert.equal(results[1].variableName, 'Ec');
      assert.equal(results[1].data[1], 4); // 0.5 * 2 * 2^2 = 4
    });

    it('doit rejeter proprement les tentatives d\'utilisation d\'underscores ou d\'unités à droite du =', () => {
      const badFormulas = [
        { variableName: 'bad1', expression: 'a_m/s * t_s', unit: '' },
        { variableName: 'bad2', expression: 'v_0 + 1', unit: '' }
      ];

      const { results, errors } = calc.evaluateBlock(badFormulas, initialScope);
      assert.equal(errors.length, 2);
      assert.equal(results.length, 0);

      // Vérifie que les erreurs sont explicites et non silencieuses
      assert.match(errors[0].error, /n'est pas définie/);
      assert.match(errors[1].error, /n'est pas définie/);
    });
  });
});

