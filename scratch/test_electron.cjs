const electron = require('electron');
const fs = require('fs');
fs.writeFileSync('scratch/electron_test.txt', typeof electron + ' ' + JSON.stringify(Object.keys(electron)));
