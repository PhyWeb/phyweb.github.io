import '../helpers/setup.mjs';
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { create as createSlider } from '../../common/noUIslider/nouislider.mjs';

function createMockSliderElement(tag = 'div') {
  const el = {
    nodeName: tag.toUpperCase(),
    tagName: tag.toUpperCase(),
    style: {},
    classList: {
      add: () => {},
      remove: () => {},
      toggle: () => {},
      contains: () => false
    },
    children: [],
    childNodes: [],
    appendChild: function(c) {
      this.children.push(c);
      this.childNodes.push(c);
      c.parentElement = this;
      c.parentNode = this;
      return c;
    },
    removeChild: function(c) {
      const i = this.children.indexOf(c);
      if (i !== -1) this.children.splice(i, 1);
      const j = this.childNodes.indexOf(c);
      if (j !== -1) this.childNodes.splice(j, 1);
      return c;
    },
    setAttribute: () => {},
    removeAttribute: () => {},
    getAttribute: () => null,
    hasAttribute: () => false,
    addEventListener: () => {},
    removeEventListener: () => {},
    getBoundingClientRect: () => ({ top: 0, left: 0, width: 300, height: 20, bottom: 20, right: 300 })
  };
  return el;
}

// Configuration minimale du DOM pour noUiSlider sous Node.js
if (!global.getComputedStyle) {
  global.getComputedStyle = () => ({ direction: 'ltr' });
}
if (!global.document.documentElement || !global.document.documentElement.nodeName) {
  global.document.documentElement = createMockSliderElement('html');
}
if (!global.document.body || !global.document.body.nodeName) {
  global.document.body = createMockSliderElement('body');
}

describe('Tracker - noUiSlider et gestion des vidéos courtes (< 1 seconde)', () => {
  let prevCreateOverride;

  beforeEach(() => {
    prevCreateOverride = global.__createElementOverride;
    global.__createElementOverride = createMockSliderElement;
  });

  afterEach(() => {
    global.__createElementOverride = prevCreateOverride;
  });

  it('confirme le bogue historique : margin: 1 bloque complètement les curseurs sur une vidéo de 0.5s', () => {
    const sliderContainer = createMockSliderElement('div');
    sliderContainer.ownerDocument = global.document;

    // Configuration historique de main.js
    createSlider(sliderContainer, {
      start: [0, 10],
      connect: true,
      range: { min: 0, max: 10 },
      margin: 1, // Marge minimale de 1 seconde
      behaviour: 'tap-drag',
      tooltips: false,
      pips: {
        mode: 'steps',
        stepped: true,
        density: 4
      }
    });

    // Mise à jour historique de extractor.js onReady() sans spécifier margin
    sliderContainer.noUiSlider.updateOptions({
      range: { min: 0, max: 0.5 },
      start: [0, 0.5]
    });

    const initialValues = sliderContainer.noUiSlider.get();
    assert.deepEqual(initialValues, ['0.00', '0.50']);

    // Tentative de déplacer le début à 0.1s
    sliderContainer.noUiSlider.set([0.1, null]);
    // Comme margin: 1 > range total (0.5), la poignée 0 ne peut pas avancer (0.5 - 1 = -0.5 <= 0)
    assert.equal(sliderContainer.noUiSlider.get()[0], '0.00', 'La poignée de début reste bloquée à 0.00');

    // Tentative de déplacer la fin à 0.35s
    sliderContainer.noUiSlider.set([null, 0.35]);
    // La poignée 1 ne peut pas reculer (0 + 1 = 1.0 >= 0.5)
    assert.equal(sliderContainer.noUiSlider.get()[1], '0.50', 'La poignée de fin reste bloquée à 0.50');
  });

  it('démontre le comportement attendu : sans margin fixe (margin: null), les vidéos courtes (< 1s) sont librement ajustables', () => {
    const sliderContainer = createMockSliderElement('div');
    sliderContainer.ownerDocument = global.document;

    // Initialisation corrigée (sans margin: 1 obligatoire)
    createSlider(sliderContainer, {
      start: [0, 10],
      connect: true,
      range: { min: 0, max: 10 },
      behaviour: 'tap-drag',
      tooltips: false,
      pips: {
        mode: 'steps',
        stepped: true,
        density: 4
      }
    });

    // Mise à jour corrigée avec margin: null
    sliderContainer.noUiSlider.updateOptions({
      range: { min: 0, max: 0.5 },
      start: [0, 0.5],
      margin: null
    });

    // Déplacement de début à 0.1s
    sliderContainer.noUiSlider.set([0.1, null]);
    assert.equal(sliderContainer.noUiSlider.get()[0], '0.10', 'La poignée de début peut être avancée à 0.10s');
    assert.equal(sliderContainer.noUiSlider.get()[1], '0.50', 'La poignée de fin reste à 0.50s');

    // Déplacement de fin à 0.35s
    sliderContainer.noUiSlider.set([null, 0.35]);
    assert.equal(sliderContainer.noUiSlider.get()[0], '0.10', 'La poignée de début reste à 0.10s');
    assert.equal(sliderContainer.noUiSlider.get()[1], '0.35', 'La poignée de fin peut être ramenée à 0.35s');
  });

  it('doit réinitialiser margin même si le slider avait été créé avec margin: 1', () => {
    const sliderContainer = createMockSliderElement('div');
    sliderContainer.ownerDocument = global.document;

    // Créé avec margin: 1
    createSlider(sliderContainer, {
      start: [0, 10],
      connect: true,
      range: { min: 0, max: 10 },
      margin: 1
    });

    // updateOptions avec margin: null supprime la contrainte de marge
    sliderContainer.noUiSlider.updateOptions({
      range: { min: 0, max: 0.3 },
      start: [0, 0.3],
      margin: null
    });

    sliderContainer.noUiSlider.set([0.05, 0.25]);
    assert.deepEqual(sliderContainer.noUiSlider.get(), ['0.05', '0.25']);
  });

  it('doit supporter des vidéos ultra-courtes de chute libre ou impact (ex: 0.15s)', () => {
    const sliderContainer = createMockSliderElement('div');
    sliderContainer.ownerDocument = global.document;

    createSlider(sliderContainer, {
      start: [0, 10],
      connect: true,
      range: { min: 0, max: 10 }
    });

    const impactDuration = 0.15; // 150 ms (ex: impact de balle de tennis)
    sliderContainer.noUiSlider.updateOptions({
      range: { min: 0, max: impactDuration },
      start: [0, impactDuration],
      margin: null
    });

    sliderContainer.noUiSlider.set([0.02, 0.12]);
    const values = sliderContainer.noUiSlider.get();
    assert.equal(parseFloat(values[0]), 0.02);
    assert.equal(parseFloat(values[1]), 0.12);
  });

  it('doit calculer correctement updateSize() pour une vidéo courte (< 1s) avec réduction de durée', () => {
    // Simulation de la logique de updateSize() dans extractor.js
    const videoState = {
      height: 1080,
      width: 1920,
      fps: 60,
      duration: 0.4, // 400 ms
      size: 0,
      sizeThreshold: 512
    };

    const calculateSize = ({ defChecked, fpsChecked, durationChecked, startVal, endVal }) => {
      const h = defChecked ? videoState.height / 2 : videoState.height;
      const w = defChecked ? videoState.width / 2 : videoState.width;
      const fps = fpsChecked ? videoState.fps / 2 : videoState.fps;
      const duration = durationChecked
        ? Math.max(0, parseFloat(endVal) - parseFloat(startVal))
        : videoState.duration;
      const nb = duration * fps;
      const estimatedBytesPerPixel = 0.5;
      return Math.ceil(h * w * estimatedBytesPerPixel * nb / (1024 * 1024));
    };

    // Sans réduction de durée : 0.4s à 60 fps = 24 images
    const sizeFull = calculateSize({
      defChecked: false,
      fpsChecked: false,
      durationChecked: false,
      startVal: '0',
      endVal: '0.4'
    });
    assert.ok(sizeFull > 0);

    // Avec réduction de durée : rogner de 0.1s à 0.3s (durée = 0.2s, soit 12 images)
    const sizeTrimmed = calculateSize({
      defChecked: false,
      fpsChecked: false,
      durationChecked: true,
      startVal: '0.1',
      endVal: '0.3'
    });
    assert.equal(sizeTrimmed, Math.ceil(sizeFull / 2), 'La taille estimée doit être divisée par 2 pour une durée divisée par 2');

    // Cas limite : inversion start > end protégé par Math.max(0, ...)
    const sizeInverted = calculateSize({
      defChecked: false,
      fpsChecked: false,
      durationChecked: true,
      startVal: '0.3',
      endVal: '0.1'
    });
    assert.equal(sizeInverted, 0, 'Une durée inversée ou nulle donne une taille de 0 sans propager de valeur négative');
  });
});

