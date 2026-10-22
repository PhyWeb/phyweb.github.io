import '../helpers/setup.mjs';
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import Data from '../../grapher/modules/data.js';
import { Grapher } from '../../grapher/modules/grapher.js';

const createMockElement = () => {
  const el = {
    attr() { return el; },
    css() { return el; },
    add() { return el; },
    destroy() {},
    translate() {},
    getBBox() { return { width: 10, height: 10 }; }
  };
  return el;
};

const createMockChart = (seriesList = [], labelsList = []) => {
  const containerEventListeners = {};
  const container = {
    addEventListener: (type, fn) => {
      containerEventListeners[type] = containerEventListeners[type] || [];
      containerEventListeners[type].push(fn);
    },
    removeEventListener: () => {},
    dispatchEvent: (type, event) => {
      (containerEventListeners[type] || []).forEach(fn => fn(event));
    }
  };

  const chart = {
    container,
    containerEventListeners,
    plotLeft: 50,
    plotTop: 20,
    plotWidth: 500,
    plotHeight: 400,
    xAxis: [{
      toPixels: (val) => val * 10,
      toValue: (pix) => pix / 10,
      getExtremes: () => ({ min: 0, max: 25 })
    }],
    yAxis: [{
      index: 0,
      toPixels: (val) => val * 10,
      toValue: (pix) => pix / 10,
      getExtremes: () => ({ min: 0, max: 14 })
    }],
    series: seriesList,
    get: (id) => seriesList.find(s => s.options?.id === id || s.id === id),
    pointer: {
      getChartPosition: () => ({ left: 50, top: 20 }),
      findNearestKDPoint: (series, isDrag, event) => {
        return chart.__nearestPoint || null;
      }
    },
    renderer: {
      path: () => createMockElement(),
      circle: () => createMockElement(),
      label: (text) => {
        const el = createMockElement();
        el.text = text;
        labelsList.push(text);
        return el;
      }
    },
    redraw: () => {}
  };
  return chart;
};

describe('Grapher - Unité de Δy sur les annotations de type segment', () => {
  let data;
  let grapher;
  let labelsList;

  beforeEach(() => {
    data = new Data({ significantDigits: 4 });
    data.addCurve('t', 's');
    data.addCurve('u1', 'V');
    data.addCurve('u2', 'A');

    grapher = new Grapher(data, {
      grapherGrid: true,
      minorGrid: false,
      includeOriginOnAutoZoom: false
    });
    grapher.currentXCurve = 't';
    labelsList = [];
  });

  describe('1. _findNearestModelPoint(event)', () => {
    it('doit inclure unit: model.y?.unit dans l\'objet best retourné', () => {
      const modelSeries = {
        options: { id: 'model-mod1' },
        visible: true,
        points: [{ x: 2, y: 10 }]
      };
      grapher.chart = createMockChart([modelSeries]);

      data.models = [
        {
          id: 'mod1',
          visible: true,
          x: { title: 't' },
          y: { title: 'u1', unit: 'V' }
        }
      ];

      const best = grapher._findNearestModelPoint({ chartX: 70, chartY: 120 });
      assert.ok(best);
      assert.equal(best.x, 2);
      assert.equal(best.y, 10);
      assert.equal(best.unit, 'V');
    });

    it('doit renvoyer unit: \'\' si model.y n\'a pas d\'unité', () => {
      const modelSeries = {
        options: { id: 'model-mod2' },
        visible: true,
        points: [{ x: 3, y: 5 }]
      };
      grapher.chart = createMockChart([modelSeries]);

      data.models = [
        {
          id: 'mod2',
          visible: true,
          x: { title: 't' },
          y: { title: 'sansUnite' }
        }
      ];

      const best = grapher._findNearestModelPoint({ chartX: 80, chartY: 70 });
      assert.ok(best);
      assert.equal(best.unit, '');
    });
  });

  describe('2. Écouteur mousedown sur chart.container', () => {
    it('en mode "data", doit stocker unit de la série dans snappedPoint', () => {
      const series1 = {
        visible: true,
        options: { id: 's1' },
        userOptions: { unit: 'V' }
      };
      grapher.chart = createMockChart([series1]);
      grapher.crosshairMode = 'data';

      // Simuler l'écouteur mousedown attaché dans newChart()
      // En appelant directement le handler ou en attachant un listener similaire
      const fakePoint = { x: 1, y: 5, series: series1 };
      grapher.chart.__nearestPoint = fakePoint;

      // On déclenche le comportement de mousedown
      const event = { pageX: 60, pageY: 70, preventDefault: () => {} };
      const pos = grapher.chart.pointer.getChartPosition();
      grapher.mouseDownInfo = {
        chartX: event.pageX - pos.left,
        chartY: event.pageY - pos.top,
        time: Date.now()
      };
      const dataSeries = grapher.chart.series.filter(s => !s.options.id?.startsWith('model-'));
      const point = grapher.chart.pointer.findNearestKDPoint(dataSeries, true, grapher.mouseDownInfo);
      if (point) {
        grapher.mouseDownInfo.snappedPoint = { x: point.x, y: point.y, unit: point.series?.userOptions?.unit || '' };
      }

      assert.deepEqual(grapher.mouseDownInfo.snappedPoint, { x: 1, y: 5, unit: 'V' });
    });

    it('en mode "model", doit stocker unit du modèle dans snappedPoint', () => {
      const modelSeries = {
        options: { id: 'model-mod1' },
        visible: true,
        points: [{ x: 4, y: 8 }]
      };
      grapher.chart = createMockChart([modelSeries]);
      grapher.crosshairMode = 'model';
      data.models = [
        {
          id: 'mod1',
          visible: true,
          x: { title: 't' },
          y: { title: 'u2', unit: 'A' }
        }
      ];

      const pos = grapher.chart.pointer.getChartPosition();
      grapher.mouseDownInfo = {
        chartX: 90 - pos.left,
        chartY: 100 - pos.top,
        time: Date.now()
      };
      const point = grapher._findNearestModelPoint(grapher.mouseDownInfo);
      if (point) {
        grapher.mouseDownInfo.snappedPoint = { x: point.x, y: point.y, unit: point.unit || '' };
      }

      assert.deepEqual(grapher.mouseDownInfo.snappedPoint, { x: 4, y: 8, unit: 'A' });
    });
  });

  describe('3. handleMouseUp(e) - Création de segment avec yUnit', () => {
    it('en mode "data", utilise startSnappedPoint.unit pour le segment', () => {
      const series2 = {
        visible: true,
        options: { id: 's2' },
        userOptions: { unit: 'A' }
      };
      grapher.chart = createMockChart([series2]);
      grapher.crosshairMode = 'data';
      grapher.isDragging = true;
      grapher.mouseDownInfo = {
        chartX: 10,
        chartY: 10,
        time: Date.now() - 500, // Glisser (durée > 300ms)
        snappedPoint: { x: 1, y: 2, unit: 'A' }
      };

      grapher.chart.__nearestPoint = { x: 5, y: 6 };

      const e = { pageX: 100, pageY: 80 }; // distance > 5
      grapher.handleMouseUp(e);

      assert.equal(data.annotations.length, 1);
      const ann = data.annotations[0];
      assert.equal(ann.type, 'segment');
      assert.equal(ann.yUnit, 'A');
    });

    it('en mode "model", utilise startSnappedPoint.unit pour le segment', () => {
      const modelSeries = {
        options: { id: 'model-mod1' },
        visible: true,
        points: [{ x: 5, y: 6 }]
      };
      grapher.chart = createMockChart([modelSeries]);
      grapher.crosshairMode = 'model';
      grapher.isDragging = true;
      grapher.mouseDownInfo = {
        chartX: 10,
        chartY: 10,
        time: Date.now() - 500,
        snappedPoint: { x: 1, y: 2, unit: 'V' }
      };
      data.models = [
        {
          id: 'mod1',
          visible: true,
          x: { title: 't' },
          y: { title: 'u1', unit: 'V' }
        }
      ];

      const e = { pageX: 100, pageY: 80 };
      grapher.handleMouseUp(e);

      assert.equal(data.annotations.length, 1);
      const ann = data.annotations[0];
      assert.equal(ann.type, 'segment');
      assert.equal(ann.yUnit, 'V');
    });

    it('en mode "free", si toutes les séries visibles ont la même unité, utilise cette unité', () => {
      const s1 = { visible: true, options: { id: 's1' }, userOptions: { unit: 'm/s' } };
      const s2 = { visible: true, options: { id: 's2' }, userOptions: { unit: 'm/s' } };
      const sModel = { visible: true, options: { id: 'model-m1' }, userOptions: { unit: 'Autre' } };
      grapher.chart = createMockChart([s1, s2, sModel]);
      grapher.crosshairMode = 'free';
      grapher.isDragging = true;
      grapher.mouseDownInfo = {
        chartX: 10,
        chartY: 10,
        time: Date.now() - 500,
        snappedPoint: null
      };

      const e = { pageX: 100, pageY: 80 };
      grapher.handleMouseUp(e);

      assert.equal(data.annotations.length, 1);
      assert.equal(data.annotations[0].type, 'segment');
      assert.equal(data.annotations[0].yUnit, 'm/s');
    });

    it('en mode "free", si les séries visibles ont des unités différentes, laisse yUnit à \'\'', () => {
      const s1 = { visible: true, options: { id: 's1' }, userOptions: { unit: 'V' } };
      const s2 = { visible: true, options: { id: 's2' }, userOptions: { unit: 'A' } };
      grapher.chart = createMockChart([s1, s2]);
      grapher.crosshairMode = 'free';
      grapher.isDragging = true;
      grapher.mouseDownInfo = {
        chartX: 10,
        chartY: 10,
        time: Date.now() - 500,
        snappedPoint: null
      };

      const e = { pageX: 100, pageY: 80 };
      grapher.handleMouseUp(e);

      assert.equal(data.annotations.length, 1);
      assert.equal(data.annotations[0].type, 'segment');
      assert.equal(data.annotations[0].yUnit, '');
    });
  });

  describe('4. drawAnnotations() - Affichage de Δy', () => {
    it('utilise annotation.yUnit quand présent (ex: "A") même si la 1re série a "V"', () => {
      const firstSeries = {
        visible: true,
        yAxis: { index: 0 },
        options: { id: 's1' },
        userOptions: { unit: 'V' }
      };
      grapher.chart = createMockChart([firstSeries], labelsList);

      data.annotations = [
        {
          id: 'seg1',
          type: 'segment',
          points: [{ x: 1, y: 2 }, { x: 4, y: 8 }],
          yUnit: 'A'
        }
      ];

      grapher.drawAnnotations();

      // Vérifier les labels créés : dxLabel et dyLabel
      const dyLabel = labelsList.find(txt => txt.startsWith('Δy'));
      assert.ok(dyLabel);
      assert.ok(dyLabel.endsWith(' A'), `Le label doit se terminer par " A", reçu: ${dyLabel}`);
    });

    it('utilise annotation.yUnit quand présent et vide (yUnit: "") sans afficher l\'unité de la 1re série', () => {
      const firstSeries = {
        visible: true,
        yAxis: { index: 0 },
        options: { id: 's1' },
        userOptions: { unit: 'V' }
      };
      grapher.chart = createMockChart([firstSeries], labelsList);

      data.annotations = [
        {
          id: 'seg1',
          type: 'segment',
          points: [{ x: 1, y: 2 }, { x: 4, y: 8 }],
          yUnit: ''
        }
      ];

      grapher.drawAnnotations();

      const dyLabel = labelsList.find(txt => txt.startsWith('Δy'));
      assert.ok(dyLabel);
      assert.ok(!dyLabel.includes('V'), `Le label ne doit pas contenir "V", reçu: ${dyLabel}`);
      assert.equal(dyLabel, 'Δy = 6,000');
    });

    it('repli sur firstYSeries.userOptions.unit si annotation.yUnit === undefined (rétrocompatibilité anciens .pw)', () => {
      const firstSeries = {
        visible: true,
        yAxis: { index: 0 },
        options: { id: 's1' },
        userOptions: { unit: 'V' }
      };
      grapher.chart = createMockChart([firstSeries], labelsList);

      data.annotations = [
        {
          id: 'seg1',
          type: 'segment',
          points: [{ x: 1, y: 2 }, { x: 4, y: 8 }]
          // yUnit undefined
        }
      ];

      grapher.drawAnnotations();

      const dyLabel = labelsList.find(txt => txt.startsWith('Δy'));
      assert.ok(dyLabel);
      assert.ok(dyLabel.endsWith(' V'), `Le label doit se terminer par " V", reçu: ${dyLabel}`);
    });
  });
});
