#!/usr/bin/env bash
# Java 自動検出ラッパー
# Java が利用可能ならそのまま実行し、未インストールなら Nix 経由で実行する
#
# Usage: nix-java-exec.sh <working-dir> <command> [args...]

set -euo pipefail

WORK_DIR="$1"
shift

if command -v java &>/dev/null; then
  JAVA_MAJOR=$(java -version 2>&1 | grep -i 'version' | head -1 | sed 's/.*version "\([0-9]*\).*/\1/')
  if [ -n "$JAVA_MAJOR" ] && [ "$JAVA_MAJOR" -le 23 ] 2>/dev/null; then
    cd "$WORK_DIR" && exec "$@"
  fi
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FLAKE_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$WORK_DIR" && exec nix develop "${FLAKE_DIR}#webshop" --command "$@"
