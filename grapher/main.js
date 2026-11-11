import {Common, alertModal, showToast} from "../common/common.js";
import ExchangeManager from "../common/modules/ExchangeManager.js";

import App from "./modules/app.js";
import UIManager from "./modules/ui.js";
import {Data} from "./modules/data.js";
import {Spreadsheet} from "./modules/spreadsheet.js";
import {Grapher} from "./modules/grapher.js";
import {Calculation} from "./modules/calculation.js";
import {loadSettings} from "./modules/settingsManager.js";

const $ = document.querySelector.bind(document);

document.addEventListener('DOMContentLoaded', () => {

  // Chargement des paramètres sauvegardés ou par défaut
  const initialSettings = loadSettings();

  // Initialisation des modules de base
  const common = new Common("Grapher");
  const data = new Data(initialSettings);
  const grapher = new Grapher(data, initialSettings);
  const calculation = new Calculation(initialSettings);
  const editor = CodeMirror.fromTextArea($("#calculation-input"), {
    lineNumbers: true,
    mode: 'text/x-javascript',
    theme: 'material',
    autofocus: true
  });

  function spreadsheetModifiedData(e){
    if (grapher.chart) {
      grapher.updateChart();
    }
    uiManager.setCalculationsStale(true);
  }
  let spreadsheet = new Spreadsheet(data, spreadsheetModifiedData);

  // Initialisation du gestionnaire d'interface utilisateur
  const uiManager = new UIManager(common, data, grapher, calculation, editor, spreadsheet);

  // Initialisation du contrôleur principal
  const app = new App(data, spreadsheet, grapher, calculation, editor, uiManager);

  // Liaison du contrôleur principal avec les gestionnaires
  uiManager.setApp(app);
  grapher.setUIManager(uiManager);
  uiManager.initialize();

  // Création du graphique initial
  grapher.newChart();

  // Vérification des données transmises par une autre application
  ExchangeManager.checkStartupData((importedPW) => {
    uiManager.loadStartupPW(importedPW);
  });

  // Gestion du redimensionnement de la fenêtre
  function resize(){
    let newHeight = $("#table-container").offsetHeight;
    spreadsheet.hot.updateSettings({ height: newHeight })
    grapher.chart.reflow();
  }

  // Ajustement initial des dimensions
  resize();

  // Réajustement lors du redimensionnement de la fenêtre
  window.addEventListener("resize", () => {
    resize();
  });

});
