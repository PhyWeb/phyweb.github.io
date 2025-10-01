import { formatNumber } from '../../common/formatter.js';
import { alertModal, quitConfirmationModal } from '../../common/common.js';
import { DEFAULT_SETTINGS, saveSettings, loadSettings, clearSavedSettings } from './settingsManager.js';

const $ = document.querySelector.bind(document);

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

    this.isNavigationConfirmed = false; // Pour gérer la confirmation de navigation

    this.initialSettings = {}; // Pour stocker les paramètres initiaux lors de l'ouverture de la modale des paramètres
  }

  setApp(app) {
    this.app = app;
  }

  initialize() {
    this.initNavbar();
    this.initFileModals();
    this.initSettingsModal();
    this.initSaveModal();
    this.initSpreadsheetControls();
    this.initGrapherControls();
    this.initModelisationControls();
    this.initCalculationControls();
    this.initBeforeUnload();

    // Convertit les icônes FontAwesome
    window.FontAwesome.dom.i2svg();

  }

  /**
   * Met à jour l'interface utilisateur de la section Calcul en fonction des courbes, paramètres et fonctions disponibles.
   */
  updateCalculationUI() {
    // Tooltips
    const functionTooltips = {
      sqrt: 'Racine carrée',
      cbrt: 'Racine cubique',
      abs: 'Valeur absolue',
      exp: 'Exponentielle (e^x)',
      log: 'Logarithme en base 10',
      ln: 'Logarithme népérien',
      round: 'Arrondi à l\'entier le plus proche',
      floor: 'Partie entière (arrondi inférieur)',
      ceil: 'Arrondi supérieur',
      sin: 'Sinus (en radians)',
      cos: 'Cosinus (en radians)',
      tan: 'Tangente (en radians)',
      asin: 'Arc sinus',
      acos: 'Arc cosinus',
      atan: 'Arc tangente',
      sinh: 'Sinus hyperbolique',
      cosh: 'Cosinus hyperbolique',
      tanh: 'Tangente hyperbolique',
      asinh: 'Arc sinus hyperbolique',
      acosh: 'Arc cosinus hyperbolique',
      atanh: 'Arc tangente hyperbolique',
      diff: 'Dérivée numérique ex: diff(y,t)'
    };

    /**
     * Remplit une liste dans la barre latérale.
     * @param {string} containerId - L'ID de l'élément conteneur.
     * @param {string[]|object} items - Le tableau de chaînes ou l'objet de paramètres.
     * @param {object} options - Options d'affichage.
     * @param {boolean} options.isFunction - Si true, ajoute des parenthèses et utilise une grille.
     * @param {boolean} options.isParameter - Si true, traite `items` comme un objet et affiche les valeurs.
     */
    let populateList = (containerId, items, options = {}) => {
      const { isFunction = false, isParameter = false } = options;
      const containerElement = document.getElementById(containerId);
      if (!containerElement) return;
      containerElement.innerHTML = ''; // Vide le conteneur


      const colors = {
        function: '#544fc5',
        variable: '#008000',
        parameter: '#d568fb'
      };

      if (isFunction) {
        // Créer une grille à 3 colonnes pour les fonctions
        for (let i = 0; i < items.length; i += 3) {
          const columnsDiv = document.createElement('div');
          columnsDiv.className = 'columns is-mobile is-gapless';
          
          for (let j = i; j < i + 3 && j < items.length; j++) {
            const columnDiv = document.createElement('div');
            columnDiv.className = 'column';
            
            const item = items[j];
            const a = document.createElement('a');
            a.textContent = `${item}()`;
            a.dataset.value = `${item}()`;
            a.style.color = colors.function;
            // Add a tooltip if it exists
            if (functionTooltips[item]) {
              a.setAttribute('title', functionTooltips[item]);
            }
            columnDiv.appendChild(a);
            columnsDiv.appendChild(columnDiv);
          }
          containerElement.appendChild(columnsDiv);
        }
      } else {
        // Créer une liste simple pour les courbes et paramètres
        const ul = document.createElement('ul');
        ul.className = 'menu-list';

        if (isParameter) {
          const significantDigits = this.data.settings.significantDigits;
          for (const [key, param] of Object.entries(items)) {
            const li = document.createElement('li');
            const a = document.createElement('a');
            
            const unitText = param.unit ? ` ${param.unit}` : '';
            const displayValue = formatNumber(param.value, significantDigits);

            a.innerHTML = `<span style="color: ${colors.parameter}; font-weight: bold;">${key}</span> = ${displayValue}<span style="color: #7a7a7a;">${unitText}</span>`;
            a.dataset.value = key;
            li.appendChild(a);
            ul.appendChild(li);
          }
        } else { // C'est une grandeur
          items.forEach(curve => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            
            const unitText = curve.unit ? ` (${curve.unit})` : '';
            
            a.innerHTML = `<span style="color: ${colors.variable}; font-weight: bold;">${curve.title}</span><span style="color: #7a7a7a;">${unitText}</span>`;
            a.dataset.value = curve.title; // On insère toujours juste le nom
            li.appendChild(a);
            ul.appendChild(li);
          });
        }
        containerElement.appendChild(ul);
      }
    }

    populateList('calculation-sidebar-curves', this.data.curves);
    populateList('calculation-sidebar-params', this.data.parameters, { isParameter: true });
    populateList('calculation-sidebar-functions', this.calculation.getAvailableFunctions(), { isFunction: true });

    const curveNames = this.data.curves.map(c => c.title);
    const parameterNames = Object.keys(this.data.parameters);
    const functionNames = this.calculation.getAvailableFunctions();
    
    CodeMirror.defineMode("phyweb-calc", function() {
      return {
        token: function(stream) {
          if (stream.eatSpace()) return null;

          // Regex qui capture un "mot" (variable + unité complexe) jusqu'à un séparateur.
          // Un séparateur est un espace, une virgule, ou un opérateur mathématique principal.
          if (stream.match(/^[a-zA-Z_][^=+\-*(),\s]*/)) {
            const word = stream.current();
            
            if (functionNames.includes(word)) {
              return "phyweb-function";
            }

            const baseName = word.split('_')[0];
            if (curveNames.includes(baseName)) {
              return "variable-2";
            }
            if (parameterNames.includes(baseName)) {
              return "def";
            }
            
            // Si le mot n'est pas reconnu, il n'est pas coloré.
            return null;
          }

          // --- Si ce n'est pas un mot, on cherche le reste ---

          if (stream.match(/^#.*/) || stream.match(/^\/\/.*/) || stream.match(/^'.*/)) return "comment";
          if (stream.match(/^[0-9]+([,.][0-9]+)?/)) return "number"; // Gère les nombres avec . ou ,
          if (stream.match(/^[=+\-*/^(),]/)) return "operator";

          // Fallback pour ne jamais bloquer
          stream.next();
          return null;
        }
      };
    });
    
    this.editor.setOption("mode", "phyweb-calc");
  }

  /**
   * Met à jour la visibilité du bouton de recalcul des modèles en fonction de la présence de modèles 
   */
  updateRecalculateButtonVisibility() {
    if (this.data.models.length > 0) {
      $("#recalculate-models-button").classList.remove('is-hidden');
    } else {
      $("#recalculate-models-button").classList.add('is-hidden');
    }
  }

  /**
   * Met à jour le panneau d'un modèle spécifique avec ses paramètres et son état de visibilité.
   * @param {Object} model - L'objet modèle à mettre à jour.
   */
  updateModelPanel(model) {
    const significantDigits = this.data.settings.significantDigits;
    const panel = $(`#model-list article[data-model-id="${model.id}"]`);

    panel.querySelector('.message-header p').innerHTML = `${model.y.title} = f(${model.x.title})`;
    panel.querySelector('.message-body p:nth-of-type(2)').innerHTML = model.getEquationString();
    const ul = panel.querySelector('ul');
    ul.innerHTML = '';
    
    model.parameters.forEach(param => {
      const li = document.createElement('li');
      const displayValue = formatNumber(param.value, significantDigits);
      li.innerHTML = `${param.name} = ${displayValue}`;
      ul.appendChild(li);
    });
    const icon = panel.querySelector('.fa-eye, .fa-eye-slash');
    if (model.visible) {
      icon.classList.remove('fa-eye-slash');
      icon.classList.add('fa-eye');
    } else {
      icon.classList.remove('fa-eye');
      icon.classList.add('fa-eye-slash');
    }

    // On met à jour l'affichage de l'écart-type et du R²
    const ul2 = panel.querySelector('ul:last-of-type');
    if (ul2) {
      ul2.innerHTML = ''; // Nettoyer la liste avant de la mettre à jour
      
      // Ajout de l'écart-type
      const liRmse = document.createElement('li');
      liRmse.innerHTML = `Écart-type : ${model.rmse !== null ? formatNumber(model.rmse, significantDigits) : 'Indéfini'}`;
      ul2.appendChild(liRmse);
      
      // Ajout du R²
      const liRSquared = document.createElement('li');
      liRSquared.innerHTML = `Coeff de corrélation : ${model.rSquared !== null ? formatNumber(model.rSquared, 5) : 'Indéfini'}`;
      ul2.appendChild(liRSquared);
    }
  }

  updateSortUI() {
    const select = $('#sort-variable-select');

    const selectedValue = select.value;
    select.innerHTML = ''; // Vide les options

    const defaultOption = document.createElement('option');
    defaultOption.textContent = "Trier par...";
    defaultOption.value = "";
    defaultOption.disabled = true;
    select.appendChild(defaultOption);

    this.data.curves.forEach(curve => {
      const option = document.createElement('option');
      option.value = curve.title;
      option.textContent = curve.title;
      select.appendChild(option);
    });

    // Restaure la sélection si elle est toujours valide
    if (this.data.curves.some(c => c.title === selectedValue)) {
      select.value = selectedValue;
    } else {
      select.value = ""; // Sinon, sélectionne le placeholder
    }
  }

  /**
   * Met à jour les icônes de visibilité de tous les panneaux de modèle en fonction de l'état actuel des modèles.
   */
  updateAllModelPanelVisibilityIcons() {
    this.data.models.forEach(model => {
      const panel = $(`#model-list article[data-model-id="${model.id}"]`);
      if (panel) {
        const visibleButton = panel.querySelector('.fa-eye, .fa-eye-slash').closest('button');
        const isVisible = model.x.title === this.grapher.currentXCurve && model.visible;
        visibleButton.innerHTML = `<span class="icon"><i class="fas fa-${isVisible ? 'eye' : 'eye-slash'}"></i></span>`;
        window.FontAwesome.dom.i2svg({ node: visibleButton });
      }
    });
  }

  /**
   * Initialise la navbar avec les boutons et leurs événements.
   */
  initNavbar() {
    const quitConfirm = (path)=>{
      // Check if data exists
      if(this.data.curves.length === 0 && this.editor.getValue().trim() === ''){
        window.location.replace(path);
        return;
      }

      quitConfirmationModal(()=>{
        this.isNavigationConfirmed = true; //On lève le drapeau pour que 'beforeunload' ignore.
        window.location.replace(path);
      })    
    }

    $("#navbar-home-button").addEventListener("click", () => {
      quitConfirm("../index.html");
    });
    $("#navbar-audio-button").addEventListener("click", () => {
      quitConfirm("../audio/index.html");
    });
    $("#navbar-tracker-button").addEventListener("click", () => {
      quitConfirm("../tracker/index.html");
    });

    $("#tableur-tab").addEventListener("click", () => {
      $("#tableur-tab").classList.add("is-active");
      $("#grapheur-tab").classList.remove("is-active");
      $("#calculs-tab").classList.remove("is-active");

      $("#tableur-panel").classList.remove("is-hidden");
      $("#grapheur-panel").classList.add("is-hidden");
      $("#calculs-panel").classList.add("is-hidden");

      // Redimensionne le tableau pour qu'il s'affiche correctement
      let newHeight = $("#table-container").offsetHeight;
      this.spreadsheet.hot.updateSettings({ height: newHeight })

      this.updateSortUI();
    });
    $("#grapheur-tab").addEventListener("click", () => {
      $("#tableur-tab").classList.remove("is-active");
      $("#grapheur-tab").classList.add("is-active");
      $("#calculs-tab").classList.remove("is-active");

      $("#tableur-panel").classList.add("is-hidden");
      $("#grapheur-panel").classList.remove("is-hidden");
      $("#calculs-panel").classList.add("is-hidden");
    });
    $("#calculs-tab").addEventListener("click", () => {
      $("#tableur-tab").classList.remove("is-active");
      $("#grapheur-tab").classList.remove("is-active");
      $("#calculs-tab").classList.add("is-active");

      $("#tableur-panel").classList.add("is-hidden");
      $("#grapheur-panel").classList.add("is-hidden");
      $("#calculs-panel").classList.remove("is-hidden");
    });

    // DEBUG
    $("#debug-button").addEventListener("click", () => {
      console.log("data",this.data);
      console.log("chart",this.grapher.chart);
    });

    $("#menu-dropdown-toggle").addEventListener("click", function (event) {
      event.stopPropagation();
      $("#menu-dropdown-container").classList.toggle("is-active");
    });

    // Close the dropdown when clicking outside
    document.addEventListener("click", function () {
      $("#menu-dropdown-container").classList.remove("is-active");
    });
  }

  /**
   * Initialise les modales liées aux fichiers (nouveau, ouvrir, coller, etc.)
   * et gère les événements associés.
   */
  initFileModals() {
    // Utility function to confirm new data
    let newDataConfirmation = (cb) =>{
      // Check if data exists
      if(this.data.curves.length === 0 && this.editor.getValue().trim() === ''){
        cb();
        return;
      } else{
        alertModal({
          type: "danger",
          title: "Attention",
          body: "Cette action supprimera toutes les données actuelles. Êtes-vous sûr de vouloir continuer ?",
          confirm: {
            label: "Oui, supprimer",
            type: "danger", // Pour un bouton rouge
            cb: () => { // TODO ya plus simple la non ?
              cb();
            }
          },
          cancel: "Annuler"
        });
        return;
      }
    }

    $("#file-input").addEventListener('change', async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      // La confirmation de suppression des données existantes
      newDataConfirmation(async () => {
        try {
          console.log("try")
          // On attend que le chargement soit terminé (succès ou échec)
          await this.app.ioManager.loadFile(file);
          // Si aucune erreur n'est levée, ON FERME LA MODALE
          console.log("try2")
          this.common.modalManager.closeAllModals();
        } catch (error) {
          console.log("catch")
          // Si une erreur est levée par ioManager, on affiche une alerte
          // et la modale reste ouverte.
          alertModal({
            type: 'warning',
            title: 'Erreur de chargement',
            body: error.message,
            confirm: 'OK'
          });
        }
      });
    });

    $("#file-input").addEventListener("click", () => {
      $("#file-input").value = null; // allow the onchange trigger even if the same file is selected twice
    });

    $("#new-file-button").addEventListener("click", () => {
      newDataConfirmation(() => {
        this.app.deleteAllCurves();
        this.editor.setValue('');
        this.common.modalManager.closeAllModals();
      });
    });

    $("#paste-button").addEventListener('click', () => {
      newDataConfirmation(async () => {
        try {
          const text = await navigator.clipboard.readText();
          // On attend que les données soient chargées et validées
          await this.app.ioManager.loadClipboard(text);
          // Si c'est un succès, ON FERME LA MODALE
          this.common.modalManager.closeAllModals();
        } catch (error) {
          // Si le clipboard est vide, non autorisé, ou si les données sont invalides
          alertModal({
            type: 'warning',
            title: 'Erreur de collage',
            body: error.message,
            confirm: 'OK'
          });
        }
      });
    });

    // Show the new file modal
    $("#new-file-open-modal-button").addEventListener("click", () => {
        $("#new-file-modal").classList.add('is-active');
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

    // Ouvrir la modale
    document.getElementById('settings-button').addEventListener('click', () => {
      // Charger les paramètres ACTUELS de l'application dans la modale
      this.loadSettingsIntoModalUI(this.readCurrentAppSettings());
      settingsModal.classList.add('is-active');
    });

    // Bouton "APPLIQUER"
    saveButton.addEventListener('click', () => {
      // Lire les valeurs depuis la modale
      const newSettings = this.readSettingsFromModal();
      
      // Appliquer ces nouveaux paramètres à l'application (pour la session en cours)
      this.applySettingsToApp(newSettings);
      
      // Si l'interrupteur est coché, sauvegarder dans le localStorage
      if (savePermanentlySwitch.checked) {
        saveSettings(newSettings);
      }
      
      // Fermer la modale
      settingsModal.classList.remove('is-active');
    });

    // Bouton "RESTAURER LES DÉFAUTS"
    resetButton.addEventListener('click', () => {
      alertModal({
        type: 'warning',
        title: 'Restaurer les paramètres par défaut',
        body: 'Êtes-vous sûr de vouloir continuer ? Vos réglages personnalisés seront supprimés.',
        confirm: {
          label: 'Oui, restaurer',
          type: 'warning',
          cb: () => {
            // Supprimer les réglages du localStorage
            clearSavedSettings();
            
            // Obtenir une copie fraîche des valeurs par défaut
            const defaults = { ...DEFAULT_SETTINGS };
            
            // Mettre à jour l'UI de la modale pour montrer ces nouvelles valeurs
            this.loadSettingsIntoModalUI(defaults);
            
            // Appliquer immédiatement ces défauts à l'application
            this.applySettingsToApp(defaults);
          }
        },
        cancel: 'Annuler'
      });
    });
    
    // Gestion des onglets de la modale des paramètres
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
   * FONCTION UTILITAIRE : Lit l'état actuel des paramètres de l'app.
   * @returns {object} Un objet représentant l'état actuel.
   */
  readCurrentAppSettings() {
    return {
      significantDigits: this.data.settings.significantDigits,
      grapherGrid: this.grapher.gridVisible,
      derivatePoints: this.calculation.derivatePoints,
      derivateEdges: this.calculation.derivateEdges,
    };
  }


  /**
   * Charge un objet de paramètres dans l'UI de la modale.
   * @param {object} settings - L'objet de paramètres à charger.
   */
  loadSettingsIntoModalUI(settings) {
    $('#significant-digits-select').value = settings.significantDigits;
    $('#graph-grid-switch').checked = settings.grid;
    $('#derivative-points-select').value = settings.derivatePoints;
    $('#derivate-edges-switch').checked = settings.derivateEdges;
    // Par défaut, la case de sauvegarde n'est pas cochée
    $('#save-settings-permanently-switch').checked = false; 
  }

  /**
   * Lit les valeurs des champs de la modale et retourne un objet.
   * @returns {object} Un objet contenant les nouvelles valeurs des paramètres.
   */
  readSettingsFromModal() {
    return {
      significantDigits: parseInt(document.getElementById('significant-digits-select').value),
      grapherGrid: document.getElementById('graph-grid-switch').checked,
      derivatePoints: parseInt(document.getElementById('derivative-points-select').value),
      derivateEdges: document.getElementById('derivate-edges-switch').checked,
    };
  }

  /**
   * Applique un objet de paramètres aux différents modules de l'app.
   * @param {object} settings - L'objet de paramètres à appliquer.
   */
  applySettingsToApp(settings) {
    // Appliquer aux données et au tableur
    if (this.data.settings.significantDigits !== settings.significantDigits) {
      this.data.settings.significantDigits = settings.significantDigits;
      this.spreadsheet.update();
    }
    
    // Appliquer au grapheur
    if (this.grapher.grid !== settings.grapherGrid) {
      this.grapher.setGridVisibility(settings.grapherGrid);
    }
    
    // Appliquer aux calculs
    this.calculation.derivatePoints = settings.derivatePoints;
    this.calculation.derivateEdges = settings.derivateEdges;
  }

  /**
   * Initialise la modale de sauvegarde et gère les événements associés.
   */
  initSaveModal() {
    const fileNameInput = $("#file-name-input");
    let selectedFormat = 'pw'; // Le format par défaut

    // Ouvre la modale de sauvegarde
    $("#save-button").addEventListener("click", () => {
      if (this.data.curves.length === 0 && this.editor.getValue().trim() === '') {
        alertModal({
          title: "Aucune donnée",
          body: "Aucune donnée à sauvegarder.",
          confirm: "OK"
        });
        return;
      }
      // Réinitialise le nom du fichier à chaque ouverture
      fileNameInput.value = `session.${selectedFormat}`;
      $("#download-modal").classList.add("is-active");
    });

    function updateFormatSelection(newFormat) {
      selectedFormat = newFormat;
      
      // Met à jour l'état des boutons
      $("#pw-button").classList.toggle("is-link", newFormat === 'pw');
      $("#csv-button").classList.toggle("is-link", newFormat === 'csv');
      $("#rw3-button").classList.toggle("is-link", newFormat === 'rw3');

      // Met à jour le placeholder et la valeur du nom de fichier
      const baseName = (fileNameInput.value.split('.')[0] || 'session');
      fileNameInput.placeholder = `${baseName}.${newFormat}`;
      fileNameInput.value = `${baseName}.${newFormat}`;
    }

    // Gère les clics sur les boutons de format
    $("#pw-button").addEventListener("click", () => updateFormatSelection('pw'));
    $("#csv-button").addEventListener("click", () => updateFormatSelection('csv'));
    $("#rw3-button").addEventListener("click", () => updateFormatSelection('rw3'));

    // Gère le téléchargement final
    $("#download-file-button").addEventListener("click", () => {
      const fileName = fileNameInput.value || fileNameInput.placeholder;
      if (!fileName) {
        alertModal({
          title: "Nom de fichier manquant",
          body: "Veuillez entrer un nom de fichier.",
          confirm: "OK"
        });
        return;
      }
      
      this.app.ioManager.saveFile(fileName, selectedFormat);
      this.common.modalManager.closeAllModals();
    });
  }

  /**
   * Initialise les contrôles du tableur et gère les événements associés.
   */
  initSpreadsheetControls() {
    this.updateSortUI();

    // Ajouter l'écouteur pour le bouton de tri
    $('#sort-button').addEventListener('click', () => {
      const selectedVariable = $('#sort-variable-select').value;
      if (selectedVariable) {
        this.data.sortDataBy(selectedVariable);
        this.spreadsheet.update();
        this.grapher.updateChart();
      }
    });

    this.initAddCurveModal();
    this.initDeleteCurveModal();
    this.initDeleteLineButton();

  }


  /**
   * Initialise la modale d'ajout de courbe et gère les événements associés.
   */
  initAddCurveModal() {
    // Références aux éléments de la modale
    const addCurveModal = $('#add-curve-modal');
    const radioButtons = addCurveModal.querySelectorAll('input[name="creation-type"]');
    const addCurveConfirmButton = $('#add-curve-confirm-button');

    // Panels de la modale
    const emptyCurvePanel = $('#empty-curve-panel');
    const calcCurvePanel = $('#calc-curve-panel');
    const derivateCurvePanel = $('#derivate-curve-panel');
    const parameterPanel = $('#parameter-panel');
    const allPanels = [emptyCurvePanel, calcCurvePanel, derivateCurvePanel, parameterPanel];

    // Références aux champs de saisie pour chaque panneau
    const emptyCurveSymbolInput = $('#empty-curve-symbol-input');
    const emptyCurveUnitInput = $('#empty-curve-unit-input');

    const calcCurveSymbolInput = $('#calc-curve-symbol-input');
    const calcCurveUnitInput = $('#calc-curve-unit-input');
    const calcCurveFormulaInput = $('#calc-curve-formula-input');

    const derivateCurveSymbolInput = $('#derivate-curve-symbol-input');
    const derivateCurveUnitInput = $('#derivate-curve-unit-input');
    const derivateNumeratorSelect = $('#derivate-numerator-select');
    const derivateDenominatorSelect = $('#derivate-denominator-select');

    const parameterSymbolInput = $('#parameter-symbol-input');
    const parameterUnitInput = $('#parameter-unit-input');
    const parameterValueInput = $('#parameter-value-input');

    /**
     * Met à jour le panneau visible en fonction du bouton radio sélectionné.
     */
    function updateVisiblePanel() {
      const selectedValue = addCurveModal.querySelector('input[name="creation-type"]:checked').value;
      allPanels.forEach(panel => panel.classList.add('is-hidden'));

      switch (selectedValue) {
        case 'empty-curve':
          emptyCurvePanel.classList.remove('is-hidden');
          break;
        case 'calc-curve':
          calcCurvePanel.classList.remove('is-hidden');
          break;
        case 'derivate-curve':
          derivateCurvePanel.classList.remove('is-hidden');
          break;
        case 'parameter':
          parameterPanel.classList.remove('is-hidden');
          break;
      }
    }

    /**
     * Peuple les menus déroulants pour la dérivation avec les courbes disponibles.
     * @param {string[]} curveNames - Un tableau des noms des courbes (ex: ['t', 'x', 'y']).
     */
    function populateDerivativeSelects(curveNames) {
      derivateNumeratorSelect.innerHTML = '<option>Choisir numérateur</option>';
      derivateDenominatorSelect.innerHTML = '<option>Choisir dénominateur</option>';

      curveNames.forEach(name => {
        const optionNum = document.createElement('option');
        optionNum.value = name;
        optionNum.textContent = name;
        derivateNumeratorSelect.appendChild(optionNum);

        const optionDenom = document.createElement('option');
        optionDenom.value = name;
        optionDenom.textContent = name;
        derivateDenominatorSelect.appendChild(optionDenom);
      });
    }

    /**
     * Réinitialise tous les champs de la modale à leur état par défaut.
     */
    const resetAddCurveModal = () =>{
      emptyCurveSymbolInput.value = "";
      emptyCurveUnitInput.value = "";
      calcCurveSymbolInput.value = "";
      calcCurveUnitInput.value = "";
      calcCurveFormulaInput.value = "";
      derivateCurveSymbolInput.value = "";
      derivateCurveUnitInput.value = "";
      parameterSymbolInput.value = "";
      parameterUnitInput.value = "";
      parameterValueInput.value = "";

      const curveNames = this.data.curves.map(c => c.title);
      populateDerivativeSelects(curveNames);

      addCurveModal.classList.add("is-active");
    }

    /**
     * Récupère et valide les entrées de la modale en fonction du type sélectionné.
     * @param {string} selectedType - La valeur du bouton radio coché.
     * @returns {object|null} Un objet contenant les informations ou null si la validation échoue.
     */
    const getModalInputs = (selectedType) => {
      let symbol, unit, formulaLine;

      const validSymbolRegex = /^[a-zA-Z][a-zA-Z0-9]*$/; 

      // Fonction pour nettoyer et valider le symbole
      const processAndValidateSymbol = (element) => {
        let value = element.value.trim().replace(/\s+/g, ''); // Retire les espaces
        element.value = value; // Met à jour l'affichage

        if (value && !validSymbolRegex.test(value)) {
          alertModal({
            title: "Symbole invalide",
            body: "Le symbole doit commencer par une lettre et ne peut contenir que des lettres et des chiffres.",
            confirm: "OK"
          });
          return null;
        }
        return value;
      };

      // Fonction pour nettoyer l'unité
      const processUnit = (element) => {
          let value = element.value.trim().replace(/\s+/g, ''); // Retire les espaces
          element.value = value; // Met à jour l'affichage
          return value;
      };

      const symbolExists = (sym) => {
        if (this.data.getCurveByTitle(sym) || this.data.parameters.hasOwnProperty(sym)) {
          alertModal({
            title: "Symbole déjà utilisé",
            body: `Le symbole "${sym}" existe déjà. Veuillez en choisir un autre.`,
            confirm: "OK"
          });
          return true;
        }
        return false;
      };

      const buildVarWithUnit = (sym, u) => u ? `${sym}_${u}` : sym;

      switch (selectedType) {
        case 'calc-curve': {
          symbol = processAndValidateSymbol(calcCurveSymbolInput);
          if (symbol === null) return null;
          unit = processUnit(calcCurveUnitInput);
          const formula = calcCurveFormulaInput.value.trim();
          if (!symbol || !formula) {
            alertModal({
              title: "Symbole ou formule manquant",
              body: "Veuillez remplir le symbole et la formule.",
              confirm: "OK"
            });
            return null;
          }
          if (symbolExists(symbol)) return null;
          formulaLine = `${buildVarWithUnit(symbol, unit)} = ${formula}`;
          return { type: 'formula', formulaLine };
        }
        
        case 'derivate-curve': {
          symbol = processAndValidateSymbol(derivateCurveSymbolInput);
          if (symbol === null) return null;
          unit = processUnit(derivateCurveUnitInput);
          const numerator = derivateNumeratorSelect.value;
          const denominator = derivateDenominatorSelect.value;

          if (!symbol || numerator.startsWith('Choisir') || denominator.startsWith('Choisir')) {
            alertModal({
              title: "Symbole ou grandeurs manquants",
              body: "Veuillez remplir le symbole et choisir les deux grandeurs à dériver.",
              confirm: "OK"
            });
            return null;
          }
          if (symbolExists(symbol)) return null;
          
          // Construit la formule `diff`
          const formula = `diff(${numerator}, ${denominator})`;
          formulaLine = `${buildVarWithUnit(symbol, unit)} = ${formula}`;

          return { type: 'formula', formulaLine };
        }

        case 'parameter': {
          symbol = processAndValidateSymbol(parameterSymbolInput);
          if (symbol === null) return null;
          unit = processUnit(parameterUnitInput);
          const value = parameterValueInput.value.trim();
          if (!symbol || !value) {
            alertModal({
              title: "Symbole ou valeur manquants",
              body: "Veuillez remplir le symbole et la valeur.",
              confirm: "OK"
            });
            return null;
          }
          if (symbolExists(symbol)) return null;
          formulaLine = `${buildVarWithUnit(symbol, unit)} = ${value}`;
          return { type: 'formula', formulaLine };
        }
        
        case 'empty-curve': {
          symbol = processAndValidateSymbol(emptyCurveSymbolInput);
          if (symbol === null) return null;
          unit = processUnit(emptyCurveUnitInput);
          if (!symbol) {
            alertModal({
              title: "Symbole manquant",
              body: "Veuillez entrer un symbole.",
              confirm: "OK"
            });
            return null;
          }
          if (symbolExists(symbol)) return null;
          return { type: 'empty-curve', symbol, unit };
        }
        default:
          console.error("Type de création inconnu:", selectedType);
          return null;
      }
    }

    /**
     * Gère le changement de sélection des boutons radio pour afficher le panneau correspondant.
     */
    radioButtons.forEach(radio => {
      radio.addEventListener('change', updateVisiblePanel);
    });

    /**
     * Gère l'ouverture de la modale pour ajouter une courbe vide ou une courbe de calcul.
     */
    $('#add-curve-button').addEventListener("click", () => {
      resetAddCurveModal();
      addCurveModal.querySelector('input[value="empty-curve"]').click();
    });
    $('#add-curve-calculation-button').addEventListener("click", () => {
      resetAddCurveModal();
      addCurveModal.querySelector('input[value="calc-curve"]').click();
    });

    /**
     * Gère la confirmation de l'ajout de la courbe ou du paramètre.
     */
    addCurveConfirmButton.addEventListener('click', () => {
      const selectedType = addCurveModal.querySelector('input[name="creation-type"]:checked').value;
      const newEntry = getModalInputs(selectedType);

      if (!newEntry) {
        return; 
      }

      if (newEntry.type === 'empty-curve') {
        this.app.addCurve(newEntry.symbol, newEntry.unit);
      } else {
        const currentText = this.editor.getValue();
        const separator = currentText.trim() === '' ? '' : '\n\n'; 
        const newContent = currentText + separator + newEntry.formulaLine;
        this.editor.setValue(newContent);
        this.app.applyCalculation(this.editor.getValue());
      }
      
      // Fermer la modale
      this.common.modalManager.closeAllModals();
    });

    // Initialise l'état de la modale au chargement
    updateVisiblePanel();
  }

  /**
   * Initialise la modale de suppression de courbe et gère les événements associés.
   */
  initDeleteCurveModal(){
    $("#delete-curve-button").addEventListener("click", () => {
      if(this.data.curves.length === 0){
        return;
      }

      const selectElement = $("#delete-curve-select");
      selectElement.innerHTML = ""; // Vide les anciennes options

      // Peuple le menu déroulant avec les grandeurs disponibles
      this.data.curves.forEach(curve => {
        if(curve.type === "calculation") return; // On ne peut pas supprimer les modèles
        const option = document.createElement("option");
        option.value = curve.title;
        option.textContent = `${curve.title} (${curve.unit || 'sans unité'})`;
        selectElement.appendChild(option);
      });

      $("#delete-curve-modal").classList.add("is-active");
    });

    $("#delete-curve-confirm-button").addEventListener("click", () => {
      const curveTitleToDelete = $("#delete-curve-select").value;

      if (curveTitleToDelete) {
        this.app.deleteCurve(curveTitleToDelete);
      }

      this.common.modalManager.closeAllModals();
    });
  }

  /**
   * Initialise le bouton de suppression de lignes et gère les événements associés.
   */
  initDeleteLineButton(){
    $("#delete-line-button").addEventListener("click", () => {
      const selectedRange = this.spreadsheet.hot.getSelectedRangeLast();

      if (!selectedRange) {
        alertModal({
          title: "Aucune sélection",
          body: "Veuillez sélectionner une ou plusieurs lignes à supprimer.",
          confirm: "OK"
        });
        return;
      }

      const startRow = Math.min(selectedRange.from.row, selectedRange.to.row);
      const endRow = Math.max(selectedRange.from.row, selectedRange.to.row);
      const amount = (endRow - startRow) + 1;
      const rowLabel = amount > 1 ? 'lignes' : 'ligne';

      alertModal({
        type: "danger",
        title: "Confirmer la suppression",
        body: `<p>Êtes-vous sûr de vouloir supprimer <strong>${amount} ${rowLabel}</strong> ?<br>Cette action est irréversible.</p>`,
        confirm: {
          label: "Supprimer",
          type: "danger", // Pour un bouton rouge
          cb: () => { 
            this.app.deleteRow(startRow, amount); 
          }
        },
        cancel: "Annuler"
      });
    });
  }

  /**
   * Initialise les contrôles du grapheur et gère les événements associés.
   */
  initGrapherControls(){
    this.initTools();
    this.initChooseCurvesModal();
    this.initZoomControls();
  }

  /**
   * Initialise la modale de choix de courbes et gère les événements associés.
   */
  initChooseCurvesModal(){
    /**
     * Gère le remplissage des menus déroulants et l'ouverture de la modale.
     */
    $("#choose-curves-button").addEventListener("click", () => { 
      if(this.data.curves.length === 0){
        return;
      }
      populateCurveMenu();
      populateCurveSelect();
      populateColors();
      populateLineWidthSelect();
      populateMarkersRadiusSelect()

      // Cherche la première courbe affichée (cochée) et la sélectionne
      const firstCheckedCurve = $("#choose-curves-menu").querySelector("input:checked");
      if (firstCheckedCurve) {
        firstCheckedCurve.closest("a").click();
      } else {
        // Si aucune courbe n'est cochée, masquer le panneau de détails
        $("#curve-details-panel").classList.add("is-hidden");
      }

      $("#choose-x-curve-select").value = this.grapher.currentXCurve; // Set the current X curve in the select

      $("#choose-curves-modal").classList.add("is-active");
    });

    /**
     * Remplit le menu des courbes disponibles dans la modale.
     * Ajoute les écouteurs d'événements pour la sélection et la gestion des cases à cocher.
     */
    const populateCurveMenu = () =>{
      const menu = $("#choose-curves-menu");
      const panel = $("#curve-details-panel");
      menu.innerHTML = "";

      this.data.curves.forEach(curve => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.dataset.title = curve.title;

        const input = document.createElement("input");
        input.type = "checkbox";
        input.classList.add("mr-2");
        input.checked = this.grapher.chart.series.some(s => s.name === curve.title);

        const span = document.createElement("span");
        span.classList.add("ml-2");
        span.innerHTML = curve.title + (curve.unit ? ` (${curve.unit})` : '');

        const colorSwatch = document.createElement("span");
        colorSwatch.style.backgroundColor = curve.color;
        colorSwatch.style.width = '16px';
        colorSwatch.style.height = '16px';
        colorSwatch.style.display = 'inline-block';
        colorSwatch.style.border = '1px solid #dbdbdb';
        colorSwatch.style.verticalAlign = 'middle';
        colorSwatch.style.marginLeft = '5px';

        a.appendChild(input);
        a.appendChild(colorSwatch);
        a.appendChild(span);

        li.appendChild(a);
        menu.appendChild(li);

        // Event listener for the checkbox
        input.addEventListener("change", (e) => {
          e.stopPropagation(); // Empêche l'événement de se propager au lien parent
          const activeCurves = Array.from(menu.querySelectorAll("input:checked")).map(
            (cb) => cb.closest("a").dataset.title
          );
          this.grapher.updateChart(activeCurves);
        });

        // Event listener for the list item click
        a.addEventListener("click", (e) => {
          if (e.target.type !== 'checkbox') {
            e.preventDefault();
          }
          
          // Remove 'is-active' from all other items
          menu.querySelectorAll("a").forEach(item => item.classList.remove("is-active"));
          // Add 'is-active' to the clicked item
          a.classList.add("is-active");

          // Populate and show the details panel
          populateCurveDetails(curve);
          panel.classList.remove("is-hidden");
        });
      });

      // Select the first curve by default if available
      const firstCurveAnchor = menu.querySelector("a");
      if (firstCurveAnchor) {
        firstCurveAnchor.click();
      }
    }

    /**
     * Rmplit le panneau des détails d'une courbe sélectionnée.
     */
    const populateCurveDetails = (curve) => {
      const panel = $("#curve-details-panel");
      panel.setAttribute("data-active-curve", curve.title);

      // Set the color picker
      const colorPicker = $("#curveColorPicker");
      colorPicker.value = curve.color;
      colorPicker.style.color = curve.color;

      // Set the marker options
      const markerToggle = $("#curveMarkerToggle");
      markerToggle.checked = curve.markers;
      const markerUIs = panel.querySelectorAll(".curveMarkerUI");
      markerUIs.forEach(el => el.classList.toggle("is-hidden", !curve.markers));
      $("#curveMarkerRadiusSelect").value = curve.markerRadius;
      $("#curveMarkerSymbolSelect").value = curve.markerSymbol;

      // Set the line options
      const lineToggle = $("#curveLineToggle");
      lineToggle.checked = curve.line;
      const lineUIs = panel.querySelectorAll(".curveLineUI");
      lineUIs.forEach(el => el.classList.toggle("is-hidden", !curve.line));
      $("#curveLineWidthSelect").value = curve.lineWidth;
      $("#curveLineStyleSelect").value = curve.lineStyle;
    }

    /**
     * Remplit le menu déroulant des courbes X disponibles.
     */
    const populateCurveSelect = () => {
      $("#choose-x-curve-select").innerHTML = "";

      this.data.curves.forEach(element => {
        let option = document.createElement("option");
        option.innerHTML = element.title;

        // Select the current X curve
        if(element.title === this.grapher.currentXCurve){
          option.selected = true;
        }

        $("#choose-x-curve-select").appendChild(option);
      });
    }

    /**
     * Gère le changement de courbe X sélectionnée.
     */
    $("#choose-x-curve-select").addEventListener("change", () => {
      // Update the X curve in the grapher
      this.grapher.setXCurve($("#choose-x-curve-select").value, true);
      this.updateAllModelPanelVisibilityIcons();
    });

    /**
     * Remplit le menu déroulant des couleurs disponibles.
     */
    function populateColors(){
      const colors = Highcharts.getOptions().colors;
      const select = document.getElementById("curveColorPicker");

      // Create the options
      select.innerHTML = ""; // Clear previous options
      colors.forEach((color) => {
        const option = document.createElement('option');
        option.value = color;
        option.style.color = color;
        option.textContent = "■■■■■■■■■"; // On peut aussi mettre un code couleur ici
        select.appendChild(option);
      });
    }

    /**
     * Remplit le menu déroulant des épaisseurs de ligne disponibles.
     */
    function populateLineWidthSelect(){
      const select = document.getElementById("curveLineWidthSelect");
      select.innerHTML = ""; // Clear previous options
      for(let i = 1; i <= 10; i++){
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        select.appendChild(option);
      }
    }

    /**
     * Remplit le menu déroulant tailles des symboles de marqueurs disponibles.
     */
    function populateMarkersRadiusSelect(){
      const select = document.getElementById("curveMarkerRadiusSelect");
      select.innerHTML = ""; // Clear previous options
      for(let i = 1; i <= 15; i++){
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        select.appendChild(option);
      }
    }

    $("#choose-curves-confirm-button").addEventListener("click", () => {
      this.common.modalManager.closeAllModals();
    });

    /**
     * Gère les changements dans les options de la courbe (couleur, marqueurs, ligne, etc.)
     * et met à jour la courbe en conséquence.
     */
    $("#choose-curves-modal").addEventListener('change', (e) => {
      const panel = $("#curve-details-panel");
      const activeCurveTitle = panel.getAttribute("data-active-curve");
      
      const curve = this.data.getCurveByTitle(activeCurveTitle);
      if (!curve) {
        console.error("Impossible de trouver la courbe :", activeCurveTitle);
        return;
      }
    
      const targetId = e.target.id;
      const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    
      switch(targetId) {
        case 'curveColorPicker':
          curve.color = value;
          e.target.style.color = value;
          break;
        case 'curveMarkerToggle':
          curve.markers = value;
          panel.querySelectorAll(".curveMarkerUI").forEach(el => el.classList.toggle("is-hidden", !value));
          break;
        case 'curveMarkerRadiusSelect':
          curve.markerRadius = parseInt(value, 10);
          break;
        case 'curveMarkerSymbolSelect':
          curve.markerSymbol = value;
          break;
        case 'curveLineToggle':
          curve.line = value;
          panel.querySelectorAll(".curveLineUI").forEach(el => el.classList.toggle("is-hidden", !value));
          break;
        case 'curveLineWidthSelect':
          curve.lineWidth = parseInt(value, 10);
          break;
        case 'curveLineStyleSelect':
          curve.lineStyle = value;
          break;
      }
      
      // Update the chart to reflect the changes
      const series = this.grapher.chart.series.find(s => s.name === activeCurveTitle);
      if (series) {
        series.update({
          color: curve.color,
          lineWidth: curve.line ? curve.lineWidth : 0,
          dashStyle: curve.lineStyle,
          marker: {
            enabled: curve.markers,
            symbol: curve.markerSymbol,
            radius: curve.markerRadius,
            lineWidth: (curve.markerSymbol === "cross" || curve.markerSymbol === "crossX") ? 1 : 0,
            lineColor: curve.color
          }
        });
      }
    
      // Update the color swatch in the list
      const activeAnchor = $(`#choose-curves-menu a[data-title="${activeCurveTitle}"]`);
      if (activeAnchor) {
        activeAnchor.querySelector('span:nth-child(2)').style.backgroundColor = curve.color;
      }
    });
  }

  /**
   * Initialise les outils du grapheur .
   */
  initTools(){
    const toolsDropdown = $("#tools-dropdown");
    const toolItems = document.querySelectorAll(".tool-item");
    let activeToolElement = null;

    /**
     * Gère la sélection et la désélection des outils.
     * @param {HTMLElement} clickedItem - L'élément de l'outil cliqué.
     * @returns {boolean|undefined} - Retourne true si un outil est activé, undefined si désactivé.
     */
    function setActiveTool(clickedItem) {
      const isDeselecting = activeToolElement === clickedItem;

      // On efface toutes les coches
      toolItems.forEach(item => {
        const checkmarkContainer = item.querySelector('.tool-checkmark-container');
        if (checkmarkContainer) checkmarkContainer.innerHTML = '';
      });

      if (isDeselecting) {
        activeToolElement = null;

        this.grapher.setCrosshairMode(null); // On passe 'null' pour tout désactiver
        
        return;
      }

      // Sinon, on active le nouvel outil
      activeToolElement = clickedItem;
      const checkmarkContainer = clickedItem.querySelector('.tool-checkmark-container');
      if (checkmarkContainer) {
        checkmarkContainer.innerHTML = '<i class="fa-solid fa-check"></i>';
        setTimeout(() => {
          window.FontAwesome.dom.i2svg({ node: toolsDropdown });
        }, 0);
        return true;
      }
    }

    // Ouvre et ferme le menu déroulant
    toolsDropdown.addEventListener("click", (event) => {
      event.stopPropagation();
      toolsDropdown.classList.toggle("is-active");
    });

    // Ferme le menu si on clique ailleurs
    document.addEventListener("click", () => {
      toolsDropdown.classList.remove("is-active");
    });

    // Ajoute un écouteur d'événement unique pour tous les outils
    toolItems.forEach(item => {
      item.addEventListener('click', () => {

        // On s'assure que le bouton zoom est bien désactivé
        $("#zoom-button").classList.remove("is-active");
        this.isZoomEnabled = false;

        const activated = setActiveTool(item);
        if (!activated) return; // on vient de désélectionner -> ne rien réactiver

        console.log(`Outil sélectionné : ${item.id}`);

        if (item.id === 'tool-crosshair-data') this.grapher.setCrosshairMode('data');
        else if (item.id === 'tool-crosshair-free') this.grapher.setCrosshairMode('free');
        else if (item.id === 'tool-crosshair-model') this.grapher.setCrosshairMode('model');
      });
    });

    /**
     * Met à jour la visibilité de l'outil modèle en fonction de la présence de modèles tracés.
     */
    function updateModelToolVisibility() {
      const btn = document.getElementById('tool-crosshair-model');

      // Vérifie s'il y a au moins une série de modèle visible avec des points
      const hasRenderedModel = this.grapher.chart.series.some(s =>
        s?.options?.id?.startsWith('model-') && s.visible !== false && (s.points?.length ?? 0) > 0
      );

      btn.classList.toggle('is-hidden', !hasRenderedModel);

      // Si l’outil était actif mais qu’il n’y a plus de modèle tracé, on le désactive proprement
      if (!hasRenderedModel && typeof activeToolElement !== 'undefined' && activeToolElement?.id === 'tool-crosshair-model') {
        const check = activeToolElement.querySelector('.tool-checkmark-container');
        if (check) check.innerHTML = '';
        activeToolElement = null;
        this.grapher.setCrosshairMode(null);
      }
    }

    // Met à jour la visibilité de l'outil modèle à chaque redessin du graphique
    if (this.grapher.chart) {
      Highcharts.addEvent(grapher.chart, 'redraw', updateModelToolVisibility);
      updateModelToolVisibility(); // première évaluation
    }
  }

  /**
   * Initialise les contrôles de zoom et gère les événements associés.
   */
  initZoomControls(){
    this.isZoomEnabled = false;

    /**
     * Efface l’outil actif et désactive tout réticule.
     */
    let clearActiveTool = () =>{
      // Enlève toutes les coches
      document.querySelectorAll('.tool-item .tool-checkmark-container')
        .forEach(c => c.innerHTML = '');

      // Réinitialise l’état
      if (typeof activeToolElement !== 'undefined') activeToolElement = null;

      // Coupe tout réticule (tooltip + croix)
      this.grapher.setCrosshairMode(null);
      this.grapher.chart.container.classList.remove('chart-free-crosshair');
    }

    /**
     * Gère l'activation et la désactivation du zoom.
     */
    $("#zoom-button").addEventListener("click", () => {
      if(!this.isZoomEnabled){
        // Désélectionne les outils avant d’activer le zoom
        clearActiveTool();

        $("#zoom-button").classList.add("is-active");
        this.grapher.chart.update({
          chart: {
            zooming: {
              type : "xy", // Enable zooming in both directions
              resetButton:{
                theme: {
                  style:{
                    display: "none" // Hide the default reset button
                  }
                }
              },
            }
          }
        });
        this.grapher.chart.container.classList.add('chart-free-crosshair');
        this.isZoomEnabled = true;
      } else {
        $("#zoom-button").classList.remove("is-active");
        this.grapher.chart.update({
          chart: { zooming: { type : null} }
        });
        this.grapher.chart.container.classList.remove('chart-free-crosshair');
        this.isZoomEnabled = false;
      }
    });

    /**
     * Gère la réinitialisation du zoom du graphique.
     */
    $("#auto-zoom-button").addEventListener("click", () => {
      // On désélectionne les outils avant de réinitialiser le zoom
      clearActiveTool();

      // 1. On réinitialise manuellement les axes à leur étendue maximale.
      //    Passer 'null' à setExtremes a pour effet de réinitialiser l'axe.
      this.grapher.chart.xAxis[0].setExtremes(null, null, false);
      this.grapher.chart.yAxis[0].setExtremes(null, null, false);
      this.grapher.chart.redraw(); // Un seul redessin pour la performance.

      // 2. On désactive le mode zoom s'il était actif.
      $("#zoom-button").classList.remove("is-active");
      this.grapher.chart.container.classList.remove('chart-free-crosshair');
      this.isZoomEnabled = false;
      this.grapher.chart.update({ chart: { zooming: { type: null } } });
      
      // 3. On cache le bouton de zoom auto, car on n'est plus en mode zoomé.
      $("#auto-zoom-button").classList.add("is-hidden");
    });

    /**
     * Gère le zoom avant
     */
    $("#zoom-in-button").addEventListener("click", () => {
      // On désélectionne les outils avant de zoomer
      clearActiveTool();

      this.grapher.zoom('in');
    });

    /**
     * Gère le zoom arrière
     */
    $("#zoom-out-button").addEventListener("click", () => {
      // On désélectionne les outils avant de dézoomer
      clearActiveTool();

      this.grapher.zoom('out');
    });

  }

  /**
   * Initialise les contrôles de modélisation et gère les événements associés.
   */
  initModelisationControls(){
    /**
     * Gère l'expansion et la compression du panneau de modélisation.
     */
    $("#expand-modelisation-button").addEventListener("click", () => {
      $("#modelisation-panel").classList.remove("is-hidden");

      $("#expand-modelisation-button").classList.add("is-hidden");
      $("#compress-modelisation-button").classList.remove("is-hidden");
    });
    $("#compress-modelisation-button").addEventListener("click", () => {
      $("#modelisation-panel").classList.add("is-hidden");

      $("#expand-modelisation-button").classList.remove("is-hidden");
      $("#compress-modelisation-button").classList.add("is-hidden");
    });

    // Gère les évènements des boutons dans les panel des modèles
    $('#model-list').addEventListener('click', (event) => {
      const modelArticle = event.target.closest('article.message');
      if (!modelArticle) return; // Clic en dehors d'un panneau

      const modelId = modelArticle.dataset.modelId;
      const model = this.data.models.find(m => m.id === modelId);

      // Clic sur le bouton "afficher/cacher"
      if (event.target.closest('.toggle-visibility-button')) {
        this.toggleModelVisibility(model);
        return;
      }

      // Clic sur le bouton "supprimer"
      if (event.target.closest('.delete-model-button')) {
        this.app.deleteModel(model.id);
        modelArticle.remove();
        return;
      }

      // Clic sur le bouton "éditer"
      if (event.target.closest('.edit-model-button')) {
        // Ouvrir la modale d'édition pour ce modèle
        this.openEditModelModal(model);
        return;
      }

      // Clic sur l'en-tête pour déplier/replier
      if (event.target.closest('.message-header')) {
        this.toggleModelPanel(modelArticle);
        return;
      }
    });

    this.initAddModelModal();
  }

  /**
   * Ouvre la modale d'édition pour un modèle donné.
   * @param {Object} model - Le modèle à éditer.
   */
  openEditModelModal(model){
    const editModelModal = $('#edit-model-modal');
    const colorPicker = $('#model-edit-color-picker');
    const lineWidthSelect = $('#model-edit-linewidth-select');
    const borneDebutInput = $('#model-edit-borne-debut-input');
    const borneFinInput = $('#model-edit-borne-fin-input');
    const borneToutCheckbox = $('#model-edit-borne-tout-checkbox');

    const xData = model.x;
    let minX = Infinity;
    let maxX = -Infinity;

    // On parcourt les données une seule fois pour trouver le min et le max
    for (let i = 0; i < xData.length; i++) {
      const val = xData[i];
      if (val !== null && isFinite(val)) {
        if (val < minX) {
          minX = val;
        }
        if (val > maxX) {
          maxX = val;
        }
      }
    }
    // Si aucune donnée valide n'a été trouvée, on met des valeurs par défaut
    if (minX === Infinity) minX = 0;
    if (maxX === -Infinity) maxX = 0;
    
    // Réinitialisation des menus déroulants et attribution des valeurs actuelles
    populateModelColors(colorPicker);
    colorPicker.value = model.color;
    colorPicker.style.color = model.color; // Met à jour la couleur du sélecteur
    populateModelLineWidthSelect(lineWidthSelect);
    lineWidthSelect.value = model.lineWidth;
    $('#model-edit-linestyle-select').value = model.lineStyle;

    const inputsDisabled = model.borne_debut === null && model.borne_fin === null;
    borneToutCheckbox.checked = inputsDisabled;
    borneDebutInput.disabled = inputsDisabled;
    borneFinInput.disabled = inputsDisabled;

    // On charge les valeurs actuelles des bornes dans les champs
    borneDebutInput.value = model.borne_debut !== null ? model.borne_debut : '';
    borneFinInput.value = model.borne_fin !== null ? model.borne_fin : '';

    // On met à jour les "placeholders" pour guider l'utilisateur
    borneDebutInput.placeholder = `Min: ${formatNumber(minX, 4)}`;
    borneFinInput.placeholder = `Max: ${formatNumber(maxX, 4)}`;

    // Déclaration de la variable parametersContainer ici pour qu'elle soit accessible
    const parametersContainer = $('#model-edit-parameters-container');
    parametersContainer.innerHTML = '';
    model.parameters.forEach(param => {
      const field = document.createElement('div');
      field.className = 'field is-horizontal';
      field.innerHTML = `
        <div class="field-label is-normal">
          <label class="label">Nom</label>
        </div>
        <div class="field-body">
          <div class="field">
            <div class="control">
              <input class="input" type="text" value="${param.name}" data-old-name="${param.name}" />
            </div>
          </div>
          <div class="field-label is-normal has-text-right">
            <label class="label">Valeur</label>
          </div>
          <div class="field">
            <div class="control">
              <input class="input" type="text" value="${formatNumber(param.value, this.data.settings.significantDigits)}" disabled />
            </div>
          </div>
        </div>
      `;
      parametersContainer.appendChild(field);
    });

    // GESTIONNAIRE D'ÉVÉNEMENT POUR LA CASE À COCHER
    borneToutCheckbox.onchange = () => {
      const disabled = borneToutCheckbox.checked;
      borneDebutInput.disabled = disabled;
      borneFinInput.disabled = disabled;
      // Si on coche "Tout", on vide les champs pour plus de clarté
      if (disabled) {
        borneDebutInput.value = '';
        borneFinInput.value = '';
      }
    };

    // Fonction générique pour corriger une borne
    const clampBorne = (inputElement, min, max) => {
      const valueStr = inputElement.value.trim().replace(',', '.');
      if (valueStr === '') return; // Ne rien faire si le champ est vide

      let value = parseFloat(valueStr);
      if (isNaN(value)) { // Si la saisie n'est pas un nombre
          inputElement.value = '';
          return;
      }

      // On s'assure que la valeur est dans l'intervalle [min, max]
      const clampedValue = Math.max(min, Math.min(value, max));
      if (clampedValue !== value) {
          inputElement.value = clampedValue;
      }
    };

    // Écouteur pour la borne de début
    borneDebutInput.onblur = () => {
      clampBorne(borneDebutInput, minX, maxX);
      // On s'assure que début <= fin
      const debut = parseFloat(borneDebutInput.value);
      const fin = parseFloat(borneFinInput.value);
      if (!isNaN(debut) && !isNaN(fin) && debut > fin) {
        borneFinInput.value = debut;
      }
    };

    // Écouteur pour la borne de fin
    borneFinInput.onblur = () => {
      clampBorne(borneFinInput, minX, maxX);
      // On s'assure que début <= fin
      const debut = parseFloat(borneDebutInput.value);
      const fin = parseFloat(borneFinInput.value);
      if (!isNaN(debut) && !isNaN(fin) && debut > fin) {
        borneDebutInput.value = fin;
      }
    };
    
    $('#model-edit-save-button').onclick = async () => {      
      model.color = colorPicker.value;
      model.lineWidth = lineWidthSelect.value;
      model.lineStyle = $('#model-edit-linestyle-select').value;
      
      let newBorneDebut = null;
      let newBorneFin = null;

      // Si la case "Tout" n'est PAS cochée, on lit les valeurs des champs
      if (!borneToutCheckbox.checked) {
        const newBorneDebutStr = borneDebutInput.value.trim();
        const newBorneFinStr = borneFinInput.value.trim();
        newBorneDebut = newBorneDebutStr === '' ? null : parseFloat(newBorneDebutStr.replace(',', '.'));
        newBorneFin = newBorneFinStr === '' ? null : parseFloat(newBorneFinStr.replace(',', '.'));
      }

      // Validation : s'il y a des bornes, on vérifie qu'il y a au moins 2 points dans l'intervalle
      const pointsDansIntervalle = model.x.filter(val => {
        if (val === null || !isFinite(val)) return false;
        const estApresDebut = (newBorneDebut === null) || (val >= newBorneDebut);
        const estAvantFin = (newBorneFin === null) || (val <= newBorneFin);
        return estApresDebut && estAvantFin;
      }).length;

      if (pointsDansIntervalle < 2) {
        alertModal({
          title: "Données insuffisantes",
          body: `L'intervalle de calcul sélectionné ne contient pas assez de points pour réaliser une modélisation.`,
          confirm: "OK"
        });
        return; // On arrête la sauvegarde
      }
      
      const boundsChanged = model.borne_debut !== newBorneDebut || model.borne_fin !== newBorneFin;

      model.borne_debut = newBorneDebut;
      model.borne_fin = newBorneFin;
      
      let namesHaveChanged = false;
      const allNewNames = new Set();
      let hasConflict = false;
      const newParamNames = {};
      
      parametersContainer.querySelectorAll('input[data-old-name]').forEach(input => {
        const oldName = input.dataset.oldName;
        const newName = input.value.trim();
        if(oldName !== newName) namesHaveChanged = true;
        if (!newName.match(/^[a-zA-Z][a-zA-Z0-9]*$/)) {
          alertModal({ title: "Nom de paramètre invalide", body: `Le nom "${newName}" doit commencer par une lettre et ne contenir que des lettres et des chiffres.`, confirm: "OK" });
          hasConflict = true;
          return;
        }
        if (allNewNames.has(newName)) {
          alertModal({ title: "Nom de paramètre en double", body: `Le nom "${newName}" est utilisé plusieurs fois.`, confirm: "OK" });
          hasConflict = true;
          return;
        }
        allNewNames.add(newName);
        newParamNames[oldName] = newName;
      });
      
      if(hasConflict) return;
      
      if (boundsChanged) {
          await model.fit();
      }

      if(namesHaveChanged){
        const updatedParams = {};
        model.parameters.forEach(param => {
          const oldName = param.name;
          const newName = newParamNames[oldName] || oldName;
          updatedParams[newName] = { value: param.value, unit: '', type: 'model' };
          if(oldName !== newName){
            delete this.data.parameters[oldName];
          }
        });
        
        model.parameters = Object.entries(updatedParams).map(([name, obj]) => ({ name, value: obj.value }));
        Object.assign(this.data.parameters, updatedParams);
      }
      
      const series = this.grapher.chart.get(`model-${model.id}`);
      if(series) {
        series.update({
          color: model.color,
          lineWidth: model.lineWidth,
          dashStyle: model.lineStyle,
        });
      }
      
      this.updateModelPanel(model);
      this.updateCalculationUI();
      this.grapher.updateModelVisibility();
      this.grapher.chart.redraw();
      
      editModelModal.classList.remove('is-active');
    };
    
    editModelModal.classList.add('is-active');

    // Remplit le sélecteur de couleurs avec les couleurs disponibles dans Highcharts
    function populateModelColors(selectElement){
      const colors = Highcharts.getOptions().colors;
      selectElement.innerHTML = "";
      colors.forEach((color) => {
        const option = document.createElement('option');
        option.value = color;
        option.style.color = color;
        option.textContent = "■■■■■■■■■";
        selectElement.appendChild(option);
      });
      selectElement.addEventListener('change', function () {
        this.style.color = this.value;
      });
    }

    // Remplit le sélecteur d'épaisseurs de ligne avec des valeurs de 1 à 10
    function populateModelLineWidthSelect(selectElement){
      selectElement.innerHTML = "";
      for(let i = 1; i <= 10; i++){
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        selectElement.appendChild(option);
      }
    }
  }

  /**
   * Bascule l'affichage d'un panneau de modèle.
   * @param {HTMLElement} modelArticle - L'élément article du modèle à basculer.
   */
  toggleModelPanel(article){        
    const body = article.querySelector('.message-body');
    const toggleUpIcon = header.querySelector('.toggle-up');
    const toggleDownIcon = header.querySelector('.toggle-down');
    const isActive = header.classList.toggle('is-active');
    body.classList.toggle('is-hidden', !isActive);

    header.style.borderRadius = isActive ? '6px 6px 0 0' : '6px';

    toggleUpIcon.classList.toggle('is-hidden', !isActive);
    toggleDownIcon.classList.toggle('is-hidden', isActive);
    
    window.FontAwesome.dom.i2svg({ node: header });
  }
  /**
   * Bascule la visibilité d'un modèle donné.
   * @param {Object} model - Le modèle dont la visibilité doit être basculée.
   */
  toggleModelVisibility(model){
    // Verification que l'abscisse est la bonne
    if (model.visible === false && model.x.title !== this.grapher.currentXCurve) {
      alertModal({
        type: "",
        title: "Affichage impossible",
        body: `Pour afficher ce modèle, vous devez sélectionner <strong>${model.x.title}</strong> comme grandeur en abscisse.`,
        confirm: "OK"
      });
      return; // Empêche le reste du code de s'exécuter
    }

    model.visible = !model.visible;
    // L'icône est mise à jour par la fonction updateAllModelPanelVisibilityIcons()
    this.updateAllModelPanelVisibilityIcons();
    // La visibilité de la série est gérée par grapher.updateModelVisibility()
    this.grapher.updateModelVisibility();
  }

  /**
   * Initialise la modale d'ajout de modèle et gère les événements associés.
   */
  initAddModelModal(){
    const addModelModal = $('#add-model-modal');
    const modelCurveSelect = $('#model-curve-select');
    const modelTypeContainer = $('#model-type-container');
    let selectedModelType = null;

    let openAddModelModal = () => {
      // Peuple le sélecteur de courbes
      modelCurveSelect.innerHTML = '';
      if (this.grapher.chart && this.grapher.currentXCurve) {
        this.grapher.chart.series.forEach(series => {
          // On ne modélise pas un modèle existant
          if (series.type !== 'spline' && !series.name.startsWith('Modèle')) {
            const option = document.createElement('option');
            option.value = series.name;
            option.textContent = `${series.name} = f(${this.grapher.currentXCurve})`;
            modelCurveSelect.appendChild(option);
          }
        });
      }
      
      // Réinitialise la sélection de tous les modèles
      addModelModal.querySelectorAll('.model-type-item').forEach(item => {
        item.classList.remove('is-active', 'has-background-primary-light');
      });
      selectedModelType = null;

      addModelModal.classList.add('is-active');
    }

    $('#add-model-button').addEventListener('click', openAddModelModal);

    /**
     * Gère la sélection d'un type de modèle dans la modale.
     */ 
    addModelModal.addEventListener('click', (e) => {
      const targetItem = e.target.closest('.model-type-item');
      if (targetItem) {
        // Enlève la classe active des autres éléments
        addModelModal.querySelectorAll('.model-type-item').forEach(item => {
          item.classList.remove('is-active', 'has-background-primary-light');
        });
        // Ajoute la classe active à l'élément cliqué
        targetItem.classList.add('is-active', 'has-background-primary-light');
        selectedModelType = targetItem.dataset.modelType;
      }
    });
    
    /**
     * Affichage des modèles supplémentaires
     */
    $("#show-more-models-button").addEventListener("click", () => {
      const moreModelsContainers = document.querySelectorAll(".more-models-container");

      moreModelsContainers.forEach(container => {
        container.classList.toggle("is-hidden");
      });

      // Met à jour le texte du bouton en se basant sur l'état du premier conteneur
      if (moreModelsContainers.length > 0 && moreModelsContainers[0].classList.contains("is-hidden")) {
        $("#show-more-models-button").textContent = "Afficher plus de modèles";
      } else {
        $("#show-more-models-button").textContent = "Masquer les modèles supplémentaires";
      }
    });

    /**
     * Gère le bouton de confirmation dans la modale d'ajout de modèle.
     */
    document.getElementById('add-model-confirm-button').addEventListener('click', async () => {
      const curveToModel = $('#model-curve-select').value;
      if (curveToModel && selectedModelType) {
        // Ferme tous les panneaux existants avant de créer le nouveau
        closeAllModelPanels(); 

        this.common.modalManager.closeAllModals();

        let model = await this.app.addModel(this.grapher.currentXCurve, curveToModel, selectedModelType);

        createModelPanel(model.id);
      } else {
        alert("Veuillez sélectionner une courbe et un type de modèle.");
      }
    });

    /**
     * Ferme tous les panneaux de modèle.
     */
    const closeAllModelPanels = () => {
      const panels = document.querySelectorAll('#model-list article');
      panels.forEach(panel => {
        const header = panel.querySelector('.message-header');
        const body = panel.querySelector('.message-body');
        const toggleUpIcon = header.querySelector('.toggle-up');
        const toggleDownIcon = header.querySelector('.toggle-down');
        
        header.classList.remove('is-active');
        body.classList.add('is-hidden');
        toggleUpIcon.classList.add('is-hidden');
        toggleDownIcon.classList.remove('is-hidden');

        header.style.borderRadius = '6px';
        
        window.FontAwesome.dom.i2svg({ node: header });
      });
    }

    /**
     * Crée et retourne un panneau de modèle pour un modèle donné.
     * @param {string} modelID - L'ID du modèle pour lequel créer le panneau.
     */
    const createModelPanel = (modelID) =>{
      const model = this.data.models.find(m => m.id === modelID);
      if(!model){
        return;
      }

      // Récupérer le conteneur et le template
      const modelListContainer = document.getElementById('model-list');
      const template = document.getElementById('template-model-panel');
      
      // Cloner le contenu du template. C'est un "DocumentFragment" léger.
      const panelClone = template.content.cloneNode(true);
      
      // Sélectionner les éléments DANS LE CLONE et les remplir avec les données du modèle
      const article = panelClone.querySelector('article');
      article.dataset.modelId = model.id;
      
      panelClone.querySelector('.model-title').textContent = `${model.y.title} = f(${model.x.title})`;
      panelClone.querySelector('.model-name').innerHTML = `<strong>${model.getModelName()}</strong>`;
      panelClone.querySelector('.model-equation').innerHTML = model.getEquationString();
      
      // Remplir la liste des paramètres
      const parametersList = panelClone.querySelector('.parameters-list');
      parametersList.innerHTML = ''; // Vider au cas où
      const significantDigits = this.data.settings.significantDigits;
      model.parameters.forEach(param => {
        const li = document.createElement('li');
        li.innerHTML = `${param.name} = ${formatNumber(param.value, significantDigits)}`;
        parametersList.appendChild(li);
      });
      
      // Remplir la liste de qualité
      const qualityList = panelClone.querySelector('.quality-list');
      qualityList.innerHTML = ''; // Vider au cas où
      const liRmse = document.createElement('li');
      liRmse.innerHTML = `Écart-type = ${model.rmse != null ? formatNumber(model.rmse, significantDigits) : 'Indéfini'}`;
      qualityList.appendChild(liRmse);
      
      const liRSquared = document.createElement('li');
      liRSquared.innerHTML = `Coeff. de corrélation = ${model.rSquared != null ? formatNumber(model.rSquared, 5) : 'Indéfini'}`;
      qualityList.appendChild(liRSquared);

      // Ajouter le panneau entièrement construit au DOM
      modelListContainer.appendChild(panelClone);
      
      // Mettre à jour les icônes FontAwesome (si vous l'utilisez)
      window.FontAwesome.dom.i2svg({ node: article });
    }

    // Le bouton "Recalculer tous les modèles"
    $("#recalculate-models-button").addEventListener("click", () => {
        this.app.recalculateAllModels();
    });
  }

  /**
   * Initialise les contrôles de calcul et gère les événements associés.
   */
  initCalculationControls(){

    // Initialisation de l'éditeur de code
    let initializeEditor = () => {
      this.editor.getWrapperElement().classList.add('textarea');
      this.editor.getWrapperElement().classList.add('p-0');

      // Met à jour l'affichage quand on change d'onglet
      $("#calculs-tab").addEventListener("click", () => {
        setTimeout(() => this.editor.refresh(), 1);
      });
    }

    /**
     * Insère du texte dans CodeMirror.
     * @param {string} textToInsert - Le texte à insérer.
     */
    const insertTextInEditor = (textToInsert) =>{
      let finalInsert = textToInsert;
      let cursorOffset = textToInsert.length;

      if (textToInsert.endsWith('()')) {
        finalInsert = textToInsert === 'diff()' ? 'diff(,)' : textToInsert.slice(0, -1);
        cursorOffset = finalInsert.indexOf(',') !== -1 ? finalInsert.indexOf(',') : finalInsert.length;
      }

      this.editor.replaceSelection(finalInsert);
      const cursor = this.editor.getCursor();
      this.editor.setCursor({ line: cursor.line, ch: cursor.ch - (finalInsert.length - cursorOffset) });
      this.editor.focus();
    }

    initializeEditor(); // Initialise l'éditeur
    this.updateCalculationUI(); // Met à jour l'UI une première fois

    $("#apply-calculation-button").addEventListener("click", () => {
      this.app.applyCalculation(this.editor.getValue());
    });

    // Écoute les clics sur la barre latérale (event delegation)
    $('#calculation-sidebar').addEventListener('click', (e) => {
      const link = e.target.closest('a');

      // Vérifie si un lien a été cliqué
      if (link) {
        e.preventDefault(); // Empêche le lien de naviguer
        const text = link.dataset.value;
        if (text) {
          insertTextInEditor(text);
        }
      }
    });


  }

  initBeforeUnload(){
    // --- Gestion de la fermeture de l'application ---
    this.isNavigationConfirmed = false; // Pour eviter la double demande de confirmation quand on change de page
    const localHosts = ['localhost', '127.0.0.1'];
    if (!localHosts.includes(window.location.hostname)) {
      window.addEventListener('beforeunload', (event) => {
        // Si la navigation a déjà été confirmée par notre code, on ne fait rien.
        if (this.isNavigationConfirmed) {
          return;
        }
        
        const hasUnsavedData = this.data.curves.length > 0 || this.editor.getValue().trim() !== '';

        if (hasUnsavedData) {
          event.preventDefault();
          event.returnValue = 'Êtes-vous sûr de vouloir quitter ? Vos données non sauvegardées seront perdues.';
          return 'Êtes-vous sûr de vouloir quitter ? Vos données non sauvegardées seront perdues.';
        }
      });
    }
  }
}