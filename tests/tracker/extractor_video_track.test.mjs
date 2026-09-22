import '../helpers/setup.mjs';
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import EXTRACTOR from '../../tracker/modules/extractor.js';

describe('Tracker - Robustesse de la détection de piste vidéo dans EXTRACTOR.onReady', () => {
  let mockElements;
  let originalQSOverride;
  let originalQSAllOverride;

  const createMockElement = (id = '') => {
    const classes = new Set();
    const listeners = {};
    return {
      id,
      value: '0',
      checked: false,
      style: {},
      innerHTML: '',
      classList: {
        add: (c) => classes.add(c),
        remove: (c) => classes.delete(c),
        contains: (c) => classes.has(c)
      },
      addEventListener: (type, fn) => {
        if (!listeners[type]) listeners[type] = [];
        listeners[type].push(fn);
      },
      remove: function () {
        this.removed = true;
      },
      appendChild: () => {},
      noUiSlider: {
        updateOptions: () => {},
        set: () => {}
      }
    };
  };

  beforeEach(() => {
    mockElements = {
      '#new-modal': createMockElement('new-modal'),
      '#checksize-loading-modal': createMockElement('checksize-loading-modal'),
      '#def-size-input': createMockElement('def-size-input'),
      '#fps-size-input': createMockElement('fps-size-input'),
      '#duration-size-input': createMockElement('duration-size-input'),
      '#duration-size-inputs': createMockElement('duration-size-inputs'),
      '#size-label': createMockElement('size-label'),
      '#open-resized-video': createMockElement('open-resized-video'),
      '#file-size-modal': createMockElement('file-size-modal'),
      '#def-size-label': createMockElement('def-size-label'),
      '#fps-size-label': createMockElement('fps-size-label'),
      '#duration-size-label': createMockElement('duration-size-label'),
      '#file-slider': createMockElement('file-slider'),
      '#start-size-input': createMockElement('start-size-input'),
      '#end-size-input': createMockElement('end-size-input')
    };

    originalQSOverride = global.__querySelectorOverride;
    originalQSAllOverride = global.__querySelectorAllOverride;

    global.__querySelectorOverride = (sel) => mockElements[sel] || createMockElement();
    global.__querySelectorAllOverride = () => [];
  });

  afterEach(() => {
    global.__querySelectorOverride = originalQSOverride;
    global.__querySelectorAllOverride = originalQSAllOverride;
  });

  it('ne doit pas crasher et doit interrompre l extraction si _info est null ou vide', () => {
    const extractor = new EXTRACTOR();
    extractor.abortFlag = false;
    mockElements['#new-modal'].classList.remove('is-active');

    assert.doesNotThrow(() => {
      extractor.onReady(null);
    });

    assert.equal(extractor.abortFlag, true, 'abortFlag doit être activé pour stopper readBlock');
    assert.equal(mockElements['#new-modal'].classList.contains('is-active'), true, '#new-modal doit être ouvert');
    assert.equal(mockElements['#checksize-loading-modal'].removed, true, 'le modal de chargement doit être supprimé');
  });

  it('ne doit pas crasher et doit interrompre l extraction si _info ne contient aucune piste vidéo (fichier audio ou conteneur vide)', () => {
    const extractor = new EXTRACTOR();
    extractor.abortFlag = false;
    mockElements['#new-modal'].classList.remove('is-active');

    assert.doesNotThrow(() => {
      extractor.onReady({ videoTracks: [] });
    });

    assert.equal(extractor.abortFlag, true, 'abortFlag doit être activé');
    assert.equal(mockElements['#new-modal'].classList.contains('is-active'), true);
  });

  it('ne doit pas crasher sur this.track.video.height si un conteneur altéré contient une piste sans objet video', () => {
    const extractor = new EXTRACTOR();
    extractor.abortFlag = false;
    mockElements['#new-modal'].classList.remove('is-active');

    // Cas typique de conteneur corrompu : track présente mais sans métadonnées vidéo valides
    const corruptedInfo = {
      videoTracks: [
        {
          id: 1,
          codec: 'avc1.4d401f',
          nb_samples: 100
          // video: undefined
        }
      ]
    };

    assert.doesNotThrow(() => {
      extractor.onReady(corruptedInfo);
    });

    assert.equal(extractor.abortFlag, true, 'abortFlag doit être positionné à true');
    assert.equal(mockElements['#new-modal'].classList.contains('is-active'), true, '#new-modal doit être ouvert');
  });

  it('ne doit pas crasher si video.height ou video.width vaut 0 ou est invalide', () => {
    const extractor = new EXTRACTOR();
    extractor.abortFlag = false;
    mockElements['#new-modal'].classList.remove('is-active');

    const invalidDimensionsInfo = {
      videoTracks: [
        {
          id: 1,
          video: { width: 0, height: 0 }
        }
      ]
    };

    assert.doesNotThrow(() => {
      extractor.onReady(invalidDimensionsInfo);
    });

    assert.equal(extractor.abortFlag, true, 'abortFlag doit être activé en cas de dimensions nulles');
    assert.equal(mockElements['#new-modal'].classList.contains('is-active'), true);
  });

  it('doit sécuriser getDescription et les calculs temporels si getTrackById renvoie null ou si timescale = 0', () => {
    const extractor = new EXTRACTOR();
    extractor.abortFlag = false;
    extractor.extract = () => {}; // Eviter l'extraction réelle dans ce test

    extractor.mp4boxfile = {
      getTrackById: () => null // getTrackById renvoie null
    };

    const validVideoCorruptedTimescale = {
      videoTracks: [
        {
          id: 1,
          codec: 'avc1',
          nb_samples: 50,
          movie_duration: 1000,
          movie_timescale: 0, // timescale nul !
          video: { width: 640, height: 480 }
        }
      ]
    };

    assert.doesNotThrow(() => {
      extractor.onReady(validVideoCorruptedTimescale);
    });

    assert.equal(extractor.height, 480);
    assert.equal(extractor.width, 640);
    assert.equal(Number.isFinite(extractor.duration), true, 'La durée doit rester un nombre fini');
    assert.equal(Number.isFinite(extractor.fps), true, 'Le fps doit rester un nombre fini');
    assert.equal(extractor.config.description, undefined, 'description doit être undefined sans exception');
  });

  it('doit initialiser correctement la piste vidéo dans le cas nominal', () => {
    const extractor = new EXTRACTOR();
    let extractCalled = false;
    extractor.extract = () => { extractCalled = true; };

    extractor.mp4boxfile = {
      getTrackById: () => ({
        mdia: {
          minf: {
            stbl: {
              stsd: {
                entries: []
              }
            }
          }
        }
      })
    };

    const nominalInfo = {
      videoTracks: [
        {
          id: 1,
          codec: 'avc1.42E01E',
          nb_samples: 60,
          movie_duration: 2000,
          movie_timescale: 1000,
          video: { width: 1920, height: 1080 }
        }
      ]
    };

    extractor.onReady(nominalInfo);

    assert.equal(extractor.height, 1080);
    assert.equal(extractor.width, 1920);
    assert.equal(extractor.duration, 2);
    assert.equal(extractor.fps, 30);
    assert.equal(extractor.config.codec, 'avc1.42E01E');
    assert.equal(extractor.config.codedHeight, 1080);
    assert.equal(extractor.config.codedWidth, 1920);
    assert.equal(extractCalled, true, 'extract doit être appelé si la taille est inférieure au seuil');
  });
});
