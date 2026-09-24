import '../helpers/setup.mjs';
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { ModalManager, alertModal } from '../../common/common.js';

class MockKeyboardEvent extends Event {
  constructor(type, options = {}) {
    super(type, { cancelable: true });
    this.key = options.key || '';
  }
}

describe('ModalManager et alertModal - Nettoyage DOM et prévention des orphelins', () => {
  let originalQSOverride;
  let originalQSAllOverride;
  let originalGEBIOverride;
  let originalCreateElementOverride;
  let domElements;
  let bodyChildren;

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
        toggle: (c) => {
          if (classes.has(c)) classes.delete(c);
          else classes.add(c);
        },
        contains: (c) => classes.has(c)
      },
      setAttribute: (name, val) => {
        attributes[name] = String(val);
      },
      getAttribute: (name) => {
        return attributes[name] !== undefined ? attributes[name] : null;
      },
      removeAttribute: (name) => {
        delete attributes[name];
      },
      appendChild: (child) => {
        children.push(child);
        return child;
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
      querySelector: () => null,
      querySelectorAll: () => []
    };

    domElements.push(el);
    return el;
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
  });

  afterEach(() => {
    global.__querySelectorOverride = originalQSOverride;
    global.__querySelectorAllOverride = originalQSAllOverride;
    global.__getElementByIdOverride = originalGEBIOverride;
    global.__createElementOverride = originalCreateElementOverride;
  });

  it('alertModal() doit créer un nœud avec la classe alert-modal et data-dynamic="true"', () => {
    const modal = alertModal({ title: 'Test Alert', body: 'Contenu' });

    assert.ok(modal.classList.contains('modal'));
    assert.ok(modal.classList.contains('alert-modal'));
    assert.strictEqual(modal.getAttribute('data-dynamic'), 'true');
    assert.strictEqual(modal.classList.contains('is-active'), true);
    assert.ok(bodyChildren.includes(modal));
  });

  it('closeAllModals() doit retirer du DOM les modales dynamiques et préserver les modales statiques', () => {
    const modalManager = new ModalManager();

    // Modale statique (ex. #settings-modal)
    const staticModal = createMockElement('div');
    staticModal.id = 'settings-modal';
    staticModal.classList.add('modal');
    staticModal.classList.add('is-active');
    bodyChildren.push(staticModal);

    // Modale dynamique alertModal
    const dynamicModal = alertModal({ title: 'Alerte', body: 'Texte' });

    assert.strictEqual(bodyChildren.length, 2);
    assert.strictEqual(domElements.filter(e => e.classList.contains('modal')).length, 2);

    modalManager.closeAllModals();

    // La modale dynamique doit être supprimée du DOM et de document.body
    assert.strictEqual(bodyChildren.includes(dynamicModal), false);
    assert.strictEqual(domElements.includes(dynamicModal), false);

    // La modale statique doit être conservée dans le DOM mais fermée (is-active retiré)
    assert.strictEqual(bodyChildren.includes(staticModal), true);
    assert.strictEqual(domElements.includes(staticModal), true);
    assert.strictEqual(staticModal.classList.contains('is-active'), false);
  });

  it('La touche Échap doit supprimer les modales dynamiques alertModal du DOM', () => {
    new ModalManager();

    const dynamicModal = alertModal({ id: 'about-modal', title: 'À propos' });
    assert.strictEqual(domElements.some(e => e.id === 'about-modal'), true);

    // Déclenchement de l'événement Échap
    global.document.dispatchEvent(new MockKeyboardEvent('keydown', { key: 'Escape' }));

    // L'élément doit avoir été complètement retiré du DOM
    assert.strictEqual(domElements.some(e => e.id === 'about-modal'), false);
    assert.strictEqual(bodyChildren.includes(dynamicModal), false);
    assert.strictEqual(global.document.getElementById('about-modal'), null);
  });

  it('Ne doit pas créer de collision d\'identifiants lors de réouvertures successives avec Échap', () => {
    new ModalManager();

    // 1ère ouverture
    alertModal({ id: 'about-modal', title: 'À propos' });
    assert.strictEqual(domElements.filter(e => e.id === 'about-modal').length, 1);

    // Fermeture par Échap
    global.document.dispatchEvent(new MockKeyboardEvent('keydown', { key: 'Escape' }));
    assert.strictEqual(domElements.filter(e => e.id === 'about-modal').length, 0);

    // 2ème ouverture
    const secondModal = alertModal({ id: 'about-modal', title: 'À propos' });
    const matchingModals = domElements.filter(e => e.id === 'about-modal');

    assert.strictEqual(matchingModals.length, 1, 'Aucun doublon d\'ID ne doit exister dans le DOM');
    assert.strictEqual(matchingModals[0], secondModal);
    assert.strictEqual(secondModal.classList.contains('is-active'), true);
    assert.strictEqual(global.document.getElementById('about-modal'), secondModal);
  });

  it('alertModal() avec ID préexistant doit supprimer l\'ancien élément pour éviter toute collision', () => {
    // Cas où un élément de même ID existait déjà avant l'appel
    const existingElement = createMockElement('div');
    existingElement.id = 'checksize-loading-modal';
    existingElement.classList.add('modal');
    bodyChildren.push(existingElement);

    assert.strictEqual(domElements.filter(e => e.id === 'checksize-loading-modal').length, 1);

    // Nouvel appel alertModal avec le même ID
    const newModal = alertModal({ id: 'checksize-loading-modal', title: 'Chargement...' });

    assert.strictEqual(domElements.filter(e => e.id === 'checksize-loading-modal').length, 1);
    assert.strictEqual(domElements.find(e => e.id === 'checksize-loading-modal'), newModal);
    assert.strictEqual(bodyChildren.includes(existingElement), false);
    assert.strictEqual(bodyChildren.includes(newModal), true);
  });
});
