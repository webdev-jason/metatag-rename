import os
import sys
import json
from pathlib import Path

# Ensure mutagen is installed in the venv
try:
    import mutagen
except ImportError:
    print(json.dumps({"status": "error", "message": "mutagen library not found. Did you run 'pip install mutagen'?"}))
    sys.exit(1)

def process_file(filepath):
    """Reads metadata and renames a single file."""
    try:
        audio = mutagen.File(filepath, easy=True)
        if audio is None:
            return {"file": filepath.name, "status": "skipped", "message": "Not a recognized audio format."}

        # Extract tags, default to 'Unknown' if missing
        artist = audio.get('artist', ['Unknown Artist'])[0]
        title = audio.get('title', ['Unknown Title'])[0]

        # Windows filenames cannot contain these characters
        invalid_chars = '<>:"/\\|?*'
        safe_artist = ''.join(c for c in artist if c not in invalid_chars).strip()
        safe_title = ''.join(c for c in title if c not in invalid_chars).strip()

        new_filename = f"{safe_artist} - {safe_title}{filepath.suffix}"
        new_filepath = filepath.parent / new_filename

        # Prevent overwriting or renaming a file that is already correct
        if new_filepath.exists() and new_filepath != filepath:
            return {"file": filepath.name, "status": "skipped", "message": "Target name already exists."}
        
        if new_filepath == filepath:
            return {"file": filepath.name, "status": "skipped", "message": "File already correctly named."}

        # Perform the actual rename
        os.rename(filepath, new_filepath)
        return {"file": filepath.name, "status": "success", "message": f"Renamed to {new_filename}"}

    except Exception as e:
        return {"file": filepath.name, "status": "error", "message": str(e)}

if __name__ == "__main__":
    # We expect Electron to pass the paths as a JSON string in the first argument
    if len(sys.argv) < 2:
        print(json.dumps({"status": "error", "message": "No paths provided to Python."}))
        sys.exit(1)

    try:
        paths = json.loads(sys.argv[1])
    except json.JSONDecodeError:
        print(json.dumps({"status": "error", "message": "Invalid JSON input from Electron."}))
        sys.exit(1)

    results = {"success": 0, "skipped": 0, "error": 0, "details": []}
    valid_extensions = ['.mp3', '.m4a', '.flac', '.ogg']

    # Loop through the targets sent by the UI
    for p in paths:
        target = Path(p)
        
        # If it's a single file
        if target.is_file() and target.suffix.lower() in valid_extensions:
            res = process_file(target)
            results[res["status"]] += 1
            results["details"].append(res)
            
        # If it's a folder, iterate through all files inside it
        elif target.is_dir():
            for filepath in target.glob("*.*"):
                if filepath.suffix.lower() in valid_extensions:
                    res = process_file(filepath)
                    results[res["status"]] += 1
                    results["details"].append(res)

    # Print the final result back to Node.js as a JSON string
    print(json.dumps({"status": "complete", "summary": results}))