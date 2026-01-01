#!/bin/bash
set -e

# Move to project directory
cd /opt/projects/portfolio

echo "🔄 Pulling latest code..."
git config --global --add safe.directory /opt/projects/portfolio
git fetch origin main
git reset --hard origin/main

echo "📦 Installing dependencies..."
npm install --production=false

echo "🏗 Building application..."
npm run build

echo "🚀 Starting/restarting PM2 process..."
pm2 restart portfolio || pm2 start npm --name "portfolio" -- start -- -p 8000
pm2 save

echo "✅ Deployment completed!"
