import { formatNumber } from '../../common/formatter.js';
import { alertModal, NavigationManager } from '../../common/common.js';
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

    this.initialSettings = {}; // Pour stocker les paramètres initiaux lors de l'ouverture de la modale des paramètres
  }

  setApp(app) {
    this.app = app;
  }

  initialize() {
    this.initNavbar();
    this.initFileModals();
    this.initEmptyState();
    this.initSettingsModal();
    this.initSaveModal();
    this.initSpreadsheetControls();
    this.initGrapherControls();
    this.initModelisationControls();
    this.initCalculationControls();

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
      liRmse.innerHTML = `Écart-type = ${model.rmse !== null ? formatNumber(model.rmse, significantDigits) : 'Indéfini'}`;
      ul2.appendChild(liRmse);
      
      // Ajout du R²
      const liRSquared = document.createElement('li');
      liRSquared.innerHTML = `Corrélation R² = ${model.rSquared !== null ? formatNumber(model.rSquared, 5) : 'Indéfini'}`;
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
   * Met à jour la visibilité du bouton de suppression des annotations 
   * en fonction de leur présence.
   */
  updateClearAnnotationsButtonVisibility() {
    const button = $("#clear-annotations-button");
    if (this.data.annotations.length > 0) {
      button.classList.remove('is-hidden');
    } else {
      button.classList.add('is-hidden');
    }
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

    if(isLoading){
      modalTitle.textContent = "Chargement en cours...";
      buttons.classList.add('is-hidden');
      spinner.classList.remove('is-hidden');
    } else{
      modalTitle.textContent = "Créer ou importer une session";
      buttons.classList.remove('is-hidden');
      spinner.classList.add('is-hidden');
    }
  }

  /**
   * Initialise la navbar avec les boutons et leurs événements.
   */
  initNavbar() {
    // Définit la condition pour vérifier la présence de données
    const hasUnsavedData = () => {
        // Vrai s'il y a au moins une courbe ou une annotation
        return this.data.curves.length > 0 || this.data.annotations.length > 0 || this.editor.getValue().trim() !== '';
    };
    const navManager = new NavigationManager(hasUnsavedData);

    navManager.addLink($('#navbar-home-button'), '../index.html');
    navManager.addLink($('#navbar-audio-button'), '../audio/index.html');
    navManager.addLink($('#navbar-tracker-button'), '../tracker/index.html');

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
   * Affiche la navigation par onglets et le panneau par défaut (Tableur).
   * Cette méthode est appelée lors de la création ou du chargement d'une session.
   */
  showTabsAndPanels() {
    const tabsContainer = document.querySelector('#nav-tabs').parentElement;
    const tableurPanel = document.getElementById('tableur-panel');
    const grapheurPanel = document.getElementById('grapheur-panel');
    const calculsPanel = document.getElementById('calculs-panel');
    const emptyStateContainer = document.getElementById('empty-state-container');

    // Masquer l'état vide
    emptyStateContainer.classList.add('is-hidden');

    // Afficher le conteneur des onglets
    tabsContainer.classList.remove('is-hidden');

    // Afficher le panneau "Tableur" et s'assurer que les autres sont cachés
    tableurPanel.classList.remove('is-hidden');
    grapheurPanel.classList.add('is-hidden');
    calculsPanel.classList.add('is-hidden');

    // S'assurer que l'onglet "Tableur" est bien celui qui est actif
    document.getElementById('tableur-tab').classList.add('is-active');
    document.getElementById('grapheur-tab').classList.remove('is-active');
    document.getElementById('calculs-tab').classList.remove('is-active');

    document.getElementById('tableur-tab').click();
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
        // Affiche le spinner de chargement
        this.setModalLoading(true);
        try {
          // On attend que le chargement soit terminé (succès ou échec)
          await this.app.ioManager.loadFile(file);
          // Si aucune erreur n'est levée, on ferme la modale et affiche l'ui
          this.showTabsAndPanels();
          this.common.modalManager.closeAllModals();
        } catch (error) {
          // Si une erreur est levée par ioManager, on affiche une alerte
          // et la modale reste ouverte.
          console.error("Échec du chargement du fichier:", error);
          alertModal({
            type: 'warning',
            title: 'Erreur de chargement',
            body: error.message,
            confirm: 'OK'
          });
        } finally {
          // Cache le spinner de chargement
          this.setModalLoading(false);
        }
      });
    });

    $("#file-input").addEventListener("click", () => {
      $("#file-input").value = null; // allow the onchange trigger even if the same file is selected twice
    });

    $("#new-file-button").addEventListener("click", () => {
      newDataConfirmation(() => {
        this.app.resetSession();
        this.editor.setValue('');
        this.showTabsAndPanels();
        this.common.modalManager.closeAllModals();
      });
    });

    $("#paste-button").addEventListener('click', () => {
      newDataConfirmation(async () => {
        // Affiche le spinner de chargement
        this.setModalLoading(true);
        try {
          const text = await navigator.clipboard.readText();
          // On attend que les données soient chargées et validées
          await this.app.ioManager.loadClipboard(text);
          // Si c'est un succès, on ferme la modale et on affiche l'ui
          this.showTabsAndPanels();
          this.common.modalManager.closeAllModals();
        } catch (error) {
          // Si le clipboard est vide, non autorisé, ou si les données sont invalides
          alertModal({
            type: 'warning',
            title: 'Erreur de collage',
            body: error.message,
            confirm: 'OK'
          });
        } finally {
          // Cache le spinner de chargement
          this.setModalLoading(false);
        }
      });
    });

    // Show the new file modal
    $("#new-file-open-modal-button").addEventListener("click", () => {
        $("#new-file-modal").classList.add('is-active');
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
      grapherGrid: this.grapher.grid,
      includeOriginOnAutoZoom: this.grapher.includeOriginOnAutoZoom,
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
    $('#graph-grid-switch').checked = settings.grapherGrid;
    $('#include-origin-switch').checked = settings.includeOriginOnAutoZoom;
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
      includeOriginOnAutoZoom: document.getElementById('include-origin-switch').checked,
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

      // Met à jour les panneaux des modèles et la barre latérale des calculs
      this.data.models.forEach(model => this.updateModelPanel(model));
      this.updateCalculationUI();
      // Redessine le graphique pour mettre à jour les annotations
      this.grapher.chart.redraw();
    }
    
    // Appliquer au grapheur
    if (this.grapher.grid !== settings.grapherGrid) {
      this.grapher.setGridVisibility(settings.grapherGrid);
    }

    if (this.grapher.includeOriginOnAutoZoom !== settings.includeOriginOnAutoZoom) {
      this.grapher.includeOriginOnAutoZoom = settings.includeOriginOnAutoZoom;
      // On déclenche un zoom auto pour que le changement soit visible immédiatement
      this.grapher.chart.xAxis[0].setExtremes(null, null);
      this.grapher.chart.yAxis[0].setExtremes(null, null);
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
    this.initEditHeaderModal();

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

      // Fonction pour nettoyer l'unité
      const processUnit = (element) => {
        let value = element.value.trim().replace(/\s+/g, ''); // Retire les espaces
        element.value = value; // Met à jour l'affichage
        return value;
      };

      const buildVarWithUnit = (sym, u) => u ? `${sym}_${u}` : sym;

      switch (selectedType) {
        case 'calc-curve': {
          symbol = calcCurveSymbolInput.value.trim();
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
          // --- VALIDATION CENTRALISÉE ---
          const validationResult = this.app.symbolValidator.validate(symbol);
          if (!validationResult.isValid) {
            alertModal({ title: 'Validation échouée', body: validationResult.message, confirm: 'OK' });
            return null;
          }

          formulaLine = `${buildVarWithUnit(symbol, unit)} = ${formula}`;
          return { type: 'formula', formulaLine };
        }
        
        case 'derivate-curve': {
          symbol = derivateCurveSymbolInput.value.trim();
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
          // --- VALIDATION CENTRALISÉE ---
          const validationResult = this.app.symbolValidator.validate(symbol);
          if (!validationResult.isValid) {
            alertModal({ title: 'Validation échouée', body: validationResult.message, confirm: 'OK' });
            return null;
          }
          
          // Construit la formule `diff`
          const formula = `diff(${numerator}, ${denominator})`;
          formulaLine = `${buildVarWithUnit(symbol, unit)} = ${formula}`;

          return { type: 'formula', formulaLine };
        }

        case 'parameter': {
          symbol = parameterSymbolInput.value.trim();
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
          // --- VALIDATION CENTRALISÉE ---
          const validationResult = this.app.symbolValidator.validate(symbol);
          if (!validationResult.isValid) {
            alertModal({ title: 'Validation échouée', body: validationResult.message, confirm: 'OK' });
            return null;
          }
          formulaLine = `${buildVarWithUnit(symbol, unit)} = ${value}`;
          return { type: 'formula', formulaLine };
        }
        
        case 'empty-curve': {
          symbol = emptyCurveSymbolInput.value.trim();
          unit = processUnit(emptyCurveUnitInput);
          if (!symbol) {
            alertModal({
              title: "Symbole manquant",
              body: "Veuillez entrer un symbole.",
              confirm: "OK"
            });
            return null;
          }
          // --- VALIDATION CENTRALISÉE ---
          const validationResult = this.app.symbolValidator.validate(symbol);
          if (!validationResult.isValid) {
            alertModal({ title: 'Validation échouée', body: validationResult.message, confirm: 'OK' });
            return null;
          }
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
        option.textContent = curve.unit ? `${curve.title} (${curve.unit})` : curve.title;
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
   * Initialise la modale d'édition de l'en-tête de courbe et gère les événements associés.
   */
  initEditHeaderModal() {
    const modal = $('#edit-header-modal');

    const symbolInput = document.getElementById('edit-header-symbol-input');
    const unitInput = document.getElementById('edit-header-unit-input');
    const saveButton = document.getElementById('edit-header-save-button');
    
    let currentCurveOriginalTitle = null;

    // Méthode pour ouvrir la modale avec les bonnes données
    this.openEditHeaderModal = (curve) => {
      currentCurveOriginalTitle = curve.title;
      symbolInput.value = curve.title;
      unitInput.value = curve.unit || '';
      modal.classList.add('is-active');
    };

    const closeModal = () => {
      modal.classList.remove('is-active');
      currentCurveOriginalTitle = null;
    };

    saveButton.addEventListener('click', () => {
      const newSymbol = symbolInput.value.trim();
      const newUnit = unitInput.value.trim();

      if (!newSymbol) {
        this.common.alertModal({
          title: 'Symbole manquant',
          body: 'Veuillez entrer un symbole.',
          confirm: 'OK'
        });
        return;
      }

      if (currentCurveOriginalTitle) {
        this.app.renameCurve(currentCurveOriginalTitle, newSymbol, newUnit);
      }
      
      closeModal();
    });

    // Ajout des écouteurs pour fermer la modale
    /*[cancelButton, closeButton, background].forEach(el => {
        if (el) el.addEventListener('click', closeModal);
    });*/
  }

  /**
   * Initialise les contrôles du grapheur et gère les événements associés.
   */
  initGrapherControls(){
    this.initTools();
    this.initChooseCurvesModal();
    this.initZoomControls();

    // Ajout de l'écouteur pour le bouton de suppression des annotations
    $("#clear-annotations-button").addEventListener("click", () => {
        this.grapher.clearAllAnnotations();
    });
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
        if (curve.unit) {
          span.innerHTML = `${curve.title} <span class="has-text-grey is-size-7">(${curve.unit})</span>`;
        } else {
          span.innerHTML = curve.title;
        }

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
    const toolsButtonText = $("#tools-button-text");

    /**
     * Gère la sélection et la désélection des outils.
     * @param {HTMLElement} clickedItem - L'élément de l'outil cliqué.
     * @returns {boolean|undefined} - Retourne true si un outil est activé, undefined si désactivé.
     */
    const setActiveTool = (clickedItem) => {
      const isDeselecting = this.activeToolElement === clickedItem;

      // On efface toutes les coches
      toolItems.forEach(item => {
        const checkmarkContainer = item.querySelector('.tool-checkmark-container');
        if (checkmarkContainer) checkmarkContainer.innerHTML = '';
      });

      if (isDeselecting) {
        this.activeToolElement = null;
        toolsButtonText.textContent = 'Outils'; // On remet le texte par défaut
        this.grapher.setCrosshairMode(null); // On passe 'null' pour tout désactiver
        
        return;
      }

      // Sinon, on active le nouvel outil
      this.activeToolElement = clickedItem;
      toolsButtonText.textContent = clickedItem.textContent.trim(); // On met à jour le texte du bouton
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
        else if (item.id === 'tool-tangent') this.grapher.setCrosshairMode('tangent');
      });
    });

    // Met à jour la visibilité de l'outil modèle à chaque redessin du graphique
    if (this.grapher.chart) {
      Highcharts.addEvent(this.grapher.chart, 'redraw', this.updateModelToolVisibility);
      this.updateModelToolVisibility(); // première évaluation
    }
  }

  /**
   * Met à jour la visibilité de l'outil modèle en fonction de la présence de modèles tracés.
   */
  updateModelToolVisibility() {
    const btn = document.getElementById('tool-crosshair-model');

    // Vérifie s'il y a au moins une série de modèle visible avec des points
    const hasRenderedModel = this.grapher.chart.series.some(s =>
      s?.options?.id?.startsWith('model-') && s.visible !== false && ((s.points?.length || s.data?.length) > 0)
    );

    btn.classList.toggle('is-hidden', !hasRenderedModel);

    // Si l’outil était actif mais qu’il n’y a plus de modèle tracé, on le désactive proprement
    if (!hasRenderedModel && typeof this.activeToolElement !== 'undefined' && this.activeToolElement?.id === 'tool-crosshair-model') {
      const check = activeToolElement.querySelector('.tool-checkmark-container');
      if (check) check.innerHTML = '';
      this.activeToolElement = null;
      this.grapher.setCrosshairMode(null);
    }
  }

  /**
   * Initialise les contrôles de zoom et gère les événements associés.
   */
  initZoomControls(){
    this.isZoomEnabled = false;

    /**
     * Gère l'activation et la désactivation du zoom.
     */
    $("#zoom-button").addEventListener("click", () => {
      if(!this.isZoomEnabled){
        // Désélectionne les outils avant d’activer le zoom
        this.clearActiveTool();

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
      this.grapher.resetZoom();
    });

    /**
     * Gère le zoom avant
     */
    $("#zoom-in-button").addEventListener("click", () => {
      // On désélectionne les outils avant de zoomer
      this.clearActiveTool();

      this.grapher.zoom('in');
    });

    /**
     * Gère le zoom arrière
     */
    $("#zoom-out-button").addEventListener("click", () => {
      // On désélectionne les outils avant de dézoomer
      this.clearActiveTool();

      this.grapher.zoom('out');
    });

  }

  /**
   * Met à jour l'état de l'interface lié au zoom (boutons, classes CSS).
   */
  resetZoomUI() {
    // Désélectionne tout outil actif (réticule, etc.)
    this.clearActiveTool();

    // Met à jour l'état du bouton de zoom et du curseur
    const zoomButton = document.getElementById('zoom-button');
    if (zoomButton) {
      zoomButton.classList.remove('is-active');
    }
    
    if (this.grapher.chart) {
      this.grapher.chart.container.classList.remove('chart-free-crosshair');
      this.grapher.chart.update({ chart: { zooming: { type: null } } });
    }

    this.isZoomEnabled = false;

    // Cache le bouton "Reset Zoom", car on est déjà en zoom auto
    const autoZoomButton = document.getElementById('auto-zoom-button');
    if (autoZoomButton) {
      autoZoomButton.classList.add('is-hidden');
    }
  }

  /**
   * Efface l’outil actif et désactive tout réticule.
   */
  clearActiveTool() {
    if (!this.activeToolElement) {
      return;
    }
    // Enlève toutes les coches
    document.querySelectorAll('.tool-item .tool-checkmark-container')
      .forEach(c => c.innerHTML = '');

    // Réinitialise le texte du bouton
    $("#tools-button-text").textContent = 'Outils';

    // Réinitialise l’état
    this.activeToolElement = null; 

    // Coupe tout réticule (tooltip + croix)
    this.grapher.setCrosshairMode(null);
    this.grapher.chart.container.classList.remove('chart-free-crosshair');
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

      // Clic sur le bouton "calculer"
      if (event.target.closest('.compute-model-button')) {
        this.openComputeModelModal(model);
        return;
      }

      // Clic sur l'en-tête pour déplier/replier
      if (event.target.closest('.message-header')) {
        this.toggleModelPanel(modelArticle);
        return;
      }
    });

    const recalculateButton = document.getElementById('recalculate-models-button');

    recalculateButton.addEventListener('click', async () => {
      // Désactive le bouton immédiatement et ajoute l'indicateur local
      recalculateButton.disabled = true;
      recalculateButton.classList.add('is-loading');

      // Affiche l'indicateur de chargement sur le graphique
      this.grapher.chart.showLoading('Recalcul des modèles en cours...');

      try {
        // Appelle la méthode principale pour lancer les calculs
        await this.app.recalculateAllModels();

        // Met à jour tous les panneaux de modèles après le succès
        this.data.models.forEach(model => this.updateModelPanel(model));
        
        // Met également à jour la section "Calcul" car les paramètres ont changé
        this.updateCalculationUI(); 
        
        // Redessine le graphique pour afficher les modèles mis à jour
        this.grapher.chart.redraw();
      } catch (error) {
        console.error("Erreur lors du recalcul des modèles :", error);
        alertModal({
            title: 'Erreur de Calcul',
            body: `Un ou plusieurs modèles n'ont pas pu être recalculés :<br><br><i>${error.message}</i>`,
            confirm: 'OK'
        });
      } finally {
        // Réactive le bouton et retire l'indicateur local
        recalculateButton.disabled = false;
        recalculateButton.classList.remove('is-loading');

        // Masque l'indicateur de chargement dans tous les cas
        this.grapher.chart.hideLoading();
      }
    });

    this.initAddModelModal();
  }

  /**
   * Ouvre la modale de calcul pour un modèle donné.
   * @param {Object} model - Le modèle à utiliser pour le calcul.
   */
  openComputeModelModal(model) {
    const xInput = $('#compute-model-x-input');
    const yOutput = $('#compute-model-y-output');

    // Peuple la modale avec les infos du modèle
    $('#compute-model-equation').innerHTML = model.getEquationString();
    $('#compute-model-x-label').textContent = model.x.unit ? `${model.x.title} (${model.x.unit})` : model.x.title;
    $('#compute-model-y-label').textContent = model.y.unit ? `${model.y.title} (${model.y.unit})` : model.y.title;

    // Réinitialise les champs
    xInput.value = '';
    yOutput.value = '';

    // Gère le calcul
    $('#compute-model-confirm-button').onclick = () => {
      const xValue = parseFloat(xInput.value);
      if (!isNaN(xValue)) {
        const yValue = model.calculate(xValue);
        yOutput.value = formatNumber(yValue, this.data.settings.significantDigits);
      } else {
        yOutput.value = 'Entrée invalide';
      }
    };
    
    $('#compute-model-modal').classList.add('is-active');
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

    // Gère l'activation/désactivation des champs de bornes
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

    const saveButton = $('#model-edit-save-button');
    const deleteButton = $('#model-edit-delete-button');

    // On s'assure de cloner le bouton pour nettoyer les anciens écouteurs d'événements
    const newSaveButton = saveButton.cloneNode(true);
    saveButton.parentNode.replaceChild(newSaveButton, saveButton);
    
    newSaveButton.onclick = async () => {      
      // 1. Ferme la modale immédiatement pour une sensation de réactivité
      this.common.modalManager.closeAllModals();

      // 2. Affiche l'indicateur de chargement global sur le graphique
      this.grapher.chart.showLoading('Mise à jour du modèle...');

      try {
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
        let hasConflict = false;
        const newParamNames = {}; // Fait correspondre les anciens noms aux nouveaux
        const inputs = parametersContainer.querySelectorAll('input[data-old-name]');

        // Collecte tous les nouveaux noms et vérifier les doublons internes
        const newNamesSet = new Set();
        for (const input of inputs) {
          const newName = input.value.trim();
          if (newNamesSet.has(newName)) {
            alertModal({
              title: 'Nom de paramètre en double',
              body: `Le nom "${newName}" est utilisé plusieurs fois dans ce modèle.`,
              confirm: 'OK'
            });
            return; // Arrête tout
          }
          newNamesSet.add(newName);
        }

        // Valide chaque nouveau nom avec le SymbolValidator
        // La liste d'ignorance contient les noms originaux des paramètres qu'on édite.
        const ignoreList = model.parameters.map(p => p.name);

        for (const input of inputs) {
          const oldName = input.dataset.oldName;
          const newName = input.value.trim();

          // On passe la liste des anciens noms pour permettre le renommage
          const validationResult = this.app.symbolValidator.validate(newName, { ignoreList });
          
          if (!validationResult.isValid) {
            alertModal({ title: 'Nom de paramètre invalide', body: validationResult.message, confirm: 'OK' });
            return; // Arrête tout
          }
          
          if (oldName !== newName) {
            namesHaveChanged = true;
          }
          newParamNames[oldName] = newName;
        }
        
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

      } catch (error) {
        console.error("Erreur lors de la mise à jour du modèle :", error);
        alertModal({
          title: 'Erreur de Calcul',
          body: `La mise à jour du modèle a échoué :<br><br><i>${error.message}</i>`,
          confirm: 'OK'
        });
      } finally {
        // 5. Masque l'indicateur de chargement, que l'opération ait réussi ou non
        this.grapher.chart.hideLoading();
      }
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
    const header = article.querySelector('.message-header');
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
    const modelCurveSelectContainer = $('#model-curve-select-container');
    const addModelConfirmButton = $('#add-model-confirm-button');
    const noCurveMessage = $('#no-curve-to-model-message');

    let selectedModelType = null;

    // Met à jour l'état du bouton de confirmation
    const updateConfirmButtonState = () => {
        const isCurveSelected = modelCurveSelect.value !== '';
        const isModelTypeSelected = selectedModelType !== null;
        addModelConfirmButton.disabled = !(isCurveSelected && isModelTypeSelected);
    };

    let openAddModelModal = () => {
      let availableCurvesCount = 0;
      // Peuple le sélecteur de courbes
      modelCurveSelect.innerHTML = '';
      if (this.grapher.currentXCurve) {
        this.grapher.chart.series.forEach(series => {
          if (series.visible && series.type !== 'spline' && !series.name.startsWith('Modèle')) {
            const option = document.createElement('option');
            option.value = series.name;
            option.textContent = `${series.name} = f(${this.grapher.currentXCurve})`;
            modelCurveSelect.appendChild(option);
            availableCurvesCount++;
          }
        });
      }

      // Vérifie s'il y a des courbes disponibles à modéliser
      if (availableCurvesCount === 0) {
        console.log("Aucune courbe disponible pour la modélisation.");
        // S'il n'y a aucune courbe, on affiche le message et on masque le sélecteur
        modelCurveSelect.classList.add('is-hidden');
        modelCurveSelectContainer.classList.add('is-hidden');
        noCurveMessage.classList.remove('is-hidden');
      } else {
        // S'il y a des courbes, on affiche le sélecteur et on masque le message
        modelCurveSelect.classList.remove('is-hidden');
        modelCurveSelectContainer.classList.remove('is-hidden');
        noCurveMessage.classList.add('is-hidden');
      }
      
      // Réinitialise la sélection de tous les modèles
      addModelModal.querySelectorAll('.model-type-item').forEach(item => {
        item.classList.remove('is-active', 'has-background-primary-light');
      });
      selectedModelType = null;

      // Met à jour l'état du bouton de confirmation
      updateConfirmButtonState();

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

        // Met à jour l'état du bouton de confirmation
        updateConfirmButtonState();
      }
    });

    /**
     * Gère la sélection d'une courbe dans la modale.
     */
    modelCurveSelect.addEventListener('change', () => {
      updateConfirmButtonState();
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
    addModelConfirmButton.addEventListener('click', async () => {
      const curveToModel = $('#model-curve-select').value;

      if (curveToModel && selectedModelType) {
        // On ferme la modale comme vous l'aviez prévu
        this.common.modalManager.closeAllModals();
        
        // On affiche l'indicateur de chargement SUR LE GRAPHIQUE
        this.grapher.chart.showLoading('Calcul du modèle en cours...');

        try {
          // On lance le calcul en arrière-plan
          const model = await this.app.addModel(this.grapher.currentXCurve, curveToModel, selectedModelType);
          
          // Une fois le calcul terminé, on crée le panneau UI correspondant
          this.createModelPanel(model.id);

        } catch (error) {
          console.error("Échec de la modélisation :", error);
          alertModal({
            title: 'Erreur de Modélisation',
            body: `Le calcul n'a pas pu aboutir :<br><br><i>${error.message}</i>`,
            confirm: 'OK'
          });
        } finally {
          // Dans tous les cas, on masque l'indicateur de chargement du graphique
          this.grapher.chart.hideLoading();
        }
      } else {
        alertModal({ title: 'Sélection manquante', body: 'Veuillez sélectionner une courbe et un type de modèle.', confirm: 'OK' });
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
  }

  /**
   * Crée et retourne un panneau de modèle pour un modèle donné.
   * @param {string} modelID - L'ID du modèle pour lequel créer le panneau.
   */
  createModelPanel(modelID){
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
    liRSquared.innerHTML = `Corrélation R² = ${model.rSquared != null ? formatNumber(model.rSquared, 5) : 'Indéfini'}`;
    qualityList.appendChild(liRSquared);

    // Ajouter le panneau entièrement construit au DOM
    modelListContainer.appendChild(panelClone);
    
    // Mettre à jour les icônes FontAwesome (si vous l'utilisez)
    window.FontAwesome.dom.i2svg({ node: article });
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
        setTimeout(() => {
          this.editor.refresh()
          this.editor.focus();
          this.app.editor.setCursor(this.app.editor.lineCount(), 0); // Place le curseur à la fin
        }, 1);
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
      const success = this.app.applyCalculation(this.editor.getValue());
      
      if (success) {
        const checkmark = $('#calculation-success-checkmark');
        // Ajoute l'icône FontAwesome
        checkmark.innerHTML = '<i class="fas fa-check-circle"></i>';
        // Convertit l'icône en SVG
        window.FontAwesome.dom.i2svg({ node: checkmark });

        // Lance l'animation
        checkmark.classList.add('show');

        // Retire la classe après l'animation pour pouvoir la relancer
        setTimeout(() => {
          checkmark.classList.remove('show');
          checkmark.innerHTML = ''; // Nettoie l'icône
        }, 2000); // 2000ms correspond à la durée de l'animation CSS
      }
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
}