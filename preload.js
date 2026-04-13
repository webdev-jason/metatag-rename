const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    selectFolder: () => ipcRenderer.invoke('dialog:openDirectory'),
    selectFiles: () => ipcRenderer.invoke('dialog:openFiles'),
    // New bridge to send our paths to the Python executor
    runRenamer: (paths) => ipcRenderer.invoke('app:runRenamer', paths)
});