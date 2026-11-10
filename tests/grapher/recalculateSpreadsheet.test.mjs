import '../helpers/setup.mjs';
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import UIManager from '../../grapher/modules/ui.js';
import App from '../../grapher/modules/app.js';
import Data from '../../grapher/modules/data.js';
import Calculation from '../../grapher/modules/calculation.js';

describe('Bouton Recalculer les grandeurs dans le tableur (#recalculate-spreadsheet-button)', () => {

  afterEach(() => {
    global.__querySelectorOverride = null;
    global.__getElementByIdOverride = null;
  });

  describe('Conformité HTML dans grapher/index.html', () => {
    it('doit contenir le bouton #recalculate-spreadsheet-button juste après #delete-line-button dans #tableur-panel', () => {
      const htmlPath = join(process.cwd(), 'grapher', 'index.html');
      const html = readFileSync(htmlPath, 'utf-8');

      assert.ok(html.includes('id="recalculate-spreadsheet-button"'), 'Le bouton recalculate-spreadsheet-button doit être présent');
      assert.ok(html.includes('is-info is-light is-hidden'), 'Le bouton doit avoir les classes is-info is-light is-hidden');
      assert.ok(html.includes('fa-redo-alt'), 'Le bouton doit contenir l\'icône fa-redo-alt');
      assert.ok(html.includes('Recalculer les grandeurs'), 'Le bouton doit afficher le texte "Recalculer les grandeurs"');

      const deleteLineIndex = html.indexOf('id="delete-line-button"');
      const recalculateIndex = html.indexOf('id="recalculate-spreadsheet-button"');
      assert.ok(deleteLineIndex !== -1 && recalculateIndex !== -1, 'Les deux boutons doivent être trouvés');
      assert.ok(recalculateIndex > deleteLineIndex, 'Le bouton de recalcul doit être situé après le bouton supprimer ligne');
    });
  });

  describe('UIManager - setCalculationsStale() et gestion de l\'affichage', () => {
    let uiManager;
    let mockData;
    let mockEditor;
    let buttonElement;
    let classes;

    beforeEach(() => {
      classes = new Set(['button', 'is-info', 'is-light', 'is-hidden']);
      buttonElement = {
        id: 'recalculate-spreadsheet-button',
        classList: {
          add: (c) => classes.add(c),
          remove: (c) => classes.delete(c),
          toggle: (c, force) => {
            if (force === undefined) {
              if (classes.has(c)) classes.delete(c);
              else classes.add(c);
            } else if (force) {
              classes.add(c);
            } else {
              classes.delete(c);
            }
          },
          contains: (c) => classes.has(c)
        },
        addEventListener: () => {}
      };

      global.__getElementByIdOverride = (id) => {
        if (id === 'recalculate-spreadsheet-button') return buttonElement;
        return null;
      };

      mockData = {
        curves: [],
        parameters: {},
        models: []
      };

      mockEditor = {
        getValue: () => ''
      };

      uiManager = new UIManager({}, mockData, {}, {}, mockEditor, {});
    });

    it('doit initialiser this.calculationsStale à false', () => {
      assert.equal(uiManager.calculationsStale, false);
      assert.ok(buttonElement.classList.contains('is-hidden'));
    });

    it('ne doit pas marquer stale si aucun calcul n\'existe (ni courbe calculation, ni paramètre non-modèle, ni code)', () => {
      uiManager.setCalculationsStale(true);
      assert.equal(uiManager.calculationsStale, false);
      assert.ok(buttonElement.classList.contains('is-hidden'));
    });

    it('doit marquer stale et afficher le bouton si une courbe de type calculation existe', () => {
      mockData.curves.push({ title: 'v', type: 'calculation' });
      uiManager.setCalculationsStale(true);

      assert.equal(uiManager.calculationsStale, true);
      assert.ok(!buttonElement.classList.contains('is-hidden'));
    });

    it('doit marquer stale et afficher le bouton si un paramètre utilisateur (type !== model) existe', () => {
      mockData.parameters['m'] = { value: 2, type: 'parameter' };
      uiManager.setCalculationsStale(true);

      assert.equal(uiManager.calculationsStale, true);
      assert.ok(!buttonElement.classList.contains('is-hidden'));
    });

    it('ne doit pas marquer stale si seuls des paramètres de type model existent et pas de code', () => {
      mockData.parameters['a'] = { value: 1.5, type: 'model' };
      uiManager.setCalculationsStale(true);

      assert.equal(uiManager.calculationsStale, false);
      assert.ok(buttonElement.classList.contains('is-hidden'));
    });

    it('doit marquer stale et afficher le bouton si l\'éditeur contient du code', () => {
      mockEditor.getValue = () => 'y = 2 * x';
      uiManager.setCalculationsStale(true);

      assert.equal(uiManager.calculationsStale, true);
      assert.ok(!buttonElement.classList.contains('is-hidden'));
    });

    it('ne doit pas marquer stale si l\'éditeur ne contient que des commentaires (ex: // Pointage PhyWeb Tracker)', () => {
      mockEditor.getValue = () => '// Pointage PhyWeb Tracker\n// Enregistrement PhyWeb Audio';
      uiManager.setCalculationsStale(true);

      assert.equal(uiManager.calculationsStale, false);
      assert.ok(buttonElement.classList.contains('is-hidden'));
    });

    it('ne doit pas marquer stale si l\'éditeur ne contient que des commentaires Regressi ou dièse (#, \')', () => {
      mockEditor.getValue = () => '# Commentaire dièse\n\' Commentaire Regressi\n   \n';
      uiManager.setCalculationsStale(true);

      assert.equal(uiManager.calculationsStale, false);
      assert.ok(buttonElement.classList.contains('is-hidden'));
    });

    it('ne doit pas marquer stale si l\'éditeur ne contient pas de formule valide (pas de signe = ou variable vide)', () => {
      mockEditor.getValue = () => 'Ceci est une note sans signe égal\n = expressionSansNom\nnomSansExpression = ';
      uiManager.setCalculationsStale(true);

      assert.equal(uiManager.calculationsStale, false);
      assert.ok(buttonElement.classList.contains('is-hidden'));
    });

    it('doit marquer stale si l\'éditeur contient des commentaires et au moins une formule valide', () => {
      mockEditor.getValue = () => '// Pointage PhyWeb Tracker\nv = diff(x, t)';
      uiManager.setCalculationsStale(true);

      assert.equal(uiManager.calculationsStale, true);
      assert.ok(!buttonElement.classList.contains('is-hidden'));
    });

    it('hasCalculationFormulas() doit identifier correctement les formules et ignorer les commentaires', () => {
      assert.equal(uiManager.hasCalculationFormulas('// Commentaire'), false);
      assert.equal(uiManager.hasCalculationFormulas('# Dièse'), false);
      assert.equal(uiManager.hasCalculationFormulas('\' Regressi'), false);
      assert.equal(uiManager.hasCalculationFormulas('Note sans égal'), false);
      assert.equal(uiManager.hasCalculationFormulas('y = 2 * x'), true);
      assert.equal(uiManager.hasCalculationFormulas('v_m/s = diff(x, t)'), true);
      assert.equal(uiManager.hasCalculationFormulas('// Tracker\nv = diff(x, t)'), true);
      assert.equal(uiManager.hasCalculationFormulas(''), false);
      assert.equal(uiManager.hasCalculationFormulas(null), false);
    });

    it('setCalculationsStale(false) doit masquer le bouton et repasser calculationsStale à false', () => {
      mockEditor.getValue = () => 'y = 2 * x';
      uiManager.setCalculationsStale(true);
      assert.equal(uiManager.calculationsStale, true);
      assert.ok(!buttonElement.classList.contains('is-hidden'));

      uiManager.setCalculationsStale(false);
      assert.equal(uiManager.calculationsStale, false);
      assert.ok(buttonElement.classList.contains('is-hidden'));
    });
  });

  describe('UIManager.initSpreadsheetControls() - Écouteurs de tri et recalcul', () => {
    let uiManager;
    let recalculateBtn;
    let sortBtn;
    let sortSelect;

    beforeEach(() => {
      recalculateBtn = {
        addEventListener: (event, fn) => {
          if (event === 'click') recalculateBtn.clickHandler = fn;
        }
      };
      sortBtn = {
        addEventListener: (event, fn) => {
          if (event === 'click') sortBtn.clickHandler = fn;
        }
      };
      sortSelect = { value: 'x' };

      const dummyEl = {
        addEventListener: () => {},
        value: '1',
        classList: { add: () => {}, remove: () => {} },
        appendChild: () => {}
      };

      global.__getElementByIdOverride = (id) => {
        if (id === 'recalculate-spreadsheet-button') return recalculateBtn;
        if (id === 'page-prev-button' || id === 'page-next-button' || id === 'page-first-button' || id === 'page-last-button' || id === 'page-input') {
          return dummyEl;
        }
        return dummyEl;
      };

      global.__querySelectorOverride = (sel) => {
        if (sel === '#sort-button') return sortBtn;
        if (sel === '#sort-variable-select') return sortSelect;
        return dummyEl;
      };

      uiManager = new UIManager(
        {},
        {
          sortDataBy: () => {},
          getTable: () => []
        },
        { updateChart: () => {} },
        {},
        { getValue: () => 'v = diff(x, t)' },
        { update: () => {} }
      );

      uiManager.updateSortUI = () => {};
      uiManager.updateXAxisSelector = () => {};
      uiManager.initAddCurveModal = () => {};
      uiManager.initDeleteCurveModal = () => {};
      uiManager.initDeleteLineButton = () => {};
      uiManager.initEditHeaderModal = () => {};
    });

    it('le clic sur #recalculate-spreadsheet-button doit appeler app.applyCalculation() avec le script de l\'éditeur', () => {
      let passedText = null;
      uiManager.setApp({
        applyCalculation: (text) => {
          passedText = text;
          return true;
        }
      });

      uiManager.initSpreadsheetControls();

      assert.ok(typeof recalculateBtn.clickHandler === 'function', 'Un écouteur de clic doit être enregistré');
      recalculateBtn.clickHandler();

      assert.equal(passedText, 'v = diff(x, t)');
    });

    it('le clic sur #sort-button doit appeler setCalculationsStale(true)', () => {
      let staleCalled = false;
      uiManager.setCalculationsStale = (val) => { if (val) staleCalled = true; };

      uiManager.initSpreadsheetControls();

      assert.ok(typeof sortBtn.clickHandler === 'function', 'Un écouteur de tri doit être enregistré');
      sortBtn.clickHandler();

      assert.equal(staleCalled, true, 'setCalculationsStale(true) doit être appelé après tri');
    });
  });

  describe('Intégration App - deleteRow, applyCalculation, resetSession et staleness', () => {
    let app;
    let data;
    let staleCalls;

    beforeEach(() => {
      staleCalls = [];

      data = new Data({ significantDigits: 4 });
      const curveT = data.addCurve('t', 's');
      const curveX = data.addCurve('x', 'm');
      for (let i = 0; i < 5; i++) {
        curveT.push(i);
        curveX.push(i * 2);
      }

      const mockSpreadsheet = {
        build: () => {},
        addCurve: (title, unit) => data.addCurve(title, unit),
        update: () => {},
        clear: () => {}
      };

      const mockGrapher = {
        setXCurve: () => {},
        updateChart: () => {},
        deleteCurve: () => {},
        chart: { series: [] },
        clearAllAnnotations: () => {},
        deleteAllCurves: () => {}
      };

      const calculation = new Calculation({ derivatePoints: 5, derivateEdges: true });

      const mockEditor = {
        getValue: () => 'y = 2 * x',
        setValue: () => {}
      };

      const mockUIManager = {
        updateCalculationUI: () => {},
        updateSortUI: () => {},
        updateXAxisSelector: () => {},
        updateRecalculateButtonVisibility: () => {},
        updateModelToolVisibility: () => {},
        clearActiveTool: () => {},
        resetSavedState: () => {},
        setCalculationsStale: (val) => { staleCalls.push(val); }
      };

      app = new App(data, mockSpreadsheet, mockGrapher, calculation, mockEditor, mockUIManager);
    });

    it('deleteRow doit appeler setCalculationsStale(true) et ne pas recalculer automatiquement', () => {
      let applyCalled = false;
      app.applyCalculation = () => { applyCalled = true; };

      app.deleteRow(1, 1);

      assert.equal(applyCalled, false, 'applyCalculation ne doit pas être appelé lors de deleteRow');
      assert.ok(staleCalls.includes(true), 'setCalculationsStale(true) doit être appelé');
    });

    it('applyCalculation avec formule doit appeler setCalculationsStale(false) en fin d\'exécution', () => {
      staleCalls = [];
      const res = app.applyCalculation('y = 2 * x');

      assert.equal(res, true);
      assert.equal(staleCalls[staleCalls.length - 1], false, 'setCalculationsStale(false) doit être appelé après calcul');
    });

    it('applyCalculation avec texte vide doit appeler setCalculationsStale(false)', () => {
      staleCalls = [];
      const res = app.applyCalculation('');

      assert.equal(res, true);
      assert.equal(staleCalls[staleCalls.length - 1], false, 'setCalculationsStale(false) doit être appelé après vidage des calculs');
    });

    it('resetSession doit appeler setCalculationsStale(false)', () => {
      staleCalls = [];
      app.resetSession();

      assert.ok(staleCalls.includes(false), 'setCalculationsStale(false) doit être appelé lors de resetSession');
    });
  });

});
