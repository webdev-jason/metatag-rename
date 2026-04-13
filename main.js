const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            // Preload scripts are injected before the web page loads.
            // This is how we securely expose Main Process powers to the Renderer.
            preload: path.join(__dirname, 'preload.js'),
            // Context Isolation is a critical security feature in Electron.
            // It prevents the web page from accessing Node.js directly.
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    // Load the index.html of the app.
    mainWindow.loadFile('index.html');
    
    // Open the DevTools automatically for debugging (we will remove this later).
    mainWindow.webContents.openDevTools();
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});