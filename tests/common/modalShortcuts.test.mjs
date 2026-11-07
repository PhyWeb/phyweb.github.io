import '../helpers/setup.mjs';
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { ModalManager, alertModal, setupGlobalShortcuts } from '../../common/common.js';

class MockKeyboardEvent extends Event {
  constructor(type, options = {}) {
    super(type, { cancelable: true });
    this.key = options.key || '';
    this.ctrlKey = Boolean(options.ctrlKey);
    this.altKey = Boolean(options.altKey);
    this.shiftKey = Boolean(options.shiftKey);
    this.metaKey = Boolean(options.metaKey);
    this.isComposing = Boolean(options.isComposing);
    this.keyCode = options.keyCode || 0;
    if (options.target) {
      Object.defineProperty(this, 'target', { value: options.target, configurable: true });
    }
  }
}

describe('ModalManager - Raccourcis clavier (Entrée et Échap)', () => {
  let domElements;
  let bodyChildren;
  let originalQSOverride;
  let originalQSAllOverride;
  let originalGEBIOverride;
  let originalCreateElementOverride;
  let modalManager;

  const createMockElement = (tag = 'div') => {
    const classes = new Set();
    const children = [];
    const listeners = {};
    const attributes = {};

    const el = {
      tagName: tag.toUpperCase(),
      id: '',
      style: {},
      children,
      listeners,
      attributes,
      disabled: false,
      textContent: '',
      innerHTML: '',
      get className() {
        return Array.from(classes).join(' ');
      },
      set className(val) {
        classes.clear();
        if (val) {
          val.split(/\s+/).filter(Boolean).forEach(c => classes.add(c));
        }
      },
      classList: {
        add: (...cls) => {
          cls.forEach(c => c.split(/\s+/).filter(Boolean).forEach(x => classes.add(x)));
        },
        remove: (...cls) => {
          cls.forEach(c => classes.delete(c));
        },
        contains: (c) => classes.has(c)
      },
      setAttribute: (name, val) => {
        attributes[name] = String(val);
      },
      getAttribute: (name) => {
        return attributes[name] !== undefined ? attributes[name] : null;
      },
      hasAttribute: (name) => {
        return attributes[name] !== undefined;
      },
      removeAttribute: (name) => {
        delete attributes[name];
      },
      appendChild: (child) => {
        child.parentNode = el;
        children.push(child);
        return child;
      },
      contains: (other) => {
        if (!other) return false;
        if (other === el) return true;
        let cur = other.parentNode;
        while (cur) {
          if (cur === el) return true;
          cur = cur.parentNode;
        }
        return false;
      },
      remove: () => {
        const bIdx = bodyChildren.indexOf(el);
        if (bIdx !== -1) bodyChildren.splice(bIdx, 1);
        const dIdx = domElements.indexOf(el);
        if (dIdx !== -1) domElements.splice(dIdx, 1);
      },
      addEventListener: (type, fn) => {
        if (!listeners[type]) listeners[type] = [];
        listeners[type].push(fn);
      },
      removeEventListener: (type, fn) => {
        if (!listeners[type]) return;
        listeners[type] = listeners[type].filter(f => f !== fn);
      },
      dispatchEvent: (event) => {
        if (listeners[event.type]) {
          listeners[event.type].forEach(fn => fn(event));
        }
      },
      click: () => {
        el.dispatchEvent(new Event('click'));
      },
      blur: () => {
        el.dispatchEvent(new Event('blur'));
      },
      focus: () => {
        el.dispatchEvent(new Event('focus'));
      },
      querySelector: (sel) => {
        const results = el.querySelectorAll(sel);
        return results.length > 0 ? results[0] : null;
      },
      querySelectorAll: (sel) => {
        const matches = [];
        const check = (node) => {
          if (!node || node === el) return;
          if (matchesSelector(node, sel)) {
            matches.push(node);
          }
        };

        const traverse = (node) => {
          if (node.children) {
            for (const child of node.children) {
              check(child);
              traverse(child);
            }
          }
        };
        traverse(el);
        return matches;
      }
    };

    domElements.push(el);
    return el;
  };

  const matchesSelector = (node, sel) => {
    const parts = sel.split(',').map(s => s.trim());
    return parts.some(singleSel => {
      // Sélecteur composé d'espace (descendant direct ou indirect)
      if (singleSel.includes(' ')) {
        const tokens = singleSel.split(/\s+/);
        const lastToken = tokens[tokens.length - 1];
        return matchesSingleToken(node, lastToken);
      }
      return matchesSingleToken(node, singleSel);
    });
  };

  const matchesSingleToken = (node, token) => {
    if (!token) return false;
    if (token.startsWith('#')) {
      return node.id === token.slice(1);
    }
    if (token.startsWith('.')) {
      return node.classList.contains(token.slice(1));
    }
    if (token.startsWith('[data-modal-confirm')) {
      return node.hasAttribute('data-modal-confirm');
    }
    if (token.startsWith('[data-modal-cancel')) {
      return node.hasAttribute('data-modal-cancel');
    }
    if (token.toLowerCase() === 'button') {
      return node.tagName === 'BUTTON';
    }
    if (token.includes('.is-primary')) {
      return node.classList.contains('is-primary');
    }
    if (token.includes('.is-success')) {
      return node.classList.contains('is-success');
    }
    if (token.includes('.is-danger')) {
      return node.classList.contains('is-danger');
    }
    if (token.includes('.is-link')) {
      return node.classList.contains('is-link');
    }
    if (token.includes('.modal-close-button')) {
      return node.classList.contains('modal-close-button');
    }
    if (token.includes('.delete')) {
      return node.classList.contains('delete');
    }
    return false;
  };

  beforeEach(() => {
    domElements = [];
    bodyChildren = [];

    originalQSOverride = global.__querySelectorOverride;
    originalQSAllOverride = global.__querySelectorAllOverride;
    originalGEBIOverride = global.__getElementByIdOverride;
    originalCreateElementOverride = global.__createElementOverride;

    global.document.body = {
      appendChild: (child) => {
        bodyChildren.push(child);
        return child;
      }
    };

    global.__createElementOverride = (tag) => createMockElement(tag);

    global.__querySelectorAllOverride = (sel) => {
      if (sel === '.modal') {
        return domElements.filter(e => e.classList.contains('modal'));
      }
      return [];
    };

    global.__getElementByIdOverride = (id) => {
      return domElements.find(e => e.id === id) || null;
    };

    modalManager = new ModalManager();
  });

  afterEach(() => {
    if (modalManager) {
      modalManager.destroy();
      modalManager = null;
    }
    global.__querySelectorOverride = originalQSOverride;
    global.__querySelectorAllOverride = originalQSAllOverride;
    global.__getElementByIdOverride = originalGEBIOverride;
    global.__createElementOverride = originalCreateElementOverride;
    global.document.activeElement = null;
  });

  it('Entrée doit simuler un clic sur le bouton de validation (data-modal-confirm) de la modale active', () => {

    const modal = createMockElement('div');
    modal.classList.add('modal', 'is-active');
    bodyChildren.push(modal);

    const foot = createMockElement('footer');
    foot.classList.add('modal-card-foot');
    modal.appendChild(foot);

    let confirmClicked = false;
    const confirmBtn = createMockElement('button');
    confirmBtn.setAttribute('data-modal-confirm', 'true');
    confirmBtn.addEventListener('click', () => { confirmClicked = true; });
    foot.appendChild(confirmBtn);

    const evtEnter = new MockKeyboardEvent('keydown', { key: 'Enter' });
    global.document.dispatchEvent(evtEnter);

    assert.strictEqual(confirmClicked, true, 'Le bouton de validation doit être cliqué');
    assert.strictEqual(evtEnter.defaultPrevented, true, 'preventDefault() doit être appelé');
  });

  it('Entrée ne doit pas déclencher la validation si le bouton est désactivé (disabled)', () => {
    const modal = createMockElement('div');
    modal.classList.add('modal', 'is-active');
    bodyChildren.push(modal);

    const foot = createMockElement('footer');
    modal.appendChild(foot);

    let confirmClicked = false;
    const confirmBtn = createMockElement('button');
    confirmBtn.setAttribute('data-modal-confirm', 'true');
    confirmBtn.disabled = true;
    confirmBtn.addEventListener('click', () => { confirmClicked = true; });
    foot.appendChild(confirmBtn);

    const evtEnter = new MockKeyboardEvent('keydown', { key: 'Enter' });
    global.document.dispatchEvent(evtEnter);

    assert.strictEqual(confirmClicked, false, 'Le bouton désactivé ne doit pas être cliqué');
  });

  it('Entrée ne doit pas intercepter la touche lorsque le focus est dans un TEXTAREA', () => {
    const modal = createMockElement('div');
    modal.classList.add('modal', 'is-active');
    bodyChildren.push(modal);

    let confirmClicked = false;
    const confirmBtn = createMockElement('button');
    confirmBtn.setAttribute('data-modal-confirm', 'true');
    confirmBtn.addEventListener('click', () => { confirmClicked = true; });
    modal.appendChild(confirmBtn);

    const textarea = createMockElement('textarea');
    modal.appendChild(textarea);
    global.document.activeElement = textarea;

    const evtEnter = new MockKeyboardEvent('keydown', { key: 'Enter', target: textarea });
    global.document.dispatchEvent(evtEnter);

    assert.strictEqual(confirmClicked, false, 'Entrée dans un textarea doit permettre le retour à la ligne');
    assert.strictEqual(evtEnter.defaultPrevented, false);
  });

  it('Entrée ne doit pas intercepter la touche lorsque le focus est déjà sur un BUTTON', () => {
    const modal = createMockElement('div');
    modal.classList.add('modal', 'is-active');
    bodyChildren.push(modal);

    let confirmClicked = false;
    const confirmBtn = createMockElement('button');
    confirmBtn.setAttribute('data-modal-confirm', 'true');
    confirmBtn.addEventListener('click', () => { confirmClicked = true; });
    modal.appendChild(confirmBtn);

    const otherBtn = createMockElement('button');
    modal.appendChild(otherBtn);

    const evtEnter = new MockKeyboardEvent('keydown', { key: 'Enter', target: otherBtn });
    global.document.dispatchEvent(evtEnter);

    assert.strictEqual(confirmClicked, false, 'Entrée sur un autre bouton ne doit pas forcer le bouton de validation');
  });

  it('Entrée doit déclencher blur() sur le champ actif pour forcer la synchronisation', () => {
    const modal = createMockElement('div');
    modal.classList.add('modal', 'is-active');
    bodyChildren.push(modal);

    let blurred = false;
    const input = createMockElement('input');
    input.addEventListener('blur', () => { blurred = true; });
    modal.appendChild(input);
    global.document.activeElement = input;

    let confirmClicked = false;
    const confirmBtn = createMockElement('button');
    confirmBtn.setAttribute('data-modal-confirm', 'true');
    confirmBtn.addEventListener('click', () => { confirmClicked = true; });
    modal.appendChild(confirmBtn);

    const evtEnter = new MockKeyboardEvent('keydown', { key: 'Enter', target: input });
    global.document.dispatchEvent(evtEnter);

    assert.strictEqual(blurred, true, 'blur() doit être appelé sur input actif');
    assert.strictEqual(confirmClicked, true);
  });

  it('Entrée ne doit pas déclencher la validation si des touches modificatrices (Shift, Ctrl) sont enfoncées', () => {
    const modal = createMockElement('div');
    modal.classList.add('modal', 'is-active');
    bodyChildren.push(modal);

    let confirmClicked = false;
    const confirmBtn = createMockElement('button');
    confirmBtn.setAttribute('data-modal-confirm', 'true');
    confirmBtn.addEventListener('click', () => { confirmClicked = true; });
    modal.appendChild(confirmBtn);

    const evtShiftEnter = new MockKeyboardEvent('keydown', { key: 'Enter', shiftKey: true });
    global.document.dispatchEvent(evtShiftEnter);
    assert.strictEqual(confirmClicked, false, 'Shift+Entrée ne doit pas valider');

    const evtCtrlEnter = new MockKeyboardEvent('keydown', { key: 'Enter', ctrlKey: true });
    global.document.dispatchEvent(evtCtrlEnter);
    assert.strictEqual(confirmClicked, false, 'Ctrl+Entrée ne doit pas valider');
  });

  it('Entrée ne doit rien faire si aucune modale n\'est active', () => {
    const modal = createMockElement('div');
    modal.classList.add('modal'); // Inactif (pas is-active)
    bodyChildren.push(modal);

    let confirmClicked = false;
    const confirmBtn = createMockElement('button');
    confirmBtn.setAttribute('data-modal-confirm', 'true');
    confirmBtn.addEventListener('click', () => { confirmClicked = true; });
    modal.appendChild(confirmBtn);

    const evtEnter = new MockKeyboardEvent('keydown', { key: 'Enter' });
    global.document.dispatchEvent(evtEnter);

    assert.strictEqual(confirmClicked, false);
    assert.strictEqual(evtEnter.defaultPrevented, false);
  });

  it('Échap doit simuler un clic sur le bouton d\'annulation (data-modal-cancel ou .modal-close-button)', () => {
    const modal = createMockElement('div');
    modal.classList.add('modal', 'is-active');
    bodyChildren.push(modal);

    const foot = createMockElement('footer');
    foot.classList.add('modal-card-foot');
    modal.appendChild(foot);

    let cancelClicked = false;
    const cancelBtn = createMockElement('button');
    cancelBtn.classList.add('modal-close-button');
    cancelBtn.setAttribute('data-modal-cancel', 'true');
    cancelBtn.addEventListener('click', () => {
      cancelClicked = true;
      modal.classList.remove('is-active');
    });
    foot.appendChild(cancelBtn);

    const evtEscape = new MockKeyboardEvent('keydown', { key: 'Escape' });
    global.document.dispatchEvent(evtEscape);

    assert.strictEqual(cancelClicked, true, 'Le bouton d\'annulation doit être cliqué');
    assert.strictEqual(modal.classList.contains('is-active'), false, 'La modale doit être fermée');
    assert.strictEqual(evtEscape.defaultPrevented, true);
  });

  it('Échap avec alertModal() doit exécuter le callback cancel.cb et nettoyer le DOM', () => {
    let cancelCbCalled = false;
    const modal = alertModal({
      id: 'confirm-prompt-modal',
      title: 'Confirmation',
      confirm: { label: 'OK', cb: () => {} },
      cancel: {
        label: 'Annuler',
        cb: () => { cancelCbCalled = true; }
      }
    });

    assert.strictEqual(domElements.some(e => e.id === 'confirm-prompt-modal'), true);

    const evtEscape = new MockKeyboardEvent('keydown', { key: 'Escape' });
    global.document.dispatchEvent(evtEscape);

    assert.strictEqual(cancelCbCalled, true, 'Le callback cancel.cb doit être exécuté lors de l appui sur Échap');
    assert.strictEqual(domElements.some(e => e.id === 'confirm-prompt-modal'), false, 'La modale doit être retirée du DOM');
  });

  it('Entrée avec alertModal() doit exécuter le callback confirm.cb et nettoyer le DOM', () => {
    let confirmCbCalled = false;
    const modal = alertModal({
      id: 'confirm-action-modal',
      title: 'Action requise',
      confirm: {
        label: 'Confirmer',
        cb: () => { confirmCbCalled = true; }
      },
      cancel: 'Annuler'
    });

    assert.strictEqual(domElements.some(e => e.id === 'confirm-action-modal'), true);

    const evtEnter = new MockKeyboardEvent('keydown', { key: 'Enter' });
    global.document.dispatchEvent(evtEnter);

    assert.strictEqual(confirmCbCalled, true, 'Le callback confirm.cb doit être exécuté lors de l appui sur Entrée');
    assert.strictEqual(domElements.some(e => e.id === 'confirm-action-modal'), false, 'La modale doit être retirée du DOM');
  });

  it('Si deux modales sont actives, Entrée et Échap doivent cibler la plus récente (celle du dessus)', () => {
    const modal1 = createMockElement('div');
    modal1.classList.add('modal', 'is-active');
    bodyChildren.push(modal1);

    let cancel1Clicked = false;
    const cancelBtn1 = createMockElement('button');
    cancelBtn1.setAttribute('data-modal-cancel', 'true');
    cancelBtn1.addEventListener('click', () => { cancel1Clicked = true; modal1.classList.remove('is-active'); });
    modal1.appendChild(cancelBtn1);

    const modal2 = createMockElement('div');
    modal2.classList.add('modal', 'is-active');
    bodyChildren.push(modal2);

    let cancel2Clicked = false;
    const cancelBtn2 = createMockElement('button');
    cancelBtn2.setAttribute('data-modal-cancel', 'true');
    cancelBtn2.addEventListener('click', () => { cancel2Clicked = true; modal2.classList.remove('is-active'); });
    modal2.appendChild(cancelBtn2);

    // Échap doit annuler modal2 (la dernière)
    global.document.dispatchEvent(new MockKeyboardEvent('keydown', { key: 'Escape' }));

    assert.strictEqual(cancel2Clicked, true, 'La modale 2 (topmost) doit être annulée');
    assert.strictEqual(cancel1Clicked, false, 'La modale 1 ne doit pas être affectée');
    assert.strictEqual(modal2.classList.contains('is-active'), false);
    assert.strictEqual(modal1.classList.contains('is-active'), true);
  });

  it('Entrée sur une modale d alerte empilée ne doit pas redéclencher un bouton d arrière-plan resté ciblé', () => {
    // 1. Modale sous-jacente (ex: #open-modal)
    const backgroundModal = createMockElement('div');
    backgroundModal.id = 'open-modal';
    backgroundModal.classList.add('modal', 'is-active');
    bodyChildren.push(backgroundModal);

    let backgroundButtonClickCount = 0;
    const backgroundButton = createMockElement('button');
    backgroundButton.id = 'open-video';
    backgroundButton.addEventListener('click', () => {
      backgroundButtonClickCount++;
    });
    backgroundModal.appendChild(backgroundButton);

    // Le bouton d'arrière-plan était resté document.activeElement
    global.document.activeElement = backgroundButton;

    // 2. Modale d'alerte de confirmation ouverte par-dessus
    let alertConfirmCount = 0;
    const confirmationModal = alertModal({
      id: 'confirm-load-modal',
      title: 'Charger la vidéo',
      confirm: {
        label: 'Charger',
        cb: () => {
          alertConfirmCount++;
          modalManager.closeAllModals();
        }
      },
      cancel: 'Annuler'
    });

    assert.strictEqual(domElements.some(e => e.id === 'confirm-load-modal'), true);

    // Appui sur Entrée : l'événement provient de l'élément qui avait le focus (backgroundButton)
    const evtEnter = new MockKeyboardEvent('keydown', { key: 'Enter', target: backgroundButton });
    global.document.dispatchEvent(evtEnter);

    // Le bouton d'arrière-plan ne doit PAS avoir été cliqué (évite la duplication)
    assert.strictEqual(backgroundButtonClickCount, 0, 'Le bouton d arrière-plan ne doit pas être re-cliqué');
    // Le bouton de confirmation de l'alerte doit avoir été cliqué
    assert.strictEqual(alertConfirmCount, 1, 'Le callback de confirmation de l alerte doit être exécuté');
    // Toutes les modales doivent être fermées
    assert.strictEqual(domElements.some(e => e.id === 'confirm-load-modal'), false);
    assert.strictEqual(backgroundModal.classList.contains('is-active'), false);
  });

  it('Modales superposées : Échap doit fermer uniquement la boîte de confirmation au premier plan, en laissant la modale de paramètres ouverte', () => {
    let unregisterShortcuts = null;
    let pageEscapeActionCalled = false;

    // 1. Modale de paramètres (arrière-plan)
    const settingsModal = createMockElement('div');
    settingsModal.id = 'settings-modal';
    settingsModal.classList.add('modal', 'is-active');
    bodyChildren.push(settingsModal);

    let settingsCancelClicked = false;
    const settingsCancelBtn = createMockElement('button');
    settingsCancelBtn.setAttribute('data-modal-cancel', 'true');
    settingsCancelBtn.addEventListener('click', () => {
      settingsCancelClicked = true;
      settingsModal.classList.remove('is-active');
    });
    settingsModal.appendChild(settingsCancelBtn);

    // Initialisation des raccourcis globaux (qui simuleraient closeAllModals si mal isolés)
    unregisterShortcuts = setupGlobalShortcuts({
      onEscape: () => {
        pageEscapeActionCalled = true;
        // Comme dans l'ancien code buggy où onEscape appelait closeAllModals
        modalManager.closeAllModals();
      }
    });

    // 2. Modale de confirmation (premier plan)
    let alertCancelCalled = false;
    const confirmationModal = alertModal({
      id: 'confirm-alert-modal',
      title: 'Confirmation d\'action',
      cancel: {
        label: 'Annuler',
        cb: () => { alertCancelCalled = true; }
      }
    });

    assert.strictEqual(domElements.some(e => e.id === 'confirm-alert-modal'), true);
    assert.strictEqual(settingsModal.classList.contains('is-active'), true);

    // 3. Premier appui sur Échap : doit fermer UNIQUEMENT confirm-alert-modal
    const evtEscape1 = new MockKeyboardEvent('keydown', { key: 'Escape' });
    global.document.dispatchEvent(evtEscape1);

    assert.strictEqual(alertCancelCalled, true, 'Le callback d annulation de l alerte doit être appelé');
    assert.strictEqual(domElements.some(e => e.id === 'confirm-alert-modal'), false, 'L alerte doit être fermée et retirée du DOM');
    assert.strictEqual(settingsModal.classList.contains('is-active'), true, 'La modale de paramètres d arrière-plan doit RESTER ouverte');
    assert.strictEqual(settingsCancelClicked, false, 'Le bouton annuler des paramètres ne doit pas avoir été cliqué');
    assert.strictEqual(pageEscapeActionCalled, false, 'Le raccourci global onEscape ne doit pas être exécuté pendant que des modales sont actives');

    // 4. Deuxième appui sur Échap : doit maintenant fermer settingsModal
    const evtEscape2 = new MockKeyboardEvent('keydown', { key: 'Escape' });
    global.document.dispatchEvent(evtEscape2);

    assert.strictEqual(settingsCancelClicked, true, 'La modale de paramètres doit maintenant être fermée');
    assert.strictEqual(settingsModal.classList.contains('is-active'), false, 'La modale de paramètres ne doit plus être active');
    assert.strictEqual(pageEscapeActionCalled, false, 'Le raccourci global onEscape ne doit toujours pas être exécuté');

    // 5. Troisième appui sur Échap (plus aucune modale ouverte) : déclenche l action de page
    const evtEscape3 = new MockKeyboardEvent('keydown', { key: 'Escape' });
    global.document.dispatchEvent(evtEscape3);

    assert.strictEqual(pageEscapeActionCalled, true, 'onEscape global doit être appelé quand aucune modale n est active');

    if (unregisterShortcuts) unregisterShortcuts();
  });
});
