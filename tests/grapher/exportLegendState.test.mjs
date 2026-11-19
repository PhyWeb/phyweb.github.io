import '../helpers/setup.mjs';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import UIManager from '../../grapher/modules/ui.js';

describe('Export Grapher - Masquage des séries invisibles dans la légende exportée (_withExportLegendState)', () => {
  const createMockUIManager = (seriesConfig = []) => {
    const series = seriesConfig.map(cfg => ({
      name: cfg.name,
      visible: cfg.visible,
      options: { showInLegend: cfg.optionsShowInLegend !== undefined ? cfg.optionsShowInLegend : true },
      userOptions: {
        ...(cfg.userOptionsShowInLegend !== undefined ? { showInLegend: cfg.userOptionsShowInLegend } : {})
      }
    }));

    const grapherMock = {
      currentXCurve: 't',
      chart: {
        xAxis: [{ exponent: 0 }],
        yAxis: [{ exponent: 0 }],
        series: series,
        getSVG: (exportOptions) => {
          // Simule la lecture de userOptions comme le fait Highcharts en interne
          const legendItems = series
            .filter(s => s.userOptions.showInLegend)
            .map(s => s.name);
          return `<svg data-legend="${legendItems.join(',')}"></svg>`;
        },
        exportChartLocal: (exportingOptions, exportChartOptions) => {
          return true;
        }
      }
    };

    const uiManager = new UIManager({}, { getCurveByTitle: () => null }, grapherMock, {}, {}, {});
    return { uiManager, grapherMock, series };
  };

  it('getExportChartOptions ne doit plus contenir de propriété series', () => {
    const { uiManager } = createMockUIManager();
    const options = uiManager.getExportChartOptions(800, 500, 1);
    assert.strictEqual(options.series, undefined, 'options.series ne doit plus être défini');
  });

  it('_withExportLegendState doit masquer les séries invisibles et conserver les séries visibles', () => {
    const { uiManager, series } = createMockUIManager([
      { name: 'U', visible: true, optionsShowInLegend: true, userOptionsShowInLegend: true },
      { name: 'I', visible: false, optionsShowInLegend: true, userOptionsShowInLegend: true },
      { name: 'Model', visible: true, optionsShowInLegend: false, userOptionsShowInLegend: false }
    ]);

    let executed = false;
    const result = uiManager._withExportLegendState(() => {
      executed = true;
      assert.strictEqual(series[0].userOptions.showInLegend, true, 'Série visible: showInLegend doit être true');
      assert.strictEqual(series[1].userOptions.showInLegend, false, 'Série masquée: showInLegend doit être false');
      assert.strictEqual(series[2].userOptions.showInLegend, false, 'Modèle masqué de légende: showInLegend doit être false');
      return 'success';
    });

    assert.strictEqual(executed, true);
    assert.strictEqual(result, 'success');

    // Vérifie la restauration des valeurs originales
    assert.strictEqual(series[0].userOptions.showInLegend, true, 'Restauration série 0');
    assert.strictEqual(series[1].userOptions.showInLegend, true, 'Restauration série 1');
    assert.strictEqual(series[2].userOptions.showInLegend, false, 'Restauration série 2');
  });

  it('_withExportLegendState doit restaurer les userOptions même en cas d\'erreur dans le callback', () => {
    const { uiManager, series } = createMockUIManager([
      { name: 'U', visible: true, optionsShowInLegend: true, userOptionsShowInLegend: true },
      { name: 'I', visible: false, optionsShowInLegend: true, userOptionsShowInLegend: true }
    ]);

    assert.throws(() => {
      uiManager._withExportLegendState(() => {
        throw new Error('Test error');
      });
    }, /Test error/);

    assert.strictEqual(series[0].userOptions.showInLegend, true, 'Restauration série visible après exception');
    assert.strictEqual(series[1].userOptions.showInLegend, true, 'Restauration série masquée après exception');
  });

  it('generateImagePreviewHTML doit générer le SVG avec _withExportLegendState', () => {
    const { uiManager } = createMockUIManager([
      { name: 'U', visible: true, optionsShowInLegend: true, userOptionsShowInLegend: true },
      { name: 'I', visible: false, optionsShowInLegend: true, userOptionsShowInLegend: true }
    ]);

    const html = uiManager.generateImagePreviewHTML('Titre', 800, 500, 1);
    assert.ok(html.includes('data-legend="U"'), 'Seule la série visible U doit figurer dans la légende');
    assert.ok(!html.includes('data-legend="U,I"'), 'La série masquée I ne doit pas figurer dans la légende');
  });

  it('generatePrintHTML doit générer le SVG avec _withExportLegendState', () => {
    const { uiManager } = createMockUIManager([
      { name: 'U', visible: true, optionsShowInLegend: true, userOptionsShowInLegend: true },
      { name: 'I', visible: false, optionsShowInLegend: true, userOptionsShowInLegend: true }
    ]);

    const html = uiManager.generatePrintHTML(true, false, false, '1cm', 'Titre', 800, 500, 1);
    assert.ok(html.includes('data-legend="U"'), 'Seule la série visible U doit figurer dans la légende du SVG imprimé');
    assert.ok(!html.includes('data-legend="U,I"'), 'La série masquée I ne doit pas figurer dans la légende');
  });
});
