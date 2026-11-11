import '../helpers/setup.mjs';
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import UIManager from '../../grapher/modules/ui.js';

/**
 * Crée un élément DOM simulé fidèle pour tester classList, texte et écouteurs.
 */
function createMockElement(tagName = 'div') {
  const classes = new Set();
  const listeners = {};
  const children = [];

  const el = {
    tagName: tagName.toUpperCase(),
    value: '',
    textContent: '',
    innerHTML: '',
    style: {},
    parentElement: null,
    children,
    classList: {
      add: (...tokens) => tokens.forEach((t) => classes.add(t)),
      remove: (...tokens) => tokens.forEach((t) => classes.delete(t)),
      toggle: (t, force) => {
        if (force === true) classes.add(t);
        else if (force === false) classes.delete(t);
        else if (classes.has(t)) classes.delete(t);
        else classes.add(t);
      },
      contains: (t) => classes.has(t)
    },
    set className(val) {
      classes.clear();
      String(val).split(/\s+/).filter(Boolean).forEach((t) => classes.add(t));
    },
    get className() {
      return Array.from(classes).join(' ');
    },
    addEventListener: (type, fn) => {
      if (!listeners[type]) listeners[type] = [];
      listeners[type].push(fn);
    },
    removeEventListener: (type, fn) => {
      if (!listeners[type]) return;
      listeners[type] = listeners[type].filter((f) => f !== fn);
    },
    dispatch: async (type, event = {}) => {
      for (const fn of (listeners[type] || [])) {
        await fn(event);
      }
    },
    querySelector: () => createMockElement(),
    querySelectorAll: () => [],
    setAttribute: () => {},
    removeAttribute: () => {},
    appendChild: (child) => {
      if (child && typeof child === 'object') {
        child.parentElement = el;
        children.push(child);
      }
      return child;
    },
    remove: () => {
      el.parentElement = null;
    },
    onclick: null,
    listeners
  };
  return el;
}

describe('UIManager - État de #new-file-modal lors des erreurs de chargement', () => {
  let ui;
  let newFileModal;
  let emptyStateContainer;
  let newFileButtons;
  let newFileSpinner;
  let newFileTitle;
  let fileInput;
  let createdElements;
  let modalOpenDuringAlert;
  let closeModalCalls;
  let closeAllModalsCalls;
  let showTabsCalls;
  let markAsSavedCalls;
  const collectText = (node) => {
    if (!node) return '';
    return [
      node.innerHTML || '',
      node.textContent || '',
      ...(node.children || []).map(collectText)
    ].join(' ');
  };

  let origAppendChild;
  let loadFileImpl;
  let loadPWFromStringImpl;

  beforeEach(() => {
    createdElements = [];
    modalOpenDuringAlert = [];
    closeModalCalls = [];
    closeAllModalsCalls = 0;
    showTabsCalls = 0;
    markAsSavedCalls = 0;

    newFileModal = createMockElement('div');
    emptyStateContainer = createMockElement('div');
    newFileButtons = createMockElement('div');
    newFileSpinner = createMockElement('div');
    newFileSpinner.classList.add('is-hidden');
    newFileTitle = createMockElement('p');
    newFileTitle.textContent = 'Créer ou importer une session';
    fileInput = createMockElement('input');

    const bySelector = {
      '#new-file-modal': newFileModal,
      '#empty-state-container': emptyStateContainer,
      '#new-file-modal .modal-card-title': newFileTitle,
      '#file-input': fileInput
    };
    const byId = {
      'new-file-buttons': newFileButtons,
      'new-file-spinner': newFileSpinner
    };

    global.__querySelectorOverride = (sel) => {
      if (sel === '.toast-container') return null;
      if (Object.hasOwn(bySelector, sel)) return bySelector[sel];
      return createMockElement();
    };
    global.__getElementByIdOverride = (id) => {
      if (Object.hasOwn(byId, id)) return byId[id];
      return createMockElement();
    };
    global.__querySelectorAllOverride = () => [];
    global.__createElementOverride = (tag) => {
      const el = createMockElement(tag);
      createdElements.push(el);
      return el;
    };

    origAppendChild = document.body.appendChild;
    document.body.appendChild = (el) => {
      // Vérifie l'état de #new-file-modal au moment où alertModal attache sa boîte de dialogue
      if (collectText(el).includes('Erreur de chargement') || (el && createdElements.includes(el) && el.tagName === 'DIV' && el.classList?.contains?.('modal'))) {
        modalOpenDuringAlert.push(newFileModal.classList.contains('is-active'));
      }
      return origAppendChild.call(document.body, el);
    };

    loadFileImpl = async () => {};
    loadPWFromStringImpl = async () => {};

    ui = Object.create(UIManager.prototype);
    ui.navManager = {
      confirmAction: (cb) => cb()
    };
    ui.app = {
      ioManager: {
        loadFile: (file) => loadFileImpl(file),
        loadPWFromString: (str) => loadPWFromStringImpl(str)
      }
    };
    ui.common = {
      modalManager: {
        closeModal: (el) => {
          closeModalCalls.push(el);
          el?.classList?.remove?.('is-active');
        },
        closeAllModals: () => {
          closeAllModalsCalls++;
          newFileModal.classList.remove('is-active');
        }
      }
    };
    ui.showTabsAndPanels = () => {
      showTabsCalls++;
    };
    ui.markAsSaved = () => {
      markAsSavedCalls++;
    };

    ui.initFileModals();
  });

  afterEach(() => {
    // Ferme les toasts pour annuler leurs timers de 4s immédiatement
    for (const el of createdElements) {
      if (typeof el.onclick === 'function') {
        el.onclick();
      }
    }
    document.body.appendChild = origAppendChild;
    delete global.__querySelectorOverride;
    delete global.__getElementByIdOverride;
    delete global.__querySelectorAllOverride;
    delete global.__createElementOverride;
  });

  it('Drag & Drop en erreur depuis une session active : referme #new-file-modal avant l\'alerte et ne retombe pas sur "Créer ou importer une session"', async () => {
    emptyStateContainer.classList.add('is-hidden'); // Session active déjà ouverte
    loadFileImpl = async () => {
      // Pendant le chargement, le spinner est bien affiché dans #new-file-modal
      assert.equal(newFileModal.classList.contains('is-active'), true);
      assert.equal(newFileTitle.textContent, 'Chargement en cours...');
      throw new Error('Fichier corrompu');
    };

    await ui.fileDropManager.onDropCallback({ name: 'corrompu.pw' });

    assert.deepEqual(modalOpenDuringAlert, [false], '#new-file-modal doit être fermée avant l\'ouverture de l\'alerte d\'erreur');
    assert.equal(newFileModal.classList.contains('is-active'), false);
    assert.equal(closeModalCalls.length, 1);
    assert.equal(closeModalCalls[0], newFileModal);
    assert.equal(newFileTitle.textContent, 'Créer ou importer une session');
    assert.equal(newFileSpinner.classList.contains('is-hidden'), true);
    assert.equal(newFileButtons.classList.contains('is-hidden'), false);
    assert.equal(showTabsCalls, 0);
    assert.equal(markAsSavedCalls, 0);
  });

  it('Drag & Drop en erreur depuis l\'écran d\'accueil : referme #new-file-modal et laisse l\'écran d\'accueil visible', async () => {
    loadFileImpl = async () => {
      throw new Error('Format invalide');
    };

    await ui.fileDropManager.onDropCallback({ name: 'bad.txt' });

    assert.equal(newFileModal.classList.contains('is-active'), false);
    assert.equal(emptyStateContainer.classList.contains('is-hidden'), false);
    assert.deepEqual(modalOpenDuringAlert, [false]);
  });

  it('Drag & Drop en erreur lorsque #new-file-modal était déjà ouverte : conserve la modale ouverte', async () => {
    newFileModal.classList.add('is-active');
    loadFileImpl = async () => {
      throw new Error('JSON invalide');
    };

    await ui.fileDropManager.onDropCallback({ name: 'bad.pw' });

    assert.equal(newFileModal.classList.contains('is-active'), true);
    assert.equal(closeModalCalls.length, 0);
    assert.equal(newFileTitle.textContent, 'Créer ou importer une session');
    assert.deepEqual(modalOpenDuringAlert, [true]);
  });

  it('Drag & Drop réussi : affiche l\'interface, ferme toutes les modales et marque la session enregistrée', async () => {
    await ui.fileDropManager.onDropCallback({ name: 'ok.pw' });

    assert.equal(newFileModal.classList.contains('is-active'), false);
    assert.equal(showTabsCalls, 1);
    assert.equal(closeAllModalsCalls, 1);
    assert.equal(markAsSavedCalls, 1);
    assert.equal(modalOpenDuringAlert.length, 0);
  });

  it('#file-input en erreur via Ctrl+O (modale fermée) n\'ouvre pas #new-file-modal', async () => {
    loadFileImpl = async () => {
      throw new Error('Erreur lecture');
    };

    await fileInput.dispatch('change', { target: { files: [{ name: 'bad.pw' }] } });

    assert.equal(newFileModal.classList.contains('is-active'), false);
    assert.deepEqual(modalOpenDuringAlert, [false]);
  });

  it('#file-input en erreur depuis #new-file-modal ouverte garde #new-file-modal active', async () => {
    newFileModal.classList.add('is-active');
    loadFileImpl = async () => {
      throw new Error('Erreur lecture');
    };

    await fileInput.dispatch('change', { target: { files: [{ name: 'bad.pw' }] } });

    assert.equal(newFileModal.classList.contains('is-active'), true);
    assert.equal(closeModalCalls.length, 0);
    assert.deepEqual(modalOpenDuringAlert, [true]);
  });

  it('loadStartupPW en erreur (import inter-applications) : referme #new-file-modal, réaffiche l\'écran d\'accueil et notifie l\'erreur', async () => {
    loadPWFromStringImpl = async () => {
      throw new Error('Payload PW invalide');
    };

    const promise = ui.loadStartupPW('{corrompu');

    // Pendant le chargement, le spinner est affiché et l'écran d'accueil masqué
    assert.equal(newFileModal.classList.contains('is-active'), true);
    assert.equal(emptyStateContainer.classList.contains('is-hidden'), true);
    assert.equal(newFileTitle.textContent, 'Chargement en cours...');

    await promise;

    assert.equal(newFileModal.classList.contains('is-active'), false);
    assert.equal(closeModalCalls.length, 1);
    assert.equal(closeModalCalls[0], newFileModal);
    assert.equal(emptyStateContainer.classList.contains('is-hidden'), false);
    assert.equal(newFileTitle.textContent, 'Créer ou importer une session');
    assert.equal(showTabsCalls, 0);
    assert.equal(markAsSavedCalls, 0);

    const errorToast = createdElements.find((el) => el.innerHTML?.includes('Payload PW invalide'));
    assert.ok(errorToast, 'Un toast d\'erreur doit être affiché');
    assert.equal(errorToast.classList.contains('is-danger'), true);
  });

  it('loadStartupPW réussi : affiche les onglets, ferme la modale et marque enregistré', async () => {
    await ui.loadStartupPW('{"version":"3.0","curves":[]}');

    assert.equal(newFileModal.classList.contains('is-active'), false);
    assert.equal(showTabsCalls, 1);
    assert.equal(closeAllModalsCalls, 1);
    assert.equal(markAsSavedCalls, 1);

    const successToast = createdElements.find((el) => el.innerHTML?.includes('Données importées avec succès'));
    assert.ok(successToast);
    assert.equal(successToast.classList.contains('is-success'), true);
  });

  it('Drag & Drop en erreur ferme #new-file-modal même si modalManager ne fournit pas closeModal', async () => {
    ui.common = { modalManager: { closeAllModals: () => {} } };
    loadFileImpl = async () => {
      throw new Error('Fichier invalide');
    };

    await ui.fileDropManager.onDropCallback({ name: 'invalid.pw' });

    assert.equal(newFileModal.classList.contains('is-active'), false);
    assert.deepEqual(modalOpenDuringAlert, [false]);
  });
});
