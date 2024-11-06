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

export {ModalManager, TabManager};