import '../helpers/setup.mjs';
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import Data, { Model } from '../../grapher/modules/data.js';
import UIManager from '../../grapher/modules/ui.js';

describe('UIManager - openEditModelModal & préservation/renommage des paramètres', () => {
  let elementsMap;
  let currentSaveButton = null;
  let closedModals = false;
  let modelPanelUpdated = false;

  beforeEach(() => {
    currentSaveButton = null;
    closedModals = false;
    modelPanelUpdated = false;

    // Éléments DOM simulés pour la modale
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
      querySelectorAll: function(sel) {
        if (sel === 'input[data-old-name]') {
          const inputs = [];
          for (const child of this.children) {
            if (child.inputs) inputs.push(...child.inputs);
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
    model.parameters = [{ name: 'pente', value: 2 }];
    data.parameters['pente'] = { value: 2, unit: 'N/m', type: 'model' };
    data.models.push(model);

    return { data, model, ui };
  };

  it('doit préserver le nom personnalisé du paramètre lors de la modification des bornes dans la modale', async () => {
    const { data, model, ui } = setupEnv();

    // Remplacer model.fit() pour simuler un réajustement asynchrone qui appelle _applyParams
    model.fit = async () => {
      const boundedData = model._buildData();
      model._applyParams([2.5], boundedData);
    };

    ui.openEditModelModal(model);

    // L'input généré pour le paramètre
    const container = elementsMap['#model-edit-parameters-container'];
    const paramInput = {
      value: 'pente',
      dataset: { oldName: 'pente' }
    };
    container.children = [{ inputs: [paramInput] }];

    // Modification des bornes dans la modale
    elementsMap['#model-edit-borne-tout-checkbox'].checked = false;
    elementsMap['#model-edit-borne-debut-input'].value = '2';
    elementsMap['#model-edit-borne-fin-input'].value = '8';

    // Clic sur Enregistrer
    assert.ok(currentSaveButton && currentSaveButton.onclick, 'Le gestionnaire de clic doit être enregistré');
    await currentSaveButton.onclick();

    // Le paramètre doit avoir conservé son nom 'pente' avec la nouvelle valeur 2.5
    assert.equal(model.parameters[0].name, 'pente');
    assert.equal(model.parameters[0].value, 2.5);
    assert.ok(data.parameters['pente']);
    assert.equal(data.parameters['pente'].value, 2.5);
    assert.equal(data.parameters['a'], undefined, 'Le paramètre par défaut a ne doit pas écraser pente');
    assert.equal(model.minX, 2);
    assert.equal(model.maxX, 8);
    assert.ok(closedModals);
    assert.ok(modelPanelUpdated);
  });

  it('doit appliquer correctement le renommage et les nouvelles bornes simultanément', async () => {
    const { data, model, ui } = setupEnv();

    // Remplacer model.fit() pour simuler le réajustement
    model.fit = async () => {
      const boundedData = model._buildData();
      model._applyParams([3.2], boundedData);
    };

    ui.openEditModelModal(model);

    // L'utilisateur change le nom de 'pente' en 'raideur'
    const container = elementsMap['#model-edit-parameters-container'];
    const paramInput = {
      value: 'raideur',
      dataset: { oldName: 'pente' }
    };
    container.children = [{ inputs: [paramInput] }];

    // Et modifie les bornes
    elementsMap['#model-edit-borne-tout-checkbox'].checked = false;
    elementsMap['#model-edit-borne-debut-input'].value = '3';
    elementsMap['#model-edit-borne-fin-input'].value = '9';

    // Clic sur Enregistrer
    assert.ok(currentSaveButton && currentSaveButton.onclick);
    await currentSaveButton.onclick();

    // Vérification : le nouveau nom 'raideur' est appliqué avec la nouvelle valeur 3.2
    assert.equal(model.parameters[0].name, 'raideur');
    assert.equal(model.parameters[0].value, 3.2);
    assert.ok(data.parameters['raideur']);
    assert.equal(data.parameters['raideur'].value, 3.2);
    assert.equal(data.parameters['raideur'].unit, 'N/m', 'L\'unité doit être préservée');
    assert.equal(data.parameters['pente'], undefined, 'L\'ancien nom doit être supprimé');
    assert.equal(data.parameters['a'], undefined);
  });
});
