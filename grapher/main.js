import {Common, alertModal} from "../common/common.js"

import {App} from "./modules/app.js"
import {Data} from "./modules/data.js"
import {Spreadsheet} from "./modules/spreadsheet.js"
import {Grapher} from "./modules/grapher.js"
import {Calculation} from "./modules/calculation.js"

const $ = document.querySelector.bind(document);

document.addEventListener('DOMContentLoaded', () => {
// Common
const common = new Common("Grapher");

let data = new Data();
let grapher = new Grapher(data);

let calculation = new Calculation(data);

// Spreadsheet
function spreadsheetModifiedData(e){
  grapher.updateChart();
}

let spreadsheet = new Spreadsheet(data, spreadsheetModifiedData);
spreadsheet.build();

// App
let app = new App(data, spreadsheet, grapher, calculation);

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
  $("#calculs-panel").classList.add("is-hidden");
});
$("#grapheur-tab").addEventListener("click", () => {
  $("#tableur-tab").classList.remove("is-active");
  $("#grapheur-tab").classList.add("is-active");
  $("#calculs-tab").classList.remove("is-active");

  $("#tableur-panel").classList.add("is-hidden");
  $("#grapheur-panel").classList.remove("is-hidden");
  $("#calculs-panel").classList.add("is-hidden");
});
$("#calculs-tab").addEventListener("click", () => {
  $("#tableur-tab").classList.remove("is-active");
  $("#grapheur-tab").classList.remove("is-active");
  $("#calculs-tab").classList.add("is-active");

  $("#tableur-panel").classList.add("is-hidden");
  $("#grapheur-panel").classList.add("is-hidden");
  $("#calculs-panel").classList.remove("is-hidden");
});

$("#file-input").addEventListener("change", () => {

  if($("#file-input").files[0] != undefined){
    app.loadFile($("#file-input").files[0]);
    common.modalManager.closeAllModals();
  }
});
$("#file-input").addEventListener("click", () => {
  $("#file-input").value = null; // allow the onchange trigger even if the same file is selected twice
});

$("#new-file-button").addEventListener("click", () => {
  // Check if data exists TODO

  // Reset the data
  app.deleteAllCurves();
  common.modalManager.closeAllModals();
});

$("#paste-button").addEventListener('click', async () => {
  try {
    let text = await navigator.clipboard.readText();
    common.modalManager.closeAllModals();
    console.log('Contenu du presse-papier :', text);
    app.loadClipboard(text); // Load the data from the clipboard
  } catch (err) {
    console.error('Erreur lors de la lecture du presse-papier :', err);
  }
});

// Show the new file modal TODO
$("#new-file-open-modal-button").addEventListener("click", () => {
  $("#new-file-modal").classList.add("is-active");
});

// DEBUG
$("#debug-button").addEventListener("click", () => {
  console.log("data",data);
  console.log("chart",grapher.chart);
});

// Menu Dropdown
const dropdownToggle = $("#menu-dropdown-toggle");
const dropdownContainer = $("#menu-dropdown-container");

dropdownToggle.addEventListener("click", function (event) {
  event.stopPropagation();
  dropdownContainer.classList.toggle("is-active");
});

// Close the dropdown when clicking outside
document.addEventListener("click", function () {
  dropdownContainer.classList.remove("is-active");
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

  app.addCurve(title, unit);

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
  app.deleteCurve(curve);

  common.modalManager.closeAllModals();
});


/*----------------------------------------------------------------------------------------------
----------------------------------------------Grapher-------------------------------------------
----------------------------------------------------------------------------------------------*/
grapher.newChart();

// Choose graphs -------------------------------------------------------------------------------
$("#choose-curves-button").addEventListener("click", () => { 
  populateCurveMenu();
  populateCurveSelect();
  populateColors();
  populateLineWidthSelect();
  populateLineStyleSelect()
  populateMarkersSymbolSelect()
  populateMarkersRadiusSelect()

  $("#choose-curves-menu").firstElementChild.children[0].click(); // Select the first curve by default
  $("#choose-x-curve-select").value = grapher.currentXCurve; // Set the current X curve in the select

  $("#choose-curves-modal").classList.add("is-active");
});

// Populate curve list
function populateCurveMenu(){
  $("#choose-curves-menu").innerHTML = "";

  data.curves.forEach(element => {
    let li = document.createElement("li");
    let a = document.createElement("a");
  
    let input = document.createElement("input");
    input.type = "checkbox";
    input.classList.add("mr-2");

    // Check if the curve is already in the graph
    if(grapher.chart.series.find(e => e.name === element.title)){
      input.checked = true;
    }

    input.addEventListener("change", () => {
      // Get the list of all the checked curves
      let activeCurves = [];
      for(let i = 0; i < $("#choose-curves-menu").children.length; i++){
        if($("#choose-curves-menu").children[i].children[0].children[0].checked){
          activeCurves.push($("#choose-curves-menu").children[i].children[0].children[1].innerHTML);
        }
      }
      // Update the chart with the active curves
      grapher.updateChart(activeCurves);
    });

    let label = document.createElement("label");
    label.innerHTML = element.title;
  
    a.appendChild(input);
    a.appendChild(label);
    li.appendChild(a);
  
    $("#choose-curves-menu").appendChild(li);
  
    a.addEventListener("click", () => {

      // active the curve
      a.classList.add("is-active");

      // deactivate the other curves
      for(let i = 0; i < $("#choose-curves-menu").children.length; i++){
        if($("#choose-curves-menu").children[i].children[0] !== a){
          $("#choose-curves-menu").children[i].children[0].classList.remove("is-active");
        }
      }

      const curve = data.curves.find(curve => curve.title === element.title);

      // select the good color option
      $("#curveColorPicker").value = curve.color;
      $("#curveColorPicker").style.color = $("#curveColorPicker").value; // Update the color of the select

      // select the good marker toggle
      $("#curveMarkerToggle").checked = curve.markers;

      // Show or hide the marker UI based on the marker toggle
      if(curve.markers){
        document.querySelectorAll(".curveMarkerUI").forEach(e => {
          e.classList.remove("is-hidden");
        });
      } else {
        document.querySelectorAll(".curveMarkerUI").forEach(e => {
          e.classList.add("is-hidden");
        });
      }

      // select the good line toggle
      $("#curveLineToggle").checked = curve.line;

      // Show or hide the linewidth and lineStyle select based on the line toggle
      if(curve.line){
        document.querySelectorAll(".curveLineUI").forEach(e => {
          e.classList.remove("is-hidden");
        });
      } else {
        document.querySelectorAll(".curveLineUI").forEach(e => {
          e.classList.add("is-hidden");
        });
      }

      // select the good line width
      $("#curveLineWidthSelect").value = curve.lineWidth;

      // select the good line style
      $("#curveLineStyleSelect").value = curve.lineStyle;

      // select the good marker symbol
      $("#curveMarkerSymbolSelect").value = curve.markerSymbol;

      // select the good marker radius
      $("#curveMarkerRadiusSelect").value = curve.markerRadius;
    });

    if($("#choose-curves-menu").children.length === 1){
      // If this is the first curve, select it by default
      a.classList.add("is-active");
    }
  });
}

// Populate the x curve select
function populateCurveSelect(){
  $("#choose-x-curve-select").innerHTML = "";

  data.curves.forEach(element => {
    let option = document.createElement("option");
    option.innerHTML = element.title;

    // Select the current X curve
    if(element.title === grapher.currentXCurve){
      option.selected = true;
    }

    $("#choose-x-curve-select").appendChild(option);
  });
}

$("#choose-x-curve-select").addEventListener("change", () => {
  // Update the X curve in the grapher
  grapher.setXCurve($("#choose-x-curve-select").value, true);
});

$("#choose-curves-confirm-button").addEventListener("click", () => {
  common.modalManager.closeAllModals();
});

// Populate line colors
function populateColors(){
  const colors = Highcharts.getOptions().colors;
  const select = document.getElementById("curveColorPicker");

  // Create the options
  select.innerHTML = ""; // Clear previous options
  colors.forEach((color) => {
    const option = document.createElement('option');
    option.value = color;
    option.style.color = color;
    option.textContent = "■■■■■■■■■"; // On peut aussi mettre un code couleur ici
    select.appendChild(option);
  });

  // Au changement de sélection, mettre à jour la couleur
  select.addEventListener('change', function () {
    const newColor = this.value;

    // Update the color of the select
    this.style.color = newColor;

    // Find the active curve the select is currently set to
    const activeCurve = $("#choose-curves-menu").querySelector(".is-active").children[1].innerHTML;

    // Update the color of the curve in the data
    const curve = data.curves.find(curve => curve.title === activeCurve);
    curve.color = newColor;

    // Update the color of the curve in the chart if it exists
    if(grapher.chart.series.find(e => e.name === activeCurve)){
      grapher.chart.series.find(e => e.name === activeCurve).update({ color: newColor });
    }
  });
}

// Marker toggle
$("#curveMarkerToggle").addEventListener("change", () => {
  // Find the active curve the select is currently set to
  const activeCurve = $("#choose-curves-menu").querySelector(".is-active").children[1].innerHTML;

  // Update the marker toggle of the curve in the data
  const curve = data.curves.find(curve => curve.title === activeCurve);
  curve.markers = $("#curveMarkerToggle").checked;

  // Show or hide the marker select based on the marker toggle
  if(curve.markers){
    document.querySelectorAll(".curveMarkerUI").forEach(e => {
      e.classList.remove("is-hidden");
    });
  } else {
    document.querySelectorAll(".curveMarkerUI").forEach(e => {
      e.classList.add("is-hidden");
    });
  }

  // Update the line toggle of the curve in the chart if it exists
  if(grapher.chart.series.find(e => e.name === activeCurve)){
    grapher.chart.series.find(e => e.name === activeCurve).update({ marker: { enabled: curve.markers,} });
  }
});

// line toggle
$("#curveLineToggle").addEventListener("change", () => {
  // Find the active curve the select is currently set to
  const activeCurve = $("#choose-curves-menu").querySelector(".is-active").children[1].innerHTML;

  // Update the line toggle of the curve in the data
  const curve = data.curves.find(curve => curve.title === activeCurve);
  curve.line = $("#curveLineToggle").checked;

  // Show or hide the linewidth select based on the line toggle
  if(curve.line){
    document.querySelectorAll(".curveLineUI").forEach(e => {
      e.classList.remove("is-hidden");
    });
  } else {
    document.querySelectorAll(".curveLineUI").forEach(e => {
      e.classList.add("is-hidden");
    });
  }

  // Update the line toggle of the curve in the chart if it exists
  if(grapher.chart.series.find(e => e.name === activeCurve)){
    grapher.chart.series.find(e => e.name === activeCurve).update({ lineWidth: curve.line ? curve.lineWidth : 0});
  }
});

// Populate line width select
function populateLineWidthSelect(){
  const select = document.getElementById("curveLineWidthSelect");

  // Create the options
  select.innerHTML = ""; // Clear previous options
  for(let i = 1; i <= 10; i++){
    const option = document.createElement('option');
    option.value = i;
    option.textContent = i; // Display the line width in pixels
    select.appendChild(option);
  }

  // On change, update the line width of the active curve
  select.addEventListener('change', function () {
    const newLineWidth = parseInt(this.value, 10);

    // Find the active curve the select is currently set to
    const activeCurve = $("#choose-curves-menu").querySelector(".is-active").children[1].innerHTML;

    // Update the line width of the curve in the data
    const curve = data.curves.find(curve => curve.title === activeCurve);
    curve.lineWidth = newLineWidth;

    // Update the line width of the curve in the chart if it exists
    if(grapher.chart.series.find(e => e.name === activeCurve)){
      grapher.chart.series.find(e => e.name === activeCurve).update({ lineWidth: newLineWidth });
    }
  });
}

// Populate line style select
function populateLineStyleSelect(){
  const select = document.getElementById("curveLineStyleSelect");

  // On change, update the line style of the active curve
  select.addEventListener('change', function () {
    const newLineStyle = this.value;

    // Find the active curve the select is currently set to
    const activeCurve = $("#choose-curves-menu").querySelector(".is-active").children[1].innerHTML;

    // Update the line style of the curve in the data
    const curve = data.curves.find(curve => curve.title === activeCurve);
    curve.lineStyle = newLineStyle;

    // Update the line style of the curve in the chart if it exists
    if(grapher.chart.series.find(e => e.name === activeCurve)){
      grapher.chart.series.find(e => e.name === activeCurve).update({ dashStyle: newLineStyle });
    }
  });
}

// Populate markers symbol select
function populateMarkersSymbolSelect(){
  const select = document.getElementById("curveMarkerSymbolSelect");

  // On change, update the marker symbol of the active curve
  select.addEventListener('change', function () {
    const newSymbol = this.value;

    // Find the active curve the select is currently set to
    const activeCurve = $("#choose-curves-menu").querySelector(".is-active").children[1].innerHTML;

    // Update the marker symbol of the curve in the data
    const curve = data.curves.find(curve => curve.title === activeCurve);
    curve.markerSymbol = newSymbol;

    // Update the marker symbol of the curve in the chart if it exists
    if(grapher.chart.series.find(e => e.name === activeCurve)){
      grapher.chart.series.find(e => e.name === activeCurve).update({ marker: { 
        symbol: newSymbol,
        lineWidth: newSymbol === "cross" || "crossX" ? 1 : 0, // If the symbol is a cross, set the line width to 10
      } });
    }
  });
}

// Populate the markers symbol radius select
function populateMarkersRadiusSelect(){
  const select = document.getElementById("curveMarkerRadiusSelect");

  // Create the options
  select.innerHTML = ""; // Clear previous options
  for(let i = 1; i <= 15; i++){
    const option = document.createElement('option');
    option.value = i;
    option.textContent = i; // Display the marker radius in pixels
    select.appendChild(option);
  }

  // On change, update the marker radius of the active curve
  select.addEventListener('change', function () {
    const newRadius = parseInt(this.value, 10);

    // Find the active curve the select is currently set to
    const activeCurve = $("#choose-curves-menu").querySelector(".is-active").children[1].innerHTML;

    // Update the marker radius of the curve in the data
    const curve = data.curves.find(curve => curve.title === activeCurve);
    curve.markerRadius = newRadius;

    // Update the marker radius of the curve in the chart if it exists
    if(grapher.chart.series.find(e => e.name === activeCurve)){
      grapher.chart.series.find(e => e.name === activeCurve).update({ marker: { radius: newRadius } });
    }
  });
}




// Zoom ----------------------------------------------------------------------------------------
let isZoomEnabled = false;
$("#zoom-button").addEventListener("click", () => {
  if(!isZoomEnabled){
    $("#zoom-button").classList.add("is-active");
    grapher.chart.update({
      chart: {
        zooming: {
          type : "xy", // Enable zooming in both directions
          resetButton:{
            theme: {
              style:{
                display: "none" // Hide the default reset button
              }
            }
          }
        },
      }
    });
    isZoomEnabled = true;
  } else {
    $("#zoom-button").classList.remove("is-active");
    grapher.chart.update({
      chart: {
        zooming: {
          type : null // Disable zooming
        },
      }
    });
    isZoomEnabled = false;
  }
});

$("#auto-zoom-button").addEventListener("click", () => {
  grapher.chart.zoomOut();
  $("#auto-zoom-button").classList.add("is-hidden");
  $("#zoom-button").classList.remove("is-active");
  isZoomEnabled = false;
});

/*----------------------------------------------------------------------------------------------
--------------------------------------------Calculation-----------------------------------------
----------------------------------------------------------------------------------------------*/
const textarea = document.getElementById('calculation-input');
const sidebar = document.getElementById('calculation-sidebar');

$("#apply-calculation-button").addEventListener("click", () => {
  app.applyCalculation(textarea.value);
});

/**
 * Remplit une liste dans la barre latérale.
 * @param {string} containerId - L'ID de l'élément conteneur.
 * @param {string[]|object} items - Le tableau de chaînes ou l'objet de paramètres.
 * @param {object} options - Options d'affichage.
 * @param {boolean} options.isFunction - Si true, ajoute des parenthèses et utilise une grille.
 * @param {boolean} options.isParameter - Si true, traite `items` comme un objet et affiche les valeurs.
 */
function populateList(containerId, items, options = {}) {
  const { isFunction = false, isParameter = false } = options;
  const containerElement = document.getElementById(containerId);
  if (!containerElement) return;
  containerElement.innerHTML = ''; // Vide le conteneur

  if (isFunction) {
    // Créer une grille à 3 colonnes pour les fonctions
    for (let i = 0; i < items.length; i += 3) {
      const columnsDiv = document.createElement('div');
      columnsDiv.className = 'columns is-mobile is-gapless';
      
      for (let j = i; j < i + 3 && j < items.length; j++) {
        const columnDiv = document.createElement('div');
        columnDiv.className = 'column';
        
        const item = items[j];
        const a = document.createElement('a');
        a.textContent = `${item}()`;
        a.dataset.value = `${item}()`;
        columnDiv.appendChild(a);
        columnsDiv.appendChild(columnDiv);
      }
      containerElement.appendChild(columnsDiv);
    }
  } else {
    // Créer une liste simple pour les courbes et paramètres
    const ul = document.createElement('ul');
    ul.className = 'menu-list';

    if (isParameter) {
      // Pour les paramètres, `items` est un objet { key: value }
      for (const [key, value] of Object.entries(items)) {
        const li = document.createElement('li');
        const a = document.createElement('a');
        // Formate le nombre pour un affichage plus propre
        const displayValue = typeof value === 'number' ? parseFloat(value.toPrecision(3)) : value;
        a.textContent = `${key} = ${displayValue}`;
        a.dataset.value = key; // On n'insère que le nom
        li.appendChild(a);
        ul.appendChild(li);
      }
    } else {
      // Pour les courbes, `items` est un tableau de chaînes
      items.forEach(item => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.textContent = item;
        a.dataset.value = item;
        li.appendChild(a);
        ul.appendChild(li);
      });
    }
    containerElement.appendChild(ul);
  }
}

/**
 * Insère du texte à la position actuelle du curseur dans un textarea.
 * @param {HTMLTextAreaElement} textarea - L'élément textarea.
 * @param {string} textToInsert - Le texte à insérer.
 */
function insertTextAtCursor(textarea, textToInsert) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = textarea.value;
  const before = text.substring(0, start);
  const after = text.substring(end, text.length);

  textarea.value = before + textToInsert + after;

  // Place le curseur après le texte inséré
  const newCursorPos = start + textToInsert.length;
  textarea.selectionStart = textarea.selectionEnd = newCursorPos;
  
  // Si c'est une fonction, place le curseur entre les parenthèses
  if (textToInsert.endsWith('()')) {
      textarea.selectionStart = textarea.selectionEnd = newCursorPos - 1;
  }

  textarea.focus(); // Redonne le focus au textarea
}

// --- Initialisation et Écouteurs d'événements ---

// Écoute les clics sur la barre latérale (event delegation)
sidebar.addEventListener('click', (e) => {
  // Vérifie si un lien a été cliqué
  if (e.target && e.target.tagName === 'A') {
      e.preventDefault(); // Empêche le lien de naviguer
      const text = e.target.dataset.value;
      insertTextAtCursor(textarea, text);
  }
});

// Fonction pour mettre à jour la barre latérale
window.updateCalculationSidebar = () => {
  populateList('calculation-sidebar-curves', data.curves.map(curve => curve.title));
  populateList('calculation-sidebar-params', data.parameters, { isParameter: true });
  populateList('calculation-sidebar-functions', calculation.getAvailableFunctions(), { isFunction: true });
};

window.addEventListener("resize", () => {
  grapher.chart.reflow();
});
});