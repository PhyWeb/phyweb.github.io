import '../helpers/setup.mjs';
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import Data, { Model } from '../../grapher/modules/data.js';
import Grapher from '../../grapher/modules/grapher.js';

function createClassList() {
  const set = new Set();
  return {
    add: (...cls) => cls.forEach(c => set.add(c)),
    remove: (...cls) => cls.forEach(c => set.delete(c)),
    contains: (c) => set.has(c)
  };
}

function createMockSvgEl() {
  return {
    destroyed: false,
    attr() { return this; },
    css() { return this; },
    add() { return this; },
    clip() { return this; },
    getBBox() { return { width: 40, height: 18 }; },
    translate() { return this; },
    destroy() { this.destroyed = true; }
  };
}

describe('Grapher - Outils interactifs et réticules (tests de caractérisation)', () => {
  let data;
  let grapher;
  let chartUpdates;

  beforeEach(() => {
    chartUpdates = [];
    data = new Data({ significantDigits: 4 });
    const x = data.addCurve('t', 's');
    x.push(0, 1, 2, 3);
    const y = data.addCurve('d', 'm');
    y.push(0, 2, 4, 6);

    const model = new Model(x, y, 'linear', data, '#2caffe');
    model.id = 'm1';
    model.visible = true;
    data.models.push(model);

    const dataPoint = { x: 2, y: 4, plotX: 200, plotY: 100 };

    grapher = new Grapher(data, { grapherGrid: true });
    grapher.currentXCurve = 't';
    grapher.chart = {
      plotLeft: 100,
      plotTop: 50,
      plotWidth: 400,
      plotHeight: 200,
      container: { classList: createClassList() },
      xAxis: [{
        min: 0, max: 4, dataMin: 0, dataMax: 3,
        toPixels: (v) => 100 + v * 100,
        toValue: (px) => (px - 100) / 100,
        getExtremes: () => ({ min: 0, max: 4 })
      }],
      yAxis: [{
        min: 0, max: 8, dataMin: 0, dataMax: 6,
        toPixels: (v) => 250 - v * 25,
        toValue: (py) => (250 - py) / 25,
        getExtremes: () => ({ min: 0, max: 8 })
      }],
      series: [
        { name: 'd', visible: true, options: {} },
        {
          name: 'Modèle (d)',
          visible: true,
          options: { id: 'model-m1' },
          points: [{ x: 1, y: 2 }, { x: 2, y: 4 }]
        }
      ],
      get: (id) => id === 'model-m1' ? {
        visible: true,
        points: [{ x: 1, y: 2 }, { x: 2, y: 4 }]
      } : null,
      pointer: {
        findNearestKDPoint: () => dataPoint
      },
      renderer: {
        path: () => createMockSvgEl(),
        circle: () => createMockSvgEl(),
        label: () => createMockSvgEl(),
        rect: () => createMockSvgEl(),
        clipRect: () => createMockSvgEl()
      },
      getSelectedPoints: () => [],
      update: (cfg) => chartUpdates.push(cfg)
    };
  });

  it('setCrosshairMode met à jour le curseur, les options Highcharts et nettoie les états actifs', () => {
    grapher.setCrosshairMode('free');
    assert.equal(grapher.crosshairMode, 'free');
    assert.equal(grapher.chart.container.classList.contains('chart-free-crosshair'), true);
    assert.equal(chartUpdates.at(-1).plotOptions.series.allowPointSelect, false);
    assert.equal(chartUpdates.at(-1).plotOptions.series.stickyTracking, false);

    grapher.setCrosshairMode('data');
    assert.equal(chartUpdates.at(-1).plotOptions.series.stickyTracking, true);

    grapher.setCrosshairMode(null);
    assert.equal(grapher.chart.container.classList.contains('chart-free-crosshair'), false);
    assert.equal(chartUpdates.at(-1).plotOptions.series.allowPointSelect, true);
  });

  it('drawFreeCrosshair dessine dans la zone de tracé et ignore hors zone', () => {
    grapher.drawFreeCrosshair({ chartX: 250, chartY: 150 });
    assert.ok(grapher.freeCrosshair);
    assert.ok(grapher.freeCrosshair.xLine);

    const oldLine = grapher.freeCrosshair.xLine;
    grapher.drawFreeCrosshair({ chartX: 10, chartY: 10 }); // hors plotBox
    assert.equal(oldLine.destroyed, true);
    assert.equal(grapher.freeCrosshair, null);
  });

  it('drawDataCrosshair et drawModelCrosshair s\'aimantent aux points valides', () => {
    grapher.drawDataCrosshair({ chartX: 300, chartY: 150 });
    assert.deepEqual(grapher.snappedDataPoint, { x: 2, y: 4 });
    assert.ok(grapher.freeCrosshair);

    grapher.drawModelCrosshair({ chartX: 300, chartY: 150 });
    assert.deepEqual(grapher.snappedModelPoint, { x: 2, y: 4 });
    assert.ok(grapher.freeCrosshair);

    grapher.hideFreeCrosshair();
    assert.equal(grapher.freeCrosshair, null);
  });
});
