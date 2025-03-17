const $ = document.querySelector.bind(document);

/*----------------------------------------------------------------------------------------------
----------------------------------------------Grapher-------------------------------------------
----------------------------------------------------------------------------------------------*/
export default class Spreadsheet {
  constructor(_data) {
    this.data = _data;
    this.hot;
  }   

  build(){
    const container = document.querySelector('#table');

    function afterChange(change, source) {
      if (source === 'loadData') {
        return; //don't save this change
      }
    
      change.forEach(element => {
        this.data.setValue(element[1], element[0], element[3]);
      });
    
      console.log("data", this.data.series);
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