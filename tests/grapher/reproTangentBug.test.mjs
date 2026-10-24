import '../helpers/setup.mjs';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import Data from '../../grapher/modules/data.js';
import Grapher from '../../grapher/modules/grapher.js';

const createMockElement = () => {
  const el = {
    attr() { return el; },
    css() { return el; },
    add() { return el; },
    destroy() {},
    translate() {},
    getBBox() { return { width: 10, height: 10 }; }
  };
  return el;
};

describe('Bug 2.4 résolu : Robustesse de la méthode des tangentes face au bruit et titrages descendants', () => {
  it('ne doit pas confondre un bruit local de pas resserré avec le saut d\'équivalence lors d\'un titrage descendant', () => {
    const data = new Data({ significantDigits: 4 });
    data.addCurve('V', 'mL');
    data.addCurve('pH', '');

    const grapher = new Grapher(data, {
      grapherGrid: true,
      minorGrid: false,
      includeOriginOnAutoZoom: false
    });
    grapher.currentXCurve = 'V';

    // Titrage base forte par acide fort (pH descendant de 12.5 à 1.5)
    // Saut réel à V = 10 mL (s = -3.5)
    // Bruit local à V = 4 mL : s = +5.0 (pente opposée au sens global du titrage)
    const seriesData = [
      [0, 12.5],
      [2, 12.2],
      [3.95, 12.1],
      [4.00, 12.35], // Bruit local : s = (12.6 - 12.1)/(4.05 - 3.95) = +5.0
      [4.05, 12.6],
      [6, 11.8],
      [8, 11.4],
      [9, 10.5],
      [10, 7.0],     // Vrai saut : s = (3.5 - 10.5)/(11 - 9) = -3.5
      [11, 3.5],
      [12, 2.5],
      [14, 2.0],
      [16, 1.8],
      [18, 1.6],
      [20, 1.5]
    ];

    // Clic sur le premier plateau à V = 6 mL (après le bruit mais avant le vrai saut)
    const pointAt6 = {
      series: { options: { data: seriesData } },
      x: 6,
      y: 11.8
    };
    const slopeAt6 = (11.4 - 12.6) / (8 - 4.05);
    const resultFrom6 = grapher._findTangentMethodPoints(pointAt6, slopeAt6);

    assert.notEqual(resultFrom6, null, 'Un point p2 doit être trouvé');
    assert.equal(resultFrom6.p1.x, 6);
    // p2 doit impérativement se trouver après le saut d'équivalence (V >= 10 mL), pas au début (V = 0 mL)
    assert.ok(resultFrom6.p2.x >= 10, `p2 doit être sur le second plateau (obtenu: ${resultFrom6.p2.x})`);
  });

  it('doit choisir l\'intersection à plus forte pente lorsque la médiane est coupée plusieurs fois', () => {
    const data = new Data({ significantDigits: 4 });
    data.addCurve('V', 'mL');
    data.addCurve('pH', '');

    const grapher = new Grapher(data, {
      grapherGrid: true,
      minorGrid: false,
      includeOriginOnAutoZoom: false
    });
    grapher.currentXCurve = 'V';

    // Courbe coupant la médiane y = 7.0 deux fois entre V = 4 et V = 16 :
    // 1ère intersection à V = 6.0 avec une pente faible (mSeg = -2.0)
    // 2ème intersection à V = 10.0 avec une pente forte (mSeg = -30.0, le vrai saut)
    const seriesData = [
      [0, 12.0],
      [4, 11.8],
      [5.9, 7.2],
      [6.1, 6.8],  // Coupe y=7.0 à x=6.0 (pente douce = -2)
      [6.3, 7.2],  // Remonte au-dessus
      [8.0, 11.0],
      [9.9, 10.0],
      [10.1, 4.0], // Coupe y=7.0 à x=10.0 (pente raide = -30, vrai saut)
      [14, 2.2],
      [16, 2.0]
    ];

    let capturedEqX = null;
    let capturedEqY = null;

    const mockSeries = {
      name: 'pH',
      userOptions: { unit: '' },
      options: { data: seriesData }
    };

    grapher.chart = {
      xAxis: [{
        toPixels: (val) => val * 10,
        getExtremes: () => ({ min: 0, max: 20 })
      }],
      yAxis: [{
        toPixels: (val) => val * 10,
        getExtremes: () => ({ min: 0, max: 14 })
      }],
      plotLeft: 50,
      plotTop: 20,
      plotWidth: 500,
      plotHeight: 400,
      series: [mockSeries],
      renderer: {
        path: () => createMockElement(),
        circle: (px, py) => {
          capturedEqX = px / 10;
          capturedEqY = py / 10;
          return createMockElement();
        },
        label: () => createMockElement()
      }
    };

    // Tangentes horizontales à y = 11.8 et y = 2.0 -> Médiane à y = 6.9 ou 7.0
    grapher.data.annotations = [{
      id: 'tangent-ann-multi',
      type: 'tangent-method',
      point1: { x: 4, y: 12.0 },
      point2: { x: 16, y: 2.0 },
      slope: 0,
      seriesName: 'pH'
    }];

    grapher.drawAnnotations();

    assert.notEqual(capturedEqX, null, 'eqPoint doit être calculé');
    // Le point d'équivalence retenu doit être autour de V = 10.0 (vrai saut), pas V = 6.0
    assert.ok(Math.abs(capturedEqX - 10.0) < 0.2, `eqPoint doit correspondre au saut à V=10 (obtenu: ${capturedEqX})`);
  });
});
