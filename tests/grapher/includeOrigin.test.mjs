import '../helpers/setup.mjs';
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import Data from '../../grapher/modules/data.js';
import Grapher from '../../grapher/modules/grapher.js';

describe('Grapher - Prise en compte de "inclure l\'origine" lors du premier tracé et du zoom automatique', () => {
  let data;
  let grapher;
  let mockChart;
  let mockSeries;
  let xAxis;
  let yAxis;

  const createMockChartWithAxes = () => {
    mockSeries = [];
    const chart = {
      series: mockSeries,
      addSeries(options, redraw) {
        const serie = {
          name: options.name,
          options: options,
          data: options.data,
          visible: options.visible !== undefined ? options.visible : true,
          setData(d, r) {
            this.data = d;
            this.options.data = d;
          },
          setVisible(v, r) {
            this.visible = v;
            this.options.visible = v;
          },
          remove(r) {
            const idx = mockSeries.indexOf(this);
            if (idx !== -1) mockSeries.splice(idx, 1);
          },
          update(opt, r) {
            Object.assign(this.options, opt);
          }
        };
        mockSeries.push(serie);
        return serie;
      },
      redraw() {}
    };

    xAxis = Object.create(global.Highcharts.Axis.prototype);
    xAxis.isXAxis = true;
    xAxis.index = 0;
    xAxis.chart = chart;
    xAxis.min = null;
    xAxis.max = null;
    xAxis.calls = [];
    const origSetExtremesX = xAxis.setExtremes;
    xAxis.setExtremes = function(...args) {
      this.calls.push(args);
      return origSetExtremesX.apply(this, args);
    };

    yAxis = Object.create(global.Highcharts.Axis.prototype);
    yAxis.isXAxis = false;
    yAxis.index = 0;
    yAxis.chart = chart;
    yAxis.min = null;
    yAxis.max = null;
    yAxis.calls = [];
    const origSetExtremesY = yAxis.setExtremes;
    yAxis.setExtremes = function(...args) {
      this.calls.push(args);
      return origSetExtremesY.apply(this, args);
    };

    chart.xAxis = [xAxis];
    chart.yAxis = [yAxis];
    chart.options = { customGrapherInstance: null };

    return chart;
  };

  beforeEach(() => {
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
    mockChart = createMockChartWithAxes();
    mockChart.options.customGrapherInstance = grapher;
    grapher.chart = mockChart;
    grapher.currentXCurve = 't';
  });

  it('doit inclure l\'origine (0, 0) dès le premier appel à updateChart() lorsque l\'option est activée', () => {
    // Initialement non zoomé
    assert.equal(grapher.hasUserZoom, false);

    // Premier tracé du graphique
    grapher.updateChart();

    // Vérifier que setExtremes a été appelé
    assert.ok(xAxis.calls.length > 0, 'xAxis.setExtremes doit avoir été appelé');
    assert.ok(yAxis.calls.length > 0, 'yAxis.setExtremes doit avoir été appelé');

    // Les bornes doivent commencer exactement à 0 sur X et Y (données positives)
    // Pour t: min=10, max=30 -> finalMin === 0, finalMax >= 30
    assert.equal(xAxis.min, 0, `xAxis.min (${xAxis.min}) doit commencer exactement à 0`);
    assert.ok(xAxis.max >= 30, `xAxis.max (${xAxis.max}) doit être >= 30`);

    // Pour U: min=5, max=25 -> finalMin === 0, finalMax >= 25
    assert.equal(yAxis.min, 0, `yAxis.min (${yAxis.min}) doit commencer exactement à 0`);
    assert.ok(yAxis.max >= 25, `yAxis.max (${yAxis.max}) doit être >= 25`);
  });

  it('ne doit pas forcer l\'origine sur updateChart() si includeOriginOnAutoZoom est false mais doit appliquer une petite marge', () => {
    grapher.includeOriginOnAutoZoom = false;

    grapher.updateChart();

    // Lorsque l'option est désactivée, l'origine n'est pas forcée (min > 0 pour des données strictement positives)
    // Mais une petite marge (2%) est appliquée pour éviter que les points extrêmes ne touchent les bords
    assert.ok(xAxis.min > 0, `xAxis.min (${xAxis.min}) ne doit pas inclure 0`);
    assert.ok(xAxis.min < 10, `xAxis.min (${xAxis.min}) doit être < 10 pour laisser une marge au premier point`);
    assert.ok(xAxis.max > 30, `xAxis.max (${xAxis.max}) doit être > 30 pour laisser une marge au dernier point`);

    assert.ok(yAxis.min > 0, `yAxis.min (${yAxis.min}) ne doit pas inclure 0`);
    assert.ok(yAxis.min < 5, `yAxis.min (${yAxis.min}) doit être < 5 pour laisser une marge au premier point`);
    assert.ok(yAxis.max > 25, `yAxis.max (${yAxis.max}) doit être > 25 pour laisser une marge au dernier point`);
  });

  it('doit inclure 0 au niveau supérieur si toutes les valeurs sont négatives', () => {
    const negData = new Data({ significantDigits: 4 });
    const xNeg = negData.addCurve('x', 'm');
    xNeg.push(-30, -20, -10);
    const yNeg = negData.addCurve('y', 'm');
    yNeg.push(-25, -15, -5);

    const negGrapher = new Grapher(negData, {
      grapherGrid: true,
      minorGrid: false,
      includeOriginOnAutoZoom: true
    });
    const negChart = createMockChartWithAxes();
    negChart.options.customGrapherInstance = negGrapher;
    negGrapher.chart = negChart;
    negGrapher.currentXCurve = 'x';

    negGrapher.updateChart();

    // Pour x négatif (-30 à -10), finalMax doit être exactement 0
    assert.equal(negChart.xAxis[0].max, 0, `xAxis.max (${negChart.xAxis[0].max}) doit être exactement 0`);
    assert.ok(negChart.xAxis[0].min <= -30, `xAxis.min (${negChart.xAxis[0].min}) doit être <= -30`);

    // Pour y négatif (-25 à -5), finalMax doit être exactement 0
    assert.equal(negChart.yAxis[0].max, 0, `yAxis.max (${negChart.yAxis[0].max}) doit être exactement 0`);
    assert.ok(negChart.yAxis[0].min <= -25, `yAxis.min (${negChart.yAxis[0].min}) doit être <= -25`);
  });

  it('doit préserver le zoom utilisateur si hasUserZoom est true lors d\'un updateChart()', () => {
    // Premier tracé auto-zoom avec origine
    grapher.updateChart();
    assert.equal(xAxis.min, 0);

    // L'utilisateur zoome manuellement sur une plage spécifique [15, 25]
    grapher.hasUserZoom = true;
    xAxis.min = 15;
    xAxis.max = 25;
    xAxis.calls = [];
    yAxis.calls = [];

    // Mise à jour des données (ex: nouvelle ligne dans le tableur)
    grapher.updateChart();

    // setExtremes(null, null) ne doit PAS avoir été appelé pour ne pas écraser le zoom manuel
    assert.equal(xAxis.calls.length, 0, 'setExtremes ne doit pas être appelé sur xAxis si hasUserZoom est true');
    assert.equal(yAxis.calls.length, 0, 'setExtremes ne doit pas être appelé sur yAxis si hasUserZoom est true');
    assert.equal(xAxis.min, 15, 'Le zoom utilisateur min doit être préservé');
    assert.equal(xAxis.max, 25, 'Le zoom utilisateur max doit être préservé');
  });

  it('resetZoom() doit réinitialiser hasUserZoom et réappliquer les bornes incluant l\'origine', () => {
    // Premier tracé
    grapher.updateChart();

    grapher.hasUserZoom = true;
    xAxis.min = 15;
    xAxis.max = 25;

    // Réinitialisation du zoom
    grapher.resetZoom();

    assert.equal(grapher.hasUserZoom, false, 'hasUserZoom doit être réinitialisé à false');
    assert.equal(xAxis.min, 0, 'xAxis.min doit de nouveau commencer exactement à 0');
    assert.ok(xAxis.max >= 30, 'xAxis.max doit couvrir les données');
    assert.equal(yAxis.min, 0, 'yAxis.min doit de nouveau commencer exactement à 0');
    assert.ok(yAxis.max >= 25, 'yAxis.max doit couvrir les données');
  });

  it('setIncludeOriginOnAutoZoom() doit mettre à jour l\'option et déclencher un resetZoom()', () => {
    grapher.updateChart();
    assert.equal(xAxis.min, 0);

    // Désactivation de l'option
    grapher.setIncludeOriginOnAutoZoom(false);
    assert.equal(grapher.includeOriginOnAutoZoom, false);
    assert.ok(xAxis.min > 0, 'L\'origine ne doit plus être incluse');
    assert.ok(xAxis.min < 10, 'Une marge doit exister avant le premier point');
    assert.ok(xAxis.max > 30, 'Une marge doit exister après le dernier point');

    // Réactivation de l'option
    grapher.setIncludeOriginOnAutoZoom(true);
    assert.equal(grapher.includeOriginOnAutoZoom, true);
    assert.equal(xAxis.min, 0, 'L\'origine doit être de nouveau incluse exactement à 0');
  });

  it('setXCurve() et deleteAllCurves() doivent réinitialiser hasUserZoom à false', () => {
    grapher.hasUserZoom = true;
    grapher.setXCurve('U');
    assert.equal(grapher.hasUserZoom, false, 'setXCurve doit réinitialiser hasUserZoom à false');

    grapher.hasUserZoom = true;
    grapher.deleteAllCurves();
    assert.equal(grapher.hasUserZoom, false, 'deleteAllCurves doit réinitialiser hasUserZoom à false');
  });
});
