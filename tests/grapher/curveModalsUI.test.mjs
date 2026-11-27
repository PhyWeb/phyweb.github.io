import '../helpers/setup.mjs';
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import Data from '../../grapher/modules/data.js';
import UIManager from '../../grapher/modules/ui.js';
import SymbolValidator from '../../grapher/modules/symbolValidator.js';

function createClassList(initial = []) {
  const set = new Set(initial);
  return {
    add: (...cls) => cls.forEach(c => set.add(c)),
    remove: (...cls) => cls.forEach(c => set.delete(c)),
    contains: (c) => set.has(c),
    toggle: (c, force) => {
      if (force === undefined) {
        if (set.has(c)) { set.delete(c); return false; }
        set.add(c); return true;
      }
      if (force) { set.add(c); return true; }
      set.delete(c); return false;
    }
  };
}

function createEl(tag = 'div', initialClasses = []) {
  const listeners = {};
  return {
    tagName: tag.toUpperCase(),
    style: {},
    dataset: {},
    children: [],
    value: '',
    textContent: '',
    innerHTML: '',
    checked: false,
    disabled: false,
    classList: createClassList(initialClasses),
    addEventListener(type, fn) {
      if (!listeners[type]) listeners[type] = [];
      listeners[type].push(fn);
    },
    dispatch(type, event = {}) {
      (listeners[type] || []).forEach(fn => fn(event));
    },
    click() {
      this.checked = true;
      this.dispatch('click');
      this.dispatch('change');
    },
    focus() {},
    appendChild(child) {
      this.children.push(child);
      if (this.tagName === 'SELECT' && this.children.length === 1 && !this.value) {
        this.value = child.value;
      }
      return child;
    },
    querySelector: () => null,
    querySelectorAll: () => []
  };
}

describe('UIManager - Modales de gestion des courbes (tests de caractérisation)', () => {
  let data;
  let common;
  let editor;
  let app;
  let ui;

  beforeEach(() => {
    data = new Data();
    data.addCurve('t', 's');
    data.addCurve('x', 'm');
    const calcCurve = data.addCurve('v', 'm/s', undefined, undefined, undefined, undefined, 'calculation');
    calcCurve.type = 'calculation';

    common = {
      modalManager: {
        opened: [],
        closedAll: 0,
        openModal(m) { this.opened.push(m); },
        closeAllModals() { this.closedAll++; }
      }
    };

    editor = {
      content: '',
      getValue() { return this.content; },
      setValue(v) { this.content = v; }
    };

    app = {
      symbolValidator: new SymbolValidator(data),
      addedCurves: [],
      deletedCurves: [],
      appliedCalculations: [],
      addCurve(symbol, unit) {
        this.addedCurves.push({ symbol, unit });
      },
      deleteCurve(title) {
        this.deletedCurves.push(title);
      },
      applyCalculation(text) {
        this.appliedCalculations.push(text);
        return true;
      }
    };

    ui = new UIManager(common, data, {}, {}, editor, {});
    ui.setApp(app);
  });

  afterEach(() => {
    global.__querySelectorOverride = null;
    global.__querySelectorAllOverride = null;
    global.__getElementByIdOverride = null;
    global.__createElementOverride = null;
  });

  it('initDeleteCurveModal peuple uniquement les grandeurs non calculées et supprime la sélection', () => {
    const deleteBtn = createEl('button');
    const confirmBtn = createEl('button');
    const selectEl = createEl('select');
    const modalEl = createEl('div');

    const map = {
      '#delete-curve-button': deleteBtn,
      '#delete-curve-confirm-button': confirmBtn,
      '#delete-curve-select': selectEl,
      '#delete-curve-modal': modalEl
    };
    global.__querySelectorOverride = (sel) => map[sel] || createEl();
    global.__createElementOverride = (tag) => createEl(tag);

    ui.initDeleteCurveModal();
    deleteBtn.dispatch('click');

    assert.equal(common.modalManager.opened.length, 1);
    // Seules 't' et 'x' doivent apparaître ('v' est de type calculation)
    assert.deepEqual(selectEl.children.map(o => o.value), ['t', 'x']);
    assert.equal(selectEl.children[0].textContent, 't (s)');

    selectEl.value = 'x';
    confirmBtn.dispatch('click');
    assert.deepEqual(app.deletedCurves, ['x']);
    assert.equal(common.modalManager.closedAll, 1);
  });

  it('initAddCurveModal gère les modes empty-curve, calc-curve et parameter', () => {
    const radios = ['empty-curve', 'calc-curve', 'derivate-curve', 'integrate-curve', 'smooth-curve', 'parameter'].map(val => {
      const r = createEl('input');
      r.value = val;
      r.checked = val === 'empty-curve';
      return r;
    });
    const setActiveRadio = (val) => {
      radios.forEach(r => { r.checked = (r.value === val); });
      radios.find(r => r.value === val).dispatch('change');
    };

    const modal = createEl('div');
    modal.querySelectorAll = (sel) => sel === 'input[name="creation-type"]' ? radios : [];
    modal.querySelector = (sel) => {
      if (sel === 'input[name="creation-type"]:checked') return radios.find(r => r.checked);
      const m = sel.match(/input\[value="([^"]+)"\]/);
      if (m) {
        const target = radios.find(r => r.value === m[1]);
        return { click: () => setActiveRadio(target.value) };
      }
      return null;
    };

    const emptySymbol = createEl('input');
    const emptyUnit = createEl('input');
    const calcSymbol = createEl('input');
    const calcUnit = createEl('input');
    const calcFormula = createEl('input');
    const paramSymbol = createEl('input');
    const paramUnit = createEl('input');
    const paramValue = createEl('input');
    const confirmBtn = createEl('button');
    const addCurveBtn = createEl('button');
    const addCurveCalcBtn = createEl('button');

    const map = {
      '#add-curve-modal': modal,
      '#add-curve-confirm-button': confirmBtn,
      '#add-curve-button': addCurveBtn,
      '#add-curve-calculation-button': addCurveCalcBtn,
      '#empty-curve-panel': createEl('div'),
      '#calc-curve-panel': createEl('div', ['is-hidden']),
      '#derivate-curve-panel': createEl('div', ['is-hidden']),
      '#integrate-curve-panel': createEl('div', ['is-hidden']),
      '#smooth-curve-panel': createEl('div', ['is-hidden']),
      '#parameter-panel': createEl('div', ['is-hidden']),
      '#empty-curve-symbol-input': emptySymbol,
      '#empty-curve-unit-input': emptyUnit,
      '#calc-curve-symbol-input': calcSymbol,
      '#calc-curve-unit-input': calcUnit,
      '#calc-curve-formula-input': calcFormula,
      '#derivate-curve-symbol-input': createEl('input'),
      '#derivate-curve-unit-input': createEl('input'),
      '#derivate-numerator-select': createEl('select'),
      '#derivate-denominator-select': createEl('select'),
      '#integrate-curve-symbol-input': createEl('input'),
      '#integrate-curve-unit-input': createEl('input'),
      '#integrate-operand-select': createEl('select'),
      '#integrate-variable-select': createEl('select'),
      '#integrate-initial-value-input': createEl('input'),
      '#smooth-curve-symbol-input': createEl('input'),
      '#smooth-curve-unit-input': createEl('input'),
      '#smooth-operand-select': createEl('select'),
      '#smooth-points-select': createEl('select'),
      '#parameter-symbol-input': paramSymbol,
      '#parameter-unit-input': paramUnit,
      '#parameter-value-input': paramValue
    };

    global.__querySelectorOverride = (sel) => map[sel] || createEl();
    global.__createElementOverride = (tag) => createEl(tag);

    ui.initAddCurveModal();

    // 1. Mode empty-curve
    addCurveBtn.dispatch('click');
    emptySymbol.value = 'U';
    emptyUnit.value = ' V ';
    confirmBtn.dispatch('click');
    assert.deepEqual(app.addedCurves, [{ symbol: 'U', unit: 'V' }]);

    // 2. Mode calc-curve
    addCurveCalcBtn.dispatch('click');
    calcSymbol.value = 'Ec';
    calcUnit.value = 'J';
    calcFormula.value = '0.5 * m * v^2';
    confirmBtn.dispatch('click');
    assert.equal(editor.getValue(), 'Ec_J = 0.5 * m * v^2');
    assert.equal(app.appliedCalculations.length, 1);

    // 3. Mode parameter
    setActiveRadio('parameter');
    paramSymbol.value = 'g';
    paramUnit.value = 'm/s^2';
    paramValue.value = '9.81';
    confirmBtn.dispatch('click');
    assert.ok(editor.getValue().includes('g_m/s^2 = 9.81'));
    assert.equal(app.appliedCalculations.length, 2);
  });
});
