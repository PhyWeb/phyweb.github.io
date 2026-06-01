const $ = document.querySelector.bind(document);
import { formatNumber } from '../../common/formatter.js';
import { alertModal } from '../../common/common.js';

/*----------------------------------------------------------------------------------------------
--------------------------------------------Spreadsheet-----------------------------------------
----------------------------------------------------------------------------------------------*/
class Spreadsheet {
  constructor(data, cb) {
    this.data = data;
    this.cb = cb;
    this.hot;
  }   

  addCurve(title, unit, size, fill, line, markers){

    let curve = this.data.addCurve(title, unit, size, fill, line, markers);

    this.update();

    return curve;
  }

update(){
    const significantDigits = this.data.settings.significantDigits;
    const headers = this.data.getHeaders();

    const columnsConfig = headers.map(() => ({ 
      type: 'numeric',
      renderer: (instance, td, row, col, prop, value, cellProperties) => {
        // 1. Conversion de sécurité : on s'assure d'avoir un vrai nombre
        let parsedValue = value;
        if (typeof value === 'string' && value.trim() !== '') {
          parsedValue = parseFloat(value.replace(',', '.'));
        }

        // 2. Formatage uniquement si c'est un nombre valide
        let formattedValue = value;
        if (parsedValue !== null && parsedValue !== undefined && !isNaN(parsedValue) && value !== '') {
          formattedValue = formatNumber(parsedValue, significantDigits);
        }

        // 3. Application de l'affichage via le renderer de texte
        Handsontable.renderers.getRenderer('text')(instance, td, row, col, prop, formattedValue, cellProperties);
      }
    }));

    this.hot.updateSettings({
      data: this.data.getTable(),
      colHeaders: headers,
      columns: columnsConfig,
      autoColumnSize: false,
      autoRowSize: false
    });
  }

  build(uiManager){
    const onSpreadsheetHeaderDblClick = (colIndex) => {
      const curve = this.data.getCurveByIndex(colIndex);
      if (curve) {
        if (curve.type === 'calculation') {
          alertModal({
            title: "Action impossible",
            body: "Vous ne pouvez pas renommer une grandeur qui est le résultat d'un calcul.",
            confirm: "OK"
          });
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
    
    this.hot = new Handsontable(container, {
      data: this.data.getTable(),
      type: 'numeric',
      minSpareRows: 1,
      rowHeaders: true,
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