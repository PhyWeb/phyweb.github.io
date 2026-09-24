import '../helpers/setup.mjs';
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import IOManager, { isNumeric, isLineNumeric } from '../../grapher/modules/ioManager.js';

describe('IOManager - Détection des en-têtes et des unités dans loadData()', () => {
  describe('Fonction isNumeric()', () => {
    it('doit valider les entiers et flottants valides', () => {
      assert.equal(isNumeric('42'), true);
      assert.equal(isNumeric('-42'), true);
      assert.equal(isNumeric('+42'), true);
      assert.equal(isNumeric('0'), true);
      assert.equal(isNumeric('0.0'), true);
      assert.equal(isNumeric('3.14'), true);
      assert.equal(isNumeric('.5'), true);
      assert.equal(isNumeric('5.'), true);
      assert.equal(isNumeric('  12.5  '), true);
    });

    it('doit valider les nombres avec virgule décimale française', () => {
      assert.equal(isNumeric('3,14'), true);
      assert.equal(isNumeric('-0,05'), true);
      assert.equal(isNumeric('1,5e-2'), true);
    });

    it('doit valider les notations scientifiques', () => {
      assert.equal(isNumeric('1e-5'), true);
      assert.equal(isNumeric('1e5'), true);
      assert.equal(isNumeric('-2.5E+3'), true);
      assert.equal(isNumeric('3.2e4'), true);
    });

    it('doit rejeter les chaînes de texte commençant par un chiffre (faux positifs parseFloat)', () => {
      assert.equal(isNumeric('1ère mesure'), false);
      assert.equal(isNumeric('2ème essai'), false);
      assert.equal(isNumeric('24h'), false);
      assert.equal(isNumeric('1/s'), false);
      assert.equal(isNumeric('10^-3 s'), false);
      assert.equal(isNumeric('100m'), false);
      assert.equal(isNumeric('3D'), false);
      assert.equal(isNumeric('10 %'), false);
      assert.equal(isNumeric('10%'), false);
      assert.equal(isNumeric('1st'), false);
    });

    it('doit rejeter les valeurs vides, nulles ou non numériques', () => {
      assert.equal(isNumeric(''), false);
      assert.equal(isNumeric('   '), false);
      assert.equal(isNumeric(null), false);
      assert.equal(isNumeric(undefined), false);
      assert.equal(isNumeric('NaN'), false);
      assert.equal(isNumeric('Infinity'), false);
      assert.equal(isNumeric('1.2.3'), false);
      assert.equal(isNumeric('1e'), false);
      assert.equal(isNumeric('abc'), false);
    });
  });

  describe('Fonction isLineNumeric()', () => {
    it('doit renvoyer true pour une ligne entièrement numérique', () => {
      assert.equal(isLineNumeric(['10', '20', '30']), true);
      assert.equal(isLineNumeric(['1,5', '-2.3e-4']), true);
    });

    it('doit renvoyer true pour une ligne numérique contenant une cellule vide', () => {
      assert.equal(isLineNumeric(['10', '', '30']), true);
      assert.equal(isLineNumeric(['', '20']), true);
    });

    it('doit renvoyer false si une cellule contient du texte', () => {
      assert.equal(isLineNumeric(['10', 'Temps']), false);
      assert.equal(isLineNumeric(['Temps', '10']), false);
      assert.equal(isLineNumeric(['1ère mesure', '2ème mesure']), false);
      assert.equal(isLineNumeric(['1/s', 's']), false);
      assert.equal(isLineNumeric(['s', '1']), false); // Unité sans dimension '1' combinée à une unité texte
    });

    it('doit renvoyer false pour des cellules toutes vides ou tableau vide', () => {
      assert.equal(isLineNumeric([]), false);
      assert.equal(isLineNumeric(['', '   ']), false);
      assert.equal(isLineNumeric(null), false);
    });
  });

  describe('Intégration loadData()', () => {
    let ioManager;
    let addedCurves;
    let mockApp;

    beforeEach(() => {
      addedCurves = [];
      mockApp = {
        data: {
          parameters: {},
          curves: []
        },
        addCurve: (title, unit) => {
          const curve = [];
          curve.title = title;
          curve.unit = unit;
          addedCurves.push(curve);
          mockApp.data.curves.push(curve);
          return curve;
        },
        editor: {
          getValue: () => ''
        },
        applyCalculation: () => {},
        spreadsheet: {
          focusFirstCell: () => {},
          update: () => {}
        },
        grapher: {
          updateChart: () => {},
          reorderLegendByVisibility: () => {},
          chart: {
            xAxis: [{ setExtremes: () => {} }],
            yAxis: [{ setExtremes: () => {} }]
          }
        },
        uiManager: {
          updateCalculationUI: () => {},
          updateSortUI: () => {},
          updateXAxisSelector: () => {}
        }
      };

      ioManager = new IOManager(mockApp);
    });

    describe('En-têtes commençant par un chiffre', () => {
      it('doit reconnaître "1ère mesure" et "2ème mesure" comme des en-têtes et non des données', () => {
        const data = '1ère mesure\t2ème mesure\n10\t20\n15\t25';
        ioManager.loadData(data);

        assert.equal(addedCurves.length, 2);
        // Les en-têtes doivent être conservés (sanitisés avec préfixe 'v') et non remplacés par Colonne1/Colonne2
        assert.equal(addedCurves[0].title, 'v1èreMesure');
        assert.equal(addedCurves[1].title, 'v2èmeMesure');

        // Les données ne doivent contenir que les lignes 10/20 et 15/25 (2 points par courbe)
        assert.deepEqual(Array.from(addedCurves[0]), [10, 15]);
        assert.deepEqual(Array.from(addedCurves[1]), [20, 25]);
      });

      it('doit reconnaître "24h" et "48h" comme des en-têtes et non des données', () => {
        const data = '24h\t48h\n1.2\t3.4\n5.6\t7.8';
        ioManager.loadData(data);

        assert.equal(addedCurves.length, 2);
        assert.equal(addedCurves[0].title, 'v24h');
        assert.equal(addedCurves[1].title, 'v48h');
        assert.deepEqual(Array.from(addedCurves[0]), [1.2, 5.6]);
        assert.deepEqual(Array.from(addedCurves[1]), [3.4, 7.8]);
      });

      it('doit reconnaître un en-tête mixte où la colonne 1 est un nombre et la colonne 2 un mot', () => {
        const data = '10\tTemps\n1\t0\n2\t5';
        ioManager.loadData(data);

        assert.equal(addedCurves.length, 2);
        assert.equal(addedCurves[0].title, 'v10');
        assert.equal(addedCurves[1].title, 'Temps');
        assert.deepEqual(Array.from(addedCurves[0]), [1, 2]);
        assert.deepEqual(Array.from(addedCurves[1]), [0, 5]);
      });

      it('doit fonctionner sur une seule colonne dont l\'en-tête commence par un chiffre', () => {
        const data = '1ère mesure\n10\n20';
        ioManager.loadData(data);

        assert.equal(addedCurves.length, 1);
        assert.equal(addedCurves[0].title, 'v1èreMesure');
        assert.deepEqual(Array.from(addedCurves[0]), [10, 20]);
      });
    });

    describe('Unités commençant par un chiffre', () => {
      it('doit reconnaître "1/s" comme une unité sur la deuxième ligne et non comme une donnée numérique', () => {
        const data = 'Fréquence\tTemps\n1/s\ts\n10\t0\n20\t1';
        ioManager.loadData(data);

        assert.equal(addedCurves.length, 2);
        assert.equal(addedCurves[0].title, 'Fréquence');
        assert.equal(addedCurves[1].title, 'Temps');
        assert.equal(addedCurves[0].unit, '1/s');
        assert.equal(addedCurves[1].unit, 's');

        // Les données commencent à la 3ème ligne
        assert.deepEqual(Array.from(addedCurves[0]), [10, 20]);
        assert.deepEqual(Array.from(addedCurves[1]), [0, 1]);
      });

      it('doit reconnaître "10^-3 s" comme une unité sur la deuxième ligne', () => {
        const data = 'Temps\tTension\n10^-3 s\tV\n0\t5\n1\t10';
        ioManager.loadData(data);

        assert.equal(addedCurves.length, 2);
        assert.equal(addedCurves[0].title, 'Temps');
        assert.equal(addedCurves[1].title, 'Tension');
        assert.equal(addedCurves[0].unit, '10^-3 s');
        assert.equal(addedCurves[1].unit, 'V');

        assert.deepEqual(Array.from(addedCurves[0]), [0, 1]);
        assert.deepEqual(Array.from(addedCurves[1]), [5, 10]);
      });

      it('doit reconnaître une ligne d\'unités contenant une unité sans dimension "1"', () => {
        const data = 'Temps\tIndice\ns\t1\n0\t1.33\n1\t1.34';
        ioManager.loadData(data);

        assert.equal(addedCurves.length, 2);
        assert.equal(addedCurves[0].title, 'Temps');
        assert.equal(addedCurves[1].title, 'Indice');
        assert.equal(addedCurves[0].unit, 's');
        assert.equal(addedCurves[1].unit, '1');

        assert.deepEqual(Array.from(addedCurves[0]), [0, 1]);
        assert.deepEqual(Array.from(addedCurves[1]), [1.33, 1.34]);
      });
    });

    describe('Tableaux purement numériques sans en-tête', () => {
      it('doit générer Colonne1, Colonne2 quand la première ligne est purement numérique', () => {
        const data = '10\t20\n30\t40\n50\t60';
        ioManager.loadData(data);

        assert.equal(addedCurves.length, 2);
        assert.equal(addedCurves[0].title, 'Colonne1');
        assert.equal(addedCurves[1].title, 'Colonne2');
        assert.deepEqual(Array.from(addedCurves[0]), [10, 30, 50]);
        assert.deepEqual(Array.from(addedCurves[1]), [20, 40, 60]);
      });

      it('doit accepter les décimales avec virgules françaises et notation scientifique sans en-tête', () => {
        const data = '1,5\t-2.3e-4\n3,0\t1.5e-3';
        ioManager.loadData(data);

        assert.equal(addedCurves.length, 2);
        assert.equal(addedCurves[0].title, 'Colonne1');
        assert.equal(addedCurves[1].title, 'Colonne2');
        assert.deepEqual(Array.from(addedCurves[0]), [1.5, 3.0]);
        assert.deepEqual(Array.from(addedCurves[1]), [-0.00023, 0.0015]);
      });

      it('doit fonctionner sur une seule colonne purement numérique sans en-tête', () => {
        const data = '10\n20\n30';
        ioManager.loadData(data);

        assert.equal(addedCurves.length, 1);
        assert.equal(addedCurves[0].title, 'Colonne1');
        assert.deepEqual(Array.from(addedCurves[0]), [10, 20, 30]);
      });
    });

    describe('En-têtes contenant les unités entre parenthèses ou crochets', () => {
      it('doit extraire proprement le nom et l\'unité entre parenthèses (ex: t (s) et x (m))', () => {
        const data = 't (s)\tx (m)\n0\t0.1\n1\t0.2';
        ioManager.loadData(data);

        assert.equal(addedCurves.length, 2);
        assert.equal(addedCurves[0].title, 't');
        assert.equal(addedCurves[0].unit, 's');
        assert.equal(addedCurves[1].title, 'x');
        assert.equal(addedCurves[1].unit, 'm');
        assert.deepEqual(Array.from(addedCurves[0]), [0, 1]);
        assert.deepEqual(Array.from(addedCurves[1]), [0.1, 0.2]);
      });

      it('doit extraire proprement le nom et l\'unité entre crochets (ex: Angle [°] et v [m/s])', () => {
        const data = 'Angle [°]\tv [m/s]\n0\t1\n45\t2';
        ioManager.loadData(data);

        assert.equal(addedCurves.length, 2);
        assert.equal(addedCurves[0].title, 'Angle');
        assert.equal(addedCurves[0].unit, '°');
        assert.equal(addedCurves[1].title, 'v');
        assert.equal(addedCurves[1].unit, 'm/s');
      });

      it('doit gérer un en-tête commençant par un chiffre avec unité (ex: 1ère mesure (m))', () => {
        const data = '1ère mesure (m)\n10\n20';
        ioManager.loadData(data);

        assert.equal(addedCurves.length, 1);
        assert.equal(addedCurves[0].title, 'v1èreMesure');
        assert.equal(addedCurves[0].unit, 'm');
        assert.deepEqual(Array.from(addedCurves[0]), [10, 20]);
      });
    });
  });
});

