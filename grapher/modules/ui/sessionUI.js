import { alertModal, showToast, NavigationManager, FileDropManager } from '../../../common/common.js';
import { DEFAULT_SETTINGS, saveSettings, clearSavedSettings } from '../settingsManager.js';

const $ = (selector) => document.querySelector(selector);

export default class SessionUI {
  constructor(ui) {
    this.ui = ui;
  }

  /**
   * Bascule l'affichage entre les boutons d'action et un spinner
   * dans la modale "Nouveau fichier".
   * @param {boolean} isLoading
   */
  setModalLoading(isLoading) {
    const buttons = document.getElementById('new-file-buttons');
    const spinner = document.getElementById('new-file-spinner');
    const modalTitle = document.querySelector('#new-file-modal .modal-card-title');

    if (isLoading) {
      modalTitle.textContent = "Chargement en cours...";
      buttons.classList.add('is-hidden');
      spinner.classList.remove('is-hidden');
    } else {
      modalTitle.textContent = "Créer ou importer une session";
      buttons.classList.remove('is-hidden');
      spinner.classList.add('is-hidden');
    }
  }

  /**
   * Initialise la navbar avec les boutons et leurs événements.
   */
  initNavbar() {
    const computeCurrentHash = () => {
      const curves = (this.ui.data?.curves || []).map(curve => ({
        title: curve.title,
        unit: curve.unit,
        color: curve.color,
        line: curve.line,
        markers: curve.markers,
        lineWidth: curve.lineWidth,
        lineStyle: curve.lineStyle,
        markerSymbol: curve.markerSymbol,
        markerRadius: curve.markerRadius,
        type: curve.type,
        values: Array.from(curve)
      }));
      const annotations = this.ui.data?.annotations || [];
      const parameters = this.ui.data?.parameters || {};
      const models = (this.ui.data?.models || []).map(m => ({
        id: m.id,
        type: m.type,
        x: m.x?.title,
        y: m.y?.title,
        visible: m.visible,
        color: m.color,
        lineWidth: m.lineWidth,
        lineStyle: m.lineStyle,
        minX: m.minX,
        maxX: m.maxX,
        parameters: m.parameters,
        rmse: m.rmse,
        rSquared: m.rSquared
      }));
      const script = typeof this.ui.editor?.getValue === 'function' ? this.ui.editor.getValue() : '';
      const xCurve = this.ui.grapher?.currentXCurve ?? null;
      const yCurves = Array.isArray(this.ui.grapher?.chart?.series)
        ? this.ui.grapher.chart.series
            .filter(s => !s.options?.id?.startsWith('model-') && s.visible !== false)
            .map(s => s.name)
            .sort()
        : [];

      let zoom = null;
      if (
        this.ui.grapher?.hasUserZoom &&
        typeof this.ui.grapher?.chart?.xAxis?.[0]?.getExtremes === 'function' &&
        typeof this.ui.grapher?.chart?.yAxis?.[0]?.getExtremes === 'function'
      ) {
        const xEx = this.ui.grapher.chart.xAxis[0].getExtremes();
        const yEx = this.ui.grapher.chart.yAxis[0].getExtremes();
        zoom = {
          xUserMin: xEx.userMin ?? null,
          xUserMax: xEx.userMax ?? null,
          yUserMin: yEx.userMin ?? null,
          yUserMax: yEx.userMax ?? null
        };
      }

      const lastSortVariable = this.ui.data?.lastSortVariable ?? null;

      return JSON.stringify({
        curves,
        annotations,
        parameters,
        models,
        script,
        xCurve,
        yCurves,
        zoom,
        lastSortVariable
      });
    };

    let lastSavedHash = null;
    this.ui.markAsSaved = () => {
      lastSavedHash = computeCurrentHash();
    };

    this.ui.resetSavedState = () => {
      lastSavedHash = null;
    };

    // Définit la condition pour vérifier la présence de données
    const hasUnsavedData = () => {
      const curvesEmpty = !this.ui.data?.curves || this.ui.data.curves.length === 0;
      const annotationsEmpty = !this.ui.data?.annotations || this.ui.data.annotations.length === 0;
      const modelsEmpty = !this.ui.data?.models || this.ui.data.models.length === 0;
      const scriptEmpty = !this.ui.editor?.getValue || this.ui.editor.getValue().trim() === '';

      if (curvesEmpty && annotationsEmpty && modelsEmpty && scriptEmpty) {
        return false;
      }
      return lastSavedHash !== computeCurrentHash();
    };
    this.ui.hasUnsavedData = hasUnsavedData;
    this.ui.navManager = new NavigationManager(hasUnsavedData);

    this.ui.navManager.addLink($('#navbar-home-button'), '../index.html');
    this.ui.navManager.addLink($('#navbar-audio-button'), '../audio/index.html');
    this.ui.navManager.addLink($('#navbar-tracker-button'), '../tracker/index.html');

    $("#tableur-tab").addEventListener("click", () => {
      $("#tableur-tab").classList.add("is-active");
      $("#grapheur-tab").classList.remove("is-active");
      $("#calculs-tab").classList.remove("is-active");

      $("#tableur-panel").classList.remove("is-hidden");
      $("#grapheur-panel").classList.add("is-hidden");
      $("#calculs-panel").classList.add("is-hidden");

      // Redimensionne le tableau pour qu'il s'affiche correctement
      let newHeight = $("#table-container").offsetHeight;
      this.ui.spreadsheet.hot.updateSettings({ height: newHeight });

      this.ui.updateSortUI();

      // On coupe les outils et le zoom en quittant le grapheur
      this.ui.clearActiveTool();
      if (this.ui.isZoomEnabled) this.ui.resetZoomUI();
    });

    $("#grapheur-tab").addEventListener("click", () => {
      $("#tableur-tab").classList.remove("is-active");
      $("#grapheur-tab").classList.add("is-active");
      $("#calculs-tab").classList.remove("is-active");

      $("#tableur-panel").classList.add("is-hidden");
      $("#grapheur-panel").classList.remove("is-hidden");
      $("#calculs-panel").classList.add("is-hidden");

      // Désélectionne toute cellule sélectionnée dans le tableur
      if (this.ui.spreadsheet && this.ui.spreadsheet.hot) {
        this.ui.spreadsheet.hot.deselectCell();
      }
    });

    $("#calculs-tab").addEventListener("click", () => {
      $("#tableur-tab").classList.remove("is-active");
      $("#grapheur-tab").classList.remove("is-active");
      $("#calculs-tab").classList.add("is-active");

      $("#tableur-panel").classList.add("is-hidden");
      $("#grapheur-panel").classList.add("is-hidden");
      $("#calculs-panel").classList.remove("is-hidden");

      // Désélectionne toute cellule sélectionnée dans le tableur
      if (this.ui.spreadsheet && this.ui.spreadsheet.hot) {
        this.ui.spreadsheet.hot.deselectCell();
      }

      // On coupe les outils et le zoom en quittant le grapheur
      this.ui.clearActiveTool();
      if (this.ui.isZoomEnabled) this.ui.resetZoomUI();
    });

    $("#menu-dropdown-toggle").addEventListener("click", function (event) {
      event.stopPropagation();
      $("#menu-dropdown-container").classList.toggle("is-active");
    });

    // Fermeture du menu déroulant lors d'un clic extérieur
    document.addEventListener("click", function () {
      $("#menu-dropdown-container").classList.remove("is-active");
    });
  }

  /**
   * Affiche la navigation par onglets et le panneau par défaut (Tableur).
   * Cette méthode est appelée lors de la création ou du chargement d'une session.
   */
  showTabsAndPanels() {
    const tabsContainer = document.querySelector('#nav-tabs').parentElement;
    const tableurPanel = document.getElementById('tableur-panel');
    const grapheurPanel = document.getElementById('grapheur-panel');
    const calculsPanel = document.getElementById('calculs-panel');
    const emptyStateContainer = document.getElementById('empty-state-container');

    emptyStateContainer.classList.add('is-hidden');
    tabsContainer.classList.remove('is-hidden');

    tableurPanel.classList.remove('is-hidden');
    grapheurPanel.classList.add('is-hidden');
    calculsPanel.classList.add('is-hidden');

    document.getElementById('tableur-tab').classList.add('is-active');
    document.getElementById('grapheur-tab').classList.remove('is-active');
    document.getElementById('calculs-tab').classList.remove('is-active');

    document.getElementById('tableur-tab').click();
  }

  /**
   * Ferme #new-file-modal si elle n'était pas déjà ouverte avant l'opération de chargement.
   * @param {Element|null} newFileModal
   * @param {boolean} wasOpen
   */
  _closeNewFileModalIfOpened(newFileModal, wasOpen) {
    if (!wasOpen && newFileModal) {
      this.ui.common?.modalManager?.closeModal?.(newFileModal);
      newFileModal.classList?.remove?.('is-active');
    }
  }

  /**
   * Charge un fichier après confirmation éventuelle et restaure #new-file-modal en cas d'erreur si elle était fermée.
   * @param {File} file
   * @param {{ showModalSpinner?: boolean, logLabel?: string }} [options]
   */
  loadFileWithFeedback(file, { showModalSpinner = false, logLabel = "Échec du chargement du fichier:" } = {}) {
    if (!file) return;

    return this.ui.navManager.confirmAction(async () => {
      const newFileModal = $("#new-file-modal");
      const wasNewFileModalOpen = Boolean(newFileModal?.classList?.contains?.('is-active'));

      this.ui.setModalLoading(true);
      if (showModalSpinner && newFileModal) {
        newFileModal.classList.add('is-active');
      }

      try {
        await this.ui.app.ioManager.loadFile(file);
        this.ui.showTabsAndPanels();
        this.ui.common.modalManager.closeAllModals();
        await new Promise(resolve => setTimeout(resolve, 50));
        this.ui.markAsSaved();
      } catch (error) {
        console.error(logLabel, error);
        this.ui._closeNewFileModalIfOpened(newFileModal, wasNewFileModalOpen);
        alertModal({
          type: 'warning',
          title: 'Erreur de chargement',
          body: error.message,
          confirm: 'OK'
        });
      } finally {
        this.ui.setModalLoading(false);
      }
    });
  }

  /**
   * Importe des données .pw transmises au démarrage (transfert inter-applications ou ouverture de fichier).
   * @param {string} importedPW
   * @param {{ markAsSaved?: boolean }} [options]
   * @returns {Promise<void>}
   */
  loadStartupPW(importedPW, { markAsSaved = false } = {}) {
    const newFileModal = $('#new-file-modal');
    const emptyStateContainer = $('#empty-state-container');
    const wasNewFileModalOpen = Boolean(newFileModal?.classList?.contains?.('is-active'));
    const wasEmptyStateHidden = Boolean(emptyStateContainer?.classList?.contains?.('is-hidden'));

    emptyStateContainer?.classList?.add('is-hidden');
    newFileModal?.classList?.add('is-active');
    this.ui.setModalLoading(true);

    console.log("Données importées depuis une autre application.");

    return new Promise((resolve) => {
      setTimeout(async () => {
        try {
          await this.ui.app.ioManager.loadPWFromString(importedPW);

          this.ui.showTabsAndPanels();
          this.ui.common.modalManager.closeAllModals();
          if (markAsSaved) {
            this.ui.markAsSaved();
          } else {
            this.ui.resetSavedState?.();
          }
          showToast("Données importées avec succès !", "is-success");
        } catch (e) {
          console.error("Échec du chargement des données inter-applications:", e);
          this.ui._closeNewFileModalIfOpened(newFileModal, wasNewFileModalOpen);
          if (!wasEmptyStateHidden && emptyStateContainer) {
            emptyStateContainer.classList.remove('is-hidden');
          }
          showToast(`Erreur lors du chargement des données : ${e.message}`, "is-danger");
        } finally {
          this.ui.setModalLoading(false);
          resolve();
        }
      }, 50);
    });
  }

  /**
   * Initialise les modales liées aux fichiers (nouveau, ouvrir, coller, etc.)
   * et gère les événements associés.
   */
  initFileModals() {
    $("#file-input").addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (!file) return;

      return this.ui.loadFileWithFeedback(file);
    });

    $("#file-input").addEventListener("click", () => {
      $("#file-input").value = null;
    });

    $("#paste-button").addEventListener('click', () => {
      this.ui.navManager.confirmAction(async () => {
        this.ui.setModalLoading(true);
        try {
          const text = await navigator.clipboard.readText();
          await this.ui.app.ioManager.loadClipboard(text);
          this.ui.showTabsAndPanels();
          this.ui.common.modalManager.closeAllModals();
          showToast("Données collées depuis le presse-papier !", "is-success");
        } catch (error) {
          showToast(`Erreur de collage : ${error.message}`, "is-warning");
        } finally {
          this.ui.setModalLoading(false);
        }
      });
    });

    $("#new-file-open-modal-button").addEventListener("click", () => {
      $("#new-file-modal").classList.add('is-active');
    });

    this.ui.fileDropManager = new FileDropManager(document.body, (file) => {
      if (!file) return;

      return this.ui.loadFileWithFeedback(file, {
        showModalSpinner: true,
        logLabel: "Échec du chargement du fichier par Drag&Drop:"
      });
    });
  }

  /**
   * Initialise le bouton de l'état vide au démarrage.
   */
  initEmptyState() {
    const emptyStateButton = document.getElementById('empty-state-new-session-btn');
    const newFileModalButton = document.getElementById('new-file-open-modal-button');

    emptyStateButton.addEventListener('click', () => {
      newFileModalButton.click();
    });
  }

  /**
   * Initialise la modale des paramètres et gère les événements associés.
   */
  initSettingsModal() {
    const settingsModal = document.getElementById('settings-modal');
    const saveButton = document.getElementById('settings-save-button');
    const resetButton = document.getElementById('settings-reset-button');
    const savePermanentlySwitch = document.getElementById('save-settings-permanently-switch');

    document.getElementById('settings-button').addEventListener('click', () => {
      this.ui.loadSettingsIntoModalUI(this.ui.readCurrentAppSettings());
      settingsModal.classList.add('is-active');
    });

    saveButton.addEventListener('click', () => {
      const newSettings = this.ui.readSettingsFromModal();
      this.ui.applySettingsToApp(newSettings);

      if (savePermanentlySwitch.checked) {
        saveSettings(newSettings);
        showToast("Réglages mémorisés.", "is-success", 2500);
      } else {
        showToast("Paramètres appliqués.", "is-info", 2500);
      }

      settingsModal.classList.remove('is-active');
    });

    resetButton.addEventListener('click', () => {
      alertModal({
        type: 'warning',
        title: 'Restaurer les paramètres par défaut',
        body: 'Êtes-vous sûr de vouloir continuer ? Vos réglages personnalisés seront supprimés.',
        confirm: {
          label: 'Oui, restaurer',
          type: 'warning',
          cb: () => {
            clearSavedSettings();
            const defaults = { ...DEFAULT_SETTINGS };
            this.ui.loadSettingsIntoModalUI(defaults);
            this.ui.applySettingsToApp(defaults);
            showToast("Paramètres par défaut restaurés.", "is-info", 2500);
          }
        },
        cancel: 'Annuler'
      });
    });

    const settingsTabs = document.querySelectorAll('#settings-tabs li');
    const settingsTabContents = document.querySelectorAll('.settings-panel-content');

    settingsTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetPanelId = tab.dataset.tab;

        settingsTabs.forEach(t => t.classList.remove('is-active'));
        settingsTabContents.forEach(p => p.classList.add('is-hidden'));
        tab.classList.add('is-active');

        const targetPanel = document.getElementById(targetPanelId);
        if (targetPanel) {
          targetPanel.classList.remove('is-hidden');
        }
      });
    });
  }

  /**
   * Lit l'état actuel des paramètres de l'app.
   * @returns {object}
   */
  readCurrentAppSettings() {
    return {
      significantDigits: this.ui.data?.settings?.significantDigits ?? 4,
      grapherGrid: this.ui.grapher.grid,
      minorGrid: this.ui.grapher.minorGrid,
      highlightZeroAxes: this.ui.grapher.highlightZeroAxes,
      disableScientificNotation: this.ui.grapher.disableScientificNotation,
      includeOriginOnAutoZoom: this.ui.grapher.includeOriginOnAutoZoom,
      derivatePoints: this.ui.calculation.derivatePoints,
      derivateEdges: this.ui.calculation.derivateEdges,
    };
  }

  /**
   * Charge un objet de paramètres dans l'UI de la modale.
   * @param {object} settings
   */
  loadSettingsIntoModalUI(settings) {
    $('#significant-digits-select').value = settings?.significantDigits ?? 4;
    $('#graph-grid-switch').checked = settings.grapherGrid;
    $('#graph-grid-minor-switch').checked = settings.minorGrid ?? true;
    $('#highlight-zero-axes-switch').checked = settings.highlightZeroAxes ?? true;
    $('#graph-disable-scientific-switch').checked = settings.disableScientificNotation || false;
    $('#include-origin-switch').checked = settings.includeOriginOnAutoZoom;
    $('#derivative-points-select').value = settings.derivatePoints;
    $('#derivate-edges-switch').checked = settings.derivateEdges;

    $('#save-settings-permanently-switch').checked = false;
  }

  /**
   * Lit les valeurs des champs de la modale et retourne un objet.
   * @returns {object}
   */
  readSettingsFromModal() {
    return {
      significantDigits: parseInt(document.getElementById('significant-digits-select').value) || 4,
      grapherGrid: document.getElementById('graph-grid-switch').checked,
      minorGrid: document.getElementById('graph-grid-minor-switch').checked,
      highlightZeroAxes: document.getElementById('highlight-zero-axes-switch').checked,
      disableScientificNotation: document.getElementById('graph-disable-scientific-switch').checked,
      includeOriginOnAutoZoom: document.getElementById('include-origin-switch').checked,
      derivatePoints: parseInt(document.getElementById('derivative-points-select').value),
      derivateEdges: document.getElementById('derivate-edges-switch').checked,
    };
  }

  /**
   * Applique un objet de paramètres aux différents modules de l'app.
   * @param {object} settings
   */
  applySettingsToApp(settings) {
    if (this.ui.data.settings.significantDigits !== settings.significantDigits) {
      this.ui.data.settings.significantDigits = settings.significantDigits;
      this.ui.spreadsheet.update();

      this.ui.data.models.forEach(model => this.ui.updateModelPanel(model));
      this.ui.updateCalculationUI();
      this.ui.grapher.chart.redraw();
    }

    if (this.ui.grapher.grid !== settings.grapherGrid) {
      this.ui.grapher.setGridVisibility(settings.grapherGrid);
    }
    if (this.ui.grapher.minorGrid !== settings.minorGrid) {
      this.ui.grapher.setMinorGridVisibility(settings.minorGrid);
    }

    if (this.ui.grapher.highlightZeroAxes !== settings.highlightZeroAxes) {
      this.ui.grapher.setHighlightZeroAxes(settings.highlightZeroAxes);
    }

    if (this.ui.grapher.disableScientificNotation !== settings.disableScientificNotation) {
      this.ui.grapher.setDisableScientificNotation(settings.disableScientificNotation);
    }

    if (this.ui.grapher.includeOriginOnAutoZoom !== settings.includeOriginOnAutoZoom) {
      this.ui.grapher.setIncludeOriginOnAutoZoom(settings.includeOriginOnAutoZoom);
    }

    let calcSettingsChanged = false;

    if (this.ui.calculation.derivatePoints !== settings.derivatePoints) {
      this.ui.calculation.derivatePoints = settings.derivatePoints;
      calcSettingsChanged = true;
    }

    if (this.ui.calculation.derivateEdges !== settings.derivateEdges) {
      this.ui.calculation.derivateEdges = settings.derivateEdges;
      calcSettingsChanged = true;
    }

    if (calcSettingsChanged) {
      this.ui.app.applyCalculation(this.ui.editor.getValue());
    }
  }

  /**
   * Initialise la modale de sauvegarde et gère les événements associés.
   */
  initSaveModal() {
    const fileNameInput = $("#file-name-input");
    const fileExtensionLabel = $("#file-extension-label");
    let selectedFormat = 'pw';

    $("#save-button").addEventListener("click", () => {
      const emptyStateContainer = document.getElementById('empty-state-container');
      const isEmptyState = emptyStateContainer && !emptyStateContainer.classList.contains('is-hidden');
      const hasNoData = (!this.ui.data?.curves || this.ui.data.curves.length === 0) &&
                        (!this.ui.editor?.getValue || this.ui.editor.getValue().trim() === '');

      if (isEmptyState || hasNoData) {
        showToast("Aucune donnée à sauvegarder.", "is-warning");
        return;
      }
      fileNameInput.value = "session";
      if (fileExtensionLabel) fileExtensionLabel.textContent = `.${selectedFormat}`;
      this.ui.common.modalManager.openModal($("#download-modal"));
    });

    function updateFormatSelection(newFormat) {
      selectedFormat = newFormat;

      $("#pw-button").classList.toggle("is-link", newFormat === 'pw');
      $("#csv-button").classList.toggle("is-link", newFormat === 'csv');
      $("#rw3-button").classList.toggle("is-link", newFormat === 'rw3');

      const warningElement = $('#save-format-warning');
      if (newFormat === 'csv') {
        warningElement.innerHTML = "Le format CSV ne sauvegarde que les données du tableur. Les courbes calculées, modèles et annotations seront perdus.";
      } else if (newFormat === 'rw3') {
        warningElement.innerHTML = "Le format RW3 ne sauvegarde que les données du tableur et les courbes calculées. Les modèles et annotations seront perdus.";
      } else {
        warningElement.innerHTML = "";
      }

      if (fileExtensionLabel) fileExtensionLabel.textContent = `.${newFormat}`;
      $("#csv-options")?.classList.toggle("is-hidden", newFormat !== 'csv');
    }

    $("#pw-button").addEventListener("click", () => updateFormatSelection('pw'));
    $("#csv-button").addEventListener("click", () => updateFormatSelection('csv'));
    $("#rw3-button").addEventListener("click", () => updateFormatSelection('rw3'));

    fileNameInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        $("#download-file-button").click();
      }
    });

    $("#download-file-button").addEventListener("click", () => {
      const baseName = fileNameInput.value || "session";
      const fileName = `${baseName}.${selectedFormat}`;
      const unitFormat = selectedFormat === 'csv'
        ? ($("#csv-unit-format-select")?.value || 'row')
        : undefined;

      this.ui.app.ioManager.saveFile(fileName, selectedFormat, unitFormat ? { unitFormat } : {});
      this.ui.markAsSaved();
      this.ui.common.modalManager.closeAllModals();
    });
  }

  /**
   * Initialise la modale de création rapide de grandeurs et paramètres.
   */
  initNewSessionModal() {
    const newFileBtn = document.getElementById('new-file-button');
    const initSessionModal = document.getElementById('init-session-modal');
    const closeBtn = document.getElementById('init-session-close-button');
    const skipBtn = document.getElementById('init-session-skip-btn');
    const confirmBtn = document.getElementById('init-session-confirm-btn');

    const grandeursTbody = document.querySelector('#init-grandeurs-table tbody');
    const paramsTbody = document.querySelector('#init-parametres-table tbody');

    const createRow = (isParam) => {
      const tr = document.createElement('tr');
      if (isParam) {
        tr.innerHTML = `
          <td><input class="input is-small name-input" type="text" placeholder="Ex: g"></td>
          <td><input class="input is-small value-input no-spin" type="number" step="any" placeholder="Ex: 9.81"></td>
          <td><input class="input is-small unit-input" type="text" placeholder="Ex: m/s²"></td>
          <td class="has-text-centered">
            <button class="button is-small is-danger is-light delete-row-btn" title="Supprimer">
              <span class="icon"><i class="fas fa-trash"></i></span>
            </button>
          </td>
        `;
      } else {
        tr.innerHTML = `
          <td><input class="input is-small name-input" type="text" placeholder="Ex: t"></td>
          <td><input class="input is-small unit-input" type="text" placeholder="Ex: s"></td>
          <td class="has-text-centered">
            <button class="button is-small is-danger is-light delete-row-btn" title="Supprimer">
              <span class="icon"><i class="fas fa-trash"></i></span>
            </button>
          </td>
        `;
      }

      tr.querySelector('.delete-row-btn').addEventListener('click', () => {
        const tbody = tr.closest('tbody');
        if (tbody.querySelectorAll('tr').length > 1) {
          tr.remove();
        } else {
          tr.querySelectorAll('input').forEach(input => input.value = '');
        }
      });
      return tr;
    };

    document.getElementById('add-init-grandeur-btn').addEventListener('click', () => {
      grandeursTbody.appendChild(createRow(false));
    });

    document.getElementById('add-init-parametre-btn').addEventListener('click', () => {
      paramsTbody.appendChild(createRow(true));
    });

    newFileBtn.addEventListener("click", () => {
      this.ui.navManager.confirmAction(() => {
        this.ui.app.resetSession();
        this.ui.editor.setValue('');

        grandeursTbody.innerHTML = '';
        paramsTbody.innerHTML = '';
        grandeursTbody.appendChild(createRow(false));
        grandeursTbody.appendChild(createRow(false));
        paramsTbody.appendChild(createRow(true));

        this.ui.common.modalManager.closeAllModals();
        initSessionModal.classList.add('is-active');

        setTimeout(() => {
          const firstInput = grandeursTbody.querySelector('.name-input');
          if (firstInput) firstInput.focus();
        }, 100);
      });
    });

    const closeAndStart = () => {
      initSessionModal.classList.remove('is-active');
      this.ui.app.spreadsheet.focusFirstCell(true);
      this.ui.showTabsAndPanels();
    };

    closeBtn.addEventListener('click', closeAndStart);
    skipBtn.addEventListener('click', closeAndStart);

    initSessionModal.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && !event.shiftKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        confirmBtn.click();
      }
    });

    confirmBtn.addEventListener('click', () => {
      let hasError = false;
      let errorMessage = "";

      const itemsToCreate = [];

      grandeursTbody.querySelectorAll('tr').forEach(tr => {
        const name = tr.querySelector('.name-input').value.trim();
        const unit = tr.querySelector('.unit-input').value.trim().replace(/\s+/g, '');
        if (name) itemsToCreate.push({ name, unit, isParam: false });
      });

      paramsTbody.querySelectorAll('tr').forEach(tr => {
        const name = tr.querySelector('.name-input').value.trim();
        const valueStr = tr.querySelector('.value-input').value.trim();
        const value = valueStr !== "" ? parseFloat(valueStr) : 1;
        const unit = tr.querySelector('.unit-input').value.trim().replace(/\s+/g, '');

        if (name) itemsToCreate.push({ name, value, unit, isParam: true });
      });

      const seenSymbols = new Set();
      for (const item of itemsToCreate) {
        const validationResult = this.ui.app.symbolValidator.validate(item.name);

        if (seenSymbols.has(item.name)) {
          hasError = true;
          errorMessage = `Le symbole "${item.name}" est saisi plusieurs fois. Chaque grandeur et paramètre doit avoir un nom unique.`;
          break;
        }

        if (!validationResult.isValid) {
          hasError = true;
          errorMessage = validationResult.message;
          break;
        }
        seenSymbols.add(item.name);
      }

      if (hasError) {
        showToast(errorMessage, "is-danger");
        return;
      }

      let editorContent = "";

      itemsToCreate.forEach(item => {
        if (item.isParam) {
          const finalValue = isNaN(item.value) ? 1 : item.value;
          const varWithUnit = item.unit ? `${item.name}_${item.unit}` : item.name;
          editorContent += `${varWithUnit} = ${finalValue}\n`;
        } else {
          this.ui.app.addCurve(item.name, item.unit, false, true);
        }
      });

      if (editorContent !== "") {
        this.ui.editor.setValue(editorContent.trim());
        this.ui.app.applyCalculation(this.ui.editor.getValue());
      } else {
        this.ui.updateCalculationUI();
      }

      closeAndStart();
    });
  }
}
