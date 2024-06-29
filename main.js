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
  $("#mesuresPanel").style.display = "block";
});

$("#etalonnageButton").addEventListener("click", ()=>{
  $("#mesuresButton").classList.remove("active");
  $("#etalonnageButton").className = "active";

  $("#mesuresPanel").style.display = "none";
  $("#etalonnagePanel").style.display = "block";
});

// ORIGIN
$("#topright").addEventListener("click", ()=> {
  /*$("#topright").classList.add("active");
  $("#topleft").classList.remove("active");
  $("#downright").classList.remove("active");
  $("#downleft").classList.remove("active");*/
  player.enterOriginMode("topright");
  videoCanvas.style.cursor = "url(lib/cursors/upright.svg) 8 22, crosshair"
})

$("#topleft").addEventListener("click", ()=> {
  /*$("#topright").classList.remove("active");
  $("#topleft").classList.add("active");
  $("#downright").classList.remove("active");
  $("#downleft").classList.remove("active");*/
  player.enterOriginMode("topleft");
  videoCanvas.style.cursor = "url(lib/cursors/upleft.svg) 22 22, crosshair"
})

$("#downright").addEventListener("click", ()=> {
  /*$("#topright").classList.remove("active");
  $("#topleft").classList.remove("active");
  $("#downright").classList.add("active");
  $("#downleft").classList.remove("active");*/
  player.enterOriginMode("downright");
  videoCanvas.style.cursor = "url(lib/cursors/downright.svg) 8 8, crosshair"
})

$("#downleft").addEventListener("click", ()=> {
  /*$("#topright").classList.remove("active");
  $("#topleft").classList.remove("active");
  $("#downright").classList.remove("active");
  $("#downleft").classList.add("active");*/
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
  }
})


window.addEventListener('resize', resize, false);

function videoLoaded(){
  console.log("video loaded");
  measurement.init(player.decodedVideo);
}


function onFileInputChange(){
  player.load(fileInput.files[0], videoLoaded);
}

function resize() {
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

function isNumber(str) {
  return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
  !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}
