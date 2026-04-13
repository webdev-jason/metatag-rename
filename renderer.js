const selectFolderBtn = document.getElementById('select-folder-btn');
const selectFilesBtn = document.getElementById('select-files-btn');
const executeBtn = document.getElementById('execute-btn');
const pathDisplay = document.getElementById('path-display');
const statusDisplay = document.getElementById('status-display');

let targetPaths = [];

function updateDisplay(paths) {
    if (paths && paths.length > 0) {
        targetPaths = paths;
        executeBtn.disabled = false; // Enable the execution button
        if (paths.length === 1) {
            pathDisplay.innerText = paths[0];
        } else {
            pathDisplay.innerText = `${paths.length} files selected:\n` + paths.join('\n');
        }
        statusDisplay.style.display = 'none'; // Hide old statuses
    } else {
        targetPaths = [];
        executeBtn.disabled = true; // Disable if selection was canceled
        pathDisplay.innerText = 'Selection canceled.';
    }
}

selectFolderBtn.addEventListener('click', async () => {
    const paths = await window.electronAPI.selectFolder();
    updateDisplay(paths);
});

selectFilesBtn.addEventListener('click', async () => {
    const paths = await window.electronAPI.selectFiles();
    updateDisplay(paths);
});

// The Execution Logic
executeBtn.addEventListener('click', async () => {
    // 1. Update UI to show we are working
    executeBtn.disabled = true;
    executeBtn.innerText = "Processing...";
    statusDisplay.style.display = 'block';
    statusDisplay.innerText = "Running Python script...";

    // 2. Send data across the bridge to main.js
    const result = await window.electronAPI.runRenamer(targetPaths);

    // 3. Handle the response from Python
    if (result.status === 'complete') {
        const sum = result.summary;
        statusDisplay.innerText = `Done!\nSuccessfully Renamed: ${sum.success}\nSkipped: ${sum.skipped}\nErrors: ${sum.error}`;
    } else {
        statusDisplay.innerText = `Error: ${result.message}`;
    }

    // 4. Reset UI
    executeBtn.innerText = "Rename Files";
    executeBtn.disabled = false;
});