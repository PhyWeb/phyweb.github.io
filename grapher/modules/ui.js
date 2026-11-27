import { toSuperscript } from '../../common/formatter.js';
import { setupGlobalShortcuts } from '../../common/common.js';
import ExportManager, {
  MAX_PRINT_TABLE_POINTS,
  EXPORT_RATIO_DIMENSIONS,
  sanitizeExportFilename,
  escapeHTML
} from './exportManager.js';
import {
  normalizeHexColor,
  getContrastingTextColor,
  getCustomizationColors,
  populateColorSelect
} from './ui/colorPicker.js';
import ModelUI from './ui/modelUI.js';
import CurveModalsUI from './ui/curveModalsUI.js';
import CalculationUI from './ui/calculationUI.js';
import GrapherControlsUI, {
  parseAxisBoundInput,
  formatAxisBoundValue
} from './ui/grapherControlsUI.js';
import SessionUI from './ui/sessionUI.js';

const $ = document.querySelector.bind(document);

export {
  MAX_PRINT_TABLE_POINTS,
  EXPORT_RATIO_DIMENSIONS,
  sanitizeExportFilename,
  escapeHTML,
  toSuperscript,
  normalizeHexColor,
  getContrastingTextColor,
  getCustomizationColors,
  populateColorSelect,
  parseAxisBoundInput,
  formatAxisBoundValue
};

export default class UIManager {
  constructor(common, data, grapher, calculation, editor, spreadsheet) {
    this.common = common;
    this.data = data;
    this.grapher = grapher;
    this.calculation = calculation;
    this.editor = editor;
    this.spreadsheet = spreadsheet;
    
    // Cette référence sera définie après la création de l'objet App
    this.app = null; 

    this.activeToolElement = null;
    this.isZoomEnabled = false;
    this.calculationsStale = false;

    this.initialSettings = {}; // Pour stocker les paramètres initiaux lors de l'ouverture de la modale des paramètres
    this.exportManager = new ExportManager({ common, data, grapher, editor });
    this.modelUI = new ModelUI(this);
    this.curveModalsUI = new CurveModalsUI(this);
    this.calculationUI = new CalculationUI(this);
    this.grapherControlsUI = new GrapherControlsUI(this);
    this.sessionUI = new SessionUI(this);

    this.updateModelToolVisibility = this.updateModelToolVisibility.bind(this);
  }

  _getModelUI() {
    if (!this.modelUI) this.modelUI = new ModelUI(this);
    return this.modelUI;
  }

  _getCurveModalsUI() {
    if (!this.curveModalsUI) this.curveModalsUI = new CurveModalsUI(this);
    return this.curveModalsUI;
  }

  _getCalculationUI() {
    if (!this.calculationUI) this.calculationUI = new CalculationUI(this);
    return this.calculationUI;
  }

  _getGrapherControlsUI() {
    if (!this.grapherControlsUI) this.grapherControlsUI = new GrapherControlsUI(this);
    return this.grapherControlsUI;
  }

  _getSessionUI() {
    if (!this.sessionUI) this.sessionUI = new SessionUI(this);
    return this.sessionUI;
  }

  get exportCurveLabels() {
    return this.exportManager.exportCurveLabels;
  }

  set exportCurveLabels(val) {
    this.exportManager.exportCurveLabels = val;
  }

  setApp(app) {
    this.app = app;
  }

  initialize() {
    // Dès qu'une modale est ouverte par le ModalManager, on enlève le focus du tableur
    this.common.modalManager.onModalOpen = () => {
      if (this.spreadsheet && this.spreadsheet.hot) {
        this.spreadsheet.hot.deselectCell();
      }
    };

    this.initNavbar();
    this.initFileModals();
    this.initEmptyState();
    this.initSettingsModal();
    this.initSaveModal();
    this.initSpreadsheetControls();
    this.initGrapherControls();
    this.initXAxisSelector();
    this.initModelisationControls();
    this.initCalculationControls();
    this.initNewSessionModal();
    this.initExportModal();

    // Initialisation des raccourcis clavier globaux
    setupGlobalShortcuts({
      onSave: () => {
        const saveButton = document.querySelector('#save-button');
        if (saveButton) saveButton.click();
      },
      onNew: () => {
        const newFileButton = document.querySelector('#new-file-open-modal-button');
        if (newFileButton) newFileButton.click();
      },
      onOpen: () => {
        const fileInput = document.querySelector('#file-input');
        if (fileInput) fileInput.click();
      },
      onEscape: () => {
        // Enlève le focus du bouton ou de l'élément actif
        if (document.activeElement) {
          document.activeElement.blur();
        }
        // Si une modale est ouverte, on annule uniquement celle du premier plan
        if (this.common?.modalManager?.getActiveModal()) {
          this.common.modalManager.cancelActiveModal();
          return;
        }
        // Ferme le dropdown des fonctions s'il est ouvert
        const functionsDropdown = document.getElementById('functions-dropdown');
        if (functionsDropdown) {
          functionsDropdown.classList.remove('is-active');
        }
        // Ferme le dropdown des constantes s'il est ouvert
        const constantsDropdown = document.getElementById('constants-dropdown');
        if (constantsDropdown) {
          constantsDropdown.classList.remove('is-active');
        }
        // Ferme le popover des bornes des axes s'il est ouvert
        const axisBoundsDropdown = document.getElementById('axis-bounds-dropdown');
        if (axisBoundsDropdown) {
          axisBoundsDropdown.classList.remove('is-active');
        }
        // Désactive les outils du grapheur (réticule, etc.)
        this.clearActiveTool(); 
        // Deselectionne toute cellule sélectionnée dans le tableur
        this.spreadsheet.hot.deselectCell();
        // Si on était en mode "edit-bounds" pour un modèle, on le quitte
        if (this.grapher.crosshairMode === 'edit-bounds') {
          this.grapher.setCrosshairMode(null);
        }
        
        // Si le zoom était activé, on le désactive et on réinitialise l'UI
        if (this.isZoomEnabled) {
          this.resetZoomUI();
        }
      },
      onTab1: () => {
        const tab = document.querySelector('#tableur-tab');
        if (tab) tab.click();
      },
      onTab2: () => {
        const tab = document.querySelector('#grapheur-tab');
        if (tab) tab.click();
      },
      onTab3: () => {
        const tab = document.querySelector('#calculs-tab');
        if (tab) tab.click();
      },
      onDebug: () => {
        console.log("=== DEBUG INFO ===");
        console.log("data", this.data);
        console.log("chart", this.grapher.chart);
      }
    });

    // Gestion de la suppression d'un point sélectionné dans le grapheur via la touche "Suppr" ou "Backspace"
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        
        // SÉCURITÉ 1 : Ne rien faire si l'utilisateur écrit dans un champ
        const activeElement = document.activeElement;
        const activeTagName = activeElement ? activeElement.tagName.toLowerCase() : '';
        
        const isTyping = activeTagName === 'input' || 
                         activeTagName === 'textarea' || 
                         (activeElement && activeElement.isContentEditable) ||
                         (activeElement && activeElement.closest('.handsontable')); 
                         
        if (isTyping) return;

        // SÉCURITÉ 2 : Ne rien faire si une modale (Bulma) est actuellement ouverte
        const isModalOpen = document.querySelector('.modal.is-active') !== null;
        if (isModalOpen) return;

        // SÉCURITÉ 3 : Ne rien faire si on n'est pas sur l'onglet du grapheur
        const isGrapherTabActive = document.querySelector('#grapheur-tab').classList.contains('is-active');
        if (!isGrapherTabActive) return;

        // Ignorer si un outil de réticule ou de mesure est actif
        if (this.grapher?.crosshairMode !== null) return;

        // Vérification de la présence de points sélectionnés
        if (this.grapher && this.grapher.chart) {
          const selectedPoints = this.grapher.chart.getSelectedPoints();

          if (selectedPoints.length > 0) {
            const point = selectedPoints[0];
            
            // Ignore les points appartenant à un modèle
            if (!point.series.options.id?.startsWith('model-')) {
              const rowIndices = point.series.options.customRowIndices;
              const actualRow = Array.isArray(rowIndices) && rowIndices[point.index] !== undefined
                ? rowIndices[point.index]
                : point.index;
              point.select?.(false, false); // Réinitialise l'état de sélection Highcharts
              this.app.deleteRow(actualRow, 1);
            }
          }
        }
      }
    });

  }

  updateCalculationUI() {
    return this._getCalculationUI().updateCalculationUI();
  }

  updateRecalculateButtonVisibility() {
    return this._getModelUI().updateRecalculateButtonVisibility();
  }

  hasCalculationFormulas(text) {
    return this._getCalculationUI().hasCalculationFormulas(text);
  }

  hasOrderDependentFormulas(text) {
    return this._getCalculationUI().hasOrderDependentFormulas(text);
  }

  setCalculationsStale(isStale) {
    return this._getCalculationUI().setCalculationsStale(isStale);
  }

  updateModelPanel(model) {
    return this._getModelUI().updateModelPanel(model);
  }

  removeModelPanel(modelId) {
    return this._getModelUI().removeModelPanel(modelId);
  }

  clearModelPanels() {
    return this._getModelUI().clearModelPanels();
  }

  activateEditBoundsMode(modelId) {
    return this._getModelUI().activateEditBoundsMode(modelId);
  }

  updateSortUI() {
    return this._getCurveModalsUI().updateSortUI();
  }

  updateAllModelPanelVisibilityIcons() {
    return this._getModelUI().updateAllModelPanelVisibilityIcons();
  }

  updateClearAnnotationsButtonVisibility() {
    return this._getGrapherControlsUI().updateClearAnnotationsButtonVisibility();
  }

  updateXAxisSelector() {
    return this._getGrapherControlsUI().updateXAxisSelector();
  }

  setModalLoading(isLoading) {
    return this._getSessionUI().setModalLoading(isLoading);
  }

  initNavbar() {
    return this._getSessionUI().initNavbar();
  }

  showTabsAndPanels() {
    return this._getSessionUI().showTabsAndPanels();
  }

  _closeNewFileModalIfOpened(newFileModal, wasOpen) {
    return this._getSessionUI()._closeNewFileModalIfOpened(newFileModal, wasOpen);
  }

  loadFileWithFeedback(file, options) {
    return this._getSessionUI().loadFileWithFeedback(file, options);
  }

  loadStartupPW(importedPW, options) {
    return this._getSessionUI().loadStartupPW(importedPW, options);
  }

  initFileModals() {
    return this._getSessionUI().initFileModals();
  }

  initEmptyState() {
    return this._getSessionUI().initEmptyState();
  }

  initSettingsModal() {
    return this._getSessionUI().initSettingsModal();
  }

  readCurrentAppSettings() {
    return this._getSessionUI().readCurrentAppSettings();
  }

  loadSettingsIntoModalUI(settings) {
    return this._getSessionUI().loadSettingsIntoModalUI(settings);
  }

  readSettingsFromModal() {
    return this._getSessionUI().readSettingsFromModal();
  }

  applySettingsToApp(settings) {
    return this._getSessionUI().applySettingsToApp(settings);
  }

  initSaveModal() {
    return this._getSessionUI().initSaveModal();
  }

  /**
   * Initialise les contrôles du tableur et gère les événements associés.
   */
  initSpreadsheetControls() {
    return this._getCurveModalsUI().initSpreadsheetControls();
  }

  initAddCurveModal() {
    return this._getCurveModalsUI().initAddCurveModal();
  }

  initDeleteCurveModal() {
    return this._getCurveModalsUI().initDeleteCurveModal();
  }

  initDeleteLineButton() {
    return this._getCurveModalsUI().initDeleteLineButton();
  }

  initEditHeaderModal() {
    return this._getCurveModalsUI().initEditHeaderModal();
  }

  initGrapherControls() {
    return this._getGrapherControlsUI().initGrapherControls();
  }

  initXAxisSelector() {
    return this._getGrapherControlsUI().initXAxisSelector();
  }

  initChooseCurvesModal() {
    return this._getCurveModalsUI().initChooseCurvesModal();
  }

  initTools() {
    return this._getGrapherControlsUI().initTools();
  }

  updateModelToolVisibility() {
    return this._getGrapherControlsUI().updateModelToolVisibility();
  }

  initZoomControls() {
    return this._getGrapherControlsUI().initZoomControls();
  }

  initAxisBoundsPopover() {
    return this._getGrapherControlsUI().initAxisBoundsPopover();
  }

  resetZoomUI() {
    return this._getGrapherControlsUI().resetZoomUI();
  }

  clearActiveTool() {
    return this._getGrapherControlsUI().clearActiveTool();
  }

  initModelisationControls() {
    return this._getModelUI().initModelisationControls();
  }

  openComputeModelModal(model) {
    return this._getModelUI().openComputeModelModal(model);
  }

  openEditModelModal(model) {
    return this._getModelUI().openEditModelModal(model);
  }

  toggleModelPanel(article) {
    return this._getModelUI().toggleModelPanel(article);
  }

  toggleModelVisibility(model) {
    return this._getModelUI().toggleModelVisibility(model);
  }

  initAddModelModal() {
    return this._getModelUI().initAddModelModal();
  }

  createModelPanel(modelID) {
    return this._getModelUI().createModelPanel(modelID);
  }

  initCalculationControls() {
    return this._getCalculationUI().initCalculationControls();
  }

  initNewSessionModal() {
    return this._getSessionUI().initNewSessionModal();
  }
  /**
   * Initialise la modale d'exportation avec aperçu en temps réel (délégué à ExportManager)
   */
  initExportModal() {
    return this.exportManager.initExportModal();
  }

  _withExportLegendState(callback) {
    return this.exportManager._withExportLegendState(callback);
  }

  getExportDimensions(ratio = '16:10') {
    return this.exportManager.getExportDimensions(ratio);
  }

  getExportCurveLabel(curveTitle, defaultUnit = '', overrides = this.exportManager.exportCurveLabels) {
    return this.exportManager.getExportCurveLabel(curveTitle, defaultUnit, overrides);
  }

  getExportChartOptions(width, height, textScale = 1, curveLabels = this.exportManager.exportCurveLabels, extraOptions = {}) {
    return this.exportManager.getExportChartOptions(width, height, textScale, curveLabels, extraOptions);
  }

  generateImagePreviewHTML(title, width, height, factor, curveLabels = this.exportManager.exportCurveLabels, imageOptions = {}) {
    return this.exportManager.generateImagePreviewHTML(title, width, height, factor, curveLabels, imageOptions);
  }

  generatePrintHTML(
    includeGraph,
    includeTable,
    includeCalc,
    margin,
    title,
    width,
    height,
    factor,
    curveLabels = this.exportManager.exportCurveLabels,
    printOptions = {}
  ) {
    return this.exportManager.generatePrintHTML(
      includeGraph,
      includeTable,
      includeCalc,
      margin,
      title,
      width,
      height,
      factor,
      curveLabels,
      printOptions
    );
  }
}

UIManager.MAX_PRINT_TABLE_POINTS = MAX_PRINT_TABLE_POINTS;
UIManager.escapeHTML = escapeHTML;