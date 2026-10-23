import '../helpers/setup.mjs';
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import App from '../../grapher/modules/app.js';
import Data from '../../grapher/modules/data.js';
import Calculation from '../../grapher/modules/calculation.js';

describe('App - applyCalculation() et interdiction de redéfinir les grandeurs existantes', () => {
  let app;
  let data;
  let toastLog = [];

  beforeEach(() => {
    toastLog = [];

    global.__querySelectorOverride = (sel) => {
      if (sel === '.toast-container') return null;
      return null;
    };

    // Capture des toasts créés via document.createElement
    global.__createElementOverride = (tag) => {
      const el = {
        tagName: tag,
        className: '',
        innerHTML: '',
        style: {},
        appendChild: (child) => {
          if (child && child.innerHTML) {
            toastLog.push({
              className: child.className,
              innerHTML: child.innerHTML
            });
          }
        },
        remove: () => {}
      };
      return el;
    };

    data = new Data({ significantDigits: 4 });
    // Créer des courbes brutes du tableau
    const curveT = data.addCurve('t', 's');
    const curveX = data.addCurve('x', 'm');
    for (let i = 0; i < 5; i++) {
      curveT.push(i);
      curveX.push(i * 2);
    }

    const mockSpreadsheet = {
      build: () => {},
      addCurve: (title, unit) => data.addCurve(title, unit),
      update: () => {}
    };

    const mockGrapher = {
      setXCurve: () => {},
      updateChart: () => {},
      deleteCurve: () => {},
      chart: { series: [] }
    };

    const calculation = new Calculation({ derivatePoints: 5, derivateEdges: true });

    const mockEditor = {
      getValue: () => '',
      setValue: () => {}
    };

    const mockUIManager = {
      updateCalculationUI: () => {},
      updateSortUI: () => {},
      updateXAxisSelector: () => {}
    };

    app = new App(data, mockSpreadsheet, mockGrapher, calculation, mockEditor, mockUIManager);
  });

  it('doit bloquer la création d\'un paramètre ayant le même nom qu\'une grandeur brute (ex: x = 5)', () => {
    app.applyCalculation('x = 5');

    // Vérifie qu'un toast d'erreur a été affiché
    assert.equal(toastLog.length > 0, true);
    assert.ok(toastLog.some(t => t.innerHTML.includes('Le symbole &quot;x&quot; est une grandeur existante et ne peut pas être redéfini.') ||
                                  t.innerHTML.includes('Le symbole "x" est une grandeur existante et ne peut pas être redéfini.')));

    // Vérifie que x n'a pas été ajouté aux paramètres
    assert.equal(data.parameters['x'], undefined);

    // Vérifie que la courbe x reste intacte dans data.curves
    const curve = data.getCurveByTitle('x');
    assert.ok(curve);
    assert.equal(curve.type, undefined);
    assert.equal(curve.length, 5);
  });

  it('doit bloquer la création d\'un paramètre avec unité ayant le même nom qu\'une grandeur brute (ex: x_m = 5)', () => {
    app.applyCalculation('x_m = 5');

    assert.equal(toastLog.length > 0, true);
    assert.ok(toastLog.some(t => t.innerHTML.includes('Le symbole &quot;x&quot; est une grandeur existante et ne peut pas être redéfini.') ||
                                  t.innerHTML.includes('Le symbole "x" est une grandeur existante et ne peut pas être redéfini.')));
    assert.equal(data.parameters['x'], undefined);
  });

  it('doit bloquer la redéfinition d\'une grandeur brute par une grandeur calculée (ex: x = 2 * t)', () => {
    app.applyCalculation('x = 2 * t');

    assert.equal(toastLog.length > 0, true);
    assert.ok(toastLog.some(t => t.innerHTML.includes('Le symbole &quot;x&quot; est une grandeur existante et ne peut pas être redéfini.') ||
                                  t.innerHTML.includes('Le symbole "x" est une grandeur existante et ne peut pas être redéfini.')));

    // Toujours une seule courbe x qui est la courbe brute d'origine
    const curvesX = data.curves.filter(c => c.title === 'x');
    assert.equal(curvesX.length, 1);
    assert.equal(curvesX[0].type, undefined);
  });

  it('doit autoriser la création et le recalcul d\'un paramètre valide (ex: m = 2 puis m = 3)', () => {
    app.applyCalculation('m = 2');

    assert.ok(data.parameters['m']);
    assert.equal(data.parameters['m'].value, 2);

    // Recalcul avec nouvelle valeur
    app.applyCalculation('m = 3');
    assert.equal(data.parameters['m'].value, 3);
  });

  it('doit autoriser la création et le recalcul d\'une grandeur calculée valide (ex: v = diff(x, t))', () => {
    app.applyCalculation('v = diff(x, t)');

    const curveV = data.getCurveByTitle('v');
    assert.ok(curveV);
    assert.equal(curveV.type, 'calculation');
    assert.equal(curveV[1], 2); // dx/dt = 2

    // Recalcul
    app.applyCalculation('v = diff(x, t) * 2');
    const updatedV = data.getCurveByTitle('v');
    assert.ok(updatedV);
    assert.equal(updatedV[1], 4);
  });

  it('doit bloquer la redéfinition d\'un paramètre de modèle', () => {
    data.parameters['a'] = { value: 1, unit: '', type: 'model' };

    app.applyCalculation('a = 10');

    assert.equal(toastLog.length > 0, true);
    assert.ok(toastLog.some(t => t.innerHTML.includes('Le symbole &quot;a&quot; est un paramètre de modèle et ne peut pas être redéfini.') ||
                                  t.innerHTML.includes('Le symbole "a" est un paramètre de modèle et ne peut pas être redéfini.')));
    assert.equal(data.parameters['a'].value, 1);
  });

  it('doit appeler spreadsheet.update() et grapher.updateChart() même si les valeurs calculées sont inchangées', () => {
    let spreadsheetUpdates = 0;
    let chartUpdates = 0;
    app.spreadsheet.update = () => { spreadsheetUpdates++; };
    app.grapher.updateChart = () => { chartUpdates++; };

    // Premier calcul
    app.applyCalculation('y = 2 * x');
    assert.equal(spreadsheetUpdates, 2); // 1 dans addCurve, 1 à la fin de applyCalculation
    assert.equal(chartUpdates, 1);

    // Deuxième calcul identique
    app.applyCalculation('y = 2 * x');
    // Le tableur et le graphique doivent toujours être mis à jour à la fin
    assert.equal(spreadsheetUpdates, 4);
    assert.equal(chartUpdates, 2);
  });

  it('deleteRow doit recalculer les grandeurs calculées via applyCalculation si l\'éditeur contient du code', () => {
    app.editor.getValue = () => 'y = 2 * x';
    app.applyCalculation('y = 2 * x');

    const curveY = data.getCurveByTitle('y');
    assert.equal(curveY.length, 5);
    assert.deepEqual([...curveY], [0, 4, 8, 12, 16]);

    // Suppression de la ligne 2 (x=4, y=8)
    app.deleteRow(2, 1);

    // Les données brutes et calculées doivent avoir 4 éléments
    assert.equal(data.getCurveByTitle('x').length, 4);
    assert.equal(curveY.length, 4);
    assert.deepEqual([...curveY], [0, 4, 12, 16]);
  });

  it('deleteRow doit mettre à jour le tableur et le graphique si l\'éditeur est vide', () => {
    app.editor.getValue = () => '   ';
    let spreadsheetUpdates = 0;
    let chartUpdates = 0;
    app.spreadsheet.update = () => { spreadsheetUpdates++; };
    app.grapher.updateChart = () => { chartUpdates++; };

    app.deleteRow(1, 1);

    assert.equal(data.getCurveByTitle('x').length, 4);
    assert.equal(spreadsheetUpdates, 1);
    assert.equal(chartUpdates, 1);
  });

  it('doit afficher les erreurs d\'évaluation (ex: dérivée non triée) via des toasts is-danger', () => {
    const curveT = data.getCurveByTitle('t');
    curveT.length = 0;
    curveT.push(0, 1, 3, 2, 4);

    const success = app.applyCalculation('v = diff(x, t)');

    assert.equal(success, false);
    assert.equal(toastLog.length > 0, true);
    const errorToast = toastLog.find(t => t.innerHTML.includes('la grandeur de dérivation n\'est pas triée'));
    assert.ok(errorToast, 'Un toast d\'erreur de dérivation non triée doit être affiché');
    assert.ok(errorToast.className.includes('is-danger'));
  });

  it('doit afficher les erreurs de valeurs identiques consécutives via des toasts is-danger', () => {
    const curveT = data.getCurveByTitle('t');
    curveT.length = 0;
    curveT.push(0, 1, 1, 2, 3);

    const success = app.applyCalculation('v = diff(x, t)');

    assert.equal(success, false);
    assert.equal(toastLog.length > 0, true);
    const errorToast = toastLog.find(t => t.innerHTML.includes('la grandeur de dérivation contient deux valeurs identiques consécutives'));
    assert.ok(errorToast, 'Un toast d\'erreur de valeurs identiques consécutives doit être affiché');
    assert.ok(errorToast.className.includes('is-danger'));
  });
});
