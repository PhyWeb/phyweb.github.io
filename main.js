const { app, BrowserWindow, globalShortcut } = require('electron/main')
const { ipcMain } = require('electron')
const path = require('node:path')

// Création d'un Set global pour stocker les références des fenêtres
const windows = new Set();

const createWindow = (winPath) => {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    frame: false,
    icon: __dirname + '/assets/icons/phyweb.png',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,  // recommandé et nécessaire pour contextBridge
      nodeIntegration: false,  // désactivé pour sécurité
    }
  })

  windows.add(win);

  win.loadFile(winPath)

  // Open the DevTools.
  win.webContents.on('before-input-event', (_, input) => {
    if (input.type === 'keyDown' && input.key === 'F12') {
      win.webContents.toggleDevTools();
    }
  });

  // Permet à la mémoire d'être libérée proprement.
  win.on('closed', () => {
    windows.delete(win);
  });

  return win;
}

app.whenReady().then(() => {
  // create the main window
  createWindow("index.html")

  ipcMain.on('openGrapherWindow', (event, data) => {
    // Create the grapher window
    const grapherWin = createWindow("grapher/index.html")

    grapherWin.webContents.once('did-finish-load', () => {
      grapherWin.webContents.send('import-data', data);
    });
  });

  // window controls
  ipcMain.on('close', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) win.close();
  });

  ipcMain.on('minimize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) win.minimize();
  })

  ipcMain.on('restore', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) win.restore();
  })

  ipcMain.on('maximize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) win.maximize();
  })

  ipcMain.handle('isMaximized', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) return win.isMaximized();
    return false;
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})