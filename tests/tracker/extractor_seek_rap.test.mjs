import '../helpers/setup.mjs';
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import EXTRACTOR from '../../tracker/modules/extractor.js';
import * as MP4Box from '../../common/mp4box/mp4box.all.2.1.2.js';

if (!global.EncodedVideoChunk) {
  global.EncodedVideoChunk = class EncodedVideoChunk {
    constructor(init) {
      Object.assign(this, init);
    }
  };
}

describe('Tracker - Extractor seek avec repère clé (RAP) et préservation des trames', () => {
  let domElements;

  beforeEach(() => {
    domElements = {
      '#def-size-input': { checked: false },
      '#fps-size-input': { checked: false },
      '#duration-size-input': { checked: true },
      '#start-size-input': { value: '8.0' },
      '#end-size-input': { value: '15.0' },
      '#size-label': { className: '', innerHTML: '' },
      '#open-resized-video': { className: '', innerHTML: '' },
      '#extract-decode-progress': { value: 0 }
    };
    global.__querySelectorOverride = (sel) => domElements[sel] || null;
  });

  it('démontre le mécanisme de MP4Box : seek sans useRap sélectionne un delta frame, seek avec useRap sélectionne le RAP', () => {
    const file = MP4Box.createFile(true);
    // Simulation d'une piste avec une image clé toutes les 10 secondes (GOP = 10s, 30 fps)
    const samples = [];
    for (let i = 0; i < 600; i++) {
      samples.push({
        cts: Math.round(i * 33333.33),
        duration: 33333,
        timescale: 1000000,
        is_sync: i % 300 === 0, // Clé à i=0 (0s) et i=300 (10s)
        offset: i * 100,
        size: 100,
        alreadyRead: 0
      });
    }

    const trak = {
      tkhd: { track_id: 1 },
      samples
    };
    file.moov = { traks: [trak] };
    file.stream = { getEndFilePositionAfter: (x) => x };

    // 1. Seek à 8.0s SANS useRap (ou undefined)
    file.seek(8.0);
    const sampleNoRap = trak.samples[trak.nextSample];
    assert.equal(sampleNoRap.is_sync, false, 'Sans useRap, le seek atterrit sur une trame delta non synchronisée');
    assert.ok(trak.nextSample > 0, 'Le curseur n\'est pas au début du GOP');

    // 2. Seek à 8.0s AVEC useRap = true
    file.seek(8.0, true);
    const sampleWithRap = trak.samples[trak.nextSample];
    assert.equal(sampleWithRap.is_sync, true, 'Avec useRap=true, le seek sélectionne obligatoirement une trame clé (RAP)');
    assert.equal(trak.nextSample, 0, 'La trame clé sélectionnée est le point de synchronisation à 0s (début du GOP)');
  });

  it('MP4Box avec useRap=true sélectionne la trame clé la plus proche précédant startTime', () => {
    const file = MP4Box.createFile(true);
    // Clés à 0s, 5s, 10s, 15s (1000 timescale)
    const samples = [];
    for (let i = 0; i <= 15; i++) {
      samples.push({
        cts: i * 1000,
        duration: 1000,
        timescale: 1000,
        is_sync: i % 5 === 0, // Clés à 0, 5, 10, 15
        offset: i * 100,
        size: 100,
        alreadyRead: 0
      });
    }

    const trak = {
      tkhd: { track_id: 1 },
      samples
    };
    file.moov = { traks: [trak] };
    file.stream = { getEndFilePositionAfter: (x) => x };

    // Seek à 8.0s avec useRap : la trame clé doit être celle à 5.0s (échantillon 5)
    file.seek(8.0, true);
    assert.equal(trak.nextSample, 5, 'Doit sélectionner la trame clé à 5.0s');
    assert.equal(trak.samples[trak.nextSample].is_sync, true);

    // Seek à 12.0s avec useRap : la trame clé doit être celle à 10.0s (échantillon 10)
    file.seek(12.0, true);
    assert.equal(trak.nextSample, 10, 'Doit sélectionner la trame clé à 10.0s');
    assert.equal(trak.samples[trak.nextSample].is_sync, true);
  });

  it('extract() doit appeler mp4boxfile.seek(startTime, true) lorsque startTime > 0 et durationReduction est activé', () => {
    const extractor = new EXTRACTOR();
    extractor.width = 1920;
    extractor.height = 1080;
    extractor.fps = 30;
    extractor.duration = 20;
    extractor.track = { movie_duration: 20000, movie_timescale: 1000 };
    extractor.checksizeCB = () => {};

    domElements['#duration-size-input'].checked = true;
    domElements['#start-size-input'].value = '7.5';
    domElements['#end-size-input'].value = '15.0';

    let seekCall = null;
    extractor.mp4boxfile = {
      setExtractionOptions: () => {},
      seek: (time, useRap) => {
        seekCall = { time, useRap };
      },
      start: () => {},
      flush: () => {}
    };
    extractor.info = { videoTracks: [{ id: 1 }] };

    const prevVideoDecoder = global.VideoDecoder;
    global.VideoDecoder = class MockVideoDecoder {
      constructor(options) {
        this.output = options.output;
      }
      configure() {}
      flush() { return Promise.resolve(); }
    };

    try {
      extractor.extract();
      assert.ok(seekCall !== null, 'mp4boxfile.seek doit être appelé');
      assert.equal(seekCall.time, 7.5, 'seek doit cibler directement startTime (7.5s) sans heuristique défaillante (-5)');
      assert.equal(seekCall.useRap, true, 'seek doit obligatoirement transmettre useRap = true');
    } finally {
      global.VideoDecoder = prevVideoDecoder;
    }
  });

  it('extract() ne doit pas appeler mp4boxfile.seek() si startTime === 0', () => {
    const extractor = new EXTRACTOR();
    extractor.width = 1920;
    extractor.height = 1080;
    extractor.fps = 30;
    extractor.duration = 20;
    extractor.track = { movie_duration: 20000, movie_timescale: 1000 };
    extractor.checksizeCB = () => {};

    domElements['#duration-size-input'].checked = true;
    domElements['#start-size-input'].value = '0';
    domElements['#end-size-input'].value = '10.0';

    let seekCalled = false;
    extractor.mp4boxfile = {
      setExtractionOptions: () => {},
      seek: () => { seekCalled = true; },
      start: () => {},
      flush: () => {}
    };
    extractor.info = { videoTracks: [{ id: 1 }] };

    const prevVideoDecoder = global.VideoDecoder;
    global.VideoDecoder = class MockVideoDecoder {
      constructor(options) {
        this.output = options.output;
      }
      configure() {}
      flush() { return Promise.resolve(); }
    };

    try {
      extractor.extract();
      assert.equal(seekCalled, false, 'seek ne doit pas être appelé pour startTime === 0');
    } finally {
      global.VideoDecoder = prevVideoDecoder;
    }
  });

  it('onChunk() ne doit jamais envoyer de trame delta au décodeur avant la première trame clé', () => {
    const extractor = new EXTRACTOR();
    extractor.keyFrameFound = false;

    const decodedChunks = [];
    extractor.decoder = {
      state: 'configured',
      decode: (chunk) => {
        decodedChunks.push(chunk);
      }
    };

    domElements['#duration-size-input'].checked = true;
    domElements['#start-size-input'].value = '8.0';
    domElements['#end-size-input'].value = '15.0';

    // Simulation de chunks arrivant après startTime mais sans trame clé préalable
    const deltaChunk = new EncodedVideoChunk({
      type: 'delta',
      timestamp: 8500000, // 8.5s
      duration: 33333,
      data: new Uint8Array([1])
    });

    extractor.onChunk(deltaChunk);
    assert.equal(decodedChunks.length, 0, 'La trame delta sans clé préalable ne doit pas être transmise au décodeur');

    // Arrivée de la trame clé
    const keyChunk = new EncodedVideoChunk({
      type: 'key',
      timestamp: 6000000, // 6.0s (RAP préalable)
      duration: 33333,
      data: new Uint8Array([2])
    });

    extractor.onChunk(keyChunk);
    assert.equal(extractor.keyFrameFound, true, 'keyFrameFound doit passer à true');
    assert.equal(decodedChunks.length, 1, 'La trame clé doit être transmise au décodeur');
    assert.equal(decodedChunks[0].type, 'key');

    // Les deltas subséquents sont maintenant autorisés
    extractor.onChunk(deltaChunk);
    assert.equal(decodedChunks.length, 2, 'Les deltas suivant la clé doivent être transmis au décodeur');
  });

  it('onChunk() ne doit pas rejeter une trame clé située à plus de 5s avant startTime (disparition du filtre -5)', () => {
    const extractor = new EXTRACTOR();
    extractor.keyFrameFound = false;

    const decodedChunks = [];
    extractor.decoder = {
      state: 'configured',
      decode: (chunk) => {
        decodedChunks.push(chunk);
      }
    };

    domElements['#duration-size-input'].checked = true;
    domElements['#start-size-input'].value = '10.0';
    domElements['#end-size-input'].value = '15.0';

    // RAP situé à 3.0s (10 - 3 = 7s avant startTime > 5s)
    const earlyKeyChunk = new EncodedVideoChunk({
      type: 'key',
      timestamp: 3000000, // 3.0s
      duration: 33333,
      data: new Uint8Array([3])
    });

    extractor.onChunk(earlyKeyChunk);
    assert.equal(extractor.keyFrameFound, true, 'Le RAP situé à >5s avant startTime ne doit plus être éliminé');
    assert.equal(decodedChunks.length, 1, 'Le RAP doit être transmis au décodeur');
    assert.equal(decodedChunks[0].type, 'key');
  });

  it('flux complet onSamples : garantit que le décodeur reçoit la clé en premier et ignore les deltas d\'avant endTime', () => {
    const extractor = new EXTRACTOR();
    extractor.keyFrameFound = false;

    const decodedChunks = [];
    extractor.decoder = {
      state: 'configured',
      decode: (chunk) => {
        decodedChunks.push(chunk);
      },
      flush: async () => {}
    };

    domElements['#duration-size-input'].checked = true;
    domElements['#start-size-input'].value = '8.0';
    domElements['#end-size-input'].value = '10.0';

    // Échantillons MP4Box émis à partir du RAP à 6.0s (sample 0 dans le batch = RAP)
    // t = 6.0s (clé), 6.5s (delta), 7.0s (delta), 7.5s (delta), 8.0s (delta), 8.5s (delta), 9.0s (delta), 9.5s (delta), 10.0s (delta), 10.5s (delta > endTime + 0.2)
    const samples = [
      { number: 0, is_sync: true, cts: 6000, timescale: 1000, duration: 500, data: new Uint8Array([0]) },
      { number: 1, is_sync: false, cts: 6500, timescale: 1000, duration: 500, data: new Uint8Array([1]) },
      { number: 2, is_sync: false, cts: 7000, timescale: 1000, duration: 500, data: new Uint8Array([2]) },
      { number: 3, is_sync: false, cts: 7500, timescale: 1000, duration: 500, data: new Uint8Array([3]) },
      { number: 4, is_sync: false, cts: 8000, timescale: 1000, duration: 500, data: new Uint8Array([4]) },
      { number: 5, is_sync: false, cts: 8500, timescale: 1000, duration: 500, data: new Uint8Array([5]) },
      { number: 6, is_sync: false, cts: 9000, timescale: 1000, duration: 500, data: new Uint8Array([6]) },
      { number: 7, is_sync: false, cts: 9500, timescale: 1000, duration: 500, data: new Uint8Array([7]) },
      { number: 8, is_sync: false, cts: 10000, timescale: 1000, duration: 500, data: new Uint8Array([8]) },
      { number: 9, is_sync: false, cts: 11000, timescale: 1000, duration: 500, data: new Uint8Array([9]) }, // > endTime + 0.2 (10.2s)
    ];

    extractor.onSamples(samples);

    // Vérification :
    // 1. Le premier chunk décodé est obligatoirement la clé (t = 6.0s)
    assert.equal(decodedChunks[0].type, 'key');
    assert.equal(decodedChunks[0].timestamp, 6000000);

    // 2. Les chunks 1 à 8 sont transmis pour permettre la reconstruction des références
    assert.equal(decodedChunks.length, 9, 'Les 9 premiers chunks (6.0s à 10.0s) doivent être soumis au décodeur');

    // 3. L\'échantillon à 11.0s (> endTime + 0.2) a bien été ignoré
    assert.ok(decodedChunks.every(c => c.timestamp <= 10000000));
  });
});
