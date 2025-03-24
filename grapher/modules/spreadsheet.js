const $ = document.querySelector.bind(document);

/*----------------------------------------------------------------------------------------------
--------------------------------------------Spreadsheet-----------------------------------------
----------------------------------------------------------------------------------------------*/
export default class Spreadsheet {
  constructor(_data, _cb) {
    this.data = _data;
    this.cb = _cb;
    this.hot;
  }   

  addCurve(_title, _unit, _size, _fill){

    this.data.addCurve(_title, _unit, _size, _fill);

    // Update the spreadsheet
    this.update();
  }

  update(){
    this.hot.updateSettings({
      data: this.data.getTable(),
      colHeaders: this.data.getHeaders()
    });
  }

  build(){
    const container = document.querySelector('#table');

    const afterChange = (change, source) =>  {

      if (source === "loadData" || source === "updateData") {
        return; //don't save this change
      }
    
      change.forEach(element => {
        this.data.setValue(element[1], element[0], element[3]);
      });

      this.update();

      this.cb(change);
    
    }
    
    this.hot = new Handsontable(container, {
      data: this.data.getTable(),
      type: 'numeric',
      minSpareRows: 1,
      rowHeaders: true,
      colHeaders: this.data.getHeaders(),
      height: 'auto',
      autoWrapRow: true,
      autoWrapCol: true,
      afterChange: afterChange,
      licenseKey: 'non-commercial-and-evaluation' // for non-commercial use only
    });
  }

}

export {Spreadsheet};