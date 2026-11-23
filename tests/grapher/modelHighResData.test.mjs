import '../helpers/setup.mjs';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import Data, { Model } from '../../grapher/modules/data.js';
import Grapher from '../../grapher/modules/grapher.js';

describe('Model.getHighResData() - assainissement des valeurs non finies', () => {
  const createMockData = () => ({
    parameters: {},
    curves: []
  });

  it('remplace -Infinity (x = 0) et NaN (x < 0) par null pour les modèles ln et log', () => {
    for (const type of ['ln', 'log']) {
      const model = new Model([], [], type, createMockData());
      model.parameters = [
        { name: 'a', value: 2 },
        { name: 'b', value: 1 }
      ];

      // Cas typique includeOriginOnAutoZoom = true : minX = 0
      const fromZero = model.getHighResData(0, 4, 5);
      assert.equal(fromZero.length, 5);
      assert.deepEqual(fromZero[0], [0, null]);
      for (let i = 1; i < fromZero.length; i++) {
        assert.ok(Number.isFinite(fromZero[i][1]), `${type} en x=${fromZero[i][0]} doit être fini`);
      }

      // Cas dézoom : minX < 0 avec point exact en x = 0
      const withNegativeX = model.getHighResData(-2, 2, 5); // x: -2, -1, 0, 1, 2
      assert.equal(withNegativeX[0][1], null);
      assert.equal(withNegativeX[1][1], null);
      assert.equal(withNegativeX[2][1], null);
      assert.ok(Number.isFinite(withNegativeX[3][1]));
      assert.ok(Number.isFinite(withNegativeX[4][1]));
    }
  });

  it('remplace ±Infinity et NaN par null pour le modèle power', () => {
    // Exposant négatif -> Infinity en x = 0
    const invModel = new Model([], [], 'power', createMockData());
    invModel.parameters = [
      { name: 'a', value: 3 },
      { name: 'b', value: -1 }
    ];
    const invData = invModel.getHighResData(0, 4, 5);
    assert.deepEqual(invData[0], [0, null]);
    assert.ok(Math.abs(invData[1][1] - 3) < 1e-12);

    // Exposant non entier -> NaN pour x < 0
    const sqrtModel = new Model([], [], 'power', createMockData());
    sqrtModel.parameters = [
      { name: 'a', value: 2 },
      { name: 'b', value: 0.5 }
    ];
    const sqrtData = sqrtModel.getHighResData(-2, 2, 5); // x: -2, -1, 0, 1, 2
    assert.equal(sqrtData[0][1], null);
    assert.equal(sqrtData[1][1], null);
    assert.equal(sqrtData[2][1], 0);
    assert.equal(sqrtData[3][1], 2);
    assert.ok(Number.isFinite(sqrtData[4][1]));
  });

  it('remplace NaN et Infinity par null pour exp1, exp2, dampedsin et dampedcos si tau = 0', () => {
    const cases = [
      { type: 'exp1', params: [5, 0] },
      { type: 'exp2', params: [5, 0] },
      { type: 'dampedsin', params: [5, 1, 0, 0, 1] },
      { type: 'dampedcos', params: [5, 1, 0, 0, 1] }
    ];

    for (const { type, params } of cases) {
      const model = new Model([], [], type, createMockData());
      model.parameters = params.map((value, idx) => ({ name: `p${idx}`, value }));

      const pts = model.getHighResData(-1, 1, 3); // x: -1, 0, 1
      assert.equal(pts.length, 3);
      for (const [x, y] of pts) {
        assert.ok(
          y === null || Number.isFinite(y),
          `${type} en x=${x} ne doit jamais retourner NaN ou ±Infinity (reçu: ${y})`
        );
      }
      // En x = 0, -0 / 0 vaut NaN -> doit devenir null
      assert.equal(pts[1][1], null, `${type} en x=0 avec tau=0 doit valoir null`);
    }
  });

  it('retourne [] si les bornes minX/maxX sont non finies ou si le type est inconnu', () => {
    const lnModel = new Model([], [], 'ln', createMockData());
    lnModel.parameters = [{ name: 'a', value: 1 }, { name: 'b', value: 0 }];
    assert.deepEqual(lnModel.getHighResData(NaN, 10), []);
    assert.deepEqual(lnModel.getHighResData(0, undefined), []);

    const origError = console.error;
    console.error = () => {};
    try {
      const unknownModel = new Model([], [], 'unknown_type', createMockData());
      unknownModel.parameters = [{ name: 'a', value: 1 }];
      assert.deepEqual(unknownModel.getHighResData(0, 10), []);
    } finally {
      console.error = origError;
    }
  });
});

describe('Grapher._findNearestModelPoint() - filtrage des points hors domaine', () => {
  const createGrapherWithModelPoints = (points) => {
    const data = new Data();
    const xCurve = data.addCurve('x', '');
    const yCurve = data.addCurve('y', '');
    xCurve.push(1, 2);
    yCurve.push(0, 1);

    const model = new Model(xCurve, yCurve, 'ln', data);
    model.visible = true;
    data.models.push(model);

    const grapher = new Grapher(data, { grapherGrid: true });
    grapher.currentXCurve = 'x';

    const modelSeries = {
      visible: true,
      points
    };

    const xAxis = {
      toValue: (px) => (px - 50) / 10, // x = 0 à px = 50, x = -2 à px = 30
      toPixels: (val) => 50 + val * 10
    };
    const yAxis = {
      toPixels: (val) => {
        if (val === null) return 200; // Simule la coercion null -> 0 de Highcharts
        return 200 - val * 10;
      }
    };

    grapher.chart = {
      plotLeft: 50,
      plotTop: 10,
      pointer: {},
      xAxis: [xAxis],
      yAxis: [yAxis],
      get: (id) => (id === `model-${model.id}` ? modelSeries : null)
    };

    return grapher;
  };

  it('ignore les points null / isNull / NaN / ±Infinity et s\'aimante au point défini le plus proche', () => {
    const grapher = createGrapherWithModelPoints([
      { x: -2, y: null, isNull: true },
      { x: -1, y: NaN, isNull: true },
      { x: 0, y: -Infinity, isNull: true },
      { x: 1, y: 0, isNull: false },
      { x: 2, y: Math.log(2), isNull: false }
    ]);

    // Curseur en x = -1.5 (chartX = 35) : ne doit pas retourner les points x <= 0
    const best = grapher._findNearestModelPoint({ chartX: 35, chartY: 150 });
    assert.ok(best !== null);
    assert.equal(best.x, 1);
    assert.equal(best.y, 0);
    assert.ok(Number.isFinite(best.plotX));
    assert.ok(Number.isFinite(best.plotY));
  });

  it('retourne null si tous les points du modèle dans la vue sont hors domaine', () => {
    const grapher = createGrapherWithModelPoints([
      { x: -3, y: null, isNull: true },
      { x: -2, y: null, isNull: true },
      { x: -1, y: null, isNull: true }
    ]);

    const best = grapher._findNearestModelPoint({ chartX: 30, chartY: 150 });
    assert.equal(best, null);
  });
});
