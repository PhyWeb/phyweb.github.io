import { formatUnit } from '../../../common/formatter.js';

const $ = (selector) => document.querySelector(selector);

/**
 * Parse une saisie utilisateur de borne numérique (virgule ou point, notation scientifique).
 * Une chaîne vide correspond à une borne automatique (`null`).
 * @param {string} rawValue
 * @returns {{ empty: boolean, value: number|null, valid: boolean }}
 */
export function parseAxisBoundInput(rawValue) {
  const cleaned = String(rawValue ?? '').replace(/[\s\u00A0\u202F]+/g, '').replace(',', '.');
  if (cleaned === '') {
    return { empty: true, value: null, valid: true };
  }
  const num = Number(cleaned);
  if (Number.isFinite(num)) {
    return { empty: false, value: num, valid: true };
  }
  return { empty: false, value: null, valid: false };
}

/**
 * Formate une borne numérique pour pré-remplir les champs du popover sans bruit flottant.
 * @param {number} value
 * @returns {string}
 */
export function formatAxisBoundValue(value) {
  if (!Number.isFinite(value)) return '';
  const rounded = Number(value.toPrecision(8));
  return Object.is(rounded, -0) ? '0' : String(rounded);
}

export default class GrapherControlsUI {
  constructor(ui) {
    this.ui = ui;
  }

  /**
   * Met à jour la visibilité du bouton de suppression des annotations
   * en fonction de leur présence.
   */
  updateClearAnnotationsButtonVisibility() {
    const button = $("#clear-annotations-button");
    if (!button) return;
    const currentX = this.ui.grapher?.currentXCurve;
    const hasVisibleAnnotations = this.ui.data.annotations.some(
      ann => !ann.xCurve || !currentX || ann.xCurve === currentX
    );
    if (hasVisibleAnnotations) {
      button.classList.remove('is-hidden');
    } else {
      button.classList.add('is-hidden');
    }
  }

  /**
   * Met à jour le menu déroulant pour la sélection de l'abscisse.
   */
  updateXAxisSelector() {
    const select = $('#xaxis-select');
    if (!select) return;

    const selectedValue = this.ui.grapher.currentXCurve;
    select.innerHTML = ''; // Vide les options actuelles

    this.ui.data.curves.forEach(curve => {
      const option = document.createElement('option');
      option.value = curve.title;
      option.textContent = curve.title;
      select.appendChild(option);
    });

    // Restaure la sélection précédente si elle existe
    if (selectedValue) {
      select.value = selectedValue;
    }
  }

  /**
   * Initialise les contrôles du grapheur et gère les événements associés.
   */
  initGrapherControls() {
    this.ui.initTools();
    this.ui.initChooseCurvesModal();
    this.ui.initZoomControls();

    $("#clear-annotations-button").addEventListener("click", () => {
      this.ui.grapher.clearAllAnnotations();
    });

    const editBoundsBannerClose = $("#edit-bounds-banner-close");
    if (editBoundsBannerClose) {
      editBoundsBannerClose.addEventListener("click", () => {
        this.ui.clearActiveTool();
      });
    }

    const activeFittingModels = new Set();

    document.addEventListener('model-fit-start', (e) => {
      if (e.detail?.model) {
        activeFittingModels.add(e.detail.model);
      }
    });

    document.addEventListener('model-fit-end', (e) => {
      if (e.detail?.model) {
        activeFittingModels.delete(e.detail.model);
      } else {
        activeFittingModels.clear();
      }
    });

    document.addEventListener('click', (e) => {
      const stopBtn = e.target.closest('#dynamic-stop-btn');
      if (stopBtn && activeFittingModels.size > 0) {
        stopBtn.classList.add('is-loading');

        // Force l'arrêt de tous les modèles actifs
        const modelsToStop = Array.from(activeFittingModels);
        activeFittingModels.clear();

        modelsToStop.forEach(model => {
          model.stopFit();
          if (typeof this.ui.updateModelPanel === "function") {
            this.ui.updateModelPanel(model);
          }
        });

        // Redessine le graphe et masque le chargement manuellement au cas où
        if (this.ui.grapher) {
          if (typeof this.ui.grapher.updateModels === 'function') {
            this.ui.grapher.updateModels();
          } else {
            this.ui.grapher.redrawAllModels?.();
            this.ui.grapher.chart?.redraw?.();
          }
          this.ui.grapher.hideLoading();
        }
      }
    });
  }

  /**
   * Initialise le menu déroulant de sélection de l'abscisse.
   */
  initXAxisSelector() {
    const select = $('#xaxis-select');

    select.addEventListener('change', (e) => {
      e.target.blur();

      const newXAxis = e.target.value;
      // Appelle la méthode de grapher.js pour changer l'axe des x
      this.ui.grapher.setXCurve(newXAxis);

      // Met à jour les icônes "oeil" de tous les panneaux de modélisation
      this.ui.updateAllModelPanelVisibilityIcons();
    });
  }

  /**
   * Met à jour le style actif/inactif du bouton du menu Outils.
   * @param {boolean} isActive
   */
  setToolsButtonActive(isActive) {
    const toolsBtn = $("#tools-dropdown-button") || $("#tools-dropdown .dropdown-trigger button");
    if (!toolsBtn || !toolsBtn.classList) return;
    if (isActive) {
      toolsBtn.classList.add("is-info", "is-light");
    } else {
      toolsBtn.classList.remove("is-info", "is-light");
    }
  }

  /**
   * Met à jour le style actif/inactif du bouton Zoom rectangle.
   * @param {boolean} isActive
   */
  setZoomButtonActive(isActive) {
    const zoomBtn = $("#zoom-button") || document.getElementById('zoom-button');
    if (!zoomBtn || !zoomBtn.classList) return;
    if (isActive) {
      zoomBtn.classList.add("is-active", "is-info", "is-light");
      zoomBtn.classList.remove("is-white");
    } else {
      zoomBtn.classList.remove("is-active", "is-info", "is-light");
      zoomBtn.classList.add("is-white");
    }
    if (typeof zoomBtn.setAttribute === 'function') {
      zoomBtn.setAttribute('aria-pressed', String(Boolean(isActive)));
    }
  }

  /**
   * Initialise les outils du grapheur.
   */
  initTools() {
    const toolsDropdown = $("#tools-dropdown");
    const toolItems = document.querySelectorAll(".tool-item");
    const toolsButtonText = $("#tools-button-text");

    const setActiveTool = (clickedItem) => {
      const isDeselecting = this.ui.activeToolElement === clickedItem;

      // On efface toutes les coches
      toolItems.forEach(item => {
        const checkmarkContainer = item.querySelector('.tool-checkmark-container');
        if (checkmarkContainer) checkmarkContainer.innerHTML = '';
      });

      if (isDeselecting) {
        this.ui.activeToolElement = null;
        toolsButtonText.textContent = 'Outils';
        this.setToolsButtonActive(false);
        this.ui.grapher.setCrosshairMode(null);
        return;
      }

      // Sinon, on active le nouvel outil
      this.ui.activeToolElement = clickedItem;
      toolsButtonText.textContent = clickedItem.textContent.trim();
      this.setToolsButtonActive(true);
      const checkmarkContainer = clickedItem.querySelector('.tool-checkmark-container');
      if (checkmarkContainer) {
        checkmarkContainer.innerHTML = '<i class="fa-solid fa-check"></i>';
        return true;
      }
    };

    // Ouvre et ferme le menu déroulant
    const toolsTrigger = toolsDropdown.querySelector(".dropdown-trigger");
    if (toolsTrigger) {
      toolsTrigger.addEventListener("click", (event) => {
        event.stopPropagation();
        toolsDropdown.classList.toggle("is-active");
      });
    }

    // Ferme le menu si on clique ailleurs
    document.addEventListener("click", () => {
      toolsDropdown.classList.remove("is-active");
    });

    // Ajoute un écouteur d'événement unique pour tous les outils
    toolItems.forEach(item => {
      item.addEventListener('click', () => {
        // Désactivation du bouton de zoom
        this.setZoomButtonActive(false);
        this.ui.isZoomEnabled = false;

        const activated = setActiveTool(item);
        toolsDropdown.classList.remove("is-active");
        if (!activated) return;

        console.log(`Outil sélectionné : ${item.id}`);

        if (item.id === 'tool-crosshair-data') this.ui.grapher.setCrosshairMode('data');
        else if (item.id === 'tool-crosshair-free') this.ui.grapher.setCrosshairMode('free');
        else if (item.id === 'tool-crosshair-model') this.ui.grapher.setCrosshairMode('model');
        else if (item.id === 'tool-tangent') this.ui.grapher.setCrosshairMode('tangent');
        else if (item.id === 'tool-tangent-method') this.ui.grapher.setCrosshairMode('tangent-method');
      });
    });

    // Met à jour la visibilité de l'outil modèle à chaque redessin du graphique
    if (this.ui.grapher.chart) {
      Highcharts.addEvent(this.ui.grapher.chart, 'redraw', this.ui.updateModelToolVisibility);
      this.ui.updateModelToolVisibility();
    }
  }

  /**
   * Met à jour la visibilité de l'outil modèle en fonction de la présence de modèles tracés.
   */
  updateModelToolVisibility() {
    const btn = document.getElementById('tool-crosshair-model');

    // Vérifie s'il y a au moins une série de modèle visible avec des points
    const hasRenderedModel = this.ui.grapher?.chart?.series?.some(s =>
      s?.options?.id?.startsWith('model-') && s.visible !== false && ((s.points?.length || s.data?.length) > 0)
    ) || false;

    if (btn) {
      btn.classList.toggle('is-hidden', !hasRenderedModel);
    }

    // Désactivation de l'outil si aucun modèle tracé n'est présent
    if (!hasRenderedModel && typeof this.ui.activeToolElement !== 'undefined' && this.ui.activeToolElement?.id === 'tool-crosshair-model') {
      const check = this.ui.activeToolElement.querySelector('.tool-checkmark-container');
      if (check) check.innerHTML = '';
      const toolsButtonText = $("#tools-button-text");
      if (toolsButtonText) toolsButtonText.textContent = 'Outils';
      this.setToolsButtonActive(false);
      this.ui.activeToolElement = null;
      this.ui.grapher.setCrosshairMode(null);
    }
  }

  /**
   * Initialise les contrôles de zoom et gère les événements associés.
   */
  initZoomControls() {
    this.ui.isZoomEnabled = false;

    // Gère l'activation et la désactivation du zoom
    $("#zoom-button").addEventListener("click", () => {
      if (!this.ui.isZoomEnabled) {
        this.ui.clearActiveTool();

        this.setZoomButtonActive(true);
        this.ui.grapher.chart.update({
          chart: {
            zooming: {
              type: "xy",
              resetButton: {
                theme: {
                  style: {
                    display: "none"
                  }
                }
              },
            }
          }
        });
        this.ui.grapher.chart.container.classList.add('chart-free-crosshair');
        this.ui.isZoomEnabled = true;
      } else {
        this.setZoomButtonActive(false);
        this.ui.grapher.chart.update({
          chart: { zooming: { type: null } }
        });
        this.ui.grapher.chart.container.classList.remove('chart-free-crosshair');
        this.ui.isZoomEnabled = false;
      }
    });

    $("#auto-zoom-button").addEventListener("click", () => {
      this.ui.grapher.resetZoom();
    });

    $("#zoom-in-button").addEventListener("click", () => {
      this.ui.clearActiveTool();
      this.ui.grapher.zoom('in');
    });

    $("#zoom-out-button").addEventListener("click", () => {
      this.ui.clearActiveTool();
      this.ui.grapher.zoom('out');
    });

    const orthonormalBtn = $("#orthonormal-button");
    if (orthonormalBtn) {
      orthonormalBtn.addEventListener("click", () => {
        this.ui.grapher?.setOrthonormal?.(!this.ui.grapher.orthonormal);
      });
      this.ui.grapher?.updateOrthonormalButtonUI?.();
    }

    this.ui.initAxisBoundsPopover();
  }

  /**
   * Initialise le popover compact permettant de définir numériquement les bornes des axes X et Y.
   */
  initAxisBoundsPopover() {
    const dropdown = $('#axis-bounds-dropdown');
    const triggerBtn = $('#axis-bounds-button');
    const popover = $('#axis-bounds-popover');
    const form = $('#axis-bounds-form');
    const xLabel = $('#axis-bounds-x-label');
    const xMinInput = $('#axis-bounds-x-min');
    const xMaxInput = $('#axis-bounds-x-max');
    const yMinInput = $('#axis-bounds-y-min');
    const yMaxInput = $('#axis-bounds-y-max');
    const xAutoBtn = $('#axis-bounds-x-auto');
    const yAutoBtn = $('#axis-bounds-y-auto');
    const resetBtn = $('#axis-bounds-reset-btn');
    const errorEl = $('#axis-bounds-error');

    if (!dropdown || !triggerBtn || !form) return;

    const allInputs = [xMinInput, xMaxInput, yMinInput, yMaxInput].filter(Boolean);

    const clearValidationState = () => {
      allInputs.forEach(input => input.classList.remove('is-danger'));
      if (errorEl) {
        errorEl.textContent = '';
        errorEl.classList.add('is-hidden');
      }
    };

    const showValidationError = (message, invalidInputs = []) => {
      clearValidationState();
      invalidInputs.forEach(input => input?.classList.add('is-danger'));
      if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.remove('is-hidden');
      }
    };

    const populateBoundsInputs = () => {
      clearValidationState();

      if (xLabel) {
        const xTitle = this.ui.grapher?.currentXCurve;
        const xCurve = xTitle ? this.ui.data?.getCurveByTitle?.(xTitle) : null;
        if (xTitle) {
          const formattedXUnit = formatUnit(xCurve?.unit);
          xLabel.textContent = formattedXUnit ? `Abscisse : ${xTitle} (${formattedXUnit})` : `Abscisse : ${xTitle}`;
        } else {
          xLabel.textContent = 'Abscisse (X)';
        }
      }

      const xAxis = this.ui.grapher?.chart?.xAxis?.[0];
      const yAxis = this.ui.grapher?.chart?.yAxis?.[0];
      const xEx = xAxis?.getExtremes?.();
      const yEx = yAxis?.getExtremes?.();

      if (xMinInput) xMinInput.value = formatAxisBoundValue(xEx?.min);
      if (xMaxInput) xMaxInput.value = formatAxisBoundValue(xEx?.max);
      if (yMinInput) yMinInput.value = formatAxisBoundValue(yEx?.min);
      if (yMaxInput) yMaxInput.value = formatAxisBoundValue(yEx?.max);
    };

    const updatePopoverAlignment = () => {
      if (typeof window === 'undefined' || typeof triggerBtn.getBoundingClientRect !== 'function') return;
      const rect = triggerBtn.getBoundingClientRect();
      const estimatedWidth = 280;
      const overflowsRight = rect.left + estimatedWidth > window.innerWidth - 12;
      dropdown.classList.toggle('is-right', overflowsRight);
    };

    triggerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const willOpen = !dropdown.classList.contains('is-active');

      const toolsDropdown = $('#tools-dropdown');
      if (toolsDropdown) toolsDropdown.classList.remove('is-active');

      if (willOpen) {
        this.ui.clearActiveTool();
        populateBoundsInputs();
        updatePopoverAlignment();
        dropdown.classList.add('is-active');
        xMinInput?.focus?.();
        xMinInput?.select?.();
      } else {
        dropdown.classList.remove('is-active');
      }
    });

    if (popover) {
      popover.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }

    document.addEventListener('click', () => {
      dropdown.classList.remove('is-active');
    });

    if (xAutoBtn) {
      xAutoBtn.addEventListener('click', () => {
        if (xMinInput) xMinInput.value = '';
        if (xMaxInput) xMaxInput.value = '';
        clearValidationState();
      });
    }

    if (yAutoBtn) {
      yAutoBtn.addEventListener('click', () => {
        if (yMinInput) yMinInput.value = '';
        if (yMaxInput) yMaxInput.value = '';
        clearValidationState();
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.ui.grapher?.resetZoom();
        dropdown.classList.remove('is-active');
      });
    }

    allInputs.forEach(input => {
      input.addEventListener('input', () => {
        input.classList.remove('is-danger');
        if (errorEl) errorEl.classList.add('is-hidden');
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!this.ui.grapher?.chart) return;

      const xMinParsed = parseAxisBoundInput(xMinInput?.value);
      const xMaxParsed = parseAxisBoundInput(xMaxInput?.value);
      const yMinParsed = parseAxisBoundInput(yMinInput?.value);
      const yMaxParsed = parseAxisBoundInput(yMaxInput?.value);

      const invalidInputs = [];
      if (!xMinParsed.valid) invalidInputs.push(xMinInput);
      if (!xMaxParsed.valid) invalidInputs.push(xMaxInput);
      if (!yMinParsed.valid) invalidInputs.push(yMinInput);
      if (!yMaxParsed.valid) invalidInputs.push(yMaxInput);

      if (invalidInputs.length > 0) {
        showValidationError('Veuillez saisir des valeurs numériques valides.', invalidInputs);
        return;
      }

      if (!xMinParsed.empty && !xMaxParsed.empty && xMinParsed.value >= xMaxParsed.value) {
        showValidationError('En abscisse, la borne min doit être strictement inférieure à la borne max.', [xMinInput, xMaxInput]);
        return;
      }

      if (!yMinParsed.empty && !yMaxParsed.empty && yMinParsed.value >= yMaxParsed.value) {
        showValidationError('En ordonnée, la borne min doit être strictement inférieure à la borne max.', [yMinInput, yMaxInput]);
        return;
      }

      this.ui.grapher.setAxisBounds({
        xMin: xMinParsed.value,
        xMax: xMaxParsed.value,
        yMin: yMinParsed.value,
        yMax: yMaxParsed.value
      });

      dropdown.classList.remove('is-active');
    });
  }

  /**
   * Met à jour l'état de l'interface lié au zoom (boutons, classes CSS).
   */
  resetZoomUI() {
    this.ui.clearActiveTool();

    this.setZoomButtonActive(false);

    if (this.ui.grapher.chart) {
      this.ui.grapher.chart.container.classList.remove('chart-free-crosshair');
      this.ui.grapher.chart.update({ chart: { zooming: { type: null } } });
    }

    this.ui.isZoomEnabled = false;
  }

  /**
   * Efface l’outil actif et désactive tout réticule.
   */
  clearActiveTool() {
    document.querySelectorAll('.tool-item .tool-checkmark-container')
      .forEach(c => c.innerHTML = '');

    const toolsBtnText = $("#tools-button-text");
    if (toolsBtnText) toolsBtnText.textContent = 'Outils';
    this.setToolsButtonActive(false);

    this.ui.activeToolElement = null;

    document.querySelectorAll('.edit-bounds-button').forEach(btn => {
      btn.style.backgroundColor = '';
      btn.style.borderColor = '';
      btn.style.color = '';
      btn.classList.remove('is-info');
    });

    this.ui.grapher.setCrosshairMode(null);

    if (this.ui.grapher.chart && this.ui.grapher.chart.container) {
      this.ui.grapher.chart.container.classList.remove('chart-free-crosshair');
    }
  }
}
