import '../helpers/setup.mjs';
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import Data, { Model } from '../../grapher/modules/data.js';
import UIManager from '../../grapher/modules/ui.js';

describe('Bouton Arrêter le calcul (#dynamic-stop-btn) et robustesse updateModelPanel', () => {
  let docListeners;
  let querySelectorOverride;

  const createMockEl = () => {
    const el = {
      value: '',
      textContent: '',
      innerHTML: '',
      style: {},
      classList: { add: () => {}, remove: () => {}, contains: () => false, toggle: () => {} },
      appendChild: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      setAttribute: () => {},
      removeAttribute: () => {},
      remove: () => {},
      closest: () => null
    };
    el.querySelector = () => el;
    el.querySelectorAll = () => [];
    return el;
  };

  beforeEach(() => {
    docListeners = {};

    global.document.addEventListener = (type, handler) => {
      if (!docListeners[type]) docListeners[type] = [];
      docListeners[type].push(handler);
    };

    global.document.dispatchEvent = (event) => {
      const handlers = docListeners[event.type] || [];
      handlers.forEach(h => h(event));
    };

    querySelectorOverride = {};

    global.__querySelectorOverride = (sel) => {
      if (querySelectorOverride[sel] !== undefined) {
        return querySelectorOverride[sel];
      }
      // Par défaut, aucun panneau de modèle n'est dans le DOM avant createModelPanel
      if (sel.startsWith('#model-list article')) {
        return null;
      }
      return createMockEl();
    };
  });

  it('updateModelPanel(model) ne doit pas lever d\'erreur si le panel HTML n\'existe pas dans le DOM (Cas 1)', () => {
    const data = new Data({ significantDigits: 4 });
    const curveX = data.addCurve('x', 'm');
    const curveY = data.addCurve('y', 'N');
    const model = new Model(curveX, curveY, 'linear', data, '#ff0000', true, 2, 'Solid');
    model.id = 'model-test-id';

    const ui = new UIManager({}, data, {}, {}, {}, {});

    assert.doesNotThrow(() => {
      ui.updateModelPanel(model);
    }, 'updateModelPanel ne doit pas lever de TypeError si panel est null');
  });

  it('updateModelPanel(null) ne doit pas lever d\'erreur si model est null ou undefined', () => {
    const data = new Data();
    const ui = new UIManager({}, data, {}, {}, {}, {});

    assert.doesNotThrow(() => {
      ui.updateModelPanel(null);
      ui.updateModelPanel(undefined);
    });
  });

  it('Le clic sur #dynamic-stop-btn pendant addModel() stoppe le modèle et masque le chargement sans planter', () => {
    const data = new Data({ significantDigits: 4 });
    const curveX = data.addCurve('x', 'm');
    const curveY = data.addCurve('y', 'N');
    const model = new Model(curveX, curveY, 'linear', data, '#ff0000', true, 2, 'Solid');
    model.id = 'model-adding-1';

    let stopFitCalled = false;
    model.stopFit = () => {
      stopFitCalled = true;
      global.document.dispatchEvent(new CustomEvent('model-fit-end', { detail: { model } }));
    };

    let hideLoadingCalled = false;
    const mockGrapher = {
      clearAllAnnotations: () => {},
      updateModels: () => {},
      hideLoading: () => {
        hideLoadingCalled = true;
      }
    };

    const ui = new UIManager({}, data, mockGrapher, {}, {}, {});
    ui.initGrapherControls();

    // Déclenche le début du fit du modèle en cours de création (son panneau n'est pas encore créé dans le DOM)
    global.document.dispatchEvent(new CustomEvent('model-fit-start', { detail: { model } }));

    // Simule le clic sur le bouton d'arrêt
    const mockStopBtn = {
      id: 'dynamic-stop-btn',
      classList: {
        add: (cls) => { mockStopBtn.lastClass = cls; }
      },
      closest: (sel) => (sel === '#dynamic-stop-btn' ? mockStopBtn : null)
    };

    assert.doesNotThrow(() => {
      const clickHandlers = docListeners['click'] || [];
      clickHandlers.forEach(h => h({ target: mockStopBtn }));
    });

    assert.equal(stopFitCalled, true, 'model.stopFit() doit avoir été appelé');
    assert.equal(hideLoadingCalled, true, 'grapher.hideLoading() doit avoir été appelé');
  });

  it('Lors d\'un recalcul multiple, la fin du premier modèle ne bloque pas l\'arrêt des modèles restants (Cas 2)', () => {
    const data = new Data({ significantDigits: 4 });
    const curveX = data.addCurve('x', 'm');
    const curveY = data.addCurve('y', 'N');
    const modelFast = new Model(curveX, curveY, 'linear', data, '#ff0000', true, 2, 'Solid');
    modelFast.id = 'model-fast';
    modelFast.parameters = [{ name: 'a', value: 2 }];

    const modelSlow = new Model(curveX, curveY, 'dampedsin', data, '#0000ff', true, 2, 'Solid');
    modelSlow.id = 'model-slow';
    modelSlow.parameters = [
      { name: 'a', value: 1 },
      { name: 'b', value: 2 },
      { name: 'c', value: 0 },
      { name: 'd', value: 3 },
      { name: 'e', value: 0 }
    ];

    // Pour le recalcul, les panneaux existent déjà dans le DOM
    querySelectorOverride[`#model-list article[data-model-id="${modelFast.id}"]`] = createMockEl();
    querySelectorOverride[`#model-list article[data-model-id="${modelSlow.id}"]`] = createMockEl();

    let fastStopCalled = false;
    let slowStopCalled = false;

    modelFast.stopFit = () => {
      fastStopCalled = true;
      global.document.dispatchEvent(new CustomEvent('model-fit-end', { detail: { model: modelFast } }));
    };
    modelSlow.stopFit = () => {
      slowStopCalled = true;
      global.document.dispatchEvent(new CustomEvent('model-fit-end', { detail: { model: modelSlow } }));
    };

    let hideLoadingCalled = false;
    const mockGrapher = {
      clearAllAnnotations: () => {},
      updateModels: () => {},
      hideLoading: () => {
        hideLoadingCalled = true;
      }
    };

    const ui = new UIManager({}, data, mockGrapher, {}, {}, {});
    ui.initGrapherControls();

    // Démarrage des deux modèles
    global.document.dispatchEvent(new CustomEvent('model-fit-start', { detail: { model: modelFast } }));
    global.document.dispatchEvent(new CustomEvent('model-fit-start', { detail: { model: modelSlow } }));

    // Le modèle rapide se termine normalement en premier
    global.document.dispatchEvent(new CustomEvent('model-fit-end', { detail: { model: modelFast } }));

    // L'utilisateur clique sur Arrêter le calcul alors que seul modelSlow tourne encore
    const mockStopBtn = {
      id: 'dynamic-stop-btn',
      classList: {
        add: () => {}
      },
      closest: (sel) => (sel === '#dynamic-stop-btn' ? mockStopBtn : null)
    };

    const clickHandlers = docListeners['click'] || [];
    clickHandlers.forEach(h => h({ target: mockStopBtn }));

    assert.equal(fastStopCalled, false, 'Le modèle déjà terminé ne doit pas être ré-arrêté');
    assert.equal(slowStopCalled, true, 'Le modèle lent toujours actif doit être arrêté par le clic');
    assert.equal(hideLoadingCalled, true, 'Le chargement doit être masqué');
  });

  it('Arrête simultanément tous les modèles actifs si plusieurs sont encore en cours', () => {
    const data = new Data({ significantDigits: 4 });
    const curveX = data.addCurve('x', 'm');
    const curveY = data.addCurve('y', 'N');
    const m1 = new Model(curveX, curveY, 'linear', data);
    m1.id = 'm1';
    m1.parameters = [{ name: 'a', value: 1 }];
    const m2 = new Model(curveX, curveY, 'quadratic', data);
    m2.id = 'm2';
    m2.parameters = [{ name: 'a', value: 1 }, { name: 'b', value: 2 }, { name: 'c', value: 3 }];

    let m1Stopped = false;
    let m2Stopped = false;
    m1.stopFit = () => { m1Stopped = true; };
    m2.stopFit = () => { m2Stopped = true; };

    const mockGrapher = {
      clearAllAnnotations: () => {},
      updateModels: () => {},
      hideLoading: () => {}
    };

    const ui = new UIManager({}, data, mockGrapher, {}, {}, {});
    ui.initGrapherControls();

    global.document.dispatchEvent(new CustomEvent('model-fit-start', { detail: { model: m1 } }));
    global.document.dispatchEvent(new CustomEvent('model-fit-start', { detail: { model: m2 } }));

    const mockStopBtn = {
      closest: (sel) => (sel === '#dynamic-stop-btn' ? mockStopBtn : null),
      classList: { add: () => {} }
    };

    const clickHandlers = docListeners['click'] || [];
    clickHandlers.forEach(h => h({ target: mockStopBtn }));

    assert.equal(m1Stopped, true, 'm1 doit être arrêté');
    assert.equal(m2Stopped, true, 'm2 doit être arrêté');
  });
});
