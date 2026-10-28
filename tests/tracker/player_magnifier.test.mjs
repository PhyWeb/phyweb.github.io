import '../helpers/setup.mjs';
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import PLAYER from '../../tracker/modules/player.js';
import MEASUREMENT from '../../tracker/modules/measurement.js';

describe('Tracker - Loupe vectorielle (drawMagnifier) et croix nettes (drawCrosses)', () => {
  let player;
  let measurement;
  let drawImageCalls;
  let translateCalls;
  let scaleCalls;
  let strokeCalls;
  let lineToCalls;
  let moveToCalls;

  const mockCtx = {
    clearRect: () => {},
    drawImage: (...args) => {
      drawImageCalls.push(args);
    },
    save: () => {},
    restore: () => {},
    beginPath: () => {},
    closePath: () => {},
    arc: () => {},
    clip: () => {},
    moveTo: (...args) => {
      moveToCalls.push(args);
    },
    lineTo: (...args) => {
      lineToCalls.push(args);
    },
    stroke: () => {
      strokeCalls.push({
        strokeStyle: mockCtx.strokeStyle,
        lineWidth: mockCtx.lineWidth,
        lineCap: mockCtx.lineCap,
        globalAlpha: mockCtx.globalAlpha
      });
    },
    fill: () => {},
    translate: (...args) => {
      translateCalls.push(args);
    },
    scale: (...args) => {
      scaleCalls.push(args);
    },
    strokeStyle: '',
    lineWidth: 1,
    lineCap: 'butt',
    globalAlpha: 1.0,
    shadowBlur: 0,
    shadowColor: '',
    shadowOffsetX: 0,
    shadowOffsetY: 0
  };

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
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 640, height: 480 })
  });

  beforeEach(() => {
    drawImageCalls = [];
    translateCalls = [];
    scaleCalls = [];
    strokeCalls = [];
    moveToCalls = [];
    lineToCalls = [];

    mockCtx.strokeStyle = '';
    mockCtx.lineWidth = 1;
    mockCtx.lineCap = 'butt';
    mockCtx.globalAlpha = 1.0;
    mockCtx.shadowBlur = 0;
    mockCtx.shadowColor = '';

    const mockCanvas = {
      tagName: 'canvas',
      width: 640,
      height: 480,
      style: {},
      getContext: () => mockCtx,
      addEventListener: () => {},
      removeEventListener: () => {},
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 640, height: 480 })
    };

    const mockContainer = createMockElement('div');
    measurement = new MEASUREMENT();
    measurement.series = [[0, 1], [0.5, 0.6], [0.5, 0.6]];
    measurement.originFrame = 0;
    measurement.scale = {
      origin: { x: 0, y: 0, type: 'bottomleft' },
      scaleSegment: { x1: null, y1: null, x2: null, y2: null },
      isCalibrated: false,
      getOrientedScaleX: () => 1,
      getOrientedScaleY: () => 1
    };

    player = new PLAYER(mockContainer, mockCanvas, measurement, {});
    player.decodedVideo = {
      frames: [createMockElement('img')],
      timestamps: [0, 0.033],
      width: 640,
      height: 480,
      duration: 1
    };
  });

  afterEach(() => {
    delete globalThis.VideoFrame;
  });

  it('ne doit pas faire appel à new VideoFrame lors de drawMagnifier', () => {
    let videoFrameInstantiated = false;
    globalThis.VideoFrame = class {
      constructor() {
        videoFrameInstantiated = true;
        throw new Error('VideoFrame ne doit pas être appelé !');
      }
    };

    player.magnifier = true;
    player.point = { x: 320, y: 240 };
    player.distPoint = { x: 0, y: 0 };

    assert.doesNotThrow(() => {
      player.drawMagnifier(0);
    });

    assert.equal(videoFrameInstantiated, false, 'VideoFrame ne doit pas être instancié');
  });

  it('doit appliquer la transformation matricielle (translate + scale) et dessiner la frame vidéo brute', () => {
    player.magnifier = true;
    player.point = { x: 100, y: 100 };
    player.distPoint = { x: -0.2, y: -0.2 };

    let drawOriginCalled = false;
    let drawCrossesScale = null;
    player.drawOrigin = () => { drawOriginCalled = true; };
    player.drawCrosses = (s) => { drawCrossesScale = s; };

    player.drawMagnifier(0);

    assert.equal(translateCalls.length, 1, 'translate doit être appelé 1 fois');
    assert.equal(scaleCalls.length, 1, 'scale doit être appelé 1 fois');
    assert.deepEqual(scaleCalls[0], [2, 2], 'scale doit valoir (magnifierPower, magnifierPower) soit (2, 2)');

    assert.equal(drawImageCalls.length, 1);
    const [sourceImage, dx, dy, dw, dh] = drawImageCalls[0];
    assert.equal(sourceImage, player.decodedVideo.frames[0], 'La source dessinée doit être la frame brute');
    assert.equal(dx, 0);
    assert.equal(dy, 0);
    assert.equal(dw, 640);
    assert.equal(dh, 480);

    assert.equal(drawOriginCalled, true, 'drawOrigin doit être appelé dans la loupe');
    assert.equal(drawCrossesScale, 2, 'drawCrosses doit être appelé avec magnifierPower (2)');
  });

  it('ne doit rien dessiner et ne pas crasher si les dimensions du canvas sont nulles (width = 0 ou height = 0)', () => {
    player.videoCanvas.width = 0;
    player.videoCanvas.height = 0;
    player.magnifier = true;

    assert.doesNotThrow(() => {
      player.drawMagnifier(0);
    });

    assert.equal(drawImageCalls.length, 0, 'drawImage ne doit pas être appelé si les dimensions sont nulles');
  });

  it('doit appeler drawMagnifier dans drawFrame lorsque la loupe est active', () => {
    player.magnifier = true;
    player.point = { x: 320, y: 240 };
    player.distPoint = { x: 0, y: 0 };

    player.drawFrame(0);

    // 1 appel pour le dessin de la frame vidéo de base + 1 appel dans drawMagnifier
    assert.equal(drawImageCalls.length, 2);
    assert.equal(drawImageCalls[0][0], player.decodedVideo.frames[0]);
    assert.equal(drawImageCalls[1][0], player.decodedVideo.frames[0]);
  });

  it('ne doit pas appeler drawMagnifier dans drawFrame lorsque la loupe est inactive', () => {
    player.magnifier = false;
    player.drawFrame(0);

    assert.equal(drawImageCalls.length, 1);
    assert.equal(drawImageCalls[0][0], player.decodedVideo.frames[0]);
  });

  it('drawCrosses(1) doit dessiner le point courant en mire mise en évidence (Passe 2)', () => {
    // 1 point à l'image 0 : maxPoints = 1
    measurement.series = [[0], [0.5], [0.25]];
    measurement.originFrame = 0;
    player.currentFrame = 0;

    player.drawCrosses();

    assert.equal(mockCtx.lineCap, 'round', 'lineCap doit être round');
    assert.equal(mockCtx.shadowBlur, 0, 'shadowBlur ne doit pas être utilisé (flou supprimé)');

    // Pour 1 point courant, pas de croix normale (Passe 1 vide), uniquement la croix mise en évidence (2 strokes : contour puis cœur)
    assert.equal(strokeCalls.length, 2);
    // 1er tracé : contour noir plus franc
    assert.equal(strokeCalls[0].strokeStyle, 'rgba(0, 0, 0, 0.95)');
    assert.equal(strokeCalls[0].lineWidth, 4);
    assert.equal(strokeCalls[0].globalAlpha, 1.0);
    // 2e tracé : cœur cyan contrastant pour 1 point
    assert.equal(strokeCalls[1].strokeStyle, '#00ffcc');
    assert.equal(strokeCalls[1].lineWidth, 2);
    assert.equal(strokeCalls[1].globalAlpha, 1.0);

    // Vérification de la mire (activeSize = 7, gap = 2, centre dégagé) :
    // x = Math.round(640 * 0.5) + 0.5 = 320.5
    // y = Math.round(480 * 0.25) + 0.5 = 120.5
    // Segment 1 (gauche) : x - activeSize (313.5) à x - gap (318.5) à y (120.5)
    // Segment 2 (droite) : x + gap (322.5) à x + activeSize (327.5) à y (120.5)
    // Segment 3 (haut)   : y - activeSize (113.5) à y - gap (118.5) à x (320.5)
    // Segment 4 (bas)    : y + gap (122.5) à y + activeSize (127.5) à x (320.5)
    assert.deepEqual(moveToCalls[0], [313.5, 120.5]);
    assert.deepEqual(lineToCalls[0], [318.5, 120.5]);
    assert.deepEqual(moveToCalls[1], [322.5, 120.5]);
    assert.deepEqual(lineToCalls[1], [327.5, 120.5]);
    assert.deepEqual(moveToCalls[2], [320.5, 113.5]);
    assert.deepEqual(lineToCalls[2], [320.5, 118.5]);
    assert.deepEqual(moveToCalls[3], [320.5, 122.5]);
    assert.deepEqual(lineToCalls[3], [320.5, 127.5]);
  });

  it('drawCrosses sépare correctement Passe 1 (croix normales compactes) et Passe 2 (mire)', () => {
    // 2 images : image 0 (normale) et image 1 (courante / mire)
    measurement.series = [
      [0, 1],
      [0.2, 0.5],
      [0.2, 0.5]
    ];
    measurement.originFrame = 0;
    player.currentFrame = 1;

    player.drawCrosses();

    // 2 passes = 4 strokes au total
    assert.equal(strokeCalls.length, 4);

    // Passe 1 : croix normale (image 0) avec transparence 0.65 et taille normale 4
    assert.equal(strokeCalls[0].strokeStyle, 'rgba(0, 0, 0, 0.85)');
    assert.equal(strokeCalls[0].lineWidth, 3);
    assert.equal(strokeCalls[0].globalAlpha, 0.65);

    assert.equal(strokeCalls[1].strokeStyle, '#ffffff');
    assert.equal(strokeCalls[1].lineWidth, 1.5);
    assert.equal(strokeCalls[1].globalAlpha, 0.65);

    // Passe 2 : mire (image 1) avec opacité 1.0
    assert.equal(strokeCalls[2].strokeStyle, 'rgba(0, 0, 0, 0.95)');
    assert.equal(strokeCalls[2].lineWidth, 4);
    assert.equal(strokeCalls[2].globalAlpha, 1.0);

    assert.equal(strokeCalls[3].strokeStyle, '#00ffcc');
    assert.equal(strokeCalls[3].lineWidth, 2);
    assert.equal(strokeCalls[3].globalAlpha, 1.0);
  });

  it('drawCrosses recherche en arrière le dernier point posé si l\'image courante n\'a pas de point', () => {
    // Images 0, 1, 2 : image 0 a un point, image 1 et 2 n'en ont pas
    measurement.series = [
      [0, 1, 2],
      [0.4, '', ''],
      [0.4, '', '']
    ];
    measurement.originFrame = 0;
    player.currentFrame = 2; // À l'image 2, aucun point posé

    player.drawCrosses();

    // Doit avoir reculé jusqu'à l'image 0 pour mettre en évidence ce dernier point
    assert.equal(strokeCalls.length, 2); // Uniquement Passe 2 (aucun autre point normal)
    assert.equal(strokeCalls[0].strokeStyle, 'rgba(0, 0, 0, 0.95)');
    assert.equal(strokeCalls[0].lineWidth, 4);
    assert.equal(strokeCalls[1].strokeStyle, '#00ffcc');
    assert.equal(strokeCalls[1].lineWidth, 2);
  });

  it('drawCrosses(scale) adapte lineWidth et dimensions en fonction du facteur d\'échelle de la loupe', () => {
    // 2 images : 0 (normale) et 1 (mire)
    measurement.series = [
      [0, 1],
      [0.2, 0.8],
      [0.2, 0.8]
    ];
    measurement.originFrame = 0;
    player.currentFrame = 1;

    const scale = 2; // magnifierPower = 2
    player.drawCrosses(scale);

    assert.equal(strokeCalls.length, 4);

    // Passe 1 : contour lineWidth = 3 / 2 = 1.5, cœur = 1.5 / 2 = 0.75
    assert.equal(strokeCalls[0].lineWidth, 3 / scale);
    assert.equal(strokeCalls[1].lineWidth, 1.5 / scale);

    // Passe 2 : contour lineWidth = 4 / 2 = 2, cœur = 2 / 2 = 1
    assert.equal(strokeCalls[2].lineWidth, 4 / scale);
    assert.equal(strokeCalls[3].lineWidth, 2 / scale);
  });

  it('drawCrosses supporte plusieurs séries de points (maxPoints > 1)', () => {
    // 2 séries de points
    measurement.series = [
      [0],
      [0.3], [0.3], // Série 0
      [0.7], [0.7]  // Série 1
    ];
    measurement.originFrame = 0;
    player.currentFrame = 0;

    player.drawCrosses();

    // 2 séries, chacune avec sa mire (2 strokes par série = 4 strokes)
    assert.equal(strokeCalls.length, 4);

    // Série 0 : couleur vive CROSS_COLORS[0] = '#ff4d4d'
    assert.equal(strokeCalls[0].strokeStyle, 'rgba(0, 0, 0, 0.95)');
    assert.equal(strokeCalls[1].strokeStyle, '#ff4d4d');

    // Série 1 : couleur vive CROSS_COLORS[1] = '#4da6ff'
    assert.equal(strokeCalls[2].strokeStyle, 'rgba(0, 0, 0, 0.95)');
    assert.equal(strokeCalls[3].strokeStyle, '#4da6ff');
  });
});

