import PLAYER from "./modules/player.js"
import MEASUREMENT from "./modules/measurement.js"

const $ = document.querySelector.bind(document);

const fileInput = $("#fileInput");
const videoContainer = $("#videoContainer");

let videoCanvas = $("#videoCanvas");


let measurement = new MEASUREMENT();
let player = new PLAYER(videoContainer, videoCanvas, measurement);


fileInput.addEventListener("change", onFileInputChange);

// CONTROLBAR
$("#controls-play").addEventListener("click", ()=>{player.play();});
$("#controls-pause").addEventListener("click", ()=>{player.pause();});
$("#controls-first").addEventListener("click", ()=>{player.firstFrame();});
$("#controls-previous").addEventListener("click", ()=>{player.previousFrame();});
$("#controls-next").addEventListener("click", ()=>{player.nextFrame();});
$("#controls-last").addEventListener("click", ()=>{player.lastFrame();});

// MENU
$("#button-burger").addEventListener("click", openMenu);
$(".sidemenu").addEventListener("click", closeMenu);

$("#downloadButton").addEventListener("click", ()=>{measurement.createCSV();});

// MAGNIFIER
$("#button-magnifier").addEventListener("click", ()=>{player.toggleMagnifier();});

// TABS
$("#mesuresButton").addEventListener("click", ()=>{
  $("#etalonnageButton").classList.remove("active");
  $("#mesuresButton").className = "active";

  $("#etalonnagePanel").style.display = "none";
  $("#mesuresPanel").style.display = "flex";

  resize();
});

$("#etalonnageButton").addEventListener("click", ()=>{
  $("#mesuresButton").classList.remove("active");
  $("#etalonnageButton").className = "active";

  $("#mesuresPanel").style.display = "none";
  $("#etalonnagePanel").style.display = "block";

  resize();
});

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
$("#segmentButton").addEventListener("click", ()=> {
  player.enterScalenMode();
})

$("#scaleInput").addEventListener("input", ()=> {
  if(!isNumber($("#scaleInput").value)){
    $("#scaleInput").style.backgroundColor = "red";
  } else {
    $("#scaleInput").style.backgroundColor = "white";
    measurement.updateTable();
  }
})

// Clear Table
$("#clearTable").addEventListener("click", ()=> {
  measurement.clearTable();
});
$("#clearRow").addEventListener("click", ()=> {
  measurement.clearRow(player.currentFrame);
});

// Settings
$("#firstFrameInput").addEventListener("change", (e)=> {
  if($("#firstFrameInput").value < 1){$("#firstFrameInput").value = 1;}
  if($("#firstFrameInput").value > measurement.data.length){$("#firstFrameInput").value = measurement.data.length;}
  player.setOriginFrame(e.target.value - 1);
});

$("#ppfInput").addEventListener("change", (e)=> {
  measurement.setPointPerFrame(parseInt(e.target.value), player);
});


window.addEventListener('resize', resize, false);


function onFileInputChange(){
  if(fileInput.files[0] != undefined){
    player.load(fileInput.files[0]);
  }
}

function resize(column2Size = "265px") {
  if($("#etalonnageButton").classList.contains("active")){
    $("#column2").style.width = "265px";
  } else {
    $("#column2").style.width = column2Size;
  }
  $("#column2").style.flexGrow = 0;
  player.resize();
}

/* Set the width of the side navigation to 250px and the left margin of the page content to 250px */
function openMenu() {
  $(".sidemenu").style.display= "block";
  $(".sidemenu-panel").style.width = "25rem";
}

/* Set the width of the side navigation to 0 and the left margin of the page content to 0 */
function closeMenu(e) {
  if(e.srcElement.classList.value === "sidemenu-panel"){
    return;
  }
  $(".sidemenu").style.display= "none";
  $(".sidemenu-panel").style.width = "0";
}

function isNumber(str) { // TODO usefull here ???
  return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
  !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}


/*----------------------------------------------------------------------------------------------
-------------------------------------------HANDLE RESIZE----------------------------------------
----------------------------------------------------------------------------------------------*/

let wrapper = $("#app");
let isHandlerDragging = false;

$('.handler').addEventListener('mousedown', function(e) {
  isHandlerDragging = true;
});

document.addEventListener('mousemove', (e) => {
  if (!isHandlerDragging) {
    return false;
  }

  resize(Math.min(wrapper.offsetWidth - 488, (Math.max(265, wrapper.offsetWidth - e.clientX - 36))) + "px");
});

document.addEventListener('mouseup', function(e) {
  // Turn off dragging flag when user mouse is up
  isHandlerDragging = false;
});