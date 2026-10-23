import '../helpers/setup.mjs';
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import Data from '../../grapher/modules/data.js';
import Grapher from '../../grapher/modules/grapher.js';
import UIManager from '../../grapher/modules/ui.js';

if (!global.Highcharts.addEvent) {
  global.Highcharts.addEvent = () => {};
}

if (!global.CodeMirror) {
  global.CodeMirror = { defineMode: () => {} };
}

describe('Grapher - setCrosshairMode et enableMouseTracking', () => {
  let grapher;
  let chartUpdateCalls;

  beforeEach(() => {
    const data = new Data({ significantDigits: 4 });
    chartUpdateCalls = [];
    grapher = new Grapher(data, {
      grapherGrid: true,
      minorGrid: false,
      includeOriginOnAutoZoom: false
    });
    grapher.chart = {
      update(opts) {
        chartUpdateCalls.push(opts);
      },
      container: {
        classList: {
          add: () => {},
          remove: () => {}
        }
      }
    };
  });

  it('doit laisser enableMouseTracking: true même lorsque mode === null', () => {
    grapher.setCrosshairMode(null);

    assert.equal(chartUpdateCalls.length, 1);
    const lastUpdate = chartUpdateCalls[0];
    assert.equal(lastUpdate.plotOptions.series.enableMouseTracking, true);
    assert.equal(lastUpdate.plotOptions.series.stickyTracking, false);
    assert.equal(lastUpdate.plotOptions.series.allowPointSelect, true);
  });

  it('doit conserver enableMouseTracking: true lorsque des outils de réticule sont activés', () => {
    grapher.setCrosshairMode('data');

    assert.equal(chartUpdateCalls.length, 1);
    const lastUpdate = chartUpdateCalls[0];
    assert.equal(lastUpdate.plotOptions.series.enableMouseTracking, true);
    assert.equal(lastUpdate.plotOptions.series.stickyTracking, true);
    assert.equal(lastUpdate.plotOptions.series.allowPointSelect, false);
  });

  it('doit désélectionner les points déjà sélectionnés lors de l\'activation d\'un mode réticule', () => {
    let unselectedCount = 0;
    const selectedPoints = [
      { select: (state) => { if (state === false) unselectedCount++; } },
      { select: (state) => { if (state === false) unselectedCount++; } }
    ];
    grapher.chart.getSelectedPoints = () => selectedPoints;

    grapher.setCrosshairMode('data');

    assert.equal(unselectedCount, 2);
  });
});

let keydownListeners = [];
const origAddEventListener = global.document.addEventListener;
global.document.addEventListener = (type, fn, opts) => {
  if (type === 'keydown') {
    keydownListeners.push(fn);
  }
  return origAddEventListener ? origAddEventListener(type, fn, opts) : undefined;
};

describe('UIManager - keydown Delete / Backspace pour suppression de point', () => {
  let appCalls;
  let mockApp;
  let mockEditor;
  let mockGrapher;
  let mockChart;
  let isGrapherTabActive;
  let activeModal;

  beforeEach(() => {
    keydownListeners.length = 0;
    appCalls = { deleteRow: [], applyCalculation: [] };
    isGrapherTabActive = true;
    activeModal = null;

    mockApp = {
      deleteRow: (actualRow, amount) => {
        appCalls.deleteRow.push({ actualRow, amount });
        if (mockEditor && typeof mockEditor.getValue === 'function' && mockEditor.getValue().trim() !== '') {
          mockApp.applyCalculation(mockEditor.getValue());
        }
      },
      applyCalculation: (script) => {
        appCalls.applyCalculation.push(script);
      }
    };

    const makeElement = () => ({
      classList: { add: () => {}, remove: () => {}, contains: () => false, toggle: () => {} },
      addEventListener: () => {},
      removeEventListener: () => {},
      appendChild: () => {},
      remove: () => {},
      setAttribute: () => {},
      removeAttribute: () => {},
      querySelector: () => makeElement(),
      querySelectorAll: () => [],
      value: '',
      textContent: '',
      style: {}
    });

    mockEditor = {
      value: '',
      getValue: () => mockEditor.value,
      getWrapperElement: () => makeElement(),
      setOption: () => {}
    };

    mockChart = {
      selectedPoints: [],
      getSelectedPoints() {
        return this.selectedPoints;
      }
    };

    mockGrapher = {
      chart: mockChart,
      crosshairMode: null
    };

    const grapherTab = {
      addEventListener: () => {},
      classList: {
        contains: (cls) => cls === 'is-active' && isGrapherTabActive
      }
    };

    global.__querySelectorOverride = (sel) => {
      if (sel === '#grapheur-tab') return grapherTab;
      if (sel === '.modal.is-active') return activeModal;
      return makeElement();
    };

    global.__querySelectorAllOverride = () => [];
  });

  const createUIManager = () => {
    const data = new Data({ significantDigits: 4 });
    const mockCommon = { modalManager: {} };
    const mockCalculation = { getAvailableFunctions: () => [] };
    const ui = new UIManager(mockCommon, data, mockGrapher, mockCalculation, mockEditor, {});
    ui.setApp(mockApp);
    ui.initialize();
    return ui;
  };

  const dispatchKeydown = (key) => {
    for (const listener of keydownListeners) {
      listener({ key });
    }
  };

  it('doit supprimer la ligne réelle correspondant à customRowIndices lors de Delete / Backspace', () => {
    createUIManager();

    // Point à l'index 1 dans la série, mais ligne réelle 4 dans le tableur
    mockChart.selectedPoints = [{
      index: 1,
      series: {
        options: {
          customRowIndices: [0, 4, 7]
        }
      }
    }];

    mockEditor.value = '';

    dispatchKeydown('Delete');

    assert.equal(appCalls.deleteRow.length, 1);
    assert.deepEqual(appCalls.deleteRow[0], { actualRow: 4, amount: 1 });
    assert.equal(appCalls.applyCalculation.length, 0);
  });

  it('doit recalculer les formules via applyCalculation si l\'éditeur contient du code', () => {
    createUIManager();

    mockChart.selectedPoints = [{
      index: 2,
      series: {
        options: {
          customRowIndices: [0, 2, 5]
        }
      }
    }];

    mockEditor.value = 'v = diff(x, t)';

    dispatchKeydown('Backspace');

    assert.equal(appCalls.deleteRow.length, 1);
    assert.deepEqual(appCalls.deleteRow[0], { actualRow: 5, amount: 1 });
    assert.equal(appCalls.applyCalculation.length, 1);
    assert.equal(appCalls.applyCalculation[0], 'v = diff(x, t)');
  });

  it('doit utiliser point.index si customRowIndices n\'est pas défini (fallback)', () => {
    createUIManager();

    mockChart.selectedPoints = [{
      index: 3,
      series: {
        options: {}
      }
    }];

    dispatchKeydown('Delete');

    assert.equal(appCalls.deleteRow.length, 1);
    assert.deepEqual(appCalls.deleteRow[0], { actualRow: 3, amount: 1 });
  });

  it('ne doit pas supprimer de ligne si le point sélectionné appartient à un modèle', () => {
    createUIManager();

    mockChart.selectedPoints = [{
      index: 0,
      series: {
        options: {
          id: 'model-linear-1'
        }
      }
    }];

    dispatchKeydown('Delete');

    assert.equal(appCalls.deleteRow.length, 0);
  });

  it('ne doit rien faire si l\'onglet grapheur n\'est pas actif', () => {
    createUIManager();
    isGrapherTabActive = false;

    mockChart.selectedPoints = [{
      index: 0,
      series: {
        options: {
          customRowIndices: [0]
        }
      }
    }];

    dispatchKeydown('Delete');

    assert.equal(appCalls.deleteRow.length, 0);
  });

  it('ne doit rien faire si un outil de réticule est actif (crosshairMode !== null)', () => {
    createUIManager();
    mockGrapher.crosshairMode = 'data';

    mockChart.selectedPoints = [{
      index: 0,
      series: {
        options: {
          customRowIndices: [0]
        }
      }
    }];

    dispatchKeydown('Delete');

    assert.equal(appCalls.deleteRow.length, 0);
  });
});
