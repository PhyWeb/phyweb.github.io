import '../helpers/setup.mjs';
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import UIManager from '../../grapher/modules/ui.js';
import ExchangeManager from '../../common/modules/ExchangeManager.js';

function createMockElement(tagName = 'div') {
  const classes = new Set();
  const children = [];
  const el = {
    tagName: tagName.toUpperCase(),
    value: '',
    textContent: '',
    innerHTML: '',
    style: {},
    parentElement: null,
    children,
    classList: {
      add: (...tokens) => tokens.forEach((t) => classes.add(t)),
      remove: (...tokens) => tokens.forEach((t) => classes.delete(t)),
      toggle: (t, force) => {
        if (force === true) classes.add(t);
        else if (force === false) classes.delete(t);
        else if (classes.has(t)) classes.delete(t);
        else classes.add(t);
      },
      contains: (t) => classes.has(t)
    },
    addEventListener: () => {},
    removeEventListener: () => {},
    querySelector: () => null,
    querySelectorAll: () => [],
    setAttribute: () => {},
    removeAttribute: () => {},
    appendChild: (child) => {
      if (child && typeof child === 'object') {
        child.parentElement = el;
        children.push(child);
      }
      return child;
    },
    remove: () => {
      el.parentElement = null;
    },
    onclick: null
  };
  return el;
}

describe('UIManager.initNavbar - détection étendue de hash (styles, modèles, axes, zoom, tri)', () => {
  let ui;
  let mockData;
  let mockEditor;
  let mockGrapher;
  let xExtremes;
  let yExtremes;

  beforeEach(() => {
    mockData = {
      curves: [],
      annotations: [],
      parameters: {},
      models: [],
      lastSortVariable: null
    };

    let editorValue = '';
    mockEditor = {
      getValue: () => editorValue,
      setValue: (val) => { editorValue = val; }
    };

    xExtremes = { min: 0, max: 10, userMin: undefined, userMax: undefined };
    yExtremes = { min: -5, max: 5, userMin: undefined, userMax: undefined };

    mockGrapher = {
      currentXCurve: 't',
      hasUserZoom: false,
      chart: {
        series: [
          { name: 'u', visible: true, options: { id: 'curve-u' } },
          { name: 'model-m1', visible: true, options: { id: 'model-m1' } }
        ],
        xAxis: [{ getExtremes: () => ({ ...xExtremes }) }],
        yAxis: [{ getExtremes: () => ({ ...yExtremes }) }]
      }
    };

    global.__querySelectorOverride = () => createMockElement();

    ui = Object.create(UIManager.prototype);
    ui.data = mockData;
    ui.editor = mockEditor;
    ui.grapher = mockGrapher;
    ui.initNavbar();
  });

  afterEach(() => {
    delete global.__querySelectorOverride;
  });

  function seedBaseCurveAndSave() {
    mockData.curves.push({
      title: 'u',
      unit: 'V',
      color: '#ff0000',
      line: true,
      lineWidth: 2,
      lineStyle: 'Solid',
      markers: true,
      markerSymbol: 'circle',
      markerRadius: 4,
      type: 'recorded',
      values: [0, 2, 4]
    });
    ui.markAsSaved();
    assert.equal(ui.hasUnsavedData(), false);
  }

  it('ignore les états d\'affichage si la session est complètement vide', () => {
    mockGrapher.currentXCurve = 'autre';
    mockGrapher.hasUserZoom = true;
    xExtremes.userMin = 1;
    mockData.lastSortVariable = 't';
    assert.equal(ui.hasUnsavedData(), false);
  });

  it('détecte les modifications des propriétés d\'apparence et type d\'une courbe', () => {
    const cases = [
      { field: 'lineWidth', updated: 4 },
      { field: 'lineStyle', updated: 'Dash' },
      { field: 'markerSymbol', updated: 'square' },
      { field: 'markerRadius', updated: 7 },
      { field: 'type', updated: 'calculated' }
    ];

    for (const { field, updated } of cases) {
      mockData.curves.length = 0;
      seedBaseCurveAndSave();
      mockData.curves[0][field] = updated;
      assert.equal(ui.hasUnsavedData(), true, `La modification de curve.${field} doit être détectée`);
    }
  });

  it('détecte toutes les propriétés persistées d\'un modèle sans erreur de référence circulaire', () => {
    mockData.curves.push({ title: 't', unit: 's', values: [0, 1, 2] });
    const model = {
      id: 'm1',
      title: 'Linéaire',
      expression: 'a*t+b',
      params: { a: 2, b: 0 },
      curveName: 'u',
      xCurveName: 't',
      visible: true,
      color: '#00ff00',
      lineWidth: 2,
      lineStyle: 'Solid',
      minX: 0,
      maxX: 2,
      rmse: 0.01,
      rSquared: 0.999,
      data: mockData // référence circulaire volontaire
    };
    mockData.models.push(model);
    ui.markAsSaved();
    assert.equal(ui.hasUnsavedData(), false);

    const modelUpdates = [
      ['visible', false],
      ['color', '#0000ff'],
      ['lineWidth', 3],
      ['lineStyle', 'Dot'],
      ['minX', 0.5],
      ['maxX', 1.5],
      ['rmse', 0.05],
      ['rSquared', 0.95]
    ];

    for (const [field, updated] of modelUpdates) {
      ui.markAsSaved();
      assert.equal(ui.hasUnsavedData(), false);
      model[field] = updated;
      assert.equal(ui.hasUnsavedData(), true, `La modification de model.${field} doit être détectée`);
    }
  });

  it('détecte les changements d\'axe X, de courbes Y visibles et ignore les séries model-*', () => {
    seedBaseCurveAndSave();

    // Changement d'abscisse
    mockGrapher.currentXCurve = 'x';
    assert.equal(ui.hasUnsavedData(), true);

    ui.markAsSaved();
    assert.equal(ui.hasUnsavedData(), false);

    // Changement de visibilité d'une courbe utilisateur
    mockGrapher.chart.series[0].visible = false;
    assert.equal(ui.hasUnsavedData(), true);

    ui.markAsSaved();
    assert.equal(ui.hasUnsavedData(), false);

    // Visibilité d'une série technique de modèle uniquement : ne doit pas passer par yCurves
    mockGrapher.chart.series[1].visible = false;
    assert.equal(ui.hasUnsavedData(), false);
  });

  it('ne considère pas comme non sauvegardé une permutation de l\'ordre des séries dans chart.series', () => {
    seedBaseCurveAndSave();
    mockGrapher.chart.series = [
      { name: 'u', visible: true, options: { id: 'curve-u' } },
      { name: 'v', visible: true, options: { id: 'curve-v' } }
    ];
    ui.markAsSaved();
    assert.equal(ui.hasUnsavedData(), false);

    // Inversion de l'ordre interne des séries Highcharts
    mockGrapher.chart.series = [
      { name: 'v', visible: true, options: { id: 'curve-v' } },
      { name: 'u', visible: true, options: { id: 'curve-u' } }
    ];
    assert.equal(ui.hasUnsavedData(), false, 'L\'ordre interne de chart.series ne doit pas fausser la détection');
  });

  it('distingue un zoom utilisateur d\'un simple redimensionnement (reflow sans hasUserZoom)', () => {
    seedBaseCurveAndSave();

    // Simule reflow / changement de bornes auto sans zoom utilisateur
    xExtremes.min = -1;
    xExtremes.max = 12;
    yExtremes.min = -10;
    yExtremes.max = 10;
    assert.equal(ui.hasUnsavedData(), false, 'Un reflow sans hasUserZoom ne doit pas marquer la session modifiée');

    // Simule un zoom utilisateur
    mockGrapher.hasUserZoom = true;
    xExtremes.userMin = 1;
    xExtremes.userMax = 6;
    yExtremes.userMin = 0;
    yExtremes.userMax = 3;
    assert.equal(ui.hasUnsavedData(), true);

    // Retour au zoom réinitialisé (état de sauvegarde initial)
    mockGrapher.hasUserZoom = false;
    xExtremes.userMin = undefined;
    xExtremes.userMax = undefined;
    yExtremes.userMin = undefined;
    yExtremes.userMax = undefined;
    assert.equal(ui.hasUnsavedData(), false);

    // Sauvegarde dans un état zoomé puis réinitialisation du zoom
    mockGrapher.hasUserZoom = true;
    xExtremes.userMin = 2;
    xExtremes.userMax = 5;
    ui.markAsSaved();
    assert.equal(ui.hasUnsavedData(), false);

    mockGrapher.hasUserZoom = false;
    xExtremes.userMin = undefined;
    xExtremes.userMax = undefined;
    assert.equal(ui.hasUnsavedData(), true, 'La réinitialisation d\'un zoom sauvegardé doit être détectée');
  });

  it('détecte la modification de data.lastSortVariable', () => {
    seedBaseCurveAndSave();

    mockData.lastSortVariable = 't';
    assert.equal(ui.hasUnsavedData(), true);

    ui.markAsSaved();
    assert.equal(ui.hasUnsavedData(), false);

    mockData.lastSortVariable = 'u';
    assert.equal(ui.hasUnsavedData(), true);
  });
});

describe('UIManager.loadStartupPW + initNavbar - état sauvegardé au démarrage', () => {
  let ui;
  let mockData;
  let mockEditor;
  let createdElements;
  let newFileModal;

  beforeEach(() => {
    createdElements = [];
    mockData = {
      curves: [],
      annotations: [],
      parameters: {},
      models: [],
      lastSortVariable: null
    };
    mockEditor = {
      getValue: () => '',
      setValue: () => {}
    };
    newFileModal = createMockElement('div');

    global.__querySelectorOverride = (sel) => {
      if (sel === '#new-file-modal') return newFileModal;
      if (sel === '.toast-container') return null;
      return createMockElement();
    };
    global.__createElementOverride = (tag) => {
      const el = createMockElement(tag);
      createdElements.push(el);
      return el;
    };

    ui = Object.create(UIManager.prototype);
    ui.data = mockData;
    ui.editor = mockEditor;
    ui.showTabsAndPanels = () => {};
    ui.common = { modalManager: { closeAllModals: () => {} } };
    ui.app = {
      ioManager: {
        loadPWFromString: async () => {
          mockData.curves.push({ title: 't', unit: 's', values: [0, 1, 2] });
        }
      }
    };

    ui.initNavbar();
  });

  afterEach(() => {
    for (const el of createdElements) {
      if (typeof el.onclick === 'function') {
        el.onclick();
      }
    }
    delete global.__querySelectorOverride;
    delete global.__createElementOverride;
  });

  it('laisse hasUnsavedData à true pour un import inter-applications sans markAsSaved', async () => {
    // Même si un hash était enregistré avant l'import, resetSavedState le réinitialise
    ui.markAsSaved();

    await ui.loadStartupPW('{"version":"3.0","curves":[{"title":"t"}]}');

    assert.equal(ui.hasUnsavedData(), true);
  });

  it('laisse hasUnsavedData à true quand { markAsSaved: false } est explicite', async () => {
    await ui.loadStartupPW('{"version":"3.0","curves":[{"title":"t"}]}', { markAsSaved: false });

    assert.equal(ui.hasUnsavedData(), true);
  });

  it('marque la session enregistrée (hasUnsavedData === false) quand { markAsSaved: true } est fourni', async () => {
    await ui.loadStartupPW('{"version":"3.0","curves":[{"title":"t"}]}', { markAsSaved: true });

    assert.equal(ui.hasUnsavedData(), false);

    mockData.curves[0].lineWidth = 5;
    assert.equal(ui.hasUnsavedData(), true);
  });

  it('rétablit hasUnsavedData à false après remplacement par un fichier via loadFileWithFeedback', async () => {
    // 1. Démarrage avec données Tracker non sauvegardées
    await ui.loadStartupPW('{"version":"3.0","curves":[{"title":"t"}]}', { markAsSaved: false });
    assert.equal(ui.hasUnsavedData(), true, 'L\'import Tracker doit initialement être non sauvegardé');

    // 2. Préparation du mock de ioManager.loadFile
    let loadFileCalled = false;
    ui.app.ioManager.loadFile = async (file) => {
      loadFileCalled = true;
      mockData.curves = [{ title: 'x', unit: 'm', values: [1, 2] }];
      if (ui.grapher?.chart) {
        ui.grapher.chart.series = [{ name: 'x', visible: true, options: { id: 'curve-x' } }];
      }
    };

    let alertModalConfig = null;
    ui.navManager.alertModal = (cfg) => {
      alertModalConfig = cfg;
    };

    const dummyFile = new File(['{"version":"3.0"}'], 'test.pw', { type: 'application/json' });
    const loadPromise = ui.loadFileWithFeedback(dummyFile, { showModalSpinner: true });

    assert.ok(alertModalConfig, 'Une alerte de confirmation doit être demandée car des données étaient présentes');
    // L\'utilisateur confirme le remplacement
    alertModalConfig.confirm.cb();

    await loadPromise;
    // Attendre la temporisation de stabilisation de loadFileWithFeedback (50ms)
    await new Promise(r => setTimeout(r, 60));

    assert.equal(loadFileCalled, true, 'ioManager.loadFile doit avoir été exécuté');
    assert.equal(ui.hasUnsavedData(), false, 'Après remplacement par le fichier, la session doit être marquée enregistrée');
  });
});

describe('ExchangeManager.checkStartupData - propagation du drapeau markAsSaved', () => {
  let origElectronAPI;
  let origIndexedDB;
  let createdElements;

  beforeEach(() => {
    createdElements = [];
    origElectronAPI = window.electronAPI;
    origIndexedDB = global.indexedDB;
    global.__createElementOverride = (tag) => {
      const el = createMockElement(tag);
      createdElements.push(el);
      return el;
    };
  });

  afterEach(() => {
    for (const el of createdElements) {
      if (typeof el.onclick === 'function') {
        el.onclick();
      }
    }
    if (origElectronAPI === undefined) delete window.electronAPI;
    else window.electronAPI = origElectronAPI;

    if (origIndexedDB === undefined) delete global.indexedDB;
    else global.indexedDB = origIndexedDB;

    delete global.__createElementOverride;
  });

  it('transmet { markAsSaved: true } pour un payload Electron issu d\'un fichier disque', async () => {
    let receivedArgs = null;
    window.electronAPI = {
      onImportData: (cb) => cb({ data: '{"version":"3.0"}', markAsSaved: true })
    };

    await ExchangeManager.checkStartupData((data, options) => {
      receivedArgs = { data, options };
    });

    assert.deepEqual(receivedArgs, {
      data: '{"version":"3.0"}',
      options: { markAsSaved: true }
    });
  });

  it('transmet { markAsSaved: false } pour un transfert Electron inter-applications', async () => {
    let receivedArgs = null;
    window.electronAPI = {
      onImportData: (cb) => cb({ data: '{"version":"3.0"}', markAsSaved: false })
    };

    await ExchangeManager.checkStartupData((data, options) => {
      receivedArgs = { data, options };
    });

    assert.deepEqual(receivedArgs, {
      data: '{"version":"3.0"}',
      options: { markAsSaved: false }
    });
  });

  it('utilise { markAsSaved: false } par repli si Electron envoie une chaîne brute', async () => {
    let receivedArgs = null;
    window.electronAPI = {
      onImportData: (cb) => cb('{"version":"3.0"}')
    };

    await ExchangeManager.checkStartupData((data, options) => {
      receivedArgs = { data, options };
    });

    assert.deepEqual(receivedArgs, {
      data: '{"version":"3.0"}',
      options: { markAsSaved: false }
    });
  });

  it('transmet { markAsSaved: false } pour un transfert Web via IndexedDB et nettoie le store', async () => {
    delete window.electronAPI;
    const deletedKeys = [];
    const fakeStore = {
      get: () => {
        const req = { result: '{"version":"3.0"}', onsuccess: null, onerror: null };
        queueMicrotask(() => req.onsuccess?.());
        return req;
      },
      delete: (key) => {
        deletedKeys.push(key);
      }
    };
    const fakeDb = {
      objectStoreNames: { contains: () => true },
      transaction: () => ({
        objectStore: () => fakeStore
      })
    };
    global.indexedDB = {
      open: () => {
        const req = { result: fakeDb, onupgradeneeded: null, onsuccess: null, onerror: null };
        queueMicrotask(() => req.onsuccess?.());
        return req;
      }
    };

    let receivedArgs = null;
    await ExchangeManager.checkStartupData((data, options) => {
      receivedArgs = { data, options };
    });

    assert.deepEqual(deletedKeys, [ExchangeManager.STORAGE_KEY]);
    assert.deepEqual(receivedArgs, {
      data: '{"version":"3.0"}',
      options: { markAsSaved: false }
    });
  });
});
