import {Serie} from "../../common/common.js"

const $ = document.querySelector.bind(document);

class Curve extends Serie {
  constructor(_title, _unit) {
    super(_title, _unit);
  }
}

/*----------------------------------------------------------------------------------------------
------------------------------------------------Data--------------------------------------------
----------------------------------------------------------------------------------------------*/
export default class Data {
  constructor() {
    this.curves = [];
  }   

  addCurve(_title, _unit, _size, _fill){
    let curve = new Curve(_title, _unit);

    if(_size !== undefined){
      curve.init(_size, _fill);
    } else{
      curve.init(1, "");
    }

    this.curves.push(curve);
  }

  deleteCurve(_title){
    //this.curves = this.curves.filter(curve => curve.title !== _title);
    const index = array.findIndex(objet => objet.name === _title);
    if (index !== -1) {
      array.splice(index, 1);
    }
  }

  getTable(){
    let table = [];

    // Find the biggest curve
    let size = 0;
    this.curves.forEach((curve, i) => {
      if(curve.length > size){
        size = curve.length;
      }
    });

    this.curves.forEach((curve, i) => {
      curve.forEach((value, j) => {
        if(!table[j]){
          table[j] = [];
        }
        table[j][i] = value;
      });
    });

    return table;
  }

  getHeaders(){
    let headers = [];

    this.curves.forEach((curve, i) => {
      headers.push(curve.title + " (" + curve.unit + ")");
    });
    return headers;
  }

  setValue(_curveID, _index, _value){
    this.curves[_curveID][_index] = _value;
  }

  getCurveByTitle(_title){
    return this.curves.find(curve => curve.title === _title);
  }
}

export {Data};