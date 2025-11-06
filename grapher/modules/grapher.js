import { formatNumber } from '../../common/formatter.js';

const $ = document.querySelector.bind(document);

const ANIMATION_FLAG = false; // Désactiver les animations pour de meilleures performances
const PADDING = 0.02; // 2% de padding pour le zoom auto

// --- Début de la surcharge Highcharts ---
// On exécute ce code une seule fois pour "patcher" la fonction setExtremes
(function (H) {
  H.wrap(H.Axis.prototype, 'setExtremes', function (proceed, newMin, newMax, redraw, animation, eventArgs) {
    const chart = this.chart;
    
    // Vérifie si c'est un reset zoom (newMin et newMax null) et option activée
    if (newMin === null && newMax === null && chart.options.customGrapherInstance.includeOriginOnAutoZoom){
      // Calcule manuellement les extrêmes globaux pour cet axe
      let globalDataMin = Infinity;
      let globalDataMax = -Infinity;
      const isXAxis = this.isXAxis;
      const axisIndex = this.index;
      const relevantSeries = isXAxis 
        ? chart.series.filter(s => s.visible)  // X partagé : toutes les séries visibles
        : chart.series.filter(s => s.visible && (s.yAxis ? s.yAxis.index === axisIndex : true));  // Y : séries attachées à cet axe
      
      relevantSeries.forEach(series => {
        const allPoints = series.options.data;

        if (!allPoints || allPoints.length === 0) {
          return; // Passe à la série suivante si pas de données
        }

        // Détecte si les données sont au format [x,y] ou {x, y}
        const isArrayData = Array.isArray(allPoints[0]);

        // Itère sur la totalité des points de la série
        allPoints.forEach(pointData => {
          let value;

          if (isArrayData) {
            // Format [x, y]
            value = isXAxis ? pointData[0] : pointData[1];
          } else if (pointData && typeof pointData === 'object') {
            // Format {x: ..., y: ...}
            value = isXAxis ? pointData.x : pointData.y;
          }

          // Met à jour les extrêmes globaux si la valeur est valide
          if (value !== undefined && !isNaN(value) && isFinite(value)) {
            globalDataMin = Math.min(globalDataMin, value);
            globalDataMax = Math.max(globalDataMax, value);
          }
        });
      });
      const hasData = globalDataMin !== Infinity && globalDataMax !== -Infinity;
      if (hasData) {
        let finalMin = Math.min(globalDataMin, 0);
        let finalMax = Math.max(globalDataMax, 0);
        
        const range = finalMax - finalMin;
        if (range > 0) {
          finalMin -= range * PADDING;
          finalMax += range * PADDING;
        }
        
        // Appel original avec bornes calculées
        proceed.call(this, finalMin, finalMax, redraw, animation, eventArgs);
      } else {
        // Pas de données : reset par défaut
        proceed.call(this, null, null, redraw, animation, eventArgs);
      }
    } else {
      // Autres cas : appel original
      proceed.call(this, newMin, newMax, redraw, animation, eventArgs);
    }
  });
})(Highcharts);
// --- Fin de la surcharge Highcharts ---

function lengthOfTheLongestTable(tables){
  // Find the biggest curve
  let size = 0;
  tables.forEach((table, i) => {
    if(table.length > size){
      size = table.length;
    }
  });
  return size;
}

// Highcharts symbols --------------------------------------------------------------------------
// Cross symbol for Highcharts
Highcharts.SVGRenderer.prototype.symbols.cross = function (x, y, w, h) {
  const size = Math.min(w, h);
  const cx = x + w / 2;
  const cy = y + h / 2;
  const s = size / 2;

  return [
    'M', cx - s, cy,
    'L', cx + s, cy,
    'M', cx, cy - s,
    'L', cx, cy + s
  ];
};

// Cross symbol for Highcharts with X orientation
Highcharts.SVGRenderer.prototype.symbols.crossX = function (x, y, w, h) {
  const s = Math.min(w, h) / 2;
  const cx = x + w / 2;
  const cy = y + h / 2;

  return [
    'M', cx - s, cy - s,
    'L', cx + s, cy + s,
    'M', cx - s, cy + s,
    'L', cx + s, cy - s
  ];
};

/*----------------------------------------------------------------------------------------------
----------------------------------------------Grapher-------------------------------------------
----------------------------------------------------------------------------------------------*/
export default class Grapher {
  constructor(data, initialSettings) {
    this.data = data;
    this.chart;

    this.uiManager = null;

    this.grid = initialSettings.grapherGrid; // Default value for grid visibility
    this.includeOriginOnAutoZoom = initialSettings.includeOriginOnAutoZoom;

    this.currentXCurve = null;

    // Pour le réticule libre manuel
    this.crosshairMode = null; // Mode par défaut
    this.freeCrosshair = null;   // Pour stocker les éléments du réticule

    this.suppressModelAutoUpdate = false; // used to avoid double updates

    this.renderedAnnotations = []; 

    // Propriété pour gérer le clic intelligent
    this.mouseDownInfo = null;
    this.isDragging = false;      // Pour savoir si un glisser est en cours
    this.tempAnnotation = null; // Pour stocker les éléments temporaires
    this.snappedModelPoint = null;
    this.snappedDataPoint = null;
  }

  setUIManager(uiManager) {
    this.uiManager = uiManager;
  }

  formatData(xCurve, yCurve){
    let length = lengthOfTheLongestTable([xCurve, yCurve]);
    let data = []
    for(let i = 0; i < length; i++){
      if(xCurve[i] !== "" && yCurve[i] !== "" && xCurve[i] !== undefined && yCurve[i] !== undefined){
        data.push([xCurve[i], yCurve[i]]);
      }
    }
    return data;
  }

  newChart(){
    const self = this

    // Lier les gestionnaires d'événements à l'instance de Grapher
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);

    this.chart = Highcharts.chart("chart", {
      animation: ANIMATION_FLAG,
      boost: {
        seriesThreshold: 5000,
      },
      chart: {
        type: "line",
        alignTicks: false,
        animation: ANIMATION_FLAG,
        marginBottom: 60,
        events: {
          load : function () {
            const chart = this;
            const drawAnnotationsBound = self.drawAnnotations.bind(self); // Lier `this`


            // Fonction pour dessiner les flèches
            function drawArrows() {
              // Supprimer les anciennes flèches s’il y en a
              if (chart.customArrows) {
                chart.customArrows.forEach(a => a.destroy());
              }

              chart.customArrows = [];

              const xAxis = chart.xAxis[0];
              const yAxis = chart.yAxis[0];

              // Flèche X (droite)
              const xEnd = xAxis.toPixels(xAxis.max);
              const yPos = chart.plotHeight + chart.plotTop;

              const arrowX = chart.renderer.path([
                'M', xEnd, yPos,
                'L', xEnd - 10, yPos - 5,
                'L', xEnd - 10, yPos + 5,
                'Z'
              ]).attr({ fill: 'black' }).add();

              chart.customArrows.push(arrowX);

              // Récupérer l'unité de l'axe X
              const xCurveObj = self.data.getCurveByTitle(self.currentXCurve);
              const xUnit = xCurveObj?.unit || '';
              const xExponent = xAxis.exponent;

              let exponentPart = '';
              if (xExponent) {
                exponentPart = `&times;10<sup>${xExponent}</sup>`;
              }

              let unitText = '';
              if (exponentPart && xUnit) {
                unitText = `${exponentPart} ${xUnit}`;
              } else if (exponentPart) {
                unitText = exponentPart;
              } else if (xUnit) {
                unitText = xUnit;
              }

              // Ancien label X (désactivé)
              /*let labelText = self.currentXCurve;
              if (unitText) {
                labelText += ` (${unitText})`;
              }

              // Mesure la largeur du texte
              const tempText = chart.renderer.label(labelText, 0, -9999, null, null, null, true).css({
                fontSize: '16px'
              }).add();
              const textWidth = tempText.getBBox().width;
              tempText.destroy();

              // Texte pour axe X
              const labelX = chart.renderer.label(labelText, xEnd - textWidth, yPos + 24, null, null, null, true)
                .css({
                  color: 'black',
                  fontSize: '16px'
                })
                .add();
              chart.customArrows.push(labelX);*/

              // Flèche Y (haut)
              const yEnd = yAxis.toPixels(yAxis.max);
              const xPos = chart.plotLeft;

              const arrowY = chart.renderer.path([
                  'M', xPos, yEnd,
                  'L', xPos - 5, yEnd + 10,
                  'L', xPos + 5, yEnd + 10,
                  'Z'
              ]).attr({ fill: 'black' }).add();

              chart.customArrows.push(arrowY);
            }

            // Dessin initial
            drawArrows();
            drawAnnotationsBound();

            // Re-dessiner à chaque redraw (resize, zoom, etc.)
            Highcharts.addEvent(chart, 'redraw', drawArrows);
            Highcharts.addEvent(chart, 'redraw', drawAnnotationsBound); // Redessiner les annotations

          },
          selection: (e) => {
            // 1. On empêche le zoom par défaut.
            e.preventDefault();

            // 2. On applique les nouvelles limites SANS redessiner le graphique immédiatement.
            this.chart.xAxis[0].setExtremes(e.xAxis[0].min, e.xAxis[0].max, false);
            this.chart.yAxis[0].setExtremes(e.yAxis[0].min, e.yAxis[0].max, false);
            
            // 3. On déclenche UN SEUL redessin manuel pour appliquer tous les changements.
            this.chart.redraw();

            // 4. On affiche notre bouton personnalisé.
            $("#auto-zoom-button").classList.remove("is-hidden");
          }
        }
      },
      legend: {
        useHTML: true,
        itemStyle: {
          fontSize: '16px',
          color: '#000000'
        },
        labelFormatter: function () {
          const unit = this.userOptions.unit || '';
          const yAxis = this.chart.yAxis[0];
          const yExponent = yAxis.exponent;

          let exponentPart = '';
          if (yExponent) {
            exponentPart = `&times;10<sup>${yExponent}</sup>`;
          }

          let content = '';
          if (exponentPart && unit) {
            content = `${exponentPart} ${unit}`;
          } else if (exponentPart) {
            content = exponentPart;
          } else if (unit) {
            content = unit;
          }

          let labelText = this.name;
          if (content) {
            labelText += ` (${content})`;
          }

          const topAdjustment = yExponent ? -5 : -2;

          return `<span style="position: relative; top: ${topAdjustment}px;">${labelText}</span>`;
        },
        layout: 'horizontal',
        align: 'left',
        verticalAlign: 'top',
        x: 0,
        y: -10,
      },
      tooltip: {
        enabled: false,
        useHTML: true, // Toujours nécessaire pour le formatage du contenu

        shape: 'callout',
        backgroundColor: 'white',
        borderColor: '#dbdbdb',
        borderWidth: 1,
        borderRadius: 6,
        shadow: false,
        style: {
          fontSize: '14px',
          padding: '10px'
        },

        formatter: function () {
          const chart = this.series.chart;
          const grapher = chart.options.customGrapherInstance; 
          if (!grapher) return '';

          const significantDigits = grapher.data.settings.significantDigits ?? 4;

          const xCurve = grapher.currentXCurve;
          const xCurveObj = grapher.data.getCurveByTitle(xCurve);
          const xUnit = xCurveObj?.unit || '';
          const xLabel = `<strong>${xCurve} =</strong> ${formatNumber(this.x, significantDigits)} ${xUnit}`;

          const yCurveObj = grapher.data.getCurveByTitle(this.series.name);
          const yUnit = yCurveObj?.unit || '';
          const yLabel = `<strong>${this.series.name} =</strong> ${formatNumber(this.y, significantDigits)} ${yUnit}`;
          
          return `${xLabel}<br>${yLabel}`;
        }
      },
      zooming: {
        type: null
      },
      accessibility: {
        enabled: false
      },
      title: {
        text: null
      },
      loading: {
        style: {
          fontSize: '2.5rem',
          opacity: 0.85
        }
      },
      xAxis: [{
        title: {
          text: null
        },
        gridLineWidth: 1,
        startOnTick: false,
        endOnTick: false,
        minPadding: 0,
        maxPadding: 0,
        minRange: 1e-30, // Pour éviter les zooms extrêmes
        events: {
          afterSetExtremes: function () {
            const oldExponent = this.exponent;
            const maxAbs = Math.max(Math.abs(this.max), Math.abs(this.min));
            
            this.exponent = 0;

            if (maxAbs > 0) {
              const power = Math.floor(Math.log10(maxAbs));
              const range = Math.abs(this.max - this.min);

              if (power >= 3 || power < -3) {
                if (power >= 3 && range > 0 && Math.log10(maxAbs / range) > 2) {
                  this.exponent = 0;
                } else {
                  this.exponent = Math.floor(power / 3) * 3;
                }
              }
            }
            
            if (oldExponent !== this.exponent) {
              this.chart.redraw(false);
            }
          }
        },
        labels: {
          formatter: function () {
            const exponent = this.axis.exponent || 0;
            const value = this.value / Math.pow(10, exponent);
            const tickInterval = this.axis.tickInterval;
            const scaledTickInterval = tickInterval / Math.pow(10, exponent);
            let decimals = 0;
            if (scaledTickInterval > 0) {
              decimals = Math.max(0, -Math.floor(Math.log10(scaledTickInterval)) + 1);
            }
            decimals = Math.min(decimals, 15);
            return Highcharts.numberFormat(value, decimals, ',', ' ');
          }
        }
      },
      { // Axe X Secondaire (index 1) pour les modèles
        visible: false,
        linkedTo: 0
      }],
      yAxis: [{
        title: {
          text: null
        },
        lineWidth: 1,
        gridLineWidth: 1,
        startOnTick: false,
        endOnTick: false,
        minPadding: 0,
        maxPadding: 0,
        events: {
          afterSetExtremes: function () {
            const oldExponent = this.exponent;
            const maxAbs = Math.max(Math.abs(this.max), Math.abs(this.min));
            this.exponent = 0;
            if (maxAbs > 0) {
              const power = Math.floor(Math.log10(maxAbs));
              const range = Math.abs(this.max - this.min);
              if (power >= 3 || power < -3) {
                if (power >= 3 && range > 0 && Math.log10(maxAbs / range) > 2) {
                  this.exponent = 0;
                } else {
                  this.exponent = Math.floor(power / 3) * 3;
                }
              }
            }
            if (oldExponent !== this.exponent) {
              this.chart.legend.update({});
            }
          }
        },
        labels: {
          formatter: function () {
            const exponent = this.axis.exponent || 0;
            const value = this.value / Math.pow(10, exponent);
            const tickInterval = this.axis.tickInterval;
            const scaledTickInterval = tickInterval / Math.pow(10, exponent);
            let decimals = 0;
            if (scaledTickInterval > 0) {
              decimals = Math.max(0, -Math.floor(Math.log10(scaledTickInterval)) + 1);
            }
            decimals = Math.min(decimals, 15);
            return Highcharts.numberFormat(value, decimals, ',', ' ');
          }
        }
      },
      { // Axe Y Secondaire (index 1) pour les modèles
        visible: false,
        linkedTo: 0
      }],
      credits: {
        enabled: false
      },
      plotOptions: {
        series: {
          animation: ANIMATION_FLAG,
          stickyTracking: false,
          states: {
            hover: {
              enabled: false,
              lineWidthPlus: 0 
            }
          },
          events: {
            legendItemClick: function () {
              const grapher = this.chart.options.customGrapherInstance;
              setTimeout(() => grapher?.reorderLegendByVisibility(), 0);
              return true;
            }
          }
        }
      },
      series: []
    });

    // Set the custom grapher instance for tooltip formatting
    this.chart.options.customGrapherInstance = this;

    // Gestion du clic pour ajouter une annotation avec le réticule libre
    this.chart.container.addEventListener('mousedown', (e) => {
    if (this.crosshairMode !== 'free' && this.crosshairMode !== 'model' && this.crosshairMode !== 'data' && this.crosshairMode !== 'tangent') return;

      e.preventDefault(); // Empêche la sélection de texte pendant le glisser

      const pos = this.chart.pointer.getChartPosition();
      this.mouseDownInfo = {
        chartX: e.pageX - pos.left,
        chartY: e.pageY - pos.top,
        time: Date.now()
      };

      if (this.crosshairMode === 'data') {
        const dataSeries = this.chart.series.filter(s => !s.options.id?.startsWith('model-'));
        const point = this.chart.pointer.findNearestKDPoint(dataSeries, true, this.mouseDownInfo);
        if (point) {
          this.mouseDownInfo.snappedPoint = { x: point.x, y: point.y };
        }
      } else if (this.crosshairMode === 'model') { // <-- AJOUTEZ CE BLOC
        const point = this._findNearestModelPoint(this.mouseDownInfo);
        if (point) {
            this.mouseDownInfo.snappedPoint = { x: point.x, y: point.y };
        }
      }

      this.isDragging = true;

      // Attacher les écouteurs au document pour capturer tous les mouvements
      document.addEventListener('mousemove', this.handleMouseMove);
      document.addEventListener('mouseup', this.handleMouseUp);
    });

    this.chart.container.addEventListener('mousemove', (e) => {
      if (this.crosshairMode === null) return;

      const pos = this.chart.pointer.getChartPosition();
      const payload = { chartX: e.pageX - pos.left, chartY: e.pageY - pos.top };

      if (this.crosshairMode === 'free') {
        this.drawFreeCrosshair(payload);
      } else if (this.crosshairMode === 'model') {
        this.drawModelCrosshair(payload);
      } else if (this.crosshairMode === 'data') {
        this.drawDataCrosshair(payload);
      } else if (this.crosshairMode === 'tangent') {
        this.drawTangent(payload);
      }                        
    });

    Highcharts.addEvent(this.chart.container, 'mouseleave', () => {
      this.hideFreeCrosshair(); // On cache toujours quand la souris sort
    });

    // Ajoute un écouteur pour l'événement redraw pour les modèles
    Highcharts.addEvent(this.chart, 'redraw', () => {
      // If we're in a programmatic update sequence, skip the automatic update
      if (this.suppressModelAutoUpdate) return;

      // Read real extremes and only update if they actually changed
      const ex = this.chart.xAxis[0].getExtremes();

      // Ask redrawAllModels to use these extremes
      this.redrawAllModels(ex.min, ex.max);
    });
  }

  reorderLegendByVisibility() {
    const series = this.chart.series.filter(s => s.options.showInLegend !== false);
    const visibleSeries = series.filter(s => s.visible);
    const hiddenSeries  = series.filter(s => !s.visible);
    const sorted = [...visibleSeries, ...hiddenSeries];
    sorted.forEach((s, idx) => {
      if (s.options.legendIndex !== idx) s.update({ legendIndex: idx }, false);
    });
    this.chart.redraw();
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
    this.updateModelVisibility();

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

    if(this.currentXCurve === title){
      if(this.data.curves.length > 0){
        this.setXCurve(this.data.curves[0].title);
      } else{
        this.currentXCurve = null;
      }
    }
  }

  deleteAllCurves() {
    while(this.chart.series.length > 0) {
      this.chart.series[0].remove(false); // false pour ne pas redessiner à chaque fois
    }
    this.chart.redraw(); // Un seul redessin à la fin
    this.currentXCurve = null;
  }

updateChart(yCurveTitles, redraw = true) {
    if (!this.currentXCurve) return;

    // Déterminer les courbes à afficher
    let curvesToShow;
    if (yCurveTitles) {
      curvesToShow = new Set(yCurveTitles);
    } else {
      // Si aucun titre n'est fourni, on essaie de conserver l'état actuel
      const currentlyVisible = this.chart.series
        .filter(s => s.visible && !s.options.id?.startsWith('model-'))
        .map(s => s.name);
      
      if (currentlyVisible.length > 0) {
        curvesToShow = new Set(currentlyVisible);
      } else {
        // Cas initial : aucune courbe n'est visible, on affiche la première disponible
        const firstYCurve = this.data.curves.find(c => c.title !== this.currentXCurve);
        curvesToShow = firstYCurve ? new Set([firstYCurve.title]) : new Set();
      }
    }

    // 1. Ajouter toutes les courbes si elles n'existent pas déjà
    this.data.curves.forEach(curve => {
      //if (curve.title === this.currentXCurve) return;

      const seriesExists = this.chart.series.some(s => s.name === curve.title);
      if (!seriesExists) {
        const shouldBeVisible = curvesToShow.has(curve.title);
        this.chart.addSeries({
          name: curve.title,
          data: this.formatData(this.data.getCurveByTitle(this.currentXCurve), curve),
          color: curve.color,
          lineWidth: curve.line ? curve.lineWidth : 0,
          dashStyle: curve.lineStyle,
          marker: {
            enabled: curve.markers,
            symbol: curve.markerSymbol,
            radius: curve.markerRadius,
            lineWidth: (curve.markerSymbol === "cross" || curve.markerSymbol === "crossX") ? 1 : 0,
            lineColor: curve.color
          },
          unit: curve.unit,
          visible: shouldBeVisible, // Visibilité déterminée ici
          showInLegend: true
        }, false);
      }
    });

    // 2. Mettre à jour les données et la visibilité des séries existantes
    this.chart.series.forEach(serie => {
      if (serie.options.id?.startsWith('model-')) return;
      
      const curveData = this.data.getCurveByTitle(serie.name);
      const xCurveData = this.data.getCurveByTitle(this.currentXCurve);

      if (curveData && xCurveData) {
        serie.setData(this.formatData(xCurveData, curveData), false);

        const shouldBeVisible = curvesToShow.has(serie.name);
        if (serie.visible !== shouldBeVisible) {
          serie.setVisible(shouldBeVisible, false);
        }
      }
    });

    // 3. Supprimer les séries qui n'existent plus dans les données
    let i = this.chart.series.length;
    while (i--) {
      const serie = this.chart.series[i];
      if (!serie.options.id?.startsWith('model-')) {
        const curveExists = this.data.curves.some(c => c.title === serie.name);
        if (!curveExists) {
          serie.remove(false);
        }
      }
    }

    if (redraw) {
      this.chart.redraw();
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

  setCrosshairMode(mode) {
    this.crosshairMode = mode;

    const needsMouseTracking = (mode === 'data' || mode === 'model' || mode === 'tangent');
    // On active le "sticky tracking" pour les outils qui doivent s'accrocher aux points
    const needsStickyTracking = (mode === 'data' || mode === 'tangent');

    this.hideFreeCrosshair();

    // Application de la classe CSS pour forcer le curseur
    if (mode === 'free' || mode === 'model' || mode === 'data') {
      this.chart.container.classList.add('chart-free-crosshair');
    } else {
      this.chart.container.classList.remove('chart-free-crosshair');
    }

    // Mise à jour groupée de toutes les options nécessaires
    this.chart.update({
      chart: { zooming: { type: null}},
      tooltip: { enabled: false},
      plotOptions: {
        series: {
          stickyTracking: needsStickyTracking,
          enableMouseTracking: needsMouseTracking,
          states: { hover: { enabled: false } }
        }
      }
    });
  }

  drawFreeCrosshair(event) {
    const chart = this.chart;
    if (!chart.pointer) return;

    // Cacher l'ancien réticule avant d'en dessiner un nouveau
    this.hideFreeCrosshair();

    const { chartX, chartY } = event;
    const { plotLeft, plotTop, plotWidth, plotHeight } = chart;
    
    // Ne rien dessiner si la souris est hors de la zone de tracé
    if (chartX < plotLeft || chartX > plotLeft + plotWidth || chartY < plotTop || chartY > plotTop + plotHeight) {
      return;
    }

    const xValue = chart.xAxis[0].toValue(chartX);
    const yValue = chart.yAxis[0].toValue(chartY);

    // Utiliser la fonction factorisée et stocker les éléments créés
    this.freeCrosshair = this._drawStyledCrosshair(chartX, chartY, xValue, yValue);

  }

  // MÉTHODE PRIVÉE pour cacher le réticule
  hideFreeCrosshair() {
    if (this.freeCrosshair) {
      Object.values(this.freeCrosshair).forEach(el => el.destroy());
      this.freeCrosshair = null;
    }
  }

  // S’aimante au point de modèle visible le plus proche
  drawModelCrosshair(event) {
    const chart = this.chart;
    const best = this._findNearestModelPoint(event); // Trouve le point le plus proche

    if (!best) {
      this.hideFreeCrosshair();
      this.snappedModelPoint = null;
      return;
    }

    // Mémorise les coordonnées pour un éventuel clic
    this.snappedModelPoint = { x: best.x, y: best.y };

    // Calcule les coordonnées en pixels sur le graphique
    const pixelX = best.plotX + chart.plotLeft;
    const pixelY = best.plotY + chart.plotTop;

    // Cacher l'ancien réticule et dessiner le nouveau
    this.hideFreeCrosshair();
    this.freeCrosshair = this._drawStyledCrosshair(pixelX, pixelY, best.x, best.y);
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

    // Appliquer les nouvelles limites sans redessiner immédiatement
    this.chart.xAxis[0].setExtremes(newMinX, newMaxX, false);
    this.chart.yAxis[0].setExtremes(newMinY, newMaxY, false);
    
    // Déclencher un unique redraw qui mettra à jour à la fois les modèles et les annotations
    this.chart.redraw();

    // Afficher le bouton de "reset zoom"
    $("#auto-zoom-button").classList.remove("is-hidden");
  }

  /**
   * Réinitialise le zoom du graphique pour afficher toutes les données
   * et met à jour l'interface utilisateur correspondante.
   */
  resetZoom(redraw = true) {
    // Réinitialise les extrêmes des axes de Highcharts
    this.chart.xAxis[0].setExtremes(null, null, false);
    this.chart.yAxis[0].setExtremes(null, null, false);

    // Un seul redraw final pour les deux axes
    if (redraw) {
      this.chart.redraw();
    }
    
    // Mise à jour UI
    this.uiManager.resetZoomUI();
  }

  /**
   * Met à jour les données de TOUS les modèles visibles sur le graphique.
   * Cette fonction est appelée par l'événement 'redraw' (zoom, déplacement).
   */
  redrawAllModels(viewMin, viewMax) {
    // determine range to use
    let min, max;
    if (typeof viewMin === 'number' && typeof viewMax === 'number') {
      min = viewMin; 
      max = viewMax;
    } else {
      const ex = this.chart.xAxis[0].getExtremes();
      min = ex.min; 
      max = ex.max;
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
        color: model.y.color,
        dashStyle: 'Dash',
        lineWidth: 2,
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

  /**
   * Trouve le point le plus proche sur toutes les courbes de modèle visibles.
   * @private
   */
  _findNearestModelPoint(event) {
    const chart = this.chart;
    if (!chart?.pointer) return null;

    const xAxis = chart.xAxis[0];
    const yAxis = chart.yAxis[0];
    const xVal = xAxis.toValue(event.chartX);

    let best = null;
    this.data.models.forEach(model => {
      if (model.x.title !== this.currentXCurve || !model.visible) return;
      const s = chart.get(`model-${model.id}`);
      if (!s || !s.visible || (!s.points && !s.data)) return;

      const pts = s.points ?? s.data;
      if (!pts.length) return;

      let closest = null, minDx = Infinity;
      for (let i = 0; i < pts.length; i++) {
        const point = pts[i];
        const dx = Math.abs(point.x - xVal);
        if (dx < minDx) {
          minDx = dx;
          closest = { x: point.x, y: point.y };
        }
      }
      if (!closest) return;

      const pixelX = xAxis.toPixels(closest.x);
      const pixelY = yAxis.toPixels(closest.y);
      const dist2 = Math.pow(pixelX - event.chartX, 2) + Math.pow(pixelY - event.chartY, 2);

      if (!best || dist2 < best.dist2) {
        best = {
          x: closest.x,
          y: closest.y,
          plotX: pixelX - chart.plotLeft,
          plotY: pixelY - chart.plotTop,
          dist2: dist2
        };
      }
    });
    return best;
  }

  /**
   * Dessine une croix et ses labels en respectant le style original.
   */
  _drawStyledCrosshair(pixelX, pixelY, valueX, valueY) {
    const chart = this.chart;
    const renderer = chart.renderer;
    const significantDigits = this.data.settings.significantDigits;
    const { plotLeft, plotTop, plotWidth, plotHeight } = chart;

    const elements = {};

    // Lignes
    elements.xLine = renderer.path(['M', pixelX, plotTop, 'L', pixelX, plotTop + plotHeight])
        .attr({ 'stroke-width': 1, stroke: 'dimgray', dashstyle: 'shortdot', zIndex: 5 }).add();
    elements.yLine = renderer.path(['M', plotLeft, pixelY, 'L', plotLeft + plotWidth, pixelY])
        .attr({ 'stroke-width': 1, stroke: 'dimgray', dashstyle: 'shortdot', zIndex: 5 }).add();

    // Labels avec le style d'origine
    const labelAttr = { fill: 'white', stroke: '#dbdbdb', 'stroke-width': 1, r: 6, padding: 8, zIndex: 6 };
    const labelCss = { color: 'black', fontSize: '14px' };

    elements.xLabel = renderer.label(formatNumber(valueX, significantDigits), 0, 0, 'callout').attr(labelAttr).css(labelCss).add();
    const xLabelBBox = elements.xLabel.getBBox();
    elements.xLabel.translate(pixelX - xLabelBBox.width / 2, plotTop + plotHeight - xLabelBBox.height - 5);

    elements.yLabel = renderer.label(formatNumber(valueY, significantDigits), 0, 0, 'callout').attr(labelAttr).css(labelCss).add();
    const yLabelBBox = elements.yLabel.getBBox();
    elements.yLabel.translate(plotLeft + 5, pixelY - yLabelBBox.height / 2);
    
    return elements;
  }

  /**
   * Dessine un simple point stylisé pour les extrémités des segments.
   * @private
   */
  _drawEndpoint(pixelX, pixelY) {
    const chart = this.chart;
    const renderer = chart.renderer;
    
    const circle = renderer.circle(pixelX, pixelY, 4)
      .attr({
        fill: 'rgba(220, 53, 69, 0.9)',
        stroke: 'white',
        'stroke-width': 1,
        zIndex: 5
      }).add();

    // Retourne un tableau pour un nettoyage uniforme avec les autres annotations
    return [circle];
  }

  /**
   * Dessine un réticule personnalisé en s'aimantant au point de donnée le plus proche.
   */
  drawDataCrosshair(event) {
    const chart = this.chart;
    
    // Utilise l'événement natif de Highcharts pour trouver le point le plus proche
    const dataSeries = chart.series.filter(s => !s.options.id?.startsWith('model-'));
    const point = chart.pointer.findNearestKDPoint(dataSeries, false, event);

    if (point && point.plotX !== undefined && point.plotY !== undefined) {
      this.snappedDataPoint = { x: point.x, y: point.y };
      this.hideFreeCrosshair(); // Cacher l'ancien
      
      // Dessiner le nouveau réticule à la position du point trouvé
      this.freeCrosshair = this._drawStyledCrosshair(point.plotX + chart.plotLeft, point.plotY + chart.plotTop, point.x, point.y);
    } else {
      this.snappedDataPoint = null;
      this.hideFreeCrosshair();
    }
  }

  /**
   * Dessine toutes les annotations stockées dans this.data.annotations
   */
  drawAnnotations() {
    if (!this.chart || !this.chart.renderer) {
      return;
    }
    const chart = this.chart;
    const xAxis = chart.xAxis[0];
    const yAxis = chart.yAxis[0];
    const significantDigits = this.data.settings.significantDigits;

    // Nettoyer les anciennes annotations
    this.renderedAnnotations.forEach(rendered => {
      if (Array.isArray(rendered)) {
        rendered.forEach(el => el.destroy());
      } else if (typeof rendered === 'object' && rendered !== null) {
        Object.values(rendered).forEach(el => el.destroy());
      }
    });
    this.renderedAnnotations = [];

    // Dessiner chaque annotation
    this.data.annotations.forEach(annotation => {
      if (annotation.type === 'point') {
        const pixelX = xAxis.toPixels(annotation.x);
        const pixelY = yAxis.toPixels(annotation.y);

        if (pixelX >= chart.plotLeft && pixelX <= chart.plotLeft + chart.plotWidth &&
          pixelY >= chart.plotTop && pixelY <= chart.plotTop + chart.plotHeight) {
          this.renderedAnnotations.push(this._drawStyledCrosshair(pixelX, pixelY, annotation.x, annotation.y));
        }
      } else if (annotation.type === 'segment') {
        const [p1, p2] = annotation.points;
        const [pixelX1, pixelY1] = [xAxis.toPixels(p1.x), yAxis.toPixels(p1.y)];
        const [pixelX2, pixelY2] = [xAxis.toPixels(p2.x), yAxis.toPixels(p2.y)];
        
        const segmentElements = [];

        // 1. Ligne principale du segment
        segmentElements.push(chart.renderer.path(['M', pixelX1, pixelY1, 'L', pixelX2, pixelY2])
          .attr({ 'stroke-width': 2, stroke: 'rgba(220, 53, 69, 0.9)', zIndex: 4 }).add());

        // 2. Points aux extrémités
        segmentElements.push(...this._drawEndpoint(pixelX1, pixelY1), ...this._drawEndpoint(pixelX2, pixelY2));

        // 3. Lignes Delta
        const deltaLineAttr = { 'stroke-width': 1, stroke: 'rgba(0, 123, 255, 0.8)', 'stroke-dasharray': '4,4', zIndex: 3 };
        segmentElements.push(chart.renderer.path(['M', pixelX1, pixelY1, 'L', pixelX2, pixelY1]).attr(deltaLineAttr).add());
        segmentElements.push(chart.renderer.path(['M', pixelX2, pixelY1, 'L', pixelX2, pixelY2]).attr(deltaLineAttr).add());

        // 4. Labels Delta
        const xCurveObj = this.data.getCurveByTitle(this.currentXCurve);
        const firstYSeries = chart.series.find(s => s.visible && s.yAxis.index === 0);
        const xUnit = xCurveObj?.unit ? ` ${xCurveObj.unit}` : '';
        const yUnit = firstYSeries?.userOptions.unit ? ` ${firstYSeries.userOptions.unit}` : '';

        const dxText = `Δx = ${formatNumber(p2.x - p1.x, significantDigits)}${xUnit}`;
        const dyText = `Δy = ${formatNumber(p2.y - p1.y, significantDigits)}${yUnit}`;
        
        const labelAttr = { fill: 'rgba(255, 255, 255, 0.85)', stroke: '#dbdbdb', 'stroke-width': 1, r: 4, padding: 5, zIndex: 6 };
        const labelCss = { color: 'black', fontSize: '12px' };

        const dxLabel = chart.renderer.label(dxText, 0, 0).attr(labelAttr).css(labelCss).add();
        const dxBBox = dxLabel.getBBox();
        dxLabel.translate((pixelX1 + pixelX2) / 2 - dxBBox.width / 2, pixelY1 - (pixelY1 > pixelY2 ? 5 : dxBBox.height + 5));
        
        const dyLabel = chart.renderer.label(dyText, 0, 0).attr(labelAttr).css(labelCss).add();
        const dyBBox = dyLabel.getBBox();
        dyLabel.translate(pixelX2 + (pixelX2 > pixelX1 ? 5 : -dyBBox.width - 5), (pixelY1 + pixelY2) / 2 - dyBBox.height / 2);

        segmentElements.push(dxLabel, dyLabel);
        this.renderedAnnotations.push(segmentElements);
      } else if (annotation.type === 'tangent') {
        const { point, slope } = annotation;
        const pixelX = xAxis.toPixels(point.x);
        const pixelY = yAxis.toPixels(point.y);

        const renderedTangent = {};

        // Point de tangence
        Object.assign(renderedTangent, this._drawStyledCrosshair(pixelX, pixelY, point.x, point.y));

        // Ligne de tangente
        const { min: xMin, max: xMax } = chart.xAxis[0].getExtremes();
        const yAtMin = slope * (xMin - point.x) + point.y;
        const yAtMax = slope * (xMax - point.x) + point.y;
        const p1 = { x: xAxis.toPixels(xMin), y: yAxis.toPixels(yAtMin) };
        const p2 = { x: xAxis.toPixels(xMax), y: yAxis.toPixels(yAtMax) };
        renderedTangent.tangentLine = chart.renderer.path(['M', p1.x, p1.y, 'L', p2.x, p2.y])
          .attr({ 'stroke-width': 2, stroke: 'rgba(0, 200, 100, 0.8)', zIndex: 4 }).add();

        // Label de la pente
        const slopeText = `pente = ${formatNumber(slope, significantDigits)}`;
        renderedTangent.slopeLabel = chart.renderer.label(slopeText, 0, 0, 'callout')
          .attr({ fill: 'white', stroke: '#dbdbdb', 'stroke-width': 1, r: 6, padding: 8, zIndex: 6 })
          .css({ color: 'black', fontSize: '14px' }).add();

        const labelBBox = renderedTangent.slopeLabel.getBBox();
        const labelX = pixelX + 15 > chart.plotWidth + chart.plotLeft - labelBBox.width ? pixelX - 15 - labelBBox.width : pixelX + 15;
        let labelY;
        if (slope > 0) {
            labelY = pixelY + 15;
        } else {
            labelY = pixelY - 15 - labelBBox.height;
        }
        if (labelY < chart.plotTop) {
            labelY = pixelY + 15;
        }
        if (labelY + labelBBox.height > chart.plotTop + chart.plotHeight) {
            labelY = pixelY - 15 - labelBBox.height;
        }
        
        renderedTangent.slopeLabel.translate(labelX, labelY);

        this.renderedAnnotations.push(renderedTangent);
      }
    });
  }

  /**
   * Supprime toutes les annotations (données et affichage)
   */
  clearAllAnnotations() {
    this.data.annotations = [];

    // Met à jour la visibilité du bouton après avoir supprimé les annotations
    if (this.uiManager) {
      this.uiManager.updateClearAnnotationsButtonVisibility();
    }

    this.chart.redraw();
  }

  handleMouseMove(e) {
    if (!this.isDragging) return;

    const chart = this.chart;
    const pos = chart.pointer.getChartPosition();
    const startInfo = this.mouseDownInfo;
    const currentX = e.pageX - pos.left;
    const currentY = e.pageY - pos.top;

    if (this.tempAnnotation) {
      this.tempAnnotation.forEach(el => el.destroy());
    }

    const distance = Math.sqrt(Math.pow(currentX - startInfo.chartX, 2) + Math.pow(currentY - startInfo.chartY, 2));
    if (distance < 5) {
      this.tempAnnotation = null;
      return;
    }
    
    let p1_pix, p2_pix;

    if (this.crosshairMode === 'data') {
      if (!startInfo.snappedPoint) return; // Pas de point de départ, on ne dessine rien
      const startPoint = startInfo.snappedPoint;
      p1_pix = { x: chart.xAxis[0].toPixels(startPoint.x), y: chart.yAxis[0].toPixels(startPoint.y) };

      const dataSeries = chart.series.filter(s => !s.options.id?.startsWith('model-'));
      const currentPoint = chart.pointer.findNearestKDPoint(dataSeries, true, { chartX: currentX, chartY: currentY });
      if (!currentPoint) return; // Pas de point d'arrivée, on ne dessine rien
      p2_pix = { x: currentPoint.plotX + chart.plotLeft, y: currentPoint.plotY + chart.plotTop };

    } else if (this.crosshairMode === 'model') { // Comportement pour mode data
      if (!startInfo.snappedPoint) return;
      p1_pix = { x: chart.xAxis[0].toPixels(startInfo.snappedPoint.x), y: chart.yAxis[0].toPixels(startInfo.snappedPoint.y) };

      const currentPoint = this._findNearestModelPoint({ chartX: currentX, chartY: currentY });
      if (!currentPoint) return;
      p2_pix = { x: currentPoint.plotX + chart.plotLeft, y: currentPoint.plotY + chart.plotTop };

    } else { // Comportement du mode libre
      p1_pix = { x: startInfo.chartX, y: startInfo.chartY };
      p2_pix = { x: currentX, y: currentY };
    }
    
    const tempElements = [];
    tempElements.push(chart.renderer.path(['M', p1_pix.x, p1_pix.y, 'L', p2_pix.x, p2_pix.y])
      .attr({ 'stroke-width': 2, stroke: 'rgba(220, 53, 69, 0.7)', 'stroke-dasharray': '5,5', zIndex: 10 }).add());
    tempElements.push(...this._drawEndpoint(p1_pix.x, p1_pix.y), ...this._drawEndpoint(p2_pix.x, p2_pix.y));
    const deltaLineAttr = { 'stroke-width': 1, stroke: 'rgba(0, 123, 255, 0.7)', 'stroke-dasharray': '4,4', zIndex: 9 };
    tempElements.push(chart.renderer.path(['M', p1_pix.x, p1_pix.y, 'L', p2_pix.x, p1_pix.y]).attr(deltaLineAttr).add());
    tempElements.push(chart.renderer.path(['M', p2_pix.x, p1_pix.y, 'L', p2_pix.x, p2_pix.y]).attr(deltaLineAttr).add());

    this.tempAnnotation = tempElements;
  }

  handleMouseUp(e) {
    // Nettoyer les écouteurs globaux
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);

    if (!this.isDragging) return;
    this.isDragging = false;

    // Effacer la dernière annotation temporaire
    if (this.tempAnnotation) {
      this.tempAnnotation.forEach(item => { item.destroy() });
      this.tempAnnotation = null;
    }

    const chart = this.chart;
    const pos = chart.pointer.getChartPosition();
    const endX = e.pageX - pos.left;
    const endY = e.pageY - pos.top;
    const { chartX: startX, chartY: startY, time: startTime, snappedPoint: startSnappedPoint } = this.mouseDownInfo;
    const distance = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
    const duration = Date.now() - startTime;

    if (distance < 5 && duration < 300) { // C'est un clic
      let xValue, yValue;

      if (this.crosshairMode === 'model' && this.snappedModelPoint) {
        xValue = this.snappedModelPoint.x;
        yValue = this.snappedModelPoint.y;
        this.data.annotations.push({ id: Highcharts.uniqueKey(), type: 'point', x: xValue, y: yValue });

      } else if (this.crosshairMode === 'data' && this.snappedDataPoint) {
        xValue = this.snappedDataPoint.x;
        yValue = this.snappedDataPoint.y;
        this.data.annotations.push({ id: Highcharts.uniqueKey(), type: 'point', x: xValue, y: yValue });

      } else if (this.crosshairMode === 'tangent') {
        const point = this._findNearestPoint({ chartX: endX, chartY: endY });
        if (point) {
          const slope = this._calculateSlope(point);
          if (slope !== null) {
            // Cette partie est correcte et crée UNIQUEMENT la tangente
            this.data.annotations.push({
              id: Highcharts.uniqueKey(),
              type: 'tangent',
              point: { x: point.x, y: point.y },
              slope: slope
            });
          }
        }
      } else { // Réticule libre
        xValue = chart.xAxis[0].toValue(endX);
        yValue = chart.yAxis[0].toValue(endY);
        this.data.annotations.push({ id: Highcharts.uniqueKey(), type: 'point', x: xValue, y: yValue });
      }
      
    } else { // C'est un glisser-déposer
      let p1, p2;
      
      if (this.crosshairMode === 'data') {
        if (!startSnappedPoint) return;
        p1 = startSnappedPoint;
        const dataSeries = chart.series.filter(s => !s.options.id?.startsWith('model-'));
        const endPoint = chart.pointer.findNearestKDPoint(dataSeries, true, { chartX: endX, chartY: endY });
        if (!endPoint) return;
        p2 = { x: endPoint.x, y: endPoint.y };

      } else if (this.crosshairMode === 'model') {
        if (!startSnappedPoint) return;
        p1 = startSnappedPoint;
        const endPoint = this._findNearestModelPoint({ chartX: endX, chartY: endY });
        if (!endPoint) return;
        p2 = { x: endPoint.x, y: endPoint.y };

      } else if (this.crosshairMode === 'free') {
        p1 = { x: chart.xAxis[0].toValue(startX), y: chart.yAxis[0].toValue(startY) };
        p2 = { x: chart.xAxis[0].toValue(endX), y: chart.yAxis[0].toValue(endY) };
      }

      if (p1 && p2) {
        this.data.annotations.push({
          id: Highcharts.uniqueKey(), type: 'segment', points: [p1, p2]
        });
      }
    }

    if (this.uiManager) {
      this.uiManager.updateClearAnnotationsButtonVisibility();
    }

    this.mouseDownInfo = null;
    chart.redraw();
  }

  /**
   * Trouve le point le plus proche de la souris sur n'importe quelle série (donnée ou modèle).
   * @private
   */
  _findNearestPoint(event) {
    const chart = this.chart;
    // On cherche dans toutes les séries visibles qui ne sont pas des annotations
    const searchableSeries = chart.series.filter(s => s.visible && s.type !== 'spline');
    
    // Utilise la méthode Highcharts pour trouver le point le plus proche
    const point = chart.pointer.findNearestKDPoint(searchableSeries, false, event);
    
    console.log(point);
    return point;
  }

  /**
   * Calcule la pente (dérivée) en un point d'une série.
   * @private
   */
  _calculateSlope(point) {
    const series = point.series;
    // On utilise series.options.data qui contient TOUJOURS les données originales
    const data = series.options.data; 
    const n = data.length;

    if (n < 2) return null;

    // On vérifie si les données sont au format [x,y] ou {x,y}
    const isArrayData = Array.isArray(data[0]);

    // On cherche l'index du point manuellement, car point.index n'est pas fiable
    const index = data.findIndex(p => {
        if (isArrayData) {
            return p[0] === point.x && p[1] === point.y;
        } else {
            return p.x === point.x && p.y === point.y;
        }
    });

    // Si on ne trouve pas le point, on ne peut rien faire
    if (index === -1) {
      return null;
    }

    // Fonction pour s'assurer qu'on a un objet {x, y}
    const getPointObject = (p) => {
        if (!p) return null;
        if (isArrayData) return { x: p[0], y: p[1] };
        return p;
    };

    const p_minus_1 = getPointObject(index > 0 ? data[index - 1] : null);
    const p_plus_1 = getPointObject(index < n - 1 ? data[index + 1] : null);
    const current_point = getPointObject(data[index]);

    // Différence centrale (plus précis)
    if (p_minus_1 && p_plus_1) {
      const dx = p_plus_1.x - p_minus_1.x;
      return dx === 0 ? null : (p_plus_1.y - p_minus_1.y) / dx;
    }
    // Différence avant (pour le premier point)
    else if (p_plus_1) {
      const dx = p_plus_1.x - current_point.x;
      return dx === 0 ? null : (p_plus_1.y - current_point.y) / dx;
    }
    // Différence arrière (pour le dernier point)
    else if (p_minus_1) {
      const dx = current_point.x - p_minus_1.x;
      return dx === 0 ? null : (current_point.y - p_minus_1.y) / dx;
    }
    
    return null;
  }

  /**
   * Dessine le réticule, la tangente et le label de la pente.
   */
  drawTangent(event) {
    this.hideFreeCrosshair();

    const chart = this.chart;
    const point = this._findNearestPoint(event);
    if (!point) return;

    const slope = this._calculateSlope(point);
    if (slope === null) return;

    // 1. Dessiner le réticule au point de tangence
    const pixelX = point.plotX + chart.plotLeft;
    const pixelY = point.plotY + chart.plotTop;
    const crosshairElements = this._drawStyledCrosshair(pixelX, pixelY, point.x, point.y);

    // 2. Calculer et dessiner la ligne de tangente
    const { min: xMin, max: xMax } = chart.xAxis[0].getExtremes();
    const yAtMin = slope * (xMin - point.x) + point.y;
    const yAtMax = slope * (xMax - point.x) + point.y;

    const p1 = { x: chart.xAxis[0].toPixels(xMin), y: chart.yAxis[0].toPixels(yAtMin) };
    const p2 = { x: chart.xAxis[0].toPixels(xMax), y: chart.yAxis[0].toPixels(yAtMax) };

    const tangentLine = chart.renderer.path(['M', p1.x, p1.y, 'L', p2.x, p2.y])
      .attr({ 'stroke-width': 2, stroke: 'rgba(0, 200, 100, 0.8)', zIndex: 4 }).add();

    // 3. Dessiner le label de la pente
    const slopeText = `pente = ${formatNumber(slope, this.data.settings.significantDigits)}`;
    const slopeLabel = chart.renderer.label(slopeText, 0, 0, 'callout')
      .attr({ fill: 'white', stroke: '#dbdbdb', 'stroke-width': 1, r: 6, padding: 8, zIndex: 6 })
      .css({ color: 'black', fontSize: '14px' })
      .add();

    const labelBBox = slopeLabel.getBBox();
    const labelX = pixelX + 15 > chart.plotWidth + chart.plotLeft - labelBBox.width ? pixelX - 15 - labelBBox.width : pixelX + 15;
    let labelY;
    if (slope > 0) {
        labelY = pixelY + 15;
    } else {
        labelY = pixelY - 15 - labelBBox.height;
    }
    if (labelY < chart.plotTop) {
        labelY = pixelY + 15;
    }
    if (labelY + labelBBox.height > chart.plotTop + chart.plotHeight) {
        labelY = pixelY - 15 - labelBBox.height;
    }    

    slopeLabel.translate(labelX, labelY);

    // 4. Stocker tous les éléments pour le nettoyage
    this.freeCrosshair = { ...crosshairElements, tangentLine, slopeLabel };
  }
}

export {Grapher};