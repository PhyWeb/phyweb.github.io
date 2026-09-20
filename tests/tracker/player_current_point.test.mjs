import '../helpers/setup.mjs';
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import PLAYER from '../../tracker/modules/player.js';
import MEASUREMENT from '../../tracker/modules/measurement.js';

describe('Tracker - Synchronisation de currentPoint (clearRow, clearTable, setPointPerFrame)', () => {
  let measurement;
  let player;
  let tableHeadMock;
  let tableBodyMock;
  let originalQSOverride;
  let originalCreateElementOverride;

  const createMockTableHead = () => ({
    _innerHTML: '',
    children: [],
    get innerHTML() { return this._innerHTML; },
    set innerHTML(val) {
      this._innerHTML = val;
      if (val === '') this.children = [];
    },
    appendChild(child) {
      this.children.push(child);
    }
  });

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
    appendChild(child) {
      this.children.push(child);
    },
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
    originalQSOverride = global.__querySelectorOverride;
    originalCreateElementOverride = global.__createElementOverride;

    tableHeadMock = createMockTableHead();
    tableBodyMock = createMockElement('tbody');

    global.__createElementOverride = (tag) => createMockElement(tag);
    global.__querySelectorOverride = (sel) => {
      if (sel === '#table-head') return tableHeadMock;
      if (sel === '#table-body') return tableBodyMock;
      return createMockElement();
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

  afterEach(() => {
    global.__querySelectorOverride = originalQSOverride;
    global.__createElementOverride = originalCreateElementOverride;
  });

  it('doit réinitialiser currentPoint à 0 lors de clearRow quand ppf = 2 et ne pas sauter à l\'image suivante', () => {
    measurement.setPointPerFrame(2, player);

    assert.equal(player.currentFrame, 0);
    assert.equal(player.currentPoint, 0);

    // 1. Clic sur le point 1 (image 0)
    player.onClick({ clientX: 20, clientY: 20 });

    assert.equal(player.currentFrame, 0, 'Doit rester sur l\'image 0 en attendant le point 2');
    assert.equal(player.currentPoint, 1, 'currentPoint doit être incrémenté à 1');
    assert.notEqual(measurement.series[1][0], '', 'x1 doit être renseigné');
    assert.notEqual(measurement.series[2][0], '', 'y1 doit être renseigné');
    assert.equal(measurement.series[3][0], '', 'x2 doit être vide');

    // 2. L'utilisateur clique sur « Vider la ligne »
    measurement.clearRow(player.currentFrame);
    player.drawFrame(player.currentFrame);

    // Vérification de la réinitialisation
    assert.equal(player.currentPoint, 0, 'currentPoint doit être remis à 0 après clearRow');
    assert.equal(measurement.series[1][0], '', 'x1 doit être vidé');
    assert.equal(measurement.series[2][0], '', 'y1 doit être vidé');
    assert.equal(measurement.series[3][0], '', 'x2 doit être vidé');

    // 3. Clic suivant sur le canvas : doit repointer le point 1 (et non le point 2 !)
    player.onClick({ clientX: 30, clientY: 30 });

    assert.equal(player.currentFrame, 0, 'La vidéo ne doit PAS avancer à l\'image suivante');
    assert.equal(player.currentPoint, 1, 'currentPoint passe à 1 en attendant le point 2');
    assert.notEqual(measurement.series[1][0], '', 'x1 (point 1) doit contenir la nouvelle valeur');
    assert.notEqual(measurement.series[2][0], '', 'y1 (point 1) doit contenir la nouvelle valeur');
    assert.equal(measurement.series[3][0], '', 'x2 (point 2) doit rester vide !');
    assert.equal(measurement.series[4][0], '', 'y2 (point 2) doit rester vide !');
  });

  it('doit réinitialiser currentPoint à 0 avec 3 points par image (ppf = 3) après pointage partiel', () => {
    measurement.setPointPerFrame(3, player);

    // Point 1
    player.onClick({ clientX: 10, clientY: 10 });
    assert.equal(player.currentPoint, 1);

    // Point 2
    player.onClick({ clientX: 20, clientY: 20 });
    assert.equal(player.currentPoint, 2);
    assert.equal(player.currentFrame, 0);

    // Vider la ligne
    measurement.clearRow(player.currentFrame);
    assert.equal(player.currentPoint, 0, 'currentPoint doit être remis à 0');

    // Clic suivant -> point 1
    player.onClick({ clientX: 15, clientY: 15 });
    assert.equal(player.currentPoint, 1);
    assert.equal(player.currentFrame, 0);
    assert.notEqual(measurement.series[1][0], '', 'x1 doit être rempli');
    assert.equal(measurement.series[3][0], '', 'x2 doit être vide');
    assert.equal(measurement.series[5][0], '', 'x3 doit être vide');
  });

  it('doit réinitialiser currentPoint à 0 lors de clearTable()', () => {
    measurement.setPointPerFrame(2, player);

    // Point 1
    player.onClick({ clientX: 25, clientY: 25 });
    assert.equal(player.currentPoint, 1);

    // Vider tout le tableau
    measurement.clearTable();
    assert.equal(player.currentPoint, 0, 'currentPoint doit être remis à 0 après clearTable()');

    // Clic suivant -> point 1
    player.onClick({ clientX: 35, clientY: 35 });
    assert.equal(player.currentPoint, 1);
    assert.equal(player.currentFrame, 0);
    assert.notEqual(measurement.series[1][0], '', 'x1 doit être rempli');
    assert.equal(measurement.series[3][0], '', 'x2 doit être vide');
  });

  it('doit réinitialiser currentPoint à 0 lors du changement de points par image (setPointPerFrame)', () => {
    measurement.setPointPerFrame(2, player);

    // Pointer le point 1
    player.onClick({ clientX: 20, clientY: 20 });
    assert.equal(player.currentPoint, 1);

    // Réduction du nombre de points par image à 1
    measurement.setPointPerFrame(1, player);
    assert.equal(player.currentPoint, 0, 'currentPoint doit être réinitialisé à 0 pour éviter tout dépassement d\'indice');

    // Le clic suivant ne doit pas planter et doit enregistrer le point unique puis avancer
    player.onClick({ clientX: 40, clientY: 40 });
    assert.equal(player.currentFrame, 1, 'Avec ppf = 1, le clic valide la frame et passe à la suivante');
  });

  it('doit réinitialiser currentPoint via la méthode player.clearRow()', () => {
    measurement.setPointPerFrame(2, player);

    player.onClick({ clientX: 12, clientY: 34 });
    assert.equal(player.currentPoint, 1);

    player.clearRow();
    assert.equal(player.currentPoint, 0);
    assert.equal(measurement.series[1][0], '');
    assert.equal(measurement.series[2][0], '');

    // Pointage suivant
    player.onClick({ clientX: 56, clientY: 78 });
    assert.equal(player.currentPoint, 1);
    assert.equal(player.currentFrame, 0);
    assert.notEqual(measurement.series[1][0], '');
  });

  it('doit réinitialiser currentPoint avec player.resetCurrentPoint()', () => {
    player.currentPoint = 2;
    player.resetCurrentPoint();
    assert.equal(player.currentPoint, 0);
  });
});

