import '../helpers/setup.mjs';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import UIManager from '../../grapher/modules/ui.js';

describe('Export Grapher - Mode Document (Modélisations, Orientation, Tableau vertical, Aperçu A4)', () => {
  const createMockUIManager = ({ models = [], curves = null, table = null } = {}) => {
    const defaultCurves = curves || [
      { title: 't', unit: 's', length: 2 },
      { title: 'U', unit: 'V', length: 2 }
    ];
    const defaultTable = table || [[0, 1.2], [1, 3.4]];

    const dataMock = {
      curves: defaultCurves,
      models,
      parameters: {},
      settings: { significantDigits: 4 },
      getCurveByTitle: (title) => defaultCurves.find(c => c.title === title) || null,
      getHeaders: () => defaultCurves.map(c => (c.unit ? `${c.title} (${c.unit})` : c.title)),
      getTable: () => defaultTable
    };

    const grapherMock = {
      currentXCurve: 't',
      chart: {
        chartWidth: 880,
        chartHeight: 550,
        xAxis: [{ exponent: 0 }],
        yAxis: [{ exponent: 0 }],
        series: [{ name: 'U', visible: true, options: { showInLegend: true }, userOptions: { unit: 'V' } }],
        getSVG: () => '<svg></svg>'
      }
    };

    const uiManager = new UIManager({}, dataMock, grapherMock, {}, { getValue: () => 'U = 2 * t' }, {});
    return { uiManager };
  };

  describe('Section Modélisations', () => {
    it('inclut les modèles visibles avec équation, paramètres, bornes, RMSE, R² et noms renommés', () => {
      const models = [
        {
          id: 'm1',
          visible: true,
          color: '#e74c3c',
          x: { title: 't', unit: 's' },
          y: { title: 'U', unit: 'V' },
          minX: 0,
          maxX: 5,
          rmse: 0.0123,
          rSquared: 0.9998,
          parameters: [
            { name: 'a', value: 2.2, unit: 'V/s' },
            { name: 'b', value: 1.2, unit: 'V' }
          ],
          getModelName: () => 'Affinée (Linéaire)',
          getEquationString: () => 'U = a·t + b'
        },
        {
          id: 'm2',
          visible: false,
          color: '#3498db',
          x: { title: 't', unit: 's' },
          y: { title: 'U', unit: 'V' },
          parameters: [],
          getModelName: () => 'Modèle masqué',
          getEquationString: () => 'U = 0'
        }
      ];

      const { uiManager } = createMockUIManager({ models });
      uiManager.exportCurveLabels = {
        t: { title: 'Temps écoulé', unit: 's' },
        U: { title: 'Tension', unit: 'V' }
      };

      const html = uiManager.generatePrintHTML(true, false, false, '1cm', 'TP', 880, 550, 1, uiManager.exportCurveLabels, {
        includeModels: true
      });

      assert.ok(html.includes('Modélisations'), 'Doit afficher le titre de section Modélisations');
      assert.ok(html.includes('Tension = f(Temps écoulé)'), 'Doit appliquer les noms renommés dans le titre du modèle');
      assert.ok(html.includes('U = a·t + b'), 'Doit inclure l\'équation du modèle');
      assert.ok(html.includes('<strong>a</strong> = 2,200 V/s'), 'Doit inclure les paramètres formatés avec unités');
      assert.ok(html.includes('Domaine : [0,000 ; 5,000] s'), 'Doit inclure les bornes du domaine');
      assert.ok(html.includes('R² = 0,99980'), 'Doit inclure le R²');
      assert.ok(!html.includes('Modèle masqué'), 'Ne doit pas inclure les modèles masqués');
    });

    it('n\'ajoute pas de section Modélisations quand includeModels est false', () => {
      const models = [{
        id: 'm1',
        visible: true,
        color: '#e74c3c',
        x: { title: 't', unit: 's' },
        y: { title: 'U', unit: 'V' },
        parameters: [],
        getModelName: () => 'Linéaire',
        getEquationString: () => 'U = a·t'
      }];
      const { uiManager } = createMockUIManager({ models });
      const html = uiManager.generatePrintHTML(true, false, false, '1cm', 'TP', 880, 550, 1);

      assert.ok(!html.includes('<div class="models-grid">'));
    });
  });

  describe('Orientation A4 (Portrait / Paysage)', () => {
    it('génère les règles CSS A4 Paysage quand orientation === "landscape"', () => {
      const { uiManager } = createMockUIManager();
      const html = uiManager.generatePrintHTML(true, false, false, '2cm', 'TP', 880, 550, 1, {}, {
        orientation: 'landscape'
      });

      assert.ok(html.includes('@page { size: A4 landscape; margin: 2cm; }'));
      assert.ok(html.includes('width: 297mm;'));
      assert.ok(html.includes('min-height: 210mm;'));
      assert.ok(html.includes('max-height: 160mm;'));
    });

    it('génère les règles CSS A4 Portrait par défaut', () => {
      const { uiManager } = createMockUIManager();
      const html = uiManager.generatePrintHTML(true, false, false, '1cm', 'TP', 880, 550, 1);

      assert.ok(html.includes('@page { size: A4 portrait; margin: 1cm; }'));
      assert.ok(html.includes('width: 210mm;'));
      assert.ok(html.includes('min-height: 297mm;'));
      assert.ok(html.includes('max-height: 240mm;'));
    });
  });

  describe('Disposition du tableau (Vertical vs Horizontal)', () => {
    it('génère un tableau HTML classique avec thead répétable en mode vertical', () => {
      const { uiManager } = createMockUIManager();
      const html = uiManager.generatePrintHTML(false, true, false, '1cm', 'TP', 880, 550, 1, {
        t: { title: 'Temps <t>', unit: 's' }
      }, {
        tableLayout: 'vertical'
      });

      assert.ok(html.includes('<table class="data-table">'), 'Doit utiliser une table HTML');
      assert.ok(html.includes('display: table-header-group;'), 'Doit répéter thead à chaque page');
      assert.ok(html.includes('<th>Temps &lt;t&gt; (s)</th>'), 'Doit utiliser les en-têtes renommés et échappés');
      assert.ok(html.includes('<td class="point-idx">1</td>'));
      assert.ok(html.includes('<td class="point-idx">2</td>'));
    });

    it('enveloppe le document dans .a4-sheet avec mise à l\'échelle d\'aperçu automatique', () => {
      const { uiManager } = createMockUIManager();
      const html = uiManager.generatePrintHTML(true, false, false, '1cm', 'TP', 880, 550, 1);

      assert.ok(html.includes('<div class="a4-sheet" id="a4-sheet">'));
      assert.ok(html.includes('function fitSheet()'));
    });
  });
});
