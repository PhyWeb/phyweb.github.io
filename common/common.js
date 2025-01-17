const $ = document.querySelector.bind(document);

/*----------------------------------------------------------------------------------------------
---------------------------------------------Common---------------------------------------------
----------------------------------------------------------------------------------------------*/
class Common {
  colors = {
    primary: "hsl(171, 100%, 41%)",
    link: "hsl(217, 71%, 53%)",
    linkRGB: "rgb(50,115,220)"
  }
  constructor(_app = "") {
    this.app = _app;

    this.navbarSetup();
    if($("#expand-button")){
      this.FullscreenManager = new FullscreenManager($("#expand-button"),$("#compress-button"));
    }

    includeLogos();
    electronSetup();

    this.modalManager = new ModalManager();
  }

  navbarSetup(){
    if($("#navbar-dropdown")){
      $("#navbar-dropdown").addEventListener("click",()=>{
        $("#navbar-dropdown").classList.toggle("is-active");
      })
    }
    $("#about-button").addEventListener("click",()=>{
      aboutModal(this.app);
    })
  }

  isNumber(str) {
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
    !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  }
}

async function electronSetup(){
  if (window.electronAPI){
    // Electron window controls
    if($(".window-controls")){
      $(".window-controls").outerHTML = `
        <div class="vertical-divider m-2 window-control"></div>
        <div class="navbar-item window-control">
          <a class="button is-white" id="window-minimize-button">
            <span class="icon">
              <i class="fa-solid fa-window-minimize"></i>
            </span>
          </a>
        </div>
        <div class="navbar-item window-control is-hidden">
          <a class="button is-white" id="window-restore-button">
            <span class="icon">
              <i class="fa-solid fa-window-restore"></i>
            </span>
          </a>
        </div>
        <div class="navbar-item window-control">
          <a class="button is-white" id="window-maximize-button">
            <span class="icon">
              <i class="fa-solid fa-square"></i>
            </span>
          </a>
        </div>
        <div class="navbar-item window-control mr-2">
          <a class="button is-white" id="window-close-button">
            <span class="icon">
              <i class="fas fa-xmark"></i>
            </span>
          </a>
        </div>
      `;

      const isMaximized = await window.electronAPI.isMaximized()
      if(isMaximized){
        $("#window-maximize-button").parentNode.classList.add("is-hidden");
        $("#window-restore-button").parentNode.classList.remove("is-hidden");
      }
    }
    $("#window-close-button").addEventListener('click', () => window.electronAPI.close())
    $("#window-minimize-button").addEventListener('click', () => window.electronAPI.minimize())
    $("#window-maximize-button").addEventListener('click', () => {
      window.electronAPI.maximize()
      $("#window-maximize-button").parentNode.classList.add("is-hidden");
      $("#window-restore-button").parentNode.classList.remove("is-hidden");
    })
    $("#window-restore-button").addEventListener('click', () => {
      window.electronAPI.restore()
      $("#window-maximize-button").parentNode.classList.remove("is-hidden");
      $("#window-restore-button").parentNode.classList.add("is-hidden");
    })
  }
}
/*----------------------------------------------------------------------------------------------
-----------------------------------------MODALS / ALERTS----------------------------------------
----------------------------------------------------------------------------------------------*/
class ModalManager {
	constructor() {
    // Add a click event on buttons to open a specific modal
    (document.querySelectorAll('.js-modal-trigger') || []).forEach(($trigger) => {
      const modal = $trigger.dataset.target;
      const $target = document.getElementById(modal);
      
      $trigger.addEventListener('click', () => {
        this.openModal($target);
      });
    });
      
    // Add a click event on various child elements to close the parent modal
    (document.querySelectorAll(".modal-background, .modal-close, .delete") || []).forEach(($close) => {
      const $target = $close.closest('.modal');
      
      $close.addEventListener('click', () => {
        this.closeModal($target);
      });
    });

    // Add a keyboard event to close all modals
    document.addEventListener('keydown', (event) => {
      if(event.key === "Escape") {
        this.closeAllModals();
      }
    });
	}

  openModal($el) {
    $el.classList.add('is-active');
  }

  closeModal($el) {
    $el.classList.remove('is-active');
  }

  closeAllModals() {
    (document.querySelectorAll('.modal') || []).forEach(($modal) => {
      this.closeModal($modal);
    });
  }
}

function createElement(_type, _className, _parent){
  let e = document.createElement(_type);
  e.className = _className;

  if(_parent){
    _parent.appendChild(e);
  }
  return e
}

function closeAlertModal(_e){
  _e.remove()//classList.remove("is-active");
}

function alertModal(_config){
  let modal = createElement("div", "modal is-active", document.body);
  let background = createElement("div", "modal-background", modal);
  let card = createElement("div", "modal-card", modal);
  let head = createElement("header", "modal-card-head", card);
  let title = createElement("p", "modal-card-title", head);
  let body = createElement("section", "modal-card-body", card);

  // ID
  if(_config.id){
    modal.id = _config.id;
  }

  // Style
  if(_config.width){
    card.style.width = _config.width;
  }
  // Header
  if(_config.title){
    title.innerHTML = _config.title;
  }
  if(_config.type){
    head.classList.add("has-background-"+_config.type);
  }
  if(_config.delete){
    let deleteButton = createElement("button", "delete", head);
    deleteButton.addEventListener("click", ()=>{closeAlertModal(modal)});
  }

  // Body
  if(_config.body){
    body.innerHTML = _config.body;
  }

  // Has a footer
  if(_config.confirm || _config.cancel) {
    let foot = createElement("footer", "modal-card-foot", card);
    let buttons = createElement("div", "buttons", foot);

    // Confirm button
    if(_config.confirm){
      let type = "primary";
      if(_config.confirm.type){
        type = _config.confirm.type;
      }
      let confirmButton = createElement("button", "button is-" + type, buttons);
      confirmButton.addEventListener("click", ()=>{closeAlertModal(modal)});

      if(typeof _config.confirm === "string"){
        confirmButton.innerHTML = _config.confirm;
      } else{
        confirmButton.innerHTML = _config.confirm.label;
      }

      if(_config.confirm.cb){
        confirmButton.addEventListener("click", ()=>{_config.confirm.cb()});
      }
    }

    // Cancel button
    if(_config.cancel){
      let cancelButton = createElement("button", "button", buttons);

      if(typeof _config.cancel === "string"){
        cancelButton.innerHTML = _config.cancel;
      } else {
        cancelButton.innerHTML = _config.cancel.label;
      }

      if(_config.cancel.cb){
        cancelButton.addEventListener("click", ()=>{_config.cancel.cb()});
      }
      if(_config.cancel.type){
        cancelButton.classList.add("is-" + _config.cancel.type);
      }

      cancelButton.addEventListener("click", ()=>{closeAlertModal(modal)});
    }
  } else {
    // No footer
    body.classList.add("has-bottom-round-corner");
  }

  if(!_config.backgroundNotClickable){
    background.addEventListener("click", ()=>{closeAlertModal(modal)});
  }

  return modal;
}

function aboutModal(_app){
  // Description
  let description;
  switch (_app) {
    case "":
      description = `<p>PhyWeb est une collection d’applications destinées à l’enseignement de la physique et de la chimie.</p> 
      <p>Toutes les applications sont disponibles en ligne directement dans le navigateur. Il est néanmoins possible de télécharger un fichier exécutable pour avoir accès aux applications hors-ligne. <a href="https://phyweb.github.io/portable/phyweb.exe">Télécharger</a></p>
      `
      break;
    case "Tracker":
      description = "tracker description"
      break;
    case "Audio":
      description = "audio description"
      break;
    default:
      console.error("wrong app name in about modal");
  }

  // Year
  const d = new Date();
  let year = d.getFullYear();
  alertModal({
    title: "A propos de PhyWeb " + _app,
    delete: true,
    width: "50rem",
    body: `<div class="field is-horizontal">
          <div class="field-label is-flex-grow-0">
            <label class="label">
              <span class="icon is-large"><i class="fa fa-circle-info fa-2xl"></i></span>
            </label>
          </div>
          <div class="field-body">
            <div class="field has-text-justified">`
              + description +  
            `</div>
          </div>
        </div>
        <div class="field is-horizontal">
          <div class="field-label is-flex-grow-0">
            <label class="label">
              <span class="icon is-large"><i class="fa-brands fa-chrome fa-2xl"></i></i></span>
            </label>
          </div>
          <div class="field-body">
            <div class="field">
              <div class="content">
                <p class="has-text-justified">PhyWeb utilise des technologies modernes pour fonctionner. Un navigateur récent est nécessaire au bon fonctionnement des applications. Exemples de navigateurs compatibles :</p>
                <ul>
                  <li>Google Chrome version 94 et +</li>
                  <li>Microsoft Edge version 94 et +</li>
                  <li>Mozilla Firefox version 130 et +</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div class="field is-horizontal">
          <div class="field-label is-flex-grow-0">
            <label class="label">
              <span class="icon is-large"><i class="fa fa-envelope fa-2xl"></i></span>
            </label>
          </div>
          <div class="field-body">
            <div class="field pt-2">
              pro.wal@protonmail.com
            </div>
          </div>
        </div>
        <div class="field is-horizontal">
          <div class="field-label is-flex-grow-0">
            <label class="label">
              <span class="icon is-large"><i class="fa-solid fa-copyright fa-2xl"></i></span>
            </label>
          </div>
          <div class="field-body">
            <div class="field">
              <article class="message is-link">
                <div class="message-header" id="licence-header" style="border-radius:6px">
                  <a>PhyWeb ` + _app + ` Copyright (c) ` + year + ` Gaétan Walter</a>
                </div>
                <div class="message-body is-hidden" id="licence-body">
                  <p class="block has-text-justified">Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:</p>
                  <p class="block has-text-justified">The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.</p>
                  <p class="block has-text-justified">THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.</p>
                </div>
              </article>
            </div>
          </div>
        </div>`,
  });

  // LICENCE
  $("#licence-header").addEventListener("click", ()=>{
    $("#licence-body").classList.toggle("is-hidden");
  });
}

/*----------------------------------------------------------------------------------------------
----------------------------------------TABMANAGER CLASS----------------------------------------
----------------------------------------------------------------------------------------------*/
class TabManager {
  activeTab;
  tabs = [];
  container;
	constructor(_container) {
    this.container = _container;
	}

  newTab(_tab){
    if(_tab.tabButton === undefined){
      _tab.tabButton = this.createTabButton(_tab.name);
      this.container.appendChild(_tab.tabButton);
    }

    let tab = {
      button: _tab.tabButton,
      tab:  _tab.tab,
      clickCB: _tab.clickCB,
      deleteCB: _tab.deleteCB,
      name: _tab.name
    }

    this.tabs.push(tab);


    _tab.tabButton.addEventListener("click", (e)=>{
      if(e.target.classList.contains("tab-delete") || e.target.classList.contains("fa-xmark") || e.target.localName === "path"){
        this.deleteTab(this.tabs.indexOf(tab));
      } else{
        this.onTabClicked(this.tabs.indexOf(tab));
      }
    });

    if(_tab.isActive){
      this.activeTab = this.tabs.length - 1;
    }
  }

  createTabButton(_name = "Enreg."){
    let li = document.createElement("li");
    let a = document.createElement("a");
    a.className = "deletable-tab";

    let icon = document.createElement("span");
    icon.className = "icon";

    let name = document.createElement("span");
    name.innerHTML = _name;

    let close = document.createElement("span");
    close.className = "icon tab-delete button has-text-danger is-white";

    // Add the icons
    let i = document.createElement("i");
    i.className ="fas fa-bookmark";
    icon.appendChild(i);
    let i2 = document.createElement("i");
    i2.className ="fas fa-xmark";
    close.appendChild(i2);


    a.appendChild(icon);
    a.appendChild(name);
    a.appendChild(close);

    li.appendChild(a);

    return li;
  }

  deleteTab(_id){
    let confirmDeleteTab = ()=>{
      this.tabs[_id].button.remove();

      // Call the callback
      if(this.tabs[_id].deleteCB){
        this.tabs[_id].deleteCB(_id);
      }
  
      this.tabs.splice(_id,1);
  
      // Active the tab to the left if possible
      if(this.activeTab === _id){
        if(this.activeTab > 0){
          this.onTabClicked(this.activeTab - 1);
        } else{
          this.onTabClicked(0);
        }
      }
    }

    alertModal({
      type: "warning",
      title: "Fermer un onglet",
      body: "Etes-vous sur de vouloir fermer l'onglet : <strong>" + this.tabs[_id].name + "</strong>",
      confirm: {
        label: "Fermer l'onglet",
        type: "danger",
        cb: confirmDeleteTab
      },
      cancel: "Annuler"
    });

  }

  onTabClicked(_id){
    this.activeTab = _id;

    // Unactivate all buttons
    for(let i = 0; i < this.tabs.length; i++){
      this.tabs[i].button.classList.remove("is-active");
    }

    // Activate the clicked button
	  this.tabs[_id].button.classList.add("is-active");

    // Hide all tabs
    for(let i = 0; i < this.tabs.length; i++){
      this.tabs[i].tab.classList.add("is-hidden");
    }

    // Show the active tab
    this.tabs[_id].tab.classList.remove("is-hidden");

    // Call the callback
    if(this.tabs[_id].clickCB){
      this.tabs[_id].clickCB(_id);
    }
  }

}

/*----------------------------------------------------------------------------------------------
----------------------------------------FULLSCREEN MANAGER--------------------------------------
----------------------------------------------------------------------------------------------*/
class FullscreenManager {
	constructor(_expandButton, _compressButton) {
    this.expandButton = _expandButton;
    this.compressButton = _compressButton;

    this.expandButton.addEventListener("click", ()=>{
      document.documentElement.requestFullscreen();
    });

    this.compressButton.addEventListener("click", ()=>{
      document.exitFullscreen();
    });

    document.documentElement.addEventListener("fullscreenchange", ()=>{
      if (document.fullscreenElement) {
        this.expandButton.classList.add("is-hidden");
        this.compressButton.classList.remove("is-hidden");
      } else {
        this.expandButton.classList.remove("is-hidden");
        this.compressButton.classList.add("is-hidden");
      }
    });
	}
}

/*----------------------------------------------------------------------------------------------
--------------------------------------------SVG LOGOS-------------------------------------------
----------------------------------------------------------------------------------------------*/
function includeLogos(){
  let phywebLogos = document.querySelectorAll(".phyweb-logo");
  phywebLogos.forEach((e) =>{
    e.outerHTML = `
      <svg
        width="28px"
        height="28px"
        viewBox="0 0 30 50"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:svg="http://www.w3.org/2000/svg">
        <path
          fill="currentColor"
          d="M 0,0 V 4.0584501 14.149746 L 3.6344035,9.1379401 H 14.204818 c 3.314029,-9.68e-5 6.000531,2.7278249 6.00015,6.0926599 -4.75e-4,3.364219 -2.686727,6.091182 -6.00015,6.091086 H 0 V 50 L 14.470951,30.46015 c 8.284355,6.6e-5 15.52935,-6.818718 15.529285,-15.230075 C 30.000301,6.8187179 23.284473,-6.6169597e-5 15.000118,0 Z"/>
      </svg>
      `;
  })

  let audioLogos = document.querySelectorAll(".audio-logo");
  audioLogos.forEach((e) =>{
    e.outerHTML = `
      <svg
        width="28px"
        height="28px"
        viewBox="0 0 39.825478 43.453163"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:svg="http://www.w3.org/2000/svg">
        <path
          fill="currentColor"
          d="M 18.496546,0 A 1.5,1.5 0 0 0 16.996379,1.49965 V 5.563485 A 1.5,1.5 0 0 0 15.662093,4.74183 1.5,1.5 0 0 0 14.161927,6.241997 v 7.765417 a 1.5,1.5 0 0 0 -1.332219,-0.81442 1.5,1.5 0 0 0 -1.49965,1.500166 v 3.780131 A 1.5,1.5 0 0 0 9.997323,17.659904 1.5,1.5 0 0 0 8.665104,18.48621 V 17.56637 A 1.5,1.5 0 0 0 7.164938,16.066203 1.5,1.5 0 0 0 5.832719,16.884758 V 15.199073 A 1.5,1.5 0 0 0 4.332552,13.698906 1.5,1.5 0 0 0 2.832902,15.199073 V 18.34255 A 1.5,1.5 0 0 0 1.500167,17.529163 1.5,1.5 0 0 0 0,19.02933 v 5.394503 a 1.5,1.5 0 0 0 1.500167,1.49965 1.5,1.5 0 0 0 1.332735,-0.826307 v 3.156397 a 1.5,1.5 0 0 0 1.49965,1.500167 1.5,1.5 0 0 0 1.500167,-1.500167 v -1.685685 a 1.5,1.5 0 0 0 1.332219,0.818554 1.5,1.5 0 0 0 1.500166,-1.49965 v -0.920357 a 1.5,1.5 0 0 0 1.332219,0.826306 1.5,1.5 0 0 0 1.332735,-0.826306 v 3.79305 a 1.5,1.5 0 0 0 1.49965,1.500167 1.5,1.5 0 0 0 1.332219,-0.814421 v 7.765418 a 1.5,1.5 0 0 0 1.500166,1.500167 1.5,1.5 0 0 0 1.334286,-0.848527 v 4.090706 a 1.5,1.5 0 0 0 1.500167,1.500167 1.5,1.5 0 0 0 1.500167,-1.500167 v -4.646228 a 1.5,1.5 0 0 0 1.332218,0.845427 1.5,1.5 0 0 0 1.500167,-1.500167 v -5.093746 a 1.5,1.5 0 0 0 1.332218,0.851627 1.5,1.5 0 0 0 1.500167,-1.500166 v -6.454387 a 1.5,1.5 0 0 0 1.332218,0.82579 1.5,1.5 0 0 0 1.332736,-0.826307 v 2.462899 a 1.5,1.5 0 0 0 1.49965,1.500167 1.5,1.5 0 0 0 1.332735,-0.831474 v 4.739763 a 1.5,1.5 0 0 0 1.49965,1.49965 1.5,1.5 0 0 0 1.500167,-1.49965 v -1.359607 a 1.5,1.5 0 0 0 1.334285,0.855761 1.5,1.5 0 0 0 1.500167,-1.500166 v -3.189987 a 1.5,1.5 0 0 0 1.332219,0.819072 1.5,1.5 0 0 0 1.500166,-1.500167 v -9.449552 a 1.5,1.5 0 0 0 -1.500166,-1.49965 1.5,1.5 0 0 0 -1.332219,0.818554 v -3.189986 a 1.5,1.5 0 0 0 -1.500167,-1.49965 1.5,1.5 0 0 0 -1.334285,0.855245 v -1.35754 a 1.5,1.5 0 0 0 -1.500167,-1.49965 1.5,1.5 0 0 0 -1.49965,1.49965 v 4.720642 a 1.5,1.5 0 0 0 -1.332735,-0.81442 1.5,1.5 0 0 0 -1.49965,1.500166 v 2.449463 a 1.5,1.5 0 0 0 -1.332736,-0.81287 1.5,1.5 0 0 0 -1.332218,0.825789 v -6.454386 a 1.5,1.5 0 0 0 -1.500167,-1.500167 1.5,1.5 0 0 0 -1.332218,0.852145 V 6.800619 A 1.5,1.5 0 0 0 21.328931,5.300452 1.5,1.5 0 0 0 19.996713,6.146395 V 1.49965 A 1.5,1.5 0 0 0 18.496546,0 Z"/>
      </svg>
      `;
  })

  let audioLogosSmall = document.querySelectorAll(".audio-logo-small");
  audioLogosSmall.forEach((e) =>{
    e.outerHTML = `
      <svg
        width="24px"
        height="24px"
        viewBox="0 0 39.825478 43.453163"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:svg="http://www.w3.org/2000/svg">
        <path
          fill="currentColor"
          d="M 18.496546,0 A 1.5,1.5 0 0 0 16.996379,1.49965 V 5.563485 A 1.5,1.5 0 0 0 15.662093,4.74183 1.5,1.5 0 0 0 14.161927,6.241997 v 7.765417 a 1.5,1.5 0 0 0 -1.332219,-0.81442 1.5,1.5 0 0 0 -1.49965,1.500166 v 3.780131 A 1.5,1.5 0 0 0 9.997323,17.659904 1.5,1.5 0 0 0 8.665104,18.48621 V 17.56637 A 1.5,1.5 0 0 0 7.164938,16.066203 1.5,1.5 0 0 0 5.832719,16.884758 V 15.199073 A 1.5,1.5 0 0 0 4.332552,13.698906 1.5,1.5 0 0 0 2.832902,15.199073 V 18.34255 A 1.5,1.5 0 0 0 1.500167,17.529163 1.5,1.5 0 0 0 0,19.02933 v 5.394503 a 1.5,1.5 0 0 0 1.500167,1.49965 1.5,1.5 0 0 0 1.332735,-0.826307 v 3.156397 a 1.5,1.5 0 0 0 1.49965,1.500167 1.5,1.5 0 0 0 1.500167,-1.500167 v -1.685685 a 1.5,1.5 0 0 0 1.332219,0.818554 1.5,1.5 0 0 0 1.500166,-1.49965 v -0.920357 a 1.5,1.5 0 0 0 1.332219,0.826306 1.5,1.5 0 0 0 1.332735,-0.826306 v 3.79305 a 1.5,1.5 0 0 0 1.49965,1.500167 1.5,1.5 0 0 0 1.332219,-0.814421 v 7.765418 a 1.5,1.5 0 0 0 1.500166,1.500167 1.5,1.5 0 0 0 1.334286,-0.848527 v 4.090706 a 1.5,1.5 0 0 0 1.500167,1.500167 1.5,1.5 0 0 0 1.500167,-1.500167 v -4.646228 a 1.5,1.5 0 0 0 1.332218,0.845427 1.5,1.5 0 0 0 1.500167,-1.500167 v -5.093746 a 1.5,1.5 0 0 0 1.332218,0.851627 1.5,1.5 0 0 0 1.500167,-1.500166 v -6.454387 a 1.5,1.5 0 0 0 1.332218,0.82579 1.5,1.5 0 0 0 1.332736,-0.826307 v 2.462899 a 1.5,1.5 0 0 0 1.49965,1.500167 1.5,1.5 0 0 0 1.332735,-0.831474 v 4.739763 a 1.5,1.5 0 0 0 1.49965,1.49965 1.5,1.5 0 0 0 1.500167,-1.49965 v -1.359607 a 1.5,1.5 0 0 0 1.334285,0.855761 1.5,1.5 0 0 0 1.500167,-1.500166 v -3.189987 a 1.5,1.5 0 0 0 1.332219,0.819072 1.5,1.5 0 0 0 1.500166,-1.500167 v -9.449552 a 1.5,1.5 0 0 0 -1.500166,-1.49965 1.5,1.5 0 0 0 -1.332219,0.818554 v -3.189986 a 1.5,1.5 0 0 0 -1.500167,-1.49965 1.5,1.5 0 0 0 -1.334285,0.855245 v -1.35754 a 1.5,1.5 0 0 0 -1.500167,-1.49965 1.5,1.5 0 0 0 -1.49965,1.49965 v 4.720642 a 1.5,1.5 0 0 0 -1.332735,-0.81442 1.5,1.5 0 0 0 -1.49965,1.500166 v 2.449463 a 1.5,1.5 0 0 0 -1.332736,-0.81287 1.5,1.5 0 0 0 -1.332218,0.825789 v -6.454386 a 1.5,1.5 0 0 0 -1.500167,-1.500167 1.5,1.5 0 0 0 -1.332218,0.852145 V 6.800619 A 1.5,1.5 0 0 0 21.328931,5.300452 1.5,1.5 0 0 0 19.996713,6.146395 V 1.49965 A 1.5,1.5 0 0 0 18.496546,0 Z"/>
      </svg>
      `;
  })

  let rw3Logos = document.querySelectorAll(".rw3-logo");
  rw3Logos.forEach((e) =>{
    e.outerHTML = `
      <svg
        style="height:20px"
        viewBox="0 0 512 512"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:svg="http://www.w3.org/2000/svg">
        <path
          fill="currentColor"
          d="M 0,64 C 0,28.7 28.7,0 64,0 h 160 v 128 c 0,17.7 14.3,32 32,32 H 384 V 304 H 176 c -35.3,0 -64,28.7 -64,64 V 512 H 64 C 28.7,512 0,483.3 0,448 Z m 384,64 H 256 V 0 Z"
          id="path1"
          sodipodi:nodetypes="sscssccsscssscccc" />
        <path
          fill="currentColor"
          d="M 433.11773,352 C 427.00668,352 422,358.46629 422,366.35892 c 0,7.89265 5.00668,14.35894 11.11773,14.35894 h 34.94095 l -29.74191,35.22425 h -5.4e-4 c -3.36621,3.98903 -4.5139,10.27861 -2.84664,15.79655 1.66166,5.4993 5.77709,9.14995 10.35413,9.14995 h 27.52964 c 9.10763,0 16.41189,9.4337 16.41189,21.19651 0,11.7628 -7.30426,21.19651 -16.41189,21.19651 H 452.5474 c -3.79672,0 -7.29087,-2.7575 -8.98559,-7.1621 l -0.002,-0.004 -0.50408,-1.30274 c -2.73055,-7.05321 -9.44631,-9.94485 -14.9074,-6.41826 -5.4611,3.52659 -7.70003,12.20021 -4.96948,19.25341 l 0.50304,1.2994 c 5.44998,14.11177 16.64352,23.05214 28.8651,23.05214 h 20.80596 c 21.31058,0 38.64737,-22.39102 38.64737,-49.91436 0,-27.08563 -16.79937,-49.15237 -37.64335,-49.84893 L 504.1542,376.9465 h 5.3e-4 c 3.36622,-3.98904 4.51391,-10.27863 2.84664,-15.79656 C 505.33941,355.65064 501.22396,352 496.64692,352 Z"
          id="path3"
          sodipodi:nodetypes="ssscccsssssssccsscssscccsss" />
        <g
          id="path1-9"
          transform="matrix(0.24998805,0,0,0.34186847,155.84978,344.47889)">
          <path
            fill="currentColor"
            d="m 64,22 c -40.720167,0 -74,33.279833 -74,74 v 192 160 c 0,23.08604 18.9139591,42 42,42 23.086041,0 42,-18.91396 42,-42 V 330 h 80.09375 l 99.5,142.11523 c 13.2074,18.96113 39.59365,23.57485 58.52148,10.39063 18.96113,-13.2074 23.57485,-39.59365 10.39063,-58.52149 l -0.008,-0.0117 L 245.17364,313.5879 C 295.4792,288.22243 330,236.09347 330,176 330,91.09128 260.90872,22 176,22 Z m 10,84 h 102 c 38.80026,0 70,31.19974 70,70 0,38.80026 -31.19974,70 -70,70 H 74 Z"
            id="path3-3"
            sodipodi:nodetypes="sscssscccscccssscssscc" />
        </g>
        <g
          id="path1-6"
          transform="matrix(0.25170151,0,0,0.34184249,258.82319,344.48697)">
          <path
            fill="currentColor"
            d="m 288,22 c -18.56618,0 -35.06918,12.285737 -40.29883,30.197266 v 0.002 L 171.01562,315.04883 71.363281,49.185547 l -0.002,-0.0039 C 63.252722,27.602284 38.88427,16.533694 17.300781,24.632812 c -0.002,7.29e-4 -0.0039,0.0012 -0.0059,0.002 -21.6663548,8.0959 -32.765042,32.491708 -24.6582032,54.076171 l 0.00195,0.0039 c 2.261e-4,6.02e-4 -2.261e-4,0.0014 0,0.002 L 136.64453,462.83008 l 0.008,0.0215 c 6.41507,16.88864 22.95793,27.79784 40.91211,27.14258 18.00559,-0.65714 33.62199,-12.88315 38.72657,-30.16016 l 0.004,-0.0176 71.69922,-245.78711 71.5957,245.73632 c 7.5e-4,0.003 0.001,0.005 0.002,0.008 4.99614,17.3423 20.6939,29.43506 38.67382,30.21679 18.11038,0.78741 34.70601,-10.27227 41.00586,-27.20312 l 143.99024,-383.968751 0.002,-0.0078 C 591.3579,57.257892 580.38153,32.830675 558.6996,24.732604 537.05725,16.649318 512.73742,27.731279 504.63905,49.283385 v 0.002 L 404.98633,315.05664 328.29687,52.189453 l -0.004,-0.01172 C 323.05363,34.363979 306.61313,22 288,22 Z"
            id="path3-6"
            sodipodi:nodetypes="sccccccccccccscccccscccscccccs" />
        </g>
      </svg>
      `;
  })

}

/*----------------------------------------------------------------------------------------------
-------------------------------------EXPORT/IMPORT FUNCTIONS------------------------------------
----------------------------------------------------------------------------------------------*/

function exportToCSV(_series, _rowMustBeComplete = false){
  let csv = [];
  let row = [];

  let hasNameFlag = false;

  // create the name row and find the length of the biggest serie
  let largestSerieLength = 0;
  for(let i = 0; i < _series.length; i++){
    if(_series[i].name){
      hasNameFlag = true;
      row.push(_series[i].name);
    } else {
      row.push("");
    }

    if(_series[i].values.length > largestSerieLength){
      largestSerieLength = _series[i].values.length;
    }
  }
  // At least one serie has a name
  if(hasNameFlag){
    csv.push(row.join(","));
  }

  // push value rows
  for(let i = 0; i < largestSerieLength; i++){
    let row = [];
    let rowIsComplete = true;
    for(let j = 0; j < _series.length; j++){
      if(_series[j].values[i] === "" || _series[j].values[i] === undefined){
        rowIsComplete = false;
      }
      row.push(_series[j].values[i]);
    }
    if(_rowMustBeComplete){
      if(rowIsComplete){
        csv.push(row.join(","));
      }
    } else{
      csv.push(row.join(","));
    }
  }

  return csv.join("\n");
}

function exportToRW3(_series, _rowMustBeComplete = false, _title){
  let rw3 = []

  rw3.push("EVARISTE REGRESSI WINDOWS 1.0");

  // Names + find largest serie
  rw3.push("£" + _series.length + " NOM VAR");
  let largestSerieLength = 0;
  for(let i = 0; i < _series.length; i++){
    rw3.push(_series[i].name);

    if(_series[i].values.length > largestSerieLength){
      largestSerieLength = _series[i].values.length;
    }
  }

  // Genre ???
  rw3.push("£" + _series.length + " GENRE VAR");
  for(let i = 0; i < _series.length; i++){
    rw3.push("0");
  }

  // Units
  rw3.push("£" + _series.length + " UNITE VAR");
  for(let i = 0; i < _series.length; i++){
    if(_series[i].unit){
      rw3.push(_series[i].unit);
    } else{
      rw3.push("");
    }
  }

  rw3.push("£1 TRIGO");
  rw3.push("0");
  rw3.push("£1 LOG");
  rw3.push("0");
  rw3.push("£1 MEMO GRANDEURS");
  rw3.push("'"+_title);
  rw3.push("£2 ACQUISITION");
  rw3.push("CLAVIER");
  rw3.push("");
  rw3.push("£0 GRAPHE VAR");
  rw3.push("&5 X");
  rw3.push(_series[0].name);
  rw3.push("");
  rw3.push("");
  rw3.push("");
  rw3.push("");
  rw3.push("&5 Y");
  rw3.push(_series[1].name);
  rw3.push("");
  rw3.push("");
  rw3.push("");
  rw3.push("");
  rw3.push("&5 MONDE");
  rw3.push("1");
  rw3.push("1");
  rw3.push("1");
  rw3.push("1");
  rw3.push("1");
  rw3.push("&3 GRADUATION");
  rw3.push("0");
  rw3.push("0");
  rw3.push("0");
  rw3.push("&3 ZERO");
  rw3.push("1");
  rw3.push("1");
  rw3.push("1");
  rw3.push("&7 OPTIONS");
  rw3.push("12");
  rw3.push("2");
  rw3.push("1");
  rw3.push("3");
  rw3.push("3");
  rw3.push("0");
  rw3.push("0");
  rw3.push("£1 PAGE COMMENT");
  rw3.push("");

  // Values
  rw3.push("&" + largestSerieLength + " VALEUR VAR");

  for(let i = 0; i < largestSerieLength; i++){
    let row = [];
    let rowIsComplete = true;
    for(let j = 0; j < _series.length; j++){
      if(_series[j].values[i] === "" || _series[j].values[i] === undefined){
        rowIsComplete = false;
      }
      row.push(_series[j].values[i]);
    }
    if(_rowMustBeComplete){
      if(rowIsComplete){
        rw3.push(row.join(" "));
      }
    } else{
      rw3.push(row.join(" "));
    }
  }

  rw3.push("&2 OPTIONS");
  rw3.push("1");
  rw3.push("1");

  return rw3.join("\n");
}

async function downloadFile(_file, _type,_name){
  let mime;
  if(_type === "wav"){
    mime = "audio/wav";
  }
  if(_type === "csv" || _type === "rw3"){
    mime = "text/" + _type;
  }
  const blob = new Blob([_file], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = _name+"."+_type;
  a.click();
}



/*----------------------------------------------------------------------------------------------
------------------------------------------MISC FUNCTIONS----------------------------------------
----------------------------------------------------------------------------------------------*/
// TODO still usefull ?
/*function maxOfArray(array){
  let max = 0;
  for(let i = 0; i < array.length; i++){
    if(array[i] > max){
      max = array[i];
    }
  }
  return max;
}*/

export {Common, ModalManager, alertModal, TabManager, exportToCSV, exportToRW3, downloadFile};