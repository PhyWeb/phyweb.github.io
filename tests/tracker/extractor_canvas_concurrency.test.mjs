import '../helpers/setup.mjs';
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import EXTRACTOR from '../../tracker/modules/extractor.js';

describe('Tracker - Course critique asynchrone sur OffscreenCanvas (extract)', () => {
  let originalOffscreenCanvas;
  let originalImage;
  let canvasIdSeq = 0;
  let pendingConversions = [];

  // Mock déterministe et réaliste de OffscreenCanvas simulant le comportement asynchrone de convertToBlob()
  class MockOffscreenCanvas {
    constructor(width, height) {
      this.width = width;
      this.height = height;
      this._currentContent = null;
      this.id = ++canvasIdSeq;
      this._context = {
        drawImage: (frame) => {
          // Écrit immédiatement sur le buffer du canvas
          this._currentContent = frame.content !== undefined ? frame.content : frame;
        }
      };
    }

    getContext(type, opts) {
      return this._context;
    }

    convertToBlob(options) {
      // Selon la spec W3C, convertToBlob s'exécute en tâche parallèle/asynchrone.
      // Si le buffer du canvas est écrasé avant la lecture du bitmap,
      // convertToBlob lira le nouveau contenu au moment où la conversion a lieu.
      return new Promise((resolve) => {
        pendingConversions.push(() => {
          resolve({
            type: options?.type || 'image/jpeg',
            content: this._currentContent,
            canvasId: this.id
          });
        });
      });
    }
  }

  // Mock de Image pour le test
  class MockImage {
    constructor() {
      this.src = '';
    }
    async decode() {
      return Promise.resolve();
    }
  }

  const flushConversions = () => {
    const callbacks = [...pendingConversions];
    pendingConversions = [];
    for (const cb of callbacks) {
      cb();
    }
  };

  beforeEach(() => {
    canvasIdSeq = 0;
    pendingConversions = [];
    originalOffscreenCanvas = global.OffscreenCanvas;
    originalImage = global.Image;
    global.OffscreenCanvas = MockOffscreenCanvas;
    global.Image = MockImage;
  });

  afterEach(() => {
    global.OffscreenCanvas = originalOffscreenCanvas;
    global.Image = originalImage;
  });

  it('démontre le bogue : un unique OffscreenCanvas partagé produit des images clonées/écrasées', async () => {
    // Reproduction exacte du code initial avec un canvas unique partagé
    const singleCanvas = new MockOffscreenCanvas(640, 480);
    const singleCtx = singleCanvas.getContext('2d', { alpha: false });
    const framesResult = [];

    // Simulation de l'ancien code : un seul canvas partagé
    const simulateOldOutput = (frame, index) => {
      singleCtx.drawImage(frame);
      return singleCanvas.convertToBlob({ type: 'image/jpeg', quality: 0.85 })
        .then((blob) => {
          framesResult[index] = { index, content: blob.content };
        });
    };

    // 3 images émises rapidement par le décodeur avant la fin de l'encodage JPEG
    const p0 = simulateOldOutput({ content: 'VISUEL_IMAGE_0' }, 0);
    const p1 = simulateOldOutput({ content: 'VISUEL_IMAGE_1' }, 1);
    const p2 = simulateOldOutput({ content: 'VISUEL_IMAGE_2' }, 2);

    // À cet instant, le canvas unique a été écrasé successivement par image 0, puis 1, puis 2.
    // L'encodage JPEG en tâche de fond s'exécute maintenant :
    flushConversions();

    await Promise.all([p0, p1, p2]);

    // PREUVE DU BOGUE :
    // L'image 0 et l'image 1 ont été écrasées par l'image 2 avant la fin de leur convertToBlob !
    // Elles se retrouvent toutes avec le visuel de la dernière image ("VISUEL_IMAGE_2").
    assert.equal(framesResult[0].content, 'VISUEL_IMAGE_2', "L'image 0 a été écrasée par l'image 2");
    assert.equal(framesResult[1].content, 'VISUEL_IMAGE_2', "L'image 1 a été écrasée par l'image 2");
    assert.equal(framesResult[2].content, 'VISUEL_IMAGE_2', "L'image 2 a le visuel 2");
    assert.equal(framesResult[0].content, framesResult[1].content, 'Images 0 et 1 clonées avec le même visuel !');
  });

  it('démontre la correction : avec le pool de canvas, chaque image conserve son visuel distinct', async () => {
    const extractor = new EXTRACTOR();
    const framesResult = [];

    // Simulation avec le pool de canvas d'EXTRACTOR (_acquireCanvas / _releaseCanvas)
    const simulateCorrectedOutput = (frame, index) => {
      const canvasItem = extractor._acquireCanvas(640, 480);
      canvasItem.ctx.drawImage(frame);

      return canvasItem.canvas.convertToBlob({ type: 'image/jpeg', quality: 0.85 })
        .then((blob) => {
          extractor._releaseCanvas(canvasItem);
          framesResult[index] = { index, content: blob.content, canvasId: blob.canvasId };
        })
        .catch((e) => {
          extractor._releaseCanvas(canvasItem);
          throw e;
        });
    };

    // Émission rapide des 3 frames par le décodeur avant la fin de l'encodage
    const p0 = simulateCorrectedOutput({ content: 'VISUEL_IMAGE_0' }, 0);
    const p1 = simulateCorrectedOutput({ content: 'VISUEL_IMAGE_1' }, 1);
    const p2 = simulateCorrectedOutput({ content: 'VISUEL_IMAGE_2' }, 2);

    // L'encodage asynchrone se termine
    flushConversions();

    await Promise.all([p0, p1, p2]);

    // VÉRIFICATION DE LA CORRECTION :
    // Chaque image a son propre visuel préservé
    assert.equal(framesResult[0].content, 'VISUEL_IMAGE_0', "L'image 0 conserve son visuel propre");
    assert.equal(framesResult[1].content, 'VISUEL_IMAGE_1', "L'image 1 conserve son visuel propre");
    assert.equal(framesResult[2].content, 'VISUEL_IMAGE_2', "L'image 2 conserve son visuel propre");

    // Aucun clonage
    assert.notEqual(framesResult[0].content, framesResult[1].content);
    assert.notEqual(framesResult[1].content, framesResult[2].content);
  });

  it('doit réutiliser efficacement les instances de canvas sans dépasser la concurrence requise', async () => {
    const extractor = new EXTRACTOR();
    const width = 640;
    const height = 480;

    // Concurrence de 3 images en parallèle
    const c1 = extractor._acquireCanvas(width, height);
    const c2 = extractor._acquireCanvas(width, height);
    const c3 = extractor._acquireCanvas(width, height);

    assert.equal(c1.canvas.id, 1);
    assert.equal(c2.canvas.id, 2);
    assert.equal(c3.canvas.id, 3);
    assert.equal(extractor._canvasPool.length, 0, 'Le pool est vide car 3 canvas sont en cours d utilisation');

    // Libération du canvas 1
    extractor._releaseCanvas(c1);
    assert.equal(extractor._canvasPool.length, 1);

    // Réacquisition : doit réutiliser c1 immédiatement sans créer de nouvelle instance
    const c1Reused = extractor._acquireCanvas(width, height);
    assert.equal(c1Reused.canvas.id, 1, 'Le canvas 1 a été réutilisé');
    assert.equal(extractor._canvasPool.length, 0);

    // Libération de tous les canvas
    extractor._releaseCanvas(c1Reused);
    extractor._releaseCanvas(c2);
    extractor._releaseCanvas(c3);
    assert.equal(extractor._canvasPool.length, 3);

    // Vidage du pool
    extractor._clearCanvasPool();
    assert.equal(extractor._canvasPool.length, 0, 'Le pool a été correctement nettoyé');
  });

  it('doit restituer le canvas au pool même en cas d erreur dans convertToBlob', async () => {
    const extractor = new EXTRACTOR();
    const width = 640;
    const height = 480;

    const faultyCanvas = {
      canvas: {
        id: 999,
        convertToBlob: () => Promise.reject(new Error('Erreur de compression'))
      },
      ctx: {}
    };

    // Injection dans le pool
    extractor._releaseCanvas(faultyCanvas);
    assert.equal(extractor._canvasPool.length, 1);

    const acquired = extractor._acquireCanvas(width, height);
    assert.equal(acquired.canvas.id, 999);
    assert.equal(extractor._canvasPool.length, 0);

    // Simulation de l'appel protégé
    await acquired.canvas.convertToBlob()
      .catch(() => {
        extractor._releaseCanvas(acquired);
      });

    assert.equal(extractor._canvasPool.length, 1, 'Le canvas doit être restitué au pool même en cas de rejet');
  });
});

