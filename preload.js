const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('zzearch', {
  openExternal: (url) => ipcRenderer.invoke('open-external', url)
});