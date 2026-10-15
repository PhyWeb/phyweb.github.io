import '../helpers/setup.mjs';
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import UIManager from '../../grapher/modules/ui.js';
import App from '../../grapher/modules/app.js';

describe('UIManager - markAsSaved() et détection des données non sauvegardées (hasUnsavedData)', () => {
  let ui;
  let mockData;
  let mockEditor;
  let mockNavManager;
  let hasUnsavedDataCallback;

  beforeEach(() => {
    mockData = {
      curves: [],
      annotations: [],
      parameters: {},
      models: []
    };

    let editorValue = '';
    mockEditor = {
      getValue: () => editorValue,
      setValue: (val) => { editorValue = val; }
    };

    mockNavManager = null;
    hasUnsavedDataCallback = null;

    global.__querySelectorOverride = (sel) => {
      return {
        classList: { add: () => {}, remove: () => {}, toggle: () => {}, contains: () => false },
        querySelector: () => null,
        querySelectorAll: () => [],
        addEventListener: () => {}
      };
    };

    ui = Object.create(UIManager.prototype);
    ui.data = mockData;
    ui.editor = mockEditor;

    // Instanciation de initNavbar pour lier markAsSaved et hasUnsavedData
    ui.initNavbar();
  });

  it('doit considérer une session vide initiale comme exempte de données non enregistrées', () => {
    assert.equal(ui.hasUnsavedData(), false);
  });

  it('doit détecter des données non enregistrées dès qu\'une courbe est ajoutée', () => {
    mockData.curves.push({
      title: 'v',
      unit: 'm/s',
      color: '#ff0000',
      line: true,
      markers: true,
      values: [1, 2, 3]
    });

    assert.equal(ui.hasUnsavedData(), true);
  });

  it('doit retourner false pour hasUnsavedData après l\'appel à markAsSaved()', () => {
    mockData.curves.push({
      title: 'v',
      unit: 'm/s',
      color: '#ff0000',
      line: true,
      markers: true,
      values: [1, 2, 3]
    });
    assert.equal(ui.hasUnsavedData(), true);

    ui.markAsSaved();
    assert.equal(ui.hasUnsavedData(), false, 'Après markAsSaved, les données sont considérées enregistrées');
  });

  it('doit redétecter des données non enregistrées si les valeurs d\'une courbe sont modifiées', () => {
    const curve = [1, 2, 3];
    curve.title = 'v';
    curve.unit = 'm/s';
    curve.color = '#ff0000';
    mockData.curves.push(curve);

    ui.markAsSaved();
    assert.equal(ui.hasUnsavedData(), false);

    // Modification d'une valeur dans la courbe
    curve.push(4);
    assert.equal(ui.hasUnsavedData(), true, 'L\'ajout d\'un point doit être détecté comme non enregistré');
  });

  it('doit détecter une modification du titre ou de l\'unité d\'une courbe', () => {
    const curve = [10, 20];
    curve.title = 'v';
    curve.unit = 'm/s';
    mockData.curves.push(curve);

    ui.markAsSaved();
    assert.equal(ui.hasUnsavedData(), false);

    // Renommage
    curve.title = 'v_corrigee';
    assert.equal(ui.hasUnsavedData(), true, 'Le renommage de courbe doit être détecté');
  });

  it('doit détecter l\'ajout ou la modification de code dans l\'éditeur de calculs', () => {
    ui.markAsSaved();
    assert.equal(ui.hasUnsavedData(), false);

    mockEditor.setValue('x = t * 2');
    assert.equal(ui.hasUnsavedData(), true, 'La saisie dans le script de calculs doit être détectée');

    ui.markAsSaved();
    assert.equal(ui.hasUnsavedData(), false);

    mockEditor.setValue('x = t * 3');
    assert.equal(ui.hasUnsavedData(), true);
  });

  it('doit détecter l\'ajout d\'annotations sur le graphique', () => {
    ui.markAsSaved();
    assert.equal(ui.hasUnsavedData(), false);

    mockData.annotations.push({ id: 'ann-1', type: 'point', x: 2, y: 5 });
    assert.equal(ui.hasUnsavedData(), true, 'L\'ajout d\'une annotation doit être détecté');

    ui.markAsSaved();
    assert.equal(ui.hasUnsavedData(), false);
  });

  it('doit détecter l\'ajout de modèles mathématiques sans erreur de référence circulaire', () => {
    const curveX = [1, 2]; curveX.title = 't';
    const curveY = [2, 4]; curveY.title = 'y';

    ui.markAsSaved();
    assert.equal(ui.hasUnsavedData(), false);

    // Modèle contenant une référence circulaire vers mockData (comme en production)
    const mockModel = {
      id: 'model-1',
      type: 'linear',
      x: curveX,
      y: curveY,
      data: mockData, // Référence circulaire potentielle
      parameters: [{ name: 'a', value: 2 }]
    };
    mockData.models.push(mockModel);

    assert.doesNotThrow(() => {
      const unsaved = ui.hasUnsavedData();
      assert.equal(unsaved, true, 'L\'ajout d\'un modèle doit être détecté sans crash circulaire');
    });

    ui.markAsSaved();
    assert.equal(ui.hasUnsavedData(), false);
  });

  it('doit réinitialiser l\'état via resetSavedState()', () => {
    mockData.curves.push({ title: 't', unit: 's', values: [1] });
    ui.markAsSaved();
    assert.equal(ui.hasUnsavedData(), false);

    ui.resetSavedState();
    // Les données sont toujours présentes mais l'état sauvegardé a été réinitialisé
    assert.equal(ui.hasUnsavedData(), true);
  });
});

describe('Intégration App.resetSession() et UIManager.resetSavedState()', () => {
  it('doit appeler resetSavedState lors de app.resetSession()', () => {
    let resetSavedStateCalled = false;
    const mockUiManager = {
      updateRecalculateButtonVisibility: () => {},
      updateModelToolVisibility: () => {},
      clearActiveTool: () => {},
      updateCalculationUI: () => {},
      updateSortUI: () => {},
      updateXAxisSelector: () => {},
      resetSavedState: () => {
        resetSavedStateCalled = true;
      }
    };

    const mockGrapher = {
      clearAllAnnotations: () => {},
      deleteAllCurves: () => {}
    };

    const mockData = {
      models: [],
      deleteAllCurves: () => {},
      parameters: {}
    };

    const mockEditor = { setValue: () => {} };
    const mockCalculation = { clear: () => {} };
    const mockSpreadsheet = { clear: () => {}, build: () => {} };

    const app = new App(mockData, mockSpreadsheet, mockGrapher, mockCalculation, mockEditor, mockUiManager);
    app.resetSession();

    assert.equal(resetSavedStateCalled, true, 'resetSession doit réinitialiser l\'état de sauvegarde de l\'UI');
  });
});

describe('Intégration UIManager.initFileModals() et markAsSaved lors du chargement de fichier', () => {
  let ui;
  let mockApp;
  let mockData;
  let mockEditor;
  let fileInputListener;
  let dropListener;

  beforeEach(() => {
    mockData = {
      curves: [],
      annotations: [],
      parameters: {},
      models: []
    };

    let script = '';
    mockEditor = {
      getValue: () => script,
      setValue: (val) => { script = val; }
    };

    mockApp = {
      ioManager: {
        loadFile: async (file) => {
          // Simuler le chargement des courbes depuis le fichier (chaque courbe est un Array en production)
          const loadedCurve = [0, 1, 2];
          loadedCurve.title = 't';
          loadedCurve.unit = 's';
          loadedCurve.color = '#000000';
          mockData.curves = [loadedCurve];
        }
      }
    };

    fileInputListener = null;
    dropListener = null;

    global.__querySelectorOverride = (sel) => {
      if (sel === '#file-input') {
        return {
          addEventListener: (type, fn) => {
            if (type === 'change') fileInputListener = fn;
          }
        };
      }
      return {
        classList: { add: () => {}, remove: () => {}, toggle: () => {}, contains: () => false },
        querySelector: () => null,
        querySelectorAll: () => [],
        addEventListener: () => {}
      };
    };

    ui = Object.create(UIManager.prototype);
    ui.app = mockApp;
    ui.data = mockData;
    ui.editor = mockEditor;
    ui.common = { modalManager: { closeAllModals: () => {} } };
    ui.setModalLoading = () => {};
    ui.showTabsAndPanels = () => {};

    // Initialiser navbar pour lier navManager et markAsSaved
    ui.initNavbar();

    // Remplacer confirmAction par une exécution immédiate
    ui.navManager.confirmAction = (callback) => callback();

    // Initialiser les modales de fichiers
    ui.initFileModals();
  });

  it('doit marquer la session comme enregistrée après ouverture d\'un fichier via #file-input', async () => {
    // Session vide au début
    assert.equal(ui.hasUnsavedData(), false);

    // Déclencher le chargement d'un fichier via #file-input
    assert.ok(fileInputListener, 'Le listener change sur #file-input doit être enregistré');
    const dummyFile = { name: 'experience.pw' };
    await fileInputListener({ target: { files: [dummyFile] } });

    // Les courbes ont été chargées
    assert.equal(mockData.curves.length, 1);
    // Puisque markAsSaved a été appelé, hasUnsavedData doit être false !
    assert.equal(ui.hasUnsavedData(), false, 'hasUnsavedData doit être false immédiatement après l\'ouverture du fichier');

    // Si on modifie une donnée ensuite, hasUnsavedData doit devenir true
    mockData.curves[0].push(3);
    assert.equal(ui.hasUnsavedData(), true, 'hasUnsavedData doit être true après modification de données');
  });

  it('doit marquer la session comme enregistrée après chargement par drag-and-drop', async () => {
    assert.equal(ui.hasUnsavedData(), false);

    assert.ok(ui.fileDropManager, 'fileDropManager doit être initialisé');
    const dummyFile = { name: 'experience.csv' };

    // Simuler le callback de drag & drop
    await ui.fileDropManager.onDropCallback(dummyFile);

    assert.equal(mockData.curves.length, 1);
    assert.equal(ui.hasUnsavedData(), false, 'hasUnsavedData doit être false immédiatement après le drag & drop');
  });
});
