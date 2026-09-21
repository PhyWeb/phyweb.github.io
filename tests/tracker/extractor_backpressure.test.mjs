import '../helpers/setup.mjs';
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import EXTRACTOR from '../../tracker/modules/extractor.js';

if (!global.EncodedVideoChunk) {
  global.EncodedVideoChunk = class EncodedVideoChunk {
    constructor(init) {
      Object.assign(this, init);
    }
  };
}

describe('Tracker - Régulateur de mémoire et synchronisation de onSamples/onChunk', () => {

  const createMockSample = (index, total = 30) => ({
    number: index,
    is_sync: index === 0,
    cts: index * 33333,
    timescale: 1000000,
    duration: 33333,
    data: new Uint8Array([index])
  });

  it('démontre le bogue historique : une boucle synchrone avec setTimeout déclenche flush() prématurément', async () => {
    // Reproduction exacte du mécanisme historique :
    // - onSamples boucle immédiatement sur tous les échantillons
    // - si pendingCount > 15, onChunk fait setTimeout(..., 50) et retourne
    // - le dernier échantillon déclenche immédiatement triggerFinish(false) et flush()
    let pendingBitmapsCount = 20; // Supérieur au seuil de 15
    const nbSamples = 25;
    const decodedChunks = [];
    let flushCalledAt = null;
    let finishTriggered = false;

    const fakeDecoder = {
      state: 'configured',
      decode: (chunk) => {
        decodedChunks.push(chunk);
      },
      flush: async () => {
        flushCalledAt = decodedChunks.length;
      }
    };

    const deferredTimeouts = [];
    const oldOnChunk = (chunk) => {
      if (pendingBitmapsCount > 15) {
        const id = setTimeout(() => oldOnChunk(chunk), 50);
        deferredTimeouts.push(id);
        return;
      }
      fakeDecoder.decode(chunk);
    };

    const oldOnSamples = (samples) => {
      for (let i = 0; i < samples.length; i++) {
        const sample = samples[i];
        oldOnChunk({ id: sample.number });
        if (sample.number + 1 >= nbSamples) {
          finishTriggered = true;
          fakeDecoder.flush();
        }
      }
    };

    const samples = Array.from({ length: nbSamples }, (_, i) => ({ number: i }));
    oldOnSamples(samples);

    // PREUVE DU BOGUE HISTORIQUE :
    // 1. flush() a été appelé immédiatement pendant la boucle synchrone
    assert.equal(finishTriggered, true, "triggerFinish a été déclenché immédiatement");
    assert.equal(flushCalledAt, 0, "flush() a été déclenché alors que 0 chunk n'avait été décodé !");
    assert.equal(decodedChunks.length, 0, "Aucun chunk n'a pu être décodé avant le flush");
    assert.equal(deferredTimeouts.length, nbSamples, "Tous les chunks sont bloqués dans des setTimeout distincts");

    // Nettoyage des timers
    for (const id of deferredTimeouts) clearTimeout(id);
  });

  it('doit traiter tous les chunks dans l ordre FIFO strict même sous forte régulation de mémoire', async () => {
    const extractor = new EXTRACTOR();
    const totalSamples = 40;
    extractor.nbSamples = totalSamples;
    extractor._pendingBitmapsCount = 18; // Démarre au-dessus du seuil de 15

    const decodedOrder = [];
    let flushCalled = false;
    let resolveExtraction;
    const extractionDone = new Promise((resolve) => { resolveExtraction = resolve; });

    extractor.decoder = {
      state: 'configured',
      decode: (chunk) => {
        decodedOrder.push(chunk.data[0]);
      },
      flush: async () => {
        flushCalled = true;
      }
    };

    extractor.decodedVideoCB = () => {
      resolveExtraction();
    };

    // Création de 40 échantillons
    const samples = Array.from({ length: totalSamples }, (_, i) => createMockSample(i, totalSamples));

    // Lancement de l'ingestion des échantillons
    extractor.onSamples(samples);

    // Juste après l'appel synchrone, aucun chunk ne doit avoir sauté la file
    // et flush ne doit SURTOUT PAS avoir été appelé
    assert.equal(flushCalled, false, "flush() ne doit pas être appelé tant que la file contient des chunks");

    // Simulation de la libération progressive de la mémoire par le décompresseur d'images
    // Décrémente progressivement le compteur toutes les 10ms
    const drainInterval = setInterval(() => {
      if (extractor._pendingBitmapsCount > 0) {
        extractor._decrementPendingBitmaps();
      }
      // Dès que tous les chunks sont décodés et flushé, on vide le reste
      if (decodedOrder.length === totalSamples) {
        extractor._pendingBitmapsCount = 0;
      }
    }, 10);

    // Attente que le décodeur ait fini ou timeout de sécurité
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error('Timeout extraction')), 1000);
    });

    await Promise.race([extractionDone, timeoutPromise]);
    clearTimeout(timeoutId);
    clearInterval(drainInterval);

    // VÉRIFICATION :
    // 1. Tous les 40 chunks ont été décodés
    assert.equal(decodedOrder.length, totalSamples, `Tous les ${totalSamples} chunks doivent être décodés`);
    // 2. L'ordre FIFO est strictement respecté : 0, 1, 2, ..., 39
    for (let i = 0; i < totalSamples; i++) {
      assert.equal(decodedOrder[i], i, `Le chunk à l'index ${i} doit être ${i}`);
    }
    // 3. flush() a bien été appelé
    assert.equal(flushCalled, true, "decoder.flush() doit avoir été appelé");
  });

  it('ne doit appeler decoder.flush() qu APRÈS que le dernier chunk a été envoyé au décodeur', async () => {
    const extractor = new EXTRACTOR();
    const totalSamples = 20;
    extractor.nbSamples = totalSamples;
    extractor._pendingBitmapsCount = 0;

    let chunkCountAtFlush = null;
    const decodedChunks = [];

    extractor.decoder = {
      state: 'configured',
      decode: (chunk) => {
        decodedChunks.push(chunk.data[0]);
      },
      flush: async () => {
        chunkCountAtFlush = decodedChunks.length;
      }
    };

    extractor.decodedVideoCB = () => {};

    const samples = Array.from({ length: totalSamples }, (_, i) => createMockSample(i, totalSamples));
    extractor.onSamples(samples);

    // Attendre le vidage complet de la file
    await new Promise((resolve) => setTimeout(resolve, 100));

    assert.equal(decodedChunks.length, totalSamples, "Tous les chunks doivent être décodés");
    assert.equal(chunkCountAtFlush, totalSamples, "flush() doit être appelé exactement après que tous les chunks ont été soumis à decode()");
  });

  it('doit traiter correctement plusieurs lots successifs de onSamples (multi-batch)', async () => {
    const extractor = new EXTRACTOR();
    const totalSamples = 30;
    extractor.nbSamples = totalSamples;
    extractor._pendingBitmapsCount = 10;

    const decoded = [];
    let flushCalls = 0;

    extractor.decoder = {
      state: 'configured',
      decode: (chunk) => {
        decoded.push(chunk.data[0]);
      },
      flush: async () => {
        flushCalls++;
      }
    };

    // Lot 1 : échantillons 0 à 9
    const batch1 = Array.from({ length: 10 }, (_, i) => createMockSample(i, totalSamples));
    extractor.onSamples(batch1);

    await new Promise((resolve) => setTimeout(resolve, 50));
    assert.equal(flushCalls, 0, "flush() ne doit pas être appelé après le premier lot");
    assert.equal(decoded.length, 10, "Le premier lot doit être décodé");

    // Lot 2 : échantillons 10 à 19
    const batch2 = Array.from({ length: 10 }, (_, i) => createMockSample(i + 10, totalSamples));
    extractor.onSamples(batch2);

    await new Promise((resolve) => setTimeout(resolve, 50));
    assert.equal(flushCalls, 0, "flush() ne doit pas être appelé après le deuxième lot");
    assert.equal(decoded.length, 20, "Les deux premiers lots doivent être décodés");

    // Avant le dernier lot, on simule que les bitmaps finissent de se vider
    extractor._pendingBitmapsCount = 0;

    // Lot 3 : échantillons 20 à 29 (dernier échantillon inclus)
    const batch3 = Array.from({ length: 10 }, (_, i) => createMockSample(i + 20, totalSamples));
    extractor.onSamples(batch3);

    await new Promise((resolve) => setTimeout(resolve, 80));
    assert.equal(flushCalls, 1, "flush() doit être appelé après le dernier lot");
    assert.equal(decoded.length, 30, "L'ensemble des 30 échantillons doit être décodé dans l'ordre");

    for (let i = 0; i < 30; i++) {
      assert.equal(decoded[i], i, `Ordre préservé au point ${i}`);
    }
  });

  it('doit réveiller immédiatement la file via _decrementPendingBitmaps sans attendre le délai de sécurité', async () => {
    const extractor = new EXTRACTOR();
    extractor.nbSamples = 10;
    extractor._pendingBitmapsCount = 16; // Au-dessus de 15

    let decodedCount = 0;
    extractor.decoder = {
      state: 'configured',
      decode: () => { decodedCount++; },
      flush: async () => {}
    };

    const samples = Array.from({ length: 10 }, (_, i) => createMockSample(i, 10));
    extractor.onSamples(samples);

    // La file doit être bloquée à 0 car pendingBitmapsCount = 16
    await new Promise((resolve) => setTimeout(resolve, 10));
    assert.equal(decodedCount, 0, "La file doit être en attente de drainage");

    // Réveil réactif : décrémenter sous 15
    const startTime = Date.now();
    extractor._decrementPendingBitmaps(); // passe à 15

    // Attendre un tick microtask
    await new Promise((resolve) => setImmediate ? setImmediate(resolve) : setTimeout(resolve, 5));

    const elapsed = Date.now() - startTime;
    assert.ok(decodedCount > 0, "Le décodage doit avoir repris immédiatement");
    assert.ok(elapsed < 40, `La reprise doit être réactive (<40ms), mesurée à ${elapsed}ms`);

    // Nettoyage
    await extractor.triggerFinish(true);
  });

  it('doit purger la file et annuler les décodages en cours lors d une annulation (wasCanceled)', async () => {
    const extractor = new EXTRACTOR();
    const totalSamples = 50;
    extractor.nbSamples = totalSamples;
    extractor._pendingBitmapsCount = 20; // Bloque la file

    let decodedCount = 0;
    extractor.decoder = {
      state: 'configured',
      decode: () => { decodedCount++; },
      flush: async () => {}
    };

    const samples = Array.from({ length: totalSamples }, (_, i) => createMockSample(i, totalSamples));
    extractor.onSamples(samples);

    assert.equal(extractor._chunkQueue.length, totalSamples, "Tous les chunks sont initialement dans la file");

    // Annulation de l'extraction
    await extractor.triggerFinish(true);

    assert.equal(extractor._chunkQueue.length, 0, "La file doit être vidée lors de l'annulation");
    assert.equal(decodedCount, 0, "Aucun chunk ne doit avoir été décodé");
  });
});
