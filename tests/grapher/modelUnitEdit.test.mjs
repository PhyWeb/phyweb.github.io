import '../helpers/setup.mjs';
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import Data, { Model } from '../../grapher/modules/data.js';
import UIManager from '../../grapher/modules/ui.js';

describe('UIManager & Data - Gestion des unités des paramètres de modèles', () => {
  let elementsMap;
  let currentSaveButton = null;
  let closedModals = false;
  let modelPanelUpdated = false;

  beforeEach(() => {
    currentSaveButton = null;
    closedModals = false;
    modelPanelUpdated = false;

    const colorPicker = { value: '#ff0000', style: {}, appendChild: () => {}, addEventListener: () => {} };
    const lineWidthSelect = { value: '2', appendChild: () => {}, addEventListener: () => {} };
    const lineStyleSelect = { value: 'Solid', appendChild: () => {}, addEventListener: () => {} };
    const borneDebutInput = { value: '', disabled: false, placeholder: '', addEventListener: () => {} };
    const borneFinInput = { value: '', disabled: false, placeholder: '', addEventListener: () => {} };
    const borneToutCheckbox = { checked: true, addEventListener: () => {} };
    const editModelModal = { classList: { add: () => {}, remove: () => {} } };

    const parametersContainer = {
      innerHTML: '',
      children: [],
      appendChild: function(child) {
        this.children.push(child);
      },
      querySelector: function(sel) {
        const match = sel.match(/input\[data-unit-for="([^"]+)"\]/);
        if (match) {
          const paramName = match[1];
          for (const child of this.children) {
            if (child.inputs) {
              const u = child.inputs.find(i => i.dataset?.unitFor === paramName);
              if (u) return u;
            }
          }
        }
        return null;
      },
      querySelectorAll: function(sel) {
        if (sel === 'input[data-old-name]') {
          const inputs = [];
          for (const child of this.children) {
            if (child.inputs) {
              inputs.push(...child.inputs.filter(i => i.dataset && 'oldName' in i.dataset));
            }
          }
          return inputs;
        }
        if (sel === 'input[data-unit-for]') {
          const inputs = [];
          for (const child of this.children) {
            if (child.inputs) {
              inputs.push(...child.inputs.filter(i => i.dataset && 'unitFor' in i.dataset));
            }
          }
          return inputs;
        }
        return [];
      }
    };

    const saveButtonParent = {
      replaceChild: (newBtn) => {
        currentSaveButton = newBtn;
      }
    };
    const saveButton = {
      parentNode: saveButtonParent,
      cloneNode: () => ({
        parentNode: saveButtonParent,
        onclick: null
      })
    };
    const deleteButton = {
      parentNode: { replaceChild: () => {} },
      cloneNode: () => ({ onclick: null })
    };

    elementsMap = {
      '#edit-model-modal': editModelModal,
      '#model-edit-color-picker': colorPicker,
      '#model-edit-linewidth-select': lineWidthSelect,
      '#model-edit-linestyle-select': lineStyleSelect,
      '#model-edit-borne-debut-input': borneDebutInput,
      '#model-edit-borne-fin-input': borneFinInput,
      '#model-edit-borne-tout-checkbox': borneToutCheckbox,
      '#model-edit-parameters-container': parametersContainer,
      '#model-edit-save-button': saveButton,
      '#model-edit-delete-button': deleteButton
    };

    global.__querySelectorOverride = (sel) => {
      if (elementsMap[sel]) return elementsMap[sel];
      return {
        value: '',
        style: {},
        classList: { add: () => {}, remove: () => {}, contains: () => false },
        appendChild: () => {},
        querySelectorAll: () => []
      };
    };

    global.__createElementOverride = (tag) => {
      const el = {
        tagName: tag,
        className: '',
        style: {},
        inputs: [],
        innerHTML: '',
        classList: { add: () => {}, remove: () => {}, contains: () => false },
        appendChild: () => {}
      };
      return el;
    };
  });

  const setupEnv = () => {
    const data = new Data({ significantDigits: 4 });
    const curveX = data.addCurve('x', 'm');
    const curveY = data.addCurve('y', 'N');
    for (let i = 0; i < 10; i++) {
      curveX.push(i);
      curveY.push(i * 2);
    }

    const mockGrapher = {
      showLoading: () => {},
      hideLoading: () => {},
      updateModelVisibility: () => {},
      chart: {
        get: () => ({
          update: () => {}
        }),
        redraw: () => {}
      }
    };

    const mockCommon = {
      modalManager: {
        closeAllModals: () => {
          closedModals = true;
        }
      }
    };

    const mockApp = {
      symbolValidator: {
        validate: () => ({ isValid: true })
      }
    };

    const ui = new UIManager(mockCommon, data, mockGrapher, {}, {}, {});
    ui.setApp(mockApp);
    ui.updateModelPanel = () => {
      modelPanelUpdated = true;
    };
    ui.updateCalculationUI = () => {};

    const model = new Model(curveX, curveY, 'linear', data, '#ff0000', true, 2, 'Solid');
    model.parameters = [{ name: 'pente', value: 2, unit: 'N/m' }];
    data.parameters['pente'] = { value: 2, unit: 'N/m', type: 'model' };
    data.models.push(model);

    return { data, model, ui, mockApp };
  };

  it('doit générer les champs Nom, Unité et Valeur dans la modale d\'édition', () => {
    const { model, ui } = setupEnv();
    ui.openEditModelModal(model);

    const container = elementsMap['#model-edit-parameters-container'];
    assert.equal(container.children.length, 1);
    const html = container.children[0].innerHTML;
    assert.ok(html.includes('data-old-name="pente"'), 'Le champ Nom doit être présent');
    assert.ok(html.includes('data-unit-for="pente"'), 'Le champ Unité doit être présent');
    assert.ok(html.includes('value="N/m"'), 'L\'unité actuelle doit être pré-remplie');
    assert.ok(html.includes('placeholder="Ex: m/s"'), 'Le placeholder d\'unité doit être présent');
    assert.ok(html.includes('Valeur'), 'Le libellé Valeur doit être présent');
  });

  it('doit permettre de modifier l\'unité d\'un paramètre sans modifier son nom', async () => {
    const { data, model, ui } = setupEnv();
    ui.openEditModelModal(model);

    const container = elementsMap['#model-edit-parameters-container'];
    const nameInput = { value: 'pente', dataset: { oldName: 'pente' } };
    const unitInput = { value: 'kg/s', dataset: { unitFor: 'pente' } };
    container.children = [{ inputs: [nameInput, unitInput] }];

    assert.ok(currentSaveButton && currentSaveButton.onclick);
    await currentSaveButton.onclick();

    assert.equal(model.parameters[0].name, 'pente');
    assert.equal(model.parameters[0].unit, 'kg/s');
    assert.equal(data.parameters['pente'].unit, 'kg/s');
    assert.equal(closedModals, true);
    assert.equal(modelPanelUpdated, true);
  });

  it('doit permettre de modifier simultanément le nom et l\'unité d\'un paramètre', async () => {
    const { data, model, ui } = setupEnv();
    ui.openEditModelModal(model);

    const container = elementsMap['#model-edit-parameters-container'];
    const nameInput = { value: 'raideur', dataset: { oldName: 'pente' } };
    const unitInput = { value: 'N·m⁻¹', dataset: { unitFor: 'pente' } };
    container.children = [{ inputs: [nameInput, unitInput] }];

    assert.ok(currentSaveButton && currentSaveButton.onclick);
    await currentSaveButton.onclick();

    assert.equal(model.parameters[0].name, 'raideur');
    assert.equal(model.parameters[0].unit, 'N·m⁻¹');
    assert.equal(data.parameters['pente'], undefined, 'L\'ancien paramètre doit être supprimé');
    assert.ok(data.parameters['raideur'], 'Le nouveau paramètre doit exister');
    assert.equal(data.parameters['raideur'].unit, 'N·m⁻¹');
    assert.equal(data.parameters['raideur'].value, 2);
  });

  it('doit permettre de vider l\'unité d\'un paramètre', async () => {
    const { data, model, ui } = setupEnv();
    ui.openEditModelModal(model);

    const container = elementsMap['#model-edit-parameters-container'];
    const nameInput = { value: 'pente', dataset: { oldName: 'pente' } };
    const unitInput = { value: '   ', dataset: { unitFor: 'pente' } }; // Espaces -> chaîne vide
    container.children = [{ inputs: [nameInput, unitInput] }];

    assert.ok(currentSaveButton && currentSaveButton.onclick);
    await currentSaveButton.onclick();

    assert.equal(model.parameters[0].name, 'pente');
    assert.equal(model.parameters[0].unit, undefined);
    assert.equal(data.parameters['pente'].unit, '');
  });

  it('doit préserver l\'unité lors d\'un réajustement avec changement de bornes', async () => {
    const { data, model, ui } = setupEnv();

    model.fit = async () => {
      const boundedData = model._buildData();
      model._applyParams([3.5], boundedData);
    };

    ui.openEditModelModal(model);

    const container = elementsMap['#model-edit-parameters-container'];
    const nameInput = { value: 'pente', dataset: { oldName: 'pente' } };
    const unitInput = { value: 'V/s', dataset: { unitFor: 'pente' } };
    container.children = [{ inputs: [nameInput, unitInput] }];

    elementsMap['#model-edit-borne-tout-checkbox'].checked = false;
    elementsMap['#model-edit-borne-debut-input'].value = '1';
    elementsMap['#model-edit-borne-fin-input'].value = '5';

    assert.ok(currentSaveButton && currentSaveButton.onclick);
    await currentSaveButton.onclick();

    assert.equal(model.parameters[0].name, 'pente');
    assert.equal(model.parameters[0].value, 3.5);
    assert.equal(model.parameters[0].unit, 'V/s');
    assert.equal(data.parameters['pente'].unit, 'V/s');
    assert.equal(data.parameters['pente'].value, 3.5);
  });

  it('doit afficher l\'unité dans le panneau de modèle (updateModelPanel)', () => {
    const { data, model } = setupEnv();
    const ui = new UIManager({}, data, {}, {}, {}, {});

    let appendedLi = null;
    const mockUl = {
      innerHTML: '',
      appendChild: (li) => { appendedLi = li; }
    };
    const mockPanel = {
      querySelector: (sel) => {
        if (sel === '.message-header') return { style: {} };
        if (sel === '.message-header p') return { innerHTML: '' };
        if (sel === '.message-body p:nth-of-type(2)') return { innerHTML: '' };
        if (sel === 'ul') return mockUl;
        if (sel === '.fa-eye, .fa-eye-slash') return { classList: { add: () => {}, remove: () => {} } };
        if (sel === 'ul:last-of-type') return null;
        return { innerHTML: '', style: {} };
      },
      style: {}
    };

    global.__querySelectorOverride = (sel) => {
      if (sel.startsWith('#model-list article')) return mockPanel;
      return { value: '', style: {}, classList: { add: () => {}, remove: () => {} } };
    };

    model.parameters = [{ name: 'coeff', value: 4.5, unit: 'm/s' }];
    data.parameters['coeff'] = { value: 4.5, unit: 'm/s', type: 'model' };

    ui.updateModelPanel(model);

    assert.ok(appendedLi);
    assert.ok(appendedLi.innerHTML.includes('coeff =') && appendedLi.innerHTML.includes('m/s') && (appendedLi.innerHTML.includes('4,5') || appendedLi.innerHTML.includes('4.5')),
      `Le texte doit contenir le symbole, la valeur et l'unité : ${appendedLi.innerHTML}`);
  });
});
