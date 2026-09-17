import '../helpers/setup.mjs';
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import Data from '../../grapher/modules/data.js';
import Grapher from '../../grapher/modules/grapher.js';

describe('Grapher - updateChart() et exclusion de la courbe d\'abscisse X des séries Y', () => {
  let data;
  let grapher;
  let mockSeries;

  const createMockChart = () => {
    mockSeries = [];
    return {
      series: mockSeries,
      addSeries(options, redraw) {
        const serie = {
          name: options.name,
          options: options,
          data: options.data,
          visible: options.visible,
          setData(d, r) { this.data = d; },
          setVisible(v, r) { this.visible = v; },
          remove(r) {
            const idx = mockSeries.indexOf(this);
            if (idx !== -1) mockSeries.splice(idx, 1);
          },
          update(opt, r) { Object.assign(this.options, opt); }
        };
        mockSeries.push(serie);
        return serie;
      },
      redraw() {}
    };
  };

  beforeEach(() => {
    data = new Data({ significantDigits: 4 });
    const t = data.addCurve('t', 's');
    t.push(0, 1, 2, 3);
    const U = data.addCurve('U', 'V');
    U.push(0, 2, 4, 6);

    grapher = new Grapher(data, {
      grapherGrid: true,
      minorGrid: false,
      includeOriginOnAutoZoom: false
    });
    grapher.chart = createMockChart();
    grapher.currentXCurve = 't';
  });

  it('ne doit pas ajouter la courbe d\'abscisse (X) comme série ordonnée Y lors de updateChart()', () => {
    grapher.updateChart();

    const seriesNames = grapher.chart.series.map(s => s.name);
    assert.deepEqual(seriesNames, ['U'], 'Seule la courbe ordonnée U doit être présente dans series');
    assert.equal(seriesNames.includes('t'), false, 'La courbe d\'abscisse t ne doit pas être ajoutée');

    const uSerie = grapher.chart.series.find(s => s.name === 'U');
    assert.equal(uSerie.visible, true);
    assert.deepEqual(uSerie.data, [[0, 0], [1, 2], [2, 4], [3, 6]]);
  });

  it('ne doit pas ajouter la courbe X même si elle est explicitement spécifiée dans yCurveTitles', () => {
    grapher.updateChart(['t', 'U']);

    const seriesNames = grapher.chart.series.map(s => s.name);
    assert.deepEqual(seriesNames, ['U']);
    assert.equal(seriesNames.includes('t'), false);
  });

  it('doit retirer l\'ancienne ordonnée lorsqu\'elle devient l\'abscisse (changement d\'axe X)', () => {
    // Initialement X = 't', U est visible
    grapher.updateChart();
    assert.deepEqual(grapher.chart.series.map(s => s.name), ['U']);

    // Changement d'abscisse : X devient 'U'
    grapher.currentXCurve = 'U';
    grapher.updateChart();

    const seriesNames = grapher.chart.series.map(s => s.name);
    assert.equal(seriesNames.includes('U'), false, 'U ne doit plus être dans series car elle est devenue l\'abscisse');
    assert.deepEqual(seriesNames, ['t'], 't doit être la série ordonnée');

    const tSerie = grapher.chart.series.find(s => s.name === 't');
    assert.equal(tSerie.visible, true, 't doit devenir visible car aucune autre ordonnée n\'était active');
    // Données attendues pour t = f(U) : [U[i], t[i]]
    assert.deepEqual(tSerie.data, [[0, 0], [2, 1], [4, 2], [6, 3]]);
  });

  it('ne doit jamais générer de points diagonaux [x, x] (Y=X) dans aucune série', () => {
    grapher.updateChart();
    for (const s of grapher.chart.series) {
      assert.notEqual(s.name, grapher.currentXCurve, 'Aucune série ne doit avoir le même nom que currentXCurve');
    }

    grapher.currentXCurve = 'U';
    grapher.updateChart();
    for (const s of grapher.chart.series) {
      assert.notEqual(s.name, grapher.currentXCurve, 'Après bascule, aucune série ne doit être currentXCurve');
    }
  });

  it('doit préserver la visibilité des autres ordonnées lors d\'un changement d\'axe X avec 3 courbes', () => {
    const I = data.addCurve('I', 'A');
    I.push(0, 0.1, 0.2, 0.3);

    // Initialement X = 't', on affiche U et I
    grapher.updateChart(['U', 'I']);
    assert.equal(grapher.chart.series.length, 2);
    assert.equal(grapher.chart.series.find(s => s.name === 'U').visible, true);
    assert.equal(grapher.chart.series.find(s => s.name === 'I').visible, true);

    // Bascule de l'axe X : X devient 'U'
    grapher.currentXCurve = 'U';
    grapher.updateChart();

    const names = grapher.chart.series.map(s => s.name);
    assert.equal(names.includes('U'), false, 'U doit être retirée des séries');
    assert.equal(names.includes('I'), true, 'I doit rester dans les séries');
    assert.equal(names.includes('t'), true, 't doit être ajoutée aux séries');

    // I était visible et est toujours une ordonnée valide, elle doit rester visible
    const iSerie = grapher.chart.series.find(s => s.name === 'I');
    assert.equal(iSerie.visible, true, 'I doit conserver sa visibilité');

    // Données de I = f(U) : [U[i], I[i]]
    assert.deepEqual(iSerie.data, [[0, 0], [2, 0.1], [4, 0.2], [6, 0.3]]);
  });

  it('ne doit ajouter aucune série si une seule courbe existe (la courbe d\'abscisse)', () => {
    const singleData = new Data({ significantDigits: 4 });
    singleData.addCurve('t', 's');
    const singleGrapher = new Grapher(singleData, {
      grapherGrid: true,
      minorGrid: false,
      includeOriginOnAutoZoom: false
    });
    singleGrapher.chart = createMockChart();
    singleGrapher.currentXCurve = 't';

    singleGrapher.updateChart();
    assert.equal(singleGrapher.chart.series.length, 0, 'Aucune série ne doit être ajoutée s\'il n\'y a que la courbe X');
  });

  it('doit ordonner la légende avec les séries visibles en premier et les séries masquées (ancienne abscisse) en dernier', () => {
    const I = data.addCurve('I', 'A');
    I.push(0, 0.1, 0.2, 0.3);

    // Initialement X = 't', U et I sont visibles
    grapher.updateChart(['U', 'I']);
    
    // Changement d'abscisse : X devient 'U'
    // 'U' est retiré, 'I' reste visible, 't' (ancienne abscisse) est réinsérée comme masquée
    grapher.currentXCurve = 'U';
    grapher.updateChart();

    const iSerie = grapher.chart.series.find(s => s.name === 'I');
    const tSerie = grapher.chart.series.find(s => s.name === 't');

    assert.equal(iSerie.visible, true);
    assert.equal(tSerie.visible, false);

    // Dans la légende, la série active I doit précéder l'ancienne abscisse masquée t
    assert.equal(iSerie.options.legendIndex, 0, 'La série active I doit avoir legendIndex = 0');
    assert.equal(tSerie.options.legendIndex, 1, 'L\'ancienne abscisse masquée t doit avoir legendIndex = 1');
  });
});

