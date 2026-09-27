import '../helpers/setup.mjs';
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import PLAYER from '../../tracker/modules/player.js';
import MEASUREMENT from '../../tracker/modules/measurement.js';

class MockKeyboardEvent {
  constructor(type, options = {}) {
    this.type = type;
    this.key = options.key || '';
    this.ctrlKey = Boolean(options.ctrlKey);
    this.altKey = Boolean(options.altKey);
    this.metaKey = Boolean(options.metaKey);
    this.shiftKey = Boolean(options.shiftKey);
    this.defaultPrevented = false;
  }

  preventDefault() {
    this.defaultPrevented = true;
  }
}

describe('Tracker - Raccourcis clavier du lecteur (navigation de frames)', () => {
  let measurement;
  let player;
  let originalQSOverride;
  let originalActiveElement;
  let mockActiveElement = null;
  let mockActiveModal = null;

  const createMockElement = (tag = 'div') => ({
    tagName: tag,
    value: '',
    innerHTML: '',
    children: [],
    style: {},
    classList: {
      add: () => {},
      remove: () => {},
      toggle: () => {},
      contains: () => false
    },
    addEventListener: () => {},
    removeEventListener: () => {},
    appendChild: () => {},
    scrollIntoView: () => {},
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 })
  });

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

  beforeEach(() => {
    mockActiveElement = null;
    mockActiveModal = null;

    originalQSOverride = global.__querySelectorOverride;
    global.__querySelectorOverride = (sel) => {
      if (sel === '.modal.is-active') {
        return mockActiveModal;
      }
      return createMockElement();
    };

    originalActiveElement = Object.getOwnPropertyDescriptor(global.document, 'activeElement');
    Object.defineProperty(global.document, 'activeElement', {
      get: () => mockActiveElement,
      configurable: true
    });

    const canvasMock = {
      getContext: () => mockCtx,
      addEventListener: () => {},
      removeEventListener: () => {},
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 }),
      width: 100,
      height: 100,
      style: {}
    };
    const containerMock = { offsetHeight: 100, offsetWidth: 100 };

    measurement = new MEASUREMENT();
    player = new PLAYER(containerMock, canvasMock, measurement, {});

    // Charger une fausse vidéo décodée de 30 images
    const frames = Array.from({ length: 30 }, () => ({}));
    player.decodedVideo = {
      width: 640,
      height: 480,
      duration: 1000,
      frames,
      timestamps: frames.map((_, i) => i * 0.033)
    };
    measurement.init(player.decodedVideo, player);
    player.setFrame(0);
  });

  afterEach(() => {
    global.__querySelectorOverride = originalQSOverride;
    if (originalActiveElement) {
      Object.defineProperty(global.document, 'activeElement', originalActiveElement);
    } else {
      delete global.document.activeElement;
    }
  });

  it('doit avancer d\'une image avec ArrowRight et ArrowDown', () => {
    player.setFrame(5);
    const evtRight = new MockKeyboardEvent('keydown', { key: 'ArrowRight' });
    player.handleKeydown(evtRight);
    assert.strictEqual(player.currentFrame, 6);
    assert.strictEqual(evtRight.defaultPrevented, true);

    const evtDown = new MockKeyboardEvent('keydown', { key: 'ArrowDown' });
    player.handleKeydown(evtDown);
    assert.strictEqual(player.currentFrame, 7);
    assert.strictEqual(evtDown.defaultPrevented, true);
  });

  it('doit reculer d\'une image avec ArrowLeft et ArrowUp', () => {
    player.setFrame(5);
    const evtLeft = new MockKeyboardEvent('keydown', { key: 'ArrowLeft' });
    player.handleKeydown(evtLeft);
    assert.strictEqual(player.currentFrame, 4);
    assert.strictEqual(evtLeft.defaultPrevented, true);

    const evtUp = new MockKeyboardEvent('keydown', { key: 'ArrowUp' });
    player.handleKeydown(evtUp);
    assert.strictEqual(player.currentFrame, 3);
    assert.strictEqual(evtUp.defaultPrevented, true);
  });

  it('doit avancer et reculer de 10 images avec Shift + Flèches', () => {
    player.setFrame(5);
    const evtShiftRight = new MockKeyboardEvent('keydown', { key: 'ArrowRight', shiftKey: true });
    player.handleKeydown(evtShiftRight);
    assert.strictEqual(player.currentFrame, 15);
    assert.strictEqual(evtShiftRight.defaultPrevented, true);

    const evtShiftLeft = new MockKeyboardEvent('keydown', { key: 'ArrowLeft', shiftKey: true });
    player.handleKeydown(evtShiftLeft);
    assert.strictEqual(player.currentFrame, 5);
    assert.strictEqual(evtShiftLeft.defaultPrevented, true);
  });

  it('doit naviguer par 10 images avec PageDown et PageUp', () => {
    player.setFrame(5);
    const evtPageDown = new MockKeyboardEvent('keydown', { key: 'PageDown' });
    player.handleKeydown(evtPageDown);
    assert.strictEqual(player.currentFrame, 15);
    assert.strictEqual(evtPageDown.defaultPrevented, true);

    const evtPageUp = new MockKeyboardEvent('keydown', { key: 'PageUp' });
    player.handleKeydown(evtPageUp);
    assert.strictEqual(player.currentFrame, 5);
    assert.strictEqual(evtPageUp.defaultPrevented, true);
  });

  it('doit aller à la première image avec Home et dernière image avec End', () => {
    player.setFrame(12);
    const evtHome = new MockKeyboardEvent('keydown', { key: 'Home' });
    player.handleKeydown(evtHome);
    assert.strictEqual(player.currentFrame, 0);
    assert.strictEqual(evtHome.defaultPrevented, true);

    const evtEnd = new MockKeyboardEvent('keydown', { key: 'End' });
    player.handleKeydown(evtEnd);
    assert.strictEqual(player.currentFrame, 29); // 30 frames -> index 29
    assert.strictEqual(evtEnd.defaultPrevented, true);
  });

  it('Home ne doit pas descendre sous originFrame', () => {
    measurement.originFrame = 4;
    player.setFrame(10);
    const evtHome = new MockKeyboardEvent('keydown', { key: 'Home' });
    player.handleKeydown(evtHome);
    assert.strictEqual(player.currentFrame, 4);
  });

  it('doit basculer Lecture / Pause avec la touche Espace', () => {
    player.pauseFlag = true;
    let played = false;
    let paused = false;
    player.play = () => { played = true; player.pauseFlag = false; };
    player.pause = () => { paused = true; player.pauseFlag = true; };

    const evtSpace1 = new MockKeyboardEvent('keydown', { key: ' ' });
    player.handleKeydown(evtSpace1);
    assert.strictEqual(played, true);
    assert.strictEqual(evtSpace1.defaultPrevented, true);

    const evtSpace2 = new MockKeyboardEvent('keydown', { key: ' ' });
    player.handleKeydown(evtSpace2);
    assert.strictEqual(paused, true);
    assert.strictEqual(evtSpace2.defaultPrevented, true);
  });

  it('ne doit rien faire si aucune vidéo n\'est chargée', () => {
    player.decodedVideo = null;
    const evt = new MockKeyboardEvent('keydown', { key: 'ArrowRight' });
    player.handleKeydown(evt);
    assert.strictEqual(evt.defaultPrevented, false);
  });

  it('ne doit rien faire si l\'utilisateur écrit dans un champ (input, textarea, select, contentEditable)', () => {
    player.setFrame(5);

    mockActiveElement = { tagName: 'INPUT' };
    const evtInput = new MockKeyboardEvent('keydown', { key: 'ArrowRight' });
    player.handleKeydown(evtInput);
    assert.strictEqual(player.currentFrame, 5);
    assert.strictEqual(evtInput.defaultPrevented, false);

    mockActiveElement = { tagName: 'TEXTAREA' };
    const evtTextarea = new MockKeyboardEvent('keydown', { key: 'ArrowLeft' });
    player.handleKeydown(evtTextarea);
    assert.strictEqual(player.currentFrame, 5);
    assert.strictEqual(evtTextarea.defaultPrevented, false);

    mockActiveElement = { tagName: 'SELECT' };
    const evtSelect = new MockKeyboardEvent('keydown', { key: 'ArrowUp' });
    player.handleKeydown(evtSelect);
    assert.strictEqual(player.currentFrame, 5);
    assert.strictEqual(evtSelect.defaultPrevented, false);

    mockActiveElement = { tagName: 'DIV', isContentEditable: true };
    const evtEditable = new MockKeyboardEvent('keydown', { key: ' ' });
    player.handleKeydown(evtEditable);
    assert.strictEqual(evtEditable.defaultPrevented, false);
  });

  it('ne doit rien faire si une modale est ouverte', () => {
    player.setFrame(5);
    mockActiveModal = createMockElement('div');

    const evt = new MockKeyboardEvent('keydown', { key: 'ArrowRight' });
    player.handleKeydown(evt);
    assert.strictEqual(player.currentFrame, 5);
    assert.strictEqual(evt.defaultPrevented, false);
  });

  it('ne doit rien faire si un étalonnage ou placement d\'origine est en cours', () => {
    player.setFrame(5);

    player.originFlag = 'topright';
    const evtOrigin = new MockKeyboardEvent('keydown', { key: 'ArrowRight' });
    player.handleKeydown(evtOrigin);
    assert.strictEqual(player.currentFrame, 5);
    assert.strictEqual(evtOrigin.defaultPrevented, false);

    player.originFlag = 'none';
    player.segment = { x1: 0.2, y1: 0.3, x2: null, y2: null };
    const evtScale = new MockKeyboardEvent('keydown', { key: 'ArrowRight' });
    player.handleKeydown(evtScale);
    assert.strictEqual(player.currentFrame, 5);
    assert.strictEqual(evtScale.defaultPrevented, false);
  });

  it('ne doit rien faire avec les touches combinées Ctrl, Alt ou Meta', () => {
    player.setFrame(5);

    const evtCtrl = new MockKeyboardEvent('keydown', { key: 'ArrowRight', ctrlKey: true });
    player.handleKeydown(evtCtrl);
    assert.strictEqual(player.currentFrame, 5);
    assert.strictEqual(evtCtrl.defaultPrevented, false);

    const evtAlt = new MockKeyboardEvent('keydown', { key: 'ArrowRight', altKey: true });
    player.handleKeydown(evtAlt);
    assert.strictEqual(player.currentFrame, 5);
    assert.strictEqual(evtAlt.defaultPrevented, false);

    const evtMeta = new MockKeyboardEvent('keydown', { key: 'ArrowRight', metaKey: true });
    player.handleKeydown(evtMeta);
    assert.strictEqual(player.currentFrame, 5);
    assert.strictEqual(evtMeta.defaultPrevented, false);
  });

  it('selectRow doit appeler scrollIntoView({ block: "nearest" }) sur la ligne active', () => {
    let scrollOptions = null;
    const rowMock = {
      classList: {
        add: () => {},
        remove: () => {}
      },
      scrollIntoView: (options) => {
        scrollOptions = options;
      }
    };

    global.__querySelectorOverride = (sel) => {
      if (sel === '#row3') return rowMock;
      return createMockElement();
    };

    measurement.selectRow(3);
    assert.deepStrictEqual(scrollOptions, { block: 'nearest' });
  });
});

