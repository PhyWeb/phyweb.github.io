import '../helpers/setup.mjs';
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import PLAYER from '../../tracker/modules/player.js';
import MEASUREMENT from '../../tracker/modules/measurement.js';

describe('Tracker - Boucle de lecture, dérive temporelle et cadences variables (VFR)', () => {
  let measurement;
  let player;
  let currentTime;
  let nextRafId;
  let rafCallbacks;
  let originalPerformanceNow;
  let originalRequestAnimationFrame;
  let originalCancelAnimationFrame;

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

  const advanceTimeAndTick = (deltaMs) => {
    currentTime += deltaMs;
    const callbacks = Array.from(rafCallbacks.entries());
    rafCallbacks.clear();
    for (const [id, cb] of callbacks) {
      cb(currentTime);
    }
  };

  beforeEach(() => {
    currentTime = 1000.0;
    nextRafId = 1;
    rafCallbacks = new Map();

    originalPerformanceNow = global.performance.now;
    originalRequestAnimationFrame = global.requestAnimationFrame;
    originalCancelAnimationFrame = global.cancelAnimationFrame;

    global.performance.now = () => currentTime;
    global.requestAnimationFrame = (cb) => {
      const id = nextRafId++;
      rafCallbacks.set(id, cb);
      return id;
    };
    global.cancelAnimationFrame = (id) => {
      rafCallbacks.delete(id);
    };

    global.__createElementOverride = (tag) => createMockElement(tag);
    global.__querySelectorOverride = (sel) => createMockElement();

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
    global.performance.now = originalPerformanceNow;
    global.requestAnimationFrame = originalRequestAnimationFrame;
    global.cancelAnimationFrame = originalCancelAnimationFrame;
  });

  it('doit lire une vidéo 30 fps sur un écran 60 Hz sans dérive temporelle cumulative', () => {
    // 10 images à 30 fps (durée totale 300 ms, dt = 33.333 ms)
    const frameCount = 10;
    const fps = 30;
    const interval = 1000 / fps;
    const frames = Array.from({ length: frameCount }, (_, i) => ({ src: `blob:frame${i}` }));
    const timestamps = Array.from({ length: frameCount }, (_, i) => (i * interval) / 1000);

    const mockDecodedVideo = {
      width: 100,
      height: 100,
      duration: frameCount * interval,
      frames,
      timestamps
    };

    measurement.init(mockDecodedVideo, player);
    player.decodedVideo = mockDecodedVideo;

    player.play();
    assert.equal(player.pauseFlag, false);
    assert.equal(player.currentFrame, 0);

    // Simulation d'un écran 60 Hz (ticks d'environ 16.667 ms)
    // Tick 1 (+16.67 ms) -> 16.67 ms < 33.33 ms => reste à 0
    advanceTimeAndTick(16.67);
    assert.equal(player.currentFrame, 0);

    // Tick 2 (+16.67 ms -> 33.34 ms total) -> 33.34 ms >= 33.33 ms => image 1
    advanceTimeAndTick(16.67);
    assert.equal(player.currentFrame, 1);

    // Tick 3 (+16.67 ms -> 50.01 ms total) -> 50.01 ms < 66.67 ms => reste à 1
    advanceTimeAndTick(16.67);
    assert.equal(player.currentFrame, 1);

    // Tick 4 (+16.67 ms -> 66.68 ms total) -> 66.68 ms >= 66.67 ms => image 2
    advanceTimeAndTick(16.67);
    assert.equal(player.currentFrame, 2);

    // Tick 5 (+16.67 ms -> 83.35 ms total) -> 83.35 ms < 100.00 ms => reste à 2
    advanceTimeAndTick(16.67);
    assert.equal(player.currentFrame, 2);

    // Tick 6 (+16.67 ms -> 100.02 ms total) -> 100.02 ms >= 100.00 ms => image 3
    advanceTimeAndTick(16.67);
    assert.equal(player.currentFrame, 3);

    // On avance jusqu'à la fin de la vidéo (total 300 ms)
    // 300 ms - 100.02 ms = 199.98 ms (~12 ticks)
    for (let i = 0; i < 12; i++) {
      advanceTimeAndTick(16.67);
    }

    // Doit avoir atteint la dernière image (9) et être en pause
    assert.equal(player.currentFrame, 9);
    assert.equal(player.pauseFlag, true);
  });

  it('doit absorber le jitter de rafraîchissement sans accumuler de décalage', () => {
    // 30 fps (33.33 ms)
    const mockDecodedVideo = {
      width: 100,
      height: 100,
      duration: 333.33,
      frames: Array.from({ length: 5 }, (_, i) => ({ src: `blob:frame${i}` })),
      timestamps: [0.0, 0.03333, 0.06667, 0.10000, 0.13333]
    };

    measurement.init(mockDecodedVideo, player);
    player.decodedVideo = mockDecodedVideo;

    player.play();

    // Tick 1 arrive à 33.20 ms (très légèrement avant 33.33 ms en raison d'un jitter rAF)
    advanceTimeAndTick(33.20);
    assert.equal(player.currentFrame, 0, "L'image ne doit pas avancer avant 33.33 ms");

    // Tick 2 arrive à 50.00 ms total (+16.80 ms)
    advanceTimeAndTick(16.80);
    assert.equal(player.currentFrame, 1, "L'image 1 doit être affichée à 50.00 ms");

    // Tick 3 arrive à 66.70 ms total (+16.70 ms)
    // DANS L'ANCIEN CODE : 66.70 - 50.00 = 16.70 ms < 33.33 ms => l'image 2 n'était pas affichée (dérive cumulative)
    // DANS LE NOUVEAU CODE : le temps cible est 66.70 ms >= 66.67 ms => l'image 2 s'affiche à l'heure !
    advanceTimeAndTick(16.70);
    assert.equal(player.currentFrame, 2, "L'image 2 doit s'afficher à 66.70 ms, sans dérive cumulative");
  });

  it('doit gérer parfaitement les cadences variables (VFR) avec intervalles hétérogènes', () => {
    // Timestamps VFR irréguliers :
    // Frame 0 : 0.000s
    // Frame 1 : 0.015s (15 ms)
    // Frame 2 : 0.060s (45 ms après frame 1)
    // Frame 3 : 0.140s (80 ms après frame 2)
    // Frame 4 : 0.150s (10 ms après frame 3)
    const timestamps = [0.0, 0.015, 0.060, 0.140, 0.150];
    const mockDecodedVideo = {
      width: 100,
      height: 100,
      duration: 150,
      frames: Array.from({ length: 5 }, (_, i) => ({ src: `blob:frame${i}` })),
      timestamps
    };

    measurement.init(mockDecodedVideo, player);
    player.decodedVideo = mockDecodedVideo;

    player.play();

    // À t = 10 ms (< 15 ms) -> Frame 0
    advanceTimeAndTick(10);
    assert.equal(player.currentFrame, 0);

    // À t = 20 ms (>= 15 ms et < 60 ms) -> Frame 1
    advanceTimeAndTick(10);
    assert.equal(player.currentFrame, 1);

    // À t = 40 ms (< 60 ms) -> Frame 1
    advanceTimeAndTick(20);
    assert.equal(player.currentFrame, 1);

    // À t = 65 ms (>= 60 ms et < 140 ms) -> Frame 2
    advanceTimeAndTick(25);
    assert.equal(player.currentFrame, 2);

    // À t = 100 ms (< 140 ms) -> Frame 2
    advanceTimeAndTick(35);
    assert.equal(player.currentFrame, 2);

    // À t = 145 ms (>= 140 ms et < 150 ms) -> Frame 3
    advanceTimeAndTick(45);
    assert.equal(player.currentFrame, 3);

    // À t = 155 ms (>= 150 ms) -> Frame 4 (dernière image, mise en pause)
    advanceTimeAndTick(10);
    assert.equal(player.currentFrame, 4);
    assert.equal(player.pauseFlag, true);
  });

  it('doit traiter les séquences ultra-rapides (< 16.6 ms) sans étirer artificiellement la durée', () => {
    // Vidéo haute vitesse où 3 frames se succèdent en 15 ms (toutes les 5 ms)
    // Frame 0 : 0.000s
    // Frame 1 : 0.005s
    // Frame 2 : 0.010s
    // Frame 3 : 0.015s
    // Frame 4 : 0.080s
    const timestamps = [0.0, 0.005, 0.010, 0.015, 0.080];
    const mockDecodedVideo = {
      width: 100,
      height: 100,
      duration: 80,
      frames: Array.from({ length: 5 }, (_, i) => ({ src: `blob:frame${i}` })),
      timestamps
    };

    measurement.init(mockDecodedVideo, player);
    player.decodedVideo = mockDecodedVideo;

    player.play();

    // Premier tick à 16.67 ms :
    // L'ancien code n'aurait avancé que d'UNE seule frame (frame 1 à 16.67 ms, puis frame 2 à 33.3 ms, etc.)
    // Le nouveau code saute directement à la frame 3 (15 ms) qui est active à cet instant !
    advanceTimeAndTick(16.67);
    assert.equal(player.currentFrame, 3, "Doit avoir avancé directement à la frame 3 correspondant à 16.67 ms");

    // À t = 50 ms total (< 80 ms), toujours frame 3
    advanceTimeAndTick(33.33);
    assert.equal(player.currentFrame, 3);

    // À t = 85 ms total (>= 80 ms), dernière frame
    advanceTimeAndTick(35.0);
    assert.equal(player.currentFrame, 4);
    assert.equal(player.pauseFlag, true);
  });

  it('doit rattraper immédiatement un gel du thread principal (lag spike / dropped frames)', () => {
    // 30 fps (33.33 ms par frame), 10 frames
    const mockDecodedVideo = {
      width: 100,
      height: 100,
      duration: 300,
      frames: Array.from({ length: 10 }, (_, i) => ({ src: `blob:frame${i}` })),
      timestamps: Array.from({ length: 10 }, (_, i) => (i * 33.333) / 1000)
    };

    measurement.init(mockDecodedVideo, player);
    player.decodedVideo = mockDecodedVideo;

    player.play();
    assert.equal(player.currentFrame, 0);

    // Un gel ou une opération lourde bloque le thread pendant 140 ms
    advanceTimeAndTick(140.0);

    // 140 ms / 33.333 ms = 4.2 -> L'image active à 140 ms est l'image 4 (133.33 ms)
    assert.equal(player.currentFrame, 4, "Doit sauter directement à l'image 4 sans accumuler de retard permanent");

    // Le tick suivant (+16.67 ms -> 156.67 ms total < 166.67 ms)
    advanceTimeAndTick(16.67);
    assert.equal(player.currentFrame, 4);

    // Le tick d'après (+16.67 ms -> 173.34 ms >= 166.67 ms) -> image 5
    advanceTimeAndTick(16.67);
    assert.equal(player.currentFrame, 5, "La lecture reprend immédiatement sa cadence normale");
  });

  it('doit synchroniser la reprise après une pause ou une navigation manuelle', () => {
    const mockDecodedVideo = {
      width: 100,
      height: 100,
      duration: 300,
      frames: Array.from({ length: 10 }, (_, i) => ({ src: `blob:frame${i}` })),
      timestamps: Array.from({ length: 10 }, (_, i) => (i * 33.333) / 1000)
    };

    measurement.init(mockDecodedVideo, player);
    player.decodedVideo = mockDecodedVideo;

    player.play();
    advanceTimeAndTick(66.7); // Image 2
    assert.equal(player.currentFrame, 2);

    // Mise en pause
    player.pause();
    assert.equal(player.pauseFlag, true);

    // L'utilisateur attend 5 secondes
    advanceTimeAndTick(5000);
    assert.equal(player.currentFrame, 2, "L'image ne doit pas bouger pendant la pause");

    // Reprise de la lecture
    player.play();
    assert.equal(player.pauseFlag, false);

    // +16.67 ms après reprise -> temps vidéo = 66.67 + 16.67 = 83.34 ms < 100 ms -> reste à 2
    advanceTimeAndTick(16.67);
    assert.equal(player.currentFrame, 2);

    // +16.67 ms (33.34 ms après reprise) -> temps vidéo = 66.67 + 33.34 = 100.01 ms >= 100 ms -> image 3
    advanceTimeAndTick(16.67);
    assert.equal(player.currentFrame, 3, "La lecture reprend à l'image 2 et passe à l'image 3 après un intervalle exact");
  });

  it('doit redémarrer depuis originFrame si play() est déclenché sur la dernière image', () => {
    const mockDecodedVideo = {
      width: 100,
      height: 100,
      duration: 100,
      frames: Array.from({ length: 4 }, (_, i) => ({ src: `blob:frame${i}` })),
      timestamps: [0.0, 0.033, 0.066, 0.100]
    };

    measurement.init(mockDecodedVideo, player);
    player.decodedVideo = mockDecodedVideo;
    measurement.originFrame = 1;

    // Se positionner sur la dernière image
    player.lastFrame();
    assert.equal(player.currentFrame, 3);
    assert.equal(player.pauseFlag, true);

    // Clic sur Play : doit repartir depuis originFrame (1)
    player.play();
    assert.equal(player.currentFrame, 1, "Doit avoir redémarré à l'originFrame");
    assert.equal(player.pauseFlag, false);

    advanceTimeAndTick(35);
    assert.equal(player.currentFrame, 2);
  });

  it('doit fonctionner correctement en repli (fallback) si timestamps est absent', () => {
    const mockDecodedVideo = {
      width: 100,
      height: 100,
      duration: 300, // 300 ms pour 10 frames = 30 ms par frame
      frames: Array.from({ length: 10 }, (_, i) => ({ src: `blob:frame${i}` }))
      // pas de timestamps
    };

    measurement.init(mockDecodedVideo, player);
    player.decodedVideo = mockDecodedVideo;

    assert.equal(player.getFrameTime(0), 0);
    assert.equal(player.getFrameTime(1), 30);
    assert.equal(player.getFrameInterval(0), 30);

    player.play();
    assert.equal(player.currentFrame, 0);

    advanceTimeAndTick(30.1);
    assert.equal(player.currentFrame, 1);

    advanceTimeAndTick(30.0);
    assert.equal(player.currentFrame, 2);
  });
});

