const { app, BrowserWindow, shell, globalShortcut, screen } = require('electron/main')
const { ipcMain } = require('electron')
const path = require('node:path')
const fs = require('node:fs')

// Création d'un Set global pour stocker les références des fenêtres
const windows = new Set();

const createWindow = (winPath) => {
  // Définit le chemin du fichier de sauvegarde dans les données de l'utilisateur (AppData)
  const stateFileName = winPath.replace(/[\/\\]/g, '_') + '-state.json';
  const stateFilePath = path.join(app.getPath('userData'), stateFileName);

  // Charge l'état précédent (ou valeurs par défaut)
  let windowState = { width: 1280, height: 720 };
  try {
    if (fs.existsSync(stateFilePath)) {
      windowState = JSON.parse(fs.readFileSync(stateFilePath, 'utf-8'));
      
      // SÉCURITÉ MULTI-ÉCRANS
      if (windowState.x !== undefined && windowState.y !== undefined) {
        const displays = screen.getAllDisplays();
        
        // Vérifie si le coin supérieur gauche de la fenêtre est dans les limites d'un écran actif
        const isVisible = displays.some(display => {
          const bounds = display.bounds;
          return (
            windowState.x >= bounds.x &&
            windowState.y >= bounds.y &&
            windowState.x < bounds.x + bounds.width &&
            windowState.y < bounds.y + bounds.height
          );
        });

        // Si l'écran a été débranché, on supprime X et Y pour centrer la fenêtre sur l'écran principal
        if (!isVisible) {
          delete windowState.x;
          delete windowState.y;
        }
      }
    }
  } catch (e) {
    console.error("Impossible de lire l'état de la fenêtre", e);
  }

  // Crée la fenêtre
  const win = new BrowserWindow({
    x: windowState.x,
    y: windowState.y,
    width: windowState.width,
    height: windowState.height,
    frame: false,
    icon: process.windowsStore ? undefined : path.join(__dirname, 'assets/icons/phyweb.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,  
      nodeIntegration: false,  
    }
  });

  // Restaure l'état maximisé s'il l'était
  if (windowState.isMaximized) {
    win.maximize();
  }

  // Intercepte toutes les tentatives d'ouverture de nouvelles fenêtres
  win.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' }; 
  });

  windows.add(win);
  win.loadFile(winPath);

  win.webContents.on('before-input-event', (_, input) => {
    if (input.type === 'keyDown' && input.key === 'F12') {
      win.webContents.toggleDevTools();
    }
  });

  // Sauvegarde l'état juste avant la fermeture de la fenêtre
  win.on('close', () => {
    try {
      // getNormalBounds() récupère les dimensions réelles, même si la fenêtre est actuellement maximisée !
      const bounds = win.getNormalBounds(); 
      const stateToSave = {
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
        isMaximized: win.isMaximized()
      };
      fs.writeFileSync(stateFilePath, JSON.stringify(stateToSave));
    } catch (e) {
      console.error("Erreur lors de la sauvegarde de l'état", e);
    }
    
    windows.delete(win);
  });

  // Écouter le redimensionnement natif pour vos icônes UI
  win.on('maximize', () => win.webContents.send('window-maximized'));
  win.on('unmaximize', () => win.webContents.send('window-unmaximized'));

  return win;
}

app.whenReady().then(() => {
  const args = process.argv;
  let fileToLoad = null;

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