import { formatNumber, formatUnit } from '../../../common/formatter.js';
import { showToast } from '../../../common/common.js';
import { getContrastingTextColor, populateColorSelect } from './colorPicker.js';

const $ = (selector) => document.querySelector(selector);

export default class ModelUI {
  constructor(ui) {
    this.ui = ui;
  }

  /**
   * Supprime le panneau latéral d'un modèle donné.
   * @param {string} modelId
   */
  removeModelPanel(modelId) {
    if (typeof document === 'undefined') return;
    const modelPanel = document.querySelector(`article[data-model-id="${modelId}"]`);
    if (modelPanel) {
      modelPanel.remove();
    }
  }

  /**
   * Vide l'ensemble des panneaux de modèles du panneau latéral.
   */
  clearModelPanels() {
    if (typeof document === 'undefined') return;
    const modelList = $('#model-list');
    if (modelList) {
      modelList.innerHTML = '';
    }
  }

  /**
   * Met à jour la visibilité du bouton de recalcul des modèles en fonction de la présence de modèles.
   */
  updateRecalculateButtonVisibility() {
    if (this.ui.data.models.length > 0) {
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
    if (!model) return;
    const panel = $(`#model-list article[data-model-id="${model.id}"]`);
    if (!panel) return;

    const significantDigits = this.ui.data?.settings?.significantDigits ?? 4;

    // Mise à jour des couleurs et du style du panneau
    const header = panel.querySelector('.message-header');
    if (header) {
      header.style.backgroundColor = model.color;
      header.style.color = getContrastingTextColor(model.color);
    }
    panel.style.border = `1px solid ${model.color}`;

    const modelTitleText = `${model.y.title} = f(${model.x.title})`;
    const titleEl = panel.querySelector('.message-header p');
    if (titleEl) {
      titleEl.textContent = modelTitleText;
      titleEl.title = modelTitleText;
    }
    panel.querySelector('.message-body p:nth-of-type(2)').innerHTML = model.getEquationString();
    const ul = panel.querySelector('ul');
    ul.innerHTML = '';

    model.parameters.forEach(param => {
      const li = document.createElement('li');
      const displayValue = formatNumber(param.value, significantDigits, { html: true });
      const unit = formatUnit(param.unit || this.ui.data?.parameters?.[param.name]?.unit || '');
      const unitText = unit ? ` ${unit}` : '';
      li.innerHTML = `${param.name} = ${displayValue}${unitText}`;
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
      liRmse.innerHTML = `Écart-type = ${model.rmse !== null ? formatNumber(model.rmse, significantDigits, { html: true }) : 'Indéfini'}`;
      ul2.appendChild(liRmse);

      // Ajout du R²
      const liRSquared = document.createElement('li');
      liRSquared.innerHTML = `Corrélation R² = ${model.rSquared !== null ? formatNumber(model.rSquared, 5, { html: true }) : 'Indéfini'}`;
      ul2.appendChild(liRSquared);
    }
  }

  activateEditBoundsMode(modelId) {
    const model = this.ui.data.models.find(m => m.id == modelId);
    if (!model) return;

    this.ui.grapher.setCrosshairMode('edit-bounds');
    this.ui.grapher.editingModel = model;
    this.ui.grapher.drawModelBounds(model);

    // (Optionnel) Désélectionner le bouton précédent si besoin
    this.ui.clearActiveTool();
  }

  /**
   * Met à jour les icônes de visibilité de tous les panneaux de modèle en fonction de l'état actuel des modèles.
   */
  updateAllModelPanelVisibilityIcons() {
    this.ui.data.models.forEach(model => {
      const panel = $(`#model-list article[data-model-id="${model.id}"]`);
      if (panel) {
        const visibleButton = panel.querySelector('.fa-eye, .fa-eye-slash').closest('button');
        const isVisible = model.x.title === this.ui.grapher.currentXCurve && model.visible;
        visibleButton.innerHTML = `<span class="icon"><i class="fas fa-${isVisible ? 'eye' : 'eye-slash'}"></i></span>`;
      }
    });
  }

  /**
   * Initialise les contrôles de modélisation et gère les événements associés.
   */
  initModelisationControls() {
    /**
     * Gère l'expansion et la compression du panneau de modélisation.
     */
    const panel = $("#modelisation-panel");
    const expandBtn = $("#expand-modelisation-button");
    const compressBtn = $("#compress-modelisation-button");

    // Affichage du panneau en état replié
    panel.classList.remove("is-hidden");

    // Ouverture du panneau
    expandBtn.addEventListener("click", () => {
      panel.classList.add("is-open");
      expandBtn.classList.add("is-transparent");

      // Masquage du bouton après la transition CSS (300 ms)
      setTimeout(() => {
        expandBtn.classList.add("is-hidden");
      }, 300);
    });

    // Fermeture du panneau
    compressBtn.addEventListener("click", () => {
      panel.classList.remove("is-open");
      expandBtn.classList.remove("is-hidden");

      // Force le recalcul du style pour déclencher la transition d'opacité
      void expandBtn.offsetWidth;

      // Transition d'opacité
      expandBtn.classList.remove("is-transparent");
    });

    // Gère les évènements des boutons dans les panels des modèles
    $('#model-list').addEventListener('click', (event) => {
      const modelArticle = event.target.closest('article.message');
      if (!modelArticle) return; // Clic en dehors d'un panneau

      const modelId = modelArticle.dataset.modelId;
      const model = this.ui.data.models.find(m => m.id === modelId);
      if (!model) return;

      // Clic sur le bouton "éditer bornes"
      const editBoundsBtn = event.target.closest('.edit-bounds-button');
      if (editBoundsBtn) {
        const grapher = this.ui.grapher;

        // Si le mode est déjà actif pour ce modèle, on le désactive
        if (grapher.crosshairMode === 'edit-bounds' && grapher.editingModel?.id === model.id) {
          grapher.setCrosshairMode(null);
          // On retire les styles personnalisés pour revenir au bouton gris par défaut
          editBoundsBtn.style.backgroundColor = '';
          editBoundsBtn.style.borderColor = '';
          editBoundsBtn.style.color = '';
        }
        // Sinon, on l'active
        else {
          // 1. Nettoyer visuellement tous les autres boutons 'bornes' des autres modèles
          document.querySelectorAll('.edit-bounds-button').forEach(btn => {
            btn.style.backgroundColor = '';
            btn.style.borderColor = '';
            btn.style.color = '';
            btn.classList.remove('is-info'); // Suppression de la classe active précédente
          });

          // 2. Nettoyer les autres outils (tangente, etc.) s'ils sont actifs
          if (typeof this.ui.clearActiveTool === 'function') this.ui.clearActiveTool();

          // 3. Activer le mode dans le module graphique
          grapher.setCrosshairMode('edit-bounds');
          grapher.editingModel = model;
          grapher.drawModelBounds(model);

          // 4. Mettre en surbrillance le bouton cliqué AVEC LA COULEUR DU MODÈLE
          editBoundsBtn.style.backgroundColor = model.color;
          editBoundsBtn.style.borderColor = model.color;
          editBoundsBtn.style.color = getContrastingTextColor(model.color);
        }
        return; // Interrompt le traitement de l'événement
      }

      // Clic sur le bouton "afficher/cacher"
      if (event.target.closest('.toggle-visibility-button')) {
        this.ui.toggleModelVisibility(model);
        return;
      }

      // Clic sur le bouton "supprimer"
      if (event.target.closest('.delete-model-button')) {
        this.ui.app.deleteModel(model.id);
        modelArticle.remove();
        return;
      }

      // Clic sur le bouton "éditer"
      if (event.target.closest('.edit-model-button')) {
        // Ouvrir la modale d'édition pour ce modèle
        this.ui.openEditModelModal(model);
        return;
      }

      // Clic sur le bouton "calculer"
      if (event.target.closest('.compute-model-button')) {
        this.ui.openComputeModelModal(model);
        return;
      }

      // Clic sur l'en-tête pour déplier/replier
      if (event.target.closest('.message-header')) {
        this.ui.toggleModelPanel(modelArticle);
        return;
      }
    });

    const recalculateButton = document.getElementById('recalculate-models-button');

    recalculateButton.addEventListener('click', async () => {
      // Désactive le bouton immédiatement et ajoute l'indicateur local
      recalculateButton.disabled = true;
      recalculateButton.classList.add('is-loading');

      // Affiche l'indicateur de chargement sur le graphique
      this.ui.grapher.showLoading('Recalcul des modèles en cours...', 500, true);

      try {
        // Appelle la méthode principale pour lancer les calculs
        const { successful, failed } = await this.ui.app.recalculateAllModels();

        // Met à jour les panneaux des modèles qui ont réussi
        successful.forEach(model => this.ui.updateModelPanel(model));

        if (successful.length > 0) {
          // Met également à jour la section "Calcul" car les paramètres ont changé
          this.ui.updateCalculationUI();

          // Redessine le graphique pour afficher les modèles mis à jour
          if (typeof this.ui.grapher?.updateModels === 'function') {
            this.ui.grapher.updateModels();
          } else {
            this.ui.grapher?.redrawAllModels?.();
            this.ui.grapher?.chart?.redraw?.();
          }
        }

        // Notification adaptée selon les résultats
        if (failed.length > 0) {
          const names = failed.map(f => {
            const modelName = typeof f.model.getModelName === 'function' ? f.model.getModelName() : f.model.type;
            const yName = (f.model.y && f.model.y.title) || '';
            return yName ? `${modelName} (${yName})` : modelName;
          }).join(', ');
          showToast(`Impossible de recalculer : ${names} (${failed[0].error?.message || 'données insuffisantes'}).`, 'is-warning');
        } else if (successful.length > 0) {
          showToast("Modèles recalculés avec succès.", "is-success", 2500);
        }
      } catch (error) {
        console.error("Erreur lors du recalcul des modèles :", error);
        showToast(`Erreur lors du recalcul des modèles : ${error.message}`, "is-danger");
      } finally {
        // Réactive le bouton et retire l'indicateur local
        recalculateButton.disabled = false;
        recalculateButton.classList.remove('is-loading');

        // Masque l'indicateur de chargement dans tous les cas
        this.ui.grapher.hideLoading();
      }
    });

    this.ui.initAddModelModal();
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
    const formattedXUnit = formatUnit(model.x.unit);
    const formattedYUnit = formatUnit(model.y.unit);
    const xLabelText = formattedXUnit ? `${model.x.title} (${formattedXUnit})` : model.x.title;
    const yLabelText = formattedYUnit ? `${model.y.title} (${formattedYUnit})` : model.y.title;
    const xLabelEl = $('#compute-model-x-label');
    const yLabelEl = $('#compute-model-y-label');
    if (xLabelEl) {
      xLabelEl.textContent = xLabelText;
      xLabelEl.title = xLabelText;
    }
    if (yLabelEl) {
      yLabelEl.textContent = yLabelText;
      yLabelEl.title = yLabelText;
    }

    // Réinitialise les champs
    xInput.value = '';
    yOutput.value = '';

    // Gère le calcul
    $('#compute-model-confirm-button').onclick = () => {
      const cleaned = (xInput.value || '').replace(/\s+/g, '').replace(',', '.');
      const xValue = cleaned !== '' ? Number(cleaned) : NaN;
      if (Number.isFinite(xValue)) {
        const yValue = model.calculate(xValue);
        yOutput.value = formatNumber(yValue, this.ui.data?.settings?.significantDigits ?? 4);
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
  openEditModelModal(model) {
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
    populateColorSelect(colorPicker);
    colorPicker.onchange = function () {
      this.style.color = this.value;
    };
    colorPicker.value = model.color;
    colorPicker.style.color = model.color; // Met à jour la couleur du sélecteur
    populateModelLineWidthSelect(lineWidthSelect);
    lineWidthSelect.value = model.lineWidth;
    $('#model-edit-linestyle-select').value = model.lineStyle;

    const inputsDisabled = model.minX === null && model.maxX === null;
    borneToutCheckbox.checked = inputsDisabled;
    borneDebutInput.disabled = inputsDisabled;
    borneFinInput.disabled = inputsDisabled;

    // On charge les valeurs actuelles des bornes dans les champs
    borneDebutInput.value = model.minX !== null ? model.minX : '';
    borneFinInput.value = model.maxX !== null ? model.maxX : '';

    // On met à jour les "placeholders" pour guider l'utilisateur
    borneDebutInput.placeholder = `Min: ${formatNumber(minX, 4)}`;
    borneFinInput.placeholder = `Max: ${formatNumber(maxX, 4)}`;

    // Déclaration de la variable parametersContainer ici pour qu'elle soit accessible
    const parametersContainer = $('#model-edit-parameters-container');
    parametersContainer.innerHTML = '';
    model.parameters.forEach(param => {
      const currentUnit = this.ui.data?.parameters?.[param.name]?.unit ?? param.unit ?? '';
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
          <div class="field-label is-normal has-text-right is-flex-grow-0" style="margin-right: 0.75rem;">
            <label class="label">Unité</label>
          </div>
          <div class="field">
            <div class="control">
              <input class="input" type="text" placeholder="Ex: m/s" value="${currentUnit}" data-unit-for="${param.name}" />
            </div>
          </div>
          <div class="field-label is-normal has-text-right is-flex-grow-0" style="margin-right: 0.75rem;">
            <label class="label">Valeur</label>
          </div>
          <div class="field">
            <div class="control">
              <input class="input" type="text" value="${formatNumber(param.value, this.ui.data?.settings?.significantDigits ?? 4)}" disabled />
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

      // Ajustement de la valeur dans l'intervalle [min, max]
      const clampedValue = Math.max(min, Math.min(value, max));
      if (clampedValue !== value) {
        inputElement.value = clampedValue;
      }
    };

    // Écouteur pour la borne de début
    borneDebutInput.onblur = () => {
      clampBorne(borneDebutInput, minX, maxX);
      // Ajustement de la borne de fin si nécessaire
      const debut = parseFloat(borneDebutInput.value);
      const fin = parseFloat(borneFinInput.value);
      if (!isNaN(debut) && !isNaN(fin) && debut > fin) {
        borneFinInput.value = debut;
      }
    };

    // Écouteur pour la borne de fin
    borneFinInput.onblur = () => {
      clampBorne(borneFinInput, minX, maxX);
      // Ajustement de la borne de début si nécessaire
      const debut = parseFloat(borneDebutInput.value);
      const fin = parseFloat(borneFinInput.value);
      if (!isNaN(debut) && !isNaN(fin) && debut > fin) {
        borneDebutInput.value = fin;
      }
    };

    const saveButton = $('#model-edit-save-button');

    // Clonage du bouton pour réinitialiser les écouteurs précédents
    const newSaveButton = saveButton.cloneNode(true);
    saveButton.parentNode.replaceChild(newSaveButton, saveButton);

    newSaveButton.onclick = async () => {
      const newColor = colorPicker.value;
      const newLineWidth = lineWidthSelect.value;
      const newLineStyle = $('#model-edit-linestyle-select').value;

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
        showToast("L'intervalle de calcul sélectionné ne contient pas assez de points pour réaliser une modélisation.", "is-warning");
        return; // On arrête la sauvegarde sans fermer la modale ni muter le modèle
      }

      const inputs = parametersContainer.querySelectorAll('input[data-old-name]');

      // Collecte tous les nouveaux noms et vérifie les doublons internes
      const newNamesSet = new Set();
      for (const input of inputs) {
        const newName = input.value.trim();
        if (newNamesSet.has(newName)) {
          showToast(`Le nom "${newName}" est utilisé plusieurs fois dans ce modèle.`, "is-warning");
          return; // Arrête la sauvegarde
        }
        newNamesSet.add(newName);
      }

      // Valide chaque nouveau nom avec le SymbolValidator
      const ignoreList = model.parameters.map(p => p.name);
      const newParamNames = {}; // Fait correspondre les anciens noms aux nouveaux
      const newParamUnits = {}; // Fait correspondre les anciens noms aux nouvelles unités

      for (const input of inputs) {
        const oldName = input.dataset.oldName;
        const newName = input.value.trim();

        // On passe la liste des anciens noms pour permettre le renommage
        const validationResult = this.ui.app.symbolValidator.validate(newName, { ignoreList });

        if (!validationResult.isValid) {
          showToast(validationResult.message, "is-danger");
          return; // Arrête la sauvegarde
        }

        newParamNames[oldName] = newName;

        let unitInput = null;
        if (typeof parametersContainer.querySelector === 'function') {
          unitInput = parametersContainer.querySelector(`input[data-unit-for="${oldName}"]`);
        }
        if (!unitInput && typeof parametersContainer.querySelectorAll === 'function') {
          const allUnitInputs = parametersContainer.querySelectorAll('input[data-unit-for]');
          for (const uInput of allUnitInputs) {
            if (uInput.dataset?.unitFor === oldName) {
              unitInput = uInput;
              break;
            }
          }
        }
        if (!unitInput && typeof input.closest === 'function') {
          unitInput = input.closest('.field.is-horizontal')?.querySelector?.('input[data-unit-for]');
        }

        if (unitInput) {
          newParamUnits[oldName] = unitInput.value.trim();
        } else {
          newParamUnits[oldName] = this.ui.data.parameters[oldName]?.unit ?? '';
        }
      }

      // 1. Toutes les validations ont réussi : fermer la modale
      this.ui.common.modalManager.closeAllModals();

      // 2. Affiche l'indicateur de chargement global sur le graphique
      this.ui.grapher.showLoading('Mise à jour du modèle...', 500, true);

      try {
        model.color = newColor;
        model.lineWidth = newLineWidth;
        model.lineStyle = newLineStyle;

        const boundsChanged = model.minX !== newBorneDebut || model.maxX !== newBorneFin;

        model.minX = newBorneDebut;
        model.maxX = newBorneFin;

        {
          const updatedParams = {};
          model.parameters.forEach(param => {
            const oldName = param.name;
            const newName = newParamNames[oldName] || oldName;
            if (oldName !== newName) {
              delete this.ui.data.parameters[oldName];
            }
            param.name = newName;
            const newUnit = newParamUnits[oldName] !== undefined
              ? newParamUnits[oldName]
              : (this.ui.data.parameters[oldName]?.unit || param.unit || '');
            if (newUnit) {
              param.unit = newUnit;
            } else {
              delete param.unit;
            }
            updatedParams[newName] = { value: param.value, unit: newUnit, type: 'model' };
          });

          Object.assign(this.ui.data.parameters, updatedParams);
        }

        if (boundsChanged) {
          await model.fit();
        }

        const series = this.ui.grapher.chart.get(`model-${model.id}`);
        if (series) {
          series.update({
            color: model.color,
            lineWidth: parseInt(model.lineWidth),
            dashStyle: model.lineStyle,
          },
          false // Ne pas redessiner immédiatement
          );
        }

        this.ui.updateModelPanel(model);
        this.ui.updateCalculationUI();
        this.ui.grapher.updateModelVisibility();
        if (typeof this.ui.grapher?.updateModels === 'function') {
          this.ui.grapher.updateModels();
        } else {
          this.ui.grapher?.redrawAllModels?.();
          this.ui.grapher?.chart?.redraw?.();
        }
      } catch (error) {
        console.error("Erreur lors de la mise à jour du modèle :", error);
        showToast(`La mise à jour du modèle a échoué : ${error.message}`, "is-warning");
      } finally {
        // Masque l'indicateur de chargement, que l'opération ait réussi ou non
        this.ui.grapher.hideLoading();
      }
    };

    editModelModal.classList.add('is-active');

    // Remplit le sélecteur d'épaisseurs de ligne avec des valeurs de 1 à 10
    function populateModelLineWidthSelect(selectElement) {
      selectElement.innerHTML = "";
      for (let i = 1; i <= 10; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        selectElement.appendChild(option);
      }
    }
  }

  /**
   * Bascule l'affichage d'un panneau de modèle.
   * @param {HTMLElement} article - L'élément article du modèle à basculer.
   */
  toggleModelPanel(article) {
    const body = article.querySelector('.message-body');
    const header = article.querySelector('.message-header');
    const toggleUpIcon = header.querySelector('.toggle-up');
    const toggleDownIcon = header.querySelector('.toggle-down');
    const isActive = header.classList.toggle('is-active');
    body.classList.toggle('is-hidden', !isActive);

    header.style.borderRadius = isActive ? '6px 6px 0 0' : '6px';

    toggleUpIcon.classList.toggle('is-hidden', !isActive);
    toggleDownIcon.classList.toggle('is-hidden', isActive);
  }

  /**
   * Bascule la visibilité d'un modèle donné.
   * @param {Object} model - Le modèle dont la visibilité doit être basculée.
   */
  toggleModelVisibility(model) {
    // Vérification que l'abscisse est la bonne
    if (model.visible === false && model.x.title !== this.ui.grapher.currentXCurve) {
      showToast(`Pour afficher ce modèle, vous devez sélectionner <strong>${model.x.title}</strong> comme grandeur en abscisse.`, "is-danger");
      return; // Empêche le reste du code de s'exécuter
    }

    model.visible = !model.visible;
    // L'icône est mise à jour par la fonction updateAllModelPanelVisibilityIcons()
    this.ui.updateAllModelPanelVisibilityIcons();
    // La visibilité de la série est gérée par grapher.updateModelVisibility()
    this.ui.grapher.updateModelVisibility();
    this.ui.updateModelToolVisibility();
  }

  /**
   * Initialise la modale d'ajout de modèle et gère les événements associés.
   */
  initAddModelModal() {
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
      if (this.ui.grapher.currentXCurve) {
        this.ui.grapher.chart.series.forEach(series => {
          if (series.visible && series.type !== 'spline' && !series.name.startsWith('Modèle')) {
            const option = document.createElement('option');
            option.value = series.name;
            option.textContent = `${series.name} = f(${this.ui.grapher.currentXCurve})`;
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
    };

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
        // Fermeture de la modale
        this.ui.common.modalManager.closeAllModals();

        // On affiche l'indicateur de chargement
        this.ui.grapher.showLoading('Calcul du modèle en cours...', 500, true);

        try {
          // On lance le calcul en arrière-plan
          const model = await this.ui.app.addModel(this.ui.grapher.currentXCurve, curveToModel, selectedModelType);

          // Une fois le calcul terminé, on crée le panneau UI correspondant
          this.ui.createModelPanel(model.id);
        } catch (error) {
          console.error("Échec de la modélisation :", error);
          showToast(`Le calcul n'a pas pu aboutir : ${error.message}`, "is-warning");
        } finally {
          // Dans tous les cas, on masque l'indicateur de chargement du graphique
          this.ui.grapher.hideLoading();
        }
      } else {
        showToast("Veuillez sélectionner une courbe et un type de modèle.", "is-warning");
      }
    });
  }

  /**
   * Crée et retourne un panneau de modèle pour un modèle donné.
   * @param {string} modelID - L'ID du modèle pour lequel créer le panneau.
   */
  createModelPanel(modelID) {
    const model = this.ui.data.models.find(m => m.id === modelID);
    if (!model) {
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

    // Appliquer la couleur du modèle à l'en-tête et à la bordure de l'article
    const header = article.querySelector('.message-header');
    if (header) {
      header.style.backgroundColor = model.color;
      header.style.color = getContrastingTextColor(model.color);
    }
    article.style.border = `1px solid ${model.color}`;

    const modelTitleText = `${model.y.title} = f(${model.x.title})`;
    const titleEl = panelClone.querySelector('.model-title');
    if (titleEl) {
      titleEl.textContent = modelTitleText;
      titleEl.title = modelTitleText;
    }
    panelClone.querySelector('.model-name').innerHTML = `<strong>${model.getModelName()}</strong>`;
    panelClone.querySelector('.model-equation').innerHTML = model.getEquationString();

    // Remplir la liste des paramètres
    const parametersList = panelClone.querySelector('.parameters-list');
    parametersList.innerHTML = ''; // Vider au cas où
    const significantDigits = this.ui.data?.settings?.significantDigits ?? 4;
    model.parameters.forEach(param => {
      const li = document.createElement('li');
      const unit = formatUnit(param.unit || this.ui.data?.parameters?.[param.name]?.unit || '');
      const unitText = unit ? ` ${unit}` : '';
      li.innerHTML = `${param.name} = ${formatNumber(param.value, significantDigits, { html: true })}${unitText}`;
      parametersList.appendChild(li);
    });

    // Remplir la liste de qualité
    const qualityList = panelClone.querySelector('.quality-list');
    qualityList.innerHTML = ''; // Vider au cas où
    const liRmse = document.createElement('li');
    liRmse.innerHTML = `Écart-type = ${model.rmse != null ? formatNumber(model.rmse, significantDigits, { html: true }) : 'Indéfini'}`;
    qualityList.appendChild(liRmse);

    const liRSquared = document.createElement('li');
    liRSquared.innerHTML = `Corrélation R² = ${model.rSquared != null ? formatNumber(model.rSquared, 5, { html: true }) : 'Indéfini'}`;
    qualityList.appendChild(liRSquared);

    // Ajouter le panneau entièrement construit au DOM
    modelListContainer.appendChild(panelClone);
  }
}
