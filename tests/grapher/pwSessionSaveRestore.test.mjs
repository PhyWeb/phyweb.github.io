import '../helpers/setup.mjs';
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import IOManager from '../../grapher/modules/ioManager.js';
import Data, { Curve, Model } from '../../grapher/modules/data.js';
import Grapher from '../../grapher/modules/grapher.js';

describe('IOManager - Sauvegarde et Restauration des sessions .pw (v3.0)', () => {
  let app;
  let data;
  let ioManager;
  let mockChart;
  let mockSeries;
  let xAxis;
  let yAxis;
  let editorValue;
  let autoZoomButton;
  let sortVariableSelect;

  const createMockChart = () => {
    mockSeries = [];
    const chart = {
      series: mockSeries,
      get(id) {
        return mockSeries.find(s => s.options?.id === id);
      },
      addSeries(options, redraw) {
        const serie = {
          name: options.name,
          options: options,
          data: options.data,
          visible: options.visible !== undefined ? options.visible : true,
          userOptions: options,
          setData(d) {
            this.data = d;
            this.options.data = d;
          },
          setVisible(v) {
            this.visible = v;
            this.options.visible = v;
          },
          remove() {
            const idx = mockSeries.indexOf(this);
            if (idx !== -1) mockSeries.splice(idx, 1);
          },
          update(opt) {
            Object.assign(this.options, opt);
          }
        };
        mockSeries.push(serie);
        return serie;
      },
      redraw() {}
    };

    xAxis = {
      isXAxis: true,
      index: 0,
      min: 0,
      max: 10,
      userMin: undefined,
      userMax: undefined,
      getExtremes() {
        return { min: this.min, max: this.max, userMin: this.userMin, userMax: this.userMax };
      },
      setExtremes(min, max) {
        this.userMin = min;
        this.userMax = max;
        this.min = min ?? 0;
        this.max = max ?? 10;
      }
    };

    yAxis = {
      isXAxis: false,
      index: 0,
      min: 0,
      max: 20,
      userMin: undefined,
      userMax: undefined,
      getExtremes() {
        return { min: this.min, max: this.max, userMin: this.userMin, userMax: this.userMax };
      },
      setExtremes(min, max) {
        this.userMin = min;
        this.userMax = max;
        this.min = min ?? 0;
        this.max = max ?? 20;
      }
    };

    chart.xAxis = [xAxis];
    chart.yAxis = [yAxis];
    return chart;
  };

  beforeEach(() => {
    editorValue = '';
    autoZoomButton = {
      classList: {
        classes: new Set(['is-hidden']),
        add(c) { this.classes.add(c); },
        remove(c) { this.classes.delete(c); },
        contains(c) { return this.classes.has(c); }
      }
    };

    sortVariableSelect = {
      value: '',
      innerHTML: '',
      options: [],
      appendChild(opt) {
        this.options.push(opt);
      }
    };

    global.__querySelectorOverride = (sel) => {
      if (sel === '#auto-zoom-button') return autoZoomButton;
      if (sel === '#sort-variable-select') return sortVariableSelect;
      if (sel === '#model-list') return { innerHTML: '', appendChild: () => {} };
      return {
        value: '',
        style: {},
        classList: { add: () => {}, remove: () => {}, contains: () => false },
        appendChild: () => {},
        addEventListener: () => {},
        querySelectorAll: () => []
      };
    };

    global.document.getElementById = (id) => global.__querySelectorOverride(`#${id}`);

    data = new Data({ significantDigits: 4 });
    mockChart = createMockChart();

    const grapher = {
      chart: mockChart,
      currentXCurve: null,
      hasUserZoom: false,
      setXCurve(title) {
        this.currentXCurve = title;
      },
      updateChart() {
        // Ajoute les séries ordonnées non présentes
        data.curves.forEach(curve => {
          if (curve.title === this.currentXCurve) return;
          if (!mockChart.series.some(s => s.name === curve.title)) {
            mockChart.addSeries({
              name: curve.title,
              data: Array.from(curve),
              color: curve.color,
              lineWidth: curve.line ? curve.lineWidth : 0,
              dashStyle: curve.lineStyle,
              visible: true
            });
          }
        });
      },
      setVisibilityFromList(titles) {
        const set = new Set(titles);
        mockChart.series
          .filter(s => !s.options.id?.startsWith('model-'))
          .forEach(s => s.setVisible(set.has(s.name)));
      },
      addModelSeries(model) {
        Grapher.prototype.addModelSeries.call(this, model);
      },
      updateModelVisibility() {},
      reorderLegendByVisibility() {},
      resetZoom() {
        this.hasUserZoom = false;
        mockChart.xAxis[0].setExtremes(null, null);
        mockChart.yAxis[0].setExtremes(null, null);
      },
      clearAllAnnotations() {
        data.annotations = [];
      },
      deleteAllCurves() {
        mockSeries.length = 0;
        this.currentXCurve = null;
        this.hasUserZoom = false;
      }
    };

    const uiManager = {
      createModelPanel() {},
      updateCalculationUI() {},
      updateAllModelPanelVisibilityIcons() {},
      updateRecalculateButtonVisibility() {},
      updateModelToolVisibility() {},
      updateClearAnnotationsButtonVisibility() {},
      updateSortUI() {
        const selectedValue = data.lastSortVariable || sortVariableSelect.value;
        sortVariableSelect.options = [];
        data.curves.forEach(c => {
          sortVariableSelect.appendChild({ value: c.title, textContent: c.title });
        });
        if (selectedValue && data.curves.some(c => c.title === selectedValue)) {
          sortVariableSelect.value = selectedValue;
        } else {
          sortVariableSelect.value = '';
        }
      },
      updateXAxisSelector() {},
      resetZoomUI() {},
      resetSavedState() {}
    };

    const spreadsheet = {
      focusFirstCell() {},
      update() {},
      clear() {}
    };

    const editor = {
      getValue: () => editorValue,
      setValue: (val) => { editorValue = val; }
    };

    app = {
      data,
      grapher,
      uiManager,
      spreadsheet,
      editor,
      calculation: { clear: () => {} },
      resetSession() {
        grapher.clearAllAnnotations();
        data.curves = [];
        data.parameters = {};
        data.models = [];
        grapher.deleteAllCurves();
        editor.setValue('');
      }
    };

    ioManager = new IOManager(app);
  });

  describe('generatePW()', () => {
    it('doit sauvegarder fidèlement l\'état complet sans inclure les réglages généraux de l\'application', () => {
      // Configuration de la session
      const t = data.addCurve('t', 's');
      t.push(0, 1, 2, 3);
      t.color = '#123456';
      t.lineWidth = 3;
      t.lineStyle = 'Dot';
      t.markers = true;
      t.markerSymbol = 'square';
      t.markerRadius = 6;

      const v = data.addCurve('v', 'm/s');
      v.push(0, 5, 10, 15);
      v.color = '#654321';
      v.line = true;
      v.lineWidth = 1;
      v.lineStyle = 'Dash';

      app.editor.setValue('a = diff(v, t)\nk = 2.5');
      data.parameters['k'] = { value: 2.5, unit: '', type: 'constant' };

      const model = new Model(t, v, 'linear', data, '#00ff00', true, 4, 'Solid');
      model.parameters = [{ name: 'coeff', value: 5 }];
      model.minX = 1;
      model.maxX = 3;
      model.rmse = 0.01;
      model.rSquared = 0.999;
      data.models.push(model);

      data.annotations.push({
        id: 'ann-1',
        type: 'point',
        x: 2,
        y: 10
      });
      data.annotations.push({
        id: 'ann-2',
        type: 'tangent-method',
        point1: { x: 1, y: 5 },
        point2: { x: 3, y: 15 },
        slope: 5,
        seriesName: 'v'
      });

      app.grapher.currentXCurve = 't';
      app.grapher.hasUserZoom = true;
      xAxis.userMin = 0.5;
      xAxis.userMax = 2.5;
      yAxis.userMin = 2;
      yAxis.userMax = 12;
      data.lastSortVariable = 't';

      const jsonStr = ioManager.generatePW();
      const state = JSON.parse(jsonStr);

      assert.equal(state.version, '3.0');

      // 1. Vérification des courbes
      assert.equal(state.data.curves.length, 2);
      const savedT = state.data.curves.find(c => c.title === 't');
      assert.deepEqual(savedT.values, [0, 1, 2, 3]);
      assert.equal(savedT.unit, 's');
      assert.equal(savedT.color, '#123456');
      assert.equal(savedT.lineWidth, 3);
      assert.equal(savedT.lineStyle, 'Dot');
      assert.equal(savedT.markerSymbol, 'square');
      assert.equal(savedT.markerRadius, 6);

      // 2. Vérification des modèles et de leurs bornes / styles
      assert.equal(state.data.models.length, 1);
      const savedModel = state.data.models[0];
      assert.equal(savedModel.xTitle, 't');
      assert.equal(savedModel.yTitle, 'v');
      assert.equal(savedModel.type, 'linear');
      assert.equal(savedModel.color, '#00ff00');
      assert.equal(savedModel.lineWidth, 4);
      assert.equal(savedModel.lineStyle, 'Solid');
      assert.equal(savedModel.minX, 1);
      assert.equal(savedModel.maxX, 3);
      assert.deepEqual(savedModel.parameters, [{ name: 'coeff', value: 5 }]);

      // 3. Vérification des annotations
      assert.equal(state.data.annotations.length, 2);
      assert.equal(state.data.annotations[1].seriesName, 'v');

      // 4. Vérification de l'éditeur et du tri
      assert.equal(state.calculations, 'a = diff(v, t)\nk = 2.5');
      assert.equal(state.sort.lastSortVariable, 't');

      // 5. Vérification du zoom manuel
      assert.deepEqual(state.grapher.zoom, {
        xUserMin: 0.5,
        xUserMax: 2.5,
        yUserMin: 2,
        yUserMax: 12
      });

      // 6. GARANTIE : aucun réglage utilisateur global n'est présent dans le .pw
      assert.equal(state.significantDigits, undefined);
      assert.equal(state.grapherGrid, undefined);
      assert.equal(state.minorGrid, undefined);
      assert.equal(state.includeOriginOnAutoZoom, undefined);
      assert.equal(state.derivatePoints, undefined);
      assert.equal(state.derivateEdges, undefined);
      assert.equal(state.grapher.grid, undefined);
      assert.equal(state.grapher.includeOriginOnAutoZoom, undefined);
    });

    it('doit sauvegarder un zoomState à null si aucun zoom manuel n\'est actif', () => {
      app.grapher.hasUserZoom = false;
      const jsonStr = ioManager.generatePW();
      const state = JSON.parse(jsonStr);

      assert.deepEqual(state.grapher.zoom, {
        xUserMin: null,
        xUserMax: null,
        yUserMin: null,
        yUserMax: null
      });
    });
  });

  describe('_processPWState()', () => {
    it('doit restaurer fidèlement les courbes, leurs styles et leurs valeurs sans propriété .values résiduelle', async () => {
      const state = {
        version: '3.0',
        data: {
          curves: [
            {
              title: 'x',
              unit: 'm',
              color: '#ff5500',
              line: true,
              markers: false,
              lineWidth: 3,
              lineStyle: 'Dash',
              markerSymbol: 'cross',
              markerRadius: 5,
              type: 'raw',
              values: [10, 20, 30]
            }
          ]
        }
      };

      await ioManager._processPWState(state);

      assert.equal(data.curves.length, 1);
      const c = data.curves[0];
      assert.equal(c.title, 'x');
      assert.equal(c.unit, 'm');
      assert.equal(c.color, '#ff5500');
      assert.equal(c.line, true);
      assert.equal(c.markers, false);
      assert.equal(c.lineWidth, 3);
      assert.equal(c.lineStyle, 'Dash');
      assert.equal(c.markerSymbol, 'cross');
      assert.equal(c.markerRadius, 5);
      assert.deepEqual(Array.from(c), [10, 20, 30]);

      // Pas de doublon résiduel sur l'objet Array
      assert.equal(Object.prototype.hasOwnProperty.call(c, 'values'), false);
    });

    it('doit restaurer le style personnalisé du modèle sur la série graphique du chart', async () => {
      const state = {
        version: '3.0',
        data: {
          curves: [
            { title: 't', unit: 's', color: '#0000ff', values: [1, 2, 3] },
            { title: 'y', unit: 'm', color: '#ff0000', values: [2, 4, 6] }
          ],
          models: [
            {
              id: 'model-custom-1',
              xTitle: 't',
              yTitle: 'y',
              type: 'linear',
              visible: true,
              color: '#00ff88',
              lineWidth: 4,
              lineStyle: 'Solid',
              minX: 1.5,
              maxX: 2.8,
              parameters: [{ name: 'a', value: 2 }]
            }
          ]
        },
        grapher: { xCurve: 't', yCurves: ['y'] }
      };

      await ioManager._processPWState(state);

      assert.equal(data.models.length, 1);
      const m = data.models[0];
      assert.equal(m.color, '#00ff88');
      assert.equal(m.lineWidth, 4);
      assert.equal(m.lineStyle, 'Solid');
      assert.equal(m.minX, 1.5);
      assert.equal(m.maxX, 2.8);

      // Vérifie la série Highcharts correspondante
      const series = mockChart.series.find(s => s.options?.id === 'model-model-custom-1');
      assert.ok(series, 'La série du modèle doit être présente sur le graphique');
      assert.equal(series.options.color, '#00ff88', 'La couleur customisée du modèle doit être appliquée');
      assert.equal(series.options.dashStyle, 'Solid', 'Le style de trait customisé doit être appliqué');
      assert.equal(series.options.lineWidth, 4, 'L\'épaisseur customisée doit être appliquée');
    });

    it('doit supporter bornedebut et bornefin pour la rétrocompatibilité des anciens fichiers .pw', async () => {
      const state = {
        version: '3.0',
        data: {
          curves: [
            { title: 't', unit: 's', values: [0, 1, 2] },
            { title: 'U', unit: 'V', values: [0, 5, 10] }
          ],
          models: [
            {
              id: 'old-model-1',
              xTitle: 't',
              yTitle: 'U',
              type: 'linear',
              bornedebut: 0.2,
              bornefin: 1.8,
              parameters: []
            }
          ]
        }
      };

      await ioManager._processPWState(state);

      const m = data.models[0];
      assert.equal(m.minX, 0.2);
      assert.equal(m.maxX, 1.8);
    });

    it('doit réinjecter les paramètres de modèles dans app.data.parameters si absents', async () => {
      const state = {
        version: '3.0',
        data: {
          curves: [
            { title: 't', unit: 's', values: [1, 2] },
            { title: 'v', unit: 'm/s', values: [2, 4] }
          ],
          parameters: {}, // pas de paramètres de modèle explicites
          models: [
            {
              id: 'm1',
              xTitle: 't',
              yTitle: 'v',
              type: 'linear',
              parameters: [{ name: 'slope_a', value: 2 }]
            }
          ]
        }
      };

      await ioManager._processPWState(state);

      assert.ok(data.parameters['slope_a'], 'Le paramètre de modèle doit être présent dans data.parameters');
      assert.equal(data.parameters['slope_a'].value, 2);
      assert.equal(data.parameters['slope_a'].type, 'model');
    });

    it('doit traduire xCurve, yCurves, lastSortVariable, annotation.seriesName et paramètres via nameMap si sanitisation', async () => {
      const state = {
        version: '3.0',
        data: {
          curves: [
            // Titre contenant des espaces et caractères spéciaux non conformes
            { title: 'temps (s)', unit: 's', values: [0, 1, 2] },
            { title: 'vitesse / pt', unit: 'm/s', values: [0, 5, 10] }
          ],
          models: [
            {
              id: 'm1',
              xTitle: 'temps (s)',
              yTitle: 'vitesse / pt',
              type: 'linear',
              parameters: [{ name: 'p 1', value: 5 }]
            }
          ],
          annotations: [
            {
              id: 'ann-1',
              type: 'tangent-method',
              point1: { x: 0, y: 0 },
              point2: { x: 2, y: 10 },
              slope: 5,
              seriesName: 'vitesse / pt'
            }
          ]
        },
        grapher: {
          xCurve: 'temps (s)',
          yCurves: ['vitesse / pt']
        },
        sort: {
          lastSortVariable: 'temps (s)'
        }
      };

      await ioManager._processPWState(state);

      const sanitizedX = data.curves[0].title;
      const sanitizedY = data.curves[1].title;

      // Vérifie que les courbes ont bien été assainies
      assert.notEqual(sanitizedX, 'temps (s)');
      assert.notEqual(sanitizedY, 'vitesse / pt');

      // Vérifie que xCurve et yCurves sur le grapher ont été traduits
      assert.equal(app.grapher.currentXCurve, sanitizedX);

      // Vérifie que la variable de tri a été traduite
      assert.equal(data.lastSortVariable, sanitizedX);
      assert.equal(sortVariableSelect.value, sanitizedX);

      // Vérifie que l'annotation tangent-method cible le bon nom assaini
      assert.equal(data.annotations[0].seriesName, sanitizedY);

      // Vérifie que le modèle a été mis à jour
      assert.equal(data.models[0].x.title, sanitizedX);
      assert.equal(data.models[0].y.title, sanitizedY);
    });

    it('doit restaurer le zoom utilisateur même si uniquement max est contraint, et afficher le bouton zoom auto', async () => {
      const state = {
        version: '3.0',
        data: {
          curves: [{ title: 'x', unit: 'm', values: [1, 2, 3] }]
        },
        grapher: {
          xCurve: 'x',
          yCurves: [],
          zoom: {
            xUserMin: null,
            xUserMax: 5.5, // seulement le max
            yUserMin: null,
            yUserMax: null
          }
        }
      };

      await ioManager._processPWState(state);

      assert.equal(app.grapher.hasUserZoom, true, 'hasUserZoom doit être vrai si au moins une borne est définie');
      assert.equal(autoZoomButton.classList.contains('is-hidden'), false, 'Le bouton Zoom auto doit être visible');
      assert.equal(xAxis.userMax, 5.5);
    });

    it('doit cacher le bouton zoom auto si aucun zoom manuel n\'est présent dans le fichier', async () => {
      // Bouton visible au départ
      autoZoomButton.classList.remove('is-hidden');

      const state = {
        version: '3.0',
        data: {
          curves: [{ title: 'x', unit: 'm', values: [1, 2, 3] }]
        },
        grapher: {
          xCurve: 'x',
          yCurves: [],
          zoom: {
            xUserMin: null,
            xUserMax: null,
            yUserMin: null,
            yUserMax: null
          }
        }
      };

      await ioManager._processPWState(state);

      assert.equal(app.grapher.hasUserZoom, false);
      assert.equal(autoZoomButton.classList.contains('is-hidden'), true, 'Le bouton Zoom auto doit être masqué');
    });
  });
});

