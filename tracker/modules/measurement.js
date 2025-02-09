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

/*----------------------------------------------------------------------------------------------
--------------------------------------------SERIE CLASS-----------------------------------------
----------------------------------------------------------------------------------------------*/
class Serie extends Array {
  constructor(_title = "", _unit = ""){
    super();
    this.title = _title;
    this.unit = _unit;
  }

  init(_size, _fill){
    for(let i = 0; i < _size; i++){
      this[i] = _fill;
    }
  }

  get(_index, _origin, _scale){
    if(this[_index] === ""){
      return "";
    }
    let value = (this[_index] - _origin) * _scale
    return value;
  }
}
/*----------------------------------------------------------------------------------------------
--------------------------------------------MEASUREMENT-----------------------------------------
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
        let scale = this.origin.type === "topright" || this.origin.type === "downright" ? this.scale.value : 0 - this.scale.value;
        return scale;
      },
      getOrientedScaleY : () =>{
        return this.origin.type === "topright" || this.origin.type === "topleft" ? 0- this.scale.value : this.scale.value;
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

    this.series.push(new Serie("t","s"));
    this.series.push(new Serie("x", "m"));
    this.series.push(new Serie("y", "m"));

    _decodedVideo.frames.forEach((value,i)=>{
      this.series[0][i] = (_decodedVideo.duration / _decodedVideo.frames.length) * i / 1000,
      this.series[1][i] = "";
      this.series[2][i] = "";
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

    this.series[0].forEach((value,i)=>{
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
      tlabel.innerHTML = this.series[0][i].round(3);
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
    const previouslySelectedRow = $("tr.is-selected");
    if (previouslySelectedRow) {
      previouslySelectedRow.classList.remove("is-selected");
    }

    $("#row"+index).classList.add("is-selected");
  }

  clearRow(index){
    for(let i = 1; i < this.series.length; i++){
      this.series[i][index] = "";
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
        let xSerie = new Serie("x","m");
        let ySerie = new Serie("y","m");
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
    for(let i = 1; i < ppf + 1; i++){
      this.series[(i-1)*2+1].title = this.series.length > 3 ? "x" + i : "x";
      this.series[(i-1)*2+2].title = this.series.length > 3 ? "y" + i: "y";
    }

    // update the table
    this.buildTable(player);
    this.updateTable();
  }

  changeValue(frameIndex, pointIndex, x, y){
    this.series[(pointIndex * 2) + 1][frameIndex] = x;
    this.series[(pointIndex * 2) + 2][frameIndex] = y;
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
        $("#" + "t" + i).innerHTML = (this.series[0][i] - this.series[0][this.originFrame]).round(3);
      }

      // update x and y values
      const scaleX = this.scale.getOrientedScaleX();
      const scaleY = this.scale.getOrientedScaleY();

      if(i < this.originFrame){
        for(let j = 1; j < ppf + 1; j++){
          $("#" + "x" + j + i).innerHTML = "";
          $("#" + "y" + j + i).innerHTML = "";
        } 
      } else{
        for(let j = 1; j < ppf + 1; j++){
          $("#" + "x" + j + i).innerHTML = this.series[((j - 1) * 2) + 1][i] === "" ? "" : this.series[((j - 1) * 2) + 1].get(i, this.origin.x, scaleX).round(this.maxDecimals);
          $("#" + "y" + j + i).innerHTML = this.series[((j - 1) * 2) + 2][i] === "" ? "" : this.series[((j - 1) * 2) + 2].get(i, this.origin.y, scaleY).round(this.maxDecimals);
        }
      }
    }
  }

  downloadData(_type, _name){
    this.updateScale()

    let series = structuredClone(this.series);
    console.log(series)

    const scaleX = this.scale.getOrientedScaleX();
    const scaleY = this.scale.getOrientedScaleY();
    
    for(let i = 0; i < this.series[0].length; i++){
      // t values
      if(i < this.originFrame){
        series[0][i] = "";
      } else{
        series[0][i] = this.series[0][i] - this.series[0][this.originFrame];
      }

      // x and y values
      for(let j = 1; j < (this.series.length - 1) / 2 + 1; j++){
        series[((j - 1) * 2) + 1][i] = this.series[((j - 1) * 2) + 1].get(i, this.origin.x, scaleX);
        series[((j - 1) * 2) + 2][i] = this.series[((j - 1) * 2) + 2].get(i, this.origin.y, scaleY);
      }
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