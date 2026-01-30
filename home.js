import {Common, alertModal, NavigationManager} from "./common/common.js"

const $ = document.querySelector.bind(document);

document.addEventListener('DOMContentLoaded', () => {
  // Common
  let common = new Common();
  let navigationManager = new NavigationManager(() => { return false; });
});