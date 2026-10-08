import '../helpers/setup.mjs';
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import App from '../../grapher/modules/app.js';

describe('App - renameCurve (Correction faux positifs)', () => {
  let app;
  let toastCount = 0;
  
  beforeEach(() => {
    toastCount = 0;

    // Intercepter la création des toasts pour compter le nombre de fois où l'alerte est déclenchée
    global.__querySelectorOverride = (sel) => {
      if (sel === '.toast-container') {
        return {
          appendChild: () => {
            toastCount++;
          }
        };
      }
      return null;
    };

    app = Object.create(App.prototype);
    
    // Mock des dépendances nécessaires pour éviter les erreurs
    app.symbolValidator = {
      validate: () => ({ isValid: true })
    };
    
    app.grapher = {
      currentXCurve: 't',
      chart: {
        series: [],
        redraw: () => {}
      },
      setXCurve: () => {},
      updateChart: () => {}
    };

    app.data = {
      getCurveByTitle: (title) => ({ title, unit: '' }),
      models: []
    };

    app.spreadsheet = { update: () => {} };

    app.uiManager = {
      updateSortUI: () => {},
      updateXAxisSelector: () => {},
      updateCalculationUI: () => {},
      updateModelPanel: () => {}
    };
  });

  it('ne doit pas alerter quand le nom court (x) est une sous-chaîne d\'une autre fonction (exp)', () => {
    app.editor = {
      getValue: () => 'exp(2)'
    };

    app.renameCurve('x', 'x_new', 'm');

    assert.equal(toastCount, 0, 'Il ne doit pas y avoir de toast si x est dans exp');
  });

  it('ne doit pas alerter quand le nom court (v) est une sous-chaîne d\'une variable plus longue (v0)', () => {
    app.editor = {
      getValue: () => 'v0 * t'
    };

    app.renameCurve('v', 'v_new', 'm/s');

    assert.equal(toastCount, 0, 'Il ne doit pas y avoir de toast si v est dans v0');
  });

  it('doit alerter quand le nom est explicitement utilisé dans la formule (x)', () => {
    app.editor = {
      getValue: () => 'x + 2'
    };

    app.renameCurve('x', 'x_new', 'm');

    assert.equal(toastCount, 1, 'Il doit y avoir un toast d\'avertissement');
  });

  it('doit alerter quand le nom est explicitement utilisé au début (x*2)', () => {
    app.editor = {
      getValue: () => 'x*2'
    };

    app.renameCurve('x', 'x_new', 'm');

    assert.equal(toastCount, 1, 'Il doit y avoir un toast d\'avertissement');
  });

  it('doit alerter quand le nom est explicitement utilisé à la fin (2+x)', () => {
    app.editor = {
      getValue: () => '2+x'
    };

    app.renameCurve('x', 'x_new', 'm');

    assert.equal(toastCount, 1, 'Il doit y avoir un toast d\'avertissement');
  });
});
