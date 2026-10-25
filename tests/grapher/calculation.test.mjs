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

    it('doit évaluer un paramètre scalaire correctement (ex: m = 42)', () => {
      const { results, errors } = calc.evaluateBlock([{ variableName: 'p', expression: '42', unit: 'm' }], {});
      assert.equal(errors.length, 0);
      assert.equal(results.length, 1);
      assert.equal(results[0].type, 'parameter');
      assert.equal(results[0].data.value, 42);
    });

    it('doit évaluer une courbe valide depuis un tableau ou une matrice', () => {
      const { results, errors } = calc.evaluateBlock([{ variableName: 'c', expression: '[1, 2, 3]', unit: 's' }], {});
      assert.equal(errors.length, 0);
      assert.equal(results[0].type, 'curve');
      assert.deepEqual(results[0].data, [1, 2, 3]);
    });

    it('doit rejeter les chaînes de caractères et les considérer comme erreurs d\'évaluation (ex: c = "hello")', () => {
      const { results, errors } = calc.evaluateBlock([{ variableName: 's', expression: '"hello"', unit: '' }], {});
      assert.equal(results.length, 0);
      assert.equal(errors.length, 1);
      assert.equal(errors[0].variableName, 's');
      assert.match(errors[0].error, /mathématique valide/);
    });

    it('doit gérer proprement une formule renvoyant un paramètre null (ex: racine carrée d\'un nombre négatif)', () => {
      const { results, errors } = calc.evaluateBlock([{ variableName: 'n', expression: 'sqrt(-1)', unit: '' }], {});
      assert.equal(errors.length, 0);
      assert.equal(results[0].type, 'parameter');
      assert.equal(results[0].data.value, null);
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

    it('ne doit pas masquer les indices 1 et n - 2 sur données à pas variable quand derivateEdges: false (stencil 5 points)', () => {
      const calcNoEdges = new Calculation({ derivatePoints: 5, derivateEdges: false });
      // Pas variable non-uniforme (dt = 1, 2, 3, 4, 5), x = 2 * t (dx/dt = 2)
      const t = [0, 1, 3, 6, 10, 15];
      const x = [0, 2, 6, 12, 20, 30];
      const result = calcNoEdges.evaluate('diff(x, t)', { x, t });

      // Sur pas variable, le stencil 5 points n'est pas applicable et l'algorithme bascule sur Lagrange 3 points.
      // Seuls les bords stricts (i = 0 et i = 5) ne peuvent pas utiliser le stencil 3 points.
      // Les indices 1 et 4 (n - 2) ne doivent PAS être null car ils disposent de leurs voisins pour Lagrange 3 points.
      assert.equal(result[0], null, 'Index 0 doit être null');
      assert.equal(result[1], 2, 'Index 1 ne doit pas être null (Lagrange 3 points applicable)');
      assert.equal(result[2], 2, 'Index 2 calculé');
      assert.equal(result[3], 2, 'Index 3 calculé');
      assert.equal(result[4], 2, 'Index 4 (n-2) ne doit pas être null (Lagrange 3 points applicable)');
      assert.equal(result[5], null, 'Index 5 doit être null');
    });

    it('ne doit pas masquer les indices 1, 2 et n - 3, n - 2 sur données à pas variable quand derivateEdges: false (stencil 7 points)', () => {
      const calcNoEdges7 = new Calculation({ derivatePoints: 7, derivateEdges: false });
      // Pas variable non-uniforme (dt = 1, 2, 3, 4, 5, 6, 7), x = 2 * t (dx/dt = 2)
      const t = [0, 1, 3, 6, 10, 15, 21, 28];
      const x = [0, 2, 6, 12, 20, 30, 42, 56];
      const result = calcNoEdges7.evaluate('diff(x, t)', { x, t });

      // Sur pas variable, le stencil 7 points (et 5 points) n'est pas applicable.
      // Seuls les bords stricts (i = 0 et i = 7) ne peuvent pas utiliser le stencil 3 points.
      assert.equal(result[0], null, 'Index 0 doit être null');
      assert.equal(result[1], 2, 'Index 1 ne doit pas être null');
      assert.equal(result[2], 2, 'Index 2 ne doit pas être null');
      assert.equal(result[3], 2, 'Index 3 calculé');
      assert.equal(result[4], 2, 'Index 4 calculé');
      assert.equal(result[5], 2, 'Index 5 ne doit pas être null');
      assert.equal(result[6], 2, 'Index 6 (n-2) ne doit pas être null');
      assert.equal(result[7], null, 'Index 7 doit être null');
    });

    it('doit utiliser le stencil uniforme à 7 points avec haute précision', () => {
      const calc7 = new Calculation({ derivatePoints: 7, derivateEdges: true });
      const t = [0, 1, 2, 3, 4, 5, 6];
      const x = [0, 3, 6, 9, 12, 15, 18];
      const result = calc7.evaluate('diff(x, t)', { x, t });

      assert.equal(result[3], 3);
    });

    it('doit lever une erreur si la variable de dérivation contient deux valeurs identiques consécutives', () => {
      const t = [0, 1, 1, 2, 3];
      const y = [0, 2, 4, 6, 8];
      assert.throws(
        () => calc.evaluate('diff(y, t)', { y, t }),
        /la grandeur de dérivation contient deux valeurs identiques consécutives\./
      );
    });

    it('doit lever une erreur si la variable de dérivation n\'est pas triée (non monotone)', () => {
      const t = [0, 1, 3, 2, 4];
      const y = [0, 2, 4, 6, 8];
      assert.throws(
        () => calc.evaluate('diff(y, t)', { y, t }),
        /la grandeur de dérivation n'est pas triée\. Veuillez trier vos données dans le tableur\./
      );
    });

    it('doit fonctionner correctement si la variable de dérivation est strictement décroissante', () => {
      const t = [4, 3, 2, 1, 0];
      const y = [8, 6, 4, 2, 0];
      const result = calc.evaluate('diff(y, t)', { y, t });
      assert.equal(result.length, 5);
      for (let i = 0; i < result.length; i++) {
        assert.equal(result[i], 2);
      }
    });

    it('doit ignorer les valeurs nulles ou non finies lors de la vérification de monotonie', () => {
      const t = [0, null, 2, 3, 4];
      const y = [0, null, 4, 6, 8];
      const result = calc.evaluate('diff(y, t)', { y, t });
      assert.equal(result.length, 5);
      assert.equal(result[1], null);
      assert.equal(result[3], 2);
    });
  });

  describe('integrate() & numericalIntegration() - Primitive par trapèzes cumulés', () => {
    it('doit inclure integrate dans getAvailableFunctions()', () => {
      const fns = calc.getAvailableFunctions();
      assert.ok(fns.includes('integrate'));
    });

    it('doit calculer la primitive exacte d\'une fonction affine y = 2*t', () => {
      const t = [0, 1, 2, 3, 4];
      const v = [0, 2, 4, 6, 8];
      const result = calc.evaluate('integrate(v, t)', { v, t });

      assert.equal(result.length, 5);
      assert.deepEqual(result, [0, 1, 4, 9, 16]);
    });

    it('doit prendre en compte la valeur initiale y0 (3ème argument)', () => {
      const t = [0, 1, 2, 3, 4];
      const v = [0, 2, 4, 6, 8];
      const result = calc.evaluate('integrate(v, t, 10)', { v, t });

      assert.equal(result.length, 5);
      assert.deepEqual(result, [10, 11, 14, 19, 26]);
    });

    it('doit intégrer une constante par rapport à un tableau (number, Array)', () => {
      const t = [0, 1, 2, 3];
      const result = calc.evaluate('integrate(3, t)', { t });

      assert.deepEqual(result, [0, 3, 6, 9]);

      const resultWithY0 = calc.evaluate('integrate(3, t, 5)', { t });
      assert.deepEqual(resultWithY0, [5, 8, 11, 14]);
    });

    it('doit lever une erreur si nMin < 2', () => {
      assert.throws(
        () => calc.evaluate('integrate(v, t)', { v: [1], t: [0] }),
        /Pas assez de points pour calculer une primitive\. Il en faut au moins 2\./
      );
    });

    it('doit lever une erreur si la variable d\'intégration n\'est pas monotone', () => {
      const t = [0, 2, 1, 3];
      const v = [0, 2, 4, 6];
      assert.throws(
        () => calc.evaluate('integrate(v, t)', { v, t }),
        /la grandeur d'intégration n'est pas triée\. Veuillez trier vos données dans le tableur\./
      );
    });

    it('doit lever une erreur si la variable d\'intégration contient deux valeurs identiques consécutives', () => {
      const t = [0, 1, 1, 2];
      const v = [0, 2, 4, 6];
      assert.throws(
        () => calc.evaluate('integrate(v, t)', { v, t }),
        /la grandeur d'intégration contient deux valeurs identiques consécutives\./
      );
    });

    it('doit lever une erreur lors d\'une intégration par rapport à une constante', () => {
      assert.throws(
        () => calc.evaluate('integrate(v, 2)', { v: [1, 2, 3] }),
        /Impossible d'intégrer par rapport à une constante\./
      );
      assert.throws(
        () => calc.evaluate('integrate(5, 2)', {}),
        /Impossible d'intégrer par rapport à une constante\./
      );
    });

    it('doit fonctionner sur une variable strictement décroissante', () => {
      const t = [3, 2, 1, 0];
      const v = [2, 2, 2, 2];
      const result = calc.evaluate('integrate(v, t)', { v, t });
      assert.deepEqual(result, [0, -2, -4, -6]);
    });

    it('doit gérer les valeurs null sans corrompre les points valides', () => {
      const t = [0, null, 2, 3];
      const v = [0, null, 4, 6];
      const result = calc.evaluate('integrate(v, t)', { v, t });
      assert.equal(result.length, 4);
      assert.equal(result[0], 0);
      assert.equal(result[1], null);
      assert.equal(result[2], 4);
      assert.equal(result[3], 9);
    });

    it('doit fonctionner dans evaluateBlock avec notation décimale française et normalisation de casse', () => {
      const initialScope = {
        t: [0, 1, 2, 3, 4],
        v: [0, 2, 4, 6, 8]
      };
      const formulas = [
        { variableName: 'x1', expression: 'INTEGRATE(v, t)', unit: 'm' },
        { variableName: 'x2', expression: 'integrate(v, t, 1,5)', unit: 'm' }
      ];
      const { results, errors } = calc.evaluateBlock(formulas, initialScope);
      assert.equal(errors.length, 0);
      assert.equal(results.length, 2);
      assert.deepEqual(results[0].data, [0, 1, 4, 9, 16]);
      assert.deepEqual(results[1].data, [1.5, 2.5, 5.5, 10.5, 17.5]);
    });
  });

  describe('Opérations mathématiques (puissances, racines, null-safety)', () => {
    it('doit renvoyer null pour les élévations aux puissances fractionnaires sur des valeurs négatives (Array ^ scalaire)', () => {
      // Vérifie que x^0.5 ou x^0.2 retourne null pour x < 0 et non un objet complexe
      const initialScope = {
        x: [-4, -1, 0, 1, 4]
      };
      
      const formulas = [
        { variableName: 'y', expression: 'x^0.5', unit: '' },
        { variableName: 'z', expression: 'x^0.2', unit: '' }
      ];

      const { results, errors } = calc.evaluateBlock(formulas, initialScope);
      assert.equal(errors.length, 0);
      assert.equal(results.length, 2);

      const byName = Object.fromEntries(results.map(r => [r.variableName, r.data]));
      
      // y = [-4^0.5, -1^0.5, 0^0.5, 1^0.5, 4^0.5] -> [null, null, 0, 1, 2]
      assert.deepEqual(byName.y, [null, null, 0, 1, 2]);
      
      // z = [-4^0.2, -1^0.2, 0^0.2, 1^0.2, 4^0.2]
      assert.equal(byName.z[0], null);
      assert.equal(byName.z[1], null);
      assert.equal(byName.z[2], 0);
      assert.equal(byName.z[3], 1);
    });
  });

  describe('Prétraitement des virgules (preprocessDecimalCommas & preprocessExpression)', () => {
    it('doit supporter pow(2,3) sans espace et évaluer correctement', () => {
      const clean = calc.preprocessExpression('pow(2,3)');
      assert.equal(clean, 'pow(2, 3)');
      assert.equal(calc.evaluate('pow(2,3)', {}), 8);
    });

    it('doit supporter pow(x1,2) sans espace quand la variable se termine par un chiffre', () => {
      const scope = { x1: 4 };
      const clean = calc.preprocessExpression('pow(x1,2)');
      assert.equal(clean, 'pow(x1, 2)');
      assert.equal(calc.evaluate('pow(x1,2)', scope), 16);
    });

    it('doit évaluer correctement min(2,3) et max(1,2) sans espace', () => {
      assert.equal(calc.preprocessExpression('min(2,3)'), 'min(2, 3)');
      assert.equal(calc.evaluate('min(2,3)', {}), 2);

      assert.equal(calc.preprocessExpression('max(1,2)'), 'max(1, 2)');
      assert.equal(calc.evaluate('max(1,2)', {}), 2);
    });

    it('doit évaluer correctement atan2(1,2) et hypot(3,4) sans espace', () => {
      assert.equal(calc.preprocessExpression('atan2(1,2)'), 'atan2(1, 2)');
      assert.equal(calc.evaluate('atan2(1,2)', {}), Math.atan2(1, 2));

      assert.equal(calc.preprocessExpression('hypot(3,4)'), 'hypot(3, 4)');
      assert.equal(calc.evaluate('hypot(3,4)', {}), 5);
    });

    it('doit supporter les tableaux de nombres [1,2,3] sans espace', () => {
      assert.equal(calc.preprocessExpression('[1,2,3]'), '[1, 2, 3]');
      assert.deepEqual(calc.evaluate('[1,2,3]', {}).toArray(), [1, 2, 3]);
    });

    it('doit convertir les nombres décimaux usuels en notation française (0,5 * m, 1,5 + 2,3)', () => {
      assert.equal(calc.preprocessExpression('0,5 * m'), '0.5 * m');
      assert.equal(calc.evaluate('0,5 * m', { m: 2 }), 1);

      assert.equal(calc.preprocessExpression('1,5 + 2,3'), '1.5 + 2.3');
      assert.equal(calc.evaluate('1,5 + 2,3', {}), 3.8);
    });

    it('doit convertir les décimaux dans les fonctions à un seul argument (sin(0,5 * t), sqrt(2,5), round(2,5))', () => {
      assert.equal(calc.preprocessExpression('sin(0,5 * t)'), 'sin(0.5 * t)');
      assert.equal(calc.preprocessExpression('sqrt(2,5)'), 'sqrt(2.5)');
      assert.equal(calc.evaluate('sqrt(2,5)', {}), Math.sqrt(2.5));
      assert.equal(calc.preprocessExpression('round(2,5)'), 'round(2.5)');
      assert.equal(calc.evaluate('round(2,5)', {}), 3);
    });

    it('doit supporter le point-virgule comme séparateur d\'arguments français (pow(2; 3), pow(0,5; 2))', () => {
      assert.equal(calc.preprocessExpression('pow(2; 3)'), 'pow(2, 3)');
      assert.equal(calc.evaluate('pow(2; 3)', {}), 8);

      assert.equal(calc.preprocessExpression('pow(0,5; 2)'), 'pow(0.5, 2)');
      assert.equal(calc.evaluate('pow(0,5; 2)', {}), 0.25);
    });

    it('doit supporter nthRoot(8,3) et mod(10,3) sans espace', () => {
      assert.equal(calc.preprocessExpression('nthRoot(8,3)'), 'nthRoot(8, 3)');
      assert.equal(calc.evaluate('nthRoot(8,3)', {}), 2);

      assert.equal(calc.preprocessExpression('mod(10,3)'), 'mod(10, 3)');
      assert.equal(calc.evaluate('mod(10,3)', {}), 1);
    });

    it('doit supporter pow(0,5, 2) avec premier argument décimal', () => {
      assert.equal(calc.preprocessExpression('pow(0,5, 2)'), 'pow(0.5, 2)');
      assert.equal(calc.evaluate('pow(0,5, 2)', {}), 0.25);
    });
  });
});
