import '../helpers/setup.mjs';
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import Data from '../../grapher/modules/data.js';
import Grapher from '../../grapher/modules/grapher.js';

function createMockSvgEl() {
  const el = {
    destroyed: false,
    attrs: {},
    cssProps: {},
    clipped: false,
    attr(a) { Object.assign(this.attrs, a); return this; },
    css(c) { Object.assign(this.cssProps, c); return this; },
    add() { return this; },
    clip() { this.clipped = true; return this; },
    getBBox() { return { width: 50, height: 20 }; },
    translate(x, y) { this.tx = x; this.ty = y; return this; },
    destroy() { this.destroyed = true; }
  };
  return el;
}

function createMockChart(series = []) {
  const xAxis = {
    min: 0,
    max: 10,
    getExtremes: () => ({ min: 0, max: 10 }),
    toPixels: (v) => 100 + v * 40,
    toValue: (px) => (px - 100) / 40
  };
  const yAxis = {
    min: 0,
    max: 10,
    getExtremes: () => ({ min: 0, max: 10 }),
    toPixels: (v) => 300 - v * 20,
    toValue: (py) => (300 - py) / 20
  };

  return {
    plotLeft: 100,
    plotTop: 100,
    plotWidth: 400,
    plotHeight: 200,
    xAxis: [xAxis],
    yAxis: [yAxis],
    series,
    redrawCount: 0,
    redraw() { this.redrawCount++; },
    renderer: {
      path: () => createMockSvgEl(),
      circle: () => createMockSvgEl(),
      label: () => createMockSvgEl(),
      rect: () => createMockSvgEl(),
      clipRect: () => createMockSvgEl()
    }
  };
}

describe('Grapher - Clipping géométrique et rendu des annotations (tests de caractérisation)', () => {
  let data;
  let grapher;

  beforeEach(() => {
    data = new Data({ significantDigits: 4 });
    const x = data.addCurve('V', 'mL');
    x.push(0, 5, 10);
    const y = data.addCurve('pH', '');
    y.push(2, 7, 12);

    grapher = new Grapher(data, { grapherGrid: true });
    grapher.currentXCurve = 'V';
    grapher.chart = createMockChart([
      {
        name: 'pH',
        visible: true,
        yAxis: { index: 0 },
        userOptions: { unit: '' },
        options: { data: [[0, 2], [5, 7], [10, 12]] }
      }
    ]);
  });

  it('_clipLineToAxisBounds clippe correctement un segment traversant la fenêtre', () => {
    const bounds = { xMin: 0, xMax: 10, yMin: 0, yMax: 10 };
    const clipped = grapher._clipLineToAxisBounds(-5, -5, 15, 15, bounds);
    assert.deepEqual(clipped, { x1: 0, y1: 0, x2: 10, y2: 10 });

    const outside = grapher._clipLineToAxisBounds(-10, -10, -2, -2, bounds);
    assert.equal(outside, null);
  });

  it('_clipInfiniteLineToAxisBounds gère les pentes nulles et non nulles', () => {
    const bounds = { xMin: 0, xMax: 10, yMin: 0, yMax: 10 };
    assert.deepEqual(
      grapher._clipInfiniteLineToAxisBounds(5, 4, 0, bounds),
      { x1: 0, y1: 4, x2: 10, y2: 4 }
    );
    assert.equal(grapher._clipInfiniteLineToAxisBounds(5, 20, 0, bounds), null);

    const diag = grapher._clipInfiniteLineToAxisBounds(5, 5, 1, bounds);
    assert.deepEqual(diag, { x1: 0, y1: 0, x2: 10, y2: 10 });
  });

  it('drawAnnotations rend les 4 types d\'annotations et clearAllAnnotations les supprime', () => {
    let clearBtnUpdated = 0;
    grapher.setUIManager({ updateClearAnnotationsButtonVisibility: () => { clearBtnUpdated++; } });

    data.annotations.push(
      { id: 'a1', type: 'point', x: 5, y: 5, xCurve: 'V' },
      { id: 'a2', type: 'segment', points: [{ x: 2, y: 2 }, { x: 8, y: 8 }], yUnit: '', xCurve: 'V' },
      { id: 'a3', type: 'tangent', point: { x: 5, y: 7 }, slope: 1, xCurve: 'V' },
      { id: 'a4', type: 'tangent-method', point1: { x: 2, y: 4 }, point2: { x: 8, y: 10 }, slope: 0.5, seriesName: 'pH', xCurve: 'V' },
      // Annotation d'un autre axe X : doit être ignorée
      { id: 'a5', type: 'point', x: 5, y: 5, xCurve: 'autre' }
    );

    grapher.drawAnnotations();
    assert.equal(grapher.renderedAnnotations.length, 4);

    // Un second appel détruit les anciens éléments avant de redessiner
    const firstBatch = grapher.renderedAnnotations[0];
    grapher.drawAnnotations();
    assert.equal(firstBatch.xLine.destroyed, true);
    assert.equal(grapher.renderedAnnotations.length, 4);

    // clearAllAnnotations vide les données et déclenche un redraw
    grapher.clearAllAnnotations();
    assert.equal(data.annotations.length, 0);
    assert.equal(clearBtnUpdated, 1);
    assert.equal(grapher.chart.redrawCount, 1);
  });
});
