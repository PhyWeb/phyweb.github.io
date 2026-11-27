import '../helpers/setup.mjs';
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import Data from '../../grapher/modules/data.js';
import Grapher from '../../grapher/modules/grapher.js';
import {
  computeAxisExponent,
  formatUnitWithExponent,
  formatAxisLabelWithUnit
} from '../../grapher/modules/grapher/axisFormatting.js';
import {
  GRID_STYLE,
  computeOrthonormalBounds,
  computeSharedTickInterval,
  buildChartOptions,
  buildSeriesMarkerOptions,
  attachChartInteractionListeners
} from '../../grapher/modules/grapher/highchartsSetup.js';
import { generatePW, restorePWState } from '../../grapher/modules/io/pwCodec.js';
import { DEFAULT_SETTINGS } from '../../grapher/modules/settingsManager.js';

describe('Grapher - Configuration Highcharts, formatage d\'axes et zoom', () => {
  it('computeAxisExponent calcule l\'exposant par multiples de 3 et respecte disableScientificNotation', () => {
    assert.equal(computeAxisExponent(0, 5000), 3);
    assert.equal(computeAxisExponent(0, 2e6), 6);
    assert.equal(computeAxisExponent(0, 5e-4), -6);
    assert.equal(computeAxisExponent(0, 50), 0);
    // Zoom serré autour d'une grande valeur (ex: 1000..1001) : pas d'exposant factorisé
    assert.equal(computeAxisExponent(1000, 1001), 0);
    // Option désactivée
    assert.equal(computeAxisExponent(0, 5000, true), 0);
  });

  it('formatUnitWithExponent et formatAxisLabelWithUnit formatent unité et puissance de 10', () => {
    assert.equal(formatUnitWithExponent('m/s', 3), '×10³ m/s');
    assert.equal(formatUnitWithExponent('', -6), '×10⁻⁶');
    assert.equal(formatUnitWithExponent('V', 0), 'V');
    assert.equal(formatAxisLabelWithUnit('U', 'V', 3), 'U (×10³ V)');
    assert.equal(formatAxisLabelWithUnit('t', '', 0), 't');
  });

  it('installe les symboles SVG Highcharts cross et crossX', () => {
    const crossPath = Highcharts.SVGRenderer.prototype.symbols.cross(0, 0, 10, 10);
    const crossXPath = Highcharts.SVGRenderer.prototype.symbols.crossX(0, 0, 10, 10);
    assert.equal(crossPath[0], 'M');
    assert.equal(crossXPath[0], 'M');
    assert.equal(crossPath.length, 12);
    assert.equal(crossXPath.length, 12);
  });

  it('place le marqueur d\'un point sélectionné au premier plan (toFront)', () => {
    const data = new Data();
    const grapher = new Grapher(data, {
      grapherGrid: true,
      minorGrid: false,
      highlightZeroAxes: true,
      disableScientificNotation: false,
      includeOriginOnAutoZoom: true
    });
    const options = buildChartOptions(grapher);
    assert.equal(options.plotOptions.line.boostThreshold, 5000);
    assert.equal(options.plotOptions.series.boostThreshold, 5000);
    assert.equal(options.plotOptions.series.findNearestPointBy, 'xy');
    assert.deepEqual(options.plotOptions.series.states.select.halo, { size: 10, opacity: 0.25 });
    const onSelect = options.plotOptions.series.point.events.select;
    assert.equal(typeof onSelect, 'function');

    const callOrder = [];
    const fakePoint = {
      graphic: {
        element: { parentNode: {} },
        toFront() { callOrder.push('graphic'); }
      }
    };
    fakePoint.series = {
      halo: {
        point: fakePoint,
        element: { parentNode: {} },
        toFront() { callOrder.push('halo'); }
      }
    };
    onSelect.call(fakePoint);
    assert.deepEqual(callOrder, ['halo', 'graphic']);

    // Ne doit pas planter si le point n'a pas de graphic ou de parentNode
    assert.doesNotThrow(() => onSelect.call({}));
    assert.doesNotThrow(() => onSelect.call({ graphic: { element: { parentNode: null }, toFront() { callOrder.push('never'); } } }));
    assert.deepEqual(callOrder, ['halo', 'graphic']);
  });

  it('buildSeriesMarkerOptions adapte le style de sélection entre symboles pleins et croix', () => {
    const circleMarker = buildSeriesMarkerOptions({
      markers: true,
      markerSymbol: 'circle',
      markerRadius: 4,
      color: '#2caffe'
    });
    assert.equal(circleMarker.lineWidth, 0);
    assert.deepEqual(circleMarker.states.select, {
      fillColor: null,
      lineColor: '#ffffff',
      lineWidth: 2,
      radiusPlus: 2
    });

    const crossMarker = buildSeriesMarkerOptions({
      markers: true,
      markerSymbol: 'crossX',
      markerRadius: 4,
      color: '#2caffe'
    });
    assert.equal(crossMarker.lineWidth, 1);
    assert.deepEqual(crossMarker.states.select, {
      fillColor: null,
      lineColor: '#2caffe',
      lineWidth: 2.5,
      radiusPlus: 2
    });
  });

  it('applique la hiérarchie visuelle des grilles principale/secondaire et des tirets de sous-graduations', () => {
    assert.equal(DEFAULT_SETTINGS.minorGrid, true);

    const data = new Data();
    const grapherDefault = new Grapher(data, { grapherGrid: true });
    assert.equal(grapherDefault.minorGrid, true);

    const grapherMinorOff = new Grapher(data, {
      grapherGrid: true,
      minorGrid: false
    });
    const optsOff = buildChartOptions(grapherMinorOff);

    for (const axis of [optsOff.xAxis[0], optsOff.yAxis[0]]) {
      assert.equal(axis.gridLineWidth, GRID_STYLE.majorWidth);
      assert.equal(axis.gridLineColor, GRID_STYLE.majorColor);
      assert.equal(axis.minorGridLineWidth, 0);
      assert.equal(axis.minorGridLineColor, GRID_STYLE.minorColor);
      assert.equal(axis.minorTickInterval, null);
      assert.equal(axis.minorTickWidth, 0);
      assert.equal(axis.minorTickLength, GRID_STYLE.minorTickLength);
      assert.equal(axis.minorTickColor, GRID_STYLE.minorTickColor);
    }

    const grapherMinorOn = new Grapher(data, {
      grapherGrid: true,
      minorGrid: true
    });
    const optsOn = buildChartOptions(grapherMinorOn);

    for (const axis of [optsOn.xAxis[0], optsOn.yAxis[0]]) {
      assert.equal(axis.minorGridLineWidth, GRID_STYLE.minorWidth);
      assert.ok(axis.minorGridLineWidth < axis.gridLineWidth);
      assert.equal(axis.minorTickInterval, 'auto');
      assert.equal(axis.minorTickWidth, GRID_STYLE.minorTickWidth);
    }

    const updates = [];
    grapherMinorOff.chart = { update: (u) => updates.push(u) };
    grapherMinorOff.setMinorGridVisibility(true);
    assert.deepEqual(updates[0], {
      xAxis: {
        minorGridLineWidth: GRID_STYLE.minorWidth,
        minorTickInterval: 'auto',
        minorTickWidth: GRID_STYLE.minorTickWidth
      },
      yAxis: {
        minorGridLineWidth: GRID_STYLE.minorWidth,
        minorTickInterval: 'auto',
        minorTickWidth: GRID_STYLE.minorTickWidth
      }
    });

    grapherMinorOff.setMinorGridVisibility(false);
    assert.deepEqual(updates[1], {
      xAxis: {
        minorGridLineWidth: 0,
        minorTickInterval: null,
        minorTickWidth: 0
      },
      yAxis: {
        minorGridLineWidth: 0,
        minorTickInterval: null,
        minorTickWidth: 0
      }
    });
  });

  describe('Grapher.zoom() et Grapher.resetZoom()', () => {
    let grapher;
    let xCalls;
    let yCalls;
    let redrawCount;
    let resetZoomUICalled;

    beforeEach(() => {
      xCalls = [];
      yCalls = [];
      redrawCount = 0;
      resetZoomUICalled = false;

      const data = new Data();
      grapher = new Grapher(data, {
        grapherGrid: true,
        minorGrid: false,
        highlightZeroAxes: true,
        disableScientificNotation: false,
        includeOriginOnAutoZoom: true
      });
      grapher.setUIManager({ resetZoomUI: () => { resetZoomUICalled = true; } });
      grapher.chart = {
        xAxis: [{
          getExtremes: () => ({ min: 0, max: 10 }),
          setExtremes: (min, max, redraw) => xCalls.push({ min, max, redraw })
        }],
        yAxis: [{
          getExtremes: () => ({ min: 0, max: 20 }),
          setExtremes: (min, max, redraw) => yCalls.push({ min, max, redraw })
        }],
        redraw: () => { redrawCount++; }
      };
    });

    it('zoom("in") resserre les bornes autour du centre (facteur 0.8) et active hasUserZoom', () => {
      grapher.zoom('in');
      assert.equal(grapher.hasUserZoom, true);
      assert.deepEqual(xCalls[0], { min: 1, max: 9, redraw: false });
      assert.deepEqual(yCalls[0], { min: 2, max: 18, redraw: false });
      assert.equal(redrawCount, 1);
    });

    it('zoom("out") élargit les bornes autour du centre (facteur 1.25)', () => {
      grapher.zoom('out');
      assert.equal(grapher.hasUserZoom, true);
      assert.deepEqual(xCalls[0], { min: -1.25, max: 11.25, redraw: false });
      assert.deepEqual(yCalls[0], { min: -2.5, max: 22.5, redraw: false });
      assert.equal(redrawCount, 1);
    });

    it('resetZoom réinitialise hasUserZoom, les extrêmes et l\'UI', () => {
      grapher.hasUserZoom = true;
      grapher.resetZoom();
      assert.equal(grapher.hasUserZoom, false);
      assert.deepEqual(xCalls[0], { min: null, max: null, redraw: false });
      assert.deepEqual(yCalls[0], { min: null, max: null, redraw: false });
      assert.equal(redrawCount, 1);
      assert.equal(resetZoomUICalled, true);
    });

    it('zoomAt() zoome autour du point sous le curseur sans déplacer ce point', () => {
      grapher.chart.xAxis[0].toValue = (px) => px / 10; // 0..100px -> 0..10
      grapher.chart.yAxis[0].toValue = (py) => (100 - py) / 5; // 0..100px -> 20..0

      // Curseur à (20px, 75px) => pivot (x = 2, y = 5), facteur 0.5 (zoom x2)
      const ok = grapher.zoomAt(0.5, 20, 75);
      assert.equal(ok, true);
      assert.equal(grapher.hasUserZoom, true);
      // Nouveau minX = 2 - (2 - 0)*0.5 = 1, maxX = 2 + (10 - 2)*0.5 = 6
      assert.deepEqual(xCalls[0], { min: 1, max: 6, redraw: false });
      // Nouveau minY = 5 - (5 - 0)*0.5 = 2.5, maxY = 5 + (20 - 5)*0.5 = 12.5
      assert.deepEqual(yCalls[0], { min: 2.5, max: 12.5, redraw: false });
      assert.equal(redrawCount, 1);
    });

    it('panFromOrigin() décale les bornes proportionnellement au déplacement souris', () => {
      const ok = grapher.panFromOrigin(20, 25, {
        xMin: 0,
        xMax: 10,
        yMin: 0,
        yMax: 20,
        plotWidth: 100,
        plotHeight: 100
      });
      assert.equal(ok, true);
      assert.equal(grapher.hasUserZoom, true);
      // Vers la droite (+20px / 100px * 10 = +2) => bornes X décalées de -2
      assert.deepEqual(xCalls[0], { min: -2, max: 8, redraw: false });
      // Vers le bas (+25px / 100px * 20 = +5) => bornes Y décalées de +5
      assert.deepEqual(yCalls[0], { min: 5, max: 25, redraw: false });
      assert.equal(redrawCount, 1);
    });
  });

  describe('Navigation molette et pan au clic gauche (attachChartInteractionListeners)', () => {
    function createInteractiveGrapher() {
      const data = new Data();
      const grapher = new Grapher(data, { grapherGrid: true, minorGrid: true });
      grapher.handleMouseMove = () => {};
      grapher.handleMouseUp = () => {};
      const containerListeners = new Map();
      const docListeners = new Map();
      const classes = new Set();
      let xMin = 0, xMax = 10, yMin = 0, yMax = 20;
      let redraws = 0;

      const origDocAdd = document.addEventListener;
      const origDocRemove = document.removeEventListener;
      document.addEventListener = (type, fn) => {
        if (!docListeners.has(type)) docListeners.set(type, new Set());
        docListeners.get(type).add(fn);
      };
      document.removeEventListener = (type, fn) => {
        docListeners.get(type)?.delete(fn);
      };

      const container = {
        classList: {
          add: (c) => classes.add(c),
          remove: (c) => classes.delete(c),
          contains: (c) => classes.has(c)
        },
        addEventListener: (type, fn) => {
          if (!containerListeners.has(type)) containerListeners.set(type, new Set());
          containerListeners.get(type).add(fn);
        },
        removeEventListener: (type, fn) => {
          containerListeners.get(type)?.delete(fn);
        }
      };

      grapher.chart = {
        container,
        options: { chart: { zooming: { type: null } } },
        plotLeft: 0,
        plotTop: 0,
        plotWidth: 100,
        plotHeight: 100,
        pointer: { getChartPosition: () => ({ left: 0, top: 0 }) },
        xAxis: [{
          getExtremes: () => ({ min: xMin, max: xMax }),
          setExtremes: (min, max) => { xMin = min; xMax = max; },
          toValue: (px) => xMin + (px / 100) * (xMax - xMin)
        }],
        yAxis: [{
          getExtremes: () => ({ min: yMin, max: yMax }),
          setExtremes: (min, max) => { yMin = min; yMax = max; },
          toValue: (py) => yMax - (py / 100) * (yMax - yMin)
        }],
        redraw: () => { redraws++; }
      };

      const origAddEvent = global.Highcharts.addEvent;
      global.Highcharts.addEvent = () => {};
      attachChartInteractionListeners(grapher);
      global.Highcharts.addEvent = origAddEvent;

      return {
        grapher,
        classes,
        getExtremes: () => ({ xMin, xMax, yMin, yMax, redraws }),
        emitContainer: (type, event) => {
          for (const fn of [...(containerListeners.get(type) || [])]) fn(event);
        },
        emitDoc: (type, event) => {
          for (const fn of [...(docListeners.get(type) || [])]) fn(event);
        },
        cleanup: () => {
          document.addEventListener = origDocAdd;
          document.removeEventListener = origDocRemove;
        }
      };
    }

    it('zoome à la molette dans la zone de tracé et ignore en dehors', () => {
      const ctx = createInteractiveGrapher();
      try {
        let prevented = false;
        // En dehors du plotBox (x = 150 > 100) : ignoré
        ctx.emitContainer('wheel', {
          pageX: 150, pageY: 50, deltaY: -100, deltaMode: 0,
          preventDefault: () => { prevented = true; }
        });
        assert.equal(prevented, false);
        assert.equal(ctx.getExtremes().redraws, 0);

        // Dans le plotBox au centre (50, 50) : zoom avant
        ctx.emitContainer('wheel', {
          pageX: 50, pageY: 50, deltaY: -100, deltaMode: 0,
          preventDefault: () => { prevented = true; }
        });
        assert.equal(prevented, true);
        const ex = ctx.getExtremes();
        assert.equal(ex.redraws, 1);
        assert.ok((ex.xMax - ex.xMin) < 10);
        assert.ok((ex.yMax - ex.yMin) < 20);
        assert.ok(Math.abs(((ex.xMin + ex.xMax) / 2) - 5) < 1e-9);
      } finally {
        ctx.cleanup();
      }
    });

    it('déplace la vue au clic gauche glissé (>= 4 px) et ignore les clics courts ou quand un outil est actif', () => {
      const ctx = createInteractiveGrapher();
      try {
        // Clic court (< 4 px) : ne pan pas
        ctx.emitContainer('mousedown', { button: 0, clientX: 50, clientY: 50, pageX: 50, pageY: 50 });
        ctx.emitDoc('mousemove', { clientX: 52, clientY: 51 });
        ctx.emitDoc('mouseup', {});
        assert.equal(ctx.getExtremes().redraws, 0);
        assert.equal(ctx.grapher.isPanning, false);

        // Glisser >= 4 px : pan actif
        ctx.emitContainer('mousedown', { button: 0, clientX: 50, clientY: 50, pageX: 50, pageY: 50 });
        ctx.emitDoc('mousemove', { clientX: 70, clientY: 60 });
        assert.equal(ctx.grapher.isPanning, true);
        assert.equal(ctx.classes.has('chart-panning'), true);
        ctx.emitDoc('mouseup', {});
        assert.equal(ctx.grapher.isPanning, false);
        assert.equal(ctx.classes.has('chart-panning'), false);
        const ex = ctx.getExtremes();
        assert.equal(ex.xMin, -2);
        assert.equal(ex.xMax, 8);
        assert.equal(ex.yMin, 2);
        assert.equal(ex.yMax, 22);

        // Outil actif : clic gauche ne doit pas panner
        const beforeRedraws = ex.redraws;
        ctx.grapher.crosshairMode = 'free';
        ctx.emitContainer('mousedown', { button: 0, clientX: 50, clientY: 50, pageX: 50, pageY: 50, preventDefault: () => {} });
        ctx.emitDoc('mousemove', { clientX: 80, clientY: 80 });
        ctx.emitDoc('mouseup', {});
        assert.equal(ctx.getExtremes().redraws, beforeRedraws);

        // Mais clic milieu panne même quand un outil est actif
        let middlePrevented = false;
        ctx.emitContainer('mousedown', {
          button: 1, clientX: 50, clientY: 50, pageX: 50, pageY: 50,
          preventDefault: () => { middlePrevented = true; }
        });
        assert.equal(middlePrevented, true);
        ctx.emitDoc('mousemove', { clientX: 60, clientY: 50 });
        ctx.emitDoc('mouseup', {});
        assert.ok(ctx.getExtremes().redraws > beforeRedraws);
      } finally {
        ctx.cleanup();
      }
    });
  });

  describe('Repère orthonormé (1:1) et persistance .pw', () => {
    it('computeOrthonormalBounds élargit uniquement l\'axe le plus serré sans rogner les données', () => {
      // plot 400x200 (ratio 2:1), données [0, 10] x [0, 10] => scaleX = 0.025, scaleY = 0.05
      // Il faut scale = 0.05 => rangeX = 20 autour de 5 => [-5, 15], Y inchangé [0, 10]
      const b1 = computeOrthonormalBounds(0, 10, 0, 10, 400, 200);
      assert.deepEqual(b1, { xMin: -5, xMax: 15, yMin: 0, yMax: 10 });

      // Déjà orthonormé => retourne null (pas de boucle de redraw)
      assert.equal(computeOrthonormalBounds(-5, 15, 0, 10, 400, 200), null);

      // plot 200x400 (ratio 1:2), données [0, 10] x [0, 10] => élargit Y à [-5, 15]
      const b2 = computeOrthonormalBounds(0, 10, 0, 10, 200, 400);
      assert.deepEqual(b2, { xMin: 0, xMax: 10, yMin: -5, yMax: 15 });

      // Entrées invalides => null
      assert.equal(computeOrthonormalBounds(0, 10, 0, 10, 0, 200), null);
      assert.equal(computeOrthonormalBounds(NaN, 10, 0, 10, 200, 200), null);
    });

    it('Grapher.setOrthonormal() applique le 1:1, synchronise un tickInterval commun et rétablit le zoom auto à la désactivation', () => {
      const data = new Data();
      const grapher = new Grapher(data, { grapherGrid: true, minorGrid: true });
      let xMin = 0, xMax = 10, yMin = 0, yMax = 10;
      let xTickInterval = null, yTickInterval = null;
      let resetCalled = 0;

      grapher.chart = {
        plotWidth: 400,
        plotHeight: 200,
        xAxis: [{
          getExtremes: () => ({ min: xMin, max: xMax }),
          setExtremes: (min, max) => {
            if (min === null && max === null) { xMin = 0; xMax = 10; resetCalled++; }
            else { xMin = min; xMax = max; }
          },
          update: (opts) => { xTickInterval = opts.tickInterval; }
        }],
        yAxis: [{
          getExtremes: () => ({ min: yMin, max: yMax }),
          setExtremes: (min, max) => {
            if (min === null && max === null) { yMin = 0; yMax = 10; }
            else { yMin = min; yMax = max; }
          },
          update: (opts) => { yTickInterval = opts.tickInterval; }
        }],
        redraw: () => {}
      };

      grapher.setOrthonormal(true);
      assert.equal(grapher.orthonormal, true);
      assert.equal(grapher.hasUserZoom, false);
      assert.equal(xMin, -5);
      assert.equal(xMax, 15);
      assert.equal(yMin, 0);
      assert.equal(yMax, 10);
      // scale = 20 / 400 = 0.05 => raw = 0.05 * 80 = 4 => pas partagé = 5
      assert.equal(computeSharedTickInterval(0.05, 80), 5);
      assert.equal(xTickInterval, 5);
      assert.equal(yTickInterval, 5);

      // Désactivation sans zoom manuel => revient aux bornes auto [0, 10] et libère tickInterval
      grapher.setOrthonormal(false);
      assert.equal(grapher.orthonormal, false);
      assert.equal(xMin, 0);
      assert.equal(xMax, 10);
      assert.equal(xTickInterval, null);
      assert.equal(yTickInterval, null);
      assert.ok(resetCalled >= 2);
    });

    it('generatePW() et restorePWState() sauvegardent et restaurent grapher.orthonormal (défaut false)', async () => {
      const data = new Data();
      data.addCurve('x', 'm', [0, 1, 2]);
      data.addCurve('y', 'm', [0, 2, 4]);

      const mockApp = {
        data,
        editor: {
          value: '',
          getValue() { return this.value; },
          setValue(v) { this.value = v; }
        },
        spreadsheet: { focusFirstCell() {}, update() {} },
        uiManager: {
          updateClearAnnotationsButtonVisibility() {},
          updateCalculationUI() {},
          updateAllModelPanelVisibilityIcons() {},
          updateRecalculateButtonVisibility() {},
          updateSortUI() {},
          updateXAxisSelector() {},
          resetZoomUI() {},
          createModelPanel() {}
        },
        grapher: {
          currentXCurve: 'x',
          hasUserZoom: false,
          orthonormal: true,
          appliedOrthonormal: 0,
          chart: {
            series: [{ name: 'y', visible: true, options: {} }],
            xAxis: [{ getExtremes: () => ({ min: 0, max: 2 }), setExtremes() {} }],
            yAxis: [{ getExtremes: () => ({ min: 0, max: 4 }), setExtremes() {} }],
            redraw() {}
          },
          setXCurve(c) { this.currentXCurve = c; },
          updateChart() {},
          setVisibilityFromList() {},
          updateModelVisibility() {},
          reorderLegendByVisibility() {},
          resetZoom() {},
          applyOrthonormalBounds() { this.appliedOrthonormal++; },
          updateOrthonormalButtonUI() {}
        }
      };

      const saved = JSON.parse(generatePW(mockApp));
      assert.equal(saved.grapher.orthonormal, true);

      // Restauration avec orthonormal: true
      mockApp.grapher.orthonormal = false;
      mockApp.grapher.appliedOrthonormal = 0;
      await restorePWState(mockApp, saved);
      assert.equal(mockApp.grapher.orthonormal, true);
      assert.equal(mockApp.grapher.appliedOrthonormal, 1);

      // Rétrocompatibilité : ancien .pw sans champ orthonormal => false
      delete saved.grapher.orthonormal;
      await restorePWState(mockApp, saved);
      assert.equal(mockApp.grapher.orthonormal, false);
    });
  });
});
