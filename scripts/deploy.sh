#!/bin/bash
set -e

# 1. Move to the correct directory
cd /var/www/portfolio_app

echo "Pulling latest code..."
# Ensure the folder is marked as safe for git
git config --global --add safe.directory /var/www/portfolio_app
git fetch origin main
git reset --hard origin/main

echo "Installing dependencies..."
npm install --production=false

echo "Building application..."
# Note: Building on a 2GB droplet can be tight. 
# The swap we set up will prevent a crash here.
npm run build

echo "Starting/restarting PM2 process..."
# Using the name 'portfolio' to match your current manual setup
pm2 restart portfolio || pm2 start npm --name "portfolio" -- start -- -p 3000
pm2 save

echo "✅ Deployment completed!"