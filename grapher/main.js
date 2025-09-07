// grapher/main.js (Version corrigée)

import {Common, alertModal, quitConfirmationModal} from "../common/common.js"
import { formatNumber } from '../common/formatter.js';

import {App} from "./modules/app.js"
import {Data} from "./modules/data.js"
import {Spreadsheet} from "./modules/spreadsheet.js"
import {Grapher} from "./modules/grapher.js"
import {Calculation} from "./modules/calculation.js"

const $ = document.querySelector.bind(document);

document.addEventListener('DOMContentLoaded', () => {
// Common
const common = new Common("Grapher");

const data = new Data();
const grapher = new Grapher(data);
const calculation = new Calculation(data);
let editor;
let isNavigationConfirmed = false; // Pour eviter la double demande de confirmation quand on change de page

// Spreadsheet
function spreadsheetModifiedData(e){
  grapher.updateChart();
}

let spreadsheet = new Spreadsheet(data, spreadsheetModifiedData);
spreadsheet.build();

// App
const app = new App(data, spreadsheet, grapher, calculation, {
  updateCalculationUI: updateCalculationUI,
  updateRecalculateButtonVisibility: updateRecalculateButtonVisibility,
  updateModelPanel: updateModelPanel
});

// convertit <i> en SVG manuellement
window.FontAwesome.dom.i2svg(); 

// Navbar
let quitConfirm = (_path)=>{
  // Check if data exists
  if(data.curves.length === 0 && editor.getValue().trim() === ''){
    window.location.replace(_path);
    return;
  }

  quitConfirmationModal(
    ()=>{
      isNavigationConfirmed = true; //On lève le drapeau pour que 'beforeunload' ignore.
      window.location.replace(_path);
    }
  )
}

$("#navbar-home-button").addEventListener("click", () => {
  quitConfirm("../index.html");
});
$("#navbar-audio-button").addEventListener("click", () => {
  quitConfirm("../audio/index.html");
});
$("#navbar-tracker-button").addEventListener("click", () => {
  quitConfirm("../tracker/index.html");
});

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

// Utility function to confirm new data
function newDataConfirmation(cb){
  // Check if data exists
  if(data.curves.length === 0 && editor.getValue().trim() === ''){
    cb();
    return;
  } else{
    alertModal({
      type: "danger",
      title: "Attention",
      body: "Cette action supprimera toutes les données actuelles. Êtes-vous sûr de vouloir continuer ?",
      confirm: {
        label: "Oui, supprimer",
        type: "danger", // Pour un bouton rouge
        cb: () => { 
          cb();
        }
      },
      cancel: "Annuler"
    });
    return;
  }
}

$("#file-input").addEventListener("change", () => {
  newDataConfirmation(() => {
  // Check if a file is selected
    if($("#file-input").files[0] != undefined){
      app.loadFile($("#file-input").files[0]);
      common.modalManager.closeAllModals();
    }
  });
});
$("#file-input").addEventListener("click", () => {
  $("#file-input").value = null; // allow the onchange trigger even if the same file is selected twice
});

$("#new-file-button").addEventListener("click", () => {
  newDataConfirmation(() => {
    app.deleteAllCurves();
    common.modalManager.closeAllModals();
  });
});

$("#paste-button").addEventListener('click', async () => {
  newDataConfirmation(async () => {
    try {
      let text = await navigator.clipboard.readText();
      common.modalManager.closeAllModals();
      console.log('Contenu du presse-papier :', text);
      app.loadClipboard(text); // Load the data from the clipboard
    } catch (err) {
      console.error('Erreur lors de la lecture du presse-papier :', err);
    }
  });
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
    significantDigits: data.settings.significantDigits,
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
  $("#significant-digits-select").value = initialSettings.significantDigits;
  $("#derivative-points-select").value = initialSettings.derivatePoints;
  $("#derivate-edges-switch").checked = calculation.derivateEdges;
  $("#graph-grid-switch").checked = grapher.grid;

  // Show the settings modal
  $("#settings-modal").classList.add("is-active");
});

// Save the settings
$("#settings-save-button").addEventListener("click", () => {
  const newSettings = {
    significantDigits: parseInt($("#significant-digits-select").value),
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
  if(changedSettings.significantDigits !== undefined) {
    data.settings.significantDigits = changedSettings.significantDigits;
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
  if (data.curves.length === 0 && editor.getValue().trim() === '') {
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

    const validSymbolRegex = /^[a-zA-Z][a-zA-Z0-9]*$/; 

    // Fonction pour nettoyer et valider le symbole
    const processAndValidateSymbol = (element) => {
      let value = element.value.trim().replace(/\s+/g, ''); // Retire les espaces
      element.value = value; // Met à jour l'affichage

      if (value && !validSymbolRegex.test(value)) {
        alertModal({
          title: "Symbole invalide",
          body: "Le symbole doit commencer par une lettre et ne peut contenir que des lettres et des chiffres.",
          confirm: "OK"
        });
        return null;
      }
      return value;
    };

    // Fonction pour nettoyer l'unité
    const processUnit = (element) => {
        let value = element.value.trim().replace(/\s+/g, ''); // Retire les espaces
        element.value = value; // Met à jour l'affichage
        return value;
    };

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
        symbol = processAndValidateSymbol(calcCurveSymbolInput);
        if (symbol === null) return null;
        unit = processUnit(calcCurveUnitInput);
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
        symbol = processAndValidateSymbol(derivateCurveSymbolInput);
        if (symbol === null) return null;
        unit = processUnit(derivateCurveUnitInput);
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
        symbol = processAndValidateSymbol(parameterSymbolInput);
        if (symbol === null) return null;
        unit = processUnit(parameterUnitInput);
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
        symbol = processAndValidateSymbol(emptyCurveSymbolInput);
        if (symbol === null) return null;
        unit = processUnit(emptyCurveUnitInput);
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
      const currentText = editor.getValue();
      const separator = currentText.trim() === '' ? '' : '\n\n'; 
      const newContent = currentText + separator + newEntry.formulaLine;
      editor.setValue(newContent);
      app.applyCalculation(editor.getValue());
    }
    
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

  const selectElement = $("#delete-curve-select");
  selectElement.innerHTML = ""; // Vide les anciennes options

  // Peuple le menu déroulant avec les grandeurs disponibles
  data.curves.forEach(curve => {
    const option = document.createElement("option");
    option.value = curve.title;
    option.textContent = `${curve.title} (${curve.unit || 'sans unité'})`;
    selectElement.appendChild(option);
  });

  $("#delete-curve-modal").classList.add("is-active");
});

$("#delete-curve-confirm-button").addEventListener("click", () => {
  const curveTitleToDelete = $("#delete-curve-select").value;

  if (curveTitleToDelete) {
    app.deleteCurve(curveTitleToDelete);
  }

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
    type: "danger",
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

  // Cherche la première courbe affichée (cochée) et la sélectionne
  const firstCheckedCurve = $("#choose-curves-menu").querySelector("input:checked");
  if (firstCheckedCurve) {
    firstCheckedCurve.closest("a").click();
  } else {
    // Si aucune courbe n'est cochée, masquer le panneau de détails
    $("#curve-details-panel").classList.add("is-hidden");
  }

  $("#choose-x-curve-select").value = grapher.currentXCurve; // Set the current X curve in the select

  $("#choose-curves-modal").classList.add("is-active");
});

// Populate curve list
function populateCurveMenu(){
  const menu = $("#choose-curves-menu");
  const panel = $("#curve-details-panel");
  menu.innerHTML = "";

  data.curves.forEach(curve => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.dataset.title = curve.title;

    const input = document.createElement("input");
    input.type = "checkbox";
    input.classList.add("mr-2");
    input.checked = grapher.chart.series.some(s => s.name === curve.title);

    const span = document.createElement("span");
    span.classList.add("ml-2");
    span.innerHTML = curve.title + (curve.unit ? ` (${curve.unit})` : '');

    const colorSwatch = document.createElement("span");
    colorSwatch.style.backgroundColor = curve.color;
    colorSwatch.style.width = '16px';
    colorSwatch.style.height = '16px';
    colorSwatch.style.display = 'inline-block';
    colorSwatch.style.border = '1px solid #dbdbdb';
    colorSwatch.style.verticalAlign = 'middle';
    colorSwatch.style.marginLeft = '5px';

    a.appendChild(input);
    a.appendChild(colorSwatch);
    a.appendChild(span);

    li.appendChild(a);
    menu.appendChild(li);

    // Event listener for the checkbox
    input.addEventListener("change", (e) => {
      e.stopPropagation(); // Empêche l'événement de se propager au lien parent
      const activeCurves = Array.from(menu.querySelectorAll("input:checked")).map(
        (cb) => cb.closest("a").dataset.title
      );
      grapher.updateChart(activeCurves);
    });

    // Event listener for the list item click
    a.addEventListener("click", (e) => {
      if (e.target.type !== 'checkbox') {
        e.preventDefault();
      }
      
      // Remove 'is-active' from all other items
      menu.querySelectorAll("a").forEach(item => item.classList.remove("is-active"));
      // Add 'is-active' to the clicked item
      a.classList.add("is-active");

      // Populate and show the details panel
      populateCurveDetails(curve);
      panel.classList.remove("is-hidden");
    });
  });

  // Select the first curve by default if available
  const firstCurveAnchor = menu.querySelector("a");
  if (firstCurveAnchor) {
    firstCurveAnchor.click();
  }
}

// Populate the details panel with the selected curve's options
function populateCurveDetails(curve) {
  const panel = $("#curve-details-panel");
  panel.setAttribute("data-active-curve", curve.title);

  // Set the color picker
  const colorPicker = $("#curveColorPicker");
  colorPicker.value = curve.color;
  colorPicker.style.color = curve.color;

  // Set the marker options
  const markerToggle = $("#curveMarkerToggle");
  markerToggle.checked = curve.markers;
  const markerUIs = panel.querySelectorAll(".curveMarkerUI");
  markerUIs.forEach(el => el.classList.toggle("is-hidden", !curve.markers));
  $("#curveMarkerRadiusSelect").value = curve.markerRadius;
  $("#curveMarkerSymbolSelect").value = curve.markerSymbol;

  // Set the line options
  const lineToggle = $("#curveLineToggle");
  lineToggle.checked = curve.line;
  const lineUIs = panel.querySelectorAll(".curveLineUI");
  lineUIs.forEach(el => el.classList.toggle("is-hidden", !curve.line));
  $("#curveLineWidthSelect").value = curve.lineWidth;
  $("#curveLineStyleSelect").value = curve.lineStyle;
}


// #######################################################################################
// ## DEBUT BLOC CORRIGÉ: Un seul gestionnaire d'événements pour la modale
// #######################################################################################
$("#choose-curves-modal").addEventListener('change', (e) => {
    const panel = $("#curve-details-panel");
    const activeCurveTitle = panel.getAttribute("data-active-curve");
    
    if (!activeCurveTitle) return;
    
    const curve = data.getCurveByTitle(activeCurveTitle);
    if (!curve) {
      console.error("Impossible de trouver la courbe :", activeCurveTitle);
      return;
    }
  
    const targetId = e.target.id;
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
  
    switch(targetId) {
      case 'curveColorPicker':
        curve.color = value;
        e.target.style.color = value;
        break;
      case 'curveMarkerToggle':
        curve.markers = value;
        panel.querySelectorAll(".curveMarkerUI").forEach(el => el.classList.toggle("is-hidden", !value));
        break;
      case 'curveMarkerRadiusSelect':
        curve.markerRadius = parseInt(value, 10);
        break;
      case 'curveMarkerSymbolSelect':
        curve.markerSymbol = value;
        break;
      case 'curveLineToggle':
        curve.line = value;
        panel.querySelectorAll(".curveLineUI").forEach(el => el.classList.toggle("is-hidden", !value));
        break;
      case 'curveLineWidthSelect':
        curve.lineWidth = parseInt(value, 10);
        break;
      case 'curveLineStyleSelect':
        curve.lineStyle = value;
        break;
    }
    
    // Update the chart to reflect the changes
    const series = grapher.chart.series.find(s => s.name === activeCurveTitle);
    if (series) {
      series.update({
        color: curve.color,
        lineWidth: curve.line ? curve.lineWidth : 0,
        dashStyle: curve.lineStyle,
        marker: {
          enabled: curve.markers,
          symbol: curve.markerSymbol,
          radius: curve.markerRadius,
          lineWidth: (curve.markerSymbol === "cross" || curve.markerSymbol === "crossX") ? 1 : 0,
          lineColor: curve.color
        }
      });
    }
  
    // Update the color swatch in the list
    const activeAnchor = $(`#choose-curves-menu a[data-title="${activeCurveTitle}"]`);
    if (activeAnchor) {
      activeAnchor.querySelector('span:nth-child(2)').style.backgroundColor = curve.color;
    }
});
// #######################################################################################
// ## FIN BLOC CORRIGÉ
// #######################################################################################


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
  updateAllModelPanelVisibilityIcons();
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
}

// Populate line width select
function populateLineWidthSelect(){
  const select = document.getElementById("curveLineWidthSelect");
  select.innerHTML = ""; // Clear previous options
  for(let i = 1; i <= 10; i++){
    const option = document.createElement('option');
    option.value = i;
    option.textContent = i;
    select.appendChild(option);
  }
}

// Populate line style select
function populateLineStyleSelect(){
  // Cette fonction n'a plus besoin d'ajouter d'écouteur, juste de s'assurer que le HTML est là.
  // On la garde au cas où on voudrait la remplir dynamiquement plus tard.
  const select = document.getElementById("curveLineStyleSelect");
  if (select.options.length === 0) {
      // Si vide, on pourrait la peupler, mais le HTML est déjà bon.
  }
}

// Populate markers symbol select
function populateMarkersSymbolSelect(){
  // Idem que populateLineStyleSelect
}

// Populate the markers symbol radius select
function populateMarkersRadiusSelect(){
  const select = document.getElementById("curveMarkerRadiusSelect");
  select.innerHTML = ""; // Clear previous options
  for(let i = 1; i <= 15; i++){
    const option = document.createElement('option');
    option.value = i;
    option.textContent = i;
    select.appendChild(option);
  }
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
          },
        }
      }
    });
    grapher.chart.container.classList.add('chart-free-crosshair');
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
    grapher.chart.container.classList.remove('chart-free-crosshair');
    isZoomEnabled = false;
  }
});

$("#auto-zoom-button").addEventListener("click", () => {
  grapher.chart.zoomOut();
  $("#zoom-button").classList.remove("is-active");
  grapher.chart.container.classList.remove('chart-free-crosshair');
  isZoomEnabled = false;

  grapher.chart.update({ chart: { zooming: { type: null } } });
});

$("#zoom-in-button").addEventListener("click", () => {
  grapher.zoom('in');
});

$("#zoom-out-button").addEventListener("click", () => {
  grapher.zoom('out');
});

  

/*----------------------------------------------------------------------------------------------
-------------------------------------------Modelisation-----------------------------------------
----------------------------------------------------------------------------------------------*/

$("#expand-modelisation-button").addEventListener("click", () => {
  $("#modelisation-panel").classList.remove("is-hidden");

  $("#expand-modelisation-button").classList.add("is-hidden");
  $("#compress-modelisation-button").classList.remove("is-hidden");
});

$("#compress-modelisation-button").addEventListener("click", () => {
  $("#modelisation-panel").classList.add("is-hidden");

  $("#expand-modelisation-button").classList.remove("is-hidden");
  $("#compress-modelisation-button").classList.add("is-hidden");
});

// --- Logique pour la modale d'ajout de modèle ---
const addModelModal = document.getElementById('add-model-modal');
const modelCurveSelect = document.getElementById('model-curve-select');
const modelTypeContainer = document.getElementById('model-type-container');
let selectedModelType = null;

function openAddModelModal() {
  // Peuple le sélecteur de courbes
  modelCurveSelect.innerHTML = '';
  if (grapher.chart && grapher.currentXCurve) {
    grapher.chart.series.forEach(series => {
      // On ne modélise pas un modèle existant
      if (series.type !== 'spline' && !series.name.startsWith('Modèle')) {
        const option = document.createElement('option');
        option.value = series.name;
        option.textContent = `${series.name} = f(${grapher.currentXCurve})`;
        modelCurveSelect.appendChild(option);
      }
    });
  }
  
  // Réinitialise la sélection
  const activeItem = modelTypeContainer.querySelector('.is-active');
  if (activeItem) {
    activeItem.classList.remove('is-active', 'has-background-primary-light');
  }
  selectedModelType = null;

  addModelModal.classList.add('is-active');
}

// Ouvre la modale
$('#add-model-button').addEventListener('click', openAddModelModal);

// Gère la sélection d'un type de modèle
modelTypeContainer.addEventListener('click', (e) => {
  const targetItem = e.target.closest('.model-type-item');
  if (targetItem) {
    // Enlève la classe active des autres éléments
    modelTypeContainer.querySelectorAll('.model-type-item').forEach(item => {
      item.classList.remove('is-active', 'has-background-primary-light');
    });
    // Ajoute la classe active à l'élément cliqué
    targetItem.classList.add('is-active', 'has-background-primary-light');
    selectedModelType = targetItem.dataset.modelType;
  }
});

function updateModelPanel(model) {
  const panel = $(`#model-list article[data-model-id="${model.id}"]`);
  if (panel) {
    panel.querySelector('.message-header p').innerHTML = `${model.y.title} = f(${model.x.title})`;
    panel.querySelector('.message-body p:nth-of-type(2)').innerHTML = model.getEquationString();
    const ul = panel.querySelector('ul');
    ul.innerHTML = '';
    const significantDigits = data.settings.significantDigits;
    model.parameters.forEach(param => {
      const li = document.createElement('li');
      const displayValue = formatNumber(param.value, significantDigits);
      li.innerHTML = `${param.name} = ${displayValue}`;
      ul.appendChild(li);
    });
    const icon = panel.querySelector('.fa-eye, .fa-eye-slash');
    if (model.visible) {
      icon.classList.remove('fa-eye-slash');
      icon.classList.add('fa-eye');
    } else {
      icon.classList.remove('fa-eye');
      icon.classList.add('fa-eye-slash');
    }

    // On met à jour l'affichage de l'écart-type et du R²
    const ul2 = panel.querySelector('ul:last-of-type');
    if (ul2) {
      const significantDigits = data.settings.significantDigits;
      ul2.innerHTML = ''; // Nettoyer la liste avant de la mettre à jour
      
      // Ajout de l'écart-type
      const liRmse = document.createElement('li');
      liRmse.innerHTML = `Écart-type : ${formatNumber(model.rmse, significantDigits)}`;
      ul2.appendChild(liRmse);
      
      // Ajout du R²
      const liRSquared = document.createElement('li');
      liRSquared.innerHTML = `Coeff de corrélation : ${formatNumber(model.rSquared, 5)}`;
      ul2.appendChild(liRSquared);
    }
  }
}

function updateAllModelPanelVisibilityIcons() {
  data.models.forEach(model => {
    const panel = $(`#model-list article[data-model-id="${model.id}"]`);
    if (panel) {
      const visibleButton = panel.querySelector('.fa-eye, .fa-eye-slash').closest('button');
      const isVisible = model.x.title === grapher.currentXCurve && model.visible;
      visibleButton.innerHTML = `<span class="icon"><i class="fas fa-${isVisible ? 'eye' : 'eye-slash'}"></i></span>`;
      window.FontAwesome.dom.i2svg({ node: visibleButton });
    }
  });
}

function closeAllModelPanels() {
  const panels = document.querySelectorAll('#model-list article');
  panels.forEach(panel => {
    const header = panel.querySelector('.message-header');
    const body = panel.querySelector('.message-body');
    const toggleUpIcon = header.querySelector('.toggle-up');
    const toggleDownIcon = header.querySelector('.toggle-down');
    
    header.classList.remove('is-active');
    body.classList.add('is-hidden');
    toggleUpIcon.classList.add('is-hidden');
    toggleDownIcon.classList.remove('is-hidden');

    header.style.borderRadius = '6px';
    
    window.FontAwesome.dom.i2svg({ node: header });
  });
}


function createModelPanel(modelID){
  const modelList = $('#model-list');
  const model = data.models.find(m => m.id === modelID);
  if(!model){
    return;
  }

  const article = document.createElement('article');
  article.classList.add('message', 'is-light', 'mb-2');
  article.setAttribute('data-model-id', model.id);
  const header = document.createElement('div');
  header.classList.add('message-header', 'model-toggle', 'is-active');
  header.innerHTML = `
    <p>${model.y.title} = f(${model.x.title})</p>
    <span class="icon toggle-icon toggle-up"><i class="fa-solid fa-angle-up"></i></span>
    <span class="icon toggle-icon toggle-down is-hidden"><i class="fa-solid fa-angle-down"></i></span>
  `;
  const body = document.createElement('div');
  body.classList.add('message-body', 'model-content', 'pt-2');
  const p = document.createElement('p');
  p.classList.add('has-text-centered');
  p.innerHTML = `<strong>${model.getModelName()}</strong>`;
  body.appendChild(p);
  const p2 = document.createElement('p');
  p2.classList.add('has-text-centered');
  p2.innerHTML = model.getEquationString();
  body.appendChild(p2);
  const div = document.createElement('div');
  div.classList.add('is-flex', 'is-justify-content-space-around', 'mt-2');
  const visibleButton = document.createElement('button');
  visibleButton.classList.add('button', 'is-light');
  visibleButton.innerHTML = `<span class="icon"><i class="fas fa-eye"></i></span>`;
  visibleButton.title = "Afficher/Masquer le modèle";
  div.appendChild(visibleButton);
  const editButton = document.createElement('button');
  editButton.classList.add('button', 'is-light');
  editButton.innerHTML = `<span class="icon"><i class="fas fa-pencil-alt"></i></span>`
  editButton.title = "Modifier le modèle";
  div.appendChild(editButton);
  const deleteButton = document.createElement('button');
  deleteButton.classList.add('button', 'is-light');
  deleteButton.innerHTML = `<span class="icon"><i class="fas fa-trash"></i></span>`;
  deleteButton.title = "Supprimer le modèle";
  div.appendChild(deleteButton);
  body.appendChild(div);
  const p3 = document.createElement('p');
  p3.classList.add('mt-2');
  p3.innerHTML = `<strong>Paramètres :</strong>`;
  body.appendChild(p3);
  const ul = document.createElement('ul');
  const significantDigits = data.settings.significantDigits;
  model.parameters.forEach(param => {
    const li = document.createElement('li');
    const displayValue = formatNumber(param.value, significantDigits);
    li.innerHTML = `${param.name} = ${displayValue}`;
    ul.appendChild(li);
  });
  body.appendChild(ul);
  const p4 = document.createElement('p');
  p4.classList.add('mt-2');
  p4.innerHTML = `<strong>Qualité de l'ajustement :</strong>`;
  body.appendChild(p4);
  const ul2 = document.createElement('ul');
  // Ajout de la valeur de l'écart-type
  const liRmse = document.createElement('li');
  liRmse.innerHTML = `Écart-type : ${formatNumber(model.rmse, significantDigits)}`;
  ul2.appendChild(liRmse);
  // Ajout du R²
  const liRSquared = document.createElement('li');
  liRSquared.innerHTML = `Coeff de corrélation : ${formatNumber(model.rSquared, 5)}`;
  ul2.appendChild(liRSquared);
  body.appendChild(ul2);

  // ----- Buttons functionality -----
  // Visible button
  visibleButton.addEventListener('click', () => {
    // Verification que l'abscisse est la bonne
    if (model.visible === false && model.x.title !== grapher.currentXCurve) {
      alertModal({
        type: "",
        title: "Affichage impossible",
        body: `Pour afficher ce modèle, vous devez sélectionner <strong>${model.x.title}</strong> comme grandeur en abscisse.`,
        confirm: "OK"
      });
      return; // Empêche le reste du code de s'exécuter
    }

    model.visible = !model.visible;
    // L'icône est mise à jour par la fonction updateAllModelPanelVisibilityIcons()
    updateAllModelPanelVisibilityIcons();
    // La visibilité de la série est gérée par grapher.updateModelVisibility()
    grapher.updateModelVisibility();
  });

  // Edit button
    editButton.addEventListener('click', () => {
      const editModelModal = $('#edit-model-modal');
      const colorPicker = $('#model-edit-color-picker');
      const lineWidthSelect = $('#model-edit-linewidth-select');
      
      // Réinitialisation des menus déroulants et attribution des valeurs actuelles
      populateModelColors(colorPicker);
      colorPicker.value = model.color;
      colorPicker.style.color = model.color; // Met à jour la couleur du sélecteur
      populateModelLineWidthSelect(lineWidthSelect);
      lineWidthSelect.value = model.lineWidth;
      $('#model-edit-linestyle-select').value = model.lineStyle;

      // Déclaration de la variable parametersContainer ici pour qu'elle soit accessible
      const parametersContainer = $('#model-edit-parameters-container');
      parametersContainer.innerHTML = '';
      model.parameters.forEach(param => {
        const field = document.createElement('div');
        field.className = 'field is-horizontal';
        field.innerHTML = `
          <div class="field-label is-normal">
            <label class="label">Nom</label>
          </div>
          <div class="field-body">
            <div class="field">
              <div class="control">
                <input class="input" type="text" value="${param.name}" data-old-name="${param.name}" />
              </div>
            </div>
            <div class="field-label is-normal has-text-right">
              <label class="label">Valeur</label>
            </div>
            <div class="field">
              <div class="control">
                <input class="input" type="text" value="${formatNumber(param.value, significantDigits)}" disabled />
              </div>
            </div>
          </div>
        `;
        parametersContainer.appendChild(field);
      });
      
      $('#model-edit-save-button').onclick = () => {      
        model.color = colorPicker.value;
        model.lineWidth = lineWidthSelect.value;
        model.lineStyle = $('#model-edit-linestyle-select').value;
        
        const allNewNames = new Set();
        let hasConflict = false;
        const newParamNames = {};
        
        parametersContainer.querySelectorAll('input[data-old-name]').forEach(input => {
          const oldName = input.dataset.oldName;
          const newName = input.value.trim();
          if (!newName.match(/^[a-zA-Z][a-zA-Z0-9]*$/)) {
            alertModal({ title: "Nom de paramètre invalide", body: `Le nom "${newName}" doit commencer par une lettre et ne contenir que des lettres et des chiffres.`, confirm: "OK" });
            hasConflict = true;
            return;
          }
          if (allNewNames.has(newName)) {
            alertModal({ title: "Nom de paramètre en double", body: `Le nom "${newName}" est utilisé plusieurs fois.`, confirm: "OK" });
            hasConflict = true;
            return;
          }
          allNewNames.add(newName);
          newParamNames[oldName] = newName;
        });
        
        if(hasConflict) return;
        
        const updatedParams = {};
        model.parameters.forEach(param => {
          const oldName = param.name;
          const newName = newParamNames[oldName];
          updatedParams[newName] = { value: param.value, unit: '', type: 'model' };
          
          delete data.parameters[oldName];
        });
        
        model.parameters = Object.entries(updatedParams).map(([name, obj]) => ({ name, value: obj.value }));
        Object.assign(data.parameters, updatedParams);
        
        const series = grapher.chart.get(`model-${model.id}`);
        if(series) {
          series.update({
            color: model.color,
            lineWidth: model.lineWidth,
            dashStyle: model.lineStyle,
          });
        }
        
        updateModelPanel(model);
        updateCalculationUI();
        editModelModal.classList.remove('is-active');
      };
      
      editModelModal.classList.add('is-active');
    });

  // Delete button
  deleteButton.addEventListener('click', () => {
    app.deleteModel(model.id);
    article.remove();
  });

  header.addEventListener('click', () => {
    const body = article.querySelector('.message-body');
    const toggleUpIcon = header.querySelector('.toggle-up');
    const toggleDownIcon = header.querySelector('.toggle-down');
    const isActive = header.classList.toggle('is-active');
    body.classList.toggle('is-hidden', !isActive);

    header.style.borderRadius = isActive ? '6px 6px 0 0' : '6px';

    toggleUpIcon.classList.toggle('is-hidden', !isActive);
    toggleDownIcon.classList.toggle('is-hidden', isActive);
    
    window.FontAwesome.dom.i2svg({ node: header });
  });

  article.appendChild(header);
  article.appendChild(body);
  modelList.appendChild(article);
  window.FontAwesome.dom.i2svg({ node: article });
}

function populateModelColors(selectElement){
  const colors = Highcharts.getOptions().colors;
  selectElement.innerHTML = "";
  colors.forEach((color) => {
    const option = document.createElement('option');
    option.value = color;
    option.style.color = color;
    option.textContent = "■■■■■■■■■";
    selectElement.appendChild(option);
  });
  selectElement.addEventListener('change', function () {
    this.style.color = this.value;
  });
}

function populateModelLineWidthSelect(selectElement){
  selectElement.innerHTML = "";
  for(let i = 1; i <= 10; i++){
    const option = document.createElement('option');
    option.value = i;
    option.textContent = i;
    selectElement.appendChild(option);
  }
}

// Le bouton "Créer"
document.getElementById('add-model-confirm-button').addEventListener('click', async () => {
  const curveToModel = modelCurveSelect.value;
  if (curveToModel && selectedModelType) {
    // Ferme tous les panneaux existants avant de créer le nouveau
    closeAllModelPanels(); 

    common.modalManager.closeAllModals();

    let model = await app.addModel(grapher.currentXCurve, curveToModel, selectedModelType);

    createModelPanel(model.id);
  } else {
    alert("Veuillez sélectionner une courbe et un type de modèle.");
  }
});

// Le bouton "Recalculer tous les modèles"
$("#recalculate-models-button").addEventListener("click", () => {
    app.recalculateAllModels();
});



/*----------------------------------------------------------------------------------------------
--------------------------------------------Calculation-----------------------------------------
----------------------------------------------------------------------------------------------*/

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

// Initialisation de l'éditeur de code
function initializeEditor() {
  const editorTextarea = document.getElementById('calculation-input');
  editor = CodeMirror.fromTextArea(editorTextarea, {
    lineNumbers: true,
    mode: 'text/x-javascript',
    theme: 'material',
    autofocus: true
  });

  editor.getWrapperElement().classList.add('textarea');
  editor.getWrapperElement().classList.add('p-0');

  // Met à jour l'affichage quand on change d'onglet
  $("#calculs-tab").addEventListener("click", () => {
    setTimeout(() => editor.refresh(), 1);
  });
}
  
function updateCalculationUI() {
  populateList('calculation-sidebar-curves', data.curves);
  populateList('calculation-sidebar-params', data.parameters, { isParameter: true });
  populateList('calculation-sidebar-functions', calculation.getAvailableFunctions(), { isFunction: true });

  const curveNames = data.curves.map(c => c.title);
  const parameterNames = Object.keys(data.parameters);
  const functionNames = calculation.getAvailableFunctions();
  
  CodeMirror.defineMode("phyweb-calc", function() {
    return {
      token: function(stream) {
        if (stream.eatSpace()) return null;

        // Regex qui capture un "mot" (variable + unité complexe) jusqu'à un séparateur.
        // Un séparateur est un espace, une virgule, ou un opérateur mathématique principal.
        if (stream.match(/^[a-zA-Z_][^=+\-*(),\s]*/)) {
          const word = stream.current();
          
          if (functionNames.includes(word)) {
            return "phyweb-function";
          }

          const baseName = word.split('_')[0];
          if (curveNames.includes(baseName)) {
            return "variable-2";
          }
          if (parameterNames.includes(baseName)) {
            return "def";
          }
          
          // Si le mot n'est pas reconnu, il n'est pas coloré.
          return null;
        }

        // --- Si ce n'est pas un mot, on cherche le reste ---

        if (stream.match(/^#.*/) || stream.match(/^\/\/.*/) || stream.match(/^'.*/)) return "comment";
        if (stream.match(/^[0-9]+([,.][0-9]+)?/)) return "number"; // Gère les nombres avec . ou ,
        if (stream.match(/^[=+\-*/^(),]/)) return "operator";

        // Fallback pour ne jamais bloquer
        stream.next();
        return null;
      }
    };
  });
  
  editor.setOption("mode", "phyweb-calc");
}

function updateRecalculateButtonVisibility() {
  const recalculateButton = $("#recalculate-models-button");
  if (recalculateButton) {
    if (data.models.length > 0) {
      recalculateButton.classList.remove('is-hidden');
    } else {
      recalculateButton.classList.add('is-hidden');
    }
  }
}

/**
 * Insère du texte dans CodeMirror.
 * @param {string} textToInsert - Le texte à insérer.
 */
function insertTextInEditor(textToInsert) {
  let finalInsert = textToInsert;
  let cursorOffset = textToInsert.length;

  if (textToInsert.endsWith('()')) {
    finalInsert = textToInsert === 'diff()' ? 'diff(,)' : textToInsert.slice(0, -1);
    cursorOffset = finalInsert.indexOf(',') !== -1 ? finalInsert.indexOf(',') : finalInsert.length;
  }

  editor.replaceSelection(finalInsert);
  const cursor = editor.getCursor();
  editor.setCursor({ line: cursor.line, ch: cursor.ch - (finalInsert.length - cursorOffset) });
  editor.focus();
}

initializeEditor(); // Initialise l'éditeur
updateCalculationUI(); // Met à jour l'UI une première fois

const sidebar = document.getElementById('calculation-sidebar');

$("#apply-calculation-button").addEventListener("click", () => {
  app.applyCalculation(editor.getValue());
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


  const colors = {
    function: '#544fc5',
    variable: '#008000',
    parameter: '#d568fb'
  };

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
        a.style.color = colors.function;
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
      const significantDigits = data.settings.significantDigits;
      for (const [key, param] of Object.entries(items)) {
        const li = document.createElement('li');
        const a = document.createElement('a');
        
        const unitText = param.unit ? ` ${param.unit}` : '';
        const displayValue = formatNumber(param.value, significantDigits);

        a.innerHTML = `<span style="color: ${colors.parameter}; font-weight: bold;">${key}</span> = ${displayValue}<span style="color: #7a7a7a;">${unitText}</span>`;
        a.dataset.value = key;
        li.appendChild(a);
        ul.appendChild(li);
      }
    } else { // C'est une grandeur
      items.forEach(curve => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        
        const unitText = curve.unit ? ` (${curve.unit})` : '';
        
        a.innerHTML = `<span style="color: ${colors.variable}; font-weight: bold;">${curve.title}</span><span style="color: #7a7a7a;">${unitText}</span>`;
        a.dataset.value = curve.title; // On insère toujours juste le nom
        li.appendChild(a);
        ul.appendChild(li);
      });
    }
    containerElement.appendChild(ul);
  }
}

// --- Initialisation et Écouteurs d'événements ---

// Écoute les clics sur la barre latérale (event delegation)
sidebar.addEventListener('click', (e) => {
  const link = e.target.closest('a');

  // Vérifie si un lien a été cliqué
  if (link) {
    e.preventDefault(); // Empêche le lien de naviguer
    const text = link.dataset.value;
    if (text) {
      insertTextInEditor(text);
    }
  }
});

function resize(){
  let newHeight = $("#table-container").offsetHeight;
  spreadsheet.hot.updateSettings({ height: newHeight })
  grapher.chart.reflow();
}

resize();

window.addEventListener("resize", () => {
  resize();
});

// --- Gestion de la fermeture de l'application ---
const localHosts = ['localhost', '127.0.0.1'];
if (!localHosts.includes(window.location.hostname)) {
  window.addEventListener('beforeunload', (event) => {
    // Si la navigation a déjà été confirmée par notre code, on ne fait rien.
    if (isNavigationConfirmed) {
      return;
    }
    
    const hasUnsavedData = data.curves.length > 0 || (editor && editor.getValue().trim() !== '');

    if (hasUnsavedData) {
      event.preventDefault();
      event.returnValue = 'Êtes-vous sûr de vouloir quitter ? Vos données non sauvegardées seront perdues.';
      return 'Êtes-vous sûr de vouloir quitter ? Vos données non sauvegardées seront perdues.';
    }
  });
}


// Ouvre la modale "Nouveau" au démarrage de l'application
$("#new-file-modal").classList.add("is-active");

});