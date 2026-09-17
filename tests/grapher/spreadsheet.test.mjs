import '../helpers/setup.mjs';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Spreadsheet } from '../../grapher/modules/spreadsheet.js';
import Data from '../../grapher/modules/data.js';

describe('Spreadsheet - handleAfterChange() et correction du bug de pagination', () => {
  const createTestContext = (rowCount = 25, pageSize = 10, currentPage = 0) => {
    const data = new Data({ significantDigits: 4 });
    const curveX = data.addCurve('x', 'm');
    const curveY = data.addCurve('y', 's');

    for (let i = 0; i < rowCount; i++) {
      curveX.push(i);
      curveY.push(i * 10);
    }

    let callbackCalled = false;
    let receivedChange = null;
    const cb = (change) => {
      callbackCalled = true;
      receivedChange = change;
    };

    const spreadsheet = new Spreadsheet(data, cb);
    spreadsheet.pageSize = pageSize;
    spreadsheet.currentPage = currentPage;

    return {
      data,
      curveX,
      curveY,
      spreadsheet,
      getCallbackStatus: () => ({ callbackCalled, receivedChange })
    };
  };

  describe('Édition sur la page 0 (currentPage = 0)', () => {
    it('doit modifier la ligne correspondante sur la première page sans altération d\'indice', () => {
      const { data, curveX, spreadsheet, getCallbackStatus } = createTestContext(25, 10, 0);

      // Édition de la ligne 2, colonne 0 (x)
      spreadsheet.handleAfterChange([[2, 0, 2, 999]], 'edit');

      assert.equal(curveX[2], 999);
      assert.equal(curveX[0], 0);
      assert.equal(curveX[1], 1);
      assert.equal(curveX[12], 12);
      assert.equal(getCallbackStatus().callbackCalled, true);
    });
  });

  describe('Édition sur une page > 0 (currentPage = 1, pageSize = 10)', () => {
    it('doit appliquer la modification à l\'indice absolu (pageOffset + relativeRow) et NE PAS écraser la page 0', () => {
      const { data, curveX, spreadsheet, getCallbackStatus } = createTestContext(25, 10, 1);

      // Sur la page 1, les lignes 10 à 19 sont affichées.
      // L'utilisateur édite la ligne d'indice relatif 2 (ligne 12 en absolu).
      // Sans la correction, curveX[2] était écrasé à 777 et curveX[12] restait 12.
      spreadsheet.handleAfterChange([[2, 0, 12, 777]], 'edit');

      // 1. La ligne absolue 12 doit être mise à jour
      assert.equal(curveX[12], 777, 'La ligne 12 (page 1) doit avoir été mise à jour avec la nouvelle valeur');

      // 2. La ligne 2 (page 0) NE DOIT PAS avoir été écrasée
      assert.equal(curveX[2], 2, 'La ligne 2 (page 0) ne doit pas être écrasée par une édition sur la page 1');

      assert.equal(getCallbackStatus().callbackCalled, true);
    });

    it('doit fonctionner sur la première ligne de la page (indice relatif 0)', () => {
      const { curveX, spreadsheet } = createTestContext(25, 10, 1);

      // Ligne relative 0 sur la page 1 -> ligne absolue 10
      spreadsheet.handleAfterChange([[0, 0, 10, 42]], 'edit');

      assert.equal(curveX[10], 42, 'La ligne absolue 10 doit être modifiée');
      assert.equal(curveX[0], 0, 'La ligne 0 de la page 0 ne doit pas être écrasée');
    });

    it('doit fonctionner sur la dernière ligne de la page (indice relatif pageSize - 1)', () => {
      const { curveX, spreadsheet } = createTestContext(25, 10, 1);

      // Ligne relative 9 sur la page 1 -> ligne absolue 19
      spreadsheet.handleAfterChange([[9, 0, 19, 99]], 'edit');

      assert.equal(curveX[19], 99, 'La ligne absolue 19 doit être modifiée');
      assert.equal(curveX[9], 9, 'La ligne 9 de la page 0 ne doit pas être écrasée');
    });
  });

  describe('Édition sur la page 2 (currentPage = 2, pageSize = 10)', () => {
    it('doit calculer correctement l\'offset (2 * 10 = 20) et préserver les pages 0 et 1', () => {
      const { curveX, spreadsheet } = createTestContext(25, 10, 2);

      // Ligne relative 3 sur la page 2 -> ligne absolue 23
      spreadsheet.handleAfterChange([[3, 0, 23, 888]], 'edit');

      assert.equal(curveX[23], 888, 'La ligne absolue 23 doit être modifiée');
      assert.equal(curveX[3], 3, 'La ligne 3 (page 0) ne doit pas être écrasée');
      assert.equal(curveX[13], 13, 'La ligne 13 (page 1) ne doit pas être écrasée');
    });
  });

  describe('Modifications par lot (batch changes / copier-coller)', () => {
    it('doit recalculer correctement la position absolue de chaque cellule modifiée', () => {
      const { curveX, spreadsheet } = createTestContext(25, 10, 1);

      // Modification de plusieurs lignes en même temps sur la page 1
      const batchChanges = [
        [0, 0, 10, 100],
        [1, 0, 11, 101],
        [2, 0, 12, 102]
      ];

      spreadsheet.handleAfterChange(batchChanges, 'CopyPaste.paste');

      assert.equal(curveX[10], 100);
      assert.equal(curveX[11], 101);
      assert.equal(curveX[12], 102);

      // Intégrité de la page 0
      assert.equal(curveX[0], 0);
      assert.equal(curveX[1], 1);
      assert.equal(curveX[2], 2);
    });

    it('doit supporter des modifications sur plusieurs colonnes', () => {
      const { curveX, curveY, spreadsheet } = createTestContext(25, 10, 1);

      // Édition simultanée de x (col 0) et y (col 1) à la ligne relative 4 (absolue 14)
      const changes = [
        [4, 0, 14, 500],
        [4, 1, 140, 5000]
      ];

      spreadsheet.handleAfterChange(changes, 'edit');

      assert.equal(curveX[14], 500);
      assert.equal(curveY[14], 5000);

      // Intégrité de la page 0
      assert.equal(curveX[4], 4);
      assert.equal(curveY[4], 40);
    });
  });

  describe('Gestion des sources ignorées et cas limites', () => {
    it('doit ignorer les changements issus de loadData sans appeler setValue ni cb', () => {
      const { curveX, spreadsheet, getCallbackStatus } = createTestContext(25, 10, 1);

      spreadsheet.handleAfterChange([[0, 0, null, 10]], 'loadData');

      assert.equal(curveX[10], 10);
      assert.equal(curveX[0], 0);
      assert.equal(getCallbackStatus().callbackCalled, false);
    });

    it('doit ignorer les changements issus de updateData sans appeler setValue ni cb', () => {
      const { curveX, spreadsheet, getCallbackStatus } = createTestContext(25, 10, 1);

      spreadsheet.handleAfterChange([[0, 0, null, 10]], 'updateData');

      assert.equal(curveX[10], 10);
      assert.equal(curveX[0], 0);
      assert.equal(getCallbackStatus().callbackCalled, false);
    });

    it('ne doit pas lever d\'erreur si change est null ou vide', () => {
      const { spreadsheet, getCallbackStatus } = createTestContext(25, 10, 0);

      assert.doesNotThrow(() => {
        spreadsheet.handleAfterChange(null, 'edit');
      });

      assert.doesNotThrow(() => {
        spreadsheet.handleAfterChange([], 'edit');
      });

      assert.equal(getCallbackStatus().callbackCalled, false);
    });

    it('doit gérer les cas où currentPage ou pageSize ne sont pas définis explicitement', () => {
      const { curveX, spreadsheet } = createTestContext(25, 10, 0);
      delete spreadsheet.currentPage;
      delete spreadsheet.pageSize;

      spreadsheet.handleAfterChange([[1, 0, 1, 333]], 'edit');

      assert.equal(curveX[1], 333);
    });
  });

  describe('Intégration via build() et configuration Handsontable', () => {
    it('doit transmettre à Handsontable un callback afterChange branché sur handleAfterChange', () => {
      const { curveX, spreadsheet } = createTestContext(25, 10, 1);

      let capturedOptions = null;
      global.Handsontable = class MockHandsontable {
        constructor(container, options) {
          capturedOptions = options;
        }
      };

      const mockUiManager = { openEditHeaderModal: () => {} };
      spreadsheet.build(mockUiManager);

      assert.ok(capturedOptions, 'Handsontable doit avoir été instancié');
      assert.equal(typeof capturedOptions.afterChange, 'function');

      // Déclenchement via le hook configuré dans les options Handsontable
      capturedOptions.afterChange([[2, 0, 12, 654]], 'edit');

      // Vérifie que handleAfterChange a bien appliqué l'offset
      assert.equal(curveX[12], 654, 'La ligne 12 doit être modifiée via le hook Handsontable');
      assert.equal(curveX[2], 2, 'La ligne 2 (page 0) ne doit pas être écrasée');
    });
  });

  describe('Méthodes de calcul d\'offset de pagination (getPageOffset et getActualRowIndex)', () => {
    it('doit calculer un offset nul sur la page 0', () => {
      const { spreadsheet } = createTestContext(25, 10, 0);
      assert.equal(spreadsheet.getPageOffset(), 0);
      assert.equal(spreadsheet.getActualRowIndex(3), 3);
    });

    it('doit calculer un offset de 10 sur la page 1 avec pageSize = 10', () => {
      const { spreadsheet } = createTestContext(25, 10, 1);
      assert.equal(spreadsheet.getPageOffset(), 10);
      assert.equal(spreadsheet.getActualRowIndex(3), 13);
    });

    it('doit calculer un offset de 20 sur la page 2 avec pageSize = 10', () => {
      const { spreadsheet } = createTestContext(25, 10, 2);
      assert.equal(spreadsheet.getPageOffset(), 20);
      assert.equal(spreadsheet.getActualRowIndex(4), 24);
    });

    it('doit gérer les cas où currentPage ou pageSize ne sont pas définis', () => {
      const { spreadsheet } = createTestContext(25, 10, 0);
      delete spreadsheet.currentPage;
      delete spreadsheet.pageSize;
      assert.equal(spreadsheet.getPageOffset(), 0);
      assert.equal(spreadsheet.getActualRowIndex(5), 5);
    });
  });

  describe('Spreadsheet - update() et réajustement de pagination après suppression', () => {
    it('doit réajuster currentPage vers la dernière page valide si les lignes restantes ne remplissent plus la page courante', () => {
      // 25 lignes au départ, 10 par page -> 3 pages (0, 1, 2)
      const { data, spreadsheet } = createTestContext(25, 10, 2);
      assert.equal(spreadsheet.currentPage, 2);

      // Suppression des 5 lignes de la page 2 (lignes 20 à 24)
      data.deleteRow(20, 5);
      assert.equal(data.getTable().length, 20);

      // Mock minimal de hot pour update()
      let loadedData = null;
      spreadsheet.hot = {
        getColHeader: () => data.getHeaders(),
        loadData: (d) => { loadedData = d; }
      };

      spreadsheet.update();

      // currentPage doit avoir été automatiquement décrémenté à 1
      assert.equal(spreadsheet.currentPage, 1);
      assert.equal(loadedData.length, 10);
    });

    it('doit réinitialiser currentPage à 0 si toutes les données sont supprimées', () => {
      const { data, spreadsheet } = createTestContext(15, 10, 1);
      assert.equal(spreadsheet.currentPage, 1);

      data.deleteRow(0, 15);
      assert.equal(data.getTable().length, 0);

      let loadedData = null;
      spreadsheet.hot = {
        getColHeader: () => data.getHeaders(),
        loadData: (d) => { loadedData = d; }
      };

      spreadsheet.update();

      assert.equal(spreadsheet.currentPage, 0);
      assert.equal(loadedData.length, 0);
    });
  });
});

