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
pm2 start npm --name portfolio -- start -- -p 8000

echo "✅ Deployment completed!"
