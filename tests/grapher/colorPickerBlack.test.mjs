import '../helpers/setup.mjs';
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import Data, { Model } from '../../grapher/modules/data.js';
import UIManager, { getCustomizationColors, populateColorSelect } from '../../grapher/modules/ui.js';

function createElementMock(tag = 'div') {
  const listeners = {};
  const classes = new Set();
  const attributes = {};
  const children = [];

  const el = {
    tagName: tag.toUpperCase(),
    value: '',
    innerHTML: '',
    textContent: '',
    checked: false,
    disabled: false,
    type: '',
    id: '',
    style: {},
    dataset: {},
    className: '',
    children,
    classList: {
      add: (...cls) => cls.forEach(c => classes.add(c)),
      remove: (...cls) => cls.forEach(c => classes.delete(c)),
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
    setAttribute: (k, v) => { attributes[k] = String(v); },
    getAttribute: (k) => attributes[k] ?? null,
    appendChild: (child) => {
      child.parentNode = el;
      children.push(child);
      return child;
    },
    addEventListener: (type, fn) => {
      if (!listeners[type]) listeners[type] = [];
      listeners[type].push(fn);
    },
    dispatchEvent: (event) => {
      const evt = event || { type: 'click', target: el };
      if (!evt.target) evt.target = el;
      if (!evt.stopPropagation) evt.stopPropagation = () => {};
      if (!evt.preventDefault) evt.preventDefault = () => {};
      if (listeners[evt.type]) {
        listeners[evt.type].forEach(fn => fn(evt));
      }
    },
    click: () => el.dispatchEvent({ type: 'click', target: el }),
    querySelector: (sel) => {
      if (sel === 'a') return findFirst(el, c => c.tagName === 'A');
      if (sel === 'input:checked') return findFirst(el, c => c.tagName === 'INPUT' && c.checked);
      if (sel === 'span:nth-child(2)') return el.children[1] || null;
      return null;
    },
    querySelectorAll: (sel) => {
      if (sel === 'a') return findAll(el, c => c.tagName === 'A');
      return [];
    },
    closest: (sel) => {
      if (sel === 'a') {
        let cur = el;
        while (cur) {
          if (cur.tagName === 'A') return cur;
          cur = cur.parentNode;
        }
      }
      return null;
    },
    cloneNode: () => createElementMock(tag)
  };
  return el;
}

function findFirst(root, predicate) {
  for (const child of root.children || []) {
    if (predicate(child)) return child;
    const nested = findFirst(child, predicate);
    if (nested) return nested;
  }
  return null;
}

function findAll(root, predicate, out = []) {
  for (const child of root.children || []) {
    if (predicate(child)) out.push(child);
    findAll(child, predicate, out);
  }
  return out;
}

describe('Options de couleur noir (#000000) dans /grapher', () => {
  let origGetOptions;

  beforeEach(() => {
    origGetOptions = global.Highcharts.getOptions;
  });

  afterEach(() => {
    global.Highcharts.getOptions = origGetOptions;
    delete global.__querySelectorOverride;
    delete global.__getElementByIdOverride;
    delete global.__createElementOverride;
  });

  it('getCustomizationColors inclut #000000 sans muter Highcharts.getOptions().colors ni dupliquer le noir', () => {
    const base = ['#2caffe', '#544fc5'];
    global.Highcharts.getOptions = () => ({ colors: base });

    const colors = getCustomizationColors();
    assert.deepEqual(colors, ['#2caffe', '#544fc5', '#000000']);
    assert.deepEqual(base, ['#2caffe', '#544fc5']);

    global.Highcharts.getOptions = () => ({ colors: ['#2caffe', '#000000'] });
    assert.deepEqual(getCustomizationColors(), ['#2caffe', '#000000']);
  });

  it('populateColorSelect génère une option noire (#000000)', () => {
    global.__createElementOverride = (tag) => createElementMock(tag);
    const select = createElementMock('select');
    populateColorSelect(select);

    const blackOption = select.children.find(opt => opt.value === '#000000');
    assert.ok(blackOption, 'Une option #000000 doit être ajoutée');
    assert.equal(blackOption.style.color, '#000000');
    assert.equal(blackOption.textContent, '■■■■■■■■■');
  });

  it('initChooseCurvesModal propose le noir (#000000) et permet de l’appliquer à une grandeur', () => {
    const elementsById = {
      curveColorPicker: createElementMock('select'),
      curveLineWidthSelect: createElementMock('select'),
      curveMarkerRadiusSelect: createElementMock('select')
    };
    const elementsBySelector = {
      '#choose-curves-button': createElementMock('button'),
      '#choose-curves-menu': createElementMock('ul'),
      '#choose-x-curve-select': createElementMock('select'),
      '#curve-details-panel': createElementMock('div'),
      '#choose-curves-modal': createElementMock('div'),
      '#choose-curves-confirm-button': createElementMock('button'),
      '#curveColorPicker': elementsById.curveColorPicker,
      '#curveMarkerToggle': createElementMock('input'),
      '#curveMarkerRadiusSelect': elementsById.curveMarkerRadiusSelect,
      '#curveMarkerSymbolSelect': createElementMock('select'),
      '#curveLineToggle': createElementMock('input'),
      '#curveLineWidthSelect': elementsById.curveLineWidthSelect,
      '#curveLineStyleSelect': createElementMock('select')
    };

    global.__createElementOverride = (tag) => createElementMock(tag);
    global.__getElementByIdOverride = (id) => elementsById[id] || createElementMock('div');
    global.__querySelectorOverride = (sel) => {
      if (elementsBySelector[sel]) return elementsBySelector[sel];
      const match = sel.match(/^#choose-curves-menu a\[data-title="([^"]+)"\]$/);
      if (match) {
        return findFirst(elementsBySelector['#choose-curves-menu'], c => c.tagName === 'A' && c.dataset.title === match[1]);
      }
      return createElementMock('div');
    };

    const data = new Data({ significantDigits: 4 });
    const curveX = data.addCurve('t', 's');
    const curveY = data.addCurve('u', 'V');
    curveX.push(0, 1);
    curveY.push(0, 5);

    let lastSeriesUpdate = null;
    const mockGrapher = {
      currentXCurve: 't',
      chart: {
        series: [
          {
            name: 'u',
            visible: true,
            update: (opts) => { lastSeriesUpdate = opts; }
          }
        ]
      },
      setVisibilityFromList: () => {}
    };

    const ui = new UIManager({ modalManager: { closeAllModals: () => {} } }, data, mockGrapher, {}, {}, {});
    ui.initChooseCurvesModal();

    elementsBySelector['#choose-curves-button'].click();

    const picker = elementsById.curveColorPicker;
    const blackOption = picker.children.find(opt => opt.value === '#000000');
    assert.ok(blackOption, 'Le sélecteur de couleur des grandeurs doit contenir #000000');

    picker.id = 'curveColorPicker';
    picker.value = '#000000';
    elementsBySelector['#choose-curves-modal'].dispatchEvent({ type: 'change', target: picker });

    assert.equal(curveY.color, '#000000');
    assert.equal(picker.style.color, '#000000');
    assert.equal(lastSeriesUpdate.color, '#000000');
    const curveAnchor = findFirst(elementsBySelector['#choose-curves-menu'], c => c.tagName === 'A' && c.dataset.title === 'u');
    assert.equal(curveAnchor.children[1].style.backgroundColor, '#000000');
  });

  it('openEditModelModal propose le noir (#000000) et permet de l’enregistrer sur un modèle', async () => {
    const colorPicker = createElementMock('select');
    const saveButtonParent = createElementMock('div');
    let currentSaveButton = null;
    saveButtonParent.replaceChild = (newBtn) => {
      currentSaveButton = newBtn;
    };
    const saveButton = createElementMock('button');
    saveButton.parentNode = saveButtonParent;

    const elementsBySelector = {
      '#edit-model-modal': createElementMock('div'),
      '#model-edit-color-picker': colorPicker,
      '#model-edit-linewidth-select': createElementMock('select'),
      '#model-edit-linestyle-select': createElementMock('select'),
      '#model-edit-borne-debut-input': createElementMock('input'),
      '#model-edit-borne-fin-input': createElementMock('input'),
      '#model-edit-borne-tout-checkbox': createElementMock('input'),
      '#model-edit-parameters-container': createElementMock('div'),
      '#model-edit-save-button': saveButton,
      '#model-edit-delete-button': (() => {
        const btn = createElementMock('button');
        btn.parentNode = { replaceChild: () => {} };
        return btn;
      })()
    };

    global.__createElementOverride = (tag) => createElementMock(tag);
    global.__querySelectorOverride = (sel) => {
      if (elementsBySelector[sel]) return elementsBySelector[sel];
      const match = sel.match(/^#choose-curves-menu a\[data-title="([^"]+)"\]$/);
      if (match) {
        return findFirst(elementsBySelector['#choose-curves-menu'], c => c.tagName === 'A' && c.dataset.title === match[1]);
      }
      return createElementMock('div');
    };

    const data = new Data({ significantDigits: 4 });
    const curveX = data.addCurve('x', 'm');
    const curveY = data.addCurve('y', 'N');
    curveX.push(0, 1, 2);
    curveY.push(0, 2, 4);

    let updatedModelSeries = null;
    const mockGrapher = {
      showLoading: () => {},
      hideLoading: () => {},
      updateModelVisibility: () => {},
      updateModels: () => {},
      chart: {
        get: () => ({
          update: (opts) => { updatedModelSeries = opts; }
        })
      }
    };

    const ui = new UIManager({ modalManager: { closeAllModals: () => {} } }, data, mockGrapher, {}, {}, {});
    ui.setApp({ symbolValidator: { validate: () => ({ isValid: true }) } });
    ui.updateModelPanel = () => {};
    ui.updateCalculationUI = () => {};

    const model = new Model(curveX, curveY, 'linear', data, '#2caffe', true, 2, 'Solid');
    model.parameters = [];
    data.models.push(model);

    ui.openEditModelModal(model);

    const blackOption = colorPicker.children.find(opt => opt.value === '#000000');
    assert.ok(blackOption, 'Le sélecteur de couleur des modèles doit contenir #000000');

    colorPicker.value = '#000000';
    colorPicker.onchange.call(colorPicker);
    assert.equal(colorPicker.style.color, '#000000');

    await currentSaveButton.onclick();
    assert.equal(model.color, '#000000');
    assert.equal(updatedModelSeries.color, '#000000');
  });
});
