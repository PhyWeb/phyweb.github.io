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

  it('doit basculer la loupe avec les touches l, L, m, M', () => {
    let toggleCount = 0;
    player.toggleMagnifier = () => { toggleCount++; };

    for (const key of ['l', 'L', 'm', 'M']) {
      const evt = new MockKeyboardEvent('keydown', { key });
      player.handleKeydown(evt);
      assert.strictEqual(evt.defaultPrevented, true, `defaultPrevented doit être true pour ${key}`);
    }
    assert.strictEqual(toggleCount, 4);
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


  describe('Effacement et annulation des points (Delete, Backspace, Ctrl+Z / Cmd+Z)', () => {
    it('doit effacer les points de l\'image courante avec Delete et Backspace', () => {
      measurement.changeValue(2, 0, 0.4, 0.5);
      player.setFrame(2);
      player.currentPoint = 1;

      const evtDelete = new MockKeyboardEvent('keydown', { key: 'Delete' });
      player.handleKeydown(evtDelete);

      assert.strictEqual(evtDelete.defaultPrevented, true);
      assert.strictEqual(measurement.series[1][2], '');
      assert.strictEqual(measurement.series[2][2], '');
      assert.strictEqual(player.currentPoint, 0);

      // Test avec Backspace
      measurement.changeValue(3, 0, 0.6, 0.7);
      player.setFrame(3);
      player.currentPoint = 1;

      const evtBackspace = new MockKeyboardEvent('keydown', { key: 'Backspace' });
      player.handleKeydown(evtBackspace);

      assert.strictEqual(evtBackspace.defaultPrevented, true);
      assert.strictEqual(measurement.series[1][3], '');
      assert.strictEqual(measurement.series[2][3], '');
      assert.strictEqual(player.currentPoint, 0);
    });

    it('doit annuler le dernier point posé sur l\'image courante avec Ctrl+Z (cas multi-points)', () => {
      measurement.setPointPerFrame(2, player);
      player.setFrame(1);

      // Poser point 0 et point 1 sur l'image 1
      measurement.changeValue(1, 0, 0.1, 0.2);
      measurement.changeValue(1, 1, 0.3, 0.4);
      player.currentPoint = 0; // état après pointage complet sur image sans avance

      // Premier Ctrl+Z : annule le point 1 (deuxième point)
      const evtZ1 = new MockKeyboardEvent('keydown', { key: 'z', ctrlKey: true });
      player.handleKeydown(evtZ1);

      assert.strictEqual(evtZ1.defaultPrevented, true);
      assert.strictEqual(measurement.series[1][1], 0.1, 'point 0 conservé');
      assert.strictEqual(measurement.series[3][1], '', 'point 1 effacé');
      assert.strictEqual(player.currentPoint, 1, 'currentPoint ajusté pour repointer le point 1');

      // Deuxième Ctrl+Z : annule le point 0
      const evtZ2 = new MockKeyboardEvent('keydown', { key: 'Z', ctrlKey: true });
      player.handleKeydown(evtZ2);

      assert.strictEqual(evtZ2.defaultPrevented, true);
      assert.strictEqual(measurement.series[1][1], '', 'point 0 effacé');
      assert.strictEqual(player.currentPoint, 0);
    });

    it('doit reculer sur la dernière image pointée et effacer ses points avec Ctrl+Z lors de l\'avancement auto', () => {
      // Image 0 pointée
      measurement.changeValue(0, 0, 0.5, 0.5);
      // L'avancement automatique déplace le lecteur sur l'image 1 (qui est vide)
      player.setFrame(1);
      assert.strictEqual(player.currentFrame, 1);
      assert.strictEqual(measurement.series[1][1], '');

      const evtZ = new MockKeyboardEvent('keydown', { key: 'z', ctrlKey: true });
      player.handleKeydown(evtZ);

      assert.strictEqual(evtZ.defaultPrevented, true);
      assert.strictEqual(player.currentFrame, 0, 'Le lecteur doit être revenu sur l\'image 0');
      assert.strictEqual(measurement.series[1][0], '', 'La ligne de l\'image 0 doit avoir été effacée');
      assert.strictEqual(player.currentPoint, 0);
    });

    it('doit reculer sur l\'image précédente en multi-points et n\'effacer que le dernier point avec Ctrl+Z', () => {
      measurement.setPointPerFrame(2, player);
      // Pointer point 0 et point 1 sur l'image 0
      measurement.changeValue(0, 0, 0.1, 0.2);
      measurement.changeValue(0, 1, 0.3, 0.4);

      // Le lecteur passe sur l'image 1 (qui est vide)
      player.setFrame(1);
      player.currentPoint = 0;

      // Premier Ctrl+Z : doit revenir sur frame 0, n'effacer que le point 1 (lastP = 1), garder point 0
      const evtZ1 = new MockKeyboardEvent('keydown', { key: 'z', ctrlKey: true });
      player.handleKeydown(evtZ1);

      assert.strictEqual(evtZ1.defaultPrevented, true);
      assert.strictEqual(player.currentFrame, 0, 'Le lecteur doit revenir sur l\'image 0');
      assert.strictEqual(measurement.series[1][0], 0.1, 'Le point 0 de l\'image 0 doit être conservé');
      assert.strictEqual(measurement.series[3][0], '', 'Le point 1 de l\'image 0 doit être effacé');
      assert.strictEqual(player.currentPoint, 1, 'currentPoint doit être positionné sur le point 1');

      // Deuxième Ctrl+Z : annule le point 0 (lastP = 0)
      const evtZ2 = new MockKeyboardEvent('keydown', { key: 'z', ctrlKey: true });
      player.handleKeydown(evtZ2);

      assert.strictEqual(evtZ2.defaultPrevented, true);
      assert.strictEqual(player.currentFrame, 0);
      assert.strictEqual(measurement.series[1][0], '', 'Le point 0 doit être effacé');
      assert.strictEqual(player.currentPoint, 0);
    });

    it('doit supporter Cmd+Z (metaKey) sous macOS', () => {
      measurement.changeValue(0, 0, 0.5, 0.5);
      player.setFrame(1);

      const evtMetaZ = new MockKeyboardEvent('keydown', { key: 'z', metaKey: true });
      player.handleKeydown(evtMetaZ);

      assert.strictEqual(evtMetaZ.defaultPrevented, true);
      assert.strictEqual(player.currentFrame, 0);
      assert.strictEqual(measurement.series[1][0], '');
    });

    it('ne doit pas intercepter Ctrl+Shift+Z ni Alt+Z', () => {
      measurement.changeValue(0, 0, 0.5, 0.5);
      player.setFrame(1);

      const evtRedo = new MockKeyboardEvent('keydown', { key: 'z', ctrlKey: true, shiftKey: true });
      player.handleKeydown(evtRedo);
      assert.strictEqual(evtRedo.defaultPrevented, false);
      assert.strictEqual(player.currentFrame, 1);

      const evtAlt = new MockKeyboardEvent('keydown', { key: 'z', altKey: true });
      player.handleKeydown(evtAlt);
      assert.strictEqual(evtAlt.defaultPrevented, false);
      assert.strictEqual(player.currentFrame, 1);
    });

    it('ne doit rien faire avec Ctrl+Z si aucun point n\'a été saisi', () => {
      player.setFrame(3);
      const evtZ = new MockKeyboardEvent('keydown', { key: 'z', ctrlKey: true });
      player.handleKeydown(evtZ);

      assert.strictEqual(evtZ.defaultPrevented, true);
      assert.strictEqual(player.currentFrame, 3);
    });

    it('ne doit pas effacer ou annuler quand l\'utilisateur écrit dans un champ texte', () => {
      measurement.changeValue(0, 0, 0.5, 0.5);
      player.setFrame(0);

      mockActiveElement = { tagName: 'INPUT' };

      const evtDel = new MockKeyboardEvent('keydown', { key: 'Delete' });
      player.handleKeydown(evtDel);
      assert.strictEqual(evtDel.defaultPrevented, false);
      assert.strictEqual(measurement.series[1][0], 0.5);

      const evtBs = new MockKeyboardEvent('keydown', { key: 'Backspace' });
      player.handleKeydown(evtBs);
      assert.strictEqual(evtBs.defaultPrevented, false);
      assert.strictEqual(measurement.series[1][0], 0.5);

      const evtZ = new MockKeyboardEvent('keydown', { key: 'z', ctrlKey: true });
      player.handleKeydown(evtZ);
      assert.strictEqual(evtZ.defaultPrevented, false);
      assert.strictEqual(measurement.series[1][0], 0.5);
    });
  });

});

