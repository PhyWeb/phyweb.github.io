const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('electronAPI', {
  close: () => ipcRenderer.send('close'),
  minimize: () => ipcRenderer.send('minimize'),
  restore: () => ipcRenderer.send('restore'),
  maximize: () => ipcRenderer.send('maximize'),
  isMaximized: () => ipcRenderer.invoke('isMaximized'),

  // Envoi de données (depuis Tracker/Audio vers Grapher)
  openGrapherWindow: (data) => ipcRenderer.send('openGrapherWindow', data),

  // Réception de données (Grapher écoute si on lui envoie des données au démarrage)
  onImportData: (callback) => ipcRenderer.on('import-data', (_event, value) => callback(value))
})