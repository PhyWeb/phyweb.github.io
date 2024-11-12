/*----------------------------------------------------------------------------------------------
-----------------------------------------NAVBAR MANAGER-----------------------------------------
----------------------------------------------------------------------------------------------*/


/*----------------------------------------------------------------------------------------------
---------------------------------------MODALMANAGER CLASS---------------------------------------
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
  console.log(_config)
  let modal = createElement("div", "modal is-active", document.body);
  let background = createElement("div", "modal-background", modal);
  let card = createElement("div", "modal-card", modal);
  let head = createElement("header", "modal-card-head", card);
  let title = createElement("p", "modal-card-title", head);
  let body = createElement("section", "modal-card-body", card);

  // Style
  if(_config.width){
    card.style.width = _config.width;
  }
  // Header
  if(_config.title){
    title.innerHTML = _config.title;
  }
  if(_config.type) {
    head.classList.add("has-background-"+_config.type);
  }

  // Body
  if(_config.body){
    body.innerHTML = _config.body;
  }

  // Has a footer
  if(_config.confirm || _config.cancel) {
    let foot = createElement("footer", "modal-card-foot", card);
    let buttons = createElement("div", "buttons", foot);

    if(_config.confirm){
      let confirmButton = createElement("button", "button is-primary", buttons);
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

    if(_config.cancel){
      let cancelButton = createElement("button", "button", buttons);
      cancelButton.addEventListener("click", ()=>{closeAlertModal(modal)});

      if(typeof _config.cancel === "string"){
        cancelButton.innerHTML = _config.cancel;
      } else {
        cancelButton.innerHTML = _config.cancel.label;
      }

      if(_config.cancel.cb){
        cancelButton.addEventListener("click", ()=>{_config.cancel.cb()});
      }
    }
  }

  background.addEventListener("click", ()=>{closeAlertModal(modal)});
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

function maxOfArray(array){
  let max = 0;
  for(let i = 0; i < array.length; i++){
    if(array[i] > max){
      max = array[i];
    }
  }
  return max;
}

export {ModalManager, alertModal, TabManager, FullscreenManager, exportToCSV, exportToRW3, downloadFile};