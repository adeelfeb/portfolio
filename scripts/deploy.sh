#!/bin/bash
set -euo pipefail

PROJECT_DIR="/root/proof"
BACKUP_DIR="/root/proof-backups"
PM2_PROCESS="proof-server"
HEALTH_CHECK_URL="http://localhost:8000/api/test"
STARTUP_WAIT=15
MAX_BACKUPS=5

log() { echo "[INFO] $1"; }
error() { echo "[ERROR] $1"; }

# Create backup of .next and git state
create_backup() {
    local backup_name="backup-$(date +'%Y%m%d-%H%M%S')"
    local backup_path="${BACKUP_DIR}/${backup_name}"
    mkdir -p "${backup_path}"
    cp -r "${PROJECT_DIR}/.next" "${backup_path}/.next" 2>/dev/null || true
    git -C "${PROJECT_DIR}" rev-parse HEAD > "${backup_path}/git-commit.txt" 2>/dev/null || true
    echo "${backup_name}"
}

# Rollback function
rollback() {
    local backup_name=$1
    local backup_path="${BACKUP_DIR}/${backup_name}"
    echo "[ROLLBACK] Restoring backup ${backup_name}"
    rm -rf "${PROJECT_DIR}/.next"
    cp -r "${backup_path}/.next" "${PROJECT_DIR}/.next"
    local commit_hash=$(cat "${backup_path}/git-commit.txt")
    git -C "${PROJECT_DIR}" checkout "${commit_hash}" 2>/dev/null || true
    pm2 delete "${PM2_PROCESS}" 2>/dev/null || true
    # Use ecosystem.config.js to ensure proper configuration (hostname, port, etc.)
    pm2 start ecosystem.config.js
}

# Health check
check_health() {
    local retries=0
    local max_retries=5
    while [ $retries -lt $max_retries ]; do
        local code=$(curl -s -o /tmp/response.txt -w "%{http_code}" -m 10 "${HEALTH_CHECK_URL}" || echo "000")
        if [ "$code" = "200" ]; then
            log "Health check passed!"
            return 0
        fi
        log "Health check failed (HTTP $code), retry $((retries+1))/$max_retries"
        retries=$((retries+1))
        sleep 5
    done
    return 1
}

# Main deployment
main() {
    cd "${PROJECT_DIR}" || { error "Project directory not found"; exit 1; }

    backup=$(create_backup)
    log "Backup created: $backup"

    git fetch origin main
    git reset --hard origin/main

    npm install
    npm run build

    # Ensure start script is executable
    chmod +x "${PROJECT_DIR}/scripts/start-server.sh" 2>/dev/null || true

    pm2 delete "${PM2_PROCESS}" 2>/dev/null || true
    # Use ecosystem.config.js to ensure proper configuration (hostname, port, etc.)
    pm2 start ecosystem.config.js

    log "Waiting $STARTUP_WAIT seconds for server to start..."
    sleep $STARTUP_WAIT

    if ! check_health; then
        error "Health check failed, rolling back..."
        rollback "$backup"
        exit 1
    fi

    log "Deployment successful!"
}

main "$@"
