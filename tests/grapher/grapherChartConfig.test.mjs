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
  });
});
