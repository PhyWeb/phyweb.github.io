import '../helpers/setup.mjs';
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import EXTRACTOR from '../../tracker/modules/extractor.js';

describe('Tracker - Extractor modal listeners, endTime calculation & B-frames sorting', () => {
  let domElements;
  let listenersRecorded;

  const createMockElementWithListeners = () => {
    const listeners = {};
    return {
      checked: false,
      value: '0',
      innerHTML: '',
      className: '',
      classList: {
        add: () => {},
        remove: () => {},
        contains: () => false
      },
      remove: () => {},
      addEventListener: (type, fn) => {
        if (!listeners[type]) listeners[type] = [];
        listeners[type].push(fn);
        listenersRecorded.push({ type, fn });
      },
      _listeners: listeners,
      noUiSlider: {
        updateOptions: () => {},
        set: () => {}
      }
    };
  };

  beforeEach(() => {
    listenersRecorded = [];
    domElements = {
      '#def-size-input': createMockElementWithListeners(),
      '#fps-size-input': createMockElementWithListeners(),
      '#duration-size-input': createMockElementWithListeners(),
      '#duration-size-inputs': createMockElementWithListeners(),
      '#start-size-input': createMockElementWithListeners(),
      '#end-size-input': createMockElementWithListeners(),
      '#def-size-label': createMockElementWithListeners(),
      '#fps-size-label': createMockElementWithListeners(),
      '#duration-size-label': createMockElementWithListeners(),
      '#size-label': createMockElementWithListeners(),
      '#open-resized-video': createMockElementWithListeners(),
      '#file-size-modal': createMockElementWithListeners(),
      '#file-size-warning': createMockElementWithListeners(),
      '#file-slider': createMockElementWithListeners(),
      '#extract-loading-modal': createMockElementWithListeners(),
      '#extract-decode-progress': createMockElementWithListeners()
    };

    global.__querySelectorOverride = (sel) => domElements[sel] || null;
  });

  it('1. constructor doit initialiser _listenersAttached à false', () => {
    const extractor = new EXTRACTOR();
    assert.strictEqual(extractor._listenersAttached, false, '_listenersAttached doit valoir false par défaut');
  });

  it('2. _finalizeCheckSize doit attacher les écouteurs "change" une seule fois sans doublons lors d\'appels successifs', () => {
    const extractor = new EXTRACTOR();
    extractor.width = 1920;
    extractor.height = 1080;
    extractor.fps = 30;
    extractor.duration = 60;
    extractor.forceFileSize = true; // Force l'ouverture de la modale

    // 1ère ouverture de la modale
    extractor._finalizeCheckSize();
    assert.strictEqual(extractor._listenersAttached, true, '_listenersAttached doit passer à true');

    // Vérifie que les 3 checkboxes utilisent l'événement "change" (et non "click")
    assert.strictEqual(domElements['#def-size-input']._listeners['change']?.length, 1);
    assert.strictEqual(domElements['#def-size-input']._listeners['click'], undefined);

    assert.strictEqual(domElements['#fps-size-input']._listeners['change']?.length, 1);
    assert.strictEqual(domElements['#fps-size-input']._listeners['click'], undefined);

    assert.strictEqual(domElements['#duration-size-input']._listeners['change']?.length, 1);
    assert.strictEqual(domElements['#duration-size-input']._listeners['click'], undefined);

    assert.strictEqual(domElements['#start-size-input']._listeners['change']?.length, 1);
    assert.strictEqual(domElements['#end-size-input']._listeners['change']?.length, 1);

    // 2ème ouverture de la modale (par exemple réouverture)
    extractor._finalizeCheckSize();

    // Vérifie qu'aucun nouvel écouteur n'a été ajouté en double
    assert.strictEqual(domElements['#def-size-input']._listeners['change'].length, 1);
    assert.strictEqual(domElements['#fps-size-input']._listeners['change'].length, 1);
    assert.strictEqual(domElements['#duration-size-input']._listeners['change'].length, 1);
    assert.strictEqual(domElements['#start-size-input']._listeners['change'].length, 1);
    assert.strictEqual(domElements['#end-size-input']._listeners['change'].length, 1);
  });

  it('3. extract doit sécuriser le calcul de endTime sans dépasser this.duration et sans valoir Infinity', () => {
    const extractor = new EXTRACTOR();
    extractor.width = 1280;
    extractor.height = 720;
    extractor.fps = 30;
    extractor.duration = 10;
    extractor.demuxerType = 'mp4box';
    extractor.checksizeCB = () => {};
    extractor.decodedVideoCB = () => {};
    extractor.mp4boxfile = {
      setExtractionOptions: () => {},
      seek: () => {},
      start: () => {},
      flush: () => {}
    };

    const prevVideoDecoder = global.VideoDecoder;
    global.VideoDecoder = class MockVideoDecoder {
      configure() {}
      flush() { return Promise.resolve(); }
      close() {}
    };

    try {
      // Test A: durationReduction activé avec un end-size-input invalide (NaN)
      domElements['#duration-size-input'].checked = true;
      domElements['#start-size-input'].value = '0';
      domElements['#end-size-input'].value = 'invalide';

      extractor.extract();
      assert.strictEqual(
        extractor.decodedVideo.duration,
        10000,
        'La durée doit être limitée à this.duration * 1000 = 10000ms au lieu de valoir Infinity'
      );

      // Test B: durationReduction activé avec end-size-input dépassant this.duration (15s > 10s)
      domElements['#end-size-input'].value = '15.0';
      extractor.extract();
      assert.strictEqual(
        extractor.decodedVideo.duration,
        10000,
        'endTime doit être borné par Math.min(rawEnd, this.duration)'
      );

      // Test C: durationReduction désactivé (rawEnd = Infinity)
      domElements['#duration-size-input'].checked = false;
      extractor.extract();
      assert.strictEqual(
        extractor.decodedVideo.duration,
        10000,
        'Quand durationReduction est inactif, la durée par défaut est respectée'
      );
    } finally {
      global.VideoDecoder = prevVideoDecoder;
    }
  });

  it('4. triggerFinish doit trier les frames et timestamps chronologiquement (B-frames) et normaliser le premier timestamp à 0', async () => {
    const extractor = new EXTRACTOR();
    extractor.fps = 25;

    // Simulation de frames décodées dans l'ordre de décodage (DTS) avec B-frames,
    // ce qui donne des timestamps de présentation (PTS) désordonnés.
    const f0 = { id: 'frame_pts_0.08' };
    const f1 = { id: 'frame_pts_0.00' };
    const f2 = { id: 'frame_pts_0.04' };
    const f3 = { id: 'frame_pts_0.12' };

    extractor.decodedVideo = {
      frames: [f0, f1, f2, f3],
      timestamps: [0.08, 0.00, 0.04, 0.12]
    };

    let finishedVideo = null;
    extractor.decodedVideoCB = (video) => {
      finishedVideo = video;
    };

    await extractor.triggerFinish(false);

    assert.ok(finishedVideo, 'La vidéo doit être retournée par decodedVideoCB');
    // Vérification du tri chronologique des couples (frame, timestamp)
    assert.deepStrictEqual(
      finishedVideo.frames,
      [f1, f2, f0, f3],
      'Les frames doivent être réordonnées selon le timestamp croissant'
    );
    assert.deepStrictEqual(
      finishedVideo.timestamps,
      [0, 0.04, 0.08, 0.12],
      'Les timestamps doivent être triés et normalisés pour commencer à 0'
    );
  });

  it('4bis. triggerFinish doit normaliser les timestamps même si le minimum n\'est pas 0', async () => {
    const extractor = new EXTRACTOR();
    extractor.fps = 30;

    const fA = { id: 'fA' };
    const fB = { id: 'fB' };
    const fC = { id: 'fC' };

    extractor.decodedVideo = {
      frames: [fB, fA, fC],
      timestamps: [1.5, 1.2, 1.8]
    };

    let finishedVideo = null;
    extractor.decodedVideoCB = (video) => {
      finishedVideo = video;
    };

    await extractor.triggerFinish(false);

    assert.ok(finishedVideo);
    assert.deepStrictEqual(finishedVideo.frames, [fA, fB, fC]);
    // Normalisé : [1.2 - 1.2, 1.5 - 1.2, 1.8 - 1.2] = [0, 0.3, 0.6]
    assert.strictEqual(finishedVideo.timestamps[0], 0);
    assert.ok(Math.abs(finishedVideo.timestamps[1] - 0.3) < 1e-6);
    assert.ok(Math.abs(finishedVideo.timestamps[2] - 0.6) < 1e-6);
  });
});
