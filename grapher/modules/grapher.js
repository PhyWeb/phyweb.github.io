import Chart from '../lib/Highcharts/es-modules/masters/highcharts.src.js';

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
            $("#zoom-button").click();
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
      series: []
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
    this.chart.series.forEach(element => {
      element.remove();
    });

    this.currentXCurve = null;
  }

  updateChart(yCurveTitles){
    if(this.currentXCurve && yCurveTitles){
      // remove all unchecked curve
      let curvesToRemove = []
      this.chart.series.forEach(element => {
        if(!yCurveTitles.includes(element.name)){
          curvesToRemove.push(element);
        }
      });

      curvesToRemove.forEach(element => {
        element.remove();
      });
    
      // add all checked curve
      yCurveTitles.forEach(title => {
        let curve = this.data.getCurveByTitle(title);
        if (!curve) {
          console.warn(`Curve with title "${title}" not found in data.`);
          return; // Skip if curve data is missing
        }
        if(!this.chart.series.find(e => e.name === title)){
          this.chart.addSeries({
            name: title,
            data: this.formatData(this.data.getCurveByTitle(this.currentXCurve), curve),
            color: curve.color,
            lineWidth: curve.line ? curve.lineWidth : 0, // 0 if the curve is not a line
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
      });
    } else {
      let options = {};

      // At least X and one Y curve is needed to update the chart
      if(this.currentXCurve && this.chart.series[0]){
        // Prepare all Y series
        let series = [];
        this.chart.series.forEach((serie , i) => {
          let data = this.formatData(this.data.getCurveByTitle(this.currentXCurve), this.data.getCurveByTitle(serie.name));

          /*series[i] = {
            name: serie.name,
            data: data
          }*/
         serie.setData(data);
        });

        options = {
          xAxis: {
            title: {
              text: this.currentXCurve + " (" + this.data.getCurveByTitle(this.currentXCurve).unit + ")"
          }
          },
          yAxis: {
            title: {
                text: this.chart.series[0].name + " (" + this.data.getCurveByTitle(this.chart.series[0].name).unit + ")"
            }
          },
          series: series
        }
      } else {
        options = {
          xAxis: {
            title: {
              text: ""
          }
          },
          yAxis: {
            title: {
                text: ""
            }
          },
          series: [{
            name: "",
            data: null
          }]
        }

        this.chart.update(options);
      }

      

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
}

export {Grapher};