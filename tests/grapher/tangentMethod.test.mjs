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

describe('Grapher - Méthode des tangentes (robustesse dx=0, segments verticaux et dosages décroissants)', () => {
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

  describe('drawAnnotations - Calcul du point d\'équivalence', () => {
    it('doit calculer correctement eqPoint quand le saut contient un segment vertical (pB.x === pA.x)', () => {
      // Courbe de titrage avec saut vertical à V = 10 mL
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

      // Tangentes horizontales : Palier 1 à y=11.8 (x=4), Palier 2 à y=2.2 (x=16) -> Médiane y = 7.0
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

      // Le point d'équivalence et son étiquette doivent être correctement créés
      assert.notEqual(rendered.eqPoint, undefined, 'eqPoint doit être créé pour un segment vertical');
      assert.notEqual(rendered.eqLabel, undefined, 'eqLabel doit être affiché');
    });

    it('ne doit pas détecter de fausse intersection si un segment vertical ne traverse pas la médiane', () => {
      // Données restant toutes sous la médiane y = 7.0
      const seriesData = [
        [0, 5.0],
        [4, 4.0],
        [10, 3.0],
        [10, 1.0], // segment vertical sous la médiane y = 7.0
        [16, 2.2],
        [20, 2.0]
      ];

      const mockSeries = {
        name: 'pH',
        userOptions: { unit: '' },
        options: { data: seriesData }
      };

      grapher.chart = createMockChart([mockSeries]);

      // Médiane à y = 7.0
      grapher.data.annotations = [{
        id: 'tangent-ann-1',
        type: 'tangent-method',
        point1: { x: 4, y: 11.8 },
        point2: { x: 16, y: 2.2 },
        slope: 0,
        seriesName: 'pH'
      }];

      grapher.drawAnnotations();

      const rendered = grapher.renderedAnnotations[0];
      assert.equal(rendered.eqPoint, undefined, 'Aucun point d\'équivalence ne doit être créé hors de la médiane');
    });
  });

  describe('_findTangentMethodPoints - Détection du saut et robustesse face à dx === 0', () => {
    it('doit ignorer un dx === 0 sur un palier et identifier le véritable saut d\'équivalence', () => {
      // Données avec deux mesures successives à V = 0 mL
      const seriesData = [
        [0, 12.0],
        [0, 12.05], // dx = 0
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

      assert.notEqual(result, null, 'Le point p2 doit être trouvé');
      assert.equal(result.p1.x, 4);
      assert.ok(result.p2.x >= 14, 'Le point p2 doit être trouvé après le saut d\'équivalence');
    });

    it('doit fonctionner sur une courbe de titrage décroissante (base forte par acide fort)', () => {
      const dosageData = [
        [0, 12.5],
        [2, 12.3],
        [4, 12.0],
        [6, 11.6],
        [8, 10.5],
        [10, 7.0], // Saut à l'équivalence (pente négative la plus forte)
        [12, 3.5],
        [14, 2.4],
        [16, 2.0],
        [18, 1.7],
        [20, 1.5]
      ];

      const point1 = {
        series: { options: { data: dosageData } },
        x: 4,
        y: 12.0
      };

      const slope1 = (11.6 - 12.3) / (6 - 2); // -0.175
      const tangentPoints = grapher._findTangentMethodPoints(point1, slope1);

      assert.notEqual(tangentPoints, null);
      assert.equal(tangentPoints.p1.x, 4);
      assert.equal(tangentPoints.p2.x, 16); // Point ayant la pente la plus proche de slope1 de l'autre côté du saut
    });
  });
});

