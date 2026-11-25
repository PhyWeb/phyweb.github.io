import '../helpers/setup.mjs';
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import Data from '../../grapher/modules/data.js';
import Grapher from '../../grapher/modules/grapher.js';
import UIManager from '../../grapher/modules/ui.js';
import { DEFAULT_SETTINGS, loadSettings, saveSettings, clearSavedSettings } from '../../grapher/modules/settingsManager.js';

describe('Grapher - Mise en évidence des axes à zéro (x = 0, y = 0)', () => {
  let data;

  beforeEach(() => {
    clearSavedSettings();
    data = new Data({ significantDigits: 4 });
  });

  it('doit être activée par défaut dans DEFAULT_SETTINGS et loadSettings()', () => {
    assert.equal(DEFAULT_SETTINGS.highlightZeroAxes, true);
    assert.equal(loadSettings().highlightZeroAxes, true);

    saveSettings({ ...DEFAULT_SETTINGS, highlightZeroAxes: false });
    assert.equal(loadSettings().highlightZeroAxes, false);
  });

  it('doit initialiser highlightZeroAxes à true par défaut dans Grapher et respecter false', () => {
    const gDefault = new Grapher(data, { grapherGrid: true });
    assert.equal(gDefault.highlightZeroAxes, true);

    const gDisabled = new Grapher(data, { grapherGrid: true, highlightZeroAxes: false });
    assert.equal(gDisabled.highlightZeroAxes, false);
  });

  it('doit configurer des plotLines épaisses à value=0 sur xAxis et yAxis lors de newChart()', () => {
    let capturedConfig = null;
    const origChart = global.Highcharts.chart;
    const origAddEvent = global.Highcharts.addEvent;

    global.Highcharts.addEvent = () => {};
    global.Highcharts.chart = (_container, config) => {
      capturedConfig = config;
      return {
        options: { customGrapherInstance: null },
        container: { addEventListener: () => {} },
        xAxis: [{}],
        yAxis: [{}],
        series: []
      };
    };

    try {
      const gEnabled = new Grapher(data, { grapherGrid: true, highlightZeroAxes: true });
      gEnabled.newChart();

      assert.equal(capturedConfig.xAxis[0].plotLines.length, 1);
      assert.equal(capturedConfig.xAxis[0].plotLines[0].value, 0);
      assert.ok(capturedConfig.xAxis[0].plotLines[0].width > 1);

      assert.equal(capturedConfig.yAxis[0].plotLines.length, 1);
      assert.equal(capturedConfig.yAxis[0].plotLines[0].value, 0);
      assert.ok(capturedConfig.yAxis[0].plotLines[0].width > 1);

      const gDisabled = new Grapher(data, { grapherGrid: true, highlightZeroAxes: false });
      gDisabled.newChart();

      assert.deepEqual(capturedConfig.xAxis[0].plotLines, []);
      assert.deepEqual(capturedConfig.yAxis[0].plotLines, []);
    } finally {
      global.Highcharts.chart = origChart;
      global.Highcharts.addEvent = origAddEvent;
    }
  });

  it('setHighlightZeroAxes() doit mettre à jour les plotLines sur les deux axes', () => {
    const grapher = new Grapher(data, { grapherGrid: true, highlightZeroAxes: true });
    const updates = [];
    grapher.chart = {
      update(opts) {
        updates.push(opts);
      }
    };

    grapher.setHighlightZeroAxes(false);
    assert.equal(grapher.highlightZeroAxes, false);
    assert.equal(updates.length, 1);
    assert.deepEqual(updates[0].xAxis.plotLines, []);
    assert.deepEqual(updates[0].yAxis.plotLines, []);

    grapher.setHighlightZeroAxes(true);
    assert.equal(grapher.highlightZeroAxes, true);
    assert.equal(updates.length, 2);
    assert.equal(updates[1].xAxis.plotLines.length, 1);
    assert.equal(updates[1].xAxis.plotLines[0].value, 0);
    assert.equal(updates[1].yAxis.plotLines.length, 1);
    assert.equal(updates[1].yAxis.plotLines[0].value, 0);
  });

  it('UIManager doit synchroniser highlightZeroAxes avec la modale des paramètres', () => {
    const elements = {
      'significant-digits-select': { value: '4' },
      'graph-grid-switch': { checked: true },
      'graph-grid-minor-switch': { checked: false },
      'highlight-zero-axes-switch': { checked: true },
      'graph-disable-scientific-switch': { checked: false },
      'include-origin-switch': { checked: true },
      'derivative-points-select': { value: '5' },
      'derivate-edges-switch': { checked: false },
      'save-settings-permanently-switch': { checked: false }
    };

    const prevQS = global.__querySelectorOverride;
    const prevGEBI = global.__getElementByIdOverride;
    global.__querySelectorOverride = (sel) => elements[sel.replace(/^#/, '')] || { checked: false, value: '' };
    global.__getElementByIdOverride = (id) => elements[id] || { checked: false, value: '' };

    try {
      const grapher = new Grapher(data, { ...DEFAULT_SETTINGS, highlightZeroAxes: true });
      const updates = [];
      grapher.chart = {
        update(opts) { updates.push(opts); },
        redraw() {}
      };
      const calculation = { derivatePoints: 5, derivateEdges: false };
      const ui = new UIManager({}, data, grapher, calculation, { getValue: () => '' }, { update: () => {} });

      assert.equal(ui.readCurrentAppSettings().highlightZeroAxes, true);

      ui.loadSettingsIntoModalUI({ ...DEFAULT_SETTINGS, highlightZeroAxes: false });
      assert.equal(elements['highlight-zero-axes-switch'].checked, false);

      const read = ui.readSettingsFromModal();
      assert.equal(read.highlightZeroAxes, false);

      ui.applySettingsToApp(read);
      assert.equal(grapher.highlightZeroAxes, false);
      assert.equal(updates.length, 1);
      assert.deepEqual(updates[0].xAxis.plotLines, []);
      assert.deepEqual(updates[0].yAxis.plotLines, []);
    } finally {
      global.__querySelectorOverride = prevQS;
      global.__getElementByIdOverride = prevGEBI;
    }
  });
});
