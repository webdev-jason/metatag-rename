const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process'); // Core Concept: Allows us to run background terminal commands

async function handleFolderOpen() {
    const { canceled, filePaths } = await dialog.showOpenDialog({
        title: 'Select Music Folder',
        properties: ['openDirectory']
    });
    if (!canceled) return filePaths;
}

async function handleFilesOpen() {
    const { canceled, filePaths } = await dialog.showOpenDialog({
        title: 'Select Music Files',
        properties: ['openFile', 'multiSelections'],
        filters: [{ name: 'Audio Files', extensions: ['mp3', 'm4a', 'flac', 'ogg'] }]
    });
    if (!canceled) return filePaths;
}

// Our new execution handler
async function handleRunRenamer(event, targetPaths) {
    return new Promise((resolve, reject) => {
        // Point exactly to the Python executable inside our virtual environment
        const pythonExe = path.join(__dirname, 'venv', 'Scripts', 'python.exe');
        const scriptPath = path.join(__dirname, 'renamer.py');
        
        // We pass the targets as a JSON string so Python can parse it easily
        const args = [scriptPath, JSON.stringify(targetPaths)];
        
        // Spawn the Python process!
        const pythonProcess = spawn(pythonExe, args);
        
        let outputData = '';
        let errorData = '';

        // Listen for standard output (JSON string printed by Python)
        pythonProcess.stdout.on('data', (data) => {
            outputData += data.toString();
        });

        // Listen for Python crashes/errors
        pythonProcess.stderr.on('data', (data) => {
            errorData += data.toString();
        });

        // When the script finishes...
        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                // If code isn't 0, Python crashed.
                resolve({ status: 'error', message: errorData || 'Python process failed' });
            } else {
                try {
                    // Convert the printed JSON string back into a JavaScript object
                    const result = JSON.parse(outputData);
                    resolve(result);
                } catch (e) {
                    resolve({ status: 'error', message: 'Failed to parse Python output.' });
                }
            }
        });
    });
}

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
    ipcMain.handle('dialog:openDirectory', handleFolderOpen);
    ipcMain.handle('dialog:openFiles', handleFilesOpen);
    ipcMain.handle('app:runRenamer', handleRunRenamer); // Register our new pathway
    
    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});