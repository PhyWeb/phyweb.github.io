import '../helpers/setup.mjs';
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import PLAYER from '../../tracker/modules/player.js';
import MEASUREMENT from '../../tracker/modules/measurement.js';

describe('Tracker - Loupe (drawMagnifier) sans VideoFrame et sécurité dimensions', () => {
  let player;
  let measurement;
  let drawImageCalls;

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
    moveTo: () => {},
    lineTo: () => {},
    stroke: () => {},
    fill: () => {}
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
    // S'assurer qu'aucun mock global résiduel ne persiste
    delete globalThis.VideoFrame;
  });

  it('ne doit pas faire appel à new VideoFrame lors de drawMagnifier', () => {
    // Si globalThis.VideoFrame est défini, on s'assure qu'il n'est jamais instancié
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

  it('doit dessiner directement le canvas source dans le contexte 2D', () => {
    player.magnifier = true;
    player.point = { x: 100, y: 100 };
    player.distPoint = { x: -0.2, y: -0.2 };

    player.drawMagnifier(0);

    assert.equal(drawImageCalls.length, 1);
    const [sourceImage, dx, dy, dw, dh] = drawImageCalls[0];
    assert.equal(sourceImage, player.videoCanvas, 'La source passée à drawImage doit être this.videoCanvas');
    assert.equal(dw, 640 * 2, 'La largeur dessinée doit être doublée (power 2)');
    assert.equal(dh, 480 * 2, 'La hauteur dessinée doit être doublée (power 2)');
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

    // 1 appel pour le dessin de la frame vidéo de base + 1 appel pour la loupe
    assert.equal(drawImageCalls.length, 2);
    assert.equal(drawImageCalls[0][0], player.decodedVideo.frames[0]);
    assert.equal(drawImageCalls[1][0], player.videoCanvas);
  });

  it('ne doit pas appeler drawMagnifier dans drawFrame lorsque la loupe est inactive', () => {
    player.magnifier = false;
    player.drawFrame(0);

    assert.equal(drawImageCalls.length, 1);
    assert.equal(drawImageCalls[0][0], player.decodedVideo.frames[0]);
  });
});

