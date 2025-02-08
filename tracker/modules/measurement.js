import {downloadFile, exportToCSV, exportToRW3} from "../../common/common.js"

const $ = document.querySelector.bind(document);

Number.prototype.round = function(n) {
  const d = Math.pow(10, n);
  return Math.round((this + Number.EPSILON) * d) / d;
}

function isNumber(str) {
  return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
  !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

class SERIE {
  constructor(_title = ""){
    this.title = _title;
    this.data = []
  }

  init(_size, _fill){
    for(let i = 0; i < _size; i++){
      this.data[i] = _fill;
    }
  }

  get(_index, _origin, _scale){
    if(this.data[_index] === ""){
      return "";
    }
    let value = (this.data[_index] - _origin) * _scale
    return value;
  }

}
/*----------------------------------------------------------------------------------------------
--------------------------------------------MEASUREMENT------------------------------------------
----------------------------------------------------------------------------------------------*/
export default class MEASUREMENT {
  constructor() {
    this.tableHead = $("#table-head");
    this.tableBody = $("#table-body");
    this.series = [];

    this.origin = {
      type: "topright",
      x: 0,
      y: 1
    }

    this.scaleSegment = {
      x1 : null,
      y1 : null,
      x2 : null,
      y2 : null
    }

    this.originFrame = 0;
    this.scale = {
      value : 1,
      getOrientedScaleX : () =>{
        return this.origin.type === "topright" || "downright" ? this.scale.value : - this.scale.value;
      },
      getOrientedScaleY : () =>{
        return this.origin.type === "topright" || "topleft" ? - this.scale.value : this.scale.value;
      }
    };
    this.maxDecimals = 4;
  }   

  init(_decodedVideo, player){
    // Inits
    this.series = [];
    this.origin = {
      type: "topright",
      x: 0,
      y: 1
    }
    this.scaleSegment = {
      x1 : null,
      y1 : null,
      x2 : null,
      y2 : null
    }
    
    $("#ppf-input").value = 1;

    this.scale.value = 1;
    $("#scale-input").value = 1;

    this.series.push(new SERIE("t (s)"));
    this.series.push(new SERIE("x (m)"));
    this.series.push(new SERIE("y (m)"));

    _decodedVideo.frames.forEach((value,i)=>{
      this.series[0].data[i] = (_decodedVideo.duration / _decodedVideo.frames.length) * i,
      this.series[1].data[i] = "";
      this.series[2].data[i] = "";

      // TODO prendre en compte ppf des l'init ?
    });

    this.originFrame = 0;
    $("#origin-frame-input").max = this.series[0].length;
    $("#origin-frame-input").value = 1;

    this.buildTable(player);

  }

  buildTable(player){
    let ppf = (this.series.length - 1) / 2;
    this.tableHead.innerHTML="";
    this.tableBody.innerHTML="";

    let titleRow = document.createElement('tr');
    let cell = document.createElement('th');
    cell.innerHTML = "n°"
    cell.classList.add("has-text-centered");
    titleRow.appendChild(cell);
    let cell2 = document.createElement('th');
    cell2.innerHTML = "t (s)"
    cell2.classList.add("has-text-centered");
    titleRow.appendChild(cell2);
    for(let i = 1; i < ppf + 1; i++){
      let cellx = document.createElement('th');
      cellx.classList.add("has-text-centered");
      cellx.innerHTML = ppf > 1 ? "x" + i + " (m)" : "x" + " (m)";
      let celly = document.createElement('th');
      celly.classList.add("has-text-centered");
      celly.innerHTML = ppf > 1 ? "y" + i + " (m)" : "y" + " (m)";
      titleRow.appendChild(cellx);
      titleRow.appendChild(celly);
    }

    this.tableHead.appendChild(titleRow);

    this.series[0].data.forEach((value,i)=>{
      let row = document.createElement('tr');

      // image index column
      let cell = document.createElement('td');
      let label = document.createElement('label');
      label.innerHTML = i + 1;
      cell.appendChild(label);
      row.appendChild(cell);

      // t column
      let tcell = document.createElement('td');
      let tlabel = document.createElement('label');
      tlabel.id = "t" + i;
      tlabel.innerHTML = Math.round(this.series[0].data[i]) / 1000;
      tcell.appendChild(tlabel);
      row.appendChild(tcell)

      // x&y columns
      for(let j = 1; j < ppf + 1; j++){
        let xcell = document.createElement('td');
        let xlabel = document.createElement('label');
        xlabel.id = "x" + j + i;
        xcell.appendChild(xlabel);
        row.appendChild(xcell)

        let ycell = document.createElement('td');
        let ylabel = document.createElement('label');
        ylabel.id = "y" + j + i;
        ycell.appendChild(ylabel);
        row.appendChild(ycell);
      }

      row.id = "row" + i;

      row.onclick = (e) =>{
        this.selectRow(e.currentTarget.id.replace("row",""));
        player.setFrame(parseInt(e.currentTarget.id.replace("row","")));
      }

      this.tableBody.appendChild(row);
    });
  }

  selectRow(index){
    console.log("selectrow todo")
    const previouslySelectedRow = $("tr.is-selected");
    if (previouslySelectedRow) {
      previouslySelectedRow.classList.remove("is-selected");
    }

    $("#row"+index).classList.add("is-selected");
  }

  clearRow(index){
    for(let i = 1; i < this.series.length; i++){
      this.series[i].data[index] = "";
    }
    this.updateTable();
  }

  clearTable(){
    for(let i = 0; i < this.series[0].length; i++){
      this.clearRow(i);
    }
  }

  setPointPerFrame(ppf, player){
    let currentPpf = (this.series.length - 1) / 2;
    if(ppf === currentPpf){
      return;
    }

    // create new series if ppf increases
    if(ppf > currentPpf){
      for(let i = currentPpf; i < ppf; i++){
        let xSerie = new SERIE();
        let ySerie = new SERIE();
        xSerie.init(this.series[0].length, "");
        ySerie.init(this.series[0].length, "");
        this.series.push(xSerie);
        this.series.push(ySerie);
      }
    }
    // schrink the data if ppf decreases
    if(ppf < currentPpf){
      this.series.splice(ppf * 2 + 1);
    }

    // Rename series
    for(let i = 1; i < this.series.length; i+=2){
      this.series[i].title = this.series.length > 3 ? "x" + i + " (m)" : "x (m)";
      this.series[i+1].title = this.series.length > 3 ? "y" + i + " (m)" : "y (m)";
    }

    // update the table
    this.buildTable(player);
    this.updateTable();
  }

  changeValue(frameIndex, pointIndex, x, y){
    this.series[(pointIndex * 2) + 1].data[frameIndex] = x;
    this.series[(pointIndex * 2) + 2].data[frameIndex] = y;
    this.updateTable();
  }

  setOriginFrame(_id){
    this.originFrame = _id;
    this.updateTable();
  }

  updateScale(){
    this.scale.value = 1;
    if(this.scaleSegment.x1 != null && this.scaleSegment.x2 != null && this.scaleSegment.y1 != null && this.scaleSegment.y2 != null){
      if(isNumber($("#scale-input").value) == true){
        this.scale.value = $("#scale-input").value / Math.sqrt(Math.pow(this.scaleSegment.x2 - this.scaleSegment.x1 , 2) + Math.pow(this.scaleSegment.y2 - this.scaleSegment.y1 , 2));
      }
    }
  }

  updateTable(){
    let ppf = (this.series.length - 1) / 2;
    this.updateScale()

    for(let i = 0; i < this.tableBody.children.length; i++){
      // update t values
      if(i < this.originFrame){
        $("#" + "t" + i).innerHTML = "";
      } else{
        $("#" + "t" + i).innerHTML = Math.round(this.series[0].data[i] - this.series[0].data[this.originFrame]) / 1000;
      }

      // update x and y values
      if(i < this.originFrame){
        for(let j = 1; j < ppf + 1; j++){
          $("#" + "x" + j + i).innerHTML = "";
          $("#" + "y" + j + i).innerHTML = "";
        } 
      } else{
        for(let j = 1; j < ppf + 1; j++){
          $("#" + "x" + j + i).innerHTML = this.series[((j - 1) * 2) + 1].data[i] === "" ? "" : this.series[((j - 1) * 2) + 1].get(i, this.origin.x, this.scale.getOrientedScaleX()).round(this.maxDecimals);
          $("#" + "y" + j + i).innerHTML = this.series[((j - 1) * 2) + 2].data[i] === "" ? "" : this.series[((j - 1) * 2) + 2].get(i, this.origin.y, this.scale.getOrientedScaleY()).round(this.maxDecimals);
        }
      }
    }
  }

  downloadData(_type, _name){
    this.updateScale()

    let series = []

    let tSerie = {
      name: "t",
      unit: "s",
      values: []
    }
    for(let i = this.originFrame; i < this.data.length; i++){
      tSerie.values[i] = (this.data[i].t - this.data[this.originFrame].t) / 1000;
    }
    series.push(tSerie);

    for(let i = 1; i < this.pointsPerFrame + 1; i++){
      let xSerie = {
        name: this.pointsPerFrame > 1 ? "x" + i : "x",
        unit: "m",
        values: []
      }
      let ySerie = {
        name: this.pointsPerFrame > 1 ? "y" + i : "y",
        unit: "m",
        values: []
      }
      for(let j = this.originFrame; j < this.data.length; j++){
        xSerie.values[j] = this.scalex(this.data[j].xs[i-1]);
        ySerie.values[j] = this.scaley(this.data[j].ys[i-1]);
      }
      series.push(xSerie);
      series.push(ySerie);
    }

    let file;
    if(_type === "csv"){
      file = exportToCSV(series, true);
    }
    if(_type === "rw3"){
      file = exportToRW3(series, true, "Pointage PhyWeb Tracker");
    }
    downloadFile(file, _type, _name)
  }
}