# C2PA Verifier
A simple full‑stack app to verify C2PA metadata in images.

## Prerequisites
- Node.js 18+ (recommended LTS)
- Git Bash on Windows (to run the setup script)

## One‑Step Setup
Run the setup script from the project root. It installs dependencies for both apps and downloads the correct `c2patool` binary into the project root (next to this README).

- macOS / Linux
```
chmod +x setup.sh && ./setup.sh
```
- Windows (Git Bash)
```
bash ./setup.sh
```

The script will:
- Install `backend/` and `frontend/` dependencies
- Detect OS/arch and download `c2patool` into the repo root (`./c2patool` or `./c2patool.exe`)
- Fix executable permissions automatically

## Run the Project
- Frontend (development)
```
cd frontend && npm run dev
```
- Frontend (build + preview)
```
cd frontend && npm run build && npm run preview
```
- Backend (development)
```
cd backend && npm run dev
```
- Backend (production)
```
cd backend && npm start
```

## Environment Variables (optional)
Backend supports an optional env override for the tool path:
```
# Example (Linux/macOS)
export C2PATOOL_PATH="/full/path/to/c2patool"
# Example (Windows PowerShell)
$env:C2PATOOL_PATH = "C:\\full\\path\\to\\c2patool.exe"
```
If not set, the backend will look in this order:
1) `C2PATOOL_PATH` env
2) repo root `./c2patool(.exe)` (installed by setup)
3) `backend/c2patool(.exe)`
4) system PATH (`c2patool`)

## Troubleshooting
- "c2patool: not found" on Linux:
  - Ensure the binary exists at `./c2patool` (repo root) and is executable:
    - `chmod +x ./c2patool`
  - Or install to PATH:
    - `sudo cp ./c2patool /usr/local/bin/c2patool`
- "vite: Permission denied":
  - Run `bash ./setup.sh` again, or:
  - `chmod +x frontend/node_modules/.bin/vite`
- Windows SmartScreen/permission prompts:
  - Rerun `bash ./setup.sh` — it unblocks the downloaded EXE automatically.

## API
- POST `/api/verify` with form‑data key `image`: uploads an image and returns JSON C2PA result.

## Project Structure
```
backend/      Express server, file upload, C2PA extraction
frontend/     React + Vite app
setup.sh      One‑step installer and c2patool fetcher
```

## License
MIT
