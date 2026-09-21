import '../helpers/setup.mjs';
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import PLAYER from '../../tracker/modules/player.js';
import MEASUREMENT from '../../tracker/modules/measurement.js';

describe('Tracker - Précision des coordonnées sur écrans HiDPI et Zoom navigateur', () => {
  let measurement;
  let player;
  let mockCanvas;
  let mockContainer;
  let originalQSOverride;
  let originalCreateElementOverride;
  let arcCalls;
  let currentRect;

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
    getBoundingClientRect: () => currentRect
  });

  const mockCtx = {
    clearRect: () => {},
    drawImage: () => {},
    save: () => {},
    restore: () => {},
    beginPath: () => {},
    closePath: () => {},
    arc: (...args) => {
      arcCalls.push(args);
    },
    clip: () => {},
    moveTo: () => {},
    lineTo: () => {},
    stroke: () => {},
    fill: () => {}
  };

  beforeEach(() => {
    arcCalls = [];
    currentRect = { left: 50, top: 100, width: 500, height: 250 };

    originalQSOverride = global.__querySelectorOverride;
    originalCreateElementOverride = global.__createElementOverride;

    global.__createElementOverride = (tag) => createMockElement(tag);
    global.__querySelectorOverride = () => createMockElement();

    mockCanvas = {
      getContext: () => mockCtx,
      addEventListener: () => {},
      removeEventListener: () => {},
      getBoundingClientRect: () => currentRect,
      width: 1000,
      height: 500,
      style: {}
    };

    mockContainer = createMockElement('div');
    measurement = new MEASUREMENT();
    player = new PLAYER(mockContainer, mockCanvas, measurement, {});

    const mockDecodedVideo = {
      width: 1000,
      height: 500,
      duration: 1000,
      frames: [{ src: 'blob:frame0' }, { src: 'blob:frame1' }],
      timestamps: [0.0, 0.0333]
    };

    measurement.init(mockDecodedVideo, player);
    player.decodedVideo = mockDecodedVideo;
  });

  afterEach(() => {
    global.__querySelectorOverride = originalQSOverride;
    global.__createElementOverride = originalCreateElementOverride;
  });

  it('getCanvasCoordinates doit calculer des coordonnées normalisées et tampon exactes lors d\'un zoom 50% (rect.width < canvas.width)', () => {
    // Canvas buffer : 1000x500
    // Affichage CSS (zoom 50%) : rect.left = 50, rect.top = 100, width = 500, height = 250
    // Clic au centre de l'élément à l'écran : clientX = 50 + 250 = 300, clientY = 100 + 125 = 225
    const ev = { clientX: 300, clientY: 225 };
    const coords = player.getCanvasCoordinates(ev);

    assert.equal(coords.distPoint.x, 0, 'distPoint.x doit être exactement 0 au centre');
    assert.equal(coords.distPoint.y, 0, 'distPoint.y doit être exactement 0 au centre');
    assert.equal(coords.point.x, 500, 'point.x doit être 500 (tampon interne canvas)');
    assert.equal(coords.point.y, 250, 'point.y doit être 250 (tampon interne canvas)');
  });

  it('getCanvasCoordinates doit calculer des coordonnées exactes au coin inférieur droit lors d\'un zoom 50%', () => {
    // Clic au bord inférieur droit : clientX = 50 + 500 = 550, clientY = 100 + 250 = 350
    const ev = { clientX: 550, clientY: 350 };
    const coords = player.getCanvasCoordinates(ev);

    assert.equal(coords.distPoint.x, 0.5, 'distPoint.x doit être 0.5 au bord droit');
    assert.equal(coords.distPoint.y, 0.5, 'distPoint.y doit être 0.5 au bord bas');
    assert.equal(coords.point.x, 1000, 'point.x doit correspondre à videoCanvas.width');
    assert.equal(coords.point.y, 500, 'point.y doit correspondre à videoCanvas.height');
  });

  it('getCanvasCoordinates doit calculer des coordonnées exactes lors d\'un zoom 150% (rect.width > canvas.width)', () => {
    // Zoom 150% : rect width = 1500, height = 750
    currentRect = { left: 0, top: 0, width: 1500, height: 750 };

    // Clic au centre à l'écran (750, 375)
    const ev = { clientX: 750, clientY: 375 };
    const coords = player.getCanvasCoordinates(ev);

    assert.equal(coords.distPoint.x, 0);
    assert.equal(coords.distPoint.y, 0);
    assert.equal(coords.point.x, 500);
    assert.equal(coords.point.y, 250);
  });

  it('onClick doit enregistrer (0.5, 0.5) lors d\'un clic au centre même avec un décalage CSS/zoom', () => {
    // Affichage CSS : 500x250, tampon : 1000x500
    // Clic au centre de l'élément : clientX = 50 + 250, clientY = 100 + 125
    player.onClick({ clientX: 300, clientY: 225 });

    // series[1] est x1, series[2] est y1
    assert.equal(measurement.series[1][0], 0.5, 'x1 doit être 0.5 (au centre)');
    assert.equal(measurement.series[2][0], 0.5, 'y1 doit être 0.5 (au centre)');
  });

  it('onClick doit enregistrer (1.0, 1.0) lors d\'un clic au coin inférieur droit avec zoom', () => {
    player.onClick({ clientX: 550, clientY: 350 });

    assert.equal(measurement.series[1][0], 1.0, 'x1 doit être 1.0 (bord droit)');
    assert.equal(measurement.series[2][0], 1.0, 'y1 doit être 1.0 (bord bas)');
  });

  it('onMouseMove doit mettre à jour this.point en coordonnées tampon pour drawMagnifier', () => {
    player.magnifier = true;
    // Curseur au centre : clientX = 300, clientY = 225
    player.onMouseMove({ clientX: 300, clientY: 225 });

    assert.equal(player.point.x, 500, 'player.point.x doit être en pixels de tampon (500)');
    assert.equal(player.point.y, 250, 'player.point.y doit être en pixels de tampon (250)');
    assert.equal(player.distPoint.x, 0);
    assert.equal(player.distPoint.y, 0);

    // onMouseMove redessine automatiquement si this.magnifier === true
    assert.equal(arcCalls.length, 1, 'drawMagnifier doit être appelé lors du onMouseMove avec loupe active');
    const [arcX, arcY] = arcCalls[0];
    assert.equal(arcX, 500, 'Le cercle de loupe doit être centré à x=500 dans le tampon');
    assert.equal(arcY, 250, 'Le cercle de loupe doit être centré à y=250 dans le tampon');
  });

  it('onOriginClick doit positionner l\'origine au centre sans décalage de zoom', () => {
    player.originFlag = 'bottomleft';
    player.onOriginClick({ clientX: 300, clientY: 225 });

    assert.equal(measurement.scale.origin.x, 0.5, 'Origine X doit valoir 0.5');
    assert.equal(measurement.scale.origin.y, 0.5, 'Origine Y doit valoir 0.5');
  });

  it('onScaleClick doit positionner les extrémités du segment d\'étalonnage sans décalage', () => {
    // Premier clic : coin supérieur gauche (clientX = 50, clientY = 100) -> (0, 0)
    player.onScaleClick({ clientX: 50, clientY: 100 });
    assert.equal(player.segment.x1, 0);
    assert.equal(player.segment.y1, 0);

    // Deuxième clic : centre (clientX = 300, clientY = 225) -> (0.5, 0.5)
    player.onScaleClick({ clientX: 300, clientY: 225 });
    assert.equal(measurement.scale.scaleSegment.x1, 0);
    assert.equal(measurement.scale.scaleSegment.y1, 0);
    assert.equal(measurement.scale.scaleSegment.x2, 0.5);
    assert.equal(measurement.scale.scaleSegment.y2, 0.5);
  });

  it('getCanvasCoordinates doit gérer avec sécurité des dimensions rect nulles ou absentes', () => {
    currentRect = { left: 0, top: 0, width: 0, height: 0 };
    const coords = player.getCanvasCoordinates({ clientX: 100, clientY: 50 });

    assert.ok(Number.isFinite(coords.distPoint.x), 'distPoint.x ne doit pas être NaN ni Infini');
    assert.ok(Number.isFinite(coords.distPoint.y), 'distPoint.y ne doit pas être NaN ni Infini');
    assert.ok(Number.isFinite(coords.point.x), 'point.x ne doit pas être NaN ni Infini');
    assert.ok(Number.isFinite(coords.point.y), 'point.y ne doit pas être NaN ni Infini');
  });
});
