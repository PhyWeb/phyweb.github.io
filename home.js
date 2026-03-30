import {Common, alertModal, NavigationManager} from "./common/common.js"

const $ = document.querySelector.bind(document);

document.addEventListener('DOMContentLoaded', () => {
  // Common
  let common = new Common();
  let navigationManager = new NavigationManager(() => { return false; });

  // Gestion des onglets OS dans la modale de téléchargement
  const osTabs = document.querySelectorAll('.os-tab:not([disabled])');
  const osContents = document.querySelectorAll('.os-content');

  // Fonction pour basculer d'un onglet à l'autre
  const switchTab = (tab) => {
    osTabs.forEach(t => t.classList.remove('is-link'));
    osContents.forEach(content => content.classList.add('is-hidden'));

    tab.classList.add('is-link');
    const targetId = tab.getAttribute('data-target');

    if (targetId) {
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.classList.remove('is-hidden');
      }
    }
  };

  // Ajout de l'événement de clic sur chaque onglet actif
  osTabs.forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab));
  });

  // Détection de l'OS de l'utilisateur pour sélectionner l'onglet approprié
  const userAgent = window.navigator.userAgent.toLowerCase();
  let tabToSelect = document.querySelector('.os-tab[data-target="windows-content"]');
  if (userAgent.includes('linux')) {
    tabToSelect = document.querySelector('.os-tab[data-target="linux-content"]');
  } else if (userAgent.includes('mac os') || userAgent.includes('macintosh')) {
    tabToSelect = document.querySelector('.os-tab[data-target="macos-content"]');
  }
  switchTab(tabToSelect);
});