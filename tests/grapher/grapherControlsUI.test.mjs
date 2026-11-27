import '../helpers/setup.mjs';
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import Data from '../../grapher/modules/data.js';
import UIManager from '../../grapher/modules/ui.js';

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
    classList: createClassList(initialClasses),
    addEventListener(type, fn) {
      if (!listeners[type]) listeners[type] = [];
      listeners[type].push(fn);
    },
    dispatch(type, event = {}) {
      (listeners[type] || []).forEach(fn => fn(event));
    },
    blur() {},
    appendChild(child) {
      this.children.push(child);
      return child;
    },
    querySelector: () => null,
    querySelectorAll: () => []
  };
}

describe('UIManager - Contrôles du grapheur (tests de caractérisation)', () => {
  let data;
  let grapher;
  let ui;

  beforeEach(() => {
    data = new Data();
    data.addCurve('t', 's');
    data.addCurve('x', 'm');
    data.addCurve('v', 'm/s');

    grapher = {
      currentXCurve: 't',
      zoomCalls: [],
      resetZoomCalls: 0,
      setXCurveCalls: [],
      crosshairModeCalls: [],
      chart: {
        container: createEl('div'),
        updates: [],
        update(cfg) { this.updates.push(cfg); }
      },
      zoom(dir) { this.zoomCalls.push(dir); },
      resetZoom() { this.resetZoomCalls++; },
      setXCurve(title) { this.currentXCurve = title; this.setXCurveCalls.push(title); },
      setCrosshairMode(mode) { this.crosshairModeCalls.push(mode); }
    };

    ui = new UIManager({}, data, grapher, {}, {}, {});
  });

  afterEach(() => {
    global.__querySelectorOverride = null;
    global.__querySelectorAllOverride = null;
    global.__getElementByIdOverride = null;
    global.__createElementOverride = null;
  });

  it('initZoomControls active/désactive le zoom rectangle et déclenche zoom in/out/auto', () => {
    const zoomBtn = createEl('button');
    const autoZoomBtn = createEl('button');
    const zoomInBtn = createEl('button');
    const zoomOutBtn = createEl('button');

    const map = {
      '#zoom-button': zoomBtn,
      '#auto-zoom-button': autoZoomBtn,
      '#zoom-in-button': zoomInBtn,
      '#zoom-out-button': zoomOutBtn
    };
    global.__querySelectorOverride = (sel) => map[sel] || null;
    global.__querySelectorAllOverride = () => [];
    global.__getElementByIdOverride = (id) => id === 'zoom-button' ? zoomBtn : null;

    ui.initZoomControls();

    // Activation zoom rectangle
    zoomBtn.dispatch('click');
    assert.equal(ui.isZoomEnabled, true);
    assert.equal(zoomBtn.classList.contains('is-active'), true);
    assert.equal(grapher.chart.container.classList.contains('chart-free-crosshair'), true);
    assert.equal(grapher.chart.updates.at(-1).chart.zooming.type, 'xy');

    // Désactivation zoom rectangle
    zoomBtn.dispatch('click');
    assert.equal(ui.isZoomEnabled, false);
    assert.equal(zoomBtn.classList.contains('is-active'), false);
    assert.equal(grapher.chart.updates.at(-1).chart.zooming.type, null);

    // Zoom in / out / auto
    zoomInBtn.dispatch('click');
    zoomOutBtn.dispatch('click');
    autoZoomBtn.dispatch('click');
    assert.deepEqual(grapher.zoomCalls, ['in', 'out']);
    assert.equal(grapher.resetZoomCalls, 1);

    // resetZoomUI remet tout à zéro
    ui.isZoomEnabled = true;
    zoomBtn.classList.add('is-active');
    ui.resetZoomUI();
    assert.equal(ui.isZoomEnabled, false);
    assert.equal(zoomBtn.classList.contains('is-active'), false);
  });

  it('initXAxisSelector et updateXAxisSelector synchronisent l\'abscisse et les icônes de modèles', () => {
    const select = createEl('select');
    global.__querySelectorOverride = (sel) => sel === '#xaxis-select' ? select : createEl();
    global.__createElementOverride = (tag) => createEl(tag);

    let iconsUpdated = 0;
    ui.updateAllModelPanelVisibilityIcons = () => { iconsUpdated++; };

    ui.updateXAxisSelector();
    assert.deepEqual(select.children.map(o => o.value), ['t', 'x', 'v']);
    assert.equal(select.value, 't');

    ui.initXAxisSelector();
    select.value = 'x';
    select.dispatch('change', { target: select });

    assert.deepEqual(grapher.setXCurveCalls, ['x']);
    assert.equal(iconsUpdated, 1);
  });
});
