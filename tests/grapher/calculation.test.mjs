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

  describe('diff() & numericalDerivative() - Robustesse, pas variable et constantes', () => {
    it('doit calculer correctement la dérivée sur une série à pas variable (fonction affine)', () => {
      // x = 2*t sur un échantillonnage irrégulier (dt = 1, 1, 3, 1)
      const t = [0, 1, 2, 5, 6];
      const x = [0, 2, 4, 10, 12];
      const result = calc.evaluate('diff(x, t)', { x, t });

      // La dérivée de 2*t est 2 partout, y compris au point i = 2 où l'ancien stencil 5 points échouait
      assert.equal(result.length, 5);
      for (let i = 0; i < result.length; i++) {
        assert.equal(result[i], 2, `La dérivée au point ${i} devrait être 2`);
      }
    });

    it('doit calculer exactement la dérivée d\'un polynôme de degré 2 sur une grille non-uniforme', () => {
      // x = t^2 -> dx/dt = 2*t
      const t = [0, 1, 3, 6, 10];
      const x = [0, 1, 9, 36, 100];
      const result = calc.evaluate('diff(x, t)', { x, t });

      // Les points intérieurs doivent être exacts grâce au schéma d'ordre 2 pour pas variable
      assert.equal(result[1], 2);  // 2 * 1
      assert.equal(result[2], 6);  // 2 * 3
      assert.equal(result[3], 12); // 2 * 6
    });

    it('doit lever une erreur explicite lors d\'une dérivation par rapport à une constante (Array, number)', () => {
      assert.throws(
        () => calc.evaluate('diff(x, 2)', { x: [1, 2, 3] }),
        /Impossible de dériver par rapport à une constante\./
      );
    });

    it('doit lever une erreur explicite lors d\'une dérivation par rapport à une constante (number, number)', () => {
      assert.throws(
        () => calc.evaluate('diff(5, 2)', {}),
        /Impossible de dériver par rapport à une constante\./
      );
    });

    it('doit intégrer l\'erreur de dérivation par constante dans evaluateBlock sans planter', () => {
      const formulas = [
        { variableName: 'v_bad', expression: 'diff(x, 2)', unit: 'm/s' }
      ];
      const scope = { x: [1, 2, 3] };
      const { results, errors } = calc.evaluateBlock(formulas, scope);

      assert.equal(results.length, 0);
      assert.equal(errors.length, 1);
      assert.match(errors[0].error, /Impossible de dériver par rapport à une constante\./);
    });

    it('doit renvoyer null si le point courant est null, sans corrompre les points voisins', () => {
      const t = [0, 1, 2, 3, 4, 5];
      const y = [0, null, 4, 6, 8, 10]; // affine avec y[1] = null
      const result = calc.evaluate('diff(y, t)', { y, t });

      // Le point i=1 doit être null
      assert.equal(result[1], null);
      // Le point i=3 doit être calculé correctement (2) et ne pas être bloqué par le null en i=1
      assert.equal(result[3], 2);
    });

    it('doit respecter derivateEdges: false sur les bords', () => {
      const calcNoEdges = new Calculation({ derivatePoints: 5, derivateEdges: false });
      const t = [0, 1, 2, 3, 4];
      const x = [0, 2, 4, 6, 8];
      const result = calcNoEdges.evaluate('diff(x, t)', { x, t });

      // Avec 5 points et offset = 2, les indices 0, 1 et 3, 4 sont des bords
      assert.equal(result[0], null);
      assert.equal(result[1], null);
      assert.equal(result[2], 2);
      assert.equal(result[3], null);
      assert.equal(result[4], null);
    });

    it('doit utiliser le stencil uniforme à 7 points avec haute précision', () => {
      const calc7 = new Calculation({ derivatePoints: 7, derivateEdges: true });
      const t = [0, 1, 2, 3, 4, 5, 6];
      const x = [0, 3, 6, 9, 12, 15, 18];
      const result = calc7.evaluate('diff(x, t)', { x, t });

      assert.equal(result[3], 3);
    });
  });
});


