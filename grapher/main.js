// grapher/main.js (Version corrigée)

import {Common, alertModal, quitConfirmationModal} from "../common/common.js"

import App from "./modules/app.js"
import UIManager from "./modules/ui.js"
import {Data} from "./modules/data.js"
import {Spreadsheet} from "./modules/spreadsheet.js"
import {Grapher} from "./modules/grapher.js"
import {Calculation} from "./modules/calculation.js"

const $ = document.querySelector.bind(document);

document.addEventListener('DOMContentLoaded', () => {
// Initialise les modules de base
  const common = new Common("Grapher");
  const data = new Data();
  const grapher = new Grapher(data);
  const calculation = new Calculation(data);
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

  // convertit <i> en SVG manuellement
  window.FontAwesome.dom.i2svg(); 

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

  // --- Gestion de la fermeture de l'application ---
  let isNavigationConfirmed = false; // Pour eviter la double demande de confirmation quand on change de page
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