import '../helpers/setup.mjs';
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import UIManager from '../../grapher/modules/ui.js';

describe('Export Grapher - Renommage libre des grandeurs et unités', () => {
  const createMockUIManager = ({ xExponent = 0, yExponent = 0 } = {}) => {
    const curves = [
      { title: 't', unit: 's', color: '#2caffe', length: 2 },
      { title: 'vx', unit: 'm/s', color: '#544fc5', length: 2 }
    ];

    const dataMock = {
      curves,
      getCurveByTitle: (title) => curves.find(c => c.title === title) || null,
      getHeaders: () => curves.map(c => (c.unit ? `${c.title} (${c.unit})` : c.title)),
      getTable: () => [[0, 1.5], [1, 2.5]],
      settings: { significantDigits: 4 }
    };

    const svgCalls = [];
    const grapherMock = {
      currentXCurve: 't',
      chart: {
        chartWidth: 880,
        chartHeight: 550,
        xAxis: [{ exponent: xExponent }],
        yAxis: [{ exponent: yExponent }],
        series: [
          { name: 'vx', visible: true, options: { showInLegend: true }, userOptions: { unit: 'm/s' } }
        ],
        getSVG: (opts) => {
          svgCalls.push(opts);
          return `<svg data-x="${opts?.xAxis?.[0]?.title?.text || ''}"></svg>`;
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

    return { uiManager, curves, svgCalls };
  };

  describe('getExportCurveLabel', () => {
    it('retourne les valeurs d\'origine en l\'absence de surcharge', () => {
      const { uiManager } = createMockUIManager();
      assert.deepEqual(uiManager.getExportCurveLabel('vx', 'm/s'), { title: 'vx', unit: 'm/s' });
    });

    it('autorise les espaces, accents, underscores et symboles Unicode sans restriction', () => {
      const { uiManager } = createMockUIManager();
      uiManager.exportCurveLabels = {
        vx: { title: 'Vitesse horizontale v_x', unit: 'm·s⁻¹' }
      };
      assert.deepEqual(uiManager.getExportCurveLabel('vx', 'm/s'), {
        title: 'Vitesse horizontale v_x',
        unit: 'm·s⁻¹'
      });
    });

    it('permet de vider l\'unité tout en revenant au nom d\'origine si le titre personnalisé est vide', () => {
      const { uiManager } = createMockUIManager();
      uiManager.exportCurveLabels = {
        vx: { title: '   ', unit: '' }
      };
      assert.deepEqual(uiManager.getExportCurveLabel('vx', 'm/s'), {
        title: 'vx',
        unit: ''
      });
    });
  });

  describe('getExportChartOptions avec surcharges', () => {
    it('applique les noms et unités personnalisés sur l\'axe X et la légende Y, avec puissances de 10', () => {
      const { uiManager, curves } = createMockUIManager({ xExponent: -3, yExponent: 3 });
      uiManager.exportCurveLabels = {
        t: { title: 'Temps écoulé', unit: 's' },
        vx: { title: 'Vitesse horizontale', unit: 'm·s⁻¹' }
      };

      const options = uiManager.getExportChartOptions(880, 550, 1);

      assert.equal(options.xAxis[0].title.text, 'Temps écoulé (×10⁻³ s)');
      assert.deepEqual(options.chart.exportCurveLabels, {
        t: { title: 'Temps écoulé', unit: 's' },
        vx: { title: 'Vitesse horizontale', unit: 'm·s⁻¹' }
      });

      const legendLabel = options.legend.labelFormatter.call({
        name: 'vx',
        userOptions: { unit: 'm/s' },
        chart: { yAxis: [{ exponent: 3 }] }
      });
      assert.equal(legendLabel, 'Vitesse horizontale (×10³ m·s⁻¹)');

      // Vérifie que les courbes d'origine n'ont pas été mutées
      assert.equal(curves[0].title, 't');
      assert.equal(curves[0].unit, 's');
      assert.equal(curves[1].title, 'vx');
      assert.equal(curves[1].unit, 'm/s');
    });

    it('permet de supprimer l\'unité sur l\'axe X ou en légende sans casser le formatage', () => {
      const { uiManager } = createMockUIManager({ xExponent: 0, yExponent: 0 });
      uiManager.exportCurveLabels = {
        t: { title: 'Numéro de mesure', unit: '' },
        vx: { title: 'Rapport sans dimension', unit: '' }
      };

      const options = uiManager.getExportChartOptions(880, 550, 1);
      assert.equal(options.xAxis[0].title.text, 'Numéro de mesure');

      const legendLabel = options.legend.labelFormatter.call({
        name: 'vx',
        userOptions: { unit: 'm/s' },
        chart: { yAxis: [{ exponent: 0 }] }
      });
      assert.equal(legendLabel, 'Rapport sans dimension');
    });
  });

  describe('generatePrintHTML avec surcharges', () => {
    it('utilise les noms et unités personnalisés (échappés HTML) dans les en-têtes du tableur', () => {
      const { uiManager, curves } = createMockUIManager();
      uiManager.exportCurveLabels = {
        t: { title: 'Temps <t>', unit: 's' },
        vx: { title: 'Vitesse & cap', unit: 'm·s⁻¹' }
      };

      const html = uiManager.generatePrintHTML(false, true, false, '1cm', 'TP', 880, 550, 1);

      assert.ok(html.includes('<div class="flex-cell row-header">Temps &lt;t&gt; (s)</div>'));
      assert.ok(html.includes('<div class="flex-cell row-header">Vitesse &amp; cap (m·s⁻¹)</div>'));
      assert.ok(!html.includes('<t>'));
      assert.equal(curves[0].title, 't');
      assert.equal(curves[1].title, 'vx');
    });
  });

  describe('initExportModal - Interface de renommage et réinitialisation', () => {
    let mockElements;
    let originalCreateElement;

    const createMockEl = (tag = 'div', value = '') => {
      const classList = new Set();
      const listeners = {};
      const children = [];
      const attrs = {};
      return {
        tagName: tag.toUpperCase(),
        type: '',
        value,
        placeholder: '',
        checked: false,
        disabled: false,
        textContent: '',
        className: '',
        style: {},
        parentElement: null,
        children,
        get innerHTML() {
          return this._innerHTML || '';
        },
        set innerHTML(v) {
          this._innerHTML = v;
          if (v === '') children.length = 0;
        },
        appendChild(child) {
          child.parentElement = this;
          children.push(child);
          return child;
        },
        setAttribute(k, v) {
          attrs[k] = v;
        },
        getAttribute(k) {
          return attrs[k];
        },
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

    const findInputs = (node, acc = []) => {
      if (!node) return acc;
      if (node.tagName === 'INPUT') acc.push(node);
      if (Array.isArray(node.children)) {
        node.children.forEach(c => findInputs(c, acc));
      }
      return acc;
    };

    beforeEach(() => {
      originalCreateElement = global.document.createElement;
      global.document.createElement = (tag) => createMockEl(tag);

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
        '#export-graph-size': createMockEl('select', '1'),
        '#export-image-format': createMockEl('select', 'image/png'),
        '#export-image-scale': createMockEl('select', '2'),
        '#export-image-dimensions-info': createMockEl('p'),
        '#export-rename-list': createMockEl('div'),
        '#export-rename-reset-btn': createMockEl('button'),
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
      global.document.createElement = originalCreateElement;
      global.__querySelectorOverride = null;
      global.__getElementByIdOverride = null;
      global.__querySelectorAllOverride = null;
    });

    it('peuple les champs de renommage, applique les modifications puis les réinitialise', (t, done) => {
      const { uiManager, svgCalls } = createMockUIManager();
      uiManager.initExportModal();

      mockElements['#export-menu-button'].click();

      const inputs = findInputs(mockElements['#export-rename-list']);
      // 2 courbes × 2 inputs (nom + unité)
      assert.equal(inputs.length, 4);
      assert.equal(inputs[0].value, 't');
      assert.equal(inputs[1].value, 's');
      assert.equal(inputs[2].value, 'vx');
      assert.equal(inputs[3].value, 'm/s');

      // Modifie le nom de l'axe X
      inputs[0].value = 'Temps écoulé';
      inputs[0].dispatchEvent('input');

      assert.deepEqual(uiManager.exportCurveLabels.t, { title: 'Temps écoulé', unit: 's' });

      setTimeout(() => {
        assert.ok(svgCalls.length >= 2, 'L\'aperçu doit être rafraîchi après le debounce');
        assert.equal(svgCalls[svgCalls.length - 1].xAxis[0].title.text, 'Temps écoulé (s)');

        // Réinitialisation
        mockElements['#export-rename-reset-btn'].click();
        assert.deepEqual(uiManager.exportCurveLabels, {});
        assert.equal(svgCalls[svgCalls.length - 1].xAxis[0].title.text, 't (s)');

        const resetInputs = findInputs(mockElements['#export-rename-list']);
        assert.equal(resetInputs[0].value, 't');
        done();
      }, 260);
    });
  });
});
