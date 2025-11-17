#!/bin/bash
# -------------------------------
# rollback.sh - Manual rollback script for Proof project
# No .env dependency - works independently
# -------------------------------

set -euo pipefail

# Configuration - all paths use localhost only
PROJECT_DIR="/root/proof"
BACKUP_DIR="/root/proof-backups"
PM2_PROCESS="proof-server"
ECOSYSTEM_FILE="${PROJECT_DIR}/ecosystem.config.js"
HEALTH_CHECK_URL="http://localhost:8000/health"
HEALTH_CHECK_TIMEOUT=10
HEALTH_CHECK_RETRIES=3

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1" >&2; }
warn() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
info() { echo -e "${BLUE}[INFO]${NC} $1"; }

# Health check - checks http://localhost:8000/health
check_health() {
    local retries=0
    
    log "Checking health at ${HEALTH_CHECK_URL}..."
    
    while [ $retries -lt ${HEALTH_CHECK_RETRIES} ]; do
        # Check if PM2 process is running
        if ! pm2 describe "${PM2_PROCESS}" > /dev/null 2>&1; then
            warn "PM2 process not running"
            retries=$((retries + 1))
            [ $retries -lt ${HEALTH_CHECK_RETRIES} ] && sleep 5
            continue
        fi
        
        # Check health endpoint on port 8000
        local http_code=$(curl -s -o /dev/null -w "%{http_code}" -m ${HEALTH_CHECK_TIMEOUT} "${HEALTH_CHECK_URL}" 2>&1 || echo "000")
        
        if [ "$http_code" = "200" ]; then
            log "Health check passed! (HTTP 200)"
            return 0
        else
            warn "Health check failed (HTTP $http_code, attempt $((retries + 1))/${HEALTH_CHECK_RETRIES})"
        fi
        
        retries=$((retries + 1))
        [ $retries -lt ${HEALTH_CHECK_RETRIES} ] && sleep 5
    done
    
    error "Health check failed after ${HEALTH_CHECK_RETRIES} attempts"
    return 1
}

# Rollback to a specific backup
rollback_to_backup() {
    local backup_name=$1
    
    if [ -z "$backup_name" ]; then
        error "Backup name required"
        return 1
    fi
    
    local backup_path="${BACKUP_DIR}/${backup_name}"
    if [ ! -d "$backup_path" ]; then
        error "Backup not found: ${backup_name}"
        return 1
    fi
    
    log "Rolling back to: ${backup_name}"
    cd "${PROJECT_DIR}" || return 1
    
    # Step 1: Restore .next directory
    if [ -d "${backup_path}/.next" ]; then
        rm -rf "${PROJECT_DIR}/.next"
        cp -r "${backup_path}/.next" "${PROJECT_DIR}/.next"
        log "Restored .next directory"
    else
        warn "No .next in backup, skipping restore"
    fi
    
    # Step 2: Restore package.json if different
    if [ -f "${backup_path}/package.json" ]; then
        if ! cmp -s "${PROJECT_DIR}/package.json" "${backup_path}/package.json"; then
            warn "Restoring package.json"
            cp "${backup_path}/package.json" "${PROJECT_DIR}/package.json"
            cp "${backup_path}/package-lock.json" "${PROJECT_DIR}/package-lock.json" 2>/dev/null || true
            npm install --production=false
        fi
    fi
    
    # Step 3: Restore git commit
    if [ -f "${backup_path}/git-commit.txt" ]; then
        local commit_hash=$(cat "${backup_path}/git-commit.txt")
        log "Restoring git commit: ${commit_hash}"
        git checkout "${commit_hash}" 2>/dev/null || warn "Could not restore git commit"
    fi
    
    # Step 4: Restart PM2 process
    log "Restarting PM2..."
    
    # Delete old process if it exists
    if pm2 describe "${PM2_PROCESS}" > /dev/null 2>&1; then
        pm2 delete "${PM2_PROCESS}" 2>/dev/null || true
        sleep 2
    fi
    
    # Start with ecosystem.config.js if it exists
    if [ -f "${ECOSYSTEM_FILE}" ]; then
        cd "${PROJECT_DIR}"
        pm2 start ecosystem.config.js --update-env || {
            error "PM2 start failed"
            return 1
        }
    else
        cd "${PROJECT_DIR}"
        pm2 start npm --name "${PM2_PROCESS}" -- start --update-env || {
            error "PM2 start failed"
            return 1
        }
    fi
    
    # Step 5: Wait for application to start
    sleep 10
    
    # Step 6: Verify with health check on http://localhost:8000/health
    if check_health; then
        log "Rollback successful!"
        return 0
    else
        error "Rollback health check failed"
        return 1
    fi
}

# List available backups
list_backups() {
    info "Available backups:"
    echo ""
    
    if [ ! -d "$BACKUP_DIR" ] || [ -z "$(ls -A "$BACKUP_DIR" 2>/dev/null)" ]; then
        warn "No backups found in ${BACKUP_DIR}"
        return 1
    fi
    
    local backups=($(ls -t "${BACKUP_DIR}" 2>/dev/null | grep "^backup-" || true))
    
    for i in "${!backups[@]}"; do
        local backup="${backups[$i]}"
        local backup_path="${BACKUP_DIR}/${backup}"
        local commit_info=""
        
        if [ -f "${backup_path}/git-commit.txt" ]; then
            commit_info=$(cat "${backup_path}/git-commit.txt" | cut -c1-7)
        fi
        
        local date_info=$(stat -c %y "${backup_path}" 2>/dev/null | cut -d' ' -f1,2 | cut -d'.' -f1 || echo "Unknown")
        
        if [ $i -eq 0 ]; then
            echo -e "  ${GREEN}[$((i+1))]${NC} ${backup} ${YELLOW}(LATEST)${NC}"
        else
            echo -e "  ${BLUE}[$((i+1))]${NC} ${backup}"
        fi
        
        [ -n "$commit_info" ] && echo -e "       Commit: ${commit_info}"
        echo -e "       Date: ${date_info}"
        echo ""
    done
}

# Main function
main() {
    if [ "$1" == "list" ] || [ -z "$1" ]; then
        list_backups
        echo ""
        info "Usage: $0 <backup-name>"
        info "Example: $0 backup-20250101-120000"
        exit 0
    fi
    
    if [ "$1" == "--help" ] || [ "$1" == "-h" ]; then
        echo "Usage: $0 [backup-name|list]"
        echo ""
        echo "Commands:"
        echo "  list              List all available backups"
        echo "  <backup-name>     Rollback to the specified backup"
        echo "  --help, -h        Show this help message"
        exit 0
    fi
    
    rollback_to_backup "$1"
}

main "$@"
