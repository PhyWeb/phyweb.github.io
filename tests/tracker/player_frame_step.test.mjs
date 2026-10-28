import '../helpers/setup.mjs';
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import PLAYER from '../../tracker/modules/player.js';
import MEASUREMENT from '../../tracker/modules/measurement.js';

describe('Tracker - Pas d\'avancement (frameStep)', () => {
  let measurement;
  let player;
  let frameStepInputMock;
  let originalQSOverride;

  const createMockElement = (tag = 'div') => {
    const classes = new Set();
    const listeners = {};
    return {
      tagName: tag,
      value: '1',
      innerHTML: '',
      children: [],
      style: {},
      classList: {
        add: (...cls) => cls.forEach(c => classes.add(c)),
        remove: (...cls) => cls.forEach(c => classes.delete(c)),
        toggle: (c) => (classes.has(c) ? classes.delete(c) : classes.add(c)),
        contains: (c) => classes.has(c)
      },
      addEventListener: (type, fn) => {
        if (!listeners[type]) listeners[type] = [];
        listeners[type].push(fn);
      },
      removeEventListener: () => {},
      dispatchEvent: (evt) => {
        const fns = listeners[evt.type] || [];
        fns.forEach(fn => fn(evt));
      },
      appendChild: () => {},
      scrollIntoView: () => {},
      blur: function() { this.blurred = true; },
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 })
    };
  };

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
    frameStepInputMock = createMockElement('input');
    frameStepInputMock.value = '1';

    originalQSOverride = global.__querySelectorOverride;
    global.cancelAnimationFrame = global.cancelAnimationFrame || (() => {});
    global.requestAnimationFrame = global.requestAnimationFrame || (() => 1);
    global.__querySelectorOverride = (sel) => {
      if (sel === '#frame-step-input') return frameStepInputMock;
      if (sel === '#etalonnage-button') {
        const el = createMockElement('li');
        // Mesures tab is active by default in testing onClick
        return el;
      }
      return createMockElement('div');
    };

    measurement = new MEASUREMENT();
    const canvas = createMockElement('canvas');
    canvas.getContext = () => mockCtx;
    player = new PLAYER(createMockElement('div'), canvas, measurement, {});
    player.pauseFlag = true; // Simuler lecteur en pause pour permettre onClick
  });

  afterEach(() => {
    global.__querySelectorOverride = originalQSOverride;
  });

  it('doit initialiser player.frameStep à 1 dans le constructeur', () => {
    assert.strictEqual(player.frameStep, 1);
  });

  it('doit réinitialiser player.frameStep à 1 dans load()', () => {
    player.frameStep = 10;
    // Appeler load() avec un objet fichier et un mock d'extracteur qui ne bloque pas
    player.extractor = { checkSize: () => {} };
    player.load({ name: 'dummy.mp4' });
    assert.strictEqual(player.frameStep, 1);
  });

  it('doit réinitialiser #frame-step-input à 1 dans measurement.init()', () => {
    frameStepInputMock.value = '15';
    measurement.init({ width: 1920, height: 1080, frames: [{}, {}, {}], timestamps: [0, 0.04, 0.08] }, player);
    assert.strictEqual(frameStepInputMock.value, 1);
  });

  it('onClick doit faire avancer de frameStep images quand un point est validé (ppf = 1)', () => {
    const mockFrames = Array.from({ length: 20 }, (_, i) => ({ id: i }));
    measurement.init({ width: 640, height: 480, frames: mockFrames, timestamps: mockFrames.map((_, i) => i * 0.04) }, player);
    player.decodedVideo = { width: 640, height: 480, frames: mockFrames, duration: 800 };
    player.currentFrame = 0;
    player.frameStep = 5;

    // Simuler un clic valide à la position (50, 50) sur le canvas
    player.onClick({ clientX: 50, clientY: 50 });

    assert.strictEqual(player.currentFrame, 5, 'Le lecteur doit avoir sauté directement à la frame 5');
    assert.strictEqual(player.currentPoint, 0);

    // Nouveau clic, doit avancer à la frame 10
    player.onClick({ clientX: 50, clientY: 50 });
    assert.strictEqual(player.currentFrame, 10, 'Le lecteur doit avoir sauté à la frame 10');
  });

  it('onClick ne doit pas dépasser la dernière image si currentFrame + frameStep >= frames.length', () => {
    const mockFrames = Array.from({ length: 10 }, (_, i) => ({ id: i }));
    measurement.init({ width: 640, height: 480, frames: mockFrames, timestamps: mockFrames.map((_, i) => i * 0.04) }, player);
    player.decodedVideo = { width: 640, height: 480, frames: mockFrames, duration: 400 };
    player.currentFrame = 7;
    player.frameStep = 5; // 7 + 5 = 12 >= 10

    player.onClick({ clientX: 50, clientY: 50 });

    assert.strictEqual(player.currentFrame, 7, 'Le lecteur ne doit pas dépasser la dernière frame');
    assert.strictEqual(player.currentPoint, 0);
  });

  it('onClick avec plusieurs points par image (ppf = 2) doit seulement avancer au dernier point', () => {
    const mockFrames = Array.from({ length: 10 }, (_, i) => ({ id: i }));
    measurement.init({ width: 640, height: 480, frames: mockFrames, timestamps: mockFrames.map((_, i) => i * 0.04) }, player);
    measurement.setPointPerFrame(2, player);
    player.decodedVideo = { width: 640, height: 480, frames: mockFrames, duration: 400 };
    player.currentFrame = 2;
    player.frameStep = 3;

    // Premier point : n'avance pas
    player.onClick({ clientX: 50, clientY: 50 });
    assert.strictEqual(player.currentFrame, 2);
    assert.strictEqual(player.currentPoint, 1);

    // Deuxième point : tous les points sont saisis -> avance de frameStep (2 + 3 = 5)
    player.onClick({ clientX: 60, clientY: 60 });
    assert.strictEqual(player.currentFrame, 5);
    assert.strictEqual(player.currentPoint, 0);
  });

  describe('Validation des bornes et écouteurs d\'événements (main.js logic)', () => {
    it('doit borner frameStep entre 1 et max (measurement.series[0].length - 1)', () => {
      const mockFrames = Array.from({ length: 30 }, (_, i) => ({ id: i }));
      measurement.init({ width: 640, height: 480, frames: mockFrames, timestamps: mockFrames.map((_, i) => i * 0.04) }, player);

      const maxStep = Math.max(1, (measurement.series[0]?.length || 50) - 1); // 29

      // Fonction simulant le handler de change dans main.js
      const handleChange = (inputVal) => {
        const e = { target: { value: inputVal } };
        const max = Math.max(1, (measurement.series[0]?.length || 50) - 1);
        let val = parseInt(e.target.value, 10);
        if (isNaN(val) || val < 1) {
          val = 1;
        } else if (val > max) {
          val = max;
        }
        e.target.value = val;
        player.frameStep = parseInt(e.target.value, 10) || 1;
        return e.target.value;
      };

      assert.strictEqual(handleChange('-5'), 1);
      assert.strictEqual(player.frameStep, 1);

      assert.strictEqual(handleChange('0'), 1);
      assert.strictEqual(player.frameStep, 1);

      assert.strictEqual(handleChange('abc'), 1);
      assert.strictEqual(player.frameStep, 1);

      assert.strictEqual(handleChange('10'), 10);
      assert.strictEqual(player.frameStep, 10);

      assert.strictEqual(handleChange('100'), 29);
      assert.strictEqual(player.frameStep, 29);
    });
  });
});
