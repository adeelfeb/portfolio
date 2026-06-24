#!/bin/bash
set -euo pipefail

RELEASES_DIR="/root/proof-releases"
ACTIVE_LINK="/root/proof"
MIN_DISK_MB=1536

log()  { echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*"; }
warn() { echo "[WARN] $*" >&2; }
err()  { echo "[ERROR] $*" >&2; exit 1; }

get_active_release() {
  if [ -L "$ACTIVE_LINK" ] && [ -d "$ACTIVE_LINK" ]; then
    readlink -f "$ACTIVE_LINK" | xargs basename
  fi
}

disk_space_mb() {
  df -m "$RELEASES_DIR" | awk 'NR==2 {print $4}'
}

prune_releases() {
  local keep_incoming="$1"
  local active
  active=$(get_active_release || true)

  local keep=()
  if [ -n "$active" ]; then
    keep+=("$active")
  fi
  if [ -n "$keep_incoming" ]; then
    keep+=("$keep_incoming")
  fi

  log "Active release: ${active:-none}, incoming: ${keep_incoming:-none}"

  for dir in "$RELEASES_DIR"/*/; do
    local name
    name=$(basename "$dir")
    if [ -d "$dir" ]; then
      local found=0
      for k in "${keep[@]}"; do
        if [ "$name" = "$k" ]; then
          found=1
          break
        fi
      done
      if [ "$found" -eq 0 ]; then
        log "Pruning old release: $name"
        rm -rf "$dir"
      fi
    fi
  done
}

check_disk() {
  local free_mb
  free_mb=$(disk_space_mb)
  log "Disk space: ${free_mb}MB free"
  if [ "$free_mb" -lt "$MIN_DISK_MB" ]; then
    err "Insufficient disk space: ${free_mb}MB (need ${MIN_DISK_MB}MB)"
  fi
}

clear_npm_cache_if_low() {
  local free_mb
  free_mb=$(disk_space_mb)
  if [ "$free_mb" -lt "$((MIN_DISK_MB * 2))" ]; then
    log "Low disk space (${free_mb}MB), clearing npm cache"
    npm cache clean --force 2>/dev/null || true
  fi
}

case "${1:-}" in
  prepare)
    mkdir -p "$RELEASES_DIR"
    prune_releases "$2"
    check_disk
    clear_npm_cache_if_low
    log "Server prepared for release $2"
    ;;
  prune-old)
    prune_releases ""
    ;;
  check-disk)
    check_disk
    ;;
  *)
    echo "Usage: $0 {prepare <sha>|prune-old|check-disk}"
    exit 1
    ;;
esac
