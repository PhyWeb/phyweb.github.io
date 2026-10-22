import '../helpers/setup.mjs';
import { describe, it, beforeEach } from 'node:test';
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

const createMockChart = (seriesList = []) => {
  return {
    xAxis: [{
      toPixels: (val) => val * 10,
      getExtremes: () => ({ min: 0, max: 25 })
    }],
    yAxis: [{
      toPixels: (val) => val * 10,
      getExtremes: () => ({ min: 0, max: 14 })
    }],
    plotLeft: 50,
    plotTop: 20,
    plotWidth: 500,
    plotHeight: 400,
    series: seriesList,
    renderer: {
      path: () => createMockElement(),
      circle: () => createMockElement(),
      label: () => createMockElement()
    }
  };
};

describe('Méthode des tangentes - Vérification de la résolution des bugs', () => {
  let data;
  let grapher;

  beforeEach(() => {
    data = new Data({ significantDigits: 4 });
    data.addCurve('V', 'mL');
    data.addCurve('pH', '');

    grapher = new Grapher(data, {
      grapherGrid: true,
      minorGrid: false,
      includeOriginOnAutoZoom: false
    });
    grapher.currentXCurve = 'V';
  });

  describe('Bug 1 résolu : drawAnnotations avec segment vertical (pB.x === pA.x)', () => {
    it('doit calculer et afficher eqPoint et eqLabel quand pB.x === pA.x', () => {
      const seriesData = [
        [0, 12.0],
        [4, 11.8],
        [10, 10.0],
        [10, 4.0], // segment vertical pA=(10, 10) -> pB=(10, 4)
        [16, 2.2],
        [20, 2.0]
      ];

      const mockSeries = {
        name: 'pH',
        userOptions: { unit: '' },
        options: { data: seriesData }
      };

      grapher.chart = createMockChart([mockSeries]);

      grapher.data.annotations = [{
        id: 'tangent-ann-1',
        type: 'tangent-method',
        point1: { x: 4, y: 11.8 },
        point2: { x: 16, y: 2.2 },
        slope: 0,
        seriesName: 'pH'
      }];

      grapher.drawAnnotations();

      assert.equal(grapher.renderedAnnotations.length, 1);
      const rendered = grapher.renderedAnnotations[0];

      assert.notEqual(rendered.eqPoint, undefined, 'eqPoint doit être défini');
      assert.notEqual(rendered.eqLabel, undefined, 'eqLabel doit être défini');
    });
  });

  describe('Bug 2 résolu : _findTangentMethodPoints face à dx === 0', () => {
    it('ne doit pas renvoyer null et doit trouver le saut réel même en présence de dx === 0', () => {
      const seriesData = [
        [0, 12.0],
        [0, 12.05], // dx = 0 sur le palier initial
        [2, 12.0],
        [4, 11.9],
        [6, 11.8],
        [10, 7.0],  // Véritable saut
        [14, 2.2],
        [16, 2.1],
        [18, 2.0]
      ];

      const point = {
        series: { options: { data: seriesData } },
        x: 4,
        y: 11.9
      };

      const result = grapher._findTangentMethodPoints(point, -0.05);

      assert.notEqual(result, null, 'Le résultat ne doit pas être null');
      assert.equal(result.p1.x, 4);
      assert.ok(result.p2.x >= 14, 'Le second point p2 doit se trouver après le saut');
    });
  });
});

