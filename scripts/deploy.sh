#!/bin/bash
# -------------------------------
# deploy.sh - Auto-deploy Proof project with rollback capability
# -------------------------------

set -euo pipefail

# Configuration
PROJECT_DIR="/root/proof"
BACKUP_DIR="/root/proof-backups"
PM2_PROCESS="proof-server"
ECOSYSTEM_FILE="${PROJECT_DIR}/ecosystem.config.js"
HEALTH_CHECK_URL="http://localhost:3000/api/test"
MAX_BACKUPS=5
HEALTH_CHECK_TIMEOUT=10
HEALTH_CHECK_RETRIES=5
STARTUP_WAIT=20

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1" >&2; }
warn() { echo -e "${YELLOW}[WARNING]${NC} $1"; }

# Create backup
create_backup() {
    local backup_name="backup-$(date +'%Y%m%d-%H%M%S')"
    local backup_path="${BACKUP_DIR}/${backup_name}"
    
    log "Creating backup: ${backup_name}"
    mkdir -p "${BACKUP_DIR}" "${backup_path}"
    
    # Backup git state
    git -C "${PROJECT_DIR}" rev-parse HEAD > "${backup_path}/git-commit.txt" 2>/dev/null || true
    cp "${PROJECT_DIR}/package.json" "${backup_path}/package.json" 2>/dev/null || true
    cp "${PROJECT_DIR}/package-lock.json" "${backup_path}/package-lock.json" 2>/dev/null || true
    
    # Backup .next if exists
    if [ -d "${PROJECT_DIR}/.next" ]; then
        log "Backing up .next directory..."
        cp -r "${PROJECT_DIR}/.next" "${backup_path}/.next" 2>/dev/null || {
            warn "Failed to backup .next, continuing with git state only"
        }
    else
        warn "No .next directory found, backing up git state only"
    fi
    
    log "Backup created: ${backup_name}"
    echo "${backup_name}"
}

# Find latest backup
find_latest_backup() {
    local backups=($(ls -t "${BACKUP_DIR}" 2>/dev/null | grep "^backup-" || true))
    [ ${#backups[@]} -gt 0 ] && echo "${backups[0]}" || echo ""
}

# Rollback function
rollback() {
    local backup_name=$1
    
    if [ -z "$backup_name" ] || [ ! -d "${BACKUP_DIR}/${backup_name}" ]; then
        warn "Specified backup not found, finding latest..."
        backup_name=$(find_latest_backup)
        if [ -z "$backup_name" ] || [ ! -d "${BACKUP_DIR}/${backup_name}" ]; then
            error "No valid backup found"
            ls -la "${BACKUP_DIR}" 2>/dev/null || true
            return 1
        fi
        log "Using latest backup: ${backup_name}"
    fi
    
    error "Rolling back to: ${backup_name}"
    local backup_path="${BACKUP_DIR}/${backup_name}"
    cd "${PROJECT_DIR}" || return 1
    
    # Restore .next
    if [ -d "${backup_path}/.next" ]; then
        rm -rf "${PROJECT_DIR}/.next"
        cp -r "${backup_path}/.next" "${PROJECT_DIR}/.next"
        log "Restored .next directory"
    fi
    
    # Restore git commit
    if [ -f "${backup_path}/git-commit.txt" ]; then
        local commit_hash=$(cat "${backup_path}/git-commit.txt")
        log "Restoring git commit: ${commit_hash}"
        git checkout "${commit_hash}" 2>/dev/null || warn "Could not restore git commit"
    fi
    
    # Restore package.json if different
    if [ -f "${backup_path}/package.json" ]; then
        if ! cmp -s "${PROJECT_DIR}/package.json" "${backup_path}/package.json"; then
            warn "Restoring package.json from backup"
            cp "${backup_path}/package.json" "${PROJECT_DIR}/package.json"
            cp "${backup_path}/package-lock.json" "${PROJECT_DIR}/package-lock.json" 2>/dev/null || true
            npm install --production=false
        fi
    fi
    
    # Restart PM2 - ensure we use ecosystem.config.js
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
    
    sleep 10
    check_health && log "Rollback successful!" || error "Rollback health check failed"
}

# Detect actual port from PM2 logs
detect_port() {
    # Try to get port from PM2 logs (Next.js shows "Local: http://localhost:PORT")
    local port_line=$(pm2 logs "${PM2_PROCESS}" --out --lines 50 --nostream 2>/dev/null | grep -o "Local:.*http://localhost:[0-9]*" | tail -1 | grep -o "[0-9]*" || echo "")
    
    if [ -n "$port_line" ]; then
        echo "$port_line"
        return 0
    fi
    
    # Fallback: check if port 3000 is listening
    if lsof -i :3000 > /dev/null 2>&1; then
        echo "3000"
        return 0
    fi
    
    # Fallback: check if port 8000 is listening
    if lsof -i :8000 > /dev/null 2>&1; then
        echo "8000"
        return 0
    fi
    
    # Default to 3000
    echo "3000"
}

# Health check
check_health() {
    local retries=0
    local max_retries=${HEALTH_CHECK_RETRIES}
    
    # Detect actual port
    local actual_port=$(detect_port)
    local health_url="http://localhost:${actual_port}/api/test"
    
    log "Checking health at ${health_url} (detected port: ${actual_port})..."
    
    while [ $retries -lt $max_retries ]; do
        # Check PM2 process
        if ! pm2 describe "${PM2_PROCESS}" > /dev/null 2>&1; then
            warn "PM2 process not running"
            retries=$((retries + 1))
            [ $retries -lt $max_retries ] && sleep 5
            continue
        fi
        
        # Check HTTP endpoint
        local http_code=$(curl -s -o /tmp/hc_response.txt -w "%{http_code}" -m ${HEALTH_CHECK_TIMEOUT} "${health_url}" 2>&1 || echo "000")
        local response=$(cat /tmp/hc_response.txt 2>/dev/null || echo "")
        
        if [ "$http_code" = "200" ]; then
            if echo "$response" | grep -q '"success"'; then
                log "Health check passed! (HTTP 200 on port ${actual_port})"
                rm -f /tmp/hc_response.txt
                return 0
            else
                warn "Got 200 but unexpected response format"
                log "Response: $(echo "$response" | head -c 200)"
            fi
        else
            warn "Health check failed (HTTP $http_code, attempt $((retries + 1))/$max_retries)"
            if [ -n "$response" ]; then
                log "Response: $(echo "$response" | head -c 200)"
            fi
            # Try alternative port if 3000 failed
            if [ "$actual_port" = "3000" ] && [ "$http_code" = "000" ]; then
                warn "Trying alternative port 8000..."
                actual_port="8000"
                health_url="http://localhost:8000/api/test"
            fi
        fi
        
        retries=$((retries + 1))
        [ $retries -lt $max_retries ] && sleep 5
    done
    
    error "Health check failed after ${max_retries} attempts"
    log "PM2 status:"
    pm2 describe "${PM2_PROCESS}" || true
    log "PM2 output logs (last 20 lines) - checking for port info:"
    pm2 logs "${PM2_PROCESS}" --out --lines 20 --nostream || true
    log "PM2 error logs (last 10 lines):"
    pm2 logs "${PM2_PROCESS}" --err --lines 10 --nostream || true
    log "Checking ports:"
    lsof -i :3000 2>/dev/null || echo "Port 3000: not in use"
    lsof -i :8000 2>/dev/null || echo "Port 8000: not in use"
    rm -f /tmp/hc_response.txt
    return 1
}

# Cleanup old backups
cleanup_old_backups() {
    log "Cleaning up old backups (keeping last ${MAX_BACKUPS})..."
    local backups=($(ls -t "${BACKUP_DIR}" 2>/dev/null | grep "^backup-" || true))
    local count=${#backups[@]}
    
    if [ $count -gt $MAX_BACKUPS ]; then
        for ((i=MAX_BACKUPS; i<count; i++)); do
            rm -rf "${BACKUP_DIR}/${backups[$i]}"
            log "Removed old backup: ${backups[$i]}"
        done
    else
        log "No old backups to clean up"
    fi
}

# Main deployment
main() {
    log "Starting deployment..."
    
    cd "${PROJECT_DIR}" || {
        error "Project directory not found: ${PROJECT_DIR}"
        exit 1
    }
    
    # Create backup
    local current_backup=$(create_backup)
    local current_commit=$(git rev-parse HEAD 2>/dev/null || echo "")
    
    # Pull latest
    log "Pulling latest code..."
    git fetch origin main || {
        error "Failed to fetch"
        [ -n "$current_backup" ] && rollback "$current_backup"
        exit 1
    }
    
    local new_commit=$(git rev-parse origin/main 2>/dev/null || echo "")
    git reset --hard origin/main || {
        error "Failed to reset"
        [ -n "$current_backup" ] && rollback "$current_backup"
        exit 1
    }
    
    # Install dependencies
    log "Installing dependencies..."
    npm install || {
        error "npm install failed"
        [ -n "$current_backup" ] && rollback "$current_backup"
        exit 1
    }
    
    # Build
    log "Building Next.js project..."
    npm run build || {
        error "Build failed"
        [ -n "$current_backup" ] && rollback "$current_backup"
        exit 1
    }
    
    # Verify build
    if [ ! -d "${PROJECT_DIR}/.next" ]; then
        error "Build output (.next) not found"
        [ -n "$current_backup" ] && rollback "$current_backup"
        exit 1
    fi
    
    # Check .env file for PORT setting
    if [ -f "${PROJECT_DIR}/.env" ]; then
        if grep -q "^PORT=8000" "${PROJECT_DIR}/.env" 2>/dev/null; then
            warn ".env file contains PORT=8000, but ecosystem.config.js sets PORT=3000"
            warn "PM2 env variables should override, but if issues persist, update .env to PORT=3000"
        fi
    fi
    
    # Restart PM2 - ensure we use ecosystem.config.js
    log "Restarting PM2 process..."
    
    # Delete old process if it exists (to ensure clean start with ecosystem config)
    if pm2 describe "${PM2_PROCESS}" > /dev/null 2>&1; then
        log "Stopping existing PM2 process..."
        pm2 delete "${PM2_PROCESS}" 2>/dev/null || true
        sleep 2
    fi
    
    # Start with ecosystem.config.js if it exists
    if [ -f "${ECOSYSTEM_FILE}" ]; then
        log "Starting PM2 with ecosystem.config.js (PORT=3000)..."
        cd "${PROJECT_DIR}"
        pm2 start ecosystem.config.js --update-env || {
            error "PM2 start with ecosystem.config.js failed"
            [ -n "$current_backup" ] && rollback "$current_backup"
            exit 1
        }
    else
        warn "ecosystem.config.js not found, starting with process name..."
        cd "${PROJECT_DIR}"
        pm2 start npm --name "${PM2_PROCESS}" -- start --update-env || {
            error "PM2 start failed"
            [ -n "$current_backup" ] && rollback "$current_backup"
            exit 1
        }
    fi
    
    # Wait for startup
    log "Waiting ${STARTUP_WAIT}s for application to start..."
    sleep ${STARTUP_WAIT}
    
    # Health check
    if ! check_health; then
        error "Health check failed after deployment"
        if [ -n "$current_backup" ]; then
            if rollback "$current_backup"; then
                log "Rollback successful! Previous version running."
                log "Previous commit: ${current_commit}"
                exit 0
            else
                error "Rollback failed"
                exit 1
            fi
        else
            error "No backup available for rollback"
            exit 1
        fi
    fi
    
    log "Deployment successful!"
    log "Deployed commit: ${new_commit}"
    [ -n "$current_backup" ] && log "Backup: ${current_backup}"
    
    cleanup_old_backups
}

main "$@"
