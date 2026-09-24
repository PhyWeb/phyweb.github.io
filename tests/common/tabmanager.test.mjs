import '../helpers/setup.mjs';
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { TabManager } from '../../common/common.js';

describe('TabManager - Gestion des onglets et intégrité de deleteTab', () => {
  let container;
  let tabManager;
  let confirmButtons;

  const createMockElement = () => ({
    value: '',
    textContent: '',
    className: '',
    style: {},
    classList: {
      add: function(cls) {
        if (!this.contains(cls)) {
          this._classes.push(cls);
        }
      },
      remove: function(cls) {
        this._classes = this._classes.filter(c => c !== cls);
      },
      toggle: function(cls) {
        if (this.contains(cls)) this.remove(cls);
        else this.add(cls);
      },
      contains: function(cls) {
        return this._classes.includes(cls);
      },
      _classes: []
    },
    _listeners: {},
    addEventListener: function(evt, cb) {
      if (!this._listeners[evt]) this._listeners[evt] = [];
      this._listeners[evt].push(cb);
    },
    click: function() {
      const handlers = this._listeners['click'] || [];
      handlers.forEach(h => h());
    },
    removeEventListener: () => {},
    setAttribute: () => {},
    removeAttribute: () => {},
    appendChild: () => {},
    remove: () => {}
  });

  beforeEach(() => {
    confirmButtons = [];
    global.__createElementOverride = (tag) => {
      const el = createMockElement();
      if (tag === 'button') {
        confirmButtons.push(el);
      }
      return el;
    };

    container = createMockElement();
    tabManager = new TabManager(container);
  });

  const deleteAndConfirm = (id) => {
    confirmButtons = [];
    tabManager.deleteTab(id);
    // In alertModal with confirm and cancel, the first button created is confirmButton
    const confirmButton = confirmButtons[0];
    if (confirmButton) {
      confirmButton.click();
    }
  };

  it('ne doit pas crasher et doit positionner activeTab à undefined lorsque le dernier onglet est supprimé (tabs.length === 0)', () => {
    tabManager.newTab({
      tabButton: createMockElement(),
      tab: createMockElement(),
      name: 'Seul onglet',
      isActive: true
    });

    assert.equal(tabManager.tabs.length, 1);
    assert.equal(tabManager.activeTab, 0);

    // Supprimer et confirmer
    deleteAndConfirm(0);

    assert.equal(tabManager.tabs.length, 0);
    assert.equal(tabManager.activeTab, undefined);
  });

  it('doit décrémenter activeTab lorsqu\'un onglet situé avant l\'onglet actif est supprimé (_id < activeTab)', () => {
    tabManager.newTab({ tabButton: createMockElement(), tab: createMockElement(), name: 'Onglet 0' });
    tabManager.newTab({ tabButton: createMockElement(), tab: createMockElement(), name: 'Onglet 1' });
    tabManager.newTab({ tabButton: createMockElement(), tab: createMockElement(), name: 'Onglet 2' });
    tabManager.newTab({ tabButton: createMockElement(), tab: createMockElement(), name: 'Onglet 3' });

    tabManager.onTabClicked(3);
    assert.equal(tabManager.activeTab, 3);

    // Supprimer l'onglet 1 (situé avant l'onglet actif 3)
    deleteAndConfirm(1);

    assert.equal(tabManager.tabs.length, 3);
    // activeTab doit avoir été décrémenté de 3 à 2
    assert.equal(tabManager.activeTab, 2);
    assert.equal(tabManager.tabs[tabManager.activeTab].name, 'Onglet 3');
  });

  it('doit activer l\'onglet à gauche lorsqu\'on supprime l\'onglet actif', () => {
    tabManager.newTab({ tabButton: createMockElement(), tab: createMockElement(), name: 'Onglet 0' });
    tabManager.newTab({ tabButton: createMockElement(), tab: createMockElement(), name: 'Onglet 1' });
    tabManager.newTab({ tabButton: createMockElement(), tab: createMockElement(), name: 'Onglet 2' });

    tabManager.onTabClicked(2);
    assert.equal(tabManager.activeTab, 2);

    // Supprimer l'onglet actif (2)
    deleteAndConfirm(2);

    assert.equal(tabManager.tabs.length, 2);
    // L'onglet actif devient l'onglet à gauche (1)
    assert.equal(tabManager.activeTab, 1);
    assert.equal(tabManager.tabs[tabManager.activeTab].name, 'Onglet 1');
  });

  it('doit activer l\'indice 0 lorsque l\'onglet 0 actif est supprimé et qu\'il reste d\'autres onglets', () => {
    tabManager.newTab({ tabButton: createMockElement(), tab: createMockElement(), name: 'Onglet 0' });
    tabManager.newTab({ tabButton: createMockElement(), tab: createMockElement(), name: 'Onglet 1' });

    tabManager.onTabClicked(0);
    assert.equal(tabManager.activeTab, 0);

    // Supprimer l'onglet 0
    deleteAndConfirm(0);

    assert.equal(tabManager.tabs.length, 1);
    assert.equal(tabManager.activeTab, 0);
    assert.equal(tabManager.tabs[0].name, 'Onglet 1');
  });

  it('doit appeler le callback deleteCB avec l\'index avant la suppression', () => {
    let deletedId = null;
    tabManager.newTab({
      tabButton: createMockElement(),
      tab: createMockElement(),
      name: 'Onglet Test',
      deleteCB: (id) => {
        deletedId = id;
      }
    });

    deleteAndConfirm(0);
    assert.equal(deletedId, 0);
  });

  it('doit ignorer les requêtes de suppression avec un index hors limites', () => {
    tabManager.newTab({ tabButton: createMockElement(), tab: createMockElement(), name: 'Onglet 0' });

    tabManager.deleteTab(-1);
    assert.equal(tabManager.tabs.length, 1);

    tabManager.deleteTab(5);
    assert.equal(tabManager.tabs.length, 1);
  });

  it('onTabClicked doit ignorer sans erreur un appel avec un index inexistant', () => {
    assert.doesNotThrow(() => {
      tabManager.onTabClicked(99);
      tabManager.onTabClicked(-1);
    });
  });
});

