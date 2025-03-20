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
    this.currentYCurves = [];
  }

  formatData(_xCurve, _yCurve){
    let length = lengthOfTheLongestTable([_xCurve, _yCurve]);
    let data = []
    for(let i = 0; i < length; i++){
      data.push([_xCurve[i] === "" ? null : _xCurve[i], _yCurve[i] === "" ? null : _yCurve[i]]);
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
      series: [{
          name: "y",
          data: null
      }]
    });
  }

  setXCurve(_title){
    this.currentXCurve = _title;
    this.updateChart();
  }

  pushYCurve(_title){
    console.log("pushYCurve");
    this.currentYCurves.push(_title);
    console.log(this.currentYCurves)
    this.updateChart(this.currentYCurves);
  }

  updateChart(){
    console.log("updateChart");

    /*this.currentXCurve = _xCurve.title;
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

    let data=[];*/
    console.log(this.currentXCurve, this.currentYCurves[0]);

    let options = {};

    if(this.currentXCurve && this.currentYCurves[0]){
      console.log("ok")
      let data = this.formatData(this.data.getCurveByTitle(this.currentXCurve), this.data.getCurveByTitle(this.currentYCurves[0]))
      console.log(data)
      options = {
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
    }


      // Format the data
      this.chart.update(options);
  }

}

export {Grapher};