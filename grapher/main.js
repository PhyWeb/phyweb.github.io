// grapher/main.js (Version corrigée)

import {Common, alertModal, quitConfirmationModal} from "../common/common.js"

import App from "./modules/app.js"
import UIManager from "./modules/ui.js"
import {Data} from "./modules/data.js"
import {Spreadsheet} from "./modules/spreadsheet.js"
import {Grapher} from "./modules/grapher.js"
import {Calculation} from "./modules/calculation.js"
import {loadSettings} from "./modules/settingsManager.js"

const $ = document.querySelector.bind(document);

document.addEventListener('DOMContentLoaded', () => {
  // On charge les paramètres sauvegardés (ou les défauts) dès le début.
  const initialSettings = loadSettings();

  // Initialise les modules de base
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
    grapher.updateChart();
  }
  let spreadsheet = new Spreadsheet(data, spreadsheetModifiedData);
  spreadsheet.build();

  // Initialisation du gestionnaire d'interface utilisateur
  const uiManager = new UIManager(common, data, grapher, calculation, editor, spreadsheet);

  // App
  const app = new App(data, spreadsheet, grapher, calculation, editor, uiManager);

  // UIManager a besoin de 'app' pour certaines actions (ex: app.deleteCurve)
  uiManager.setApp(app);
  uiManager.initialize();

  // Desactive le scan auto de fontAwesome
  window.FontAwesomeConfig = {
    autoReplaceSvg: false // empêche le scan automatique
  };

  // Creer le graphique au demarrage
  grapher.newChart();

  // Gestion du redimensionnement de la fenêtre
  function resize(){
    let newHeight = $("#table-container").offsetHeight;
    spreadsheet.hot.updateSettings({ height: newHeight })
    grapher.chart.reflow();
  }

  // Initial resize
  resize();

  // Resize on window resize
  window.addEventListener("resize", () => {
    resize();
  });

});