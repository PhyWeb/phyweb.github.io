import {Common, alertModal} from "../common/common.js"

import {Data} from "./modules/data.js"
import {Spreadsheet} from "./modules/spreadsheet.js"
import {Grapher} from "./modules/grapher.js"

const $ = document.querySelector.bind(document);

document.addEventListener('DOMContentLoaded', () => {
// Common
let common = new Common("Grapher");

// Navbar
/*
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
}*/

/*$("#navbar-home-button").addEventListener("click", () => {
  quitConfirm("../index.html");
});
$("#navbar-audio-button").addEventListener("click", () => {
  quitConfirm("../audio/index.html");
});*/

// Navbar
$("#tableur-tab").addEventListener("click", () => {
  $("#tableur-tab").classList.add("is-active");
  $("#grapheur-tab").classList.remove("is-active");
  $("#calculs-tab").classList.remove("is-active");

  $("#tableur-panel").classList.remove("is-hidden");
  $("#grapheur-panel").classList.add("is-hidden");
  //$("#calculs-panel").classList.add("is-hidden");
});
$("#grapheur-tab").addEventListener("click", () => {
  $("#tableur-tab").classList.remove("is-active");
  $("#grapheur-tab").classList.add("is-active");
  $("#calculs-tab").classList.remove("is-active");

  $("#tableur-panel").classList.add("is-hidden");
  $("#grapheur-panel").classList.remove("is-hidden");
  //$("#calculs-panel").classList.add("is-hidden");
});
$("#calculs-tab").addEventListener("click", () => {
  $("#tableur-tab").classList.remove("is-active");
  $("#grapheur-tab").classList.remove("is-active");
  $("#calculs-tab").classList.add("is-active");

  $("#tableur-panel").classList.add("is-hidden");
  $("#grapheur-panel").classList.add("is-hidden");
  //$("#calculs-panel").classList.remove("is-hidden");
});

// Data
let data = new Data();
data.addSerie("x", "m", 100, 22);
data.addSerie("y", "m", 100, 23);

// Spreadsheet
let spreadsheet = new Spreadsheet(data);
spreadsheet.build();

// Grapher
let grapher = new Grapher();


});