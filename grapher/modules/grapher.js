import Chart from '../lib/Highcharts/es-modules/masters/highcharts.src.js';
import { formatNumber } from '../../common/formatter.js';

const $ = document.querySelector.bind(document);

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

// Prevent legend click ------------------------------------------------------------------------
function legendClickCB(e){
  // TODO ouvrir le menu de la courbe
  return false; // Prevent default action (hide/show series)
}

/*----------------------------------------------------------------------------------------------
----------------------------------------------Grapher-------------------------------------------
----------------------------------------------------------------------------------------------*/
export default class Grapher {
  constructor(data) {
    this.data = data;
    this.chart;

    this.grid = true; // Default value for grid visibility

    this.currentXCurve = null;

    // Pour le réticule libre manuel
    this.crosshairMode = 'data'; // Mode par défaut
    this.freeCrosshair = null;   // Pour stocker les éléments du réticule
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

    this.chart = Highcharts.chart("chart", {
      chart: {
        type: "line",
        events: {
          load : function () {
            const chart = this;

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

              // Mesure la largeur du texte
              const tempText = chart.renderer.text(self.currentXCurve, 0, 0).css({
                fontSize: '16px'
              }).add();
              const textWidth = tempText.getBBox().width;
              tempText.destroy();

              // Texte pour axe X
              const labelX = chart.renderer.text(self.currentXCurve, xEnd - textWidth - 5, yPos + 20)
                .css({
                  color: 'black',
                  fontSize: '16px'
                })
                .add();
              chart.customArrows.push(labelX);

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

            // Re-dessiner à chaque redraw (resize, zoom, etc.)
            Highcharts.addEvent(chart, 'redraw', drawArrows);
          },
          selection: (e) => {
            // Prevent default button
            this.resetZoomButton && this.resetZoomButton.hide();
            // Add custom zoom button
            $("#auto-zoom-button").classList.remove("is-hidden");
          }
        }
      },
      legend: {
        itemStyle: {
          fontSize: '16px',
          color: '#000000'
        },
        layout: 'horizontal',
        align: 'left',
        verticalAlign: 'top',
        x: 0,
        y: -10,
        events: {
          itemClick: legendClickCB
        }
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
      xAxis: {
        title: {
          text: null
        },
        gridLineWidth: 1
      },
      yAxis: {
        title: {
          text: null
        },
        lineWidth: 1,
        gridLineWidth: 1,
      },
      credits: {
        enabled: false
      },
      plotOptions: {
        series: {
          stickyTracking: false,
          states: {
            hover: {
              enabled: false,
              lineWidthPlus: 0 
            }
          }
        }
      },
      series: []
    });

    // Set the custom grapher instance for tooltip formatting
    this.chart.options.customGrapherInstance = this;

    this.chart.container.addEventListener('mousemove', (e) => {
      if (this.crosshairMode !== 'free') return;

      const chartPosition = this.chart.pointer.getChartPosition();
      const chartX = e.pageX - chartPosition.left;
      const chartY = e.pageY - chartPosition.top;

      this._drawFreeCrosshair({ chartX, chartY });
    });

    Highcharts.addEvent(this.chart.container, 'mouseleave', () => {
      this._hideFreeCrosshair(); // On cache toujours quand la souris sort
    });
  }

  setXCurve(title, redraw = true){
    this.currentXCurve = title;

    if(redraw){
      this.updateChart();
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

  updateChart(yCurveTitles){
    // Cas 1: Mise à jour depuis la modale "Courbes" (on sait quelles courbes afficher)
    if(this.currentXCurve && yCurveTitles){
      // Supprime les séries qui ne sont plus cochées
      let i = this.chart.series.length;
      while (i--) {
        const serie = this.chart.series[i];
        if (yCurveTitles.indexOf(serie.name) === -1) {
            serie.remove();
        }
      }
      
      // Ajoute les nouvelles séries cochées
      yCurveTitles.forEach(title => {
        if (!this.chart.series.some(s => s.name === title)) {
            const curve = this.data.getCurveByTitle(title);
            if (curve) {
                this.chart.addSeries({
                    name: title,
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
                    }
                });
            }
        }
      });
    // Cas 2: Mise à jour générale (après une modification du tableur)
    } else if (this.currentXCurve && this.chart.series.length > 0) {
        this.chart.series.forEach((serie) => {
            const curveData = this.data.getCurveByTitle(serie.name);
            const xCurveData = this.data.getCurveByTitle(this.currentXCurve);
            if (curveData && xCurveData) {
                serie.setData(this.formatData(xCurveData, curveData), true); // true pour redessiner
            }
        });
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
    if (!this.chart) return;
    this.crosshairMode = mode;

    const isDataMode = (mode === 'data');

    this._hideFreeCrosshair();

    // Application de la classe CSS pour forcer le curseur
    if (mode === 'free') {
      this.chart.container.classList.add('chart-free-crosshair');
    } else {
      this.chart.container.classList.remove('chart-free-crosshair');
    }

    // Mise à jour groupée de toutes les options nécessaires
    this.chart.update({
      chart: {
        zooming: {
          type: null
        }
      },
      tooltip: {
        enabled: isDataMode
      },
      plotOptions: {
        series: {
          stickyTracking: false,
          enableMouseTracking: isDataMode,
          states: {
            hover: {
              enabled: isDataMode,
            }
          }
        }
      }
    });
  }

  // MÉTHODE PRIVÉE pour dessiner le réticule manuellement
_drawFreeCrosshair(event) {
  const chart = this.chart;
  if (!chart.pointer) return;

  if (typeof event.chartX === 'undefined' || typeof event.chartY === 'undefined') {
    return; 
  }

  const plotLeft = chart.plotLeft;
  const plotTop = chart.plotTop;
  const plotWidth = chart.plotWidth;
  const plotHeight = chart.plotHeight;

  if (
    event.chartX < plotLeft ||
    event.chartX > plotLeft + plotWidth ||
    event.chartY < plotTop ||
    event.chartY > plotTop + plotHeight
  ) {
    this._hideFreeCrosshair();
    return;
  }

  if (!this.freeCrosshair) {
    this.freeCrosshair = {
      xLine: chart.renderer.path(['M', 0, 0])
        .attr({ 'stroke-width': 1, stroke: 'dimgray', dashstyle: 'shortdot', zIndex: 5 }).add(),
      yLine: chart.renderer.path(['M', 0, 0])
        .attr({ 'stroke-width': 1, stroke: 'dimgray', dashstyle: 'shortdot', zIndex: 5 }).add(),
        xLabel: chart.renderer.label('', 0, 0, 'callout')
          .attr({
            fill: 'white',
            stroke: '#dbdbdb',
            'stroke-width': 1,
            r: 6, // Coins arrondis
            padding: 8,
            zIndex: 6
          })
          .css({ color: 'black', fontSize: '14px' })
          .add(),
        yLabel: chart.renderer.label('', 0, 0, 'callout')
          .attr({
            fill: 'white',
            stroke: '#dbdbdb',
            'stroke-width': 1,
            r: 6,
            padding: 8,
            zIndex: 6
          })
          .css({ color: 'black', fontSize: '14px' })
          .add()
    };
  }

  // Mouvements des lignes
  this.freeCrosshair.xLine.attr({
    d: ['M', event.chartX, plotTop, 'L', event.chartX, plotTop + plotHeight]
  });

  this.freeCrosshair.yLine.attr({
    d: ['M', plotLeft, event.chartY, 'L', plotLeft + plotWidth, event.chartY]
  });

  // Valeurs numériques
  const xValue = chart.xAxis[0].toValue(event.chartX);
  const yValue = chart.yAxis[0].toValue(event.chartY);
  const significantDigits = this.data.settings.significantDigits;

  // --- Label X ---
  this.freeCrosshair.xLabel.attr({ text: formatNumber(xValue, significantDigits) });
  const xLabelBBox = this.freeCrosshair.xLabel.getBBox();
  this.freeCrosshair.xLabel.translate(
    event.chartX - xLabelBBox.width / 2,
    plotTop + plotHeight - xLabelBBox.height - 5
  );

  // --- Label Y ---
  this.freeCrosshair.yLabel.attr({ text: formatNumber(yValue, significantDigits) });
  const yLabelBBox = this.freeCrosshair.yLabel.getBBox();
  this.freeCrosshair.yLabel.translate(
    plotLeft + 5,
    event.chartY - yLabelBBox.height / 2
  );
}

  // MÉTHODE PRIVÉE pour cacher le réticule
  _hideFreeCrosshair() {
    if (this.freeCrosshair) {
      Object.values(this.freeCrosshair).forEach(el => el.destroy());
      this.freeCrosshair = null;
    }
  }
}

export {Grapher};