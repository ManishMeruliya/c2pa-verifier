#!/usr/bin/env bash

set -euo pipefail

# Colors
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
BLUE="\033[0;34m"
BOLD="\033[1m"
NC="\033[0m"

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
# Install destination for c2patool at project root (not inside backend)
BIN_DEST_DIR="$ROOT_DIR"

log() { echo -e "${GREEN}▶${NC} $1"; }
warn() { echo -e "${YELLOW}⚠${NC} $1"; }
err() { echo -e "${RED}✖${NC} $1"; }

print_banner() {
  echo -e "\n${BLUE}┌───────────────────────────────────────────────────────────────┐${NC}"
  echo -e "${BLUE}│${NC}   ${BOLD}🚀 C2PA Verifier - One‑Step Project Setup${NC}                  ${BLUE}│${NC}"
  echo -e "${BLUE}└───────────────────────────────────────────────────────────────┘${NC}\n"
}

print_success_box() {
  echo -e "\n${GREEN}┌──────────────────────────── ✅ Setup Complete ────────────────────────────┐${NC}"
  echo -e "${GREEN}│${NC}  ${BOLD}Next steps:${NC}                                                          ${GREEN}│${NC}"
  echo -e "${GREEN}│${NC}  • Frontend (development):      ${BOLD}cd frontend && npm run dev${NC}           ${GREEN}│${NC}"
  echo -e "${GREEN}│${NC}  • Frontend (build + preview): ${BOLD}cd frontend && npm run build && npm run preview${NC} ${GREEN}│${NC}"
  echo -e "${GREEN}│${NC}  • Backend (development):      ${BOLD}cd backend && npm run dev${NC}          ${GREEN}│${NC}"
  echo -e "${GREEN}│${NC}  • Backend (production):       ${BOLD}cd backend && npm start${NC}            ${GREEN}│${NC}"
  echo -e "${GREEN}└──────────────────────────────────────────────────────────────────────────┘${NC}\n"
}

# Ensure required tools are present
need_cmd() { command -v "$1" >/dev/null 2>&1 || { err "Missing required command: $1"; exit 1; }; }

need_cmd curl

# Welcome banner
print_banner

# Install Node dependencies
log "Installing backend dependencies... 💾"
(cd "$BACKEND_DIR" && npm install)

if [ -d "$FRONTEND_DIR" ]; then
  log "Installing frontend dependencies... 💾"
  (cd "$FRONTEND_DIR" && npm install)
  # Ensure local bin shims are executable (fixes 'vite: Permission denied' on some systems)
  if [ -d "$FRONTEND_DIR/node_modules/.bin" ]; then
    chmod +x "$FRONTEND_DIR/node_modules/.bin"/* 2>/dev/null || true
  fi
else
  warn "No frontend directory found; skipping frontend install."
fi

# Detect platform/arch for c2patool
OS="$(uname -s | tr '[:upper:]' '[:lower:]')"
ARCH_RAW="$(uname -m)"
case "$ARCH_RAW" in
  x86_64|amd64) ARCH="x86_64" ;;
  arm64|aarch64) ARCH="aarch64" ;;
  *) err "Unsupported architecture: $ARCH_RAW"; exit 1 ;;
esac

# Resolve release tag (use latest, fallback to pinned)
PINNED_TAG="c2patool-v0.23.4"
if [ -n "${GITHUB_TOKEN:-}" ]; then
  LATEST=$(curl -s -H "Authorization: Bearer $GITHUB_TOKEN" https://api.github.com/repos/contentauth/c2pa-rs/releases/latest | grep -m1 '"tag_name"' | cut -d '"' -f4 || true)
else
  LATEST=$(curl -s https://api.github.com/repos/contentauth/c2pa-rs/releases/latest | grep -m1 '"tag_name"' | cut -d '"' -f4 || true)
fi
if [ -z "${LATEST:-}" ]; then
  warn "Failed to determine latest tag from GitHub API; falling back to ${PINNED_TAG}"
  LATEST="$PINNED_TAG"
fi
log "Using c2patool release: $LATEST"

TMP_DIR="$(mktemp -d)"
cleanup() { rm -rf "$TMP_DIR" >/dev/null 2>&1 || true; }
trap cleanup EXIT

DOWNLOAD_URL=""
FILE_EXT=""
OUT_NAME="c2patool"

if echo "$OS" | grep -qi "mingw\|msys\|cygwin"; then
  # Git Bash on Windows; fetch Windows zip
  FILE_EXT="zip"
  # Asset name format: <tag>-<arch>-pc-windows-msvc.zip (tag already includes c2patool-)
  DOWNLOAD_URL="https://github.com/contentauth/c2pa-rs/releases/download/${LATEST}/${LATEST}-${ARCH}-pc-windows-msvc.zip"
  OUT_NAME="c2patool.exe"
elif [ "$OS" = "darwin" ]; then
  FILE_EXT="zip"
  # Asset name format: <tag>-<arch>-apple-darwin.zip
  DOWNLOAD_URL="https://github.com/contentauth/c2pa-rs/releases/download/${LATEST}/${LATEST}-${ARCH}-apple-darwin.zip"
else
  # linux
  FILE_EXT="tar.gz"
  # Asset name format: <tag>-<arch>-unknown-linux-gnu.tar.gz
  DOWNLOAD_URL="https://github.com/contentauth/c2pa-rs/releases/download/${LATEST}/${LATEST}-${ARCH}-unknown-linux-gnu.tar.gz"
fi

log "Downloading c2patool from: $DOWNLOAD_URL"
cd "$TMP_DIR"
# Retry download up to 3 times
ATTEMPTS=0
until curl -fL -o "c2patool.$FILE_EXT" "$DOWNLOAD_URL"; do
  ATTEMPTS=$((ATTEMPTS+1))
  if [ $ATTEMPTS -ge 3 ]; then
    err "Download failed after $ATTEMPTS attempts"; exit 1
  fi
  warn "Download failed (attempt $ATTEMPTS), retrying..."
  sleep 2
done

log "Extracting c2patool... 📦"
if [ "$FILE_EXT" = "zip" ]; then
  if command -v unzip >/dev/null 2>&1; then
    unzip -q "c2patool.$FILE_EXT"
  elif command -v powershell.exe >/dev/null 2>&1; then
    powershell.exe -NoProfile -Command "Expand-Archive -Path 'c2patool.zip' -DestinationPath '.' -Force"
  else
    err "No unzip utility found (need unzip or PowerShell)."; exit 1
  fi
else
  tar -xzf "c2patool.$FILE_EXT"
fi

FOUND_BIN="$(find . -type f -name "c2patool*" | head -1)"
if [ -z "$FOUND_BIN" ]; then
  err "Failed to locate c2patool binary in archive"; exit 1
fi

mkdir -p "$BIN_DEST_DIR"
cp "$FOUND_BIN" "$BIN_DEST_DIR/$OUT_NAME"
chmod +x "$BIN_DEST_DIR/$OUT_NAME" || true

log "c2patool installed to: $BIN_DEST_DIR/$OUT_NAME ✅"

# On Windows, remove the 'Mark of the Web' to prevent SmartScreen prompts
if command -v powershell.exe >/dev/null 2>&1; then
  if [ "$OUT_NAME" = "c2patool.exe" ]; then
    POW_PATH=$(printf '%s\r\n' "$BIN_DEST_DIR\\c2patool.exe")
    powershell.exe -NoProfile -Command "try { Unblock-File -Path '$POW_PATH' } catch { }" >/dev/null 2>&1 || true
    powershell.exe -NoProfile -Command "try { Remove-Item -Path '$POW_PATH' -Stream Zone.Identifier -ErrorAction SilentlyContinue } catch { }" >/dev/null 2>&1 || true
  fi
fi

# Ensure execute permissions on Unix-like systems
if [ "$(uname)" != "Windows_NT" ]; then
  chmod +x "$BIN_DEST_DIR/c2patool" 2>/dev/null || true
fi

# Final sanity check
if [ ! -f "$BIN_DEST_DIR/$OUT_NAME" ]; then
  err "c2patool not found at $BIN_DEST_DIR/$OUT_NAME"; exit 1
fi

print_success_box
