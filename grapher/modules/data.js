import {Serie} from "../../common/common.js"

const $ = document.querySelector.bind(document);

/*----------------------------------------------------------------------------------------------
------------------------------------------------Data--------------------------------------------
----------------------------------------------------------------------------------------------*/
export default class Data {
  constructor() {
    this.series = [];
  }   

  addSerie(_title, _unit, _size, _fill){
    let serie = new Serie(_title, _unit);

    if(_size !== undefined){
      serie.init(_size, _fill);
    }

    this.series.push(serie);
  }

  getTable(){
    let table = [];

    // Find the biggest serie
    let size = 0;
    this.series.forEach((serie, i) => {
      if(serie.length > size){
        size = serie.length;
      }
    });

    this.series.forEach((serie, i) => {
      serie.forEach((value, j) => {
        if(!table[j]){
          table[j] = [];
        }
        table[j][i] = value;
      });
    });

    console.log("table", table);
    return table;
  }

  getHeaders(){
    let headers = [];

    this.series.forEach((serie, i) => {
      headers.push(serie.title + " (" + serie.unit + ")");
    });
    console.log("headers", headers);
    return headers;
  }

  setValue(_serieID, _index, _value){
    this.series[_serieID][_index] = _value;
  }
}

export {Data};