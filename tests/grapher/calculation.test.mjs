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

    it('doit convertir les virgules décimales en points (ex: 1,5 * a)', () => {
      const result = calc.evaluate('1,5 * a', scope);
      assert.equal(result, 3);
    });

    it('doit supporter les fonctions mathématiques en majuscules avec espaces avant parenthèse', () => {
      const result = calc.evaluate('COS  (0) + SIN(0)', scope);
      assert.equal(result, 1);
    });

    it('doit supporter les fonctions imbriquées en majuscules', () => {
      const result = calc.evaluate('SQRT(SQRT(x - 5) + 2)', scope);
      assert.equal(result, 2);
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

      assert.equal(results[2].variableName, 'racine');
      assert.equal(results[2].data[2], 2); // sqrt(4) = 2
    });

    it('doit normaliser diverses fonctions en majuscules et gérer les espaces avant parenthèses', () => {
      const formulas = [
        { variableName: 's', expression: 'SIN(t)', unit: '' },
        { variableName: 'c', expression: 'COS (t)', unit: '' },
        { variableName: 'e', expression: 'EXP(t)', unit: '' },
        { variableName: 'l', expression: 'LN(x + 1)', unit: '' },
        { variableName: 'd', expression: 'DIFF(x, t)', unit: 'm/s' },
        { variableName: 'paramVirgule', expression: '1,5 * m', unit: 'kg' }
      ];

      const { results, errors } = calc.evaluateBlock(formulas, initialScope);
      assert.equal(errors.length, 0);
      assert.equal(results.length, 6);

      const byName = Object.fromEntries(results.map(r => [r.variableName, r]));
      assert.equal(byName.s.data[0], 0); // sin(0) = 0
      assert.equal(byName.c.data[0], 1); // cos(0) = 1
      assert.equal(byName.e.data[0], 1); // exp(0) = 1
      assert.equal(byName.l.data[0], 0); // ln(0 + 1) = 0
      assert.equal(byName.d.data[1], 2); // diff(x, t) = 2
      assert.equal(byName.paramVirgule.data.value, 3); // 1.5 * 2 = 3
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

    it('doit rejeter une fonction ou variable inconnue non définie', () => {
      const formulas = [
        { variableName: 'badFn', expression: 'FONCTION_INCONNUE(x)', unit: '' },
        { variableName: 'badVar', expression: 'variableInconnue + 1', unit: '' }
      ];

      const { results, errors } = calc.evaluateBlock(formulas, initialScope);
      assert.equal(errors.length, 2);
      assert.equal(results.length, 0);
      assert.match(errors[0].error, /La variable "FONCTION_INCONNUE" n'est pas définie/);
      assert.match(errors[1].error, /La variable "variableInconnue" n'est pas définie/);
    });
  });
});

