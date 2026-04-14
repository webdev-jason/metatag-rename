# MetaTag Renamer

## Project Definition
An Electron and Python desktop application designed to batch rename audio files based on their internal ID3 metadata. It extracts Artist and Title tags to enforce a clean, standardized "Artist - Title" naming convention across music libraries.

## Tech Stack Breakdown
* **Frontend UI:** HTML5, CSS3, JavaScript
* **Framework:** Electron & Node.js
* **Backend Processing:** Python 3
* **Libraries:** `mutagen` (for ID3 tag extraction)

## Setup & Execution Instructions
1. Clone this repository.
2. Run `npm install` to install Node.js dependencies.
3. Create a Python virtual environment: `python -m venv venv`
4. Activate the environment: `.\venv\Scripts\activate` (Windows)
5. Install Python dependencies: `pip install mutagen`
6. Launch the application: `npm start`

## Version History
* **v1.0.0:** Initial implementation of the Electron UI, native IPC dialog bridges, and Python `mutagen` processing engine.