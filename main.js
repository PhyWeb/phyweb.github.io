const { app, BrowserWindow, shell, globalShortcut } = require('electron/main')
const { ipcMain } = require('electron')
const path = require('node:path')
const fs = require('node:fs') // <-- Ajout du module fs pour lire le fichier

// Création d'un Set global pour stocker les références des fenêtres
const windows = new Set();

const createWindow = (winPath) => {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    frame: false,
    icon: __dirname + '/assets/icons/phyweb.ico',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,  // recommandé et nécessaire pour contextBridge
      nodeIntegration: false,  // désactivé pour sécurité
    }
  })

  // Intercepte toutes les tentatives d'ouverture de nouvelles fenêtres (les liens target="_blank")
  win.webContents.setWindowOpenHandler((details) => {
    // Demande à l'OS d'ouvrir l'URL dans le navigateur par défaut
    shell.openExternal(details.url);
    
    // Bloque la création de la fenêtre interne à Electron
    return { action: 'deny' }; 
  });

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
  const args = process.argv;
  let fileToLoad = null;

  app.setAppUserModelId("PhyWeb.PhyWeb")

  // Vérification des arguments passés à l'application
  if (args.length >= 2) {
    const filePath = args[args.length - 1];
    
    // On vérifie que c'est bien un fichier .pw
    if (filePath.endsWith('.pw')) {
      fileToLoad = filePath;
    }
  }

  // Si on a cliqué sur un fichier .pw depuis l'explorateur
  if (fileToLoad) {
    // Créer directement la fenêtre grapher
    const grapherWin = createWindow("grapher/index.html");

    grapherWin.webContents.once('did-finish-load', () => {
      try {
        // Lire le contenu du fichier
        const fileContent = fs.readFileSync(fileToLoad, 'utf-8');
        // Envoyer les données au grapher
        // Remarque : Si "import-data" attend du JSON parsé, utilisez JSON.parse(fileContent)
        grapherWin.webContents.send('import-data', fileContent);
      } catch (error) {
        console.error("Erreur lors de la lecture du fichier .pw :", error);
      }
    });
  } else {
    // Comportement classique : create the main window
    createWindow("index.html");
  }

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
      createWindow("index.html");
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})