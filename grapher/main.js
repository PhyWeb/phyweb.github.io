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


// Spreadsheet
function spreadsheetModifiedData(_change){
  grapher.updateChart();
}

let spreadsheet = new Spreadsheet(data, spreadsheetModifiedData);
spreadsheet.build();

// DEBUG
$("#new-file-button").addEventListener("click", () => {
  console.log(data)
});

/*----------------------------------------------------------------------------------------------
--------------------------------------------SPREADSHEET-----------------------------------------
----------------------------------------------------------------------------------------------*/

// Add curve
$("#add-curve-button").addEventListener("click", () => {
  $("#empty-curve-symbol-input").value = "";
  $("#empty-curve-unit-input").value = "";
  $("#add-curve-modal").classList.add("is-active");
});

$("#add-curve-confirm-button").addEventListener("click", () => {
  //TODO enforce proper input style and avoid duplicate
  const title = $("#empty-curve-symbol-input").value;
  const unit = $("#empty-curve-unit-input").value;

  spreadsheet.addCurve(title, unit);

  if(data.curves.length === 1){
    grapher.setXCurve(title);
  }

  if(data.curves.length === 2){
    grapher.pushYCurve(title);
  }

  common.modalManager.closeAllModals();
});

// Delete curve
$("#delete-curve-button").addEventListener("click", () => {
  if(data.curves.length === 0){
    return;
  }

  // Populate curve menu
  $("#delete-curve-menu").innerHTML = "";
  data.curves.forEach(element => {
    let li = document.createElement("li");
    let a = document.createElement("a");
    a.innerHTML = element.title;
    li.appendChild(a);
    $("#delete-curve-menu").appendChild(li);
    a.addEventListener("click", () => {
      a.classList.add("is-active");
      for(let i = 0; i < $("#delete-curve-menu").children.length; i++){
        if($("#delete-curve-menu").children[i].children[0] !== a){
          $("#delete-curve-menu").children[i].children[0].classList.remove("is-active");
        }
      }
    });
  });

  $("#delete-curve-menu").children[0].children[0].classList.add("is-active");
  $("#delete-curve-modal").classList.add("is-active");
    
});

$("#delete-curve-confirm-button").addEventListener("click", () => {
  let curve = $("#delete-curve-menu").querySelector(".is-active").innerHTML;
  // Delete the curve
  data.deleteCurve(curve);

  // Update the graph if needed
  grapher.updateChart();

  // Update the spreadsheet
  spreadsheet.hot.updateSettings({
    data: data.getTable(),
    colHeaders: data.getHeaders()
  });
  common.modalManager.closeAllModals();
});


/*----------------------------------------------------------------------------------------------
----------------------------------------------Grapher-------------------------------------------
----------------------------------------------------------------------------------------------*/
let grapher = new Grapher(data);
grapher.newChart();

// Choose graphs
$("#choose-curves-button").addEventListener("click", () => { 
  populateCurveMenu();
  populateSelect();
  $("#choose-curves-modal").classList.add("is-active");
});

// Populate list
function populateCurveMenu(){
  $("#choose-curves-menu").innerHTML = "";

  data.curves.forEach(element => {
    let li = document.createElement("li");
    let a = document.createElement("a");
  
    let input = document.createElement("input");
    input.type = "checkbox";
    input.classList.add("mr-2");

    let label = document.createElement("label");
    label.innerHTML = element.title;
  
    a.appendChild(input);
    a.appendChild(label);
    li.appendChild(a);
  
    $("#choose-curves-menu").appendChild(li);
  
    a.addEventListener("click", () => {
      a.classList.add("is-active");
      for(let i = 0; i < $("#choose-curves-menu").children.length; i++){
        if($("#choose-curves-menu").children[i].children[0] !== a){
          $("#choose-curves-menu").children[i].children[0].classList.remove("is-active");
        }
      }
    });

    if($("#choose-curves-menu").children.length === 1){
      a.classList.add("is-active");
    }
  });
}

// Populate select
function populateSelect(){
  $("#choose-curves-select").innerHTML = "";

  data.curves.forEach(element => {
    let option = document.createElement("option");
    option.innerHTML = element.title;
    $("#choose-curves-select").appendChild(option);
  });
}

$("#choose-curves-confirm-button").addEventListener("click", () => {
  grapher.setXCurve($("#choose-curves-select").value);

  // Get the list of all the checked curves
  let activeCurves = [];
  for(let i = 0; i < $("#choose-curves-menu").children.length; i++){
    if($("#choose-curves-menu").children[i].children[0].children[0].checked){
      //console.log($("#choose-curves-menu").children[i].children[1].innerHTML);
      activeCurves.push($("#choose-curves-menu").children[i].children[0].children[1].innerHTML);
    }
  }



  grapher.updateChart(curveChanged);



  common.modalManager.closeAllModals();
});

window.addEventListener("resize", () => {
  grapher.chart.reflow();
});


});