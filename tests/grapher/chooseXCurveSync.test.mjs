import '../helpers/setup.mjs';
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import Data from '../../grapher/modules/data.js';
import UIManager from '../../grapher/modules/ui.js';

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
    }
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

describe('Modale « Courbes » - Synchronisation de #xaxis-select lors du changement d’abscisse', () => {
  afterEach(() => {
    delete global.__querySelectorOverride;
    delete global.__getElementByIdOverride;
    delete global.__createElementOverride;
  });

  it('appelle updateXAxisSelector() et synchronise #xaxis-select lors d’un changement dans #choose-x-curve-select', () => {
    const xaxisSelect = createElementMock('select');
    const chooseXCurveSelect = createElementMock('select');
    const chooseCurvesMenu = createElementMock('ul');
    const curveDetailsPanel = createElementMock('div');
    const chooseCurvesModal = createElementMock('div');

    const elementsById = {
      curveColorPicker: createElementMock('select'),
      curveLineWidthSelect: createElementMock('select'),
      curveMarkerRadiusSelect: createElementMock('select')
    };

    const elementsBySelector = {
      '#xaxis-select': xaxisSelect,
      '#choose-curves-button': createElementMock('button'),
      '#choose-curves-menu': chooseCurvesMenu,
      '#choose-x-curve-select': chooseXCurveSelect,
      '#curve-details-panel': curveDetailsPanel,
      '#choose-curves-modal': chooseCurvesModal,
      '#choose-curves-confirm-button': createElementMock('button'),
      '#curveColorPicker': elementsById.curveColorPicker,
      '#curveMarkerToggle': createElementMock('input'),
      '#curveMarkerRadiusSelect': elementsById.curveMarkerRadiusSelect,
      '#curveMarkerSymbolSelect': createElementMock('select'),
      '#curveLineToggle': createElementMock('input'),
      '#curveLineWidthSelect': elementsById.curveLineWidthSelect,
      '#curveLineStyleSelect': createElementMock('select')
    };

    global.__createElementOverride = (tag) => {
      const el = createElementMock(tag);
      return el;
    };
    global.__getElementByIdOverride = (id) => elementsById[id] || createElementMock('div');
    global.__querySelectorOverride = (sel) => {
      if (elementsBySelector[sel]) return elementsBySelector[sel];
      const match = sel.match(/^#choose-curves-menu a\[data-title="([^"]+)"\]$/);
      if (match) {
        return findFirst(chooseCurvesMenu, c => c.tagName === 'A' && c.dataset.title === match[1]);
      }
      return createElementMock('div');
    };

    const data = new Data({ significantDigits: 4 });
    const curveT = data.addCurve('t', 's');
    const curveU = data.addCurve('u', 'V');
    curveT.push(0, 1, 2);
    curveU.push(0, 2, 4);

    const mockGrapher = {
      currentXCurve: 't',
      chart: {
        series: [
          { name: 'u', visible: true }
        ]
      },
      setXCurve: (title) => {
        mockGrapher.currentXCurve = title;
      },
      setVisibilityFromList: () => {}
    };

    const ui = new UIManager({ modalManager: { closeAllModals: () => {} } }, data, mockGrapher, {}, {}, {});
    ui.initChooseCurvesModal();

    // Initialement, #xaxis-select est configuré
    ui.updateXAxisSelector();
    assert.equal(xaxisSelect.value, 't');

    // On simule l'ouverture de la modale
    elementsBySelector['#choose-curves-button'].click();
    assert.equal(chooseXCurveSelect.value, 't');

    // Changement de l'abscisse dans la modale vers 'u'
    chooseXCurveSelect.value = 'u';
    chooseXCurveSelect.dispatchEvent({ type: 'change', target: chooseXCurveSelect });

    // Vérification que le grapheur a bien reçu la nouvelle abscisse
    assert.equal(mockGrapher.currentXCurve, 'u');

    // Vérification que le sélecteur #xaxis-select sous le graphe est maintenant synchronisé sur 'u'
    assert.equal(xaxisSelect.value, 'u');
  });
});
