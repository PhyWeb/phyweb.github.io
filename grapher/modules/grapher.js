import {
  ANIMATION_FLAG,
  ZERO_PLOT_LINE,
  installHighchartsPatches,
  buildChartOptions,
  buildSeriesMarkerOptions,
  attachChartInteractionListeners
} from './grapher/highchartsSetup.js';
import AnnotationsRenderer from './grapher/annotationsRenderer.js';
import ToolsController from './grapher/toolsController.js';

const $ = document.querySelector.bind(document);

installHighchartsPatches(Highcharts);

function lengthOfTheLongestTable(tables){
  // Recherche de la série la plus longue
  let size = 0;
  tables.forEach((table, i) => {
    if(table && table.length > size){
      size = table.length;
    }
  });
  return size;
}

/*----------------------------------------------------------------------------------------------
----------------------------------------------Grapher-------------------------------------------
----------------------------------------------------------------------------------------------*/
export default class Grapher {
  constructor(data, initialSettings) {
    this.data = data;
    this.chart;

    this.uiManager = null;

    this.grid = initialSettings.grapherGrid; // Visibilité de la grille principale
    this.minorGrid = initialSettings.minorGrid || false;
    this.highlightZeroAxes = initialSettings.highlightZeroAxes ?? true;
    this.disableScientificNotation = initialSettings.disableScientificNotation || false;
    this.includeOriginOnAutoZoom = initialSettings.includeOriginOnAutoZoom ?? true;
    this.hasUserZoom = false;

    this.currentXCurve = null;

    this.loadingTimeout = null; // Pour gérer le délai de chargement globalement

    // Pour le réticule libre manuel
    this.crosshairMode = null; // Mode par défaut
    this.freeCrosshair = null;   // Pour stocker les éléments du réticule

    this.suppressModelAutoUpdate = false; // Évite les mises à jour redondantes

    this.renderedAnnotations = []; 

    // Propriété pour gérer le clic intelligent
    this.mouseDownInfo = null;
    this.isDragging = false;      // Pour savoir si un glisser est en cours
    this.tempAnnotation = null; // Pour stocker les éléments temporaires
    this.snappedModelPoint = null;
    this.snappedDataPoint = null;

    this.editingModel = null;       // Modèle actuellement en cours d'édition
    this.draggingBound = null;      // 'min' ou 'max' selon la poignée attrapée
    this.previousModelBounds = null; // Sauvegarde des bornes avant glissement
    this.modelBoundsElements = null; // Stockage des éléments SVG (bande et poignées)

    this.annotationsRenderer = new AnnotationsRenderer(this);
    this.toolsController = new ToolsController(this);
  }

  _getAnnotationsRenderer() {
    if (!this.annotationsRenderer) this.annotationsRenderer = new AnnotationsRenderer(this);
    return this.annotationsRenderer;
  }

  _getToolsController() {
    if (!this.toolsController) this.toolsController = new ToolsController(this);
    return this.toolsController;
  }

  setUIManager(uiManager) {
    this.uiManager = uiManager;
  }

  formatData(xCurve, yCurve){
    let length = lengthOfTheLongestTable([xCurve, yCurve]);
    let data = [];
    const rowIndices = [];
    
    // Optimisation : on limite le nombre maximum de points envoyés au graphique
    const MAX_POINTS = 100000; 
    let step = length > MAX_POINTS ? Math.ceil(length / MAX_POINTS) : 1;

    for(let i = 0; i < length; i += step){
      if(xCurve && yCurve && xCurve[i] !== "" && yCurve[i] !== "" && xCurve[i] !== undefined && yCurve[i] !== undefined && xCurve[i] !== null && yCurve[i] !== null){
        let rawX = xCurve[i];
        let rawY = yCurve[i];
        let xVal = typeof rawX === 'number' ? rawX : (typeof rawX === 'string' ? Number(rawX.trim().replace(',', '.')) : Number(rawX));
        let yVal = typeof rawY === 'number' ? rawY : (typeof rawY === 'string' ? Number(rawY.trim().replace(',', '.')) : Number(rawY));
        if (Number.isFinite(xVal) && Number.isFinite(yVal)) {


          data.push([xVal, yVal]);
          rowIndices.push(i);
        }
      }
    }
    Object.defineProperty(data, 'rowIndices', {
      value: rowIndices,
      writable: true,
      configurable: true,
      enumerable: false
    });
    return data;
  }

  newChart() {
    // Lier les gestionnaires d'événements à l'instance de Grapher
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);

    this.chart = Highcharts.chart("chart", buildChartOptions(this));

    // Référence vers l'instance de Grapher pour le formatage des infobulles
    this.chart.options.customGrapherInstance = this;

    attachChartInteractionListeners(this);
  }

  reorderLegendByVisibility(redraw = true) {
    if (!this.chart) return;
    const series = this.chart.series.filter(s => s.options.showInLegend !== false);
    const visibleSeries = series.filter(s => s.visible);
    const hiddenSeries  = series.filter(s => !s.visible);
    const sorted = [...visibleSeries, ...hiddenSeries];
    sorted.forEach((s, idx) => {
      if (s.options.legendIndex !== idx) s.update({ legendIndex: idx }, false);
    });
    if (redraw) {
      this.chart.redraw();
    }
  }

setVisibilityFromList(titles) {
  const wanted = new Set(titles);
  this.chart.series
    .filter(s => !s.options.id?.startsWith('model-'))
    .forEach(s => {
      const should = wanted.has(s.name);
      if (s.visible !== should) s.setVisible(should, false);
    });
  this.reorderLegendByVisibility();
}

  setXCurve(title, redraw = true){
    this.currentXCurve = title;
    this.hasUserZoom = false;
    this.updateModelVisibility();
    this.uiManager?.updateClearAnnotationsButtonVisibility();

    if(redraw){
      //Met à jour les données sans redessiner
      this.updateChart(null, false);

      this.resetZoom(true); // Redessine après le reset zoom
    }
  }

  deleteCurve(title){
    const seriesToRemove = this.chart.series.find(e => e.name === title);
    if (seriesToRemove) {
        seriesToRemove.remove();
    }

    if (Array.isArray(this.data?.annotations)) {
      this.data.annotations = this.data.annotations.filter(
        ann => ann.xCurve !== title && !(ann.type === 'tangent-method' && ann.seriesName === title)
      );
    }

    if(this.currentXCurve === title){
      if(this.data.curves.length > 0){
        this.setXCurve(this.data.curves[0].title);
      } else{
        this.currentXCurve = null;
        this.hasUserZoom = false;
      }
    } else if (this.data.curves.length === 0) {
      this.hasUserZoom = false;
    }

    this.uiManager?.updateClearAnnotationsButtonVisibility();
  }

  deleteAllCurves() {
    while(this.chart.series.length > 0) {
      this.chart.series[0].remove(false); // false pour ne pas redessiner à chaque fois
    }
    this.chart.redraw(); // Un seul redessin à la fin
    this.currentXCurve = null;
    this.hasUserZoom = false;
  }

  /**
   * Affiche l'écran de chargement avec un délai pour éviter le clignotement
   */
showLoading(text = 'Chargement...', delay = 500, showStopButton = false) {
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
    }
    
    this.loadingTimeout = setTimeout(() => {
      let content = text;
      
      // Si on veut le bouton d'arrêt, on fabrique le HTML complet
      if (showStopButton) {
        content = `
          <div style="font-size: 1.3em; font-weight: bold; margin-bottom: 20px; color: #363636;">
            ${text}
          </div>
          <button id="dynamic-stop-btn" class="button is-danger is-rounded is-medium" 
                  style="pointer-events: auto; box-shadow: 0 4px 8px rgba(0,0,0,0.3); font-weight: bold; transition: transform 0.1s;"
                  onmouseenter="this.style.transform='scale(1.05)'" 
                  onmouseleave="this.style.transform='scale(1)'">
            <span class="icon"><i class="fas fa-stop"></i></span>
            <span>Arrêter le calcul</span>
          </button>
        `;
      }
      
      if (this.chart) {
        this.chart.showLoading(content);
        
        if (showStopButton) {
          setTimeout(() => {
            // Conversion de l'icône FontAwesome pour le bouton généré
            const btn = document.getElementById('dynamic-stop-btn');
            // Rend le fond bien opaque pour bloquer la vue en dessous
            const loadingContainer = this.chart.container.querySelector('.highcharts-loading');
            if (loadingContainer) {
              loadingContainer.style.opacity = '1'; 
              loadingContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.7)'; 
            }
          }, 10);
        }
      }
    }, delay);
  }

  /**
   * Masque l'écran de chargement et annule le minuteur s'il n'avait pas encore sonné
   */
  hideLoading() {
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
      this.loadingTimeout = null;
    }
    this.chart.hideLoading();
  }

updateChart(yCurveTitles, redraw = true) {
    if (!this.chart || !this.currentXCurve) return;

    // Déterminer les courbes à afficher (en excluant la courbe d'abscisse X)
    let curvesToShow;
    if (yCurveTitles) {
      curvesToShow = new Set(yCurveTitles.filter(t => t !== this.currentXCurve));
    } else {
      // Si aucun titre n'est fourni, on essaie de conserver l'état actuel (sans l'abscisse)
      const currentlyVisible = this.chart.series
        .filter(s => s.visible && !s.options.id?.startsWith('model-') && s.name !== this.currentXCurve)
        .map(s => s.name);
      
      if (currentlyVisible.length > 0) {
        curvesToShow = new Set(currentlyVisible);
      } else {
        // Cas initial : aucune courbe ordonnée n'est visible, on affiche la première ordonnée disponible
        const firstYCurve = this.data.curves.find(c => c.title !== this.currentXCurve);
        curvesToShow = firstYCurve ? new Set([firstYCurve.title]) : new Set();
      }
    }

    // 1. Ajouter toutes les courbes ordonnées si elles n'existent pas déjà
    this.data.curves.forEach(curve => {
      if (curve.title === this.currentXCurve) return;

      const seriesExists = this.chart.series.some(s => s.name === curve.title);
      if (!seriesExists) {
        const shouldBeVisible = curvesToShow.has(curve.title);
        const formatted = this.formatData(this.data.getCurveByTitle(this.currentXCurve), curve);
        this.chart.addSeries({
          name: curve.title,
          data: formatted,
          customRowIndices: formatted.rowIndices,
          color: curve.color,
          lineWidth: curve.line ? curve.lineWidth : 0,
          dashStyle: curve.lineStyle,
          marker: buildSeriesMarkerOptions(curve),
          unit: curve.unit,
          visible: shouldBeVisible, // Visibilité déterminée ici
          showInLegend: true
        }, false);
      }
    });

    // 2. Mettre à jour les données et la visibilité des séries existantes (en ignorant la courbe d'abscisse)
    this.chart.series.forEach(serie => {
      if (serie.options.id?.startsWith('model-') || serie.name === this.currentXCurve) return;
      
      const curveData = this.data.getCurveByTitle(serie.name);
      const xCurveData = this.data.getCurveByTitle(this.currentXCurve);

      if (curveData && xCurveData) {
        if (serie.userOptions) {
          serie.userOptions.unit = curveData.unit;
        }
        if (serie.options) {
          serie.options.unit = curveData.unit;
        }
        const formatted = this.formatData(xCurveData, curveData);
        serie.options.customRowIndices = formatted.rowIndices;
        serie.setData(formatted, false);

        const shouldBeVisible = curvesToShow.has(serie.name);
        if (serie.visible !== shouldBeVisible) {
          serie.setVisible(shouldBeVisible, false);
        }
      }
    });

    // 3. Supprimer les séries qui n'existent plus dans les données ou qui sont devenues la courbe d'abscisse X
    let i = this.chart.series.length;
    while (i--) {
      const serie = this.chart.series[i];
      if (!serie.options.id?.startsWith('model-')) {
        const curveExists = this.data.curves.some(c => c.title === serie.name);
        if (!curveExists || serie.name === this.currentXCurve) {
          serie.remove(false);
        }
      }
    }

    // Si l'utilisateur n'a pas effectué de zoom manuel, appliquer le zoom automatique (qui inclut l'origine si activé)
    if (!this.hasUserZoom && this.chart?.xAxis?.[0] && this.chart?.yAxis?.[0]) {
      this.chart.xAxis[0].setExtremes(null, null, false);
      this.chart.yAxis[0].setExtremes(null, null, false);
    }

    // 4. Réordonner la légende en fonction de la visibilité des séries
    this.reorderLegendByVisibility(redraw);
}

  setIncludeOriginOnAutoZoom(included) {
    this.includeOriginOnAutoZoom = included;
    if (this.chart) {
      this.resetZoom();
    }
  }

  setGridVisibility(visible) {
    this.grid = visible;
    if (this.chart) {
      this.chart.update({
        xAxis: {
          gridLineWidth: visible ? 1 : 0
        },
        yAxis: {
          gridLineWidth: visible ? 1 : 0
        }
      });
    }
  }

  _getZeroPlotLines() {
    return this.highlightZeroAxes ? [{ ...ZERO_PLOT_LINE }] : [];
  }

  setHighlightZeroAxes(enabled) {
    this.highlightZeroAxes = Boolean(enabled);
    if (this.chart) {
      this.chart.update({
        xAxis: {
          plotLines: this._getZeroPlotLines()
        },
        yAxis: {
          plotLines: this._getZeroPlotLines()
        }
      });
    }
  }

  setMinorGridVisibility(visible) {
    this.minorGrid = visible;
    if (this.chart) {
      this.chart.update({
        xAxis: {
          minorGridLineWidth: visible ? 1 : 0,
          minorTickInterval: visible ? 'auto' : null
        },
        yAxis: {
          minorGridLineWidth: visible ? 1 : 0,
          minorTickInterval: visible ? 'auto' : null
        }
      });
    }
  }

setDisableScientificNotation(disabled) {
    this.disableScientificNotation = disabled;
    if (this.chart) {
      // Force l'exécution de l'événement pour recalculer les exposants
      Highcharts.fireEvent(this.chart.xAxis[0], 'afterSetExtremes');
      Highcharts.fireEvent(this.chart.yAxis[0], 'afterSetExtremes');
      
      // Indique à Highcharts que les axes ont été modifiés 
      this.chart.xAxis[0].isDirty = true;
      this.chart.yAxis[0].isDirty = true;
      
      this.chart.redraw();
    }
  }

  setCrosshairMode(mode) {
    return this._getToolsController().setCrosshairMode(mode);
  }

  drawFreeCrosshair(event) {
    return this._getToolsController().drawFreeCrosshair(event);
  }

  hideFreeCrosshair() {
    return this._getToolsController().hideFreeCrosshair();
  }

  drawModelCrosshair(event) {
    return this._getToolsController().drawModelCrosshair(event);
  }

  drawModelBounds(model) {
    return this._getToolsController().drawModelBounds(model);
  }

  updateModelBoundsVisuals() {
    return this._getToolsController().updateModelBoundsVisuals();
  }

  hideModelBounds() {
    return this._getToolsController().hideModelBounds();
  }

  _getSafeBound(val1, val2, val3, fallback) {
    return this._getToolsController()._getSafeBound(val1, val2, val3, fallback);
  }

  /**
   * Zooms in or out on all axes.
   * @param {('in'|'out')} direction - The direction to zoom.
   */
  zoom(direction) {
    const factor = direction === 'in' ? 0.8 : 1.25;

    const extremeX = this.chart.xAxis[0].getExtremes();
    const extremeY = this.chart.yAxis[0].getExtremes();

    const rangeX = extremeX.max - extremeX.min;
    const rangeY = extremeY.max - extremeY.min;

    const newRangeX = rangeX * factor;
    const newRangeY = rangeY * factor;

    const centerX = (extremeX.max + extremeX.min) / 2;
    const centerY = (extremeY.max + extremeY.min) / 2;
    
    const newMinX = centerX - newRangeX / 2;
    const newMaxX = centerX + newRangeX / 2;
    const newMinY = centerY - newRangeY / 2;
    const newMaxY = centerY + newRangeY / 2;

    this.hasUserZoom = true;

    // Appliquer les nouvelles limites sans redessiner immédiatement
    this.chart.xAxis[0].setExtremes(newMinX, newMaxX, false);
    this.chart.yAxis[0].setExtremes(newMinY, newMaxY, false);
    
    // Déclencher un unique redraw qui mettra à jour à la fois les modèles et les annotations
    this.chart.redraw();

    // Afficher le bouton de "reset zoom"
    this.updateAutoZoomButtonVisibility();
  }

  /**
   * Synchronise la visibilité du bouton Zoom auto avec l'état `hasUserZoom`.
   */
  updateAutoZoomButtonVisibility() {
    const autoZoomBtn = $("#auto-zoom-button");
    if (autoZoomBtn) {
      autoZoomBtn.classList.toggle("is-hidden", !this.hasUserZoom);
    }
  }

  /**
   * Réinitialise le zoom du graphique pour afficher toutes les données
   * et met à jour l'interface utilisateur correspondante.
   */
  resetZoom(redraw = true) {
    this.hasUserZoom = false;
    this.updateAutoZoomButtonVisibility();
    // Réinitialise les extrêmes des axes de Highcharts
    if (this.chart?.xAxis?.[0] && this.chart?.yAxis?.[0]) {
      this.chart.xAxis[0].setExtremes(null, null, false);
      this.chart.yAxis[0].setExtremes(null, null, false);
    }

    // Un seul redraw final pour les deux axes
    if (redraw && this.chart) {
      this.chart.redraw();
    }
    
    // Mise à jour UI
    this.uiManager?.resetZoomUI();
  }

  /**
   * Définit numériquement les bornes des axes X et Y.
   * Une valeur `null` ou `undefined` laisse la borne correspondante en automatique.
   * @param {{ xMin?: number|null, xMax?: number|null, yMin?: number|null, yMax?: number|null }} bounds
   * @returns {boolean}
   */
  setAxisBounds({ xMin = null, xMax = null, yMin = null, yMax = null } = {}) {
    if (!this.chart?.xAxis?.[0] || !this.chart?.yAxis?.[0]) return false;

    const allAuto = (xMin === null || xMin === undefined) &&
                    (xMax === null || xMax === undefined) &&
                    (yMin === null || yMin === undefined) &&
                    (yMax === null || yMax === undefined);

    if (allAuto) {
      this.resetZoom();
      return true;
    }

    this.hasUserZoom = true;

    this.chart.xAxis[0].setExtremes(xMin ?? null, xMax ?? null, false);
    this.chart.yAxis[0].setExtremes(yMin ?? null, yMax ?? null, false);
    this.chart.redraw();

    this.updateAutoZoomButtonVisibility();

    return true;
  }

  /**
   * Met à jour les données de tous les modèles et redessine le graphique.
   */
  updateModels() {
    if (!this.chart) return;
    this.suppressModelAutoUpdate = true;
    this.redrawAllModels();
    this.chart.redraw();
    this.suppressModelAutoUpdate = false;
  }

  /**
   * Met à jour les données de TOUS les modèles visibles sur le graphique.
   * Cette fonction est appelée par l'événement 'redraw' (zoom, déplacement).
   */
  redrawAllModels(viewMin, viewMax) {
    if (!this.chart || !this.chart.xAxis || !this.chart.xAxis[0]) return;

    // determine range to use
    let min, max;
    if (typeof viewMin === 'number' && typeof viewMax === 'number') {
      min = viewMin; 
      max = viewMax;
    } else {
      const ex = this.chart.xAxis[0].getExtremes();
      min = (ex.min !== undefined && ex.min !== null) ? ex.min : ex.dataMin; 
      max = (ex.max !== undefined && ex.max !== null) ? ex.max : ex.dataMax;
    }

    if (typeof min !== 'number' || typeof max !== 'number' || !isFinite(min) || !isFinite(max)) {
      return;
    }

    this.data.models.forEach(model => {
      // Modèle est visible si la courbe en x correspond ET que l'utilisateur ne l'a pas caché
      if (model.x.title === this.currentXCurve && model.visible) {
        const seriesId = `model-${model.id}`; // Utiliser un ID unique du modèle
        const existingSeries = this.chart.get(seriesId);
        
        if (existingSeries) {
          const modelData = model.getHighResData(min, max);
          // Met à jour les points de la série sans déclencher un nouveau redraw.
          // Le troisième argument (true) active l'animation.
          existingSeries.setData(modelData, false, ANIMATION_FLAG);
        }
      }
    });
  }

  /**
   * CRÉE la série pour un nouveau modèle sur le graphique.
   * N'est appelée qu'une seule fois lors de l'ajout d'un modèle.
   * @param {Model} model - L'objet modèle à tracer.
   */
  addModelSeries(model) {
    if (!this.chart || !model || !model.x || !model.y) {
      console.error("Impossible de tracer le modèle : données de courbe X ou Y manquantes.", model);
      return;
    }

    const extremes = this.chart.xAxis[0].getExtremes();
    const modelData = model.getHighResData(extremes.min, extremes.max);
    
    const seriesId = `model-${model.id}`; // Utiliser un ID unique du modèle
    const existingSeries = this.chart.get(seriesId);

    // On s'assure de ne pas ajouter une série qui existerait déjà
    if (!existingSeries) {
      // Déterminer la visibilité initiale du modèle
      const isVisible = model.x.title === this.currentXCurve && model.visible;
      this.chart.addSeries({
        id: seriesId,
        name: model.name || `Modèle (${model.y.title})`, // Utiliser le nom du modèle s'il existe
        data: modelData,
        xAxis: 1, // Utilise l'axe X secondaire (invisible)
        yAxis: 1, // Utilise l'axe Y secondaire (invisible)
        type: 'line',
        color: model.color || model.y.color,
        dashStyle: model.lineStyle || 'Dash',
        lineWidth: model.lineWidth ? parseInt(model.lineWidth, 10) : 2,
        marker: { enabled: false },
        enableMouseTracking: false,
        zIndex: 1,
        showInLegend: false, // N'affiche pas le modèle dans la légende
        visible: isVisible, // Définir la visibilité initiale
        states: {
          hover: {
            enabled: false // Désactive l'effet de survol
          },
          inactive: {
            enabled: false // Empêche le modèle de s'estomper quand une autre série est survolée
          }
        }
      }, false); // 'false' est crucial pour ne pas déclencher un redraw ici.
    }
  }
  updateModelVisibility() {
    this.data.models.forEach(model => {
      const series = this.chart.get(`model-${model.id}`);
      if (series) {
        const isVisible = model.x.title === this.currentXCurve && model.visible;
        if (isVisible) {
          series.show();
        } else {
          series.hide();
        }
      }
    });
  }

  _findNearestModelPoint(event) {
    return this._getToolsController()._findNearestModelPoint(event);
  }

  _drawStyledCrosshair(pixelX, pixelY, valueX, valueY, targetChart = this.chart) {
    return this._getAnnotationsRenderer()._drawStyledCrosshair(pixelX, pixelY, valueX, valueY, targetChart);
  }

  _drawEndpoint(pixelX, pixelY, targetChart = this.chart) {
    return this._getAnnotationsRenderer()._drawEndpoint(pixelX, pixelY, targetChart);
  }

  _isInsidePlotBox(chartX, chartY, chart = this.chart) {
    return this._getAnnotationsRenderer()._isInsidePlotBox(chartX, chartY, chart);
  }

  _clampToPlotBox(chartX, chartY, chart = this.chart) {
    return this._getAnnotationsRenderer()._clampToPlotBox(chartX, chartY, chart);
  }

  _getPlotClipRect(targetChart = this.chart) {
    return this._getAnnotationsRenderer()._getPlotClipRect(targetChart);
  }

  _clipToPlot(element, targetChart = this.chart) {
    return this._getAnnotationsRenderer()._clipToPlot(element, targetChart);
  }

  _getAxisDataBounds(chart = this.chart) {
    return this._getAnnotationsRenderer()._getAxisDataBounds(chart);
  }

  _isDataPointInBounds(pt, bounds) {
    return this._getAnnotationsRenderer()._isDataPointInBounds(pt, bounds);
  }

  _clipLineToAxisBounds(x1, y1, x2, y2, bounds) {
    return this._getAnnotationsRenderer()._clipLineToAxisBounds(x1, y1, x2, y2, bounds);
  }

  _clipInfiniteLineToAxisBounds(px, py, slope, bounds) {
    return this._getAnnotationsRenderer()._clipInfiniteLineToAxisBounds(px, py, slope, bounds);
  }

  _drawSlopeLabel(pixelX, pixelY, slope, targetChart = this.chart) {
    return this._getAnnotationsRenderer()._drawSlopeLabel(pixelX, pixelY, slope, targetChart);
  }

  drawDataCrosshair(event) {
    return this._getToolsController().drawDataCrosshair(event);
  }

  drawAnnotations(targetChart = this.chart) {
    return this._getAnnotationsRenderer().drawAnnotations(targetChart);
  }

  clearAllAnnotations() {
    return this._getAnnotationsRenderer().clearAllAnnotations();
  }

  handleMouseMove(e) {
    return this._getToolsController().handleMouseMove(e);
  }

  handleMouseUp(e) {
    return this._getToolsController().handleMouseUp(e);
  }

  _findNearestPoint(event) {
    return this._getToolsController()._findNearestPoint(event);
  }

  _extractPoint(p) {
    return this._getToolsController()._extractPoint(p);
  }

  _calculateSlope(point) {
    return this._getToolsController()._calculateSlope(point);
  }

  _calculateSlopeLegacy(point) {
    return this._getToolsController()._calculateSlopeLegacy(point);
  }

  _findTangentMethodPoints(point, slope1) {
    return this._getToolsController()._findTangentMethodPoints(point, slope1);
  }

  drawTangent(event) {
    return this._getToolsController().drawTangent(event);
  }
}

export {Grapher};