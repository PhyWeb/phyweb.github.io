import '../helpers/setup.mjs';
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import UIManager, { sanitizeExportFilename } from '../../grapher/modules/ui.js';

describe('Export Grapher - Mode Image (Titre, Nom de fichier, Fond transparent)', () => {
  const createMockUIManager = () => {
    const curves = [{ title: 't', unit: 's', length: 2 }];
    const dataMock = {
      curves,
      getCurveByTitle: () => curves[0],
      getHeaders: () => ['t (s)'],
      getTable: () => [[0], [1]],
      settings: { significantDigits: 4 }
    };

    const calls = { getSVG: [], exportChartLocal: [] };
    const grapherMock = {
      currentXCurve: 't',
      chart: {
        chartWidth: 880,
        chartHeight: 550,
        xAxis: [{ exponent: 0 }],
        yAxis: [{ exponent: 0 }],
        series: [{ name: 'U', visible: true, options: { showInLegend: true }, userOptions: { unit: 'V' } }],
        getSVG: (opts) => {
          calls.getSVG.push(opts);
          return `<svg data-bg="${opts?.chart?.backgroundColor || ''}" data-title="${opts?.title?.text || ''}"></svg>`;
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

    return { uiManager, calls };
  };

  describe('sanitizeExportFilename', () => {
    it('nettoie les caractères interdits et remplace les espaces par des underscores', () => {
      assert.equal(sanitizeExportFilename('TP Physique : Chute libre / 2026'), 'TP_Physique_Chute_libre_2026');
      assert.equal(sanitizeExportFilename('  mon*graphe?  '), 'mongraphe');
      assert.equal(sanitizeExportFilename('...test___'), 'test');
    });

    it('retourne le nom par défaut si la chaîne est vide ou invalide', () => {
      assert.equal(sanitizeExportFilename(''), 'phyweb_graphe');
      assert.equal(sanitizeExportFilename('   '), 'phyweb_graphe');
      assert.equal(sanitizeExportFilename('///:::***', 'defaut'), 'defaut');
      assert.equal(sanitizeExportFilename(null), 'phyweb_graphe');
    });
  });

  describe('getExportChartOptions & generateImagePreviewHTML', () => {
    it('inclut le titre mis à l\'échelle et le fond transparent dans les options', () => {
      const { uiManager } = createMockUIManager();
      const opts = uiManager.getExportChartOptions(880, 550, 1.5, {}, {
        title: 'Chute libre',
        transparentBg: true
      });

      assert.equal(opts.title.text, 'Chute libre');
      assert.equal(opts.title.style.fontSize, '27px');
      assert.equal(opts.chart.backgroundColor, 'transparent');
      assert.equal(opts.chart.plotBackgroundColor, 'transparent');
    });

    it('affiche un damier de transparence dans l\'aperçu Image quand transparentBg est actif', () => {
      const { uiManager } = createMockUIManager();
      const html = uiManager.generateImagePreviewHTML('Mon Graphe', 880, 550, 1, {}, { transparentBg: true });

      assert.ok(html.includes('repeating-conic-gradient'), 'Doit afficher le damier de transparence');
      assert.ok(html.includes('data-bg="transparent"'));
      assert.ok(html.includes('data-title="Mon Graphe"'));
    });
  });

  describe('initExportModal - Interactions Mode Image', () => {
    let mockElements;

    const createMockEl = (tag = 'div', value = '') => {
      const classList = new Set();
      const listeners = {};
      return {
        tagName: tag.toUpperCase(),
        value,
        placeholder: '',
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
        '#export-title-input': createMockEl('input', 'TP Optique'),
        '#export-filename-input': createMockEl('input', ''),
        '#export-transparent-bg': createMockEl('input'),
        '#export-graph-ratio': createMockEl('select', '16:10'),
        '#export-graph-size': createMockEl('select', '1'),
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
      global.__querySelectorAllOverride = () => [];
    });

    afterEach(() => {
      global.__querySelectorOverride = null;
      global.__getElementByIdOverride = null;
      global.__querySelectorAllOverride = null;
    });

    it('dérive le nom de fichier du titre si vide, sinon utilise le nom saisi, et gère le fond transparent selon le format', () => {
      const { uiManager, calls } = createMockUIManager();
      uiManager.initExportModal();

      mockElements['#export-transparent-bg'].checked = true;
      mockElements['#export-menu-button'].click();

      // 1. PNG avec titre "TP Optique" et nom de fichier vide -> filename = "TP_Optique", fond transparent
      mockElements['#export-confirm-button'].click();
      assert.equal(calls.exportChartLocal[0].exportingOptions.filename, 'TP_Optique');
      assert.equal(calls.exportChartLocal[0].chartOptions.title.text, 'TP Optique');
      assert.equal(calls.exportChartLocal[0].chartOptions.chart.backgroundColor, 'transparent');

      // 2. Passage en JPEG -> désactive le fond transparent et force #ffffff
      mockElements['#export-image-format'].value = 'image/jpeg';
      mockElements['#export-image-format'].dispatchEvent('change');
      assert.equal(mockElements['#export-transparent-bg'].disabled, true);

      mockElements['#export-filename-input'].value = 'mon graphe final';
      mockElements['#export-confirm-button'].click();
      assert.equal(calls.exportChartLocal[1].exportingOptions.filename, 'mon_graphe_final');
      assert.equal(calls.exportChartLocal[1].chartOptions.chart.backgroundColor, '#ffffff');
    });
  });
});
