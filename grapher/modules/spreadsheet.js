const $ = document.querySelector.bind(document);

/*----------------------------------------------------------------------------------------------
--------------------------------------------Spreadsheet-----------------------------------------
----------------------------------------------------------------------------------------------*/
export default class Spreadsheet {
  constructor(_data, _cb) {
    console.log(_data)
    this.data = _data;
    this.cb = _cb;
    this.hot;
  }   

  build(){
    const container = document.querySelector('#table');

    const afterChange = (change, source) =>  {
      if (source === 'loadData') {
        return; //don't save this change
      }
    
      change.forEach(element => {
        this.data.setValue(element[1], element[0], parseFloat(element[3]));
      });

      this.cb(change);
    
    }
    
    this.hot = new Handsontable(container, {
      data: this.data.getTable(),
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