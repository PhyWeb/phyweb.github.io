import '../helpers/setup.mjs';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import UIManager, { toSuperscript } from '../../grapher/modules/ui.js';

describe('Export Grapher - Puissances de 10 et exposants en abscisses et ordonnées', () => {
  describe('toSuperscript (conversion en exposant Unicode)', () => {
    it('doit convertir les chiffres positifs simples', () => {
      assert.equal(toSuperscript(0), '⁰');
      assert.equal(toSuperscript(1), '¹');
      assert.equal(toSuperscript(2), '²');
      assert.equal(toSuperscript(3), '³');
      assert.equal(toSuperscript(4), '⁴');
      assert.equal(toSuperscript(5), '⁵');
      assert.equal(toSuperscript(6), '⁶');
      assert.equal(toSuperscript(7), '⁷');
      assert.equal(toSuperscript(8), '⁸');
      assert.equal(toSuperscript(9), '⁹');
    });

    it('doit convertir les exposants négatifs', () => {
      assert.equal(toSuperscript(-1), '⁻¹');
      assert.equal(toSuperscript(-3), '⁻³');
      assert.equal(toSuperscript(-6), '⁻⁶');
      assert.equal(toSuperscript(-12), '⁻¹²');
    });

    it('doit convertir les exposants à plusieurs chiffres', () => {
      assert.equal(toSuperscript(10), '¹⁰');
      assert.equal(toSuperscript(12), '¹²');
      assert.equal(toSuperscript(-15), '⁻¹⁵');
    });

    it('doit gérer les cas vides ou nuls', () => {
      assert.equal(toSuperscript(null), '');
      assert.equal(toSuperscript(undefined), '');
      assert.equal(toSuperscript(''), '');
    });
  });

  describe('getExportChartOptions - Titre de l\'axe des abscisses (X)', () => {
    const createMockUIManager = ({ xCurve = 't', xUnit = 's', xExponent = 0, yExponent = 0 } = {}) => {
      const dataMock = {
        getCurveByTitle: (title) => {
          if (title === xCurve) {
            return { title: xCurve, unit: xUnit };
          }
          return null;
        }
      };

      const grapherMock = {
        currentXCurve: xCurve,
        chart: {
          xAxis: [{ exponent: xExponent }],
          yAxis: [{ exponent: yExponent }],
          series: [
            { name: 'U', visible: true, options: { showInLegend: true } }
          ]
        }
      };

      const uiManager = new UIManager({}, dataMock, grapherMock, {}, {}, {});
      return { uiManager, grapherMock };
    };

    it('doit inclure la puissance de 10 en exposant dans le titre des abscisses quand un exposant et une unité sont présents', () => {
      const { uiManager } = createMockUIManager({ xCurve: 't', xUnit: 's', xExponent: 3 });
      const options = uiManager.getExportChartOptions(800, 500, 1);

      assert.equal(options.xAxis[0].title.text, 't (×10³ s)');
      assert.ok(!options.xAxis[0].title.text.includes('<sup>'), 'Ne doit pas contenir de balise <sup> cassée');
    });

    it('doit formater correctement un exposant négatif en abscisses (ex: millisecondes)', () => {
      const { uiManager } = createMockUIManager({ xCurve: 't', xUnit: 's', xExponent: -3 });
      const options = uiManager.getExportChartOptions(800, 500, 1);

      assert.equal(options.xAxis[0].title.text, 't (×10⁻³ s)');
      assert.ok(!options.xAxis[0].title.text.includes('<sup>'));
    });

    it('doit inclure la puissance de 10 même s\'il n\'y a pas d\'unité en abscisses', () => {
      const { uiManager } = createMockUIManager({ xCurve: 'x', xUnit: '', xExponent: 6 });
      const options = uiManager.getExportChartOptions(800, 500, 1);

      assert.equal(options.xAxis[0].title.text, 'x (×10⁶)');
    });

    it('doit afficher uniquement l\'unité si l\'exposant d\'abscisse est nul (0)', () => {
      const { uiManager } = createMockUIManager({ xCurve: 't', xUnit: 's', xExponent: 0 });
      const options = uiManager.getExportChartOptions(800, 500, 1);

      assert.equal(options.xAxis[0].title.text, 't (s)');
    });

    it('doit afficher uniquement le nom de la grandeur si pas d\'exposant ni d\'unité en abscisses', () => {
      const { uiManager } = createMockUIManager({ xCurve: 'N', xUnit: '', xExponent: 0 });
      const options = uiManager.getExportChartOptions(800, 500, 1);

      assert.equal(options.xAxis[0].title.text, 'N');
    });
  });

  describe('getExportChartOptions - Puissances de 10 en ordonnées (Légende)', () => {
    const createMockUIManager = ({ yExponent = 0 } = {}) => {
      const dataMock = {
        getCurveByTitle: () => ({ unit: '' })
      };

      const grapherMock = {
        currentXCurve: 't',
        chart: {
          xAxis: [{ exponent: 0 }],
          yAxis: [{ exponent: yExponent }],
          series: [
            { name: 'U', visible: true, options: { showInLegend: true } }
          ]
        }
      };

      const uiManager = new UIManager({}, dataMock, grapherMock, {}, {}, {});
      return { uiManager, grapherMock };
    };

    it('doit désactiver useHTML pour la légende dans l\'export (garantit le rendu SVG natif)', () => {
      const { uiManager } = createMockUIManager({ yExponent: 3 });
      const options = uiManager.getExportChartOptions(800, 500, 1);

      assert.equal(options.legend.useHTML, false);
      assert.equal(typeof options.legend.labelFormatter, 'function');
    });

    it('doit formater l\'exposant en exposant Unicode pour les ordonnées (ex: ×10³ V)', () => {
      const { uiManager } = createMockUIManager({ yExponent: 3 });
      const options = uiManager.getExportChartOptions(800, 500, 1);

      const fakeSeriesContext = {
        name: 'U',
        userOptions: { unit: 'V' },
        chart: { yAxis: [{ exponent: 3 }] }
      };

      const label = options.legend.labelFormatter.call(fakeSeriesContext);
      assert.equal(label, 'U (×10³ V)');
      assert.ok(!label.includes('<sup>'), 'Ne doit pas utiliser <sup> qui devient <tspan> non stylé');
      assert.ok(!label.includes('<span'), 'Ne doit pas contenir de wrapper <span> inutile en SVG');
    });

    it('doit formater les puissances négatives pour les ordonnées (ex: ×10⁻³ A)', () => {
      const { uiManager } = createMockUIManager({ yExponent: -3 });
      const options = uiManager.getExportChartOptions(800, 500, 1);

      const fakeSeriesContext = {
        name: 'I',
        userOptions: { unit: 'A' },
        chart: { yAxis: [{ exponent: -3 }] }
      };

      const label = options.legend.labelFormatter.call(fakeSeriesContext);
      assert.equal(label, 'I (×10⁻³ A)');
    });

    it('doit utiliser la puissance de 10 de repli depuis le graphique parent si non initialisée dans la copie d\'export', () => {
      const { uiManager } = createMockUIManager({ yExponent: 6 });
      const options = uiManager.getExportChartOptions(800, 500, 1);

      // Cas où la chartCopy Highcharts n'a pas encore calculé yAxis[0].exponent
      const fakeSeriesContext = {
        name: 'Énergie',
        userOptions: { unit: 'J' },
        chart: { yAxis: [{ exponent: 0 }] } // exponent non encore calculé
      };

      const label = options.legend.labelFormatter.call(fakeSeriesContext);
      assert.equal(label, 'Énergie (×10⁶ J)');
    });

    it('doit afficher uniquement l\'unité sans puissance de 10 si l\'exposant Y est 0', () => {
      const { uiManager } = createMockUIManager({ yExponent: 0 });
      const options = uiManager.getExportChartOptions(800, 500, 1);

      const fakeSeriesContext = {
        name: 'U',
        userOptions: { unit: 'V' },
        chart: { yAxis: [{ exponent: 0 }] }
      };

      const label = options.legend.labelFormatter.call(fakeSeriesContext);
      assert.equal(label, 'U (V)');
    });

    it('doit formater sans unité avec puissance de 10 si aucune unité n\'est fournie', () => {
      const { uiManager } = createMockUIManager({ yExponent: 3 });
      const options = uiManager.getExportChartOptions(800, 500, 1);

      const fakeSeriesContext = {
        name: 'Gain',
        userOptions: { unit: '' },
        chart: { yAxis: [{ exponent: 3 }] }
      };

      const label = options.legend.labelFormatter.call(fakeSeriesContext);
      assert.equal(label, 'Gain (×10³)');
    });
  });
});
