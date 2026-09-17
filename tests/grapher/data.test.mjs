import '../helpers/setup.mjs';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Model } from '../../grapher/modules/data.js';

describe('Model - calculateRMSE() et gestion des bornes', () => {
  const createMockData = () => ({
    parameters: {},
    curves: []
  });

  describe('Calcul de RMSE sur modèle sans bornes', () => {
    it('doit calculer un RMSE nul pour un ajustement parfait (modèle linéaire)', () => {
      const x = [1, 2, 3, 4];
      const y = [2, 4, 6, 8];
      const model = new Model(x, y, 'linear', createMockData());
      model.parameters = [{ name: 'a', value: 2 }];

      model.calculateRMSE();
      assert.equal(model.rmse, 0);
    });

    it('doit calculer la valeur exacte de l\'écart quadratique moyen avec résidus', () => {
      const x = [1, 2, 3];
      const y = [2.1, 3.9, 6.0]; // erreurs: +0.1, -0.1, 0.0 -> somme carrés: 0.01 + 0.01 = 0.02
      const model = new Model(x, y, 'linear', createMockData());
      model.parameters = [{ name: 'a', value: 2 }];

      model.calculateRMSE();
      const expected = Math.sqrt(0.02 / 3);
      assert.ok(Math.abs(model.rmse - expected) < 1e-12);
    });
  });

  describe('Calcul de RMSE sur modèle borné (minX / maxX)', () => {
    it('doit ignorer les points aberrants situés hors des bornes minX et maxX', () => {
      // Points dans [1, 4] : parfaits pour y = 2x
      // Points hors bornes : 0 et 10 avec des valeurs très éloignées
      const x = [0, 1, 2, 3, 4, 10];
      const y = [999, 2, 4, 6, 8, -999];

      const model = new Model(x, y, 'linear', createMockData());
      model.minX = 1;
      model.maxX = 4;
      model.parameters = [{ name: 'a', value: 2 }];

      model.calculateRMSE();

      // Sans la correction du bug, le RMSE prenait en compte 0 et 10 et valait ~576.8
      // Avec la correction, seuls les points de [1, 4] sont évalués -> RMSE = 0
      assert.equal(model.rmse, 0);
    });

    it('doit restreindre le calcul à minX lorsque seul minX est défini', () => {
      const x = [0, 1, 2, 3];
      const y = [100, 2, 4, 6]; // x=0 est hors borne et aberrant

      const model = new Model(x, y, 'linear', createMockData());
      model.minX = 1;
      model.maxX = null;
      model.parameters = [{ name: 'a', value: 2 }];

      model.calculateRMSE();
      assert.equal(model.rmse, 0);
    });

    it('doit restreindre le calcul à maxX lorsque seul maxX est défini', () => {
      const x = [1, 2, 3, 10];
      const y = [2, 4, 6, 100]; // x=10 est hors borne et aberrant

      const model = new Model(x, y, 'linear', createMockData());
      model.minX = null;
      model.maxX = 3;
      model.parameters = [{ name: 'a', value: 2 }];

      model.calculateRMSE();
      assert.equal(model.rmse, 0);
    });
  });

  describe('Cohérence entre appel direct et passage explicite de data', () => {
    it('doit retourner le même résultat avec model.calculateRMSE(data) et model.calculateRMSE()', () => {
      const x = [0, 1, 2, 3, 5];
      const y = [100, 2.2, 4.1, 5.9, 100];
      const model = new Model(x, y, 'linear', createMockData());
      model.minX = 1;
      model.maxX = 3;
      model.parameters = [{ name: 'a', value: 2 }];

      const boundedData = model._buildData();
      model.calculateRMSE(boundedData);
      const rmseExplicit = model.rmse;

      model.calculateRMSE(); // Sans paramètre -> utilise _buildData()
      const rmseImplicit = model.rmse;

      assert.equal(rmseExplicit, rmseImplicit);
    });
  });

  describe('Cas limites et robustesse', () => {
    it('doit donner rmse = 0 quand il n\'y a aucun paramètre', () => {
      const model = new Model([1, 2], [2, 4], 'linear', createMockData());
      model.parameters = [];
      model.calculateRMSE();
      assert.equal(model.rmse, 0);
    });

    it('doit donner rmse = 0 quand aucun point valide n\'est dans l\'intervalle', () => {
      const x = [1, 2, 3];
      const y = [2, 4, 6];
      const model = new Model(x, y, 'linear', createMockData());
      model.minX = 10;
      model.maxX = 20;
      model.parameters = [{ name: 'a', value: 2 }];

      model.calculateRMSE();
      assert.equal(model.rmse, 0);
    });

    it('doit ignorer les valeurs null, vides ou non-finies dans l\'intervalle', () => {
      const x = [1, 2, null, 3, 4];
      const y = [2, null, 4, '', 8]; // seuls (1,2) et (4,8) sont valides
      const model = new Model(x, y, 'linear', createMockData());
      model.minX = 1;
      model.maxX = 4;
      model.parameters = [{ name: 'a', value: 2 }];

      model.calculateRMSE();
      assert.equal(model.rmse, 0);
    });
  });

  describe('Intégration avec _applyParams()', () => {
    it('doit calculer le bon RMSE et R² via _applyParams avec données bornées', () => {
      const x = [0, 1, 2, 3, 10];
      const y = [1000, 2, 4, 6, 1000];
      const model = new Model(x, y, 'linear', createMockData());
      model.minX = 1;
      model.maxX = 3;

      const data = model._buildData();
      model._applyParams([2], data);

      assert.equal(model.rmse, 0);
      assert.equal(model.rSquared, 1);
    });
  });
});

