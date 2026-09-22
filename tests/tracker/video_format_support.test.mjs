import '../helpers/setup.mjs';
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { isSupportedVideoFile } from '../../tracker/modules/videoValidator.js';

describe('Tracker - Support des formats vidéo (.mp4 et .m4v)', () => {
  describe('isSupportedVideoFile', () => {
    it('doit accepter un fichier .mp4 avec type MIME standard video/mp4', () => {
      const file = { name: 'experience.mp4', type: 'video/mp4' };
      assert.equal(isSupportedVideoFile(file), true);
    });

    it('doit accepter un fichier .m4v avec type MIME video/x-m4v', () => {
      const file = { name: 'chute_libre.m4v', type: 'video/x-m4v' };
      assert.equal(isSupportedVideoFile(file), true);
    });

    it('doit accepter un fichier .m4v avec type MIME video/mp4', () => {
      const file = { name: 'chute_libre.m4v', type: 'video/mp4' };
      assert.equal(isSupportedVideoFile(file), true);
    });

    it('doit accepter un fichier .m4v avec type MIME video/m4v', () => {
      const file = { name: 'chute_libre.m4v', type: 'video/m4v' };
      assert.equal(isSupportedVideoFile(file), true);
    });

    it('doit accepter un fichier .m4v avec type MIME vide "" (comportement fréquent sur Windows)', () => {
      const file = { name: 'oscillation.m4v', type: '' };
      assert.equal(isSupportedVideoFile(file), true);
    });

    it('doit accepter un fichier .mp4 avec type MIME vide ""', () => {
      const file = { name: 'pendule.mp4', type: '' };
      assert.equal(isSupportedVideoFile(file), true);
    });

    it('doit accepter les extensions en majuscules (.M4V et .MP4)', () => {
      assert.equal(isSupportedVideoFile({ name: 'MESURE.M4V', type: '' }), true);
      assert.equal(isSupportedVideoFile({ name: 'MESURE.MP4', type: '' }), true);
      assert.equal(isSupportedVideoFile({ name: 'EXPERIENCE.M4V', type: 'VIDEO/X-M4V' }), true);
    });

    it('doit accepter un Blob/File sans propriété name si le type MIME est valide', () => {
      assert.equal(isSupportedVideoFile({ type: 'video/mp4' }), true);
      assert.equal(isSupportedVideoFile({ type: 'video/x-m4v' }), true);
    });

    it('doit rejeter les formats vidéo non supportés (.avi, .webm, .mkv, etc.)', () => {
      assert.equal(isSupportedVideoFile({ name: 'video.avi', type: 'video/x-msvideo' }), false);
      assert.equal(isSupportedVideoFile({ name: 'video.avi', type: '' }), false);
      assert.equal(isSupportedVideoFile({ name: 'video.webm', type: 'video/webm' }), false);
      assert.equal(isSupportedVideoFile({ name: 'video.mkv', type: 'video/x-matroska' }), false);
      assert.equal(isSupportedVideoFile({ name: 'video.mov', type: 'video/quicktime' }), false);
    });

    it('doit rejeter les fichiers non vidéo (.pdf, .png, .txt)', () => {
      assert.equal(isSupportedVideoFile({ name: 'document.pdf', type: 'application/pdf' }), false);
      assert.equal(isSupportedVideoFile({ name: 'image.png', type: 'image/png' }), false);
      assert.equal(isSupportedVideoFile({ name: 'notes.txt', type: 'text/plain' }), false);
    });

    it('doit rejeter les extensions leurres (ex: video.mp4.exe ou video.m4v.txt)', () => {
      assert.equal(isSupportedVideoFile({ name: 'video.mp4.exe', type: 'application/x-msdownload' }), false);
      assert.equal(isSupportedVideoFile({ name: 'video.m4v.txt', type: 'text/plain' }), false);
    });

    it('doit retourner false en cas de fichier absent ou vide', () => {
      assert.equal(isSupportedVideoFile(null), false);
      assert.equal(isSupportedVideoFile(undefined), false);
      assert.equal(isSupportedVideoFile({}), false);
    });
  });

  describe('Simulation des flux de chargement (file-input et drag-and-drop)', () => {
    let alertCalled = false;
    let alertOptions = null;
    let playerLoadedFile = null;
    let modalsClosed = 0;

    const mockModalManager = {
      closeAllModals: () => { modalsClosed++; }
    };

    const mockNavManager = {
      confirmAction: (callback) => { callback(); }
    };

    const mockPlayer = {
      load: (file) => { playerLoadedFile = file; }
    };

    const mockAlertModal = (options) => {
      alertCalled = true;
      alertOptions = options;
    };

    beforeEach(() => {
      alertCalled = false;
      alertOptions = null;
      playerLoadedFile = null;
      modalsClosed = 0;
    });

    // Logique du handler de l'input #file-input
    const handleFileInput = (file) => {
      if (!file) return;
      if (!isSupportedVideoFile(file)) {
        mockModalManager.closeAllModals();
        mockAlertModal({
          type: "danger",
          title: "Codec video non supporté",
          body: "La vidéo doit être au format mp4 ou m4v"
        });
        return;
      }

      mockModalManager.closeAllModals();
      mockNavManager.confirmAction(() => {
        mockModalManager.closeAllModals();
        mockPlayer.load(file);
      });
    };

    // Logique du handler du drag and drop
    const handleFileDrop = (file) => {
      if (!file) return;
      if (!isSupportedVideoFile(file)) {
        mockAlertModal({
          type: "danger",
          title: "Codec video non supporté",
          body: "La vidéo doit être au format mp4 ou m4v"
        });
        return;
      }

      mockModalManager.closeAllModals();
      mockNavManager.confirmAction(() => {
        mockPlayer.load(file);
      });
    };

    it('#file-input : doit accepter un fichier .m4v avec MIME video/x-m4v sans alerter', () => {
      const file = { name: 'test.m4v', type: 'video/x-m4v' };
      handleFileInput(file);

      assert.equal(alertCalled, false, 'Ne doit pas afficher d\'alerte pour .m4v');
      assert.equal(playerLoadedFile, file, 'Le player doit avoir reçu le fichier');
      assert.ok(modalsClosed >= 2, 'Les modales doivent être fermées');
    });

    it('#file-input : doit accepter un fichier .m4v avec MIME vide sous Windows sans alerter', () => {
      const file = { name: 'windows_video.m4v', type: '' };
      handleFileInput(file);

      assert.equal(alertCalled, false, 'Ne doit pas afficher d\'alerte pour .m4v sans type MIME');
      assert.equal(playerLoadedFile, file);
    });

    it('#file-input : doit rejeter un format non supporté et afficher l\'alerte', () => {
      const file = { name: 'incompatible.avi', type: 'video/x-msvideo' };
      handleFileInput(file);

      assert.equal(alertCalled, true, 'Doit afficher une alerte pour format non supporté');
      assert.equal(alertOptions.title, 'Codec video non supporté');
      assert.equal(playerLoadedFile, null, 'Le player ne doit pas charger le fichier');
    });

    it('videoDropManager : doit accepter un fichier .m4v sans MIME déposé en drag-and-drop', () => {
      const file = { name: 'dropped.m4v', type: '' };
      handleFileDrop(file);

      assert.equal(alertCalled, false);
      assert.equal(playerLoadedFile, file);
    });

    it('videoDropManager : doit rejeter un fichier incompatible déposé en drag-and-drop', () => {
      const file = { name: 'dropped.mkv', type: 'video/x-matroska' };
      handleFileDrop(file);

      assert.equal(alertCalled, true);
      assert.equal(playerLoadedFile, null);
    });
  });
});

