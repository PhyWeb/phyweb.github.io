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
    console.log("Updating spreadsheet...");
    const significantDigits = this.data.settings.significantDigits;

    // Récupération des en-têtes pour construire la config des colonnes
    const headers = this.data.getHeaders();
    const columnsConfig = headers.map(() => ({ type: 'numeric' }));

    this.hot.updateSettings({
      data: this.data.getTable(),
      colHeaders: headers,
      columns: columnsConfig,
      autoColumnSize: false,
      autoRowSize: false,
      cells: (row, col, prop) => ({
        renderer: (instance, td, row, col, prop, value, cellProperties) => {
          value = formatNumber(value, significantDigits);
          Handsontable.renderers.TextRenderer.apply(this, [instance, td, row, col, prop, value, cellProperties]);
        }
      })
    });
  }

  build(uiManager){
    const onSpreadsheetHeaderDblClick = (colIndex) => {
      const curve = this.data.getCurveByIndex(colIndex);
      if (curve) {
        // Empêche de renommer une grandeur calculée
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

      //this.update();  // TODO only update cells that changed
      this.cb(change);
    };

    // Gestion du double-clic sur un en-tête de colonne
    const afterOnCellMouseDown = (event, coords, TD) => {
      // coords.row === -1 correspond à un en-tête de colonne
      if (event.detail === 2 && coords.row === -1) {
        event.stopImmediatePropagation();
        onSpreadsheetHeaderDblClick(coords.col);
      }
    };

    const afterGetColHeader = (col, TH) => {
      // S'applique uniquement aux en-têtes de colonnes (col >= 0)
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
      columns: this.data.getHeaders().map(() => ({ type: 'numeric' })), 
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
      licenseKey: 'non-commercial-and-evaluation', // for non-commercial use only
      cells: (row, col) => ({
        renderer: (instance, td, row, col, prop, value, cellProperties) => {
          value = formatNumber(value, significantDigits);
          Handsontable.renderers.TextRenderer.apply(this, [instance, td, row, col, prop, value, cellProperties]);
        }
      })
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
}

export {Spreadsheet};