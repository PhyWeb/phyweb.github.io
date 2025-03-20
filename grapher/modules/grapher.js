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

    console.log("Grapher constructor");
    this.currentXCurve = this.data.curves[0] ? this.data.curves[0].title : null;
    this.currentYCurves = this.data.curves[1] ? [this.data.curves[1].title] : [null];
  }

  formatData(_xCurve, _yCurve){
    let length = lengthOfTheLongestTable([_xCurve, _yCurve]);
    let data = []
    for(let i = 0; i < length; i++){
      data.push([_xCurve[i], _yCurve[i]]);
    }
    return data;
  }

  newChart(){

    this.chart = Highcharts.chart("chart", {
      chart: {
          type: "line"
      },
      title: {
        text: null
      },
      credits: {
        enabled: false
      }/*,
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
      }]*/
    });
  }

  updateChart(_xCurve = null, _yCurve = null){
    console.log("updateChart");

    this.currentXCurve = _xCurve.title;
    this.currentYCurves = [_yCurve.title];


    if(!this.data.getCurveByTitle(this.currentXCurve)){
      if(this.data.curves.length > 0){
        this.currentXCurve = this.data.curves[0].title;
      } else{
        this.currentXCurve = null;
      }
    }
    if(!this.data.getCurveByTitle(this.currentYCurves[0])){
      if(this.data.curves.length > 0){
        this.currentYCurves[0] = this.data.curves[0].title;
      } else {
        this.currentYCurves[0] = null;
      }
    };

    let data=[];

    if(this.currentXCurve && this.currentYCurves[0]){
      data = this.formatData(this.data.getCurveByTitle(this.currentXCurve), this.data.getCurveByTitle(this.currentYCurves[0]))
    }

    this.chart.update({
      xAxis: {
        title: {
          text: this.currentXCurve ? this.currentXCurve + " (" + this.data.getCurveByTitle(this.currentXCurve).unit + ")" : ""
      }
      },
      yAxis: {
        title: {
            text: this.currentYCurves[0] ? this.currentYCurves[0] + " (" + this.data.getCurveByTitle(this.currentYCurves[0]).unit + ")" : ""
        }
      },
      series: [{
        name: this.currentYCurves[0] ? this.currentYCurves[0] + " (" + this.data.getCurveByTitle(this.currentYCurves[0]).unit + ")" : "",
        data: data
    }]
    });
  }

}

export {Grapher};