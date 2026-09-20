import '../helpers/setup.mjs';
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import UIManager from '../../grapher/modules/ui.js';

describe('UIManager - initEditHeaderModal et openEditHeaderModal', () => {
  let modalElement;
  let symbolInputElement;
  let unitInputElement;
  let saveButtonElement;
  let cancelButtonElement;
  let closeButtonElement;
  let backgroundElement;

  let modalManagerMock;
  let spreadsheetMock;
  let appMock;
  let uiManager;
  let deselectedCellCount;
  let renamedCurveCalls;

  const createMockDOMElement = () => {
    const listeners = {};
    const classes = new Set();
    return {
      value: '',
      listeners,
      classList: {
        add: (c) => classes.add(c),
        remove: (c) => classes.delete(c),
        contains: (c) => classes.has(c),
        _classes: classes
      },
      addEventListener: (type, fn) => {
        if (!listeners[type]) listeners[type] = [];
        listeners[type].push(fn);
      },
      click: function () {
        if (listeners['click']) {
          listeners['click'].forEach((fn) => fn({ preventDefault: () => {} }));
        }
      },
      focused: false,
      focus: function () {
        this.focused = true;
      }
    };
  };

  beforeEach(() => {
    deselectedCellCount = 0;
    renamedCurveCalls = [];

    // Création des éléments simulés
    modalElement = createMockDOMElement();
    symbolInputElement = createMockDOMElement();
    unitInputElement = createMockDOMElement();
    saveButtonElement = createMockDOMElement();
    cancelButtonElement = createMockDOMElement();
    closeButtonElement = createMockDOMElement();
    backgroundElement = createMockDOMElement();

    // Configuration de querySelector sur le conteneur modal
    modalElement.querySelector = (sel) => {
      switch (sel) {
        case '.modal-close-button':
          return cancelButtonElement;
        case '.delete':
          return closeButtonElement;
        case '.modal-background':
          return backgroundElement;
        default:
          return null;
      }
    };

    const elementsMap = {
      '#edit-header-modal': modalElement,
      '#edit-header-symbol-input': symbolInputElement,
      '#edit-header-unit-input': unitInputElement,
      '#edit-header-save-button': saveButtonElement
    };

    global.__querySelectorOverride = (sel) => elementsMap[sel] || null;
    global.__getElementByIdOverride = (id) => elementsMap['#' + id] || null;

    modalManagerMock = {
      openedModals: [],
      closedModals: [],
      onModalOpen: null,
      openModal(el) {
        this.openedModals.push(el);
        if (typeof this.onModalOpen === 'function') {
          this.onModalOpen();
        }
        el.classList.add('is-active');
      },
      closeModal(el) {
        this.closedModals.push(el);
        el.classList.remove('is-active');
      }
    };

    spreadsheetMock = {
      hot: {
        deselectCell: () => {
          deselectedCellCount++;
        }
      }
    };

    appMock = {
      renameCurve: (oldTitle, newSymbol, newUnit) => {
        renamedCurveCalls.push({ oldTitle, newSymbol, newUnit });
      }
    };

    const commonMock = {
      modalManager: modalManagerMock
    };

    uiManager = new UIManager(commonMock, {}, {}, {}, {}, spreadsheetMock);
    uiManager.setApp(appMock);

    // Initialise le hook onModalOpen tel qu'effectué dans initialize()
    commonMock.modalManager.onModalOpen = () => {
      if (uiManager.spreadsheet && uiManager.spreadsheet.hot) {
        uiManager.spreadsheet.hot.deselectCell();
      }
    };

    uiManager.initEditHeaderModal();
  });

  it('doit ouvrir la modale via modalManager.openModal() et désactiver la sélection Handsontable (deselectCell)', () => {
    const curve = { title: 'vitesse', unit: 'm/s' };

    uiManager.openEditHeaderModal(curve);

    // La modale doit être enregistrée auprès de modalManager.openModal
    assert.equal(modalManagerMock.openedModals.length, 1);
    assert.equal(modalManagerMock.openedModals[0], modalElement);
    assert.ok(modalElement.classList.contains('is-active'), 'La modale doit avoir la classe is-active');

    // Le callback onModalOpen doit avoir été déclenché et avoir retiré la sélection de Handsontable
    assert.equal(deselectedCellCount, 1, 'deselectCell() doit avoir été appelé lors de l\'ouverture');

    // Les champs doivent être pré-remplis
    assert.equal(symbolInputElement.value, 'vitesse');
    assert.equal(unitInputElement.value, 'm/s');
    assert.ok(symbolInputElement.focused, 'Le champ symbole doit recevoir le focus');
  });

  it('doit fermer la modale et réinitialiser l\'état au clic sur le bouton Annuler', () => {
    const curve = { title: 'tension', unit: 'V' };
    uiManager.openEditHeaderModal(curve);

    assert.ok(modalElement.classList.contains('is-active'));

    // Clic sur Annuler
    cancelButtonElement.click();

    assert.equal(modalManagerMock.closedModals.length, 1);
    assert.equal(modalManagerMock.closedModals[0], modalElement);
    assert.ok(!modalElement.classList.contains('is-active'), 'La modale ne doit plus avoir is-active');

    // Tenter de sauvegarder après fermeture ne doit rien faire (currentCurveOriginalTitle réinitialisé)
    symbolInputElement.value = 'U';
    saveButtonElement.click();
    assert.equal(renamedCurveCalls.length, 0, 'renameCurve ne doit pas être appelé après Annuler');
  });

  it('doit fermer la modale au clic sur le bouton de fermeture (croix) et sur le fond sombre (background)', () => {
    const curve = { title: 'courant', unit: 'A' };

    // Test fermeture via la croix (.delete)
    uiManager.openEditHeaderModal(curve);
    closeButtonElement.click();
    assert.equal(modalManagerMock.closedModals.length, 1);
    assert.ok(!modalElement.classList.contains('is-active'));

    // Test fermeture via l'arrière-plan (.modal-background)
    uiManager.openEditHeaderModal(curve);
    backgroundElement.click();
    assert.equal(modalManagerMock.closedModals.length, 2);
    assert.ok(!modalElement.classList.contains('is-active'));
  });

  it('doit valider les données et appeler renameCurve puis closeModal au clic sur Sauvegarder', () => {
    const curve = { title: 'x', unit: 'm' };
    uiManager.openEditHeaderModal(curve);

    symbolInputElement.value = 'position';
    unitInputElement.value = 'km';

    saveButtonElement.click();

    assert.equal(renamedCurveCalls.length, 1);
    assert.deepEqual(renamedCurveCalls[0], {
      oldTitle: 'x',
      newSymbol: 'position',
      newUnit: 'km'
    });

    assert.equal(modalManagerMock.closedModals.length, 1);
    assert.ok(!modalElement.classList.contains('is-active'));
  });

  it('ne doit pas autoriser la sauvegarde avec un symbole vide', () => {
    const curve = { title: 'x', unit: 'm' };
    uiManager.openEditHeaderModal(curve);

    symbolInputElement.value = '   ';
    unitInputElement.value = 'm';

    saveButtonElement.click();

    assert.equal(renamedCurveCalls.length, 0, 'renameCurve ne doit pas être appelé si le symbole est vide');
    assert.equal(modalManagerMock.closedModals.length, 0, 'La modale ne doit pas se fermer');
  });
});

