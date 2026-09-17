import '../helpers/setup.mjs';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import Data, { Model } from '../../grapher/modules/data.js';

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

  describe('Intégration avec _applyParams() et préservation des noms', () => {
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

    it('doit générer les noms par défaut (a, b...) uniquement lors de la création initiale (parameters vide)', () => {
      const x = [1, 2, 3];
      const y = [2, 4, 6];
      const mockData = createMockData();
      const model = new Model(x, y, 'affine', mockData);
      assert.equal(model.parameters.length, 0);

      const data = model._buildData();
      model._applyParams([2, 0], data);

      assert.equal(model.parameters.length, 2);
      assert.equal(model.parameters[0].name, 'a');
      assert.equal(model.parameters[1].name, 'b');
      assert.equal(mockData.parameters['a'].value, 2);
      assert.equal(mockData.parameters['b'].value, 0);
    });

    it('doit préserver le nom personnalisé du paramètre lors d\'un réajustement (ex: après modification de bornes)', () => {
      const x = [0, 1, 2, 3, 4, 10];
      const y = [999, 2, 4, 6, 8, -999];
      const mockData = createMockData();
      const model = new Model(x, y, 'linear', mockData);

      // Premier ajustement initial
      model._applyParams([2], model._buildData());
      assert.equal(model.parameters[0].name, 'a');

      // L'utilisateur renomme le paramètre 'a' en 'pente'
      model.parameters[0].name = 'pente';
      mockData.parameters['pente'] = { value: 2, unit: 'm/s', type: 'model' };
      delete mockData.parameters['a'];

      // L'utilisateur change les bornes minX / maxX et relance l'ajustement
      model.minX = 1;
      model.maxX = 4;
      const boundedData = model._buildData();
      model._applyParams([2], boundedData);

      // Le nom personnalisé 'pente' doit être conservé
      assert.equal(model.parameters.length, 1);
      assert.equal(model.parameters[0].name, 'pente');
      assert.equal(model.parameters[0].value, 2);
      assert.ok(mockData.parameters['pente']);
      assert.equal(mockData.parameters['pente'].value, 2);
      assert.equal(mockData.parameters['pente'].unit, 'm/s');
      assert.equal(mockData.parameters['a'], undefined, 'Le paramètre a ne doit pas réapparaître');
      assert.ok(model.getEquationString().includes('pente'));
    });

    it('doit préserver plusieurs noms personnalisés et leur ordre lors d\'un réajustement (modèle affine)', () => {
      const x = [1, 2, 3, 4];
      const y = [5, 7, 9, 11]; // y = 2x + 3
      const mockData = createMockData();
      const model = new Model(x, y, 'affine', mockData);

      // Paramètres personnalisés pré-existants
      model.parameters = [
        { name: 'coeff_dir', value: 1 },
        { name: 'ord_origine', value: 0 }
      ];
      mockData.parameters['coeff_dir'] = { value: 1, unit: '', type: 'model' };
      mockData.parameters['ord_origine'] = { value: 0, unit: '', type: 'model' };

      const data = model._buildData();
      model._applyParams([2, 3], data);

      assert.equal(model.parameters[0].name, 'coeff_dir');
      assert.equal(model.parameters[0].value, 2);
      assert.equal(model.parameters[1].name, 'ord_origine');
      assert.equal(model.parameters[1].value, 3);
      assert.equal(mockData.parameters['coeff_dir'].value, 2);
      assert.equal(mockData.parameters['ord_origine'].value, 3);
      assert.equal(mockData.parameters['a'], undefined);
      assert.equal(mockData.parameters['b'], undefined);
      assert.equal(model.rmse, 0);
      assert.equal(model.rSquared, 1);
    });

    it('doit supporter le renommage combiné à un réajustement (logique de sauvegarde modale)', () => {
      const x = [1, 2, 3, 4];
      const y = [3, 6, 9, 12]; // y = 3x
      const mockData = createMockData();
      const model = new Model(x, y, 'linear', mockData);

      // Modèle initial avec 'a'
      model._applyParams([2], model._buildData());

      // Simulation de la séquence de sauvegarde de openEditModelModal :
      // 1. L'utilisateur a saisi un nouveau nom 'vitesse' pour l'ancien nom 'a'
      const newParamNames = { a: 'vitesse' };
      const updatedParams = {};
      model.parameters.forEach(param => {
        const oldName = param.name;
        const newName = newParamNames[oldName] || oldName;
        if (oldName !== newName) {
          delete mockData.parameters[oldName];
        }
        param.name = newName;
        updatedParams[newName] = { value: param.value, unit: '', type: 'model' };
      });
      Object.assign(mockData.parameters, updatedParams);

      // 2. Les bornes ont changé -> réajustement
      model.minX = 1;
      model.maxX = 4;
      const boundedData = model._buildData();
      model._applyParams([3], boundedData);

      // Vérification : le nom 'vitesse' est bien celui conservé avec la nouvelle valeur 3
      assert.equal(model.parameters[0].name, 'vitesse');
      assert.equal(model.parameters[0].value, 3);
      assert.equal(mockData.parameters['vitesse'].value, 3);
      assert.equal(mockData.parameters['a'], undefined);
    });
  });
});

describe('Data - sortDataBy()', () => {
  const createTestData = () => new Data({ significantDigits: 4 });

  it('doit trier les données selon la première courbe (index 0) sans modifier l\'ordre des colonnes', () => {
    const data = createTestData();
    const curveA = data.addCurve('A', 'm');
    curveA.push(30, 10, 20);
    const curveB = data.addCurve('B', 's');
    curveB.push(3, 1, 2);

    data.sortDataBy('A');

    assert.deepEqual(data.curves.map(c => c.title), ['A', 'B']);
    assert.deepEqual([...data.curves[0]], [10, 20, 30]);
    assert.deepEqual([...data.curves[1]], [1, 2, 3]);
    assert.equal(data.lastSortVariable, 'A');
  });

  it('doit déplacer la courbe en tête (index 0) et trier correctement toutes les données lorsque sortCurveIndex > 0', () => {
    const data = createTestData();
    const curveA = data.addCurve('A', 'm');
    curveA.push(10, 30, 20);
    const curveB = data.addCurve('B', 's');
    curveB.push(3, 1, 2);

    data.sortDataBy('B');

    // La courbe B doit être déplacée en première position (index 0)
    assert.deepEqual(data.curves.map(c => c.title), ['B', 'A']);
    // B doit être triée par ordre croissant : [1, 2, 3]
    assert.deepEqual([...data.curves[0]], [1, 2, 3]);
    // A doit être réordonnée selon le tri de B (valeurs associées à B=1 -> 30, B=2 -> 20, B=3 -> 10)
    assert.deepEqual([...data.curves[1]], [30, 20, 10]);
    assert.equal(data.lastSortVariable, 'B');
  });

  it('doit trier correctement avec 3 courbes lorsque la colonne ciblée est à l\'index 2', () => {
    const data = createTestData();
    const curveA = data.addCurve('A', 'm');
    curveA.push(2, 1, 3);
    const curveB = data.addCurve('B', 's');
    curveB.push(20, 10, 30);
    const curveC = data.addCurve('C', 'kg');
    curveC.push(300, 100, 200);

    data.sortDataBy('C');

    // C doit être déplacée en tête
    assert.deepEqual(data.curves.map(c => c.title), ['C', 'A', 'B']);
    // C triée : [100, 200, 300] (indices d'origine : 1, 2, 0)
    assert.deepEqual([...data.curves[0]], [100, 200, 300]);
    // A réordonnée : A[1]=1, A[2]=3, A[0]=2 -> [1, 3, 2]
    assert.deepEqual([...data.curves[1]], [1, 3, 2]);
    // B réordonnée : B[1]=10, B[2]=30, B[0]=20 -> [10, 30, 20]
    assert.deepEqual([...data.curves[2]], [10, 30, 20]);
    assert.equal(data.lastSortVariable, 'C');
  });

  it('doit placer les valeurs null et undefined à la fin du tri', () => {
    const data = createTestData();
    const curveA = data.addCurve('A', 'm');
    curveA.push(3, null, 1, 2);
    const curveB = data.addCurve('B', 's');
    curveB.push(30, 99, 10, 20);

    data.sortDataBy('A');

    assert.deepEqual([...data.curves[0]], [1, 2, 3, null]);
    assert.deepEqual([...data.curves[1]], [10, 20, 30, 99]);
  });

  it('doit gérer sans crash une variable inexistante (sortCurveIndex === -1)', () => {
    const data = createTestData();
    const curveA = data.addCurve('A', 'm');
    curveA.push(3, 1, 2);

    assert.doesNotThrow(() => {
      data.sortDataBy('Inexistante');
    });

    // Les données ne doivent pas être altérées
    assert.deepEqual([...data.curves[0]], [3, 1, 2]);
    // lastSortVariable ne doit pas être mis à jour vers la variable invalide
    assert.equal(data.lastSortVariable, null);
  });

  it('doit supporter le tri lexicographique lorsque les valeurs ne sont pas numériques', () => {
    const data = createTestData();
    const curveA = data.addCurve('A', 'txt');
    curveA.push('banane', 'ananas', 'cerise');
    const curveB = data.addCurve('B', 'num');
    curveB.push(2, 1, 3);

    data.sortDataBy('A');

    assert.deepEqual([...data.curves[0]], ['ananas', 'banane', 'cerise']);
    assert.deepEqual([...data.curves[1]], [1, 2, 3]);
  });
});


