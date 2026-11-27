import '../helpers/setup.mjs';
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import Data, { Model } from '../../grapher/modules/data.js';
import UIManager from '../../grapher/modules/ui.js';

function createClassList(initial = []) {
  const set = new Set(initial);
  return {
    add: (...cls) => cls.forEach(c => set.add(c)),
    remove: (...cls) => cls.forEach(c => set.delete(c)),
    contains: (c) => set.has(c),
    toggle: (c, force) => {
      if (force === undefined) {
        if (set.has(c)) { set.delete(c); return false; }
        set.add(c); return true;
      }
      if (force) { set.add(c); return true; }
      set.delete(c); return false;
    }
  };
}

function createEl(tag = 'div', initialClasses = []) {
  const listeners = {};
  return {
    tagName: tag.toUpperCase(),
    style: {},
    dataset: {},
    children: [],
    value: '',
    textContent: '',
    innerHTML: '',
    disabled: false,
    classList: createClassList(initialClasses),
    addEventListener(type, fn) {
      if (!listeners[type]) listeners[type] = [];
      listeners[type].push(fn);
    },
    async dispatch(type, event = {}) {
      const list = listeners[type] || [];
      for (const fn of list) {
        await fn(event);
      }
    },
    appendChild(child) {
      this.children.push(child);
      if (this.tagName === 'SELECT' && this.children.length === 1 && !this.value) {
        this.value = child.value;
      }
      return child;
    },
    querySelector: () => null,
    querySelectorAll: () => []
  };
}

describe('UIManager - Interface de modélisation (tests de caractérisation)', () => {
  let data;
  let grapher;
  let common;
  let ui;
  let app;

  beforeEach(() => {
    data = new Data({ significantDigits: 4 });
    const xCurve = data.addCurve('t', 's');
    xCurve.push(0, 1, 2, 3);
    const yCurve = data.addCurve('d', 'm');
    yCurve.push(0, 2, 4, 6);

    grapher = {
      currentXCurve: 't',
      chart: {
        series: [
          { name: 'd', visible: true, type: 'line' },
          { name: 'Modèle 1', visible: true, type: 'spline' }
        ]
      },
      showLoading: () => {},
      hideLoading: () => {},
      updateModelVisibility: () => {},
      setCrosshairMode: () => {},
      drawModelBounds: () => {}
    };

    common = {
      modalManager: {
        closeAllModalsCalled: false,
        closeAllModals() { this.closeAllModalsCalled = true; }
      }
    };

    app = {
      addModelCalls: [],
      async addModel(x, y, type) {
        this.addModelCalls.push({ x, y, type });
        const model = new Model(data.getCurveByTitle(x), data.getCurveByTitle(y), type, data, '#000000', true, 2, 'Dash');
        model.parameters = [{ name: 'a', value: 2, unit: 'm/s' }];
        model.rmse = 0.01;
        model.rSquared = 0.9999;
        data.models.push(model);
        return model;
      }
    };

    ui = new UIManager(common, data, grapher, {}, {}, {});
    ui.setApp(app);
  });

  afterEach(() => {
    global.__querySelectorOverride = null;
    global.__querySelectorAllOverride = null;
    global.__getElementByIdOverride = null;
    global.__createElementOverride = null;
  });

  it('updateRecalculateButtonVisibility affiche ou masque le bouton selon la présence de modèles', () => {
    const btn = createEl('button', ['is-hidden']);
    global.__querySelectorOverride = (sel) => sel === '#recalculate-models-button' ? btn : createEl();

    ui.updateRecalculateButtonVisibility();
    assert.equal(btn.classList.contains('is-hidden'), true);

    const model = new Model(data.getCurveByTitle('t'), data.getCurveByTitle('d'), 'linear', data, '#2caffe');
    data.models.push(model);
    ui.updateRecalculateButtonVisibility();
    assert.equal(btn.classList.contains('is-hidden'), false);
  });

  it('createModelPanel peuple le clone du template et l\'insère dans #model-list', () => {
    const model = new Model(data.getCurveByTitle('t'), data.getCurveByTitle('d'), 'linear', data, '#000000');
    model.parameters = [{ name: 'a', value: 2.5, unit: 'm/s' }];
    model.rmse = 0.02;
    model.rSquared = 0.998;
    data.models.push(model);

    const header = createEl('div');
    const article = createEl('article');
    article.querySelector = (sel) => sel === '.message-header' ? header : null;

    const titleEl = createEl('p');
    const nameEl = createEl('p');
    const eqEl = createEl('p');
    const paramsList = createEl('ul');
    const qualityList = createEl('ul');

    const panelClone = {
      querySelector(sel) {
        if (sel === 'article') return article;
        if (sel === '.model-title') return titleEl;
        if (sel === '.model-name') return nameEl;
        if (sel === '.model-equation') return eqEl;
        if (sel === '.parameters-list') return paramsList;
        if (sel === '.quality-list') return qualityList;
        return null;
      }
    };

    const modelList = createEl('div');
    const template = { content: { cloneNode: () => panelClone } };

    global.__getElementByIdOverride = (id) => {
      if (id === 'model-list') return modelList;
      if (id === 'template-model-panel') return template;
      return createEl();
    };
    global.__createElementOverride = (tag) => createEl(tag);

    ui.createModelPanel(model.id);

    assert.equal(modelList.children.length, 1);
    assert.equal(article.dataset.modelId, model.id);
    assert.equal(header.style.backgroundColor, '#000000');
    assert.equal(header.style.color, '#ffffff');
    assert.equal(titleEl.textContent, 'd = f(t)');
    assert.ok(nameEl.innerHTML.includes('Linéaire'));
    assert.ok(eqEl.innerHTML.includes('d = a·t'));
    assert.equal(paramsList.children.length, 1);
    assert.ok(paramsList.children[0].innerHTML.includes('a = 2,5'));
    assert.ok(paramsList.children[0].innerHTML.includes('m/s'));
    assert.equal(qualityList.children.length, 2);
    assert.ok(qualityList.children[0].innerHTML.includes('Écart-type'));
    assert.ok(qualityList.children[1].innerHTML.includes('R²'));
  });

  it('updateModelPanel met à jour la couleur, le titre, l\'équation, les paramètres et l\'icône de visibilité', () => {
    const model = new Model(data.getCurveByTitle('t'), data.getCurveByTitle('d'), 'linear', data, '#ffffff');
    model.visible = false;
    model.parameters = [{ name: 'k', value: 3, unit: 'm/s' }];
    model.rmse = 0.05;
    model.rSquared = 0.99;

    const header = createEl('div');
    const titleEl = createEl('p');
    const eqEl = createEl('p');
    const ul1 = createEl('ul');
    const ul2 = createEl('ul');
    const icon = createEl('i', ['fa-eye']);

    const panel = createEl('article');
    panel.querySelector = (sel) => {
      if (sel === '.message-header') return header;
      if (sel === '.message-header p') return titleEl;
      if (sel === '.message-body p:nth-of-type(2)') return eqEl;
      if (sel === 'ul') return ul1;
      if (sel === 'ul:last-of-type') return ul2;
      if (sel === '.fa-eye, .fa-eye-slash') return icon;
      return null;
    };

    global.__querySelectorOverride = (sel) =>
      sel === `#model-list article[data-model-id="${model.id}"]` ? panel : createEl();
    global.__createElementOverride = (tag) => createEl(tag);

    ui.updateModelPanel(model);

    assert.equal(header.style.backgroundColor, '#ffffff');
    assert.equal(header.style.color, '#1f2937');
    assert.equal(titleEl.textContent, 'd = f(t)');
    assert.ok(eqEl.innerHTML.includes('d = k·t'));
    assert.equal(ul1.children.length, 1);
    assert.ok(ul1.children[0].innerHTML.includes('k = 3'));
    assert.equal(icon.classList.contains('fa-eye-slash'), true);
    assert.equal(icon.classList.contains('fa-eye'), false);
    assert.equal(ul2.children.length, 2);
  });

  it('toggleModelVisibility bascule la visibilité uniquement si l\'abscisse correspond', () => {
    const model = new Model(data.getCurveByTitle('t'), data.getCurveByTitle('d'), 'linear', data, '#2caffe');
    model.visible = true;
    data.models.push(model);

    let visibilityUpdated = 0;
    let toolVisibilityUpdated = 0;
    grapher.updateModelVisibility = () => { visibilityUpdated++; };
    ui.updateAllModelPanelVisibilityIcons = () => {};
    ui.updateModelToolVisibility = () => { toolVisibilityUpdated++; };

    ui.toggleModelVisibility(model);
    assert.equal(model.visible, false);
    assert.equal(visibilityUpdated, 1);
    assert.equal(toolVisibilityUpdated, 1);

    // Changement d'abscisse : impossible de réafficher le modèle
    grapher.currentXCurve = 'd';
    ui.toggleModelVisibility(model);
    assert.equal(model.visible, false);
    assert.equal(visibilityUpdated, 1);
  });

  it('toggleModelPanel replie et déplie le corps du panneau', () => {
    const toggleUp = createEl('i');
    const toggleDown = createEl('i', ['is-hidden']);
    const header = createEl('div', ['is-active']);
    header.querySelector = (sel) => {
      if (sel === '.toggle-up') return toggleUp;
      if (sel === '.toggle-down') return toggleDown;
      return null;
    };
    const body = createEl('div');
    const article = createEl('article');
    article.querySelector = (sel) => {
      if (sel === '.message-header') return header;
      if (sel === '.message-body') return body;
      return null;
    };

    ui.toggleModelPanel(article);
    assert.equal(header.classList.contains('is-active'), false);
    assert.equal(body.classList.contains('is-hidden'), true);
    assert.equal(header.style.borderRadius, '6px');
    assert.equal(toggleUp.classList.contains('is-hidden'), true);
    assert.equal(toggleDown.classList.contains('is-hidden'), false);
  });

  it('initAddModelModal peuple les courbes disponibles, active le bouton et crée un modèle', async () => {
    const modelItem = createEl('div');
    modelItem.dataset.modelType = 'linear';
    modelItem.closest = (sel) => sel === '.model-type-item' ? modelItem : null;

    const addModelModal = createEl('div');
    addModelModal.querySelectorAll = (sel) => sel === '.model-type-item' ? [modelItem] : [];
    const modelCurveSelect = createEl('select');
    const modelCurveSelectContainer = createEl('div');
    const addModelConfirmButton = createEl('button');
    const noCurveMessage = createEl('div', ['is-hidden']);
    const addModelButton = createEl('button');
    const showMoreButton = createEl('button');

    const map = {
      '#add-model-modal': addModelModal,
      '#model-curve-select': modelCurveSelect,
      '#model-curve-select-container': modelCurveSelectContainer,
      '#add-model-confirm-button': addModelConfirmButton,
      '#no-curve-to-model-message': noCurveMessage,
      '#add-model-button': addModelButton,
      '#show-more-models-button': showMoreButton
    };

    global.__querySelectorOverride = (sel) => map[sel] || createEl();
    global.__querySelectorAllOverride = () => [];
    global.__createElementOverride = (tag) => createEl(tag);

    let createdPanelId = null;
    ui.createModelPanel = (id) => { createdPanelId = id; };

    ui.initAddModelModal();

    // 1. Ouverture de la modale
    await addModelButton.dispatch('click');
    assert.equal(addModelModal.classList.contains('is-active'), true);
    assert.equal(modelCurveSelect.children.length, 1);
    assert.equal(modelCurveSelect.value, 'd');
    assert.equal(addModelConfirmButton.disabled, true);

    // 2. Sélection d'un type de modèle
    await addModelModal.dispatch('click', { target: modelItem });
    assert.equal(addModelConfirmButton.disabled, false);

    // 3. Confirmation
    await addModelConfirmButton.dispatch('click');
    assert.equal(common.modalManager.closeAllModalsCalled, true);
    assert.equal(app.addModelCalls.length, 1);
    assert.deepEqual(app.addModelCalls[0], { x: 't', y: 'd', type: 'linear' });
    assert.ok(createdPanelId);
  });
});
