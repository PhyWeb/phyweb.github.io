import '../helpers/setup.mjs';
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import Data from '../../grapher/modules/data.js';
import { Grapher } from '../../grapher/modules/grapher.js';

const createMockElement = (meta = {}) => {
  const calls = { clippedWith: null, translatedTo: null, destroyed: false };
  const el = {
    ...meta,
    calls,
    attr() { return el; },
    css() { return el; },
    add() { return el; },
    clip(clipRect) {
      calls.clippedWith = clipRect;
      return el;
    },
    destroy() {
      calls.destroyed = true;
    },
    translate(x, y) {
      calls.translatedTo = { x, y };
      return el;
    },
    getBBox() { return { width: 40, height: 16 }; }
  };
  return el;
};

/**
 * Crée un mock Highcharts réaliste avec axes calibrés sur plotBox :
 * x in [xMin, xMax] <-> pixelX in [plotLeft, plotLeft + plotWidth]
 * y in [yMin, yMax] <-> pixelY in [plotTop + plotHeight, plotTop]
 */
const createCalibratedMockChart = ({
  xMin = 0,
  xMax = 20,
  yMin = 0,
  yMax = 14,
  plotLeft = 50,
  plotTop = 20,
  plotWidth = 500,
  plotHeight = 400,
  series = []
} = {}) => {
  const drawnPaths = [];
  const drawnCircles = [];
  const drawnLabels = [];
  const clipRects = [];
  const containerListeners = {};
  let redrawCount = 0;

  const xToPixels = (val) => plotLeft + ((val - xMin) / (xMax - xMin)) * plotWidth;
  const xToValue = (pix) => xMin + ((pix - plotLeft) / plotWidth) * (xMax - xMin);
  const yToPixels = (val) => plotTop + plotHeight - ((val - yMin) / (yMax - yMin)) * plotHeight;
  const yToValue = (pix) => yMin + ((plotTop + plotHeight - pix) / plotHeight) * (yMax - yMin);

  const chart = {
    plotLeft,
    plotTop,
    plotWidth,
    plotHeight,
    container: {
      classList: { add() {}, remove() {} },
      addEventListener(type, fn) {
        containerListeners[type] = containerListeners[type] || [];
        containerListeners[type].push(fn);
      },
      dispatch(type, evt) {
        (containerListeners[type] || []).forEach(fn => fn(evt));
      }
    },
    xAxis: [{
      min: xMin,
      max: xMax,
      dataMin: xMin,
      dataMax: xMax,
      toPixels: xToPixels,
      toValue: xToValue,
      getExtremes: () => ({ min: xMin, max: xMax, dataMin: xMin, dataMax: xMax }),
      setExtremes(min, max) {
        if (min !== null && min !== undefined) xMin = min;
        if (max !== null && max !== undefined) xMax = max;
      }
    }],
    yAxis: [{
      index: 0,
      min: yMin,
      max: yMax,
      dataMin: yMin,
      dataMax: yMax,
      toPixels: yToPixels,
      toValue: yToValue,
      getExtremes: () => ({ min: yMin, max: yMax, dataMin: yMin, dataMax: yMax }),
      setExtremes(min, max) {
        if (min !== null && min !== undefined) yMin = min;
        if (max !== null && max !== undefined) yMax = max;
      }
    }],
    series,
    get: (id) => series.find(s => s.options?.id === id || s.id === id),
    pointer: {
      getChartPosition: () => ({ left: 0, top: 0 }),
      findNearestKDPoint: () => chart.__nearestPoint || null
    },
    renderer: {
      clipRect(x, y, width, height) {
        const rect = {
          x, y, width, height,
          destroyed: false,
          attr(attrs) {
            Object.assign(rect, attrs);
            return rect;
          }
        };
        clipRects.push(rect);
        return rect;
      },
      path(d) {
        const el = createMockElement({ d });
        drawnPaths.push(el);
        return el;
      },
      circle(cx, cy, r) {
        const el = createMockElement({ cx, cy, r });
        drawnCircles.push(el);
        return el;
      },
      label(text) {
        const el = createMockElement({ text });
        drawnLabels.push(el);
        return el;
      }
    },
    redraw() {
      redrawCount += 1;
    },
    get drawnPaths() { return drawnPaths; },
    get drawnCircles() { return drawnCircles; },
    get drawnLabels() { return drawnLabels; },
    get clipRects() { return clipRects; },
    get redrawCount() { return redrawCount; },
    setViewport(newBounds) {
      if (newBounds.xMin !== undefined) xMin = newBounds.xMin;
      if (newBounds.xMax !== undefined) xMax = newBounds.xMax;
      if (newBounds.yMin !== undefined) yMin = newBounds.yMin;
      if (newBounds.yMax !== undefined) yMax = newBounds.yMax;
    }
  };

  return chart;
};

describe('Grapher - Corrections outils d\'annotation, fallback, axe X et clipping', () => {
  let data;
  let grapher;
  let clearBtnVisible;

  beforeEach(() => {
    data = new Data({ significantDigits: 4 });
    data.addCurve('V', 'mL');
    data.addCurve('t', 's');
    data.addCurve('pH', '');

    grapher = new Grapher(data, {
      grapherGrid: true,
      minorGrid: false,
      includeOriginOnAutoZoom: false
    });
    grapher.currentXCurve = 'V';
    clearBtnVisible = false;

    grapher.uiManager = {
      updateClearAnnotationsButtonVisibility() {
        const currentX = grapher.currentXCurve;
        clearBtnVisible = data.annotations.some(
          ann => !ann.xCurve || !currentX || ann.xCurve === currentX
        );
      }
    };
  });

  describe('1. Mode tangent / tangent-method : aucun segment temporaire sur glisser >= 5 px', () => {
    it('ne doit dessiner aucun segment temporaire lors d\'un mouvement >= 5 px en mode tangent', () => {
      grapher.chart = createCalibratedMockChart();
      grapher.crosshairMode = 'tangent';
      grapher.isDragging = true;
      grapher.mouseDownInfo = { chartX: 150, chartY: 150, time: Date.now() };

      grapher.handleMouseMove({ pageX: 220, pageY: 220 });

      assert.equal(grapher.tempAnnotation, null);
      assert.equal(grapher.chart.drawnPaths.length, 0);
      assert.equal(grapher.chart.drawnCircles.length, 0);
    });

    it('ne doit dessiner aucun segment temporaire ni créer d\'annotation lors d\'un glisser >= 5 px en mode tangent-method', () => {
      grapher.chart = createCalibratedMockChart();
      grapher.crosshairMode = 'tangent-method';
      grapher.isDragging = true;
      grapher.mouseDownInfo = { chartX: 150, chartY: 150, time: Date.now() };

      grapher.handleMouseMove({ pageX: 250, pageY: 250 });
      assert.equal(grapher.tempAnnotation, null);
      assert.equal(grapher.chart.drawnPaths.length, 0);

      grapher.handleMouseUp({ pageX: 250, pageY: 250 });
      assert.equal(data.annotations.length, 0);
    });
  });

  describe('2. Clic lent (>= 300 ms) immobile (< 5 px)', () => {
    it('crée un point (et non un segment) en mode free, data et model même si duration >= 300 ms', () => {
      const series1 = {
        name: 'pH',
        visible: true,
        options: { id: 's1', data: [[1, 2], [2, 4], [3, 6]] },
        points: [{ x: 2, y: 4 }]
      };
      const modelSeries = {
        options: { id: 'model-m1' },
        visible: true,
        points: [{ x: 2, y: 4 }]
      };
      grapher.chart = createCalibratedMockChart({ series: [series1, modelSeries] });

      // Mode free (clic immobile de 800 ms dans plotBox)
      grapher.crosshairMode = 'free';
      grapher.isDragging = true;
      grapher.mouseDownInfo = { chartX: 200, chartY: 200, time: Date.now() - 800 };
      grapher.handleMouseUp({ pageX: 201, pageY: 201 });

      assert.equal(data.annotations.length, 1);
      assert.equal(data.annotations[0].type, 'point');

      // Mode data (clic immobile de 800 ms)
      grapher.crosshairMode = 'data';
      grapher.snappedDataPoint = { x: 2, y: 4 };
      grapher.isDragging = true;
      grapher.mouseDownInfo = { chartX: 200, chartY: 200, time: Date.now() - 800, snappedPoint: { x: 2, y: 4, unit: '' } };
      grapher.handleMouseUp({ pageX: 200, pageY: 200 });

      assert.equal(data.annotations.length, 2);
      assert.equal(data.annotations[1].type, 'point');

      // Mode model (clic immobile de 800 ms)
      grapher.crosshairMode = 'model';
      grapher.snappedModelPoint = { x: 2, y: 4 };
      grapher.isDragging = true;
      grapher.mouseDownInfo = { chartX: 200, chartY: 200, time: Date.now() - 800, snappedPoint: { x: 2, y: 4, unit: '' } };
      grapher.handleMouseUp({ pageX: 200, pageY: 200 });

      assert.equal(data.annotations.length, 3);
      assert.equal(data.annotations[2].type, 'point');
    });

    it('trace bien la tangente et la méthode des tangentes lors d\'un clic immobile >= 300 ms', () => {
      const seriesData = [
        [0, 12.0], [4, 11.8], [9, 10.5], [10, 7.0], [11, 3.5], [16, 2.2], [20, 2.0]
      ];
      const series = {
        name: 'pH',
        visible: true,
        type: 'line',
        options: { id: 's1', data: seriesData }
      };
      const chart = createCalibratedMockChart({ series: [series] });
      chart.__nearestPoint = { x: 4, y: 11.8, index: 1, series };
      grapher.chart = chart;

      // Tangent avec duration = 800 ms
      grapher.crosshairMode = 'tangent';
      grapher.isDragging = true;
      grapher.mouseDownInfo = { chartX: 150, chartY: 80, time: Date.now() - 800 };
      grapher.handleMouseUp({ pageX: 151, pageY: 81 });

      assert.equal(data.annotations.length, 1);
      assert.equal(data.annotations[0].type, 'tangent');

      // Tangent-method avec duration = 800 ms
      grapher.crosshairMode = 'tangent-method';
      grapher.isDragging = true;
      grapher.mouseDownInfo = { chartX: 150, chartY: 80, time: Date.now() - 800 };
      grapher.handleMouseUp({ pageX: 150, pageY: 80 });

      assert.equal(data.annotations.length, 2);
      assert.equal(data.annotations[1].type, 'tangent-method');
    });
  });

  describe('3. Pas de fallback en mode libre ni d\'annotation invisible dans les marges', () => {
    it('en mode data ou model sans point aimanté, ne retombe pas en mode libre', () => {
      grapher.chart = createCalibratedMockChart();

      grapher.crosshairMode = 'data';
      grapher.snappedDataPoint = null;
      grapher.isDragging = true;
      grapher.mouseDownInfo = { chartX: 200, chartY: 200, time: Date.now() };
      grapher.handleMouseUp({ pageX: 200, pageY: 200 });

      assert.equal(data.annotations.length, 0);
      assert.equal(clearBtnVisible, false);

      grapher.crosshairMode = 'model';
      grapher.snappedModelPoint = null;
      grapher.isDragging = true;
      grapher.mouseDownInfo = { chartX: 200, chartY: 200, time: Date.now() };
      grapher.handleMouseUp({ pageX: 200, pageY: 200 });

      assert.equal(data.annotations.length, 0);
      assert.equal(clearBtnVisible, false);
    });

    it('en mode libre, un clic dans les marges (hors plotBox) ne crée pas d\'annotation et n\'affiche pas le bouton Effacer', () => {
      grapher.chart = createCalibratedMockChart({ plotLeft: 50, plotTop: 20, plotWidth: 500, plotHeight: 400 });
      grapher.crosshairMode = 'free';

      // Marge gauche (x = 10 < plotLeft = 50)
      grapher.isDragging = true;
      grapher.mouseDownInfo = { chartX: 10, chartY: 200, time: Date.now() };
      grapher.handleMouseUp({ pageX: 10, pageY: 200 });

      // Marge basse (y = 450 > plotTop + plotHeight = 420)
      grapher.isDragging = true;
      grapher.mouseDownInfo = { chartX: 200, chartY: 450, time: Date.now() };
      grapher.handleMouseUp({ pageX: 200, pageY: 450 });

      assert.equal(data.annotations.length, 0);
      assert.equal(clearBtnVisible, false);
    });
  });

  describe('4. Liaison à l\'axe X et clipping à plotBox', () => {
    it('associe les annotations à currentXCurve et masque celles d\'un autre axe X', () => {
      const chart = createCalibratedMockChart();
      grapher.chart = chart;
      grapher.crosshairMode = 'free';

      // Création d'un point lorsque currentXCurve = 'V'
      grapher.isDragging = true;
      grapher.mouseDownInfo = { chartX: 200, chartY: 200, time: Date.now() };
      grapher.handleMouseUp({ pageX: 200, pageY: 200 });

      assert.equal(data.annotations.length, 1);
      assert.equal(data.annotations[0].xCurve, 'V');
      assert.equal(clearBtnVisible, true);

      // Changement d'axe X vers 't' -> l'annotation de 'V' ne doit plus être rendue
      grapher.setXCurve('t', false);
      grapher.drawAnnotations();
      assert.equal(grapher.renderedAnnotations.length, 0);
      assert.equal(clearBtnVisible, false);

      // Retour sur 'V' -> l'annotation redevient visible
      grapher.setXCurve('V', false);
      grapher.drawAnnotations();
      assert.equal(grapher.renderedAnnotations.length, 1);
      assert.equal(clearBtnVisible, true);
    });

    it('reste rétrocompatible avec les annotations sans xCurve', () => {
      grapher.chart = createCalibratedMockChart();
      data.annotations.push({ id: 'legacy-1', type: 'point', x: 10, y: 7 });

      grapher.setXCurve('t', false);
      grapher.drawAnnotations();
      assert.equal(grapher.renderedAnnotations.length, 1);
    });

    it('clippe une tangente raide (saut de pH) dans plotBox lors de drawAnnotations et drawTangent', () => {
      const chart = createCalibratedMockChart({
        xMin: 0, xMax: 20, yMin: 0, yMax: 14,
        plotLeft: 50, plotTop: 20, plotWidth: 500, plotHeight: 400
      });
      const series = {
        name: 'pH',
        visible: true,
        type: 'line',
        options: { id: 's1', data: [[9.9, 2], [10, 7], [10.1, 12]] }
      };
      chart.series = [series];
      chart.__nearestPoint = { x: 10, y: 7, plotX: 250, plotY: 200, index: 1, series };
      grapher.chart = chart;

      // Tangente très raide : pente = 50 -> sans clipping, y(0) = -493, y(20) = +507
      data.annotations.push({
        id: 'steep-tan',
        type: 'tangent',
        point: { x: 10, y: 7 },
        slope: 50,
        xCurve: 'V'
      });

      grapher.drawAnnotations();

      const rendered = grapher.renderedAnnotations[0];
      assert.ok(rendered.tangentLine);
      const [, x1, y1, , x2, y2] = rendered.tangentLine.d;
      // Tous les points du path doivent être strictement dans plotBox ([50..550] x [20..420])
      assert.ok(x1 >= 50 && x1 <= 550, `x1 hors plotBox: ${x1}`);
      assert.ok(x2 >= 50 && x2 <= 550, `x2 hors plotBox: ${x2}`);
      assert.ok(y1 >= 20 && y1 <= 420, `y1 hors plotBox: ${y1}`);
      assert.ok(y2 >= 20 && y2 <= 420, `y2 hors plotBox: ${y2}`);
      assert.ok(rendered.tangentLine.calls.clippedWith, 'clipRect doit être appliqué sur tangentLine');

      // Vérifier aussi l'aperçu temps réel drawTangent
      grapher.crosshairMode = 'tangent';
      grapher.drawTangent({ chartX: 300, chartY: 220 });
      assert.ok(grapher.freeCrosshair?.tangentLine);
      const [, px1, py1, , px2, py2] = grapher.freeCrosshair.tangentLine.d;
      assert.ok(py1 >= 20 && py1 <= 420, `aperçu py1 hors plotBox: ${py1}`);
      assert.ok(py2 >= 20 && py2 <= 420, `aperçu py2 hors plotBox: ${py2}`);
      assert.ok(grapher.freeCrosshair.tangentLine.calls.clippedWith);
    });

    it('clippe les segments, les tangentes et la méthode des tangentes lors d\'un zoom', () => {
      const series = {
        name: 'pH',
        visible: true,
        options: {
          id: 's1',
          data: [[0, 12], [4, 11.8], [9.5, 10], [10.5, 4], [16, 2.2], [20, 2]]
        }
      };
      const chart = createCalibratedMockChart({
        xMin: 8, xMax: 12, yMin: 4, yMax: 10, // Zoom autour du saut (exclut p1=(2,1) et p2=(18,13))
        plotLeft: 50, plotTop: 20, plotWidth: 500, plotHeight: 400,
        series: [series]
      });
      grapher.chart = chart;

      data.annotations.push(
        {
          id: 'seg-zoom',
          type: 'segment',
          points: [{ x: 2, y: 1 }, { x: 18, y: 13 }],
          yUnit: '',
          xCurve: 'V'
        },
        {
          id: 'tm-zoom',
          type: 'tangent-method',
          point1: { x: 4, y: 11.8 },
          point2: { x: 16, y: 2.2 },
          slope: -10,
          seriesName: 'pH',
          xCurve: 'V'
        }
      );

      grapher.drawAnnotations();

      // Aucune coordonnée de tracé de segment / droite ne doit dépasser plotBox ([50..550] x [20..420])
      for (const pathEl of chart.drawnPaths) {
        const [, x1, y1, , x2, y2] = pathEl.d;
        assert.ok(x1 >= 50 - 1e-6 && x1 <= 550 + 1e-6, `x1 hors plotBox: ${x1}`);
        assert.ok(x2 >= 50 - 1e-6 && x2 <= 550 + 1e-6, `x2 hors plotBox: ${x2}`);
        assert.ok(y1 >= 20 - 1e-6 && y1 <= 420 + 1e-6, `y1 hors plotBox: ${y1}`);
        assert.ok(y2 >= 20 - 1e-6 && y2 <= 420 + 1e-6, `y2 hors plotBox: ${y2}`);
        assert.ok(pathEl.calls.clippedWith, 'Chaque ligne doit être clippée via clipRect');
      }

      // Les extrémités du segment (2,1) et (18,13) sont hors du zoom [8..12]x[4..10] -> pas de cercles aux extrémités hors écran
      // Seul eqPoint (~10, 7) de tangent-method est dans le zoom !
      assert.equal(chart.drawnCircles.length, 1);
    });

    it('n\'applique pas de clip-path SVG sur les étiquettes Δx et Δy (évite leur masquage après translate) et les maintient dans plotBox', () => {
      const chart = createCalibratedMockChart({
        xMin: 0, xMax: 20, yMin: 0, yMax: 14,
        plotLeft: 60, plotTop: 50, plotWidth: 500, plotHeight: 400
      });
      grapher.chart = chart;

      data.annotations.push({
        id: 'seg-labels',
        type: 'segment',
        points: [{ x: 2, y: 2 }, { x: 19.8, y: 13.8 }],
        yUnit: '',
        xCurve: 'V'
      });

      grapher.drawAnnotations();

      const dxLabel = chart.drawnLabels.find(l => l.text.startsWith('Δx ='));
      const dyLabel = chart.drawnLabels.find(l => l.text.startsWith('Δy ='));
      assert.ok(dxLabel, 'L\'étiquette Δx doit être créée');
      assert.ok(dyLabel, 'L\'étiquette Δy doit être créée');

      // Aucune étiquette traduite ne doit recevoir clipRect (car clip-path s'applique dans le repère local du <g>)
      assert.equal(dxLabel.calls.clippedWith, null, 'Δx ne doit pas être clippé via clipRect');
      assert.equal(dyLabel.calls.clippedWith, null, 'Δy ne doit pas être clippé via clipRect');

      // Les étiquettes doivent rester à l'intérieur de plotBox ([60..560] x [50..450])
      const { width, height } = dxLabel.getBBox();
      assert.ok(dxLabel.calls.translatedTo.x >= 60 && dxLabel.calls.translatedTo.x + width <= 560);
      assert.ok(dxLabel.calls.translatedTo.y >= 50 && dxLabel.calls.translatedTo.y + height <= 450);
      assert.ok(dyLabel.calls.translatedTo.x >= 60 && dyLabel.calls.translatedTo.x + width <= 560);
      assert.ok(dyLabel.calls.translatedTo.y >= 50 && dyLabel.calls.translatedTo.y + height <= 450);
    });
  });
});
