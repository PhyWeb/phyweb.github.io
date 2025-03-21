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
      series: [{
          name: "y",
          data: null
      }]
    });
  }

  setXCurve(_title, _redraw = true){
    this.currentXCurve = _title;

    if(_redraw){
      this.updateChart();
    }
  }

  pushYCurve(_title, _redraw = true){
    this.currentYCurves.push(_title);

    if(_redraw){
      this.updateChart();
    }
  }

  deleteYCurve(_title, _redraw = true){
    

    if(_redraw){
      this.updateChart();
    }
  }

  updateChart(_xCurve,yCurves){
    console.log("updateChart");

    // TODO
    let curveChanged = false;

    // remove all unchecked curve
    console.log("series in chart",this.chart.series)
    this.chart.series.forEach(element => {
      if(!yCurves.includes(element)){
        curveChanged = true;
        element.remove();
      }
    });
  
    // add all checked curve
    yCurves.forEach(element => {
      if(this.chart.series.find(e => e.name === element) === undefined){
        curveChanged = true;
        this.chart.addSeries({
          name: element,
          data: this.formatData(_xCurve, this.data.getCurveByTitle(element))
        });
      }
    });


    let options = {};

    if(this.currentXCurve && this.currentYCurves[0]){
      // Prepare all Y series
      let series = [];
      this.currentYCurves.forEach((curve, i) => {
        let data = this.formatData(this.data.getCurveByTitle(this.currentXCurve), this.data.getCurveByTitle(curve));
        series[i] = {
          name: curve + " (" + this.data.getCurveByTitle(curve).unit + ")",
          data: data
        }
      });
      console.log("series",series);

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
          name: "ya",
          data: [[1,1]]
      },
      {
        name: "x",
        data: [[2,2]]
    }]//series
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