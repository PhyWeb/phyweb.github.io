import '../helpers/setup.mjs';
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import App from '../../grapher/modules/app.js';
import Data, { Model } from '../../grapher/modules/data.js';
import Grapher from '../../grapher/modules/grapher.js';

function createMockRendererEl(initialAttrs = {}) {
  const el = {
    attrs: { ...initialAttrs },
    destroyed: false,
    attr(obj) {
      Object.assign(this.attrs, obj);
      return this;
    },
    css() {
      return this;
    },
    add() {
      return this;
    },
    destroy() {
      this.destroyed = true;
    }
  };
  return el;
}

function createMockChart({ plotLeft = 50, plotTop = 20, plotWidth = 400, plotHeight = 300, min = 0, max = 10 } = {}) {
  const events = {};
  const chart = {
    plotLeft,
    plotTop,
    plotWidth,
    plotHeight,
    xAxis: [],
    yAxis: [],
    series: [],
    container: {
      classList: {
        classes: new Set(),
        add(c) { this.classes.add(c); },
        remove(c) { this.classes.delete(c); },
        contains(c) { return this.classes.has(c); }
      },
      addEventListener() {}
    },
    pointer: {
      getChartPosition: () => ({ left: 0, top: 0 })
    },
    renderer: {
      rect: (x, y, width, height) => createMockRendererEl({ x, y, width, height }),
      path: (d) => createMockRendererEl({ d }),
      label: () => createMockRendererEl()
    },
    customArrows: [],
    renderedAnnotations: [],
    get: () => null,
    getSelectedPoints: () => [],
    options: {},
    update() {},
    redraw() {
      (events.redraw || []).forEach(fn => fn.call(this));
    },
    _events: events
  };

  chart.xAxis.push({
    min,
    max,
    dataMin: min,
    dataMax: max,
    exponent: 0,
    toPixels(val) {
      return chart.plotLeft + ((val - this.min) / (this.max - this.min)) * chart.plotWidth;
    },
    toValue(px) {
      return this.min + ((px - chart.plotLeft) / chart.plotWidth) * (this.max - this.min);
    },
    getExtremes() {
      return { min: this.min, max: this.max, dataMin: this.dataMin, dataMax: this.dataMax };
    }
  });
  chart.yAxis.push({
    min: 0,
    max: 10,
    dataMin: 0,
    dataMax: 10,
    exponent: 0,
    toPixels(val) {
      return chart.plotTop + chart.plotHeight - ((val - this.min) / (this.max - this.min)) * chart.plotHeight;
    }
  });

  return chart;
}

describe('Correction Bug C - Mode edit-bounds (suppression modèle, bornes invalides, Calculs UI, redraw)', () => {
  let toastLog;
  let origQuerySelectorOverride;
  let origCreateElementOverride;
  let origGetElementByIdOverride;
  let origHighchartsAddEvent;
  let origHighchartsChart;

  beforeEach(() => {
    toastLog = [];
    origQuerySelectorOverride = global.__querySelectorOverride;
    origCreateElementOverride = global.__createElementOverride;
    origGetElementByIdOverride = global.__getElementByIdOverride;
    origHighchartsAddEvent = global.Highcharts.addEvent;
    origHighchartsChart = global.Highcharts.chart;

    global.__querySelectorOverride = (sel) => {
      if (sel === '.toast-container') return null;
      return {
        classList: { add: () => {}, remove: () => {}, toggle: () => {}, contains: () => false },
        style: {},
        innerHTML: '',
        remove: () => {}
      };
    };

    global.__createElementOverride = (tag) => ({
      tagName: tag,
      className: '',
      innerHTML: '',
      style: {},
      appendChild: (child) => {
        if (child && child.innerHTML) {
          toastLog.push({ className: child.className, innerHTML: child.innerHTML });
        }
      },
      remove: () => {}
    });

    global.__getElementByIdOverride = () => ({
      classList: { add: () => {}, remove: () => {}, toggle: () => {}, contains: () => false },
      innerHTML: '',
      style: {}
    });
  });

  afterEach(() => {
    global.__querySelectorOverride = origQuerySelectorOverride;
    global.__createElementOverride = origCreateElementOverride;
    global.__getElementByIdOverride = origGetElementByIdOverride;
    global.Highcharts.addEvent = origHighchartsAddEvent;
    global.Highcharts.chart = origHighchartsChart;
  });

  it('App.deleteModel() doit quitter le mode edit-bounds et détruire les poignées du modèle supprimé', () => {
    const data = new Data({ significantDigits: 4 });
    const x = data.addCurve('x', 'm');
    const y = data.addCurve('y', 's');
    x.push(0, 1, 2, 3);
    y.push(0, 2, 4, 6);

    const model = new Model(x, y, 'affine', data, '#ff0000', true, 2, 'Solid');
    model.parameters = [{ name: 'a', value: 2 }, { name: 'b', value: 0 }];
    data.models.push(model);

    const grapher = new Grapher(data, {});
    grapher.chart = createMockChart();

    grapher.setCrosshairMode('edit-bounds');
    grapher.editingModel = model;
    grapher.drawModelBounds(model);
    assert.ok(grapher.modelBoundsElements, 'Les poignées doivent être créées');

    const mockUI = {
      updateCalculationUI: () => {},
      updateRecalculateButtonVisibility: () => {},
      updateModelToolVisibility: () => {},
      updateSortUI: () => {},
      updateXAxisSelector: () => {}
    };
    const mockSpreadsheet = { build: () => {}, update: () => {} };
    const app = new App(data, mockSpreadsheet, grapher, null, null, mockUI);

    app.deleteModel(model.id);

    assert.equal(grapher.crosshairMode, null, 'Le mode edit-bounds doit être quitté');
    assert.equal(grapher.editingModel, null, 'editingModel doit être réinitialisé à null');
    assert.equal(grapher.modelBoundsElements, null, 'modelBoundsElements doit être nettoyé');
  });

  it('App.deleteModel() ne doit pas quitter edit-bounds si un autre modèle est supprimé', () => {
    const data = new Data({ significantDigits: 4 });
    const x = data.addCurve('x', 'm');
    const y = data.addCurve('y', 's');
    x.push(0, 1, 2, 3);
    y.push(0, 2, 4, 6);

    const model1 = new Model(x, y, 'affine', data, '#ff0000', true, 2, 'Solid');
    const model2 = new Model(x, y, 'linear', data, '#0000ff', true, 2, 'Solid');
    data.models.push(model1, model2);

    const grapher = new Grapher(data, {});
    grapher.chart = createMockChart();
    grapher.setCrosshairMode('edit-bounds');
    grapher.editingModel = model1;
    grapher.drawModelBounds(model1);

    const mockUI = {
      updateCalculationUI: () => {},
      updateRecalculateButtonVisibility: () => {},
      updateModelToolVisibility: () => {}
    };
    const mockSpreadsheet = { build: () => {}, update: () => {} };
    const app = new App(data, mockSpreadsheet, grapher, null, null, mockUI);

    app.deleteModel(model2.id);

    assert.equal(grapher.crosshairMode, 'edit-bounds');
    assert.equal(grapher.editingModel, model1);
    assert.ok(grapher.modelBoundsElements);
  });

  it('App.deleteCurve() sur une courbe Y dépendante doit quitter edit-bounds', () => {
    const data = new Data({ significantDigits: 4 });
    const x = data.addCurve('x', 'm');
    const y = data.addCurve('y', 's');
    x.push(0, 1, 2, 3);
    y.push(0, 2, 4, 6);

    const model = new Model(x, y, 'affine', data, '#ff0000', true, 2, 'Solid');
    data.models.push(model);

    const grapher = new Grapher(data, {});
    grapher.chart = createMockChart();
    grapher.currentXCurve = 'x';
    grapher.setCrosshairMode('edit-bounds');
    grapher.editingModel = model;
    grapher.drawModelBounds(model);

    const mockUI = {
      updateCalculationUI: () => {},
      updateRecalculateButtonVisibility: () => {},
      updateModelToolVisibility: () => {},
      updateSortUI: () => {},
      updateXAxisSelector: () => {}
    };
    const mockSpreadsheet = { build: () => {}, update: () => {} };
    const app = new App(data, mockSpreadsheet, grapher, null, null, mockUI);

    app.deleteCurve('y');

    assert.equal(data.models.length, 0);
    assert.equal(grapher.crosshairMode, null);
    assert.equal(grapher.editingModel, null);
    assert.equal(grapher.modelBoundsElements, null);
  });

  it('handleMouseUp() en edit-bounds doit restaurer les anciennes bornes et afficher un toast si fit() échoue (< 2 points)', async () => {
    const data = new Data({ significantDigits: 4 });
    const x = data.addCurve('x', 'm');
    const y = data.addCurve('y', 's');
    x.push(0, 1, 2, 3, 4);
    y.push(0, 2, 4, 6, 8);

    const model = new Model(x, y, 'affine', data, '#ff0000', true, 2, 'Solid');
    model.minX = 0.5;
    model.maxX = 3.5;
    model.fit = () => Promise.reject(new Error('Pas assez de données valides.'));
    data.models.push(model);

    const grapher = new Grapher(data, {});
    grapher.chart = createMockChart({ min: 0, max: 4 });
    grapher.showLoading = () => {};
    grapher.hideLoading = () => {};
    grapher.setCrosshairMode('edit-bounds');
    grapher.editingModel = model;
    grapher.drawModelBounds(model);

    // Simulation d'un glissement ayant rapproché minX trop près de maxX
    grapher.isDragging = true;
    grapher.draggingBound = 'min';
    grapher.previousModelBounds = { minX: 0.5, maxX: 3.5 };
    model.minX = 3.4;

    const origConsoleError = console.error;
    console.error = () => {};
    try {
      grapher.handleMouseUp({});
      await new Promise(resolve => setTimeout(resolve, 0));
    } finally {
      console.error = origConsoleError;
    }

    assert.equal(model.minX, 0.5, 'minX doit être restauré à son ancienne valeur valide');
    assert.equal(model.maxX, 3.5, 'maxX doit rester à son ancienne valeur valide');
    assert.equal(toastLog.length, 1, 'Un toast d\'avertissement doit être affiché');
    assert.ok(toastLog[0].className.includes('is-warning'));
    assert.ok(toastLog[0].innerHTML.includes('Pas assez de données valides.'));

    // Vérifier que les poignées visuelles ont été replacées à x = 0.5 -> px = 50 + (0.5/4)*400 = 100
    assert.equal(grapher.modelBoundsElements.band.attrs.x, 100);
  });

  it('handleMouseUp() en edit-bounds doit appeler updateModelPanel() ET updateCalculationUI() quand fit() réussit', async () => {
    const data = new Data({ significantDigits: 4 });
    const x = data.addCurve('x', 'm');
    const y = data.addCurve('y', 's');
    x.push(0, 1, 2, 3, 4);
    y.push(0, 2, 4, 6, 8);

    const model = new Model(x, y, 'affine', data, '#ff0000', true, 2, 'Solid');
    model.minX = 1;
    model.maxX = 4;
    model.fit = () => Promise.resolve(model);
    data.models.push(model);

    let panelUpdatedModel = null;
    let calcUIUpdated = 0;

    const grapher = new Grapher(data, {});
    grapher.chart = createMockChart({ min: 0, max: 4 });
    grapher.showLoading = () => {};
    grapher.hideLoading = () => {};
    grapher.updateModels = () => {};
    grapher.setUIManager({
      updateModelPanel: (m) => { panelUpdatedModel = m; },
      updateCalculationUI: () => { calcUIUpdated += 1; }
    });
    grapher.setCrosshairMode('edit-bounds');
    grapher.editingModel = model;
    grapher.drawModelBounds(model);

    grapher.isDragging = true;
    grapher.draggingBound = 'min';
    grapher.previousModelBounds = { minX: 1, maxX: 4 };

    grapher.handleMouseUp({});
    await new Promise(resolve => setTimeout(resolve, 0));

    assert.equal(panelUpdatedModel, model);
    assert.equal(calcUIUpdated, 1, 'updateCalculationUI doit être appelé après le recalcul réussi');
  });

  it('redraw du graphique pendant edit-bounds doit rafraîchir les coordonnées et dimensions des poignées', () => {
    const data = new Data({ significantDigits: 4 });
    const x = data.addCurve('x', 'm');
    const y = data.addCurve('y', 's');
    x.push(0, 2, 4, 6, 8, 10);
    y.push(0, 2, 4, 6, 8, 10);

    const model = new Model(x, y, 'affine', data, '#ff0000', true, 2, 'Solid');
    model.minX = 2;
    model.maxX = 8;
    data.models.push(model);

    const chart = createMockChart({ plotLeft: 50, plotTop: 20, plotWidth: 400, plotHeight: 300, min: 0, max: 10 });
    global.Highcharts.addEvent = (target, eventName, handler) => {
      if (target && target._events) {
        target._events[eventName] = target._events[eventName] || [];
        target._events[eventName].push(handler);
      }
    };
    global.Highcharts.chart = (containerId, options) => {
      if (options?.chart?.events?.load) {
        options.chart.events.load.call(chart);
      }
      return chart;
    };

    const grapher = new Grapher(data, {});
    grapher.newChart();
    grapher.setCrosshairMode('edit-bounds');
    grapher.editingModel = model;
    grapher.drawModelBounds(model);

    // Position initiale: [2, 8] sur [0, 10] avec plotLeft=50, plotWidth=400 -> x=130, width=240
    assert.equal(grapher.modelBoundsElements.band.attrs.x, 130);
    assert.equal(grapher.modelBoundsElements.band.attrs.width, 240);

    // Simulation d'un redimensionnement / zoom modifiant la géométrie et les bornes d'axe
    chart.plotWidth = 800;
    chart.plotTop = 40;
    chart.plotHeight = 500;
    chart.xAxis[0].min = 0;
    chart.xAxis[0].max = 20;
    chart.redraw();

    // Nouvelle position attendue: [2, 8] sur [0, 20] avec plotLeft=50, plotWidth=800 -> x=130, width=240; y=40, height=500
    assert.equal(grapher.modelBoundsElements.band.attrs.x, 130);
    assert.equal(grapher.modelBoundsElements.band.attrs.width, 240);
    assert.equal(grapher.modelBoundsElements.band.attrs.y, 40);
    assert.equal(grapher.modelBoundsElements.band.attrs.height, 500);
    assert.deepEqual(grapher.modelBoundsElements.rightHandle.attrs.d, ['M', 370, 40, 'L', 370, 540]);
  });

  it('handleMouseUp() ne doit pas réintroduire les paramètres si le modèle est supprimé pendant fit()', async () => {
    const data = new Data({ significantDigits: 4 });
    const x = data.addCurve('x', 'm');
    const y = data.addCurve('y', 's');
    x.push(0, 1, 2, 3, 4);
    y.push(0, 2, 4, 6, 8);

    const model = new Model(x, y, 'affine', data, '#ff0000', true, 2, 'Solid');
    model.parameters = [{ name: 'a', value: 2 }, { name: 'b', value: 0 }];
    data.parameters.a = { value: 2, unit: '', type: 'model' };
    data.parameters.b = { value: 0, unit: '', type: 'model' };
    data.models.push(model);

    let resolveFit;
    model.fit = () => new Promise(resolve => {
      resolveFit = () => {
        data.parameters.a = { value: 2, unit: '', type: 'model' };
        data.parameters.b = { value: 0, unit: '', type: 'model' };
        resolve(model);
      };
    });

    let updateModelsCalled = 0;
    let updatePanelCalled = 0;

    const grapher = new Grapher(data, {});
    grapher.chart = createMockChart({ min: 0, max: 4 });
    grapher.showLoading = () => {};
    grapher.hideLoading = () => {};
    grapher.updateModels = () => { updateModelsCalled += 1; };
    grapher.setUIManager({
      updateModelPanel: () => { updatePanelCalled += 1; },
      updateCalculationUI: () => {},
      updateRecalculateButtonVisibility: () => {},
      updateModelToolVisibility: () => {}
    });

    const mockSpreadsheet = { build: () => {}, update: () => {} };
    const app = new App(data, mockSpreadsheet, grapher, null, null, grapher.uiManager);

    grapher.setCrosshairMode('edit-bounds');
    grapher.editingModel = model;
    grapher.drawModelBounds(model);
    grapher.isDragging = true;
    grapher.draggingBound = 'min';
    grapher.previousModelBounds = { minX: null, maxX: null };

    grapher.handleMouseUp({});

    // Suppression du modèle pendant le calcul asynchrone
    app.deleteModel(model.id);
    resolveFit();
    await new Promise(resolve => setTimeout(resolve, 0));

    assert.equal(updateModelsCalled, 0);
    assert.equal(updatePanelCalled, 0);
    assert.equal(data.parameters.a, undefined);
    assert.equal(data.parameters.b, undefined);
  });
});
