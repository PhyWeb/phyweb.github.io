import VIDEOLIST from "./modules/videolist.js"

import EXTRACTOR from "./modules/extractor.js"
import MEASUREMENT from "./modules/measurement.js"
import PLAYER from "./modules/player.js"

import {Common, alertModal} from "../common/common.js"

const $ = document.querySelector.bind(document);

let videolist = new VIDEOLIST();
let extractor = new EXTRACTOR();
let measurement = new MEASUREMENT();
let player = new PLAYER($("#videoContainer"), $("#videoCanvas"), measurement, extractor);

// handler to resize the columns
let isHandlerDragging = false;

document.addEventListener('DOMContentLoaded', () => {
// Common
let common = new Common("Tracker");

if ("VideoDecoder" in window) {
  console.log("VideoDecoder supported")
} else {
  console.log("VideoDecoder NOT supported")
  alertModal({
    type: "danger",
    title: "Navigateur non compatible",
    body: `<div class="content has-text-justified">
          <p>PhyWeb utilise des technologies modernes pour fonctionner. Votre navigateur ne prend pas en charge toutes les fonctions nécessaires. </p>
          <p>Exemples de navigateurs compatibles :</p>
          <ul>
            <li>Google Chrome version 94 et +</li>
            <li>Microsoft Edge version 94 et +</li>
            <li>Mozilla Firefox version 130 et +</li>
          </ul>
        </div>`,
    confirm: "OK",
    width: "42rem"
  })
}

// Navbar
let quitConfirm = (_path)=>{
  // Check if data exists
  if(!measurement.series[0]){
    window.location.replace(_path);
    return;
  }

  // Check if data is empty
  let empty = true;
  for(let i = measurement.originFrame; i < measurement.series[0].length; i++){
    for(let j = 0; j < (measurement.series.length - 1) / 2; j++){
      if(measurement.series[(j * 2) + 1][i] !== ""){
        empty = false
      }
    }
  }
  if(empty){
    window.location.replace(_path);
    return;
  }
  alertModal({
    type: "warning",
    title: "Quitter l'application",
    body: `<p>Etes-vous sûr de vouloir quitter l'application. Les données seront perdues.</p>`,
    confirm:{
      label: "Quitter",
      type:"warning",
      cb: ()=>{window.location.replace(_path);}
    },
    cancel: "Annuler",
    width: "42rem"
  })
}

$("#navbar-home-button").addEventListener("click", () => {
  quitConfirm("../index.html");
});
$("#navbar-audio-button").addEventListener("click", () => {
  quitConfirm("../audio/index.html");
});

// NAV
$("#etalonnage-button").addEventListener("click", ()=>{
  $("#etalonnage-button").classList.add("is-active");
  $("#mesures-button").classList.remove("is-active");
  $("#etalonnage-panel").classList.remove("is-hidden");
  $("#mesures-panel").classList.remove("is-flex");
  $("#mesures-panel").classList.add("is-hidden");
});

// ELECTRON
if (window.electronAPI){
  // move the open file big arrow
  $("#big-arrow").style.marginRight = "10.5rem";
}

// TABS
$("#etalonnage-button").addEventListener("click", ()=>{
  $("#etalonnage-button").classList.add("is-active");
  $("#mesures-button").classList.remove("is-active");
  $("#etalonnage-panel").classList.remove("is-hidden");
  $("#mesures-panel").classList.remove("is-flex");
  $("#mesures-panel").classList.add("is-hidden");
});
$("#mesures-button").addEventListener("click", ()=>{
  $("#mesures-button").classList.add("is-active");
  $("#etalonnage-button").classList.remove("is-active");
  $("#mesures-panel").classList.remove("is-hidden");
  $("#mesures-panel").classList.add("is-flex");
  $("#etalonnage-panel").classList.add("is-hidden");
});

// OPEN VIDEO
$("#open-video-button").addEventListener("click", () => {
  $("#force-filesize-modal-input").checked = false; // reset the force filesize input
});

// VIDEOLIST
videolist.init("assets/list.json");
$("#open-video").addEventListener("click", ()=>{
  common.modalManager.closeAllModals();
  player.load("assets/" + $(".video-item.is-active").dataset.path, $("#force-filesize-modal-input").checked);
});

// FILEINPUT
$("#file-input").addEventListener("change", () => {
  if($("#file-input").files[0].type !== "video/mp4"){
    alertModal({
      type: "danger",
      title: "Codec video non supporté",
      body: `<div class="content">
          <p>La vidéo doit être au format mp4 et encodé dans un des formats listé ci-dessous :</p>
          <ul>
            <li>H.264</li>
            <li>H.265</li>
            <li>AV1</li>
          </ul>
        </div>`,
      confirm: "OK",
      width: "45rem"
    })
    return;
  }
  if($("#file-input").files[0] != undefined){
    player.load($("#file-input").files[0], $("#force-filesize-modal-input").checked);
  }
});
$("#file-input").addEventListener("click", () => {
  $("#file-input").value = null; // allow the onchange trigger even if the same file is selected twice
});

// RESIZEVIDEO
$("#open-resized-video").addEventListener("click", ()=>{
  common.modalManager.closeAllModals();
  extractor.extract();
});

// FILE SLIDER
noUiSlider.create($("#file-slider"), {
  start: [0, 10],
  connect: true,
  range: {
    'min': 0,
    'max': 10
  },
  margin: 1,
  behaviour: 'tap-drag',
  tooltips: false,
  pips: {
    mode: 'steps',
    stepped: true,
    density: 4
	}
});
$("#file-slider").noUiSlider.on('update', function (values, handle) {
  let value = values[handle];

  if (handle) {
    $("#end-size-input").value = value;
  } else {
    $("#start-size-input").value = value;
  }

  if($("#file-size-modal").classList.contains("is-active")){
    player.extractor.updateSize();
  }
});
$("#start-size-input").addEventListener('change', function () {
  $("#file-slider").noUiSlider.set([this.value, null]);
});
$("#end-size-input").addEventListener('change', function () {
  $("#file-slider").noUiSlider.set([null, this.value]);
});

// MAGNIFIER
$("#magnifier-button").addEventListener("click", ()=>{player.toggleMagnifier();});

// SETTINGS
// Open settings modal
$("#settings-button").addEventListener("click", ()=>{
  $("#max-digits-input").value = measurement.maxDigits;

  if($("#coordinates-labels").classList.contains("is-hidden")){
    $("#show-coordinates-input").checked = false;
  } else {
    $("#show-coordinates-input").checked = true;
  }
});
$("#validate-settings-button").addEventListener("click", ()=>{
  common.modalManager.closeAllModals();
});

// Coordinates
$("#show-coordinates-input").addEventListener("change", (e)=>{
  if(e.target.checked){
    $("#coordinates-labels").classList.remove("is-hidden");
  } else {
    $("#coordinates-labels").classList.add("is-hidden");
  }
});

// Max digits
$("#max-digits-input").addEventListener("change", (e)=> {
  measurement.setMaxDigits(parseInt(e.target.value));
});

// CONTROLBAR
$("#play-button").addEventListener("click", ()=>{player.play();});
$("#pause-button").addEventListener("click", ()=>{player.pause();});
$("#first-button").addEventListener("click", ()=>{player.firstFrame();});
$("#previous-button").addEventListener("click", ()=>{player.previousFrame();});
$("#next-button").addEventListener("click", ()=>{player.nextFrame();});
$("#last-button").addEventListener("click", ()=>{player.lastFrame();});

// ORIGIN
$("#topright").addEventListener("click", ()=> {
  player.enterOriginMode("topright");
  $("#videoCanvas").style.cursor = "url(lib/cursors/upright.svg) 8 22, crosshair"
})

$("#topleft").addEventListener("click", ()=> {
  player.enterOriginMode("topleft");
  $("#videoCanvas").style.cursor = "url(lib/cursors/upleft.svg) 22 22, crosshair"
})

$("#downright").addEventListener("click", ()=> {
  player.enterOriginMode("downright");
  $("#videoCanvas").style.cursor = "url(lib/cursors/downright.svg) 8 8, crosshair"
})

$("#downleft").addEventListener("click", ()=> {
  player.enterOriginMode("downleft");
  $("#videoCanvas").style.cursor = "url(lib/cursors/downleft.svg) 22 8, crosshair"
})

// SCALE
$("#segment-button").addEventListener("click", ()=> {
  player.enterScalenMode();
})

// keyboard shortcut
$("#scale-input").addEventListener("keyup", (event)=> {
	if (event.key === "Enter") {
		event.preventDefault();
		$("#scale-input").blur();
	}
});

$("#scale-input").addEventListener("input", ()=> {
  if(!common.isNumber($("#scale-input").value)){
    $("#scale-input").classList.add("has-background-danger");
  } else {
    $("#scale-input").classList.remove("has-background-danger");
    measurement.updateTable();
  }
})

// keyboard shortcut
$("#origin-frame-input").addEventListener("keyup", (event)=> {
	if (event.key === "Enter") {
		event.preventDefault();
		$("#origin-frame-input").blur();
	}
});
$("#origin-frame-input").addEventListener("change", (e)=> {
  if(e.target.value < 1){$("#origin-frame-input").value = 1;}
  if(e.target.value > measurement.series[0].length){e.target.value = measurement.series[0].length;}
  player.setOriginFrame(e.target.value - 1);
});

// keyboard shortcut
$("#ppf-input").addEventListener("keyup", (event)=> {
	if (event.key === "Enter") {
		event.preventDefault();
		$("#ppf-input").blur();
	}
});
$("#ppf-input").addEventListener("change", (e)=> {
  if(e.target.value < 1){e.target.value = 1;}
  if(e.target.value > 9){e.target.value = 9;}
  measurement.setPointPerFrame(parseInt(e.target.value), player);
});

// TABLE CONTROLS
$("#clear-table-button").addEventListener("click", ()=> {
  alertModal({
    type: "warning",
    title: "Vider le tableau",
    body: "Etes-vous sûr de vouloir vider le tableau de toutes ses données ?",
    confirm:{
      label: "Vider de tableau",
      cb: ()=>{measurement.clearTable();}},
    cancel: "Annuler"
  })
});
$("#clear-row").addEventListener("click", ()=> {
  measurement.clearRow(player.currentFrame);
});
$("#copy-table-button").addEventListener("click", ()=> {
  navigator.clipboard.writeText($("#table").innerText);
});

// DOWNLOAD
// keyboard shortcut
$("#file-name-input").addEventListener("keyup", (event)=> {
	if (event.key === "Enter") {
		event.preventDefault();
		$("#download-file-button").click();
	}
});
$("#csv-button").addEventListener("click", ()=>{
  $("#csv-button").classList.add('is-link');
  $("#rw3-button").classList.remove('is-link');
  $("#file-name-input").placeholder = "pointage.csv";
});
$("#rw3-button").addEventListener("click", ()=>{
  $("#rw3-button").classList.add('is-link');
  $("#csv-button").classList.remove('is-link');
  $("#file-name-input").placeholder = "pointage.rw3";
});

$("#download-file-button").addEventListener("click", ()=>{
  let filename = "pointage";
  if($("#file-name-input").value !== ""){
    filename = $("#file-name-input").value;
  }
  if($("#csv-button").classList.contains("is-link")){
    measurement.downloadData("csv", filename);
  } else{
    measurement.downloadData("rw3", filename);
  }
  common.modalManager.closeAllModals();
});

// RESIZE
window.addEventListener('resize', resize, false);

function resize(column2Size = "285px") {
  $("#right-column").children[0].style.width = column2Size;
  $("#right-column").children[0].style.flexGrow = 0;
  player.resize();
}

// HANDLER
$('.handler').addEventListener('mousedown', function(e) {
  isHandlerDragging = true;
});

document.addEventListener('mousemove', (e) => {
  if (!isHandlerDragging) {
    return false;
  }

  resize(Math.min($("#handler-wrapper").offsetWidth - 520, (Math.max(285, $("#handler-wrapper").offsetWidth - e.clientX - 26))) + "px");
});

document.addEventListener('mouseup', function(e) {
  // Turn off dragging flag when user mouse is up
  isHandlerDragging = false;
});

resize();

});