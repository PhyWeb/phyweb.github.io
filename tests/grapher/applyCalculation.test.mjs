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
});
