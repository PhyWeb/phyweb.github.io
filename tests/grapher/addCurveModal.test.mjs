import '../helpers/setup.mjs';
import fs from 'node:fs';
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import UIManager from '../../grapher/modules/ui.js';
import SymbolValidator from '../../grapher/modules/symbolValidator.js';

describe('AddCurveModal - Grandeur Intégrée (integrate-curve)', () => {
  describe('Conformité HTML dans grapher/index.html', () => {
    const htmlContent = fs.readFileSync('grapher/index.html', 'utf8');

    it('doit contenir le bouton radio integrate-curve', () => {
      assert.match(
        htmlContent,
        /<input\s+type="radio"\s+name="creation-type"\s+value="integrate-curve"\s*\/?>\s*Grandeur intégrée/
      );
    });

    it('doit contenir le panneau #integrate-curve-panel avec tous les champs requis', () => {
      assert.match(htmlContent, /id="integrate-curve-panel"/);
      assert.match(htmlContent, /id="integrate-curve-symbol-input"/);
      assert.match(htmlContent, /id="integrate-curve-unit-input"/);
      assert.match(htmlContent, /id="integrate-operand-select"/);
      assert.match(htmlContent, /id="integrate-variable-select"/);
      assert.match(htmlContent, /id="integrate-initial-value-input"/);
      assert.match(htmlContent, /point courant/);
      assert.match(htmlContent, /∫/);
    });

    it('doit contenir le bouton radio smooth-curve', () => {
      assert.match(
        htmlContent,
        /<input\s+type="radio"\s+name="creation-type"\s+value="smooth-curve"\s*\/?>\s*Grandeur lissée/
      );
    });

    it('doit contenir le panneau #smooth-curve-panel avec tous les champs requis', () => {
      assert.match(htmlContent, /id="smooth-curve-panel"/);
      assert.match(htmlContent, /id="smooth-curve-symbol-input"/);
      assert.match(htmlContent, /id="smooth-curve-unit-input"/);
      assert.match(htmlContent, /id="smooth-operand-select"/);
      assert.match(htmlContent, /id="smooth-points-select"/);
      assert.match(htmlContent, /value="3"/);
      assert.match(htmlContent, /value="5"/);
      assert.match(htmlContent, /value="7"/);
      assert.match(htmlContent, /value="9"/);
    });
  });

  describe('UIManager - initAddCurveModal() et comportement fonctionnel', () => {
    let elements;
    let ui;
    let toasts;
    let appliedCalculations;

    const createMockDOMElement = (tag = 'div') => {
      const listeners = {};
      const classes = new Set(['is-hidden']);
      const children = [];
      return {
        tagName: tag.toUpperCase(),
        value: '',
        innerHTML: '',
        listeners,
        children,
        appendChild: function(c) { children.push(c); return c; },
        classList: {
          add: (c) => classes.add(c),
          remove: (c) => classes.delete(c),
          contains: (c) => classes.has(c),
          _classes: classes
        },
        addEventListener: (type, fn) => {
          if (!listeners[type]) listeners[type] = [];
          listeners[type].push(fn);
        },
        dispatchEvent: function(event) {
          const type = event?.type || 'input';
          if (listeners[type]) {
            listeners[type].forEach(fn => fn(event || { target: this }));
          }
        },
        click: function() {
          if (listeners['click']) {
            listeners['click'].forEach(fn => fn({ preventDefault: () => {} }));
          }
          if (listeners['change']) {
            listeners['change'].forEach(fn => fn({ target: this }));
          }
        },
        focus: function() {}
      };
    };

    beforeEach(() => {
      toasts = [];
      appliedCalculations = [];

      global.showToast = (msg, type) => {
        toasts.push({ msg, type });
      };

      const emptyCurvePanel = createMockDOMElement();
      const calcCurvePanel = createMockDOMElement();
      const derivateCurvePanel = createMockDOMElement();
      const integrateCurvePanel = createMockDOMElement();
      const smoothCurvePanel = createMockDOMElement();
      const parameterPanel = createMockDOMElement();

      const emptyCurveSymbolInput = createMockDOMElement('input');
      const emptyCurveUnitInput = createMockDOMElement('input');
      const calcCurveSymbolInput = createMockDOMElement('input');
      const calcCurveUnitInput = createMockDOMElement('input');
      const calcCurveFormulaInput = createMockDOMElement('input');
      const derivateCurveSymbolInput = createMockDOMElement('input');
      const derivateCurveUnitInput = createMockDOMElement('input');
      const derivateNumeratorSelect = createMockDOMElement('select');
      const derivateDenominatorSelect = createMockDOMElement('select');

      const integrateCurveSymbolInput = createMockDOMElement('input');
      const integrateCurveUnitInput = createMockDOMElement('input');
      const integrateOperandSelect = createMockDOMElement('select');
      const integrateVariableSelect = createMockDOMElement('select');
      const integrateInitialValueInput = createMockDOMElement('input');
      integrateInitialValueInput.value = '0';

      const smoothCurveSymbolInput = createMockDOMElement('input');
      const smoothCurveUnitInput = createMockDOMElement('input');
      const smoothOperandSelect = createMockDOMElement('select');
      const smoothPointsSelect = createMockDOMElement('select');
      smoothPointsSelect.value = '5';

      const parameterSymbolInput = createMockDOMElement('input');
      const parameterUnitInput = createMockDOMElement('input');
      const parameterValueInput = createMockDOMElement('input');

      const addCurveConfirmButton = createMockDOMElement('button');
      const addCurveButton = createMockDOMElement('button');
      const addCurveCalculationButton = createMockDOMElement('button');

      let currentRadio = 'empty-curve';
      const radioButtons = [
        { value: 'empty-curve', listeners: {}, addEventListener: function(e, fn) { (this.listeners[e] = this.listeners[e] || []).push(fn); } },
        { value: 'calc-curve', listeners: {}, addEventListener: function(e, fn) { (this.listeners[e] = this.listeners[e] || []).push(fn); } },
        { value: 'derivate-curve', listeners: {}, addEventListener: function(e, fn) { (this.listeners[e] = this.listeners[e] || []).push(fn); } },
        { value: 'integrate-curve', listeners: {}, addEventListener: function(e, fn) { (this.listeners[e] = this.listeners[e] || []).push(fn); } },
        { value: 'smooth-curve', listeners: {}, addEventListener: function(e, fn) { (this.listeners[e] = this.listeners[e] || []).push(fn); } },
        { value: 'parameter', listeners: {}, addEventListener: function(e, fn) { (this.listeners[e] = this.listeners[e] || []).push(fn); } }
      ];

      const addCurveModal = createMockDOMElement();
      addCurveModal.querySelectorAll = (sel) => {
        if (sel === 'input[name="creation-type"]') return radioButtons;
        return [];
      };
      addCurveModal.querySelector = (sel) => {
        if (sel === 'input[name="creation-type"]:checked') {
          return { value: currentRadio };
        }
        if (sel === 'input[value="empty-curve"]') {
          return { click: () => { currentRadio = 'empty-curve'; } };
        }
        if (sel === 'input[value="calc-curve"]') {
          return { click: () => { currentRadio = 'calc-curve'; } };
        }
        return null;
      };

      elements = {
        addCurveModal,
        emptyCurvePanel,
        calcCurvePanel,
        derivateCurvePanel,
        integrateCurvePanel,
        smoothCurvePanel,
        parameterPanel,
        emptyCurveSymbolInput,
        emptyCurveUnitInput,
        calcCurveSymbolInput,
        calcCurveUnitInput,
        calcCurveFormulaInput,
        derivateCurveSymbolInput,
        derivateCurveUnitInput,
        derivateNumeratorSelect,
        derivateDenominatorSelect,
        integrateCurveSymbolInput,
        integrateCurveUnitInput,
        integrateOperandSelect,
        integrateVariableSelect,
        integrateInitialValueInput,
        smoothCurveSymbolInput,
        smoothCurveUnitInput,
        smoothOperandSelect,
        smoothPointsSelect,
        parameterSymbolInput,
        parameterUnitInput,
        parameterValueInput,
        addCurveConfirmButton,
        addCurveButton,
        addCurveCalculationButton,
        radioButtons,
        setRadio: (val) => {
          currentRadio = val;
          radioButtons.forEach(r => {
            if (r.listeners['change']) r.listeners['change'].forEach(fn => fn());
          });
        }
      };

      const toastContainer = createMockDOMElement();
      toastContainer.appendChild = (child) => {
        toastContainer.children.push(child);
        toasts.push({
          className: child.className || '',
          innerHTML: child.innerHTML || ''
        });
        return child;
      };

      global.__createElementOverride = (tag) => {
        const el = createMockDOMElement(tag);
        return el;
      };

      global.__querySelectorOverride = (sel) => {
        if (sel === '.toast-container') return toastContainer;
        switch (sel) {
          case '#add-curve-modal': return addCurveModal;
          case '#add-curve-confirm-button': return addCurveConfirmButton;
          case '#empty-curve-panel': return emptyCurvePanel;
          case '#calc-curve-panel': return calcCurvePanel;
          case '#derivate-curve-panel': return derivateCurvePanel;
          case '#integrate-curve-panel': return integrateCurvePanel;
          case '#smooth-curve-panel': return smoothCurvePanel;
          case '#parameter-panel': return parameterPanel;
          case '#empty-curve-symbol-input': return emptyCurveSymbolInput;
          case '#empty-curve-unit-input': return emptyCurveUnitInput;
          case '#calc-curve-symbol-input': return calcCurveSymbolInput;
          case '#calc-curve-unit-input': return calcCurveUnitInput;
          case '#calc-curve-formula-input': return calcCurveFormulaInput;
          case '#derivate-curve-symbol-input': return derivateCurveSymbolInput;
          case '#derivate-curve-unit-input': return derivateCurveUnitInput;
          case '#derivate-numerator-select': return derivateNumeratorSelect;
          case '#derivate-denominator-select': return derivateDenominatorSelect;
          case '#integrate-curve-symbol-input': return integrateCurveSymbolInput;
          case '#integrate-curve-unit-input': return integrateCurveUnitInput;
          case '#integrate-operand-select': return integrateOperandSelect;
          case '#integrate-variable-select': return integrateVariableSelect;
          case '#integrate-initial-value-input': return integrateInitialValueInput;
          case '#smooth-curve-symbol-input': return smoothCurveSymbolInput;
          case '#smooth-curve-unit-input': return smoothCurveUnitInput;
          case '#smooth-operand-select': return smoothOperandSelect;
          case '#smooth-points-select': return smoothPointsSelect;
          case '#parameter-symbol-input': return parameterSymbolInput;
          case '#parameter-unit-input': return parameterUnitInput;
          case '#parameter-value-input': return parameterValueInput;
          case '#add-curve-button': return addCurveButton;
          case '#add-curve-calculation-button': return addCurveCalculationButton;
          default: return null;
        }
      };

      global.__getElementByIdOverride = global.__querySelectorOverride;

      ui = Object.create(UIManager.prototype);
      ui.data = {
        curves: [{ title: 't', unit: 's' }, { title: 'v', unit: 'm/s' }],
        parameters: {}
      };
      ui.app = {
        symbolValidator: new SymbolValidator(ui.data),
        addCurve: () => {},
        applyCalculation: (code) => { appliedCalculations.push(code); return true; }
      };
      ui.common = {
        modalManager: {
          openModal: () => {},
          closeAllModals: () => {}
        }
      };
      let editorContent = '';
      ui.editor = {
        getValue: () => editorContent,
        setValue: (val) => { editorContent = val; }
      };
    });

    it('doit basculer vers integrate-curve-panel lorsque le radio est coché', () => {
      ui.initAddCurveModal();

      elements.setRadio('integrate-curve');
      assert.strictEqual(elements.integrateCurvePanel.classList.contains('is-hidden'), false);
      assert.strictEqual(elements.emptyCurvePanel.classList.contains('is-hidden'), true);
      assert.strictEqual(elements.derivateCurvePanel.classList.contains('is-hidden'), true);
    });

    it('doit synchroniser les symboles et unités entre integrate-curve et les autres panneaux', () => {
      ui.initAddCurveModal();

      elements.emptyCurveSymbolInput.value = 'x';
      elements.emptyCurveSymbolInput.dispatchEvent({ type: 'input', target: elements.emptyCurveSymbolInput });
      assert.strictEqual(elements.integrateCurveSymbolInput.value, 'x');

      elements.integrateCurveUnitInput.value = 'm';
      elements.integrateCurveUnitInput.dispatchEvent({ type: 'input', target: elements.integrateCurveUnitInput });
      assert.strictEqual(elements.emptyCurveUnitInput.value, 'm');
    });

    it('doit peupler et pré-sélectionner integrate-operand-select et integrate-variable-select lors de l\'ouverture', () => {
      ui.initAddCurveModal();

      // Clic sur add-curve-button déclenche resetAddCurveModal()
      elements.addCurveButton.click();

      assert.strictEqual(elements.integrateOperandSelect.children.length, 2);
      assert.strictEqual(elements.integrateOperandSelect.children[0].value, 't');
      assert.strictEqual(elements.integrateOperandSelect.children[1].value, 'v');

      assert.strictEqual(elements.integrateVariableSelect.children.length, 2);
      assert.strictEqual(elements.integrateVariableSelect.children[0].value, 't');
      assert.strictEqual(elements.integrateVariableSelect.children[1].value, 'v');

      // Pré-sélection de la 2e colonne (v) et 1re colonne (t)
      assert.strictEqual(elements.integrateOperandSelect.value, 'v');
      assert.strictEqual(elements.integrateVariableSelect.value, 't');
      assert.strictEqual(elements.integrateInitialValueInput.value, '0');
    });

    it('doit gérer le cas où il n\'y a aucune grandeur disponible', () => {
      ui.data.curves = [];
      ui.initAddCurveModal();

      elements.addCurveButton.click();
      elements.setRadio('integrate-curve');

      assert.strictEqual(elements.integrateOperandSelect.disabled, true);
      assert.strictEqual(elements.integrateVariableSelect.disabled, true);
      assert.strictEqual(elements.integrateOperandSelect.children[0].textContent, '');
      assert.strictEqual(elements.integrateOperandSelect.title, 'Aucune grandeur disponible');

      elements.integrateCurveSymbolInput.value = 'x';
      elements.addCurveConfirmButton.click();

      assert.strictEqual(toasts.length, 1);
      assert.ok(toasts[0].className.includes('is-warning'));
      assert.match(toasts[0].innerHTML, /Aucune grandeur/);
    });

    it('doit gérer le cas où il n\'y a qu\'une seule grandeur (pas assez de grandeurs)', () => {
      ui.data.curves = [{ title: 't', unit: 's' }];
      ui.initAddCurveModal();

      elements.addCurveButton.click();
      elements.setRadio('integrate-curve');

      assert.strictEqual(elements.integrateOperandSelect.disabled, true);
      assert.strictEqual(elements.integrateVariableSelect.disabled, true);
      assert.strictEqual(elements.integrateOperandSelect.children[0].textContent, '');
      assert.strictEqual(elements.integrateOperandSelect.title, '2 grandeurs nécessaires');

      elements.integrateCurveSymbolInput.value = 'x';
      elements.addCurveConfirmButton.click();

      assert.strictEqual(toasts.length, 1);
      assert.ok(toasts[0].className.includes('is-warning'));
      assert.match(toasts[0].innerHTML, /au moins 2 grandeurs/);
    });

    it('doit rejeter avec un toast d\'avertissement si le symbole est manquant', () => {
      ui.initAddCurveModal();
      elements.setRadio('integrate-curve');

      // Pas de symbole renseigné
      elements.integrateCurveSymbolInput.value = '';
      elements.addCurveConfirmButton.click();
      assert.strictEqual(toasts.length, 1);
      assert.ok(toasts[0].className.includes('is-warning'));
    });

    it('doit rejeter si la grandeur et la variable choisies sont identiques', () => {
      ui.initAddCurveModal();
      elements.setRadio('integrate-curve');

      elements.integrateCurveSymbolInput.value = 'x';
      elements.integrateOperandSelect.value = 't';
      elements.integrateVariableSelect.value = 't';
      elements.addCurveConfirmButton.click();

      assert.strictEqual(toasts.length, 1);
      assert.ok(toasts[0].className.includes('is-warning'));
      assert.match(toasts[0].innerHTML, /distinctes/);
    });

    it('doit rejeter avec un toast is-danger si le symbole est un mot réservé', () => {
      ui.initAddCurveModal();
      elements.setRadio('integrate-curve');

      elements.integrateCurveSymbolInput.value = 'integrate';
      elements.integrateOperandSelect.value = 'v';
      elements.integrateVariableSelect.value = 't';
      elements.addCurveConfirmButton.click();

      assert.strictEqual(toasts.length, 1);
      assert.ok(toasts[0].className.includes('is-danger'));
      assert.match(toasts[0].innerHTML, /mot réservé/);
    });

    it('doit générer integrate(v, t) sans initialValue si initialValue vaut 0', () => {
      ui.initAddCurveModal();
      elements.setRadio('integrate-curve');

      elements.integrateCurveSymbolInput.value = 'x';
      elements.integrateCurveUnitInput.value = 'm';
      elements.integrateOperandSelect.value = 'v';
      elements.integrateVariableSelect.value = 't';
      elements.integrateInitialValueInput.value = '0';

      elements.addCurveConfirmButton.click();

      assert.strictEqual(appliedCalculations.length, 1);
      assert.strictEqual(appliedCalculations[0], 'x_m = integrate(v, t)');
    });

    it('doit générer integrate(v, t, 12.5) si une valeur initiale non-nulle est saisie', () => {
      ui.initAddCurveModal();
      elements.setRadio('integrate-curve');

      elements.integrateCurveSymbolInput.value = 'x';
      elements.integrateCurveUnitInput.value = 'm';
      elements.integrateOperandSelect.value = 'v';
      elements.integrateVariableSelect.value = 't';
      elements.integrateInitialValueInput.value = '12,5';

      elements.addCurveConfirmButton.click();

      assert.strictEqual(appliedCalculations.length, 1);
      assert.strictEqual(appliedCalculations[0], 'x_m = integrate(v, t, 12.5)');
    });

    it('doit générer integrate(v, t, -3.4) avec une valeur initiale négative', () => {
      ui.initAddCurveModal();
      elements.setRadio('integrate-curve');

      elements.integrateCurveSymbolInput.value = 'x';
      elements.integrateCurveUnitInput.value = 'm';
      elements.integrateOperandSelect.value = 'v';
      elements.integrateVariableSelect.value = 't';
      elements.integrateInitialValueInput.value = '-3,4';

      elements.addCurveConfirmButton.click();

      assert.strictEqual(appliedCalculations.length, 1);
      assert.strictEqual(appliedCalculations[0], 'x_m = integrate(v, t, -3.4)');
    });

    it('doit basculer vers smooth-curve-panel lorsque le radio smooth-curve est coché', () => {
      ui.initAddCurveModal();

      assert.strictEqual(elements.smoothCurvePanel.classList.contains('is-hidden'), true);
      elements.setRadio('smooth-curve');
      assert.strictEqual(elements.smoothCurvePanel.classList.contains('is-hidden'), false);
      assert.strictEqual(elements.integrateCurvePanel.classList.contains('is-hidden'), true);
      assert.strictEqual(elements.emptyCurvePanel.classList.contains('is-hidden'), true);
    });

    it('doit synchroniser les symboles et unités entre smooth-curve et les autres panneaux', () => {
      ui.initAddCurveModal();

      elements.smoothCurveSymbolInput.value = 'yLisse';
      elements.smoothCurveSymbolInput.dispatchEvent({ type: 'input' });

      assert.strictEqual(elements.emptyCurveSymbolInput.value, 'yLisse');
      assert.strictEqual(elements.calcCurveSymbolInput.value, 'yLisse');
      assert.strictEqual(elements.derivateCurveSymbolInput.value, 'yLisse');
      assert.strictEqual(elements.integrateCurveSymbolInput.value, 'yLisse');
      assert.strictEqual(elements.parameterSymbolInput.value, 'yLisse');

      elements.smoothCurveUnitInput.value = 'm';
      elements.smoothCurveUnitInput.dispatchEvent({ type: 'input' });

      assert.strictEqual(elements.emptyCurveUnitInput.value, 'm');
      assert.strictEqual(elements.calcCurveUnitInput.value, 'm');
      assert.strictEqual(elements.integrateCurveUnitInput.value, 'm');
      assert.strictEqual(elements.parameterUnitInput.value, 'm');
    });

    it('doit peupler smooth-operand-select et réinitialiser smooth-points-select à 5 lors de l\'ouverture', () => {
      ui.initAddCurveModal();
      elements.addCurveButton.click();

      assert.strictEqual(elements.smoothOperandSelect.value, 'Choisir grandeur');
      assert.strictEqual(elements.smoothPointsSelect.value, '5');
      assert.ok(elements.smoothOperandSelect.children.some(c => c.value === 't'));
      assert.ok(elements.smoothOperandSelect.children.some(c => c.value === 'v'));
    });

    it('doit pré-remplir l\'unité automatiquement si smoothCurveUnitInput est vide lors du choix de l\'opérande', () => {
      ui.initAddCurveModal();
      elements.setRadio('smooth-curve');

      elements.smoothCurveUnitInput.value = '';
      elements.smoothOperandSelect.value = 'v'; // v a pour unité 'm/s'
      elements.smoothOperandSelect.dispatchEvent({ type: 'change' });

      assert.strictEqual(elements.smoothCurveUnitInput.value, 'm/s');
      assert.strictEqual(elements.emptyCurveUnitInput.value, 'm/s');
    });

    it('ne doit pas écraser l\'unité manuellement renseignée lors du choix de l\'opérande', () => {
      ui.initAddCurveModal();
      elements.setRadio('smooth-curve');

      elements.smoothCurveUnitInput.value = 'km/h';
      elements.smoothOperandSelect.value = 'v';
      elements.smoothOperandSelect.dispatchEvent({ type: 'change' });

      assert.strictEqual(elements.smoothCurveUnitInput.value, 'km/h');
    });

    it('doit rejeter avec un toast d\'avertissement si le symbole est manquant pour smooth-curve', () => {
      ui.initAddCurveModal();
      elements.setRadio('smooth-curve');

      elements.smoothCurveSymbolInput.value = '';
      elements.smoothOperandSelect.value = 'v';
      elements.addCurveConfirmButton.click();

      assert.strictEqual(toasts.length, 1);
      assert.ok(toasts[0].className.includes('is-warning'));
    });

    it('doit rejeter avec un toast d\'avertissement si aucune grandeur n\'est sélectionnée pour smooth-curve', () => {
      ui.initAddCurveModal();
      elements.setRadio('smooth-curve');

      elements.smoothCurveSymbolInput.value = 'yLisse';
      elements.smoothOperandSelect.value = 'Choisir grandeur';
      elements.addCurveConfirmButton.click();

      assert.strictEqual(toasts.length, 1);
      assert.ok(toasts[0].className.includes('is-warning'));
    });

    it('doit rejeter avec un toast is-danger si le symbole est un mot réservé pour smooth-curve', () => {
      ui.initAddCurveModal();
      elements.setRadio('smooth-curve');

      elements.smoothCurveSymbolInput.value = 'smooth';
      elements.smoothOperandSelect.value = 'v';
      elements.addCurveConfirmButton.click();

      assert.strictEqual(toasts.length, 1);
      assert.ok(toasts[0].className.includes('is-danger'));
      assert.match(toasts[0].innerHTML, /mot réservé/);
    });

    it('doit générer smooth(v) si le nombre de points est 5 (standard)', () => {
      ui.initAddCurveModal();
      elements.setRadio('smooth-curve');

      elements.smoothCurveSymbolInput.value = 'vLisse';
      elements.smoothCurveUnitInput.value = 'm/s';
      elements.smoothOperandSelect.value = 'v';
      elements.smoothPointsSelect.value = '5';

      elements.addCurveConfirmButton.click();

      assert.strictEqual(appliedCalculations.length, 1);
      assert.strictEqual(appliedCalculations[0], 'vLisse_m/s = smooth(v)');
    });

    it('doit générer smooth(v, 3) si le nombre de points est 3 (léger)', () => {
      ui.initAddCurveModal();
      elements.setRadio('smooth-curve');

      elements.smoothCurveSymbolInput.value = 'vLisse';
      elements.smoothCurveUnitInput.value = 'm/s';
      elements.smoothOperandSelect.value = 'v';
      elements.smoothPointsSelect.value = '3';

      elements.addCurveConfirmButton.click();

      assert.strictEqual(appliedCalculations.length, 1);
      assert.strictEqual(appliedCalculations[0], 'vLisse_m/s = smooth(v, 3)');
    });

    it('doit générer smooth(v, 7) si le nombre de points est 7 (fort)', () => {
      ui.initAddCurveModal();
      elements.setRadio('smooth-curve');

      elements.smoothCurveSymbolInput.value = 'vLisse';
      elements.smoothCurveUnitInput.value = 'm/s';
      elements.smoothOperandSelect.value = 'v';
      elements.smoothPointsSelect.value = '7';

      elements.addCurveConfirmButton.click();

      assert.strictEqual(appliedCalculations.length, 1);
      assert.strictEqual(appliedCalculations[0], 'vLisse_m/s = smooth(v, 7)');
    });

    describe('Grandeur Dérivée (derivate-curve) - Pré-sélection et validation', () => {
      it('doit peupler et pré-sélectionner la 2e colonne au numérateur et la 1re colonne au dénominateur', () => {
        ui.initAddCurveModal();
        elements.addCurveButton.click();
        elements.setRadio('derivate-curve');

        assert.strictEqual(elements.derivateNumeratorSelect.children.length, 2);
        assert.strictEqual(elements.derivateNumeratorSelect.children[0].value, 't');
        assert.strictEqual(elements.derivateNumeratorSelect.children[1].value, 'v');

        assert.strictEqual(elements.derivateDenominatorSelect.children.length, 2);
        assert.strictEqual(elements.derivateDenominatorSelect.children[0].value, 't');
        assert.strictEqual(elements.derivateDenominatorSelect.children[1].value, 'v');

        // Pré-sélection 2e colonne (v) et 1re colonne (t)
        assert.strictEqual(elements.derivateNumeratorSelect.value, 'v');
        assert.strictEqual(elements.derivateDenominatorSelect.value, 't');
      });

      it('doit désactiver les selects si aucune grandeur n\'est disponible', () => {
        ui.data.curves = [];
        ui.initAddCurveModal();
        elements.addCurveButton.click();
        elements.setRadio('derivate-curve');

        assert.strictEqual(elements.derivateNumeratorSelect.disabled, true);
        assert.strictEqual(elements.derivateDenominatorSelect.disabled, true);
        assert.strictEqual(elements.derivateNumeratorSelect.children[0].textContent, 'Aucune grandeur');

        elements.derivateCurveSymbolInput.value = 'a';
        elements.addCurveConfirmButton.click();

        assert.strictEqual(toasts.length, 1);
        assert.ok(toasts[0].className.includes('is-warning'));
        assert.match(toasts[0].innerHTML, /Aucune grandeur/);
      });

      it('doit désactiver les selects s\'il n\'y a qu\'une seule grandeur (pas assez)', () => {
        ui.data.curves = [{ title: 't', unit: 's' }];
        ui.initAddCurveModal();
        elements.addCurveButton.click();
        elements.setRadio('derivate-curve');

        assert.strictEqual(elements.derivateNumeratorSelect.disabled, true);
        assert.strictEqual(elements.derivateDenominatorSelect.disabled, true);
        assert.strictEqual(elements.derivateNumeratorSelect.children[0].textContent, '2 grandeurs requises');

        elements.derivateCurveSymbolInput.value = 'a';
        elements.addCurveConfirmButton.click();

        assert.strictEqual(toasts.length, 1);
        assert.ok(toasts[0].className.includes('is-warning'));
        assert.match(toasts[0].innerHTML, /au moins 2 grandeurs/);
      });

      it('doit rejeter si le numérateur et le dénominateur sont identiques', () => {
        ui.initAddCurveModal();
        elements.addCurveButton.click();
        elements.setRadio('derivate-curve');

        elements.derivateCurveSymbolInput.value = 'a';
        elements.derivateNumeratorSelect.value = 't';
        elements.derivateDenominatorSelect.value = 't';

        elements.addCurveConfirmButton.click();

        assert.strictEqual(toasts.length, 1);
        assert.ok(toasts[0].className.includes('is-warning'));
        assert.match(toasts[0].innerHTML, /distinctes/);
      });

      it('doit générer diff(v, t) avec les valeurs pré-sélectionnées', () => {
        ui.initAddCurveModal();
        elements.addCurveButton.click();
        elements.setRadio('derivate-curve');

        elements.derivateCurveSymbolInput.value = 'a';
        elements.derivateCurveUnitInput.value = 'm/s^2';

        elements.addCurveConfirmButton.click();

        assert.strictEqual(appliedCalculations.length, 1);
        assert.strictEqual(appliedCalculations[0], 'a_m/s^2 = diff(v, t)');
      });
    });
  });
});
