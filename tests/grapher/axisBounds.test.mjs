import '../helpers/setup.mjs';
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import Data from '../../grapher/modules/data.js';
import Grapher from '../../grapher/modules/grapher.js';
import UIManager, { parseAxisBoundInput, formatAxisBoundValue } from '../../grapher/modules/ui.js';

describe('Grapher - Bornes numériques des axes (parse, format, setAxisBounds, popover)', () => {
  describe('parseAxisBoundInput & formatAxisBoundValue', () => {
    it('parse correctement les nombres, virgules décimales, notations scientifiques et champs vides', () => {
      assert.deepEqual(parseAxisBoundInput(''), { empty: true, value: null, valid: true });
      assert.deepEqual(parseAxisBoundInput('   '), { empty: true, value: null, valid: true });
      assert.deepEqual(parseAxisBoundInput('12,5'), { empty: false, value: 12.5, valid: true });
      assert.deepEqual(parseAxisBoundInput('-3.25'), { empty: false, value: -3.25, valid: true });
      assert.deepEqual(parseAxisBoundInput('1 000,5'), { empty: false, value: 1000.5, valid: true });
      assert.deepEqual(parseAxisBoundInput('2,5e-3'), { empty: false, value: 0.0025, valid: true });
      assert.deepEqual(parseAxisBoundInput('abc'), { empty: false, value: null, valid: false });
      assert.deepEqual(parseAxisBoundInput('Infinity'), { empty: false, value: null, valid: false });
    });

    it('formate proprement les bornes sans bruit flottant ni -0', () => {
      assert.equal(formatAxisBoundValue(0.30000000000000004), '0.3');
      assert.equal(formatAxisBoundValue(-0), '0');
      assert.equal(formatAxisBoundValue(25), '25');
      assert.equal(formatAxisBoundValue(NaN), '');
      assert.equal(formatAxisBoundValue(undefined), '');
    });
  });

  describe('Grapher.setAxisBounds', () => {
    let data;
    let grapher;
    let xAxis;
    let yAxis;
    let redrawCount;

    beforeEach(() => {
      redrawCount = 0;
      data = new Data({ significantDigits: 4 });
      const t = data.addCurve('t', 's');
      t.push(10, 20, 30);
      const U = data.addCurve('U', 'V');
      U.push(5, 15, 25);

      grapher = new Grapher(data, {
        grapherGrid: true,
        minorGrid: false,
        includeOriginOnAutoZoom: true
      });

      const mockSeries = [
        {
          name: 'U',
          visible: true,
          options: { id: 'series-U', data: [[10, 5], [20, 15], [30, 25]] }
        },
        {
          name: 'Modèle',
          visible: true,
          options: { id: 'model-1', data: [[-100, -100], [500, 500]] }
        }
      ];

      const chart = {
        series: mockSeries,
        redraw() { redrawCount++; },
        options: { customGrapherInstance: grapher }
      };

      xAxis = Object.create(global.Highcharts.Axis.prototype);
      xAxis.isXAxis = true;
      xAxis.index = 0;
      xAxis.chart = chart;
      xAxis.min = 0;
      xAxis.max = 30.6;

      yAxis = Object.create(global.Highcharts.Axis.prototype);
      yAxis.isXAxis = false;
      yAxis.index = 0;
      yAxis.chart = chart;
      yAxis.min = 0;
      yAxis.max = 25.5;

      chart.xAxis = [xAxis];
      chart.yAxis = [yAxis];
      grapher.chart = chart;
      grapher.currentXCurve = 't';
    });

    it('applique les bornes numériques exactes sur X et Y avec un seul redraw', () => {
      const ok = grapher.setAxisBounds({ xMin: -5, xMax: 50, yMin: 0, yMax: 30 });
      assert.equal(ok, true);
      assert.equal(grapher.hasUserZoom, true);
      assert.equal(xAxis.min, -5);
      assert.equal(xAxis.max, 50);
      assert.equal(yAxis.min, 0);
      assert.equal(yAxis.max, 30);
      assert.equal(redrawCount, 1);
    });

    it('calcule proprement la borne manquante en mode partiel en ignorant les séries model-*', () => {
      grapher.setAxisBounds({ xMin: 5, xMax: null, yMin: null, yMax: 20 });
      assert.equal(grapher.hasUserZoom, true);
      assert.equal(xAxis.min, 5);
      assert.ok(xAxis.max >= 30 && xAxis.max < 35, `xAxis.max (${xAxis.max}) doit provenir des données réelles et ignorer model-1`);
      assert.equal(yAxis.min, 0, 'yAxis.min auto doit inclure 0 car includeOriginOnAutoZoom est true');
      assert.equal(yAxis.max, 20);
    });

    it('garantit min < max si une borne manuelle dépasse la borne automatique calculée', () => {
      grapher.setAxisBounds({ xMin: 100, xMax: null, yMin: null, yMax: -10 });
      assert.equal(xAxis.min, 100);
      assert.ok(xAxis.max > 100, `xAxis.max (${xAxis.max}) doit être strictement supérieur à xMin`);
      assert.equal(yAxis.max, -10);
      assert.ok(yAxis.min < -10, `yAxis.min (${yAxis.min}) doit être strictement inférieur à yMax`);
    });

    it('réinitialise le zoom lorsque toutes les bornes sont null', () => {
      grapher.hasUserZoom = true;
      grapher.setAxisBounds({ xMin: null, xMax: null, yMin: null, yMax: null });
      assert.equal(grapher.hasUserZoom, false);
      assert.equal(xAxis.min, 0);
      assert.equal(yAxis.min, 0);
    });
  });

  describe('UIManager.initAxisBoundsPopover', () => {
    const createMockEl = (overrides = {}) => {
      const classes = new Set();
      const listeners = {};
      return {
        value: '',
        textContent: '',
        classList: {
          add: (c) => classes.add(c),
          remove: (c) => classes.delete(c),
          contains: (c) => classes.has(c),
          toggle: (c, force) => {
            if (force === undefined) {
              if (classes.has(c)) { classes.delete(c); return false; }
              classes.add(c); return true;
            }
            if (force) classes.add(c); else classes.delete(c);
            return force;
          }
        },
        addEventListener: (type, fn) => {
          listeners[type] = listeners[type] || [];
          listeners[type].push(fn);
        },
        dispatch: (type, event = { preventDefault() {}, stopPropagation() {} }) => {
          (listeners[type] || []).forEach(fn => fn(event));
        },
        focus() {},
        select() {},
        ...overrides
      };
    };

    it('pré-remplit les bornes à l\'ouverture, valide la saisie et applique les bornes', () => {
      const elements = {
        '#axis-bounds-dropdown': createMockEl(),
        '#axis-bounds-button': createMockEl({
          getBoundingClientRect: () => ({ left: 900 })
        }),
        '#axis-bounds-popover': createMockEl(),
        '#axis-bounds-form': createMockEl(),
        '#axis-bounds-x-label': createMockEl(),
        '#axis-bounds-x-min': createMockEl(),
        '#axis-bounds-x-max': createMockEl(),
        '#axis-bounds-y-min': createMockEl(),
        '#axis-bounds-y-max': createMockEl(),
        '#axis-bounds-x-auto': createMockEl(),
        '#axis-bounds-y-auto': createMockEl(),
        '#axis-bounds-reset-btn': createMockEl(),
        '#axis-bounds-error': createMockEl(),
        '#tools-dropdown': createMockEl()
      };

      global.window = { innerWidth: 1000 };
      global.__querySelectorOverride = (sel) => elements[sel] || null;

      let appliedBounds = null;
      let resetCalled = false;

      const ui = Object.create(UIManager.prototype);
      ui.clearActiveTool = () => {};
      ui.data = {
        getCurveByTitle: (title) => title === 't' ? { title: 't', unit: 's' } : null
      };
      ui.grapher = {
        currentXCurve: 't',
        chart: {
          xAxis: [{ getExtremes: () => ({ min: 0, max: 10.5 }) }],
          yAxis: [{ getExtremes: () => ({ min: -2, max: 8 }) }]
        },
        setAxisBounds: (b) => { appliedBounds = b; return true; },
        resetZoom: () => { resetCalled = true; }
      };

      ui.initAxisBoundsPopover();

      // 1. Ouverture du popover (avec alignement is-right sur petit écran)
      elements['#axis-bounds-button'].dispatch('click');
      assert.equal(elements['#axis-bounds-dropdown'].classList.contains('is-active'), true);
      assert.equal(elements['#axis-bounds-dropdown'].classList.contains('is-right'), true);
      assert.equal(elements['#axis-bounds-x-label'].textContent, 'Abscisse : t (s)');
      assert.equal(elements['#axis-bounds-x-min'].value, '0');
      assert.equal(elements['#axis-bounds-x-max'].value, '10.5');
      assert.equal(elements['#axis-bounds-y-min'].value, '-2');
      assert.equal(elements['#axis-bounds-y-max'].value, '8');

      // 2. Erreur si min >= max
      elements['#axis-bounds-x-min'].value = '20';
      elements['#axis-bounds-x-max'].value = '10';
      elements['#axis-bounds-form'].dispatch('submit');
      assert.equal(appliedBounds, null);
      assert.equal(elements['#axis-bounds-error'].classList.contains('is-hidden'), false);
      assert.equal(elements['#axis-bounds-x-min'].classList.contains('is-danger'), true);

      // 3. Soumission valide avec virgule décimale et borne partielle
      elements['#axis-bounds-x-min'].value = '0,5';
      elements['#axis-bounds-x-max'].value = '12,5';
      elements['#axis-bounds-y-auto'].dispatch('click');
      assert.equal(elements['#axis-bounds-y-min'].value, '');
      assert.equal(elements['#axis-bounds-y-max'].value, '');
      elements['#axis-bounds-form'].dispatch('submit');
      assert.deepEqual(appliedBounds, { xMin: 0.5, xMax: 12.5, yMin: null, yMax: null });
      assert.equal(elements['#axis-bounds-dropdown'].classList.contains('is-active'), false);

      // 4. Bouton Tout auto
      elements['#axis-bounds-button'].dispatch('click');
      elements['#axis-bounds-reset-btn'].dispatch('click');
      assert.equal(resetCalled, true);
      assert.equal(elements['#axis-bounds-dropdown'].classList.contains('is-active'), false);
    });
  });
});
