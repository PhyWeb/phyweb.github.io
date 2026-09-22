import '../helpers/setup.mjs';
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import EXTRACTOR from '../../tracker/modules/extractor.js';

describe('Tracker - Nettoyage et libération des ressources VideoDecoder (extractor.extract)', () => {
  let domElements;
  let originalVideoDecoder;
  let createdDecoders = [];

  class MockVideoDecoder {
    constructor(init) {
      this.init = init;
      this.state = 'unconfigured';
      this.closeCalls = 0;
      this.flushCalls = 0;
      this.decodeCalls = 0;
      createdDecoders.push(this);
    }

    configure(config) {
      this.config = config;
      this.state = 'configured';
    }

    decode(chunk) {
      if (this.state !== 'configured') {
        throw new Error('Decoder is not configured');
      }
      this.decodeCalls++;
    }

    async flush() {
      if (this.state !== 'configured') {
        throw new Error('Decoder is not configured');
      }
      this.flushCalls++;
      return Promise.resolve();
    }

    close() {
      if (this.state === 'closed') return;
      this.state = 'closed';
      this.closeCalls++;
    }

    reset() {
      this.state = 'unconfigured';
    }
  }

  let originalFileReader;

  beforeEach(() => {
    createdDecoders = [];
    originalVideoDecoder = global.VideoDecoder;
    global.VideoDecoder = MockVideoDecoder;

    originalFileReader = global.FileReader;
    global.FileReader = class {
      readAsArrayBuffer() {}
    };

    domElements = {
      '#def-size-input': { checked: false },
      '#fps-size-input': { checked: false },
      '#duration-size-input': { checked: false },
      '#start-size-input': { value: '0' },
      '#end-size-input': { value: '10' },
      '#size-label': { className: '', innerHTML: '' },
      '#open-resized-video': { className: '', innerHTML: '' },
      '#extract-decode-progress': { value: 0 }
    };
    global.__querySelectorOverride = (sel) => domElements[sel] || null;
  });

  afterEach(() => {
    global.VideoDecoder = originalVideoDecoder;
    global.FileReader = originalFileReader;
  });

  const setupExtractor = (extractor) => {
    extractor.width = 1280;
    extractor.height = 720;
    extractor.fps = 30;
    extractor.duration = 5;
    extractor.track = { id: 1, codec: 'avc1.4d401f', movie_duration: 5000, movie_timescale: 1000 };
    extractor.checksizeCB = () => {};
    extractor.decodedVideoCB = () => {};
    extractor.mp4boxfile = {
      setExtractionOptions: () => {},
      seek: () => {},
      start: () => {},
      flush: () => {}
    };
    extractor.info = { videoTracks: [{ id: 1 }] };
  };

  it('démontre la fuite : appeler extract() consécutivement doit fermer l\'instance précédente de VideoDecoder', () => {
    const extractor = new EXTRACTOR();
    setupExtractor(extractor);

    // 1ère extraction
    extractor.extract();
    assert.equal(createdDecoders.length, 1, 'Un premier décodeur a été instancié');
    const firstDecoder = createdDecoders[0];
    assert.equal(firstDecoder.state, 'configured');
    assert.equal(firstDecoder.closeCalls, 0, 'Le premier décodeur est actif');

    // 2ème extraction (rechargement / relance avec de nouveaux paramètres sur la même instance extractor)
    extractor.extract();
    assert.equal(createdDecoders.length, 2, 'Un deuxième décodeur a été instancié');
    const secondDecoder = createdDecoders[1];

    // Vérification de la libération du premier décodeur
    assert.equal(firstDecoder.closeCalls, 1, 'Le premier décodeur DOIT avoir été fermé via .close() lors de la réinstanciation');
    assert.equal(firstDecoder.state, 'closed', 'L\'état du premier décodeur doit être "closed"');
    assert.equal(secondDecoder.state, 'configured', 'Le nouveau décodeur doit être configuré et actif');
  });

  it('doit libérer le décodeur matériel lors de l\'achèvement normal (triggerFinish)', async () => {
    const extractor = new EXTRACTOR();
    setupExtractor(extractor);

    extractor.extract();
    const decoder = createdDecoders[0];
    assert.equal(decoder.state, 'configured');

    // Fin de l'extraction
    await extractor.triggerFinish(false);

    assert.equal(decoder.flushCalls, 1, 'flush() doit être appelé pour vider les trames restantes');
    assert.equal(decoder.closeCalls, 1, 'close() doit être appelé après flush pour libérer le contexte GPU');
    assert.equal(decoder.state, 'closed', 'Le décodeur doit être à l\'état "closed"');
  });

  it('doit libérer immédiatement le décodeur lors d\'une annulation (triggerFinish(true))', async () => {
    const extractor = new EXTRACTOR();
    setupExtractor(extractor);

    extractor.extract();
    const decoder = createdDecoders[0];
    assert.equal(decoder.state, 'configured');

    // Annulation par l'utilisateur (bouton Arrêter)
    await extractor.triggerFinish(true);

    assert.equal(decoder.closeCalls, 1, 'close() doit être appelé immédiatement lors de l\'annulation');
    assert.equal(decoder.state, 'closed', 'Le décodeur doit être fermé');
  });

  it('doit fermer un décodeur existant si checkSize est appelé pour un nouveau fichier', () => {
    const extractor = new EXTRACTOR();
    setupExtractor(extractor);

    extractor.extract();
    const decoder = createdDecoders[0];
    assert.equal(decoder.state, 'configured');

    // Analyse d'un nouveau fichier vidéo
    const mockFile = { size: 1024, slice: () => ({}) };
    extractor.checkSize(mockFile, () => {}, () => {});

    assert.equal(decoder.closeCalls, 1, 'checkSize doit fermer tout décodeur résiduel avant de charger un nouveau fichier');
    assert.equal(decoder.state, 'closed');
  });

  it('garantit le respect du quota matériel GPU du navigateur lors d\'extractions répétées', () => {
    // Simule la limite stricte de sessions matérielles VideoDecoder (par ex. max 3 décodeurs simultanés sur Chromium)
    const MAX_HARDWARE_DECODERS = 3;
    let activeHardwareCount = 0;

    class QuotaEnforcingDecoder extends MockVideoDecoder {
      configure(config) {
        if (activeHardwareCount >= MAX_HARDWARE_DECODERS) {
          const quotaErr = new Error('QuotaExceededError: Hardware decoder limit reached');
          quotaErr.name = 'QuotaExceededError';
          throw quotaErr;
        }
        activeHardwareCount++;
        super.configure(config);
      }

      close() {
        if (this.state !== 'closed') {
          activeHardwareCount = Math.max(0, activeHardwareCount - 1);
        }
        super.close();
      }
    }

    global.VideoDecoder = QuotaEnforcingDecoder;

    const extractor = new EXTRACTOR();
    setupExtractor(extractor);

    // Effectuer 5 extractions consécutives (dépasse MAX_HARDWARE_DECODERS = 3 si la fermeture n'est pas faite)
    for (let i = 0; i < 5; i++) {
      assert.doesNotThrow(() => {
        extractor.extract();
      }, `L'extraction ${i + 1} ne doit pas lever QuotaExceededError si les décodeurs précédents sont fermés`);
    }

    assert.equal(activeHardwareCount, 1, 'Un seul décodeur matériel doit être actif à la fois');
  });
});
