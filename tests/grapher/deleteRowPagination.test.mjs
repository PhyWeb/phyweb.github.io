import '../helpers/setup.mjs';
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import Data from '../../grapher/modules/data.js';
import { Spreadsheet } from '../../grapher/modules/spreadsheet.js';
import App from '../../grapher/modules/app.js';
import UIManager from '../../grapher/modules/ui.js';

describe('Suppression de ligne avec pagination (UIManager.initDeleteLineButton & App.deleteRow)', () => {
  let buttonListener = null;
  let modalConfirmButtons = [];

  beforeEach(() => {
    buttonListener = null;
    modalConfirmButtons = [];

    const mockDeleteButton = {
      addEventListener: (event, cb) => {
        if (event === 'click') buttonListener = cb;
      }
    };

    global.__querySelectorOverride = (sel) => {
      if (sel === '#delete-line-button') return mockDeleteButton;
      if (sel === '.toast-container') return null; // Permet à showToast de créer le container via createElement
      return {
        value: '',
        addEventListener: () => {},
        removeEventListener: () => {},
        classList: { add: () => {}, remove: () => {}, contains: () => false, toggle: () => {} },
        style: {},
        appendChild: () => {},
        remove: () => {}
      };
    };

    global.__getElementByIdOverride = (id) => {
      if (id === 'pagination-controls') {
        return { classList: { add: () => {}, remove: () => {} } };
      }
      if (id === 'page-input') return { value: 1, max: 1 };
      if (id === 'page-total-label') return { textContent: '' };
      if (id && id.startsWith('page-')) return { disabled: false };
      return null;
    };

    global.__createElementOverride = (tag) => {
      const el = {
        className: '',
        style: {},
        classList: { add: () => {}, remove: () => {}, contains: () => false },
        appendChild: () => {},
        remove: () => {},
        handlers: [],
        addEventListener: (evt, handler) => {
          el.handlers.push(handler);
        },
        click: () => {
          el.handlers.forEach(h => h());
        }
      };
      if (tag === 'button') {
        modalConfirmButtons.push(el);
      }
      return el;
    };
  });

  const setupTestEnvironment = (rowCount = 25, pageSize = 10, currentPage = 0, selectedRange = null) => {
    const data = new Data({ significantDigits: 4 });
    const curveX = data.addCurve('x', 'm');
    const curveY = data.addCurve('y', 's');

    for (let i = 0; i < rowCount; i++) {
      curveX.push(i);
      curveY.push(i * 10);
    }

    let capturedDelete = null;
    const mockApp = {
      deleteRow: (startRow, amount) => {
        capturedDelete = { startRow, amount };
      }
    };

    const mockSpreadsheet = {
      currentPage,
      pageSize,
      getPageOffset: () => (currentPage || 0) * (pageSize || 0),
      hot: {
        getSelectedRangeLast: () => selectedRange
      }
    };

    const ui = new UIManager({}, data, {}, {}, {}, mockSpreadsheet);
    ui.setApp(mockApp);
    ui.initDeleteLineButton();

    return {
      data,
      curveX,
      curveY,
      mockSpreadsheet,
      mockApp,
      ui,
      triggerDeleteClick: () => {
        if (!buttonListener) throw new Error('Button listener not registered');
        buttonListener();
      },
      confirmDeletion: () => {
        // Dans alertModal de common.js, le premier bouton créé est le bouton confirm
        assert.ok(modalConfirmButtons.length > 0, 'La modale de confirmation doit afficher des boutons');
        modalConfirmButtons[0].click();
      },
      getCapturedDelete: () => capturedDelete
    };
  };

  describe('Validation de la sélection avant suppression', () => {
    it('ne doit pas tenter de supprimer si aucune ligne n\'est sélectionnée', () => {
      const { triggerDeleteClick, getCapturedDelete } = setupTestEnvironment(25, 10, 0, null);

      triggerDeleteClick();

      assert.equal(getCapturedDelete(), null, 'deleteRow ne doit pas être appelé sans sélection');
      assert.equal(modalConfirmButtons.length, 0, 'Aucune modale ne doit être ouverte');
    });
  });

  describe('Suppression sur la première page (currentPage = 0)', () => {
    it('doit transmettre l\'indice visuel tel quel à app.deleteRow sans altération', () => {
      const selectedRange = { from: { row: 2 }, to: { row: 2 } };
      const { triggerDeleteClick, confirmDeletion, getCapturedDelete } = setupTestEnvironment(25, 10, 0, selectedRange);

      triggerDeleteClick();
      confirmDeletion();

      assert.deepEqual(getCapturedDelete(), { startRow: 2, amount: 1 });
    });
  });

  describe('Correction du bug sur une page > 0 (currentPage = 1, pageSize = 10)', () => {
    it('doit ajouter le pageOffset (10) et supprimer la ligne 12 au lieu de la ligne 2 de la page 0', () => {
      // Sur la page 1, l'utilisateur sélectionne la ligne d'indice visuel 2 (absolue 12)
      const selectedRange = { from: { row: 2 }, to: { row: 2 } };
      const { triggerDeleteClick, confirmDeletion, getCapturedDelete } = setupTestEnvironment(25, 10, 1, selectedRange);

      triggerDeleteClick();
      confirmDeletion();

      const result = getCapturedDelete();
      assert.notEqual(result.startRow, 2, 'BUG : L\'indice 2 (page 0) ne doit PAS être supprimé');
      assert.equal(result.startRow, 12, 'L\'indice absolu doit être 10 (offset) + 2 = 12');
      assert.equal(result.amount, 1);
    });

    it('doit supprimer correctement une plage multi-lignes sur la page 1', () => {
      // Sélection des lignes visuelles 2 à 4 -> indices absolus 12 à 14 (amount = 3)
      const selectedRange = { from: { row: 2 }, to: { row: 4 } };
      const { triggerDeleteClick, confirmDeletion, getCapturedDelete } = setupTestEnvironment(25, 10, 1, selectedRange);

      triggerDeleteClick();
      confirmDeletion();

      const result = getCapturedDelete();
      assert.equal(result.startRow, 12);
      assert.equal(result.amount, 3);
    });

    it('doit gérer une sélection ascendante (glissée vers le haut : from > to)', () => {
      // L'utilisateur sélectionne de la ligne visuelle 4 à la ligne 2
      const selectedRange = { from: { row: 4 }, to: { row: 2 } };
      const { triggerDeleteClick, confirmDeletion, getCapturedDelete } = setupTestEnvironment(25, 10, 1, selectedRange);

      triggerDeleteClick();
      confirmDeletion();

      const result = getCapturedDelete();
      assert.equal(result.startRow, 12);
      assert.equal(result.amount, 3);
    });
  });

  describe('Suppression sur la page 2 (currentPage = 2, pageSize = 10)', () => {
    it('doit appliquer un offset de 20 et cibler l\'indice absolu correct', () => {
      // Première ligne visible de la page 2 (index visuel 0 -> absolu 20)
      const selectedRange = { from: { row: 0 }, to: { row: 0 } };
      const { triggerDeleteClick, confirmDeletion, getCapturedDelete } = setupTestEnvironment(25, 10, 2, selectedRange);

      triggerDeleteClick();
      confirmDeletion();

      const result = getCapturedDelete();
      assert.equal(result.startRow, 20);
      assert.equal(result.amount, 1);
    });
  });

  describe('Intégration complète (Data + App + Spreadsheet + UI)', () => {
    it('doit supprimer les données effectives à la bonne position dans les courbes sans altérer la page 0', () => {
      const data = new Data({ significantDigits: 4 });
      const curveX = data.addCurve('x', 'm');
      const curveY = data.addCurve('y', 's');

      for (let i = 0; i < 25; i++) {
        curveX.push(i);
        curveY.push(i * 10);
      }

      const spreadsheet = new Spreadsheet(data);
      spreadsheet.pageSize = 10;
      spreadsheet.currentPage = 1;
      spreadsheet.build = () => {}; // Evite l'initialisation DOM de Handsontable

      spreadsheet.hot = {
        getColHeader: () => data.getHeaders(),
        loadData: () => {},
        getSelectedRangeLast: () => ({ from: { row: 2 }, to: { row: 2 } }) // ligne 12
      };

      const mockGrapher = { updateChart: () => {} };
      const ui = new UIManager({}, data, mockGrapher, {}, {}, spreadsheet);
      const app = new App(data, spreadsheet, mockGrapher, {}, {}, ui);
      ui.setApp(app);
      ui.initDeleteLineButton();

      buttonListener();
      modalConfirmButtons[0].click();

      // 1. Longueur totale réduite de 25 à 24
      assert.equal(curveX.length, 24);
      assert.equal(curveY.length, 24);

      // 2. La page 0 doit être complètement intacte (lignes 0 à 9)
      for (let i = 0; i < 10; i++) {
        assert.equal(curveX[i], i, `La ligne ${i} de la page 0 ne doit pas être modifiée`);
        assert.equal(curveY[i], i * 10);
      }

      // 3. La ligne 12 doit avoir disparu et les éléments suivants décalés
      assert.equal(curveX[10], 10);
      assert.equal(curveX[11], 11);
      assert.equal(curveX[12], 13, 'L\'ancien élément 13 doit maintenant être à l\'indice 12');
      assert.equal(curveY[12], 130);
    });

    it('doit réajuster automatiquement currentPage quand toutes les lignes de la dernière page sont supprimées', () => {
      const data = new Data({ significantDigits: 4 });
      const curveX = data.addCurve('x', 'm');
      const curveY = data.addCurve('y', 's');

      // 25 lignes -> pages 0 (10), 1 (10), 2 (5)
      for (let i = 0; i < 25; i++) {
        curveX.push(i);
        curveY.push(i * 10);
      }

      const spreadsheet = new Spreadsheet(data);
      spreadsheet.pageSize = 10;
      spreadsheet.currentPage = 2; // Sur la dernière page
      spreadsheet.build = () => {};

      spreadsheet.hot = {
        getColHeader: () => data.getHeaders(),
        loadData: () => {},
        getSelectedRangeLast: () => ({ from: { row: 0 }, to: { row: 4 } }) // Toutes les 5 lignes de la page 2 (lignes 20..24)
      };

      const mockGrapher = { updateChart: () => {} };
      const ui = new UIManager({}, data, mockGrapher, {}, {}, spreadsheet);
      const app = new App(data, spreadsheet, mockGrapher, {}, {}, ui);
      ui.setApp(app);
      ui.initDeleteLineButton();

      buttonListener();
      modalConfirmButtons[0].click();

      // Il reste 20 lignes -> 2 pages (0 et 1)
      assert.equal(curveX.length, 20);
      // currentPage doit être automatiquement revenu à 1 au lieu d'être coincé à 2
      assert.equal(spreadsheet.currentPage, 1);
    });

    it('ne doit pas supprimer de ligne si startRow est négatif', () => {
      const data = new Data({ significantDigits: 4 });
      const curveX = data.addCurve('x', 'm');
      curveX.push(10);
      curveX.push(20);

      const mockSpreadsheet = { update: () => {}, build: () => {} };
      const mockGrapher = { updateChart: () => {} };
      const app = new App(data, mockSpreadsheet, mockGrapher, {}, {}, {});

      app.deleteRow(-1, 1);

      // Rien ne doit être supprimé
      assert.equal(curveX.length, 2);
    });
  });
});
