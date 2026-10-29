import '../helpers/setup.mjs';
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { electronSetup } from '../../common/common.js';

describe('electronSetup - Gestion des écouteurs plein écran et prévention des fuites', () => {
  let callbacks;
  let windowListeners;
  let navbarListeners;
  let mockNavbar;
  let mockMaxBtn;
  let mockRestoreBtn;

  beforeEach(() => {
    callbacks = {};
    windowListeners = {
      mousemove: new Set(),
      mouseup: new Set()
    };
    navbarListeners = {
      mousedown: new Set(),
      dblclick: new Set()
    };

    // Override window event listeners tracking
    global.window.addEventListener = (type, listener) => {
      if (!windowListeners[type]) windowListeners[type] = new Set();
      windowListeners[type].add(listener);
    };
    global.window.removeEventListener = (type, listener) => {
      if (windowListeners[type]) windowListeners[type].delete(listener);
    };

    // Mock DOM elements
    mockNavbar = {
      style: { webkitAppRegion: 'drag' },
      addEventListener: (type, listener) => {
        if (!navbarListeners[type]) navbarListeners[type] = new Set();
        navbarListeners[type].add(listener);
      },
      removeEventListener: (type, listener) => {
        if (navbarListeners[type]) navbarListeners[type].delete(listener);
      }
    };

    mockMaxBtn = {
      parentNode: { classList: { add: () => {}, remove: () => {} } },
      addEventListener: () => {}
    };
    mockRestoreBtn = {
      parentNode: { classList: { add: () => {}, remove: () => {} } },
      addEventListener: () => {}
    };

    global.__querySelectorOverride = (selector) => {
      if (selector === '.navbar') return mockNavbar;
      if (selector === '#window-maximize-button') return mockMaxBtn;
      if (selector === '#window-restore-button') return mockRestoreBtn;
      if (selector === '#window-minimize-button') return { addEventListener: () => {} };
      return null;
    };

    // Mock electronAPI
    global.window.electronAPI = {
      isMaximized: async () => false,
      isFullscreen: async () => false,
      minimize: () => {},
      maximize: () => {},
      restore: () => {},
      setFullscreen: () => {},
      restoreAndDrag: async () => 50,
      moveWindowTo: () => {},
      onMaximized: (cb) => { callbacks.maximized = cb; },
      onUnmaximized: (cb) => { callbacks.unmaximized = cb; },
      onEnterFullscreen: (cb) => { callbacks.enterFullscreen = cb; },
      onLeaveFullscreen: (cb) => { callbacks.leaveFullscreen = cb; }
    };
  });

  it('n attache PAS mousemove et mouseup sur window dès l entrée en plein écran', async () => {
    await electronSetup();

    // Simule l'entrée en plein écran
    callbacks.enterFullscreen();

    assert.strictEqual(mockNavbar.style.webkitAppRegion, 'no-drag');
    assert.strictEqual(navbarListeners.mousedown.size, 1, 'mousedown doit être attaché à la navbar');
    assert.strictEqual(navbarListeners.dblclick.size, 1, 'dblclick doit être attaché à la navbar');

    // Vérifie qu'aucun écouteur global mousemove/mouseup n'a été attaché sur window
    assert.strictEqual(windowListeners.mousemove.size, 0, 'mousemove ne doit PAS être sur window');
    assert.strictEqual(windowListeners.mouseup.size, 0, 'mouseup ne doit PAS être sur window');
  });

  it('n accumule pas les écouteurs si onEnterFullscreen est déclenché plusieurs fois', async () => {
    await electronSetup();

    callbacks.enterFullscreen();
    callbacks.enterFullscreen();
    callbacks.enterFullscreen();

    assert.strictEqual(navbarListeners.mousedown.size, 1, 'mousedown ne doit pas être dupliqué sur navbar');
    assert.strictEqual(navbarListeners.dblclick.size, 1, 'dblclick ne doit pas être dupliqué sur navbar');
    assert.strictEqual(windowListeners.mousemove.size, 0, 'aucun listener résiduel sur window');
    assert.strictEqual(windowListeners.mouseup.size, 0, 'aucun listener résiduel sur window');
  });

  it('attache mousemove et mouseup sur window uniquement au mousedown sur navbar, et les retire au mouseup', async () => {
    await electronSetup();
    callbacks.enterFullscreen();

    const mousedownHandler = Array.from(navbarListeners.mousedown)[0];
    assert.ok(mousedownHandler);

    // Déclenchement du mousedown
    mousedownHandler({
      target: { closest: () => null },
      screenX: 100,
      screenY: 50
    });

    assert.strictEqual(windowListeners.mousemove.size, 1, 'mousemove doit être attaché après mousedown');
    assert.strictEqual(windowListeners.mouseup.size, 1, 'mouseup doit être attaché après mousedown');

    // Relâchement de la souris sans drag significatif (< 5px)
    const mouseupHandler = Array.from(windowListeners.mouseup)[0];
    assert.ok(mouseupHandler);
    await mouseupHandler({});

    assert.strictEqual(windowListeners.mousemove.size, 0, 'mousemove doit être retiré au mouseup');
    assert.strictEqual(windowListeners.mouseup.size, 0, 'mouseup doit être retiré au mouseup');
  });

  it('gère le glisser pour restaurer et nettoie systématiquement au mouseup', async () => {
    await electronSetup();
    callbacks.enterFullscreen();

    const mousedownHandler = Array.from(navbarListeners.mousedown)[0];
    mousedownHandler({
      target: { closest: () => null },
      screenX: 100,
      screenY: 50
    });

    const mousemoveHandler = Array.from(windowListeners.mousemove)[0];
    // Déplacement > 5px pour enclencher le drag
    await mousemoveHandler({
      screenX: 120,
      screenY: 70,
      clientX: 120
    });

    // Pendant le drag, Electron déclenche onLeaveFullscreen
    await callbacks.leaveFullscreen();

    // Pendant le drag actif (isManualDragging), les écouteurs window doivent être maintenus
    assert.strictEqual(windowListeners.mousemove.size, 1, 'mousemove maintenu pendant le drag');
    assert.strictEqual(windowListeners.mouseup.size, 1, 'mouseup maintenu pendant le drag');

    // Relâchement final de la souris
    const mouseupHandler = Array.from(windowListeners.mouseup)[0];
    await mouseupHandler({});

    assert.strictEqual(windowListeners.mousemove.size, 0, 'mousemove doit être retiré après la fin du drag');
    assert.strictEqual(windowListeners.mouseup.size, 0, 'mouseup doit être retiré après la fin du drag');
    assert.strictEqual(mockNavbar.style.webkitAppRegion, 'drag', 'la navbar doit redevenir draggable');
  });

  it('nettoie les écouteurs sur window lors de onLeaveFullscreen si aucun drag en cours (ex: touche Echap)', async () => {
    await electronSetup();
    callbacks.enterFullscreen();

    // Sortie directe du plein écran sans dragging
    await callbacks.leaveFullscreen();

    assert.strictEqual(navbarListeners.mousedown.size, 0, 'mousedown doit être retiré de la navbar');
    assert.strictEqual(navbarListeners.dblclick.size, 0, 'dblclick doit être retiré de la navbar');
    assert.strictEqual(windowListeners.mousemove.size, 0, 'aucun listener mousemove résiduel');
    assert.strictEqual(windowListeners.mouseup.size, 0, 'aucun listener mouseup résiduel');
    assert.strictEqual(mockNavbar.style.webkitAppRegion, 'drag');
  });
});

