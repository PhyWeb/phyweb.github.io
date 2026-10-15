import '../helpers/setup.mjs';
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import Data, { Model } from '../../grapher/modules/data.js';
import UIManager from '../../grapher/modules/ui.js';
import { Grapher } from '../../grapher/modules/grapher.js';

describe('Recalcul des modèles et mise à jour du graphique', () => {
  let recalculateBtn;
  let elementsMap;

  beforeEach(() => {
    recalculateBtn = {
      disabled: false,
      classList: {
        add: () => {},
        remove: () => {},
        contains: () => false
      },
      addEventListener: function(event, handler) {
        if (event === 'click') {
          this.clickHandler = handler;
        }
      }
    };

    elementsMap = {
      '#recalculate-models-button': recalculateBtn,
      '#modelisation-panel': { classList: { add: () => {}, remove: () => {} } },
      '#expand-modelisation-button': { addEventListener: () => {}, classList: { add: () => {}, remove: () => {} } },
      '#compress-modelisation-button': { addEventListener: () => {}, classList: { add: () => {}, remove: () => {} } },
      '#model-list': { addEventListener: () => {} },
      '#add-model-modal': { addEventListener: () => {}, classList: { add: () => {}, remove: () => {} } },
      '#model-x-select': { appendChild: () => {}, addEventListener: () => {} },
      '#model-y-select': { appendChild: () => {}, addEventListener: () => {} },
      '#model-type-select': { addEventListener: () => {} },
      '#add-model-button': { addEventListener: () => {} }
    };

    global.__querySelectorOverride = (sel) => {
      if (elementsMap[sel]) return elementsMap[sel];
      return {
        value: '',
        style: {},
        classList: { add: () => {}, remove: () => {}, contains: () => false },
        appendChild: () => {},
        addEventListener: () => {},
        querySelectorAll: () => []
      };
    };

    global.document.getElementById = (id) => {
      const sel = `#${id}`;
      if (elementsMap[sel]) return elementsMap[sel];
      return global.__querySelectorOverride(sel);
    };
  });

  it('Grapher.updateModels() doit appeler redrawAllModels et chart.redraw avec suppressModelAutoUpdate', () => {
    let redrawAllModelsCalled = false;
    let redrawCalled = false;
    let suppressDuringRedraw = null;

    const data = new Data({ significantDigits: 4 });
    const grapher = new Grapher(data, {});

    grapher.chart = {
      redraw: () => {
        redrawCalled = true;
        suppressDuringRedraw = grapher.suppressModelAutoUpdate;
      }
    };
    grapher.redrawAllModels = () => {
      redrawAllModelsCalled = true;
    };

    assert.equal(grapher.suppressModelAutoUpdate, false);
    grapher.updateModels();

    assert.ok(redrawAllModelsCalled, 'redrawAllModels doit avoir été appelée');
    assert.ok(redrawCalled, 'chart.redraw doit avoir été appelée');
    assert.equal(suppressDuringRedraw, true, 'suppressModelAutoUpdate doit être vrai pendant redraw');
    assert.equal(grapher.suppressModelAutoUpdate, false, 'suppressModelAutoUpdate doit être réinitialisé à faux');
  });

  it('Grapher.redrawAllModels() doit mettre à jour les points de la série en mémoire avec les nouveaux paramètres', () => {
    const data = new Data({ significantDigits: 4 });
    const curveX = data.addCurve('x', 'm');
    const curveY = data.addCurve('y', 'N');
    for (let i = 0; i <= 5; i++) {
      curveX.push(i);
      curveY.push(i * 2);
    }

    const model = new Model(curveX, curveY, 'linear', data, '#ff0000', true, 2, 'Solid');
    model.parameters = [{ name: 'a', value: 2 }];
    data.models.push(model);

    const grapher = new Grapher(data, {});
    grapher.currentXCurve = 'x';

    let updatedSeriesData = null;
    const seriesId = `model-${model.id}`;
    const mockSeries = {
      id: seriesId,
      setData: (newData, redraw, animation) => {
        updatedSeriesData = newData;
        assert.equal(redraw, false);
      }
    };

    grapher.chart = {
      xAxis: [{
        getExtremes: () => ({ min: 0, max: 10, dataMin: 0, dataMax: 5 })
      }],
      get: (id) => (id === seriesId ? mockSeries : null)
    };

    // Modification des paramètres du modèle (par exemple recalcul: a passe de 2 à 5)
    model.parameters[0].value = 5;

    grapher.redrawAllModels();

    assert.ok(updatedSeriesData, 'La série doit avoir été mise à jour');
    assert.ok(updatedSeriesData.length > 0, 'Des points doivent avoir été générés');
    // Pour x = 10 (la borne max), y doit être 5 * 10 = 50
    const lastPoint = updatedSeriesData[updatedSeriesData.length - 1];
    assert.equal(lastPoint[0], 10);
    assert.equal(lastPoint[1], 50);
  });

  it('Le clic sur recalculateButton doit appeler updateModels et mettre à jour le graphique dès le premier clic', async () => {
    let updateModelsCalled = 0;
    let updateCalculationUICalled = false;

    const data = new Data({ significantDigits: 4 });
    const curveX = data.addCurve('x', 'm');
    const curveY = data.addCurve('y', 'N');
    for (let i = 0; i <= 5; i++) {
      curveX.push(i);
      curveY.push(i * 3);
    }

    const model = new Model(curveX, curveY, 'linear', data, '#ff0000', true, 2, 'Solid');
    model.parameters = [{ name: 'a', value: 3 }];
    data.models.push(model);

    const mockGrapher = {
      showLoading: () => {},
      hideLoading: () => {},
      updateModels: () => {
        updateModelsCalled++;
      },
      chart: {
        redraw: () => {}
      }
    };

    const mockApp = {
      data,
      recalculateAllModels: async () => {
        model.parameters[0].value = 4.2;
        return { successful: [model], failed: [] };
      }
    };

    const ui = new UIManager({}, data, mockGrapher, {}, {}, {});
    ui.setApp(mockApp);
    ui.updateModelPanel = () => {};
    ui.updateCalculationUI = () => {
      updateCalculationUICalled = true;
    };

    ui.initModelisationControls();

    assert.ok(recalculateBtn.clickHandler, 'Le handler de clic doit être enregistré');

    // Premier clic sur le bouton de recalcul
    await recalculateBtn.clickHandler();

    assert.equal(updateModelsCalled, 1, 'updateModels doit être appelé dès le premier clic');
    assert.ok(updateCalculationUICalled, 'updateCalculationUI doit avoir été appelé');
    assert.equal(model.parameters[0].value, 4.2);
  });
});
