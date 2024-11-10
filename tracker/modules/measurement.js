import {exportToCSV} from "../../common/common.js"

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
--------------------------------------------MEASUREMENT------------------------------------------
----------------------------------------------------------------------------------------------*/
export default class MEASUREMENT {
  constructor() {
    this.tableHead = $("#table-head");
    this.tableBody = $("#table-body");
    this.data = [];

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
    this.pointsPerFrame = 1;
    this.scale = 1;
    this.maxDecimals = 4;

  }   

  init(_decodedVideo, player){
    // Inits
    this.data = [];
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
    this.pointsPerFrame = 1;
    this.scale = 1;

    // UI
    /*$("#segmentButton").classList.remove("active");
    $("#topright").classList.add("active");
    $("#topleft").classList.remove("active");
    $("#downright").classList.remove("active");
    $("#downleft").classList.remove("active");*/

    $("#ppf-input").value = 1;

    _decodedVideo.frames.forEach((value,index)=>{
      // create the data object
      let l = [];
      let m = [];

      for(let i = 0; i < this.pointsPerFrame; i++){
        l[i]="";
        m[i]="";
      }

      this.data[index] = {
        t: (_decodedVideo.duration / _decodedVideo.frames.length) * index,
        xs: l,
        ys: m
      }
    });

    $("#origin-frame-input").max = this.data.length;
    $("#origin-frame-input").value = 1;

    this.buildTable(player);

  }

  buildTable(player){
    this.tableHead.innerHTML="";
    this.tableBody.innerHTML="";

    let titleRow = document.createElement('tr');
    let cell = document.createElement('th');
    cell.innerHTML = "t (s)"
    cell.classList.add("has-text-centered");
    titleRow.appendChild(cell);
    for(let i = 1; i < this.pointsPerFrame + 1; i++){
      let cellx = document.createElement('th');
      cellx.classList.add("has-text-centered");
      cellx.innerHTML = this.pointsPerFrame > 1 ? "x" + i + " (m)" : "x" + " (m)";
      let celly = document.createElement('th');
      celly.classList.add("has-text-centered");
      celly.innerHTML = this.pointsPerFrame > 1 ? "y" + i + " (m)" : "y" + " (m)";
      titleRow.appendChild(cellx);
      titleRow.appendChild(celly);
    }

    this.tableHead.appendChild(titleRow);

    this.data.forEach((value,index)=>{
      let row = document.createElement('tr');

      // t column
      let cell = document.createElement('td');
      let label = document.createElement('label');
      label.innerHTML = Math.round(this.data[index].t) / 1000;
      //label.className = "measurementLabel";
      cell.appendChild(label);
      row.appendChild(cell)

      // x&y columns
      for(let i = 1; i < this.pointsPerFrame + 1; i++){
        let xcell = document.createElement('td');
        let xlabel = document.createElement('label');
        //xlabel.className="measurementLabel";
        xlabel.id = "x" + i + index;
        xcell.appendChild(xlabel);
        row.appendChild(xcell)

        let ycell = document.createElement('td');
        let ylabel = document.createElement('label');
        //ylabel.className="measurementLabel";
        ylabel.id = "y" + i + index;
        ycell.appendChild(ylabel);
        row.appendChild(ycell);
      }

      row.id = "row" + index;

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
    for(let i = 0; i < this.data[index].xs.length; i++){
      this.changeValue(index, i, "","");
    }
  }

  clearColumn(){
    // TODO
  }

  clearTable(){
    for(let i = 0; i < this.data.length; i++){
      this.clearRow(i);
    }
  }

  setPointPerFrame(ppf, player){
    if(ppf == this.pointsPerFrame){
      return;
    }
    this.pointsPerFrame = ppf;

    // extend the data if ppf increases
    if(ppf > this.data[0].xs.length){
      for(let i = 0; i< this.data.length; i++){
        for(let j = this.data[i].xs.length ; j < ppf; j++){
          this.data[i].xs[j] = "";
          this.data[i].ys[j] = "";
        }
      }
    }
    // schrink the data if ppf decreases
    if(ppf < this.data[0].xs.length){
      for(let i = 0; i< this.data.length; i++){
        this.data[i].xs.splice(ppf);
        this.data[i].ys.splice(ppf);
      }
    }
    // update the table

    this.buildTable(player);
    this.updateTable();
  }

  changeValue(frameIndex, pointIndex, x, y){
    this.data[frameIndex].xs[pointIndex] = x;
    this.data[frameIndex].ys[pointIndex] = y;

    this.updateTable();
  }

  updateScale(){
    this.scale = 1;
    if(this.scaleSegment.x1 != null && this.scaleSegment.x2 != null && this.scaleSegment.y1 != null && this.scaleSegment.y2 != null){
      if(isNumber($("#scale-input").value) == true){
        this.scale = $("#scale-input").value / Math.sqrt(Math.pow(this.scaleSegment.x2 - this.scaleSegment.x1 , 2) + Math.pow(this.scaleSegment.y2 - this.scaleSegment.y1 , 2));
      }
    }
  }

  updateTable(){
    this.updateScale()
    for(let i = 0; i < this.tableBody.children.length; i++){
      for(let j = 1; j < this.data[i].xs.length + 1; j++){
        if(this.data[i].xs[j - 1] != ""){
          $("#" + "x" + j + i).innerHTML = this.scalex(this.data[i].xs[j - 1]);
        } else {
          $("#" + "x" + j + i).innerHTML = "";
        }
        if(this.data[i].ys[j - 1] != ""){
          $("#" + "y" + j + i).innerHTML = this.scaley(this.data[i].ys[j - 1]);
        } else {
          $("#" + "y" + j + i).innerHTML = "";
        }
      }
    }
  }

  scalex(_x){
    if(_x == ""){
      return "";
    }
    let x = 0;
    switch(this.origin.type){
      case "topright":
        x = (_x - this.origin.x) * this.scale;
        break;
      case "topleft":
        x = - (_x - this.origin.x) * this.scale;
        break;
      case "downright":
        x = (_x - this.origin.x) * this.scale;
        break;
      case "downleft":
        x = - (_x - this.origin.x) * this.scale;
        break;
    }
    return x.round(this.maxDecimals);
  }

  scaley(_y){
    if(_y == ""){
      return "";
    }
    let y = 0;
    switch(this.origin.type){
      case "topright":
        y = - (_y - this.origin.y) * this.scale;
        break;
      case "topleft":
        y = - (_y - this.origin.y) * this.scale;
        break;
      case "downright":
        y = (_y - this.origin.y) * this.scale;
        break;
      case "downleft":
        y = (_y - this.origin.y) * this.scale;
        break;
    }
    return y.round(this.maxDecimals);
  }

  createCSV(){
    this.updateScale()

    let series = []

    let tSerie = {
      name: "t",
      values: []
    }
    for(let i = 0; i < this.data.length; i++){
      tSerie.values[i] = this.data[i].t / 1000;
    }
    series.push(tSerie);

    for(let i = 1; i < this.pointsPerFrame + 1; i++){
      let xSerie = {
        name: "x" + i,
        values: []
      }
      let ySerie = {
        name: "y" + i,
        values: []
      }
      for(let j = 0; j < this.data.length; j++){
        xSerie.values[j] = this.scalex(this.data[j].xs[i-1]);
        ySerie.values[j] = this.scaley(this.data[j].ys[i-1]);
      }
      console.log(xSerie);
      series.push(xSerie);
      series.push(ySerie);
    }

    let csv = exportToCSV(series, true);

    return csv;
  }

  createCSV2(){
    this.updateScale()

    let csv = []
    let row = []

    // titles
    row.push("t");
    for(let i = 1; i < this.pointsPerFrame + 1; i++){
      row.push("x" + i);
      row.push("y" + i);
    }

    csv.push(row.join(","));

    // datas
    for(let j = this.originFrame; j <this.data.length; j++){
      let ro = [];
      ro.push(this.data[j].t / 1000);
      let emptyCount = 0;
      for(let i = 0; i < this.data[j].xs.length; i++){
        if(this.data[j].xs[i] === "" || this.data[j].ys[i] === ""){
          emptyCount++;
        }
        ro.push(this.scalex(this.data[j].xs[i]));
        ro.push(this.scaley(this.data[j].ys[i]));
      }

      if(emptyCount == 0){
        csv.push(ro);
      }
    }

    return csv.join("\n");
  }

  createRW3(){
    let rw3 = []
    rw3.push("EVARISTE REGRESSI WINDOWS 1.0");
    rw3.push("£"+parseInt((this.pointsPerFrame * 2) + 1)+" NOM VAR");
    rw3.push("t");
    for(let i = 1; i < this.pointsPerFrame + 1; i++){
      rw3.push("x" + i);
      rw3.push("y" + i);
    }
    rw3.push("£"+parseInt((this.pointsPerFrame * 2) + 1)+" GENRE VAR");
    for(let i = 0; i < (this.pointsPerFrame * 2) + 1; i++){
      rw3.push("0");
    }
    rw3.push("£"+parseInt((this.pointsPerFrame * 2) + 1)+" UNITE VAR");
    rw3.push("s");
    for(let i = 0; i < this.pointsPerFrame * 2; i++){
      rw3.push("m");
    }
    rw3.push("£3 INCERTITUDE");
    rw3.push("");
    rw3.push("");
    rw3.push("");
    rw3.push("£1 TRIGO");
    rw3.push("0");
    rw3.push("£1 LOG");
    rw3.push("0");
    rw3.push("£1 MEMO GRANDEURS");
    rw3.push("'Pointage PhyWeb Tracker");
    rw3.push("£2 ACQUISITION");
    rw3.push("CLAVIER");
    rw3.push("");
    rw3.push("£0 GRAPHE VAR");
    rw3.push("&5 X");
    rw3.push("x1");
    rw3.push("");
    rw3.push("");
    rw3.push("");
    rw3.push("");
    rw3.push("&5 Y");
    rw3.push("y1");
    rw3.push("");
    rw3.push("");
    rw3.push("");
    rw3.push("");
    rw3.push("&5 MONDE");
    rw3.push("1");
    rw3.push("1");
    rw3.push("1");
    rw3.push("1");
    rw3.push("1");
    rw3.push("&3 GRADUATION");
    rw3.push("0");
    rw3.push("0");
    rw3.push("0");
    rw3.push("&3 ZERO");
    rw3.push("1");
    rw3.push("1");
    rw3.push("1");
    rw3.push("&7 OPTIONS");
    rw3.push("12");
    rw3.push("2");
    rw3.push("1");
    rw3.push("3");
    rw3.push("3");
    rw3.push("0");
    rw3.push("0");
    rw3.push("£1 PAGE COMMENT");
    rw3.push("");
    rw3.push("&96 VALEUR VAR");
    for(let j = this.originFrame; j <this.data.length; j++){
      let ro = [];
      ro.push(this.data[j].t / 1000);
      let emptyCount = 0;
      for(let i = 0; i < this.data[j].xs.length; i++){
        if(this.data[j].xs[i] === "" || this.data[j].ys[i] === ""){
          emptyCount++;
        }
        ro.push(this.scalex(this.data[j].xs[i]));
        ro.push(this.scaley(this.data[j].ys[i]));
      }

      if(emptyCount == 0){
        rw3.push(ro.join(" "));
      }
    }
    rw3.push("&2 OPTIONS");
    rw3.push("1");
    rw3.push("1");
    
    return rw3.join("\n");
  }
}