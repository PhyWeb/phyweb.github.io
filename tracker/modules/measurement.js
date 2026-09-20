import {Serie, downloadFile, exportToPW, exportToCSV, exportToRW3, showToast} from "../../common/common.js"

const $ = document.querySelector.bind(document);

Number.prototype.round = function(n) {
  const d = Math.pow(10, n);
  return Math.round((this + Number.EPSILON) * d) / d;
}

function isNumber(str) {
  const s = typeof str === "string" ? str.trim().replace(",", ".") : str;
  return !isNaN(s) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
  !isNaN(parseFloat(s)) // ...and ensure strings of whitespace fail
}

/*----------------------------------------------------------------------------------------------
--------------------------------------------MEASUREMENT-----------------------------------------
----------------------------------------------------------------------------------------------*/
export default class MEASUREMENT {
  constructor() {
    this.tableHead = $("#table-head");
    this.tableBody = $("#table-body");
    this.series = [];
    this.player = null;

    this.originFrame = 0;
    this.aspectRatio = 1; // Stockage du ratio de la vidéo

    this.maxDigits = 4;

    this.scale = {
      _value : 1,

      get value(){
        return this._value;
      },

      get isCalibrated(){
        return Boolean(this.scaleSegment &&
          this.scaleSegment.x1 != null &&
          this.scaleSegment.y1 != null &&
          this.scaleSegment.x2 != null &&
          this.scaleSegment.y2 != null);
      },

      set value(v){
        if(Number.isFinite(v) && v > 0){
          this._value = v;
        }
      },

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
        // "right" signifie que l'axe X est positif vers la droite
        const val = Number.isFinite(this.value) && this.value > 0 ? this.value : 1;
        let scale = this.origin.type.includes("right") ? val : 0 - val;
        return scale;
      },

      getOrientedScaleY(ratio){
        // "top" signifie que l'axe Y est positif vers le haut.
        // Comme le canvas augmente vers le bas, on inverse le signe.
        // On divise par le ratio pour compenser la normalisation (0 à 1) sur la hauteur.
        const safeRatio = Number.isFinite(ratio) && ratio > 0 ? ratio : 1;
        const val = Number.isFinite(this.value) && this.value > 0 ? this.value : 1;
        let baseScale = this.origin.type.includes("top") ? 0 - val : val;
        return baseScale / safeRatio;
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

      update(ratio, d){
        if(this.scaleSegment.x1 == null || this.scaleSegment.x2 == null || this.scaleSegment.y1 == null || this.scaleSegment.y2 == null){
          this.value = 1;
          return;
        }

        const safeRatio = Number.isFinite(ratio) && ratio > 0 ? ratio : 1;
        // Calcul de la distance réelle en tenant compte du ratio d'aspect
        // On divise la composante Y par le ratio pour ramener les unités à l'échelle de la largeur
        const dx = this.scaleSegment.x2 - this.scaleSegment.x1;
        const dy = (this.scaleSegment.y2 - this.scaleSegment.y1) / safeRatio;
        const dist = Math.hypot(dx, dy);

        // Seuil minimal pour éviter la division par zéro ou une distance quasi-nulle
        const MIN_DIST = 1e-5;
        if(dist <= MIN_DIST){
          // Segment nul ou quasi-nul : invalide, on réinitialise les coordonnées du segment
          this.scaleSegment.x1 = null;
          this.scaleSegment.y1 = null;
          this.scaleSegment.x2 = null;
          this.scaleSegment.y2 = null;
          this.value = 1;
          return;
        }

        const scaleInputElement = $("#scale-input");
        const rawScaleVal = d !== undefined ? d : (scaleInputElement ? scaleInputElement.value : "");
        const cleanScaleVal = typeof rawScaleVal === "string" ? rawScaleVal.trim().replace(",", ".") : rawScaleVal;
        if(isNumber(cleanScaleVal)){
          const scaleInput = typeof cleanScaleVal === "number" ? cleanScaleVal : parseFloat(cleanScaleVal);
          if(Number.isFinite(scaleInput) && scaleInput > 0){
            const calculatedValue = scaleInput / dist;
            if(Number.isFinite(calculatedValue) && calculatedValue > 0){
              this.value = calculatedValue;
            }
          }
        }

        if(!Number.isFinite(this.value) || this.value <= 0){
          this.value = 1;
        }
      }
    }
  }   

  get isCalibrated(){
    return Boolean(this.scale && this.scale.isCalibrated);
  }

  updateUnits(){
    const unit = this.isCalibrated ? "m" : "";
    for(let i = 1; i < this.series.length; i++){
      this.series[i].unit = unit;
    }
  }

  buildTableHead(){
    if(!this.tableHead) return;
    let ppf = (this.series.length - 1) / 2;
    this.tableHead.innerHTML = "";

    const unitSuffix = this.isCalibrated ? " (m)" : "";

    let titleRow = document.createElement('tr');
    let cell = document.createElement('th');
    cell.innerHTML = "n°";
    cell.classList.add("has-text-centered");
    titleRow.appendChild(cell);

    let cell2 = document.createElement('th');
    cell2.innerHTML = "t (s)";
    cell2.classList.add("has-text-centered");
    titleRow.appendChild(cell2);

    for(let i = 1; i < ppf + 1; i++){
      let cellx = document.createElement('th');
      cellx.classList.add("has-text-centered");
      cellx.innerHTML = ppf > 1 ? "x" + i + unitSuffix : "x" + unitSuffix;

      let celly = document.createElement('th');
      celly.classList.add("has-text-centered");
      celly.innerHTML = ppf > 1 ? "y" + i + unitSuffix : "y" + unitSuffix;

      titleRow.appendChild(cellx);
      titleRow.appendChild(celly);
    }

    this.tableHead.appendChild(titleRow);
  }

  init(_decodedVideo, player){
    // Inits
    this.player = player;
    this.series = [];
    
    // Calcul et stockage du ratio d'aspect (Largeur / Hauteur)
    this.aspectRatio = _decodedVideo.width / _decodedVideo.height;

    this.scale.init();
    
    $("#ppf-input").value = 1;
    $("#scale-input").value = 1;

    const unit = this.isCalibrated ? "m" : "";
    this.series.push(new Serie("t","s"));
    this.series.push(new Serie("x", unit));
    this.series.push(new Serie("y", unit));

    _decodedVideo.frames.forEach((value,i)=>{
      this.series[0][i] = (_decodedVideo.timestamps && _decodedVideo.timestamps[i] !== undefined)
        ? _decodedVideo.timestamps[i]
        : (_decodedVideo.duration / _decodedVideo.frames.length) * i / 1000;
      this.series[1][i] = "";
      this.series[2][i] = "";
    });

    this.originFrame = 0;
    $("#origin-frame-input").max = this.series[0].length;
    $("#origin-frame-input").value = 1;

    this.buildTable(player);
  }

  buildTable(player){
    const activePlayer = player || this.player;
    let ppf = (this.series.length - 1) / 2;
    this.buildTableHead();
    this.tableBody.innerHTML="";

    const fragment = document.createDocumentFragment();

    this.series[0].forEach((value,i) => {
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
        if(activePlayer){
          activePlayer.setFrame(parseInt(e.currentTarget.id.replace("row","")));
        }
      }

      fragment.appendChild(row);
    });
    this.tableBody.appendChild(fragment);
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
    if(this.player && (this.player.currentFrame === undefined || this.player.currentFrame === index)){
      this.player.currentPoint = 0;
    }
    this.updateTable();
  }

  // Méthode pour ne mettre à jour qu'une seule ligne
  updateRow(i) {
    let ppf = (this.series.length - 1) / 2;
    const scaleX = this.scale.getOrientedScaleX();
    const scaleY = this.scale.getOrientedScaleY(this.aspectRatio);

    if(i < this.originFrame){
      $("#" + "t" + i).innerHTML = "";
      for(let j = 1; j < ppf + 1; j++){
        $("#" + "x" + j + i).innerHTML = "";
        $("#" + "y" + j + i).innerHTML = "";
      } 
    } else{
      $("#" + "t" + i).innerHTML = (this.series[0][i] - this.series[0][this.originFrame]).round(3);
      for(let j = 1; j < ppf + 1; j++){
        $("#" + "x" + j + i).innerHTML = this.series[((j - 1) * 2) + 1][i] === "" ? "" : this.series[((j - 1) * 2) + 1].get(i, this.scale.origin.x, scaleX).round(this.maxDigits);
        $("#" + "y" + j + i).innerHTML = this.series[((j - 1) * 2) + 2][i] === "" ? "" : this.series[((j - 1) * 2) + 2].get(i, this.scale.origin.y, scaleY).round(this.maxDigits);
      }
    }
  }

  clearTable(){
    // 1. On efface les données en mémoire (boucle très rapide)
    for(let i = 0; i < this.series[0].length; i++){
      for(let j = 1; j < this.series.length; j++){
        this.series[j][i] = "";
      }
    }
    if(this.player){
      this.player.currentPoint = 0;
    }
    
    // 2. On met à jour le tableau HTML une seule fois
    this.updateTable();
  }

  setPointPerFrame(ppf, player){
    if(player){
      this.player = player;
    }
    if(!this.series || this.series.length === 0){
      return;
    }
    let currentPpf = (this.series.length - 1) / 2;
    if(ppf === currentPpf){
      return;
    }

    if(this.player){
      this.player.currentPoint = 0;
    }

    // create new series if ppf increases
    if(ppf > currentPpf){
      const unit = this.isCalibrated ? "m" : "";
      for(let i = currentPpf; i < ppf; i++){
        let xSerie = new Serie("x", unit);
        let ySerie = new Serie("y", unit);
        xSerie.init(this.series[0].length, "");
        ySerie.init(this.series[0].length, "");
        this.series.push(xSerie);
        this.series.push(ySerie);
      }
    }
    // shrink the data if ppf decreases
    if(ppf < currentPpf){
      this.series.splice(ppf * 2 + 1);
    }

    // Rename series
    for(let i = 1; i < ppf + 1; i++){
      this.series[(i-1)*2+1].title = this.series.length > 3 ? "x" + i : "x";
      this.series[(i-1)*2+2].title = this.series.length > 3 ? "y" + i: "y";
    }

    // update the table
    this.buildTable(this.player);
    this.updateTable();
  }

  setMaxDigits(_digits){
    if(isNumber(_digits) && _digits >= 0){
      this.maxDigits = parseInt(_digits);
      this.updateTable();
    } else {
      console.error("Invalid max digits value:", _digits);
      showToast("Valeur invalide pour le nombre de décimales.", "is-warning");
    }
  }

  changeValue(frameIndex, pointIndex, x, y){
    const xIndex = (pointIndex * 2) + 1;
    const yIndex = (pointIndex * 2) + 2;
    if(!this.series || !this.series[xIndex] || !this.series[yIndex]){
      console.warn(`changeValue: index de point ${pointIndex} hors limites pour series.length = ${this.series ? this.series.length : 0}`);
      return;
    }
    this.series[xIndex][frameIndex] = x;
    this.series[yIndex][frameIndex] = y;
    this.updateRow(frameIndex);
  }

  setOriginFrame(_id){
    this.originFrame = _id;
    this.updateTable();
  }

  updateTable(){
    let ppf = (this.series.length - 1) / 2;
    this.scale.update(this.aspectRatio); // Mise à jour avec le ratio
    this.updateUnits();
    this.buildTableHead();

    if(!this.tableBody || !this.tableBody.children) return;

    for(let i = 0; i < this.tableBody.children.length; i++){
      // update t values
      if(i < this.originFrame){
        $("#" + "t" + i).innerHTML = "";
      } else{
        $("#" + "t" + i).innerHTML = (this.series[0][i] - this.series[0][this.originFrame]).round(3);
      }

      // update x and y values
      const scaleX = this.scale.getOrientedScaleX();
      const scaleY = this.scale.getOrientedScaleY(this.aspectRatio); // Utilisation du ratio

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

  prepareDownloadData(){
    this.scale.update(this.aspectRatio);
    this.updateUnits();

    let series = structuredClone(this.series);

    const scaleX = this.scale.getOrientedScaleX();
    const scaleY = this.scale.getOrientedScaleY(this.aspectRatio);

    // Définit les types pour afficher le bon graphique une fois les données importées dans Grapher
    series[0].type = "x";
    for(let j = 1; j < this.series.length; j++){
      series[j].type = "y";
    }
    
    for(let i = 0; i < this.series[0].length; i++){
      const isBeforeOrigin = i < this.originFrame;

      // t values
      if(isBeforeOrigin){
        series[0][i] = "";
      } else{
        series[0][i] = this.series[0][i] - this.series[0][this.originFrame];
      }

      // x and y values
      for(let j = 1; j < (this.series.length - 1) / 2 + 1; j++){
        series[((j - 1) * 2) + 1][i] = isBeforeOrigin ? "" : this.series[((j - 1) * 2) + 1].get(i, this.scale.origin.x, scaleX);
        series[((j - 1) * 2) + 2][i] = isBeforeOrigin ? "" : this.series[((j - 1) * 2) + 2].get(i, this.scale.origin.y, scaleY);
      }
    }

    return series;
  }

  getExportSeries(){
    const series = this.prepareDownloadData();
    if(!series || series.length === 0 || !series[0]){
      return series;
    }

    // On conserve les images à partir de originFrame où au moins un objet a été pointé
    const indicesToKeep = [];
    const numFrames = series[0].length;

    for(let i = 0; i < numFrames; i++){
      if(i < this.originFrame) continue;

      let hasAtLeastOnePoint = false;
      for(let j = 1; j < series.length; j++){
        const val = series[j][i];
        if(val !== "" && val !== undefined && val !== null){
          hasAtLeastOnePoint = true;
          break;
        }
      }

      if(hasAtLeastOnePoint){
        indicesToKeep.push(i);
      }
    }

    const filteredSeries = series.map(s => {
      const newS = structuredClone(s);
      newS.length = 0;
      indicesToKeep.forEach(idx => newS.push(s[idx]));
      return newS;
    });

    return filteredSeries;
  }

  downloadData(_type, _name){
    let series = this.getExportSeries();

    let file;
    if(_type === "pw"){
      file = exportToPW(series, {rowMustBeComplete : false}, "Tracker", "// Pointage PhyWeb Tracker");
    }
    if(_type === "csv"){
      file = exportToCSV(series, false);
    }
    if(_type === "rw3"){
      file = exportToRW3(series, false, "Pointage PhyWeb Tracker");
    }
    downloadFile(file, _type, _name)
  }

  exportToClipboard() {
    const csv = exportToCSV(this.getExportSeries(), false);
    const tsvContent = csv.replace(/;/g, '\t');

    navigator.clipboard.writeText(tsvContent).then(() => {
      showToast("Données copiées dans le presse-papiers !", "is-success");
    }).catch(err => {
      console.error("Erreur lors de la copie : ", err);
    });
  }
}