import VIDEOLIST from "./modules/videolist.js"

import EXTRACTOR from "./modules/extractor.js"
import MEASUREMENT from "./modules/measurement.js"
import PLAYER from "./modules/player.js"

const $ = document.querySelector.bind(document);

const videoContainer = $("#videoContainer");
let videoCanvas = $("#videoCanvas");

let videolist = new VIDEOLIST();

let extractor = new EXTRACTOR();
let measurement = new MEASUREMENT();
let player = new PLAYER(videoContainer, videoCanvas, measurement, extractor);

let isHandlerDragging = false;

function isNumber(str) { // TODO usefull here ???
  return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
  !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

document.addEventListener('DOMContentLoaded', () => {

if ('VideoDecoder' in window) {
  console.log("VideoDecoder supported")
} else {
  console.log("VideoDecoder NOT supported")
  $("#no-videodecoder-alert-modal").classList.add("is-active")
}
// MODAL
// Functions to open and close a modal
function openModal($el) {
  $el.classList.add('is-active');
}

function closeModal($el) {
  $el.classList.remove('is-active');
}

function closeAllModals() {
  (document.querySelectorAll('.modal') || []).forEach(($modal) => {
    closeModal($modal);
  });
}

// Add a click event on buttons to open a specific modal
(document.querySelectorAll('.js-modal-trigger') || []).forEach(($trigger) => {
  const modal = $trigger.dataset.target;
  const $target = document.getElementById(modal);

  $trigger.addEventListener('click', () => {
    openModal($target);
  });
});

// Add a click event on various child elements to close the parent modal
(document.querySelectorAll(".modal-background, .modal-close, .delete") || []).forEach(($close) => {
  const $target = $close.closest('.modal');

  $close.addEventListener('click', () => {
    closeModal($target);
  });
});

// Add a keyboard event to close all modals
document.addEventListener('keydown', (event) => {
  if(event.key === "Escape") {
    closeAllModals();
  }
});

// NAV
$("#etalonnage-button").addEventListener("click", ()=>{
  $("#etalonnage-button").classList.add("is-active");
  $("#mesures-button").classList.remove("is-active");
  $("#etalonnage-panel").classList.remove("is-hidden");
  $("#mesures-panel").classList.remove("is-flex");
  $("#mesures-panel").classList.add("is-hidden");
});

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

// VIDEOLIST
videolist.init("assets/list.json");
$("#open-video").addEventListener("click", ()=>{
  closeAllModals();
  player.load("assets/" + $(".video-item.is-active").dataset.path);
});

// FILEINPUT
$("#file-input").addEventListener("change", () => {
  console.log($("#file-input").files[0].type)
  if($("#file-input").files[0].type !== "video/mp4"){
    $("#fileformat-alert-modal").classList.add("is-active");
    return;
  }
  if($("#file-input").files[0] != undefined){
    player.checkVideoSize($("#file-input").files[0]);
    closeAllModals();
  }
});
$("#file-input").addEventListener("click", () => {
  $("#file-input").value = null; // allow the onchange trigger even if the same file is selected twice
});

// RESIZEVIDEO
$("#open-resized-video").addEventListener("click", ()=>{
  closeAllModals();
  player.load($("#file-input").files[0],$("#def-size-input").checked,$("#fps-size-input").checked,$("#duration-size-input").checked);
});

// MAGNIFIER
$("#magnifier-button").addEventListener("click", ()=>{player.toggleMagnifier();});

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
  videoCanvas.style.cursor = "url(lib/cursors/upright.svg) 8 22, crosshair"
})

$("#topleft").addEventListener("click", ()=> {
  player.enterOriginMode("topleft");
  videoCanvas.style.cursor = "url(lib/cursors/upleft.svg) 22 22, crosshair"
})

$("#downright").addEventListener("click", ()=> {
  player.enterOriginMode("downright");
  videoCanvas.style.cursor = "url(lib/cursors/downright.svg) 8 8, crosshair"
})

$("#downleft").addEventListener("click", ()=> {
  player.enterOriginMode("downleft");
  videoCanvas.style.cursor = "url(lib/cursors/downleft.svg) 22 8, crosshair"
})

// SCALE
$("#segment-button").addEventListener("click", ()=> {
  player.enterScalenMode();
})

$("#scale-input").addEventListener("input", ()=> {
  if(!isNumber($("#scale-input").value)){
    $("#scale-input").classList.add("has-background-danger");
  } else {
    $("#scale-input").classList.remove("has-background-danger");
    measurement.updateTable();
  }
})

// SETTINGS
$("#origin-frame-input").addEventListener("change", (e)=> {
  if($("#origin-frame-input").value < 1){$("#origin-frame-input").value = 1;}
  if($("#origin-frame-input").value > measurement.data.length){$("#origin-frame-input").value = measurement.data.length;}
  player.setOriginFrame(e.target.value - 1);
});

$("#ppf-input").addEventListener("change", (e)=> {
  measurement.setPointPerFrame(parseInt(e.target.value), player);
});

// TABLE CONTROLS
$("#confirm-clear-table-button").addEventListener("click", ()=> {
  measurement.clearTable();
  closeAllModals();
});
$("#cancel-clear-table-button").addEventListener("click", ()=> {
  closeAllModals();
});
$("#clear-row").addEventListener("click", ()=> {
  measurement.clearRow(player.currentFrame);
});
$("#copy-table-button").addEventListener("click", ()=> {
  navigator.clipboard.writeText($("#table").innerText);
});

// DOWNLOAD
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
    let csv = measurement.createCSV();
    measurement.downloadFile(csv,"csv",filename);
  } else{
    let rw3 = measurement.createRW3();
    measurement.downloadFile(rw3,"rw3",filename);
  }
  closeAllModals();
});

// LICENCE
$("#licence-header").addEventListener("click", ()=>{
  $("#licence-body").classList.toggle("is-hidden");
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