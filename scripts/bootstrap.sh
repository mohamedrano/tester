#!/usr/bin/env bash
set -euo pipefail

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required to bootstrap the workspace" >&2
  exit 1
fi

echo "Installing workspace dependencies..."
npm install

echo "Bootstrapping completed."
