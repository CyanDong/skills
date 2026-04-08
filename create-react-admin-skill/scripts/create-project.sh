#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

if ! command -v node >/dev/null 2>&1; then
  echo "Error: Node.js is required but not found in PATH." >&2
  exit 1
fi

node "$ROOT_DIR/bin/cli.js" "$@"
