#testing
#!/bin/bash
set -e

# 1. Move to the correct directory
cd /home/deploy/portfolio

echo "Pulling latest code..."
# Ensure the folder is marked as safe for git
git config --global --add safe.directory /home/deploy/portfolio
git fetch origin main
git reset --hard origin/main

echo "Installing dependencies..."
npm install --production=false

echo "Building application..."
# Note: Building on a small droplet may need swap if memory is low
npm run build

echo "Starting/restarting PM2 process..."
# Using the PM2 process name 'portfolio'
pm2 restart portfolio || pm2 start npm --name "portfolio" -- start -- -p 3000
pm2 save

echo "✅ Deployment completed!"
