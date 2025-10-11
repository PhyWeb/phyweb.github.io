const { app, BrowserWindow, globalShortcut } = require('electron/main')
const { ipcMain } = require('electron')
const path = require('node:path')

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    frame: false,
    icon: __dirname + '/assets/icons/phyweb.png',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadFile('index.html')

  // Open the DevTools.
  win.webContents.openDevTools()
  win.webContents.on('before-input-event', (_, input) => {
    if (input.type === 'keyDown' && input.key === 'F12') {
      win.webContents.toggleDevTools();
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })

  // window controls
  ipcMain.on('close', (event) => {
    win.close();
  })
  ipcMain.on('minimize', (event) => {
    win.minimize();
  })
  ipcMain.on('restore', (event) => {
    win.restore();
  })
  ipcMain.on('maximize', (event) => {
    win.maximize();
  })

  ipcMain.handle('isMaximized', async ()=> {
    return win.isMaximized();
  })
}

app.whenReady().then(() => {
  // Open the DevTools.
  // Raccourci global F12 pour basculer DevTools de la fenêtre focalisée

  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})