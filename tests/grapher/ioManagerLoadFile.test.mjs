import '../helpers/setup.mjs';
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import IOManager from '../../grapher/modules/ioManager.js';

describe('IOManager - loadFile() et détection du format de fichier', () => {
  let ioManager;
  let resetSessionCalled;
  let loadPWFileCalledWith;
  let loadCSVFileCalledWith;
  let loadRW3FileCalledWith;

  beforeEach(() => {
    resetSessionCalled = false;
    loadPWFileCalledWith = null;
    loadCSVFileCalledWith = null;
    loadRW3FileCalledWith = null;

    const mockApp = {
      resetSession: () => {
        resetSessionCalled = true;
      }
    };

    ioManager = new IOManager(mockApp);
    ioManager.loadPWFile = async (file) => {
      loadPWFileCalledWith = file;
    };
    ioManager.loadCSVFile = async (file) => {
      loadCSVFileCalledWith = file;
    };
    ioManager.loadRW3File = async (file) => {
      loadRW3FileCalledWith = file;
    };
  });

  describe('Gestion des fichiers CSV', () => {
    it('doit accepter un fichier .csv avec type MIME Windows/Excel (application/vnd.ms-excel)', async () => {
      const file = { name: 'mesures.csv', type: 'application/vnd.ms-excel' };
      await ioManager.loadFile(file);

      assert.equal(resetSessionCalled, true);
      assert.equal(loadCSVFileCalledWith, file);
    });

    it('doit accepter un fichier .csv avec type MIME vide (cas fréquent sous Windows / drag-and-drop)', async () => {
      const file = { name: 'donnees.csv', type: '' };
      await ioManager.loadFile(file);

      assert.equal(resetSessionCalled, true);
      assert.equal(loadCSVFileCalledWith, file);
    });

    it('doit accepter un fichier .CSV en majuscules avec type MIME vide ou Windows', async () => {
      const file = { name: 'EXPERIENCE.CSV', type: 'application/vnd.ms-excel' };
      await ioManager.loadFile(file);

      assert.equal(resetSessionCalled, true);
      assert.equal(loadCSVFileCalledWith, file);
    });

    it('doit accepter un fichier .csv avec type MIME standard text/csv', async () => {
      const file = { name: 'export.csv', type: 'text/csv' };
      await ioManager.loadFile(file);

      assert.equal(resetSessionCalled, true);
      assert.equal(loadCSVFileCalledWith, file);
    });

    it('doit accepter un fichier sans extension .csv si son type MIME est text/csv', async () => {
      const file = { name: 'export_sans_extension', type: 'text/csv' };
      await ioManager.loadFile(file);

      assert.equal(resetSessionCalled, true);
      assert.equal(loadCSVFileCalledWith, file);
    });

    it('doit accepter un fichier avec des types MIME CSV alternatifs (text/x-csv, application/csv)', async () => {
      const file1 = { name: 'test1.csv', type: 'text/x-csv' };
      await ioManager.loadFile(file1);
      assert.equal(loadCSVFileCalledWith, file1);

      const file2 = { name: 'test2.csv', type: 'application/csv' };
      await ioManager.loadFile(file2);
      assert.equal(loadCSVFileCalledWith, file2);
    });
  });

  describe('Gestion des fichiers .pw et .rw3', () => {
    it('doit router vers loadPWFile pour un fichier .pw', async () => {
      const file = { name: 'session.pw', type: '' };
      await ioManager.loadFile(file);

      assert.equal(resetSessionCalled, true);
      assert.equal(loadPWFileCalledWith, file);
    });

    it('doit router vers loadPWFile même avec extension majuscule .PW', async () => {
      const file = { name: 'SESSION.PW', type: '' };
      await ioManager.loadFile(file);

      assert.equal(resetSessionCalled, true);
      assert.equal(loadPWFileCalledWith, file);
    });

    it('doit router vers loadRW3File pour un fichier .rw3', async () => {
      const file = { name: 'donnees.rw3', type: '' };
      await ioManager.loadFile(file);

      assert.equal(resetSessionCalled, true);
      assert.equal(loadRW3FileCalledWith, file);
    });

    it('doit router vers loadRW3File même avec extension majuscule .RW3', async () => {
      const file = { name: 'DONNEES.RW3', type: '' };
      await ioManager.loadFile(file);

      assert.equal(resetSessionCalled, true);
      assert.equal(loadRW3FileCalledWith, file);
    });
  });

  describe('Rejet des fichiers non supportés', () => {
    it('doit lever une erreur explicite pour un fichier non supporté', async () => {
      const file = { name: 'image.png', type: 'image/png' };

      await assert.rejects(
        async () => {
          await ioManager.loadFile(file);
        },
        {
          name: 'Error',
          message: 'Le type de fichier "image.png" n\'est pas supporté.'
        }
      );
    });
  });
});

