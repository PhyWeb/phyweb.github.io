const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('electronAPI', {
  close: () => ipcRenderer.send('close'),
  minimize: () => ipcRenderer.send('minimize'),
  restore: () => ipcRenderer.send('restore'),
  maximize: () => ipcRenderer.send('maximize'),
  isMaximized: () => ipcRenderer.invoke('isMaximized')
})