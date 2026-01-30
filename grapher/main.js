import {Common, alertModal} from "../common/common.js";
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
  
  window.FontAwesome.dom.i2svg();

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

  // Initialisation du gestionnaire d'interface utilisateur
  const uiManager = new UIManager(common, data, grapher, calculation, editor, spreadsheet);

  // App
  const app = new App(data, spreadsheet, grapher, calculation, editor, uiManager);

  // UIManager a besoin de 'app' pour certaines actions (ex: app.deleteCurve)
  uiManager.setApp(app);
  grapher.setUIManager(uiManager);
  uiManager.initialize();

  // Creer le graphique au demarrage
  grapher.newChart();

  // Vérifier les données d'une autre application après l'initialisation complète
  ExchangeManager.checkStartupData((importedPW) => {
    const newFileModal = $('#new-file-modal');
    
    // Masquer l'état vide
    $('#empty-state-container').classList.add('is-hidden');
    // Afficher la modale "Nouveau fichier" pendant le chargement
    newFileModal.classList.add('is-active');
    // Afficher un loader dans la modale
    uiManager.setModalLoading(true);

    console.log("Données importées depuis une autre application :", importedPW);

    setTimeout(() => {
      try {
        app.ioManager.loadPWFromString(importedPW);

        // Si le chargement est un succès, on affiche l'interface principale et on ferme les modales.
        uiManager.showTabsAndPanels();
        uiManager.common.modalManager.closeAllModals();
      } catch (e) {
        console.error("Échec du chargement des données inter-applications:", e);
        // En cas d'erreur, on affiche une alerte.
        alertModal({ type: 'warning', title: 'Erreur de chargement', body: e.message, confirm: 'OK' });
      } finally {
        // Note : sessionStorage.removeItem est déjà géré par ExchangeManager
        
        // Enlever le loader
        uiManager.setModalLoading(false);
      }
    }, 50);
  });

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