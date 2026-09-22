import '../helpers/setup.mjs';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import EXTRACTOR from '../../tracker/modules/extractor.js';
import PLAYER from '../../tracker/modules/player.js';

describe('Tracker - Calcul de durée incluant la dernière image (triggerFinish)', () => {

  it('doit calculer une durée complète incluant la dernière image pour une vidéo 30 fps (60 images)', async () => {
    const extractor = new EXTRACTOR();
    extractor.fps = 30;
    const frameCount = 60;
    const interval = 1 / 30; // ~0.033333s

    extractor.decodedVideo = {
      frames: Array.from({ length: frameCount }, (_, i) => ({ id: i })),
      timestamps: Array.from({ length: frameCount }, (_, i) => i * interval)
    };

    let finishedVideo = null;
    extractor.decodedVideoCB = (video) => {
      finishedVideo = video;
    };

    await extractor.triggerFinish(false);

    assert.ok(finishedVideo, "La vidéo décodée doit être retournée");
    // 60 frames à 30 fps = exactement 2000 ms.
    // L'ancien calcul donnait (59 * 1000/30) = 1966.67 ms (omission de la dernière image).
    assert.ok(
      Math.abs(finishedVideo.duration - 2000) < 0.1,
      `La durée calculée doit être de 2000 ms (obtenu: ${finishedVideo.duration} ms)`
    );
  });

  it('doit calculer la durée exacte de 2 images (66.67 ms) sans amputer 50% de la vidéo', async () => {
    const extractor = new EXTRACTOR();
    extractor.fps = 30;
    const interval = 1 / 30;

    extractor.decodedVideo = {
      frames: [{ id: 0 }, { id: 1 }],
      timestamps: [0, interval]
    };

    let finishedVideo = null;
    extractor.decodedVideoCB = (video) => {
      finishedVideo = video;
    };

    await extractor.triggerFinish(false);

    // 2 frames à 30 fps = 2 * (1000 / 30) = 66.667 ms.
    // L'ancien calcul donnait (1 - 0) * (1000/30) = 33.333 ms (erreur de 50%).
    const expected = 2 * interval * 1000;
    assert.ok(
      Math.abs(finishedVideo.duration - expected) < 0.1,
      `La durée pour 2 images doit être de ${expected} ms (obtenu: ${finishedVideo.duration} ms)`
    );
  });

  it('doit attribuer la durée d une image pour une vidéo à image unique (N = 1)', async () => {
    const extractor = new EXTRACTOR();
    extractor.fps = 30;

    extractor.decodedVideo = {
      frames: [{ id: 0 }],
      timestamps: [0]
    };

    let finishedVideo = null;
    extractor.decodedVideoCB = (video) => {
      finishedVideo = video;
    };

    await extractor.triggerFinish(false);

    const expected = 1000 / 30;
    assert.ok(
      Math.abs(finishedVideo.duration - expected) < 0.1,
      `La durée pour 1 image doit être de ${expected} ms (obtenu: ${finishedVideo.duration} ms)`
    );
  });

  it('doit préserver la durée totale de la vidéo lors d une réduction de framerate (fpsReduction)', async () => {
    const extractor = new EXTRACTOR();
    extractor.fps = 30; // fps d'origine

    // 60 images d'origine à 30 fps (2000 ms), sous-échantillonnées à 30 images (1 sur 2)
    // Les timestamps retenus sont 0, 2/30, 4/30, ..., 58/30
    const keptFrames = 30;
    extractor.decodedVideo = {
      frames: Array.from({ length: keptFrames }, (_, i) => ({ id: i })),
      timestamps: Array.from({ length: keptFrames }, (_, i) => (2 * i) / 30)
    };

    let finishedVideo = null;
    extractor.decodedVideoCB = (video) => {
      finishedVideo = video;
    };

    await extractor.triggerFinish(false);

    // Même avec 1 image sur 2, la durée totale de la séquence couverte reste de 2000 ms
    assert.ok(
      Math.abs(finishedVideo.duration - 2000) < 0.1,
      `La durée après réduction fps doit rester de 2000 ms (obtenu: ${finishedVideo.duration} ms)`
    );
  });

  it('doit prendre en compte la cadence de la dernière image en cadence variable (VFR)', async () => {
    const extractor = new EXTRACTOR();
    extractor.fps = 30;

    // Vidéo VFR : 4 images à t = 0, 0.1s, 0.2s, 0.5s (dernière image dure 0.3s)
    extractor.decodedVideo = {
      frames: [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }],
      timestamps: [0, 0.1, 0.2, 0.5]
    };

    let finishedVideo = null;
    extractor.decodedVideoCB = (video) => {
      finishedVideo = video;
    };

    await extractor.triggerFinish(false);

    // Durée attendue = (0.5 + (0.5 - 0.2) - 0) * 1000 = (0.5 + 0.3) * 1000 = 800 ms
    assert.ok(
      Math.abs(finishedVideo.duration - 800) < 0.1,
      `La durée VFR doit être de 800 ms (obtenu: ${finishedVideo.duration} ms)`
    );
  });

  it('doit se replier sur l intervalle moyen en cas de doublon de timestamp à la fin', async () => {
    const extractor = new EXTRACTOR();
    extractor.fps = 30;

    // Timestamps : 0, 0.5, 1.0, 1.0 (doublon sur la dernière)
    // last = 3, intervalle moyen = (1.0 - 0) / 3 = 1/3 s
    extractor.decodedVideo = {
      frames: [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }],
      timestamps: [0, 0.5, 1.0, 1.0]
    };

    let finishedVideo = null;
    extractor.decodedVideoCB = (video) => {
      finishedVideo = video;
    };

    await extractor.triggerFinish(false);

    const expected = (1.0 + 1.0 / 3) * 1000;
    assert.ok(
      Math.abs(finishedVideo.duration - expected) < 0.1,
      `La durée avec doublon doit utiliser l intervalle moyen (attendu: ${expected} ms, obtenu: ${finishedVideo.duration} ms)`
    );
  });

  it('garantit que Player.getFrameInterval(lastIndex) ne renvoie plus 0 ms pour la dernière image', async () => {
    const extractor = new EXTRACTOR();
    extractor.fps = 30;
    const frameCount = 3;
    const interval = 1 / 30;

    extractor.decodedVideo = {
      frames: Array.from({ length: frameCount }, (_, i) => ({ id: i })),
      timestamps: Array.from({ length: frameCount }, (_, i) => i * interval)
    };

    let finishedVideo = null;
    extractor.decodedVideoCB = (video) => {
      finishedVideo = video;
    };

    await extractor.triggerFinish(false);

    const player = Object.create(PLAYER.prototype);
    player.decodedVideo = finishedVideo;

    const lastIndex = frameCount - 1;
    const lastFrameInterval = player.getFrameInterval(lastIndex);

    // Avec l'ancien bogue, getFrameInterval(lastIndex) valait 0 ms.
    // Désormais, il doit valoir ~33.33 ms.
    const expectedIntervalMs = interval * 1000;
    assert.ok(
      Math.abs(lastFrameInterval - expectedIntervalMs) < 0.5,
      `L'intervalle de la dernière frame ne doit pas être 0 ms (attendu: ~${expectedIntervalMs} ms, obtenu: ${lastFrameInterval} ms)`
    );
  });
});
