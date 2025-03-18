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

    this.currentXCurve = this.data.curves[0].title;
    this.currentYCurves = [this.data.curves[1].title];
  }

  formatData(_xCurve, _yCurve){
    let length = lengthOfTheLongestTable([_xCurve, _yCurve]);
    let data = []
    for(let i = 0; i < length; i++){
      data.push([_xCurve[i], _yCurve[i]]);
    }
    return data;
  }

  newChart(_xCurve, _yCurve){
    this.currentXCurve = _xCurve.title;
    this.currentYCurves = [_yCurve.title];

    let data = this.formatData(_xCurve, _yCurve)
    this.chart = Highcharts.chart("chart", {
      chart: {
          type: "line"
      },
      credits: {
        enabled: false
      },
      xAxis: {
        title: {
          text: _xCurve.title + " (" + _xCurve.unit + ")"
      }
      },
      yAxis: {
        title: {
            text: _yCurve.title + " (" + _yCurve.unit + ")"
        }
      },
      series: [{
          name: _yCurve.title + " (" + _yCurve.unit + ")",
          data: data
      }]
    });
  }

  updateChart(){
    console.log(this.data)
    console.log("updateChart");

    let data = this.formatData(this.data.getCurveByTitle(this.currentXCurve), this.data.getCurveByTitle(this.currentYCurves[0]))

    console.log(data)

    this.chart.update({
      xAxis: {
        title: {
          text: this.currentXCurve + " (" + this.data.getCurveByTitle(this.currentXCurve).unit + ")"
      }
      },
      yAxis: {
        title: {
            text: this.currentYCurves[0] + " (" + this.data.getCurveByTitle(this.currentYCurves[0]).unit + ")"
        }
      },
      series: [{
        name: this.currentYCurves[0] + " (" + this.data.getCurveByTitle(this.currentYCurves[0]).unit + ")",
        data: data
    }]
    });
  }

}

export {Grapher};