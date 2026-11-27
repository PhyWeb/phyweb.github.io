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
    checked: false,
    textContent: '',
    innerHTML: '',
    classList: createClassList(initialClasses),
    addEventListener(type, fn) {
      if (!listeners[type]) listeners[type] = [];
      listeners[type].push(fn);
    },
    dispatch(type, event = {}) {
      (listeners[type] || []).forEach(fn => fn(event));
    },
    click() { this.dispatch('click'); },
    focus() {},
    appendChild(child) {
      this.children.push(child);
      return child;
    },
    querySelector: () => null,
    querySelectorAll: () => []
  };
}

describe('UIManager - Gestion de session, paramètres et sauvegarde (tests de caractérisation)', () => {
  let data;
  let grapher;
  let calculation;
  let editor;
  let spreadsheet;
  let common;
  let app;
  let ui;

  beforeEach(() => {
    localStorage.clear();
    data = new Data({ significantDigits: 4 });
    data.addCurve('t', 's');

    grapher = {
      grid: true,
      minorGrid: false,
      highlightZeroAxes: true,
      disableScientificNotation: false,
      includeOriginOnAutoZoom: true,
      chart: { redrawCount: 0, redraw() { this.redrawCount++; } },
      setGridVisibility(v) { this.grid = v; },
      setMinorGridVisibility(v) { this.minorGrid = v; },
      setHighlightZeroAxes(v) { this.highlightZeroAxes = v; },
      setDisableScientificNotation(v) { this.disableScientificNotation = v; },
      setIncludeOriginOnAutoZoom(v) { this.includeOriginOnAutoZoom = v; }
    };

    calculation = { derivatePoints: 5, derivateEdges: false };
    editor = {
      content: '',
      getValue() { return this.content; },
      setValue(v) { this.content = v; }
    };
    spreadsheet = {
      updateCount: 0,
      focusCalls: [],
      update() { this.updateCount++; },
      focusFirstCell(edit) { this.focusCalls.push(edit); }
    };
    common = {
      modalManager: {
        opened: [],
        closedAll: 0,
        openModal(m) { this.opened.push(m); },
        closeAllModals() { this.closedAll++; }
      }
    };
    app = {
      symbolValidator: new SymbolValidator(data),
      spreadsheet,
      resetCount: 0,
      addedCurves: [],
      appliedCalcs: [],
      savedFiles: [],
      ioManager: {
        saveFile(name, fmt) { app.savedFiles.push({ name, fmt }); }
      },
      resetSession() { this.resetCount++; },
      addCurve(name, unit) { this.addedCurves.push({ name, unit }); },
      applyCalculation(txt) { this.appliedCalcs.push(txt); return true; }
    };

    ui = new UIManager(common, data, grapher, calculation, editor, spreadsheet);
    ui.setApp(app);
    ui.navManager = { confirmAction: (cb) => cb() };
    ui.markAsSaved = () => { ui._markedSaved = true; };
    ui.showTabsAndPanels = () => { ui._tabsShown = true; };
    ui.updateCalculationUI = () => {};
    ui.updateModelPanel = () => {};
  });

  afterEach(() => {
    global.__querySelectorOverride = null;
    global.__querySelectorAllOverride = null;
    global.__getElementByIdOverride = null;
    global.__createElementOverride = null;
  });

  it('initSettingsModal charge, applique et persiste les paramètres', () => {
    const settingsModal = createEl('div');
    const settingsBtn = createEl('button');
    const saveBtn = createEl('button');
    const resetBtn = createEl('button');
    const sigDigits = createEl('select'); sigDigits.value = '4';
    const gridSwitch = createEl('input'); gridSwitch.checked = true;
    const minorSwitch = createEl('input'); minorSwitch.checked = false;
    const zeroAxesSwitch = createEl('input'); zeroAxesSwitch.checked = true;
    const sciSwitch = createEl('input'); sciSwitch.checked = false;
    const originSwitch = createEl('input'); originSwitch.checked = true;
    const derivPts = createEl('select'); derivPts.value = '5';
    const derivEdges = createEl('input'); derivEdges.checked = false;
    const savePermSwitch = createEl('input'); savePermSwitch.checked = false;

    const byId = {
      'settings-modal': settingsModal,
      'settings-button': settingsBtn,
      'settings-save-button': saveBtn,
      'settings-reset-button': resetBtn,
      'significant-digits-select': sigDigits,
      'graph-grid-switch': gridSwitch,
      'graph-grid-minor-switch': minorSwitch,
      'highlight-zero-axes-switch': zeroAxesSwitch,
      'graph-disable-scientific-switch': sciSwitch,
      'include-origin-switch': originSwitch,
      'derivative-points-select': derivPts,
      'derivate-edges-switch': derivEdges,
      'save-settings-permanently-switch': savePermSwitch
    };

    global.__getElementByIdOverride = (id) => byId[id] || createEl();
    global.__querySelectorOverride = (sel) => byId[sel.replace(/^#/, '')] || createEl();
    global.__querySelectorAllOverride = () => [];

    ui.initSettingsModal();

    settingsBtn.dispatch('click');
    assert.equal(settingsModal.classList.contains('is-active'), true);

    // Modification des réglages + persistance
    sigDigits.value = '6';
    gridSwitch.checked = false;
    derivPts.value = '7';
    savePermSwitch.checked = true;

    saveBtn.dispatch('click');

    assert.equal(data.settings.significantDigits, 6);
    assert.equal(grapher.grid, false);
    assert.equal(calculation.derivatePoints, 7);
    assert.equal(spreadsheet.updateCount, 1);
    assert.equal(app.appliedCalcs.length, 1);
    assert.equal(settingsModal.classList.contains('is-active'), false);
    assert.equal(JSON.parse(localStorage.getItem('phyweb-settings')).significantDigits, 6);
  });

  it('initSaveModal permet de choisir le format (pw/csv/rw3) et déclenche saveFile + markAsSaved', () => {
    const emptyState = createEl('div', ['is-hidden']);
    const saveBtn = createEl('button');
    const downloadModal = createEl('div');
    const fileNameInput = createEl('input');
    const fileExtLabel = createEl('span');
    const pwBtn = createEl('button', ['is-link']);
    const csvBtn = createEl('button');
    const rw3Btn = createEl('button');
    const warningEl = createEl('p');
    const csvOptions = createEl('div', ['is-hidden']);
    const downloadFileBtn = createEl('button');

    const map = {
      '#save-button': saveBtn,
      '#download-modal': downloadModal,
      '#file-name-input': fileNameInput,
      '#file-extension-label': fileExtLabel,
      '#pw-button': pwBtn,
      '#csv-button': csvBtn,
      '#rw3-button': rw3Btn,
      '#save-format-warning': warningEl,
      '#csv-options': csvOptions,
      '#download-file-button': downloadFileBtn
    };

    global.__getElementByIdOverride = (id) => id === 'empty-state-container' ? emptyState : createEl();
    global.__querySelectorOverride = (sel) => map[sel] || createEl();

    ui.initSaveModal();

    saveBtn.dispatch('click');
    assert.equal(fileNameInput.value, 'session');
    assert.equal(fileExtLabel.textContent, '.pw');

    csvBtn.dispatch('click');
    assert.equal(fileExtLabel.textContent, '.csv');
    assert.equal(csvOptions.classList.contains('is-hidden'), false);
    assert.ok(warningEl.innerHTML.includes('CSV'));

    fileNameInput.value = 'mesures';
    downloadFileBtn.dispatch('click');

    assert.deepEqual(app.savedFiles, [{ name: 'mesures.csv', fmt: 'csv' }]);
    assert.equal(ui._markedSaved, true);
    assert.equal(common.modalManager.closedAll, 1);
  });

  it('initNewSessionModal crée les grandeurs et paramètres saisis puis ouvre le tableur', () => {
    const newFileBtn = createEl('button');
    const modal = createEl('div');
    const closeBtn = createEl('button');
    const skipBtn = createEl('button');
    const confirmBtn = createEl('button');
    const addGrandeurBtn = createEl('button');
    const addParamBtn = createEl('button');

    const makeRowMock = () => {
      const nameInput = createEl('input');
      const unitInput = createEl('input');
      const valueInput = createEl('input');
      const delBtn = createEl('button');
      const tr = createEl('tr');
      tr.querySelector = (sel) => {
        if (sel === '.name-input') return nameInput;
        if (sel === '.unit-input') return unitInput;
        if (sel === '.value-input') return valueInput;
        if (sel === '.delete-row-btn') return delBtn;
        return null;
      };
      tr.querySelectorAll = () => [nameInput, unitInput, valueInput];
      tr.closest = () => null;
      return tr;
    };

    const grandeursTbody = createEl('tbody');
    grandeursTbody.querySelectorAll = (sel) => sel === 'tr' ? grandeursTbody.children : [];
    const paramsTbody = createEl('tbody');
    paramsTbody.querySelectorAll = (sel) => sel === 'tr' ? paramsTbody.children : [];

    const byId = {
      'new-file-button': newFileBtn,
      'init-session-modal': modal,
      'init-session-close-button': closeBtn,
      'init-session-skip-btn': skipBtn,
      'init-session-confirm-btn': confirmBtn,
      'add-init-grandeur-btn': addGrandeurBtn,
      'add-init-parametre-btn': addParamBtn
    };

    global.__getElementByIdOverride = (id) => byId[id] || createEl();
    global.__querySelectorOverride = (sel) => {
      if (sel === '#init-grandeurs-table tbody') return grandeursTbody;
      if (sel === '#init-parametres-table tbody') return paramsTbody;
      return createEl();
    };
    global.__createElementOverride = (tag) => tag === 'tr' ? makeRowMock() : createEl(tag);

    ui.initNewSessionModal();

    // Ouverture : réinitialise la session et crée 2 lignes grandeurs + 1 ligne paramètre
    newFileBtn.dispatch('click');
    assert.equal(app.resetCount, 1);
    assert.equal(grandeursTbody.children.length, 2);
    assert.equal(paramsTbody.children.length, 1);

    // Remplissage
    grandeursTbody.children[0].querySelector('.name-input').value = 'u';
    grandeursTbody.children[0].querySelector('.unit-input').value = 'V';
    paramsTbody.children[0].querySelector('.name-input').value = 'R';
    paramsTbody.children[0].querySelector('.value-input').value = '100';
    paramsTbody.children[0].querySelector('.unit-input').value = 'Ohm';

    confirmBtn.dispatch('click');

    assert.deepEqual(app.addedCurves, [{ name: 'u', unit: 'V' }]);
    assert.equal(editor.getValue(), 'R_Ohm = 100');
    assert.equal(app.appliedCalcs.length, 1);
    assert.equal(ui._tabsShown, true);
    assert.deepEqual(spreadsheet.focusCalls, [true]);
  });
});
