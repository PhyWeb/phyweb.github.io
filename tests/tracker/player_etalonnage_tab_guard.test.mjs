import '../helpers/setup.mjs';
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import PLAYER from '../../tracker/modules/player.js';
import MEASUREMENT from '../../tracker/modules/measurement.js';

describe('Tracker - Guard onglet Étalonnage dans player.onClick', () => {
  let measurement;
  let player;
  let etalonnageButtonMock;
  let toastContainerMock;
  let originalQSOverride;
  let originalCreateElementOverride;
  let createdToasts;

  const createMockElement = (tag = 'div') => {
    const classes = new Set();
    return {
      tagName: tag,
      value: '',
      innerHTML: '',
      children: [],
      style: {},
      classList: {
        add: (...cls) => cls.forEach(c => classes.add(c)),
        remove: (...cls) => cls.forEach(c => classes.delete(c)),
        toggle: (c) => (classes.has(c) ? classes.delete(c) : classes.add(c)),
        contains: (c) => classes.has(c)
      },
      addEventListener: () => {},
      removeEventListener: () => {},
      appendChild: function(child) {
        this.children.push(child);
      },
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
    createdToasts = [];
    etalonnageButtonMock = createMockElement('li');
    toastContainerMock = createMockElement('div');
    toastContainerMock.className = 'toast-container';

    originalQSOverride = global.__querySelectorOverride;
    originalCreateElementOverride = global.__createElementOverride;

    global.__querySelectorOverride = (sel) => {
      if (sel === '#etalonnage-button') return etalonnageButtonMock;
      if (sel === '.toast-container') return toastContainerMock;
      return createMockElement();
    };

    global.__createElementOverride = (tag) => {
      const el = createMockElement(tag);
      if (tag === 'div') {
        createdToasts.push(el);
      }
      return el;
    };

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
    player.pauseFlag = true; // Player en pause

    const mockDecodedVideo = {
      width: 100,
      height: 100,
      duration: 1000,
      frames: [{ src: 'blob:frame0' }, { src: 'blob:frame1' }, { src: 'blob:frame2' }],
      timestamps: [0.0, 0.0333, 0.0667]
    };

    measurement.init(mockDecodedVideo, player);
    player.decodedVideo = mockDecodedVideo;
  });

  it('bloque le clic sur la vidéo et affiche un toast informatif lorsque l\'onglet Étalonnage est actif', () => {
    etalonnageButtonMock.classList.add('is-active');

    assert.equal(player.currentFrame, 0);
    assert.equal(player.currentPoint, 0);

    player.onClick({ clientX: 50, clientY: 50 });

    // Le point ne doit PAS être enregistré
    assert.equal(measurement.series[1][0], '', 'x1 ne doit pas être renseigné');
    assert.equal(measurement.series[2][0], '', 'y1 ne doit pas être renseigné');
    assert.equal(player.currentPoint, 0, 'currentPoint doit rester à 0');
    assert.equal(player.currentFrame, 0, 'currentFrame doit rester à 0');

    // Le toast doit être affiché
    const toast = createdToasts.find(t => t.innerHTML.includes('Passez dans l\'onglet « Mesures » pour pointer les positions.'));
    assert.ok(toast, 'Un toast avec le message attendu doit être créé');
    assert.ok(toast.className.includes('is-info'), 'Le toast doit avoir le type is-info');
  });

  it('autorise le clic et enregistre le point lorsque l\'onglet Étalonnage n\'est pas actif', () => {
    etalonnageButtonMock.classList.remove('is-active');

    assert.equal(player.currentFrame, 0);
    assert.equal(player.currentPoint, 0);

    player.onClick({ clientX: 50, clientY: 50 });

    // Le point DOIT être enregistré et l'image avancer
    assert.notEqual(measurement.series[1][0], '', 'x1 doit être renseigné');
    assert.notEqual(measurement.series[2][0], '', 'y1 doit être renseigné');
    assert.equal(player.currentFrame, 1, 'currentFrame doit avancer à 1 après la validation du point');

    // Aucun toast d'avertissement étalonnage ne doit être affiché
    const toast = createdToasts.find(t => t.innerHTML.includes('Passez dans l\'onglet « Mesures »'));
    assert.equal(toast, undefined, 'Aucun toast ne doit être affiché');
  });

  it('ne fait rien (ni toast ni point) si la vidéo est en cours de lecture (pauseFlag === false)', () => {
    etalonnageButtonMock.classList.add('is-active');
    player.pauseFlag = false; // en lecture

    player.onClick({ clientX: 50, clientY: 50 });

    assert.equal(measurement.series[1][0], '');
    assert.equal(player.currentFrame, 0);
    const toast = createdToasts.find(t => t.innerHTML.includes('Passez dans l\'onglet « Mesures »'));
    assert.equal(toast, undefined, 'Aucun toast ne doit être affiché si pauseFlag === false');
  });

  it('drawFrame dessine toujours l\'origine et drawOrigin adapte globalAlpha selon l\'onglet actif', () => {
    let drawOriginCalled = 0;
    let drawSegmentCalled = 0;
    player.drawOrigin = () => { drawOriginCalled++; };
    player.drawSegment = () => { drawSegmentCalled++; };
    player.measurement.scale.scaleSegment.x1 = 0.1;

    // 1. En mode Étalonnage
    etalonnageButtonMock.classList.add('is-active');
    player.drawFrame(0);
    assert.equal(drawOriginCalled, 1, 'drawOrigin doit être appelé en mode Étalonnage');
    assert.equal(drawSegmentCalled, 1, 'drawSegment doit être appelé en mode Étalonnage');

    // 2. En mode Mesures (onglet non actif)
    etalonnageButtonMock.classList.remove('is-active');
    player.drawFrame(0);
    assert.equal(drawOriginCalled, 2, 'drawOrigin doit TOUJOURS être appelé même hors de l\'onglet Étalonnage');
    assert.equal(drawSegmentCalled, 1, 'drawSegment ne doit PAS être appelé hors de l\'onglet Étalonnage');
  });

  it('drawOrigin définit globalAlpha à 1.0 en Étalonnage et à 0.65 dans les autres onglets', () => {
    // Restaurer la méthode drawOrigin d'origine
    delete player.drawOrigin;

    // Mode Étalonnage
    etalonnageButtonMock.classList.add('is-active');
    player.drawOrigin();
    assert.equal(player.ctx.globalAlpha, 1.0, 'globalAlpha doit être à 1.0 en mode Étalonnage');

    // Mode Mesures
    etalonnageButtonMock.classList.remove('is-active');
    player.drawOrigin();
    assert.equal(player.ctx.globalAlpha, 0.65, 'globalAlpha doit être à 0.65 hors de l\'onglet Étalonnage');
  });

  it('redessine la frame courante lors du clic sur les onglets si une vidéo est décodée', () => {
    let drawnFrames = [];
    player.drawFrame = (frame) => {
      drawnFrames.push(frame);
    };
    player.currentFrame = 2;

    // Simuler le comportement des écouteurs de clics des boutons d'onglets
    const onTabClick = () => {
      if (player.decodedVideo) player.drawFrame(player.currentFrame);
    };

    onTabClick();
    assert.deepEqual(drawnFrames, [2]);

    player.decodedVideo = null;
    onTabClick();
    assert.deepEqual(drawnFrames, [2], 'Ne doit pas redessiner si aucune vidéo n\'est décodée');
  });
});

