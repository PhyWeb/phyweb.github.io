import '../helpers/setup.mjs';
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import IOManager, { splitFlexible, isTabularData } from '../../grapher/modules/ioManager.js';

describe('IOManager - splitFlexible, isTabularData et gestion des colonnes TSV', () => {
  describe('Fonction utilitaire splitFlexible()', () => {
    it('doit préserver la première cellule vide lorsqu\'une ligne commence par une tabulation', () => {
      const result = splitFlexible('\t10\t20');
      assert.deepEqual(result, ['', '10', '20']);
      assert.equal(result.length, 3);
    });

    it('doit préserver une cellule vide au milieu d\'une ligne tabulée', () => {
      const result = splitFlexible('10\t\t20');
      assert.deepEqual(result, ['10', '', '20']);
      assert.equal(result.length, 3);
    });

    it('doit préserver une cellule vide en fin d\'une ligne tabulée', () => {
      const result = splitFlexible('10\t20\t');
      assert.deepEqual(result, ['10', '20', '']);
      assert.equal(result.length, 3);
    });

    it('ne doit pas couper une cellule contenant deux espaces consécutifs en TSV', () => {
      const result = splitFlexible('Masse  totale\tTemps');
      assert.deepEqual(result, ['Masse  totale', 'Temps']);
      assert.equal(result.length, 2);
    });

    it('doit découper sur les espaces multiples lorsque la ligne ne contient aucune tabulation', () => {
      const result = splitFlexible('10   20   30');
      assert.deepEqual(result, ['10', '20', '30']);
      assert.equal(result.length, 3);
    });

    it('doit supporter une ligne sans tabulations avec indentation initiale', () => {
      const result = splitFlexible('   10   20   30   ');
      assert.deepEqual(result, ['10', '20', '30']);
      assert.equal(result.length, 3);
    });

    it('doit gérer les retours chariot Windows (CRLF)', () => {
      const result = splitFlexible('10\t20\r');
      assert.deepEqual(result, ['10', '20']);
    });
  });

  describe('Fonction utilitaire isTabularData()', () => {
    it('doit reconnaître comme tabulaire des données dont certaines lignes ont une première cellule vide', () => {
      const tsv = 'A\tB\tC\n\t10\t20\n1\t2\t3\n\t4\t5';
      assert.equal(isTabularData(tsv), true);
    });

    it('doit reconnaître comme tabulaire des données avec deux espaces consécutifs dans un en-tête', () => {
      const tsv = 'Masse  totale\tTemps\n10\t20\n30\t40';
      assert.equal(isTabularData(tsv), true);
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

    it('ne doit pas décaler les valeurs vers la gauche si la première cellule d\'une ligne est vide', () => {
      // 3 colonnes : A, B, C
      // Ligne 1 : colonne A vide, colonne B = 10, colonne C = 20
      // Ligne 2 : colonne A = 1, colonne B = 2, colonne C = 3
      const data = 'A\tB\tC\n\t10\t20\n1\t2\t3';
      ioManager.loadData(data);

      assert.equal(addedCurves.length, 3);
      assert.equal(addedCurves[0].title, 'A');
      assert.equal(addedCurves[1].title, 'B');
      assert.equal(addedCurves[2].title, 'C');

      // Courbe A : la première valeur doit être null (cellule vide), la deuxième 1
      assert.deepEqual(Array.from(addedCurves[0]), [null, 1]);
      // Courbe B : la première valeur doit être 10, la deuxième 2
      assert.deepEqual(Array.from(addedCurves[1]), [10, 2]);
      // Courbe C : la première valeur doit être 20, la deuxième 3
      assert.deepEqual(Array.from(addedCurves[2]), [20, 3]);
    });

    it('ne doit pas scinder un en-tête en deux colonnes quand il contient deux espaces consécutifs', () => {
      // 2 colonnes attendues : "Masse  totale" et "Temps"
      const data = 'Masse  totale\tTemps\n10\t20\n30\t40';
      ioManager.loadData(data);

      assert.equal(addedCurves.length, 2, 'Il ne doit y avoir que 2 courbes créées');
      assert.equal(addedCurves[0].title, 'MasseTotale');
      assert.equal(addedCurves[1].title, 'Temps');

      assert.deepEqual(Array.from(addedCurves[0]), [10, 30]);
      assert.deepEqual(Array.from(addedCurves[1]), [20, 40]);
    });

    it('doit préserver la première colonne si l\'en-tête de la première colonne est vide', () => {
      // Colonne 1 : vide (doit devenir Colonne1), Colonne 2 : B, Colonne 3 : C
      const data = '\tB\tC\n1\t2\t3';
      ioManager.loadData(data);

      assert.equal(addedCurves.length, 3);
      assert.equal(addedCurves[0].title, 'Colonne1');
      assert.equal(addedCurves[1].title, 'B');
      assert.equal(addedCurves[2].title, 'C');

      assert.deepEqual(Array.from(addedCurves[0]), [1]);
      assert.deepEqual(Array.from(addedCurves[1]), [2]);
      assert.deepEqual(Array.from(addedCurves[2]), [3]);
    });
  });
});

