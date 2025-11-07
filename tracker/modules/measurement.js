import {Serie, downloadFile, exportToCSV, exportToRW3} from "../../common/common.js"

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
--------------------------------------------MEASUREMENT-----------------------------------------
----------------------------------------------------------------------------------------------*/
export default class MEASUREMENT {
  constructor() {
    this.tableHead = $("#table-head");
    this.tableBody = $("#table-body");
    this.series = [];

    this.originFrame = 0;

    this.maxDigits = 4;

    this.scale = {
      value : 1,

      scaleSegment : {
        x1 : null,
        y1 : null,
        x2 : null,
        y2 : null
      },

      origin : {
        type: "topright",
        x: 0,
        y: 1
      },

      getOrientedScaleX(){
        let scale = this.origin.type === "topright" || this.origin.type === "downright" ? this.value : 0 - this.value;
        return scale;
      },

      getOrientedScaleY(){
        return this.origin.type === "topright" || this.origin.type === "topleft" ? 0- this.value : this.value;
      },

      init(){
        this.value = 1;
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
      },

      update(){
        this.value = 1;
        if(this.scaleSegment.x1 != null && this.scaleSegment.x2 != null && this.scaleSegment.y1 != null && this.scaleSegment.y2 != null){
          if(isNumber($("#scale-input").value) == true){
            this.value = $("#scale-input").value / Math.sqrt(Math.pow(this.scaleSegment.x2 - this.scaleSegment.x1 , 2) + Math.pow(this.scaleSegment.y2 - this.scaleSegment.y1 , 2));
          }
        }
      }
    }
  }   

  init(_decodedVideo, player){
    // Inits
    this.series = [];

    this.scale.init();
    
    $("#ppf-input").value = 1;
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

  setMaxDigits(_digits){
    if(isNumber(_digits) && _digits >= 0){
      this.maxDigits = parseInt(_digits);
      this.updateTable();
    } else {
      console.error("Invalid max digits value:", _digits);
    }
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

  updateTable(){
    let ppf = (this.series.length - 1) / 2;
    this.scale.update()

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
          $("#" + "x" + j + i).innerHTML = this.series[((j - 1) * 2) + 1][i] === "" ? "" : this.series[((j - 1) * 2) + 1].get(i, this.scale.origin.x, scaleX).round(this.maxDigits);
          $("#" + "y" + j + i).innerHTML = this.series[((j - 1) * 2) + 2][i] === "" ? "" : this.series[((j - 1) * 2) + 2].get(i, this.scale.origin.y, scaleY).round(this.maxDigits);
        }
      }
    }
  }

  downloadData(_type, _name){
    this.scale.update()

    let series = structuredClone(this.series);

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
        series[((j - 1) * 2) + 1][i] = this.series[((j - 1) * 2) + 1].get(i, this.scale.origin.x, scaleX);
        series[((j - 1) * 2) + 2][i] = this.series[((j - 1) * 2) + 2].get(i, this.scale.origin.y, scaleY);
      }
    }

    let file;
    if(_type === "pw"){
      file = exportToPW(series);
    }
    if(_type === "csv"){
      file = exportToCSV(series, true);
    }
    if(_type === "rw3"){
      file = exportToRW3(series, true, "Pointage PhyWeb Tracker");
    }
    downloadFile(file, _type, _name)
  }

  /**
   * Prépare et copie les données de mesure au format TSV dans le presse-papiers.
   * Seules les lignes complètes (contenant une valeur pour chaque série de données x, y) sont exportées.
   */
  exportToClipboard() {
    this.scale.update();

    // Clonage profond pour éviter de modifier les données originales
    const series = structuredClone(this.series);
    const scaleX = this.scale.getOrientedScaleX();
    const scaleY = this.scale.getOrientedScaleY();
    const originFrame = this.originFrame;
    const numPoints = Math.floor((this.series.length - 1) / 2);

    // 1. Déterminer les lignes complètes à conserver
    // Une ligne est complète si TOUTES les séries de données (x, y) ne sont ni null, ni undefined, ni une chaîne vide.
    const rowsToKeep = new Set();
    for (let i = originFrame; i < this.series[0].length; i++) {
      let isRowComplete = true;
      // On vérifie toutes les séries de données (x1, y1, x2, y2, ...), en ignorant la série 'temps' (j=0)
      for (let j = 1; j < this.series.length; j++) {
        const value = this.series[j][i];
        if (value === undefined || value === null || value === '') {
          isRowComplete = false;
          break; // La ligne n'est pas complète, on passe à la suivante
        }
      }
      if (isRowComplete) {
        rowsToKeep.add(i);
      }
    }

    if (rowsToKeep.size === 0) {
      console.warn("Aucune ligne complète à copier.");
      return;
    }

    // 2. Préparation des données formatées (application de l'échelle et de l'origine)
    for (let i = 0; i < this.series[0].length; i++) {
      // Traitement de la colonne temps
      if (i < originFrame) {
        series[0][i] = null;
      } else {
        series[0][i] = this.series[0][i] - this.series[0][originFrame];
      }

      // Traitement des colonnes de coordonnées (x, y)
      for (let j = 1; j < Math.floor(this.series.length / 2) * 2; j += 2) {
        series[j][i] = this.series[j].get(i, this.scale.origin.x, scaleX);
        series[j + 1][i] = this.series[j + 1].get(i, this.scale.origin.y, scaleY);
      }
    }

    // 3. Construction de la chaîne de caractères TSV
    let tsvContent = '';

    // En-têtes
    const headers = series.map(s => `${s.title} (${s.unit})`).join('\t');
    tsvContent += headers + '\n';

    // Lignes de données (uniquement les lignes complètes)
    for (const i of Array.from(rowsToKeep).sort((a, b) => a - b)) {
      const row = series.map(serie => {
        const value = serie[i];
        if (value === null || value === undefined) {
          return '';
        }
        return typeof value === 'number' ? value.round(this.maxDigits) : value;
      }).join('\t');
      tsvContent += row + '\n';
    }

    // 4. Copie dans le presse-papiers
    navigator.clipboard.writeText(tsvContent).then(() => {
      console.log("Données des lignes complètes copiées dans le presse-papiers !");
    }).catch(err => {
      console.error("Erreur lors de la copie dans le presse-papiers : ", err);
    });
  }
}