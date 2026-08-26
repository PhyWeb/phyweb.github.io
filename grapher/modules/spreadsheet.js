const $ = document.querySelector.bind(document);
import { formatNumber } from '../../common/formatter.js';
import { alertModal, showToast } from '../../common/common.js';

/*----------------------------------------------------------------------------------------------
--------------------------------------------Spreadsheet-----------------------------------------
----------------------------------------------------------------------------------------------*/
class Spreadsheet {
  constructor(data, cb) {
    this.data = data;
    this.cb = cb;
    this.hot;

    // Paramètres de pagination
    this.currentPage = 0;
    this.pageSize = 10000;
  }   

  addCurve(title, unit, size, fill, line, markers){

    let curve = this.data.addCurve(title, unit, size, fill, line, markers);

    this.update();

    return curve;
  }

  update(){
    const headers = this.data.getHeaders();
    const currentHeaders = this.hot ? this.hot.getColHeader() : null; 
    
    const headersChanged = !currentHeaders || 
                           headers.length !== currentHeaders.length || 
                           headers.some((h, i) => h !== currentHeaders[i]);

    const fullTableData = this.data.getTable();
    const totalRows = fullTableData.length;

    // Découpage des données (Pagination)
    const startIdx = this.currentPage * this.pageSize;
    const endIdx = Math.min(startIdx + this.pageSize, totalRows);
    const displayData = fullTableData.slice(startIdx, endIdx);

    // Mise à jour de l'UI de pagination
    this.updatePaginationUI(totalRows, startIdx, endIdx);

    if (!headersChanged) {
      this.hot.loadData(displayData);
    } else {
      const columnsConfig = headers.map(() => ({ 
        type: 'numeric',
        renderer: (instance, td, row, col, prop, value, cellProperties) => {
          const currentSignificantDigits = this.data.settings.significantDigits;
          let parsedValue = value;
          if (typeof value === 'string' && value.trim() !== '') {
            parsedValue = parseFloat(value.replace(',', '.'));
          }

          let formattedValue = value;
          if (parsedValue !== null && parsedValue !== undefined && !isNaN(parsedValue) && value !== '') {
            formattedValue = formatNumber(parsedValue, currentSignificantDigits);
          }
          Handsontable.renderers.getRenderer('text')(instance, td, row, col, prop, formattedValue, cellProperties);
        }
      }));

      this.hot.updateSettings({
        data: displayData,
        colHeaders: headers,
        columns: columnsConfig,
        // Fonction dynamique pour calculer le bon numéro de ligne (à cause de la pagination)
        rowHeaders: (index) => {
           return (this.currentPage * this.pageSize) + index + 1;
        },
        autoColumnSize: false,
        autoRowSize: false
      });
    }
  }

  // Met à jour les boutons et le texte
  updatePaginationUI(totalRows) {
    const controls = document.getElementById('pagination-controls');
    const firstBtn = document.getElementById('page-first-button');
    const prevBtn = document.getElementById('page-prev-button');
    const nextBtn = document.getElementById('page-next-button');
    const lastBtn = document.getElementById('page-last-button');
    const pageInput = document.getElementById('page-input');
    const totalLabel = document.getElementById('page-total-label');

    if (!controls) return;

    const totalPages = Math.ceil(totalRows / this.pageSize);

    if (totalRows <= this.pageSize) {
      controls.classList.add('is-hidden');
    } else {
      controls.classList.remove('is-hidden');
      
      pageInput.value = this.currentPage + 1;
      pageInput.max = totalPages;
      totalLabel.textContent = `sur ${totalPages}`;

      // Désactiver au début
      const isFirst = this.currentPage === 0;
      firstBtn.disabled = isFirst;
      prevBtn.disabled = isFirst;

      // Désactiver à la fin
      const isLast = this.currentPage >= totalPages - 1;
      nextBtn.disabled = isLast;
      lastBtn.disabled = isLast;
    }
  }

build(uiManager){
    const onSpreadsheetHeaderDblClick = (colIndex) => {
      const curve = this.data.getCurveByIndex(colIndex);
      if (curve) {
        if (curve.type === 'calculation') {
          showToast("Vous ne pouvez pas renommer une grandeur issue d'un calcul.", "is-danger");
          return;
        }
        uiManager.openEditHeaderModal(curve);
      }
    }

    const container = document.querySelector('#table');
    const significantDigits = this.data.settings.significantDigits;

    const afterChange = (change, source) =>  {
      if (source === "loadData" || source === "updateData") {
        return; //don't save this change
      }
    
      change.forEach(element => {
        this.data.setValue(element[1], element[0], element[3]);
      });

      this.cb(change);
    };

    const afterOnCellMouseDown = (event, coords, TD) => {
      if (event.detail === 2 && coords.row === -1) {
        event.stopImmediatePropagation();
        onSpreadsheetHeaderDblClick(coords.col);
      }
    };

    const afterGetColHeader = (col, TH) => {
      if (col >= 0) {
        const curve = this.data.getCurveByIndex(col);
        if (!curve) return;
        if (curve.type !== 'calculation') {
          TH.style.cursor = 'pointer';
          TH.setAttribute('title', 'Double-cliquer pour éditer');
        } 
      }
    };
    
    // --- SECURITE : Initialisation de la pagination au cas où ---
    if (typeof this.currentPage === 'undefined') this.currentPage = 0;
    if (typeof this.pageSize === 'undefined') this.pageSize = 10000;

    // --- DECOUPAGE DES DONNÉES (PAGINATION) ---
    const fullTableData = this.data.getTable();
    const startIdx = this.currentPage * this.pageSize;
    const endIdx = Math.min(startIdx + this.pageSize, fullTableData.length);
    const displayData = fullTableData.slice(startIdx, endIdx);

    // --- CRÉATION DU TABLEAU ---
    this.hot = new Handsontable(container, {
      data: displayData, // On ne charge que la première page
      type: 'numeric',
      minSpareRows: 1,
      // On calcule le bon numéro de ligne
      rowHeaders: (index) => {
        return (this.currentPage * this.pageSize) + index + 1;
      },
      colHeaders: this.data.getHeaders(),
      columns: this.data.getHeaders().map(() => ({ 
        type: 'numeric',
        renderer: (instance, td, row, col, prop, value, cellProperties) => {
          let parsedValue = value;
          if (typeof value === 'string' && value.trim() !== '') {
            parsedValue = parseFloat(value.replace(',', '.'));
          }

          let formattedValue = value;
          if (parsedValue !== null && parsedValue !== undefined && !isNaN(parsedValue) && value !== '') {
            formattedValue = formatNumber(parsedValue, significantDigits);
          }

          Handsontable.renderers.getRenderer('text')(instance, td, row, col, prop, formattedValue, cellProperties);
        }
      })),
      afterOnCellMouseDown: afterOnCellMouseDown,
      afterGetColHeader: afterGetColHeader,
      autoColumnSize: false,
      autoRowSize: false,
      rowHeaderWidth: 80,
      colWidths: 100,
      manualColumnResize: true,
      height: 500,
      autoWrapRow: true,
      autoWrapCol: true,
      afterChange: afterChange,
      outsideClickDeselects: false,
      licenseKey: 'non-commercial-and-evaluation', 
    });
  }

  clear() {
    // Vide les données et réinitialise les en-têtes/colonnes
    this.hot.updateSettings({
      data: [],
      colHeaders: true,
      columns: null
    });
  }

focusFirstCell(editMode = false) {
    if (!this.hot) return;

    // On s'abonne au prochain rendu naturel du tableau
    this.hot.addHookOnce('afterRender', () => {
      
      // Le délai de 0 milliseconde libère la pile d'exécution (call stack)
      // Cela évite la boucle infinie tout en garantissant un focus immédiat.
      setTimeout(() => {
        // On vérifie que le tableau n'a pas été détruit entre temps
        if (this.hot && this.hot.countRows() > 0 && this.hot.countCols() > 0) {
          
          this.hot.selectCell(0, 0);

          if (editMode) {
            const activeEditor = this.hot.getActiveEditor();
            if (activeEditor) {
              if (typeof activeEditor.enableFullEditMode === 'function') {
                activeEditor.enableFullEditMode();
              }
              activeEditor.beginEditing();
            }
          }
        }
      }, 0);
      
    });
  }
}

export {Spreadsheet};