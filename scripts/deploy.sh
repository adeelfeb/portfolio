#!/bin/bash
set -e

cd /root/proof

# Pull latest code
git fetch origin main
git reset --hard origin/main

# Install dependencies
npm install

# Build application
npm run build

# Verify build succeeded
if [ ! -d ".next" ]; then
  echo "Error: Build failed - .next directory not found"
  exit 1
fi

# Make start script executable
chmod +x scripts/start-server.sh

# Restart PM2 (restart is more reliable than reload for config changes)
if pm2 list | grep -q "proof-server"; then
  pm2 restart proof-server --update-env
else
  pm2 start ecosystem.config.js
fi

pm2 save

echo "Deployment completed!"
