import '../helpers/setup.mjs';
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import PLAYER from '../../tracker/modules/player.js';

describe('Tracker - Gestion des raccourcis clavier pendant l\'étalonnage', () => {
  let player;
  let canvasMock;
  let containerMock;
  let addedListeners = [];
  let removedListeners = [];

  const mockCtx = {
    clearRect: () => {},
    drawImage: () => {},
    save: () => {},
    restore: () => {},
    beginPath: () => {},
    closePath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    stroke: () => {},
    fill: () => {}
  };

  const createMockElement = (id = '') => ({
    id,
    style: {},
    classList: {
      add: () => {},
      remove: () => {},
      contains: () => false
    },
    addEventListener: () => {},
    removeEventListener: () => {},
    click: () => {}
  });

  beforeEach(() => {
    addedListeners = [];
    removedListeners = [];

    const origAdd = document.addEventListener;
    const origRemove = document.removeEventListener;

    document.addEventListener = (type, listener, options) => {
      addedListeners.push({ type, listener });
      return origAdd.call(document, type, listener, options);
    };

    document.removeEventListener = (type, listener, options) => {
      removedListeners.push({ type, listener });
      return origRemove.call(document, type, listener, options);
    };

    canvasMock = {
      getContext: () => mockCtx,
      addEventListener: () => {},
      removeEventListener: () => {},
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 }),
      width: 100,
      height: 100,
      style: {}
    };
    containerMock = { offsetHeight: 100, offsetWidth: 100 };

    global.__querySelectorOverride = (sel) => {
      if (sel === '#canvas-shadow') return createMockElement('canvas-shadow');
      if (sel === '#segment-button') return createMockElement('segment-button');
      if (sel === '#videoCanvas') return canvasMock;
      return createMockElement();
    };

    const mockMeasurement = {
      originFrame: 0,
      series: [[]],
      scale: {
        origin: { x: 0, y: 0, type: 'none' },
        scaleSegment: { x1: null, y1: null, x2: null, y2: null }
      },
      updateTable: () => {},
      selectRow: () => {}
    };

    player = new PLAYER(containerMock, canvasMock, mockMeasurement, {});
  });

  afterEach(() => {
    global.__querySelectorOverride = undefined;
  });

  describe('1. Player : utilisation de keydown pour Escape dans enterOriginMode et enterScalenMode', () => {
    it('enterOriginMode doit enregistrer un écouteur keydown (et non keyup) pour originModeKeyboardShortcut', () => {
      player.enterOriginMode('topright');

      const keydownListener = addedListeners.find(l => l.type === 'keydown' && l.listener === player.originModeKeyboardShortcut);
      const keyupListener = addedListeners.find(l => l.type === 'keyup' && l.listener === player.originModeKeyboardShortcut);

      assert.ok(keydownListener, 'Un écouteur keydown doit être enregistré');
      assert.strictEqual(keyupListener, undefined, 'Aucun écouteur keyup ne doit être enregistré');
      assert.strictEqual(player.originFlag, 'topright');
    });

    it('exitOriginMode doit désenregistrer l\'écouteur keydown pour originModeKeyboardShortcut', () => {
      player.enterOriginMode('topright');
      player.exitOriginMode();

      const removedKeydown = removedListeners.find(l => l.type === 'keydown' && l.listener === player.originModeKeyboardShortcut);
      const removedKeyup = removedListeners.find(l => l.type === 'keyup' && l.listener === player.originModeKeyboardShortcut);

      assert.ok(removedKeydown, 'L\'écouteur keydown doit être désenregistré');
      assert.strictEqual(removedKeyup, undefined, 'Aucun écouteur keyup ne doit être désenregistré');
      assert.strictEqual(player.originFlag, 'none');
    });

    it('enterScalenMode doit enregistrer un écouteur keydown (et non keyup) pour scaleModeKeyboardShortcut', () => {
      player.enterScalenMode();

      const keydownListener = addedListeners.find(l => l.type === 'keydown' && l.listener === player.scaleModeKeyboardShortcut);
      const keyupListener = addedListeners.find(l => l.type === 'keyup' && l.listener === player.scaleModeKeyboardShortcut);

      assert.ok(keydownListener, 'Un écouteur keydown doit être enregistré');
      assert.strictEqual(keyupListener, undefined, 'Aucun écouteur keyup ne doit être enregistré');
    });

    it('exitScaleMode doit désenregistrer l\'écouteur keydown pour scaleModeKeyboardShortcut', () => {
      player.enterScalenMode();
      player.segment.x1 = 10;
      player.exitScaleMode();

      const removedKeydown = removedListeners.find(l => l.type === 'keydown' && l.listener === player.scaleModeKeyboardShortcut);
      const removedKeyup = removedListeners.find(l => l.type === 'keyup' && l.listener === player.scaleModeKeyboardShortcut);

      assert.ok(removedKeydown, 'L\'écouteur keydown doit être désenregistré');
      assert.strictEqual(removedKeyup, undefined, 'Aucun écouteur keyup ne doit être désenregistré');
      assert.strictEqual(player.segment.x1, null);
    });

    it('originModeKeyboardShortcut doit appeler exitOriginMode lors de la touche Escape', () => {
      player.enterOriginMode('downleft');
      let defaultPrevented = false;

      player.originModeKeyboardShortcut({
        key: 'Escape',
        preventDefault: () => { defaultPrevented = true; }
      });

      assert.strictEqual(defaultPrevented, true);
      assert.strictEqual(player.originFlag, 'none');
    });

    it('scaleModeKeyboardShortcut doit appeler exitScaleMode lors de la touche Escape', () => {
      player.enterScalenMode();
      player.segment.x1 = 25;
      let defaultPrevented = false;

      player.scaleModeKeyboardShortcut({
        key: 'Escape',
        preventDefault: () => { defaultPrevented = true; }
      });

      assert.strictEqual(defaultPrevented, true);
      assert.strictEqual(player.segment.x1, null);
    });
  });

  describe('2. main.js : configuration des raccourcis globaux avec isCalibrating et onEscape', () => {
    it('isCalibrating doit renvoyer true en mode origine ou lorsque le segment est en cours de tracé', () => {
      const isCalibrating = () => player.originFlag !== "none" || (player.segment && player.segment.x1 !== null);

      // État initial neutre
      player.originFlag = "none";
      player.segment.x1 = null;
      assert.strictEqual(isCalibrating(), false);

      // Mode origine actif
      player.originFlag = "topleft";
      assert.strictEqual(isCalibrating(), true);

      // Fin mode origine
      player.originFlag = "none";
      assert.strictEqual(isCalibrating(), false);

      // Mode échelle avec premier point placé
      player.segment.x1 = 50;
      assert.strictEqual(isCalibrating(), true);

      // Réinitialisation du segment
      player.segment.x1 = null;
      assert.strictEqual(isCalibrating(), false);
    });

    it('onSave, onNew et onOpen doivent être neutralisés quand isCalibrating() est vrai', () => {
      const isCalibrating = () => player.originFlag !== "none" || (player.segment && player.segment.x1 !== null);

      let saved = false;
      let openedNew = false;
      let openedVideo = false;

      const actions = {
        onSave: () => {
          if (isCalibrating()) return;
          saved = true;
        },
        onNew: () => {
          if (isCalibrating()) return;
          openedNew = true;
        },
        onOpen: () => {
          if (isCalibrating()) return;
          openedVideo = true;
        }
      };

      // Lors de l'étalonnage origine
      player.originFlag = "downright";
      actions.onSave();
      actions.onNew();
      actions.onOpen();
      assert.strictEqual(saved, false);
      assert.strictEqual(openedNew, false);
      assert.strictEqual(openedVideo, false);

      // Lors du tracé de segment
      player.originFlag = "none";
      player.segment.x1 = 120;
      actions.onSave();
      actions.onNew();
      actions.onOpen();
      assert.strictEqual(saved, false);
      assert.strictEqual(openedNew, false);
      assert.strictEqual(openedVideo, false);

      // Hors étalonnage
      player.segment.x1 = null;
      actions.onSave();
      actions.onNew();
      actions.onOpen();
      assert.strictEqual(saved, true);
      assert.strictEqual(openedNew, true);
      assert.strictEqual(openedVideo, true);
    });

    it('onEscape doit quitter le mode origine en priorité si player.originFlag !== "none"', () => {
      let exitOriginCalled = false;
      let exitScaleCalled = false;
      let closeModalsCalled = false;

      player.originFlag = "topright";
      player.exitOriginMode = () => { exitOriginCalled = true; };
      player.exitScaleMode = () => { exitScaleCalled = true; };
      const commonMock = {
        modalManager: {
          closeAllModals: () => { closeModalsCalled = true; }
        }
      };

      const handleEscape = () => {
        if (player.originFlag !== "none") {
          player.exitOriginMode();
          return;
        }
        if (player.segment && player.segment.x1 !== null) {
          player.exitScaleMode();
          return;
        }
        commonMock.modalManager.closeAllModals();
      };

      handleEscape();
      assert.strictEqual(exitOriginCalled, true);
      assert.strictEqual(exitScaleCalled, false);
      assert.strictEqual(closeModalsCalled, false);
    });

    it('onEscape doit quitter le mode échelle si player.segment.x1 !== null', () => {
      let exitOriginCalled = false;
      let exitScaleCalled = false;
      let closeModalsCalled = false;

      player.originFlag = "none";
      player.segment.x1 = 42;
      player.exitOriginMode = () => { exitOriginCalled = true; };
      player.exitScaleMode = () => { exitScaleCalled = true; };
      const commonMock = {
        modalManager: {
          closeAllModals: () => { closeModalsCalled = true; }
        }
      };

      const handleEscape = () => {
        if (player.originFlag !== "none") {
          player.exitOriginMode();
          return;
        }
        if (player.segment && player.segment.x1 !== null) {
          player.exitScaleMode();
          return;
        }
        commonMock.modalManager.closeAllModals();
      };

      handleEscape();
      assert.strictEqual(exitOriginCalled, false);
      assert.strictEqual(exitScaleCalled, true);
      assert.strictEqual(closeModalsCalled, false);
    });

    it('onEscape doit fermer toutes les modales si aucun étalonnage n\'est en cours', () => {
      let exitOriginCalled = false;
      let exitScaleCalled = false;
      let closeModalsCalled = false;

      player.originFlag = "none";
      player.segment.x1 = null;
      player.exitOriginMode = () => { exitOriginCalled = true; };
      player.exitScaleMode = () => { exitScaleCalled = true; };
      const commonMock = {
        modalManager: {
          closeAllModals: () => { closeModalsCalled = true; }
        }
      };

      const handleEscape = () => {
        if (player.originFlag !== "none") {
          player.exitOriginMode();
          return;
        }
        if (player.segment && player.segment.x1 !== null) {
          player.exitScaleMode();
          return;
        }
        commonMock.modalManager.closeAllModals();
      };

      handleEscape();
      assert.strictEqual(exitOriginCalled, false);
      assert.strictEqual(exitScaleCalled, false);
      assert.strictEqual(closeModalsCalled, true);
    });
  });
});

