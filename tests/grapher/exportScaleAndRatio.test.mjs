import '../helpers/setup.mjs';
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import UIManager, { EXPORT_RATIO_DIMENSIONS } from '../../grapher/modules/ui.js';

describe('Export Grapher - Format (ratio), échelle des textes et résolution', () => {
  const createMockUIManager = ({ chartWidth = 1420, chartHeight = 620 } = {}) => {
    const dataMock = {
      curves: [{ title: 't', unit: 's', length: 3 }],
      getCurveByTitle: (title) => (title === 't' ? { title: 't', unit: 's' } : null),
      getHeaders: () => ['t (s)'],
      getTable: () => [[0], [1], [2]],
      settings: { significantDigits: 4 }
    };

    const calls = {
      getSVG: [],
      exportChartLocal: []
    };

    const grapherMock = {
      currentXCurve: 't',
      chart: {
        chartWidth,
        chartHeight,
        xAxis: [{ exponent: 0 }],
        yAxis: [{ exponent: 0 }],
        series: [{ name: 'U', visible: true, options: { showInLegend: true }, userOptions: { unit: 'V' } }],
        getSVG: (opts) => {
          calls.getSVG.push(opts);
          return `<svg width="${opts?.chart?.width}" height="${opts?.chart?.height}"></svg>`;
        },
        exportChartLocal: (exportingOptions, chartOptions) => {
          calls.exportChartLocal.push({ exportingOptions, chartOptions });
        }
      }
    };

    const uiManager = new UIManager(
      { modalManager: { openModal: () => {}, closeAllModals: () => {} } },
      dataMock,
      grapherMock,
      {},
      { getValue: () => '' },
      {}
    );

    return { uiManager, grapherMock, calls };
  };

  describe('getExportDimensions', () => {
    it('doit retourner des dimensions fixes indépendantes de la fenêtre pour les presets', () => {
      const { uiManager } = createMockUIManager({ chartWidth: 2200, chartHeight: 500 });

      assert.deepEqual(uiManager.getExportDimensions('16:10'), EXPORT_RATIO_DIMENSIONS['16:10']);
      assert.deepEqual(uiManager.getExportDimensions('16:9'), EXPORT_RATIO_DIMENSIONS['16:9']);
      assert.deepEqual(uiManager.getExportDimensions('4:3'), EXPORT_RATIO_DIMENSIONS['4:3']);
      assert.deepEqual(uiManager.getExportDimensions('1:1'), EXPORT_RATIO_DIMENSIONS['1:1']);
    });

    it('doit utiliser les dimensions écran du graphique pour le ratio "screen"', () => {
      const { uiManager } = createMockUIManager({ chartWidth: 1234.6, chartHeight: 612.2 });
      assert.deepEqual(uiManager.getExportDimensions('screen'), { w: 1235, h: 612 });
    });

    it('doit revenir au preset 16:10 si le graphique n\'a pas de dimensions valides en mode "screen"', () => {
      const { uiManager } = createMockUIManager({ chartWidth: 0, chartHeight: 0 });
      assert.deepEqual(uiManager.getExportDimensions('screen'), EXPORT_RATIO_DIMENSIONS['16:10']);
    });
  });

  describe('getExportChartOptions - Échelle des textes sans réduire les dimensions', () => {
    it('doit conserver width et height intacts tout en agrandissant les polices et espacements', () => {
      const { uiManager } = createMockUIManager();

      const optsNormal = uiManager.getExportChartOptions(880, 550, 1);
      const optsLarge = uiManager.getExportChartOptions(880, 550, 1.5);

      assert.equal(optsLarge.chart.width, 880);
      assert.equal(optsLarge.chart.height, 550);
      assert.equal(optsLarge.chart.exportTextScale, 1.5);

      assert.equal(optsNormal.xAxis[0].title.style.fontSize, '16px');
      assert.equal(optsNormal.xAxis[0].labels.style.fontSize, '12px');
      assert.equal(optsNormal.yAxis[0].labels.style.fontSize, '12px');
      assert.equal(optsNormal.legend.itemStyle.fontSize, '16px');

      assert.equal(optsLarge.xAxis[0].title.style.fontSize, '24px');
      assert.equal(optsLarge.xAxis[0].labels.style.fontSize, '18px');
      assert.equal(optsLarge.yAxis[0].labels.style.fontSize, '18px');
      assert.equal(optsLarge.legend.itemStyle.fontSize, '24px');
      assert.equal(optsLarge.legend.symbolWidth, 24);
      assert.equal(optsLarge.legend.itemDistance, 30);
    });

    it('doit gérer proprement une échelle réduite (0.85) ou invalide (repli à 1)', () => {
      const { uiManager } = createMockUIManager();

      const optsSmall = uiManager.getExportChartOptions(800, 600, 0.85);
      assert.equal(optsSmall.xAxis[0].title.style.fontSize, '14px');
      assert.equal(optsSmall.xAxis[0].labels.style.fontSize, '10px');
      // Les espacements ne doivent pas descendre sous le minimum de base
      assert.deepEqual(optsSmall.chart.spacing, [10, 10, 15, 10]);

      const optsInvalid = uiManager.getExportChartOptions(800, 600, NaN);
      assert.equal(optsInvalid.chart.exportTextScale, 1);
      assert.equal(optsInvalid.xAxis[0].title.style.fontSize, '16px');
    });
  });

  describe('generatePrintHTML - CSS du conteneur SVG', () => {
    it('doit étirer le SVG sur la largeur imprimable avec une hauteur maximale A4', () => {
      const { uiManager } = createMockUIManager();
      const html = uiManager.generatePrintHTML(true, false, false, '1cm', 'Test', 880, 550, 1.5);

      assert.ok(html.includes('width: 100%'), 'Le SVG imprimé doit utiliser width: 100%');
      assert.ok(html.includes('max-height: 240mm'), 'Le SVG imprimé doit respecter la hauteur d\'une page A4');
    });
  });

  describe('initExportModal - Interactions Format, Résolution et Export Image', () => {
    let mockElements;

    const createMockEl = (tag = 'div', value = '') => {
      const classList = new Set();
      const listeners = {};
      return {
        tagName: tag.toUpperCase(),
        value,
        checked: false,
        disabled: false,
        textContent: '',
        innerHTML: '',
        style: {},
        parentElement: null,
        classList: {
          add: (...c) => c.forEach(x => classList.add(x)),
          remove: (...c) => c.forEach(x => classList.delete(x)),
          contains: (c) => classList.has(c)
        },
        addEventListener: (type, fn) => {
          if (!listeners[type]) listeners[type] = [];
          listeners[type].push(fn);
        },
        dispatchEvent: (e) => {
          const type = typeof e === 'string' ? e : e.type;
          (listeners[type] || []).forEach(fn => fn(e));
        },
        click: function () {
          this.dispatchEvent({ type: 'click', preventDefault: () => {} });
        },
        closest: () => null
      };
    };

    beforeEach(() => {
      if (typeof localStorage !== 'undefined' && typeof localStorage.clear === 'function') {
        localStorage.clear();
      }
      const iframe = createMockEl('iframe');
      iframe.parentElement = createMockEl('div');

      const emptyState = createMockEl('div');
      emptyState.classList.add('is-hidden');

      const grapheurTab = createMockEl('li');
      grapheurTab.classList.add('is-active');

      mockElements = {
        '#empty-state-container': emptyState,
        '#grapheur-tab': grapheurTab,
        '#export-menu-button': createMockEl('a'),
        '#export-modal': createMockEl('div'),
        '#export-action-select': createMockEl('select', 'image'),
        '#export-sections-container': createMockEl('div'),
        '#export-image-options': createMockEl('div'),
        '#export-confirm-button': createMockEl('button'),
        '#export-copy-button': createMockEl('button'),
        '#export-preview-iframe': iframe,
        '#export-title-input': createMockEl('input', ''),
        '#export-graph-ratio': createMockEl('select', '16:10'),
        '#export-graph-size': createMockEl('select', '1.5'),
        '#export-image-format': createMockEl('select', 'image/png'),
        '#export-image-scale': createMockEl('select', '2'),
        '#export-image-dimensions-info': createMockEl('p'),
        '#export-check-graph': createMockEl('input'),
        '#export-check-table': createMockEl('input'),
        '#export-check-calc': createMockEl('input'),
        '#export-margin-select': createMockEl('select', '1cm'),
        '#export-table-label': createMockEl('span')
      };

      global.__querySelectorOverride = (sel) => mockElements[sel] || null;
      global.__getElementByIdOverride = (id) => mockElements['#' + id] || null;
      global.__querySelectorAllOverride = (sel) => {
        if (sel === '.export-trigger') {
          return [mockElements['#export-graph-ratio'], mockElements['#export-graph-size']];
        }
        return [];
      };
    });

    afterEach(() => {
      global.__querySelectorOverride = null;
      global.__getElementByIdOverride = null;
      global.__querySelectorAllOverride = null;
    });

    it('doit désactiver la résolution pour SVG, afficher les dimensions exactes et ne pas régénérer le SVG inutilement', () => {
      const { uiManager, calls } = createMockUIManager();
      uiManager.initExportModal();

      // Ouverture initiale en mode Image (PNG, x2, 16:10 -> 880x550 * 2 = 1760x1100)
      mockElements['#export-menu-button'].click();
      assert.equal(calls.getSVG.length, 1);
      assert.equal(mockElements['#export-image-scale'].disabled, false);
      assert.equal(mockElements['#export-image-dimensions-info'].textContent, 'Dimensions : 1760 × 1100 px');

      // Changement de résolution -> met à jour l'info SANS rappeler getSVG
      mockElements['#export-image-scale'].value = '3';
      mockElements['#export-image-scale'].dispatchEvent('change');
      assert.equal(calls.getSVG.length, 1, 'Changer la résolution ne doit pas régénérer l\'aperçu SVG');
      assert.equal(mockElements['#export-image-dimensions-info'].textContent, 'Dimensions : 2640 × 1650 px');

      // Passage en SVG -> désactive #export-image-scale et affiche le format vectoriel SANS rappeler getSVG
      mockElements['#export-image-format'].value = 'image/svg+xml';
      mockElements['#export-image-format'].dispatchEvent('change');
      assert.equal(calls.getSVG.length, 1, 'Changer le format ne doit pas régénérer l\'aperçu SVG');
      assert.equal(mockElements['#export-image-scale'].disabled, true);
      assert.equal(mockElements['#export-image-dimensions-info'].textContent, 'Format vectoriel (880 × 550)');
    });

    it('doit conserver la pleine résolution lors de l\'export image même avec des textes agrandis (150%)', () => {
      const { uiManager, calls } = createMockUIManager();
      uiManager.initExportModal();

      mockElements['#export-menu-button'].click();
      mockElements['#export-confirm-button'].click();

      assert.equal(calls.exportChartLocal.length, 1);
      const { exportingOptions, chartOptions } = calls.exportChartLocal[0];
      assert.equal(exportingOptions.type, 'image/png');
      assert.equal(exportingOptions.scale, 2);
      assert.equal(exportingOptions.sourceWidth, 880);
      assert.equal(exportingOptions.sourceHeight, 550);
      assert.equal(chartOptions.chart.exportTextScale, 1.5);
      assert.equal(chartOptions.xAxis[0].title.style.fontSize, '24px');

      // En SVG, scale doit être forcé à 1
      mockElements['#export-image-format'].value = 'image/svg+xml';
      mockElements['#export-confirm-button'].click();
      assert.equal(calls.exportChartLocal[1].exportingOptions.scale, 1);
    });

    it('doit mémoriser et restaurer les préférences d\'export via localStorage', () => {
      const { uiManager } = createMockUIManager();
      uiManager.initExportModal();

      mockElements['#export-image-format'].value = 'image/jpeg';
      mockElements['#export-image-format'].dispatchEvent('change');
      mockElements['#export-image-scale'].value = '3';
      mockElements['#export-image-scale'].dispatchEvent('change');

      // Nouvelle initialisation avec d'autres valeurs par défaut -> doit restaurer JPEG et x3
      mockElements['#export-image-format'].value = 'image/png';
      mockElements['#export-image-scale'].value = '1';
      uiManager.initExportModal();

      assert.equal(mockElements['#export-image-format'].value, 'image/jpeg');
      assert.equal(mockElements['#export-image-scale'].value, '3');
    });
  });
});
