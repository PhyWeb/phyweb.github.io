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

// Exclure le tableau de Handsontable (par exemple <div id="table">)
const table = document.getElementById('table');

window.FontAwesome.dom.i2svg(); // convertit <i> en SVG manuellement

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

let initialSettings = {};
function captureInitialSettings() {
  initialSettings = {
    maxDigits: data.settings.maxDigits,
    grapherGrid: grapher.grid,
    derivatePoints: calculation.derivatePoints,
    derivateEdges: calculation.derivateEdges
  };
}

/* Settings modal ---------------------------------------------------------------------------*/
// Open the settings modal
$("#settings-button").addEventListener("click", () => {
  captureInitialSettings(); // Capture the initial settings before opening the modal
  // Load the previous settings
  $("#max-digits-select").value = initialSettings.maxDigits;
  $("#derivative-points-select").value = initialSettings.derivatePoints;
  $("#derivate-edges-switch").checked = calculation.derivateEdges;
  $("#graph-grid-switch").checked = grapher.grid;

  // Show the settings modal
  $("#settings-modal").classList.add("is-active");
});

// Save the settings
$("#settings-save-button").addEventListener("click", () => {
  const newSettings = {
    maxDigits: parseInt($("#max-digits-select").value),
    grapherGrid: $("#graph-grid-switch").checked,
    derivatePoints: parseInt($("#derivative-points-select").value),
    derivateEdges: $("#derivate-edges-switch").checked
  };
  
  // Liste des paramètres modifiés
  const changedSettings = {};
  for (const key in newSettings) {
    if (newSettings[key] !== initialSettings[key]) {
      changedSettings[key] = newSettings[key];
    }
  }

  // Save the max digits
  if(changedSettings.maxDigits !== undefined) {
    data.settings.maxDigits = changedSettings.maxDigits;
    spreadsheet.update(); 
  }


  // Save the grid visibility
  if(changedSettings.grapherGrid !== undefined) {
    grapher.setGridVisibility(changedSettings.grapherGrid);
  }

  // Save the derivate points
  if(changedSettings.derivatePoints !== undefined) {
    calculation.derivatePoints = changedSettings.derivatePoints;
  }

  // Save the derivate edges
  if(changedSettings.derivateEdges !== undefined) {
    calculation.derivateEdges = changedSettings.derivateEdges;
  }

  // Close the modal
  common.modalManager.closeAllModals();
});

// --- GESTION DES ONGLETS (TABS) DANS LA MODALE DES PARAMÈTRES ---
const settingsTabs = document.querySelectorAll('#settings-tabs li');
const settingsTabContents = document.querySelectorAll('.settings-panel-content');

settingsTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const targetPanelId = tab.dataset.tab;
    
    settingsTabs.forEach(t => t.classList.remove('is-active'));
    settingsTabContents.forEach(p => p.classList.add('is-hidden'));
    tab.classList.add('is-active');
    
    const targetPanel = document.getElementById(targetPanelId);
    if (targetPanel) {
      targetPanel.classList.remove('is-hidden');
    }
  });
});

/* Save modal ---------------------------------------------------------------------------*/
const downloadModal = $("#download-modal");
const pwButton = $("#pw-button");
const csvButton = $("#csv-button");
const rw3Button = $("#rw3-button");
const fileNameInput = $("#file-name-input");
const downloadFileButton = $("#download-file-button");
let selectedFormat = 'pw'; // Le format par défaut

// Ouvre la modale de sauvegarde
$("#save-button").addEventListener("click", () => {
  if (data.curves.length === 0 && $("#calculation-input").value.trim() === '') {
    alertModal({
      title: "Aucune donnée",
      body: "Aucune donnée à sauvegarder.",
      confirm: "OK"
    });
    return;
  }
  // Réinitialise le nom du fichier à chaque ouverture
  fileNameInput.value = `session.${selectedFormat}`;
  downloadModal.classList.add("is-active");
});

function updateFormatSelection(newFormat) {
  selectedFormat = newFormat;
  
  // Met à jour l'état des boutons
  pwButton.classList.toggle("is-link", newFormat === 'pw');
  csvButton.classList.toggle("is-link", newFormat === 'csv');
  rw3Button.classList.toggle("is-link", newFormat === 'rw3');

  // Met à jour le placeholder et la valeur du nom de fichier
  const baseName = (fileNameInput.value.split('.')[0] || 'session');
  fileNameInput.placeholder = `${baseName}.${newFormat}`;
  fileNameInput.value = `${baseName}.${newFormat}`;
}

// Gère les clics sur les boutons de format
pwButton.addEventListener("click", () => updateFormatSelection('pw'));
csvButton.addEventListener("click", () => updateFormatSelection('csv'));
rw3Button.addEventListener("click", () => updateFormatSelection('rw3'));

// Gère le téléchargement final
downloadFileButton.addEventListener("click", () => {
  const fileName = fileNameInput.value || fileNameInput.placeholder;
  if (!fileName) {
    alertModal({
      title: "Nom de fichier manquant",
      body: "Veuillez entrer un nom de fichier.",
      confirm: "OK"
    });
    return;
  }
  
  app.saveFile(fileName, selectedFormat);
  common.modalManager.closeAllModals();
});

/*----------------------------------------------------------------------------------------------
--------------------------------------------SPREADSHEET-----------------------------------------
----------------------------------------------------------------------------------------------*/

/* Add curve modal ---------------------------------------------------------------------------*/
  // Références aux éléments de la modale
  const addCurveModal = $('#add-curve-modal');
  const radioButtons = addCurveModal.querySelectorAll('input[name="creation-type"]');
  const addCurveConfirmButton = $('#add-curve-confirm-button');
  const calculationTextarea = $('#calculation-input');

  // Panels de la modale
  const emptyCurvePanel = $('#empty-curve-panel');
  const calcCurvePanel = $('#calc-curve-panel');
  const derivateCurvePanel = $('#derivate-curve-panel');
  const parameterPanel = $('#parameter-panel');
  const allPanels = [emptyCurvePanel, calcCurvePanel, derivateCurvePanel, parameterPanel];

  // Références aux champs de saisie pour chaque panneau
  const emptyCurveSymbolInput = $('#empty-curve-symbol-input');
  const emptyCurveUnitInput = $('#empty-curve-unit-input');

  const calcCurveSymbolInput = $('#calc-curve-symbol-input');
  const calcCurveUnitInput = $('#calc-curve-unit-input');
  const calcCurveFormulaInput = $('#calc-curve-formula-input');

  const derivateCurveSymbolInput = $('#derivate-curve-symbol-input');
  const derivateCurveUnitInput = $('#derivate-curve-unit-input');
  const derivateNumeratorSelect = $('#derivate-numerator-select');
  const derivateDenominatorSelect = $('#derivate-denominator-select');

  const parameterSymbolInput = $('#parameter-symbol-input');
  const parameterUnitInput = $('#parameter-unit-input');
  const parameterValueInput = $('#parameter-value-input');


  // --- Fonctions de la modale et de la barre latérale ---

  /**
   * Met à jour le panneau visible en fonction du bouton radio sélectionné.
   */
  function updateVisiblePanel() {
    const selectedValue = addCurveModal.querySelector('input[name="creation-type"]:checked').value;
    allPanels.forEach(panel => panel.classList.add('is-hidden'));

    switch (selectedValue) {
      case 'empty-curve':
        emptyCurvePanel.classList.remove('is-hidden');
        break;
      case 'calc-curve':
        calcCurvePanel.classList.remove('is-hidden');
        break;
      case 'derivate-curve':
        derivateCurvePanel.classList.remove('is-hidden');
        break;
      case 'parameter':
        parameterPanel.classList.remove('is-hidden');
        break;
    }
  }

  /**
   * Peuple les menus déroulants pour la dérivation avec les courbes disponibles.
   * @param {string[]} curveNames - Un tableau des noms des courbes (ex: ['t', 'x', 'y']).
   */
  function populateDerivativeSelects(curveNames) {
    derivateNumeratorSelect.innerHTML = '<option>Choisir numérateur</option>';
    derivateDenominatorSelect.innerHTML = '<option>Choisir dénominateur</option>';

    curveNames.forEach(name => {
      const optionNum = document.createElement('option');
      optionNum.value = name;
      optionNum.textContent = name;
      derivateNumeratorSelect.appendChild(optionNum);

      const optionDenom = document.createElement('option');
      optionDenom.value = name;
      optionDenom.textContent = name;
      derivateDenominatorSelect.appendChild(optionDenom);
    });
  }

  /**
   * Réinitialise tous les champs de la modale à leur état par défaut.
   */
  function resetAddCurveModal() {
    emptyCurveSymbolInput.value = "";
    emptyCurveUnitInput.value = "";
    calcCurveSymbolInput.value = "";
    calcCurveUnitInput.value = "";
    calcCurveFormulaInput.value = "";
    derivateCurveSymbolInput.value = "";
    derivateCurveUnitInput.value = "";
    parameterSymbolInput.value = "";
    parameterUnitInput.value = "";
    parameterValueInput.value = "";

    const curveNames = app.data.curves.map(c => c.title);
    populateDerivativeSelects(curveNames);

    addCurveModal.classList.add("is-active");
  }


  /**
   * Récupère et valide les entrées de la modale en fonction du type sélectionné.
   * @param {string} selectedType - La valeur du bouton radio coché.
   * @returns {object|null} Un objet contenant les informations ou null si la validation échoue.
   */
  function getModalInputs(selectedType) {
    let symbol, unit, formulaLine;

    const symbolExists = (sym) => {
      if (app.data.getCurveByTitle(sym) || app.data.parameters.hasOwnProperty(sym)) {
        alertModal({
          title: "Symbole déjà utilisé",
          body: `Le symbole "${sym}" existe déjà. Veuillez en choisir un autre.`,
          confirm: "OK"
        });
        return true;
      }
      return false;
    };

    const buildVarWithUnit = (sym, u) => u ? `${sym}_${u}` : sym;

    switch (selectedType) {
      case 'calc-curve': {
        symbol = calcCurveSymbolInput.value.trim();
        unit = calcCurveUnitInput.value.trim();
        const formula = calcCurveFormulaInput.value.trim();
        if (!symbol || !formula) {
          alertModal({
            title: "Symbole ou formule manquant",
            body: "Veuillez remplir le symbole et la formule.",
            confirm: "OK"
          });
          return null;
        }
        if (symbolExists(symbol)) return null;
        formulaLine = `${buildVarWithUnit(symbol, unit)} = ${formula}`;
        return { type: 'formula', formulaLine };
      }
      
      case 'derivate-curve': {
        symbol = derivateCurveSymbolInput.value.trim();
        unit = derivateCurveUnitInput.value.trim();
        const numerator = derivateNumeratorSelect.value;
        const denominator = derivateDenominatorSelect.value;

        if (!symbol || numerator.startsWith('Choisir') || denominator.startsWith('Choisir')) {
          alertModal({
            title: "Symbole ou grandeurs manquants",
            body: "Veuillez remplir le symbole et choisir les deux grandeurs à dériver.",
            confirm: "OK"
          });
          return null;
        }
        if (symbolExists(symbol)) return null;
        
        // Construit la formule `diff`
        const formula = `diff(${numerator}, ${denominator})`;
        formulaLine = `${buildVarWithUnit(symbol, unit)} = ${formula}`;

        return { type: 'formula', formulaLine };
      }

      case 'parameter': {
        symbol = parameterSymbolInput.value.trim();
        unit = parameterUnitInput.value.trim();
        const value = parameterValueInput.value.trim();
        if (!symbol || !value) {
          alertModal({
            title: "Symbole ou valeur manquants",
            body: "Veuillez remplir le symbole et la valeur.",
            confirm: "OK"
          });
          return null;
        }
        if (symbolExists(symbol)) return null;
        formulaLine = `${buildVarWithUnit(symbol, unit)} = ${value}`;
        return { type: 'formula', formulaLine };
      }
      
      case 'empty-curve': {
        symbol = emptyCurveSymbolInput.value.trim();
        unit = emptyCurveUnitInput.value.trim();
        if (!symbol) {
          alertModal({
            title: "Symbole manquant",
            body: "Veuillez entrer un symbole.",
            confirm: "OK"
          });
          return null;
        }
        if (symbolExists(symbol)) return null;
        return { type: 'empty-curve', symbol, unit };
      }
      default:
        console.error("Type de création inconnu:", selectedType);
        return null;
    }
  }

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
        // Pour les paramètres, `items` est un objet { key: { value, unit } }
        for (const [key, param] of Object.entries(items)) {
          const li = document.createElement('li');
          const a = document.createElement('a');
          
          if (typeof param === 'object' && param !== null && param.hasOwnProperty('value')) {
            const displayValue = parseFloat(param.value.toPrecision(3));
            const displayUnit = param.unit ? ` ${param.unit}` : '';
            a.textContent = `${key} = ${displayValue}${displayUnit}`;
          } else {
            const displayValue = typeof param === 'number' ? parseFloat(param.toPrecision(3)) : param;
            a.textContent = `${key} = ${displayValue}`;
          }
  
          a.dataset.value = key;
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


  // --- Écouteurs d'événements ---

  radioButtons.forEach(radio => {
    radio.addEventListener('change', updateVisiblePanel);
  });

  $('#add-curve-button').addEventListener("click", () => {
    resetAddCurveModal();
    addCurveModal.querySelector('input[value="empty-curve"]').click();
  });
  $('#add-curve-calculation-button').addEventListener("click", () => {
    resetAddCurveModal();
    addCurveModal.querySelector('input[value="calc-curve"]').click();
  });

  // Gère la confirmation de l'ajout
  addCurveConfirmButton.addEventListener('click', () => {
    const selectedType = addCurveModal.querySelector('input[name="creation-type"]:checked').value;
    const newEntry = getModalInputs(selectedType);

    if (!newEntry) {
      return; 
    }

    if (newEntry.type === 'empty-curve') {
      app.addCurve(newEntry.symbol, newEntry.unit);
    } else {
      const currentText = calculationTextarea.value;
      const separator = currentText.trim() === '' ? '' : '\n\n'; 
      calculationTextarea.value = currentText + separator + newEntry.formulaLine;
      app.applyCalculation(calculationTextarea.value);
    }
    
    // Mettre à jour l'interface
    app.spreadsheet.update();
    app.grapher.updateChart();
    
    // Mettre à jour la barre latérale
    window.updateCalculationSidebar(
      app.data.curves.map(c => c.title),
      app.data.parameters,
      app.calculation.getAvailableFunctions()
    );
    
    // Fermer la modale
    common.modalManager.closeAllModals();
  });

  // Initialise l'état de la modale au chargement
  updateVisiblePanel();

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

// Delete line
$("#delete-line-button").addEventListener("click", () => {
  const selectedRange = spreadsheet.hot.getSelectedRangeLast();

  if (!selectedRange) {
    alertModal({
      title: "Aucune sélection",
      body: "Veuillez sélectionner une ou plusieurs lignes à supprimer.",
      confirm: "OK"
    });
    return;
  }

  const startRow = Math.min(selectedRange.from.row, selectedRange.to.row);
  const endRow = Math.max(selectedRange.from.row, selectedRange.to.row);
  const amount = (endRow - startRow) + 1;
  const rowLabel = amount > 1 ? 'lignes' : 'ligne';

  alertModal({
    type: "warning",
    title: "Confirmer la suppression",
    body: `<p>Êtes-vous sûr de vouloir supprimer <strong>${amount} ${rowLabel}</strong> ?<br>Cette action est irréversible.</p>`,
    confirm: {
      label: "Supprimer",
      type: "danger", // Pour un bouton rouge
      cb: () => { 
        app.deleteRow(startRow, amount); 
      }
    },
    cancel: "Annuler"
  });
});



/*----------------------------------------------------------------------------------------------
----------------------------------------------Grapher-------------------------------------------
----------------------------------------------------------------------------------------------*/
grapher.newChart();

// Outils Dropdown ------------------------------------------------------------------------------------
const toolsDropdown = $("#tools-dropdown");
const toolItems = document.querySelectorAll(".tool-item");
let activeToolElement = null;

// Gère l'affichage de la coche et l'état de l'outil actif
function setActiveTool(clickedItem) {
  const isDeselecting = activeToolElement === clickedItem;

  // 1. On efface toutes les coches
  toolItems.forEach(item => {
    const checkmarkContainer = item.querySelector('.tool-checkmark-container');
    if (checkmarkContainer) checkmarkContainer.innerHTML = '';
  });

  if (isDeselecting) {
    activeToolElement = null;
    console.log("Outil désactivé.");

    grapher.setCrosshairMode(null); // On passe 'null' pour tout désactiver
    
    return;
  }

  // 3. Sinon, on active le nouvel outil
  activeToolElement = clickedItem;
  const checkmarkContainer = clickedItem.querySelector('.tool-checkmark-container');
  if (checkmarkContainer) {
    checkmarkContainer.innerHTML = '<i class="fa-solid fa-check"></i>';
    setTimeout(() => {
      window.FontAwesome.dom.i2svg({ node: toolsDropdown });
    }, 0);
  }
}

// Ouvre et ferme le menu déroulant
toolsDropdown.addEventListener("click", (event) => {
  event.stopPropagation();
  toolsDropdown.classList.toggle("is-active");
});

// Ferme le menu si on clique ailleurs
document.addEventListener("click", () => {
  toolsDropdown.classList.remove("is-active");
});

// Ajoute un écouteur d'événement unique pour tous les outils
toolItems.forEach(item => {
  item.addEventListener('click', () => {
    setActiveTool(item);

    // On s'assure que le bouton zoom est bien désactivé
    $("#zoom-button").classList.remove("is-active");
    isZoomEnabled = false;

    if (activeToolElement) {
      if (item.id === 'tool-crosshair-data') {
        grapher.setCrosshairMode('data');
      } else if (item.id === 'tool-crosshair-free') {
        grapher.setCrosshairMode('free');
      }
    }
  });
});

// Choose graphs -------------------------------------------------------------------------------
$("#choose-curves-button").addEventListener("click", () => { 
  if(data.curves.length === 0){
    return;
  }
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
      grapher.chart.series.find(e => e.name === activeCurve).update({ 
        color: newColor,
        marker: { 
          lineColor: newColor, 
        }
      });
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

  grapher.chart.update({ chart: { zooming: { type: null } } });
});

/*----------------------------------------------------------------------------------------------
--------------------------------------------Calculation-----------------------------------------
----------------------------------------------------------------------------------------------*/
const textarea = document.getElementById('calculation-input');
const sidebar = document.getElementById('calculation-sidebar');

$("#apply-calculation-button").addEventListener("click", () => {
  app.applyCalculation(textarea.value);
});

// Tooltips
const functionTooltips = {
  sqrt: 'Racine carrée',
  cbrt: 'Racine cubique',
  abs: 'Valeur absolue',
  exp: 'Exponentielle (e^x)',
  log: 'Logarithme en base 10',
  ln: 'Logarithme népérien',
  round: 'Arrondi à l\'entier le plus proche',
  floor: 'Partie entière (arrondi inférieur)',
  ceil: 'Arrondi supérieur',
  sin: 'Sinus (en radians)',
  cos: 'Cosinus (en radians)',
  tan: 'Tangente (en radians)',
  asin: 'Arc sinus',
  acos: 'Arc cosinus',
  atan: 'Arc tangente',
  sinh: 'Sinus hyperbolique',
  cosh: 'Cosinus hyperbolique',
  tanh: 'Tangente hyperbolique',
  asinh: 'Arc sinus hyperbolique',
  acosh: 'Arc cosinus hyperbolique',
  atanh: 'Arc tangente hyperbolique',
  diff: 'Dérivée numérique ex: diff(y,t)'
};

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
        // Add a tooltip if it exists
        if (functionTooltips[item]) {
          a.setAttribute('title', functionTooltips[item]);
        }
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
      // Pour les paramètres, `items` est un objet { key: { value, unit } }
      for (const [key, param] of Object.entries(items)) {
        const li = document.createElement('li');
        const a = document.createElement('a');
        
        // Vérifie si le paramètre est un objet avec une valeur ou un simple nombre
        if (typeof param === 'object' && param !== null && param.hasOwnProperty('value')) {
          const displayValue = parseFloat(param.value.toPrecision(3));
          const displayUnit = param.unit ? ` ${param.unit}` : '';
          a.textContent = `${key} = ${displayValue}${displayUnit}`;
        } else {
          // Fallback pour les paramètres qui sont encore de simples nombres
          const displayValue = typeof param === 'number' ? parseFloat(param.toPrecision(3)) : param;
          a.textContent = `${key} = ${displayValue}`;
        }

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

  let finalInsert = textToInsert;
  let cursorOffset;

  // Cas spécial pour la fonction diff
  if (textToInsert === 'diff()') {
    finalInsert = 'diff(,)';
    cursorOffset = finalInsert.indexOf(','); // Place le curseur avant la virgule
  } 
  // Cas général pour les autres fonctions
  else if (textToInsert.endsWith('()')) {
    cursorOffset = finalInsert.length - 1; // Place le curseur avant la parenthèse fermante
  } 
  // Cas pour les variables et paramètres
  else {
    cursorOffset = finalInsert.length; // Place le curseur à la fin
  }

  textarea.value = before + finalInsert + after;

  // Définit la nouvelle position du curseur
  textarea.selectionStart = textarea.selectionEnd = start + cursorOffset;
  
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

function resize(){
  let newHeight = $("#table-container").offsetHeight;
  spreadsheet.hot.updateSettings({ height: newHeight })
  grapher.chart.reflow();
}

resize();

window.addEventListener("resize", () => {
  resize();
});

// Ouvre la modale "Nouveau" au démarrage de l'application
$("#new-file-modal").classList.add("is-active");

});