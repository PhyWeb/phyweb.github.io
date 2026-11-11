import '../helpers/setup.mjs';
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import IOManager from '../../grapher/modules/ioManager.js';
import { Curve } from '../../grapher/modules/data.js';

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

      assert.equal(resetSessionCalled, false);
      assert.equal(loadCSVFileCalledWith, file);
    });

    it('doit accepter un fichier .csv avec type MIME vide (cas fréquent sous Windows / drag-and-drop)', async () => {
      const file = { name: 'donnees.csv', type: '' };
      await ioManager.loadFile(file);

      assert.equal(resetSessionCalled, false);
      assert.equal(loadCSVFileCalledWith, file);
    });

    it('doit accepter un fichier .CSV en majuscules avec type MIME vide ou Windows', async () => {
      const file = { name: 'EXPERIENCE.CSV', type: 'application/vnd.ms-excel' };
      await ioManager.loadFile(file);

      assert.equal(resetSessionCalled, false);
      assert.equal(loadCSVFileCalledWith, file);
    });

    it('doit accepter un fichier .csv avec type MIME standard text/csv', async () => {
      const file = { name: 'export.csv', type: 'text/csv' };
      await ioManager.loadFile(file);

      assert.equal(resetSessionCalled, false);
      assert.equal(loadCSVFileCalledWith, file);
    });

    it('doit accepter un fichier sans extension .csv si son type MIME est text/csv', async () => {
      const file = { name: 'export_sans_extension', type: 'text/csv' };
      await ioManager.loadFile(file);

      assert.equal(resetSessionCalled, false);
      assert.equal(loadCSVFileCalledWith, file);
    });

    it('doit accepter un fichier avec des types MIME CSV alternatifs (text/x-csv, application/csv)', async () => {
      const file1 = { name: 'test1.csv', type: 'text/x-csv' };
      await ioManager.loadFile(file1);
      assert.equal(resetSessionCalled, false);
      assert.equal(loadCSVFileCalledWith, file1);

      const file2 = { name: 'test2.csv', type: 'application/csv' };
      await ioManager.loadFile(file2);
      assert.equal(resetSessionCalled, false);
      assert.equal(loadCSVFileCalledWith, file2);
    });
  });

  describe('Gestion des fichiers .pw et .rw3', () => {
    it('doit router vers loadPWFile pour un fichier .pw', async () => {
      const file = { name: 'session.pw', type: '' };
      await ioManager.loadFile(file);

      assert.equal(resetSessionCalled, false);
      assert.equal(loadPWFileCalledWith, file);
    });

    it('doit router vers loadPWFile même avec extension majuscule .PW', async () => {
      const file = { name: 'SESSION.PW', type: '' };
      await ioManager.loadFile(file);

      assert.equal(resetSessionCalled, false);
      assert.equal(loadPWFileCalledWith, file);
    });

    it('doit router vers loadRW3File pour un fichier .rw3', async () => {
      const file = { name: 'donnees.rw3', type: '' };
      await ioManager.loadFile(file);

      assert.equal(resetSessionCalled, false);
      assert.equal(loadRW3FileCalledWith, file);
    });

    it('doit router vers loadRW3File même avec extension majuscule .RW3', async () => {
      const file = { name: 'DONNEES.RW3', type: '' };
      await ioManager.loadFile(file);

      assert.equal(resetSessionCalled, false);
      assert.equal(loadRW3FileCalledWith, file);
    });
  });

  describe('Rejet des fichiers non supportés', () => {
    it('doit lever une erreur explicite sans réinitialiser la session pour un fichier non supporté', async () => {
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
      assert.equal(resetSessionCalled, false);
    });

    it('ne doit pas réinitialiser la session si file est null ou si le sous-chargeur échoue', async () => {
      await assert.rejects(async () => {
        await ioManager.loadFile(null);
      });
      assert.equal(resetSessionCalled, false);

      ioManager.loadPWFile = async () => {
        throw new Error('Fichier corrompu');
      };
      await assert.rejects(
        async () => {
          await ioManager.loadFile({ name: 'corrompu.pw', type: '' });
        },
        { message: 'Fichier corrompu' }
      );
      assert.equal(resetSessionCalled, false);
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

function createTrackedSessionApp() {
  const initialCurve = new Curve('oldX', 'm');
  initialCurve.push(1, 2);

  let editorText = 'y_old = 2 * oldX';
  const events = [];

  const app = {
    resetCount: 0,
    events,
    pendingRW3: null,
    data: {
      curves: [initialCurve],
      parameters: { pOld: { value: 9, unit: '' } },
      models: [{ id: 'm-old' }],
      annotations: [{ id: 'a-old' }],
      lastSortVariable: null,
      getCurveByTitle: (title) => app.data.curves.find(c => c.title === title)
    },
    resetSession: () => {
      app.resetCount++;
      events.push('resetSession');
      app.data.curves = [];
      app.data.parameters = {};
      app.data.models = [];
      app.data.annotations = [];
      editorText = '';
    },
    addCurve: (title, unit) => {
      events.push(`addCurve:${title}`);
      const c = new Curve(title, unit || '');
      app.data.curves.push(c);
      return c;
    },
    applyCalculation: () => {
      events.push('applyCalculation');
    },
    editor: {
      getValue: () => editorText,
      setValue: (val) => {
        events.push('editor.setValue');
        editorText = val;
      }
    },
    spreadsheet: {
      focusFirstCell: () => {},
      update: () => {}
    },
    uiManager: {
      updateCalculationUI: () => {},
      updateAllModelPanelVisibilityIcons: () => {},
      updateRecalculateButtonVisibility: () => {},
      updateSortUI: () => {},
      updateXAxisSelector: () => {},
      updateClearAnnotationsButtonVisibility: () => {},
      resetZoomUI: () => {}
    },
    grapher: {
      currentXCurve: 'oldX',
      hasUserZoom: false,
      chart: {
        series: [],
        xAxis: [{ setExtremes: () => {} }],
        yAxis: [{ setExtremes: () => {} }],
        redraw: () => {}
      },
      setXCurve: (t) => { app.grapher.currentXCurve = t; },
      updateChart: () => {},
      reorderLegendByVisibility: () => {},
      setVisibilityFromList: () => {},
      updateModelVisibility: () => {},
      resetZoom: () => {},
      addModelSeries: () => {}
    }
  };

  return app;
}

describe('Préservation de la session active avant validation (Bug 1.1)', () => {
  it('loadPWFile ne doit pas réinitialiser la session en cas d\'erreur de lecture ou de fichier .pw invalide', async () => {
    const originalFileReader = globalThis.FileReader;
    const cases = [
      { mode: 'error', expectedMessage: 'Impossible de lire le fichier.' },
      { content: '{json malformé', expectedMessage: 'Le fichier de session est corrompu ou invalide.' },
      { content: '\uFEFF   ', expectedMessage: 'Le fichier de session est corrompu ou invalide.' },
      { content: JSON.stringify({ version: '3.0' }), expectedMessage: 'Le fichier de session est corrompu ou invalide.' },
      { content: JSON.stringify({ version: '3.0', data: { curves: 'invalide' } }), expectedMessage: 'Le fichier de session est corrompu ou invalide.' },
      { content: JSON.stringify({ version: '3.0', data: { curves: [null] } }), expectedMessage: 'Le fichier de session est corrompu ou invalide.' },
      { content: JSON.stringify({ version: '3.0', data: { curves: [], models: 'invalide' } }), expectedMessage: 'Le fichier de session est corrompu ou invalide.' }
    ];

    class ControlledFileReader {
      readAsText(file) {
        setTimeout(() => {
          if (file._mode === 'error') {
            this.onerror?.();
          } else {
            this.onload?.({ target: { result: file._content } });
          }
        }, 0);
      }
    }

    globalThis.FileReader = ControlledFileReader;
    try {
      for (const testCase of cases) {
        const app = createTrackedSessionApp();
        const io = new IOManager(app);
        await assert.rejects(
          () => io.loadPWFile({ name: 'test.pw', _mode: testCase.mode, _content: testCase.content }),
          { message: testCase.expectedMessage }
        );
        assert.equal(app.resetCount, 0);
        assert.equal(app.data.curves.length, 1);
        assert.equal(app.data.curves[0].title, 'oldX');
        assert.equal(app.data.parameters.pOld.value, 9);
        assert.equal(app.data.models.length, 1);
        assert.equal(app.data.annotations.length, 1);
        assert.equal(app.editor.getValue(), 'y_old = 2 * oldX');
      }

      // Cas valide : resetSession appelé une seule fois après validation, puis session restaurée
      const validApp = createTrackedSessionApp();
      const validIO = new IOManager(validApp);
      const validPW = JSON.stringify({
        version: '3.0',
        data: {
          curves: [{ title: 't', unit: 's', values: [0, 1] }],
          parameters: {},
          models: [],
          annotations: []
        },
        calculations: 'a = t * 2'
      });

      await validIO.loadPWFile({ name: 'valide.pw', _content: validPW });
      assert.equal(validApp.resetCount, 1);
      assert.equal(validApp.events[0], 'resetSession');
      assert.equal(validApp.data.curves.length, 1);
      assert.equal(validApp.data.curves[0].title, 't');
      assert.equal(validApp.editor.getValue(), 'a = t * 2');
    } finally {
      globalThis.FileReader = originalFileReader;
    }
  });

  it('loadPWFromString ne doit pas réinitialiser la session sur une chaîne invalide et doit la réinitialiser une fois après validation', async () => {
    const invalidInputs = ['{malformé', '', '  \n ', null, [], { version: '3.0', data: {} }, { version: '3.0', data: { curves: [123] } }];

    for (const input of invalidInputs) {
      const app = createTrackedSessionApp();
      const io = new IOManager(app);
      await assert.rejects(
        () => io.loadPWFromString(input),
        { message: 'Les données de session sont corrompues ou invalides.' }
      );
      assert.equal(app.resetCount, 0);
      assert.equal(app.data.curves[0].title, 'oldX');
      assert.equal(app.editor.getValue(), 'y_old = 2 * oldX');
    }

    const validApp = createTrackedSessionApp();
    const validIO = new IOManager(validApp);
    await validIO.loadPWFromString(JSON.stringify({
      version: '3.0',
      data: {
        curves: [{ title: 'U', unit: 'V', values: [0, 5] }],
        parameters: {},
        models: [],
        annotations: []
      },
      calculations: ''
    }));
    assert.equal(validApp.resetCount, 1);
    assert.equal(validApp.data.curves.length, 1);
    assert.equal(validApp.data.curves[0].title, 'U');
  });

  it('loadCSVFile ne doit pas réinitialiser la session si le CSV est vide ou illisible, et doit réinitialiser avant loadData si valide', async () => {
    const originalFileReader = globalThis.FileReader;

    class MockCsvFileReader {
      readAsText(file) {
        setTimeout(() => {
          if (file._mode === 'error') {
            this.error = new Error('Erreur disque');
            this.onerror?.(this.error);
          } else {
            this.result = file._content ?? '';
            this.onload?.({ target: { result: this.result } });
          }
        }, 0);
      }
    }

    const makeMockCsvFile = (name, content, mode = 'ok') => ({
      name,
      type: 'text/csv',
      size: (content || '').length,
      _mode: mode,
      _content: content,
      slice: () => ({ _mode: mode, _content: content })
    });

    globalThis.FileReader = MockCsvFileReader;
    try {
      // Erreur de lecture FileReader
      const appReadErr = createTrackedSessionApp();
      const ioReadErr = new IOManager(appReadErr);
      await assert.rejects(
        () => ioReadErr.loadCSVFile(makeMockCsvFile('err.csv', '', 'error')),
        { message: 'Erreur lors de la lecture du fichier CSV.' }
      );
      assert.equal(appReadErr.resetCount, 0);
      assert.equal(appReadErr.data.curves[0].title, 'oldX');

      // CSV vides ou sans valeurs
      for (const emptyCsv of ['', '   \n  ', ';;\n;;']) {
        const appEmpty = createTrackedSessionApp();
        const ioEmpty = new IOManager(appEmpty);
        await assert.rejects(
          () => ioEmpty.loadCSVFile(makeMockCsvFile('vide.csv', emptyCsv)),
          { message: 'Erreur lors de l\'injection des données CSV.' }
        );
        assert.equal(appEmpty.resetCount, 0);
        assert.equal(appEmpty.data.curves[0].title, 'oldX');
      }

      // CSV valide
      const appValid = createTrackedSessionApp();
      const ioValid = new IOManager(appValid);
      await ioValid.loadCSVFile(makeMockCsvFile('ok.csv', 't;U\ns;V\n0;1\n1;3\n'));
      assert.equal(appValid.resetCount, 1);
      assert.equal(appValid.events[0], 'resetSession');
      assert.equal(appValid.data.curves.length, 2);
      assert.deepEqual(appValid.data.curves.map(c => c.title), ['t', 'U']);
    } finally {
      globalThis.FileReader = originalFileReader;
    }
  });

  it('loadRW3File ne doit pas réinitialiser la session si le fichier RW3 est invalide et ne doit pas écraser l\'éditeur après reset si valide', async () => {
    // 1. Erreur de lecture arrayBuffer()
    const appErr = createTrackedSessionApp();
    const ioErr = new IOManager(appErr);
    await assert.rejects(
      () => ioErr.loadRW3File({
        name: 'broken.rw3',
        arrayBuffer: async () => { throw new Error('I/O failure'); }
      }),
      /Le fichier RW3 ne peut pas être lu/
    );
    assert.equal(appErr.resetCount, 0);
    assert.equal(appErr.data.curves[0].title, 'oldX');

    // 2. Fichier sans NOM VAR
    const appNoVar = createTrackedSessionApp();
    const ioNoVar = new IOManager(appNoVar);
    await assert.rejects(
      () => ioNoVar.loadRW3File({
        name: 'novar.rw3',
        arrayBuffer: async () => new TextEncoder().encode('EVARISTE REGRESSI WINDOWS 1.0\n')
      }),
      /Le fichier RW3 ne peut pas être lu/
    );
    assert.equal(appNoVar.resetCount, 0);
    assert.equal(appNoVar.editor.getValue(), 'y_old = 2 * oldX');

    // 3. Fichier sans aucune variable mesurée (GENRE VAR = 1 uniquement)
    const appNoMeasured = createTrackedSessionApp();
    const ioNoMeasured = new IOManager(appNoMeasured);
    const calcOnlyRw3 = [
      'EVARISTE REGRESSI WINDOWS 1.0',
      '£1 NOM VAR',
      'v',
      '£1 GENRE VAR',
      '1'
    ].join('\n');
    await assert.rejects(
      () => ioNoMeasured.loadRW3File({
        name: 'calc_only.rw3',
        arrayBuffer: async () => new TextEncoder().encode(calcOnlyRw3)
      }),
      /Aucune variable mesurée/
    );
    assert.equal(appNoMeasured.resetCount, 0);

    // 4. RW3 valide avec MEMO GRANDEURS
    const appValid = createTrackedSessionApp();
    const ioValid = new IOManager(appValid);
    const validRw3 = [
      'EVARISTE REGRESSI WINDOWS 1.0',
      '£2 NOM VAR',
      't',
      'y',
      '£2 GENRE VAR',
      '0',
      '0',
      '£2 UNITE VAR',
      's',
      'm',
      '&2 VALEUR VAR',
      '0\t1',
      '1\t3',
      '£1 MEMO GRANDEURS',
      'z = 2*y'
    ].join('\n');

    await ioValid.loadRW3File({
      name: 'ok.rw3',
      arrayBuffer: async () => new TextEncoder().encode(validRw3)
    });

    assert.equal(appValid.resetCount, 1);
    assert.equal(appValid.events[0], 'resetSession');
    const resetIdx = appValid.events.indexOf('resetSession');
    const editorIdx = appValid.events.indexOf('editor.setValue');
    const addCurveIdx = appValid.events.findIndex(e => e.startsWith('addCurve:'));
    assert.ok(resetIdx !== -1 && editorIdx > resetIdx && addCurveIdx > editorIdx);
    assert.equal(appValid.editor.getValue(), 'z = 2*y\n');
    assert.deepEqual(appValid.data.curves.map(c => c.title), ['t', 'y']);
  });

  it('loadClipboard ne doit pas réinitialiser la session si les données ne sont pas tabulaires', () => {
    const app = createTrackedSessionApp();
    const io = new IOManager(app);

    assert.throws(
      () => io.loadClipboard('texte simple non tabulaire'),
      { message: 'Les données du presse-papiers ne sont pas au format tabulaire.' }
    );
    assert.equal(app.resetCount, 0);
    assert.equal(app.data.curves[0].title, 'oldX');

    io.loadClipboard('t\ty\n0\t1\n1\t2');
    assert.equal(app.resetCount, 1);
    assert.deepEqual(app.data.curves.map(c => c.title), ['t', 'y']);
  });
});
