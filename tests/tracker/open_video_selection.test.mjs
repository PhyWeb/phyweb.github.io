import '../helpers/setup.mjs';
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import VIDEOLIST from '../../tracker/modules/videolist.js';

describe('Tracker - Sélection et ouverture de vidéo (#open-video et .video-item.is-active)', () => {
  let originalQSOverride;
  let originalQSAllOverride;
  let mockElements;

  const createMockElement = (id = '') => {
    const classes = new Set();
    const listeners = {};
    return {
      id,
      dataset: {},
      disabled: false,
      style: {},
      classList: {
        add: (c) => classes.add(c),
        remove: (c) => classes.delete(c),
        toggle: (c) => {
          if (classes.has(c)) classes.delete(c);
          else classes.add(c);
        },
        contains: (c) => classes.has(c)
      },
      listeners,
      addEventListener: (type, fn) => {
        if (!listeners[type]) listeners[type] = [];
        listeners[type].push(fn);
      },
      click: function () {
        if (listeners['click']) {
          listeners['click'].forEach(fn => fn({ preventDefault: () => {} }));
        }
      }
    };
  };

  beforeEach(() => {
    mockElements = {
      '#open-video': createMockElement('open-video'),
      '#force-filesize-modal-input': { checked: false },
      activeVideoItem: null
    };

    originalQSOverride = global.__querySelectorOverride;
    originalQSAllOverride = global.__querySelectorAllOverride;

    global.__querySelectorOverride = (sel) => {
      if (sel === '.video-item.is-active') {
        return mockElements.activeVideoItem;
      }
      if (mockElements[sel]) {
        return mockElements[sel];
      }
      return null;
    };
  });

  afterEach(() => {
    global.__querySelectorOverride = originalQSOverride;
    global.__querySelectorAllOverride = originalQSAllOverride;
  });

  describe('Démonstration du bogue historique (accès aveugle)', () => {
    it('provoque un TypeError si aucun élément n\'a la classe is-active', () => {
      mockElements.activeVideoItem = null;

      const historicalAction = () => {
        const path = global.document.querySelector('.video-item.is-active').dataset.path;
        return 'assets/' + path;
      };

      assert.throws(
        () => historicalAction(),
        TypeError,
        "L'accès aveugle à dataset sur un élément null doit lever TypeError"
      );
    });
  });

  describe('VIDEOLIST.prototype.getSelectedPath', () => {
    it('doit renvoyer null si aucun élément actif n\'est présent', () => {
      const videolist = new VIDEOLIST();
      mockElements.activeVideoItem = null;

      assert.equal(videolist.getSelectedPath(), null);
    });

    it('doit renvoyer null si l\'élément actif n\'a pas de dataset.path', () => {
      const videolist = new VIDEOLIST();
      const fakeItem = createMockElement();
      fakeItem.classList.add('is-active');
      fakeItem.dataset = {}; // pas de propriété path
      mockElements.activeVideoItem = fakeItem;

      assert.equal(videolist.getSelectedPath(), null);
    });

    it('doit renvoyer le chemin exact si l\'élément actif possède dataset.path', () => {
      const videolist = new VIDEOLIST();
      const fakeItem = createMockElement();
      fakeItem.classList.add('is-active');
      fakeItem.dataset = { path: 'mouvement/chute_libre.mp4' };
      mockElements.activeVideoItem = fakeItem;

      assert.equal(videolist.getSelectedPath(), 'mouvement/chute_libre.mp4');
    });
  });

  describe('Logique sécurisée de l\'écouteur #open-video', () => {
    it('ne doit pas appeler confirmAction ni player.load si aucun élément n\'est actif', () => {
      mockElements.activeVideoItem = null;

      let confirmActionCalled = false;
      const navManagerMock = {
        confirmAction: () => { confirmActionCalled = true; }
      };

      let playerLoadCalled = false;
      const playerMock = {
        load: () => { playerLoadCalled = true; }
      };

      const videolist = new VIDEOLIST();

      // Logique exacte de main.js
      const onOpenVideoClick = () => {
        const selectedPath = videolist.getSelectedPath?.() || global.document.querySelector(".video-item.is-active")?.dataset?.path;
        if (!selectedPath) {
          return;
        }
        navManagerMock.confirmAction(() => {
          playerMock.load("assets/" + selectedPath, false);
        });
      };

      // Exécution sans exception
      assert.doesNotThrow(() => onOpenVideoClick());
      assert.equal(confirmActionCalled, false, 'confirmAction ne doit pas être appelée');
      assert.equal(playerLoadCalled, false, 'player.load ne doit pas être appelée');
    });

    it('doit appeler confirmAction et player.load avec le bon chemin lorsqu\'un élément est actif', () => {
      const fakeItem = createMockElement();
      fakeItem.classList.add('is-active');
      fakeItem.dataset = { path: 'mecanique/pendule.mp4' };
      mockElements.activeVideoItem = fakeItem;

      let confirmActionCalled = false;
      let modalClosed = false;
      const modalManagerMock = {
        closeAllModals: () => { modalClosed = true; }
      };
      const navManagerMock = {
        confirmAction: (cb) => {
          confirmActionCalled = true;
          cb();
        }
      };

      let loadedPath = null;
      let forceFilesizeValue = null;
      const playerMock = {
        load: (path, forceFilesize) => {
          loadedPath = path;
          forceFilesizeValue = forceFilesize;
        }
      };

      mockElements['#force-filesize-modal-input'].checked = true;
      const videolist = new VIDEOLIST();

      const onOpenVideoClick = () => {
        const selectedPath = videolist.getSelectedPath?.() || global.document.querySelector(".video-item.is-active")?.dataset?.path;
        if (!selectedPath) {
          return;
        }
        navManagerMock.confirmAction(() => {
          modalManagerMock.closeAllModals();
          playerMock.load("assets/" + selectedPath, mockElements['#force-filesize-modal-input']?.checked ?? false);
        });
      };

      onOpenVideoClick();

      assert.equal(confirmActionCalled, true);
      assert.equal(modalClosed, true);
      assert.equal(loadedPath, 'assets/mecanique/pendule.mp4');
      assert.equal(forceFilesizeValue, true);
    });
  });
});

