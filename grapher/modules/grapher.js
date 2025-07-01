import Chart from '../lib/Highcharts/es-modules/masters/highcharts.src.js';

const $ = document.querySelector.bind(document);

function lengthOfTheLongestTable(_tables){
  // Find the biggest curve
  let size = 0;
  _tables.forEach((table, i) => {
    if(table.length > size){
      size = table.length;
    }
  });
  return size;
}

/*----------------------------------------------------------------------------------------------
----------------------------------------------Grapher-------------------------------------------
----------------------------------------------------------------------------------------------*/
export default class Grapher {
  constructor(_data) {
    this.data = _data;
    this.chart;

    this.currentXCurve = null;
  }

  formatData(_xCurve, _yCurve){
    let length = lengthOfTheLongestTable([_xCurve, _yCurve]);
    let data = []
    for(let i = 0; i < length; i++){
      if(_xCurve[i] !== "" && _yCurve[i] !== "" && _xCurve[i] !== undefined && _yCurve[i] !== undefined){
        data.push([_xCurve[i], _yCurve[i]]);
      }
    }
    return data;
  }

  newChart(){

    this.chart = Highcharts.chart("chart", {
      chart: {
          type: "line"
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
      }
      },
      yAxis: {
        title: {
            text: null
        }
      },
      credits: {
        enabled: false
      },
      series: []
    });
  }

  setXCurve(_title, _redraw = true){
    this.currentXCurve = _title;

    if(_redraw){
      this.updateChart();
    }
  }

  deleteCurve(_title){
    this.chart.series.find(e => e.name === _title).remove();

    if(this.currentXCurve === _title){
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

  updateChart(_yCurves){
    if(this.currentXCurve && _yCurves){
      // remove all unchecked curve
      let curvesToRemove = []
      this.chart.series.forEach(element => {
        if(!_yCurves.includes(element.name)){
          curvesToRemove.push(element);
        }
      });

      curvesToRemove.forEach(element => {
        element.remove();
      });
    
      // add all checked curve
      _yCurves.forEach(element => {
        if(!this.chart.series.find(e => e.name === element)){
          this.chart.addSeries({
            name: element,
            data: this.formatData(this.data.getCurveByTitle(this.currentXCurve), this.data.getCurveByTitle(element))
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
}

export {Grapher};