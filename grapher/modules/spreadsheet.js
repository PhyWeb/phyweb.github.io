const $ = document.querySelector.bind(document);

/*----------------------------------------------------------------------------------------------
--------------------------------------------Spreadsheet-----------------------------------------
----------------------------------------------------------------------------------------------*/
export default class Spreadsheet {
  constructor(data, cb) {
    this.data = data;
    this.cb = cb;
    this.hot;
  }   

  addCurve(title, unit, size, fill){

    let curve = this.data.addCurve(title, unit, size, fill);

    // Update the spreadsheet
    this.update();
    // recalcul différé pour forcer l'adaptation
    /*setTimeout(() => {
      const plugin = this.hot.getPlugin('autoColumnSize');
      if (plugin) {
        plugin.recalculateAllColumnsWidth();
        this.hot.render();
      }
    }, 200);*/

    return curve;
  }

  update(){
    console.log("Updating spreadsheet...");
    const maxDigits = this.data.settings.maxDigits;

    this.hot.updateSettings({
      data: this.data.getTable(),
      colHeaders: this.data.getHeaders(),
      autoColumnSize: false,
      autoRowSize: false,
      cells: (row, col) => ({
        type: 'numeric',
        renderer: function (instance, td, row, col, prop, value, cellProperties) {
          if (typeof value === 'number') {
            value = value.toFixed(maxDigits); // Modifie la valeur à afficher
          }

          Handsontable.renderers.TextRenderer.apply(this, [instance, td, row, col, prop, value, cellProperties]);
        }
      })
    });
  }

  build(){
    const container = document.querySelector('#table');
    const maxDigits = this.data.settings.maxDigits; 

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
    
    this.hot = new Handsontable(container, {
      data: this.data.getTable(),
      type: 'numeric',
      minSpareRows: 1,
      rowHeaders: true,
      colHeaders: this.data.getHeaders(),
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
        type: 'numeric',
        renderer: function (instance, td, row, col, prop, value, cellProperties) {
          if (typeof value === 'number') {
            value = value.toFixed(maxDigits);
          }

          Handsontable.renderers.TextRenderer.apply(this, [instance, td, row, col, prop, value, cellProperties]);
        }
      })
    });
  }

  clear() {
    this.hot.loadData([]);
  }
}

export {Spreadsheet};