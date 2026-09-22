import '../helpers/setup.mjs';
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import EXTRACTOR from '../../tracker/modules/extractor.js';

describe('Tracker - Garantie d\'extraction minimale d\'une image et sécurité temporelle', () => {
  let domElements;

  beforeEach(() => {
    domElements = {
      '#def-size-input': { checked: false },
      '#fps-size-input': { checked: false },
      '#duration-size-input': { checked: true },
      '#start-size-input': { value: '0' },
      '#end-size-input': { value: '0' },
      '#size-label': { className: '', innerHTML: '' },
      '#open-resized-video': { className: '', innerHTML: '' }
    };

    global.__querySelectorOverride = (sel) => domElements[sel] || null;
  });

  it('updateSize doit estimer au moins 1 image (nb >= 1) même si la durée sélectionnée est de 0s (start === end)', () => {
    const extractor = new EXTRACTOR();
    extractor.width = 1920;
    extractor.height = 1080;
    extractor.fps = 30;
    extractor.duration = 10;

    domElements['#start-size-input'].value = '3.5';
    domElements['#end-size-input'].value = '3.5'; // Durée = 0s

    extractor.updateSize();

    assert.ok(extractor.size > 0, `La taille calculée doit être strictement positive (obtenu: ${extractor.size} Mio)`);
    assert.match(domElements['#size-label'].innerHTML, /^[1-9]\d* Mio$/, 'Le label de taille ne doit pas être 0 Mio');
  });

  it('updateSize doit gérer l\'inversion de début et de fin (start > end) sans produire de durée négative', () => {
    const extractor = new EXTRACTOR();
    extractor.width = 1920;
    extractor.height = 1080;
    extractor.fps = 30;
    extractor.duration = 10;

    domElements['#start-size-input'].value = '6.0';
    domElements['#end-size-input'].value = '2.0'; // Inversion début > fin

    extractor.updateSize();

    // 4 secondes à 30 fps = 120 frames
    assert.ok(extractor.size > 0, `La taille calculée doit être positive (obtenu: ${extractor.size} Mio)`);
    assert.equal(domElements['#size-label'].className, 'has-text-success');
    assert.equal(domElements['#open-resized-video'].className, 'button is-success');
  });

  it('extract doit configurer decodedVideo.duration avec une valeur positive même pour start === end', () => {
    const extractor = new EXTRACTOR();
    extractor.width = 1280;
    extractor.height = 720;
    extractor.fps = 30;
    extractor.duration = 5;
    extractor.track = { movie_duration: 5000, movie_timescale: 1000 };
    extractor.checksizeCB = () => {};

    domElements['#start-size-input'].value = '2.0';
    domElements['#end-size-input'].value = '2.0';

    // Mock VideoDecoder et alertModal
    const prevVideoDecoder = global.VideoDecoder;
    global.VideoDecoder = class MockVideoDecoder {
      constructor(options) {
        this.output = options.output;
      }
      configure() {}
      flush() { return Promise.resolve(); }
    };
    extractor.mp4boxfile = {
      setExtractionOptions: () => {},
      seek: () => {},
      start: () => {},
      flush: () => {}
    };
    extractor.info = { videoTracks: [{ id: 1 }] };

    try {
      extractor.extract();
      assert.equal(extractor.decodedVideo.frames.length, 0); // Pas encore de frame décodée
    } finally {
      global.VideoDecoder = prevVideoDecoder;
    }
  });
});
