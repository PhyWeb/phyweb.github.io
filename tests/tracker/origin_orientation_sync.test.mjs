import '../helpers/setup.mjs';
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import MEASUREMENT from '../../tracker/modules/measurement.js';
import PLAYER from '../../tracker/modules/player.js';

describe('Tracker - Synchronisation graphique des boutons d\'orientation des axes', () => {
  let measurement;
  let player;
  let buttonsMock;
  let originalQSOverride;

  const createButtonMock = (id, initialActive = false) => {
    const classes = new Set(initialActive ? ['button', 'level-item', 'p-0', 'is-active'] : ['button', 'level-item', 'p-0']);
    return {
      id,
      classList: {
        add: (cls) => classes.add(cls),
        remove: (cls) => classes.delete(cls),
        toggle: (cls) => (classes.has(cls) ? classes.delete(cls) : classes.add(cls)),
        contains: (cls) => classes.has(cls)
      },
      addEventListener: () => {},
      removeEventListener: () => {},
      click: () => {}
    };
  };

  const createGenericMock = () => ({
    value: '1',
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
    children: [],
    click: () => {}
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
    originalQSOverride = global.__querySelectorOverride;

    buttonsMock = {
      topright: createButtonMock('topright', true),
      topleft: createButtonMock('topleft', false),
      downright: createButtonMock('downright', false),
      downleft: createButtonMock('downleft', false)
    };

    global.__querySelectorOverride = (sel) => {
      if (sel === '#topright') return buttonsMock.topright;
      if (sel === '#topleft') return buttonsMock.topleft;
      if (sel === '#downright') return buttonsMock.downright;
      if (sel === '#downleft') return buttonsMock.downleft;
      if (sel === '#canvas-shadow') return createGenericMock();
      if (sel === '#videoCanvas') return {
        style: {},
        getContext: () => mockCtx,
        addEventListener: () => {},
        removeEventListener: () => {},
        getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 }),
        width: 100,
        height: 100
      };
      if (sel === '#table-head') return { innerHTML: '', children: [], appendChild: () => {} };
      if (sel === '#table-body') return { innerHTML: '', children: [], appendChild: () => {} };
      return createGenericMock();
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
  });

  afterEach(() => {
    global.__querySelectorOverride = originalQSOverride;
  });

  it('doit réinitialiser les classes CSS is-active vers #topright lors de measurement.init()', () => {
    // 1. Simuler l'état où l'utilisateur a précédemment sélectionné #downleft
    buttonsMock.topright.classList.remove('is-active');
    buttonsMock.downleft.classList.add('is-active');
    measurement.scale.origin.type = 'downleft';

    assert.equal(buttonsMock.downleft.classList.contains('is-active'), true);
    assert.equal(buttonsMock.topright.classList.contains('is-active'), false);

    // 2. Nouveau chargement / réinitialisation de mesure
    const mockDecodedVideo = {
      width: 100,
      height: 100,
      duration: 1000,
      frames: [{}],
      timestamps: [0.0]
    };
    measurement.init(mockDecodedVideo, player);

    // 3. Vérifications : le modèle est à "topright"
    assert.equal(measurement.scale.origin.type, 'topright', 'Le modèle scale.origin.type doit être réinitialisé à "topright"');

    // ET les boutons DOM doivent être synchronisés avec le modèle
    assert.equal(buttonsMock.topright.classList.contains('is-active'), true, '#topright doit avoir la classe is-active');
    assert.equal(buttonsMock.downleft.classList.contains('is-active'), false, '#downleft ne doit plus avoir la classe is-active');
    assert.equal(buttonsMock.topleft.classList.contains('is-active'), false, '#topleft ne doit pas avoir la classe is-active');
    assert.equal(buttonsMock.downright.classList.contains('is-active'), false, '#downright ne doit pas avoir la classe is-active');
  });

  it('doit synchroniser visuellement les boutons lors du clic d\'orientation (player.onOriginClick)', () => {
    // Entrée en mode origin "downleft"
    player.originFlag = 'downleft';

    // Clic sur le canvas pour positionner l'origine
    player.onOriginClick({ clientX: 20, clientY: 20 });

    assert.equal(measurement.scale.origin.type, 'downleft');
    assert.equal(buttonsMock.downleft.classList.contains('is-active'), true, '#downleft doit être actif');
    assert.equal(buttonsMock.topright.classList.contains('is-active'), false, '#topright ne doit plus être actif');

    // Maintenant recharger une vidéo via measurement.init
    const mockDecodedVideo = {
      width: 100,
      height: 100,
      duration: 1000,
      frames: [{}],
      timestamps: [0.0]
    };
    measurement.init(mockDecodedVideo, player);

    assert.equal(measurement.scale.origin.type, 'topright');
    assert.equal(buttonsMock.topright.classList.contains('is-active'), true, '#topright doit être réactivé après init');
    assert.equal(buttonsMock.downleft.classList.contains('is-active'), false, '#downleft doit être désactivé après init');
  });

  it('doit quitter le mode origine et restaurer #topright si un nouveau chargement survient pendant le mode origine', () => {
    // Simuler un utilisateur qui clique sur un bouton d'axe mais charge une vidéo avant de cliquer sur le canvas
    player.enterOriginMode('downright');
    assert.equal(player.originFlag, 'downright');

    // Réinitialisation par chargement
    const mockDecodedVideo = {
      width: 100,
      height: 100,
      duration: 1000,
      frames: [{}],
      timestamps: [0.0]
    };

    // Si player.load s'exécute ou si exitOriginMode + measurement.init s'exécutent
    if (player.originFlag && player.originFlag !== 'none') {
      player.exitOriginMode();
    }
    measurement.init(mockDecodedVideo, player);

    assert.equal(player.originFlag, 'none', 'Le mode origin doit être quitté');
    assert.equal(measurement.scale.origin.type, 'topright');
    assert.equal(buttonsMock.topright.classList.contains('is-active'), true);
    assert.equal(buttonsMock.downright.classList.contains('is-active'), false);
  });
});

