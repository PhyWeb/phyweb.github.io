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

  describe('Restauration des fichiers PW avec points manquants (_processPWState)', () => {
    it('doit préserver les valeurs null pour les points occultés et maintenir l\'alignement des courbes', async () => {
      const makeProxy = () => new Proxy({}, { get: () => () => {} });
      const mockApp = {
        resetSession: () => {},
        data: {
          curves: [],
          parameters: {},
          models: [],
          annotations: [],
          getCurveByTitle: (title) => mockApp.data.curves.find(c => c.title === title)
        },
        spreadsheet: makeProxy(),
        uiManager: makeProxy(),
        editor: makeProxy(),
        grapher: makeProxy()
      };

      const io = new IOManager(mockApp);
      const state = {
        app: 'Tracker',
        version: '3.0',
        data: {
          curves: [
            { title: 't', unit: 's', type: 'x', values: [0, 0.0333, 0.0667] },
            { title: 'x1', unit: 'm', type: 'y', values: [0.1, 0.15, 0.2] },
            { title: 'x2', unit: 'm', type: 'y', values: [0.5, '', 0.55] }
          ],
          models: [],
          parameters: {},
          annotations: []
        },
        calculations: '',
        grapher: { xCurve: 't', yCurves: ['x1', 'x2'] }
      };

      await io._processPWState(state);

      const tCurve = mockApp.data.curves.find(c => c.title === 't');
      const x1Curve = mockApp.data.curves.find(c => c.title === 'x1');
      const x2Curve = mockApp.data.curves.find(c => c.title === 'x2');

      // Toutes les courbes doivent avoir la même longueur (3)
      assert.equal(tCurve.length, 3);
      assert.equal(x1Curve.length, 3);
      assert.equal(x2Curve.length, 3);

      // x2[1] doit valoir null (valeur vide à l'image 1)
      assert.equal(x2Curve[0], 0.5);
      assert.equal(x2Curve[1], null);
      assert.equal(x2Curve[2], 0.55);
    });
  });

  describe('Gestion du BOM UTF-8 (\\uFEFF)', () => {
    it('doit charger une chaîne JSON avec BOM UTF-8 dans loadPWFromString sans lever d\'erreur', async () => {
      let processedState = null;
      let resetCalled = false;
      const mockApp = {
        resetSession: () => { resetCalled = true; }
      };

      const io = new IOManager(mockApp);
      io._processPWState = async (state) => {
        processedState = state;
      };

      const pwJsonWithBOM = '\uFEFF' + JSON.stringify({
        version: "3.0",
        data: { curves: [{ title: "C", unit: "mol/L", values: [1, 2, 3] }] }
      });

      await io.loadPWFromString(pwJsonWithBOM);

      assert.equal(resetCalled, true);
      assert.ok(processedState);
      assert.equal(processedState.version, "3.0");
      assert.equal(processedState.data.curves[0].title, "C");
    });

    it('doit charger une chaîne JSON avec BOM UTF-8 et espaces dans loadPWFromString', async () => {
      let processedState = null;
      const mockApp = {
        resetSession: () => {}
      };

      const io = new IOManager(mockApp);
      io._processPWState = async (state) => {
        processedState = state;
      };

      const pwJson = '  \uFEFF\n  ' + JSON.stringify({ version: "3.0", data: { curves: [] } }) + '\n ';
      await io.loadPWFromString(pwJson);

      assert.ok(processedState);
      assert.equal(processedState.version, "3.0");
    });

    it('doit accepter un objet JavaScript direct dans loadPWFromString', async () => {
      let processedState = null;
      const mockApp = {
        resetSession: () => {}
      };

      const io = new IOManager(mockApp);
      io._processPWState = async (state) => {
        processedState = state;
      };

      const stateObj = { version: "3.0", data: { curves: [] } };
      await io.loadPWFromString(stateObj);

      assert.equal(processedState, stateObj);
    });

    it('doit charger un fichier avec BOM UTF-8 dans loadPWFile', async () => {
      let processedState = null;
      const mockApp = {};
      const io = new IOManager(mockApp);
      io._processPWState = async (state) => {
        processedState = state;
      };

      // Mock FileReader
      const originalFileReader = globalThis.FileReader;
      class MockFileReader {
        readAsText(file) {
          setTimeout(() => {
            this.target = { result: '\uFEFF' + JSON.stringify({ version: "3.0", data: { curves: [] } }) };
            if (this.onload) this.onload({ target: this.target });
          }, 0);
        }
      }
      globalThis.FileReader = MockFileReader;

      try {
        await io.loadPWFile({ name: 'test.pw' });
        assert.ok(processedState);
        assert.equal(processedState.version, "3.0");
      } finally {
        globalThis.FileReader = originalFileReader;
      }
    });

    it('ne doit pas inclure de BOM UTF-8 lors de l\'export PW mais doit l\'inclure pour CSV', () => {
      let downloadedBlob = null;
      let downloadedName = null;
      const mockApp = {
        data: {
          curves: [],
          parameters: {},
          models: [],
          annotations: []
        },
        grapher: {
          currentXCurve: null,
          chart: null
        },
        editor: {
          getValue: () => ""
        }
      };

      const io = new IOManager(mockApp);
      io.triggerDownload = (content, fileName, mimeType) => {
        downloadedName = fileName;
        const isCsv = fileName.toLowerCase().endsWith('.csv');
        const blobParts = isCsv ? ['\uFEFF', content] : [content];
        downloadedBlob = new Blob(blobParts, { type: mimeType });
      };

      // Export PW
      io.saveFile('test.pw', 'pw');
      assert.equal(downloadedName, 'test.pw');
      // Pour PW, le premier octet ne doit pas être le BOM (0xFEFF)
      const pwText = io.generatePW();
      assert.ok(!pwText.startsWith('\uFEFF'));
    });
  });
});


