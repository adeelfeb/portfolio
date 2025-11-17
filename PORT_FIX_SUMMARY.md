# Port Mismatch Fix Summary

## Problem Identified

1. **Server starting on port 8000** (from .env file)
2. **Health check checking port 3000** (hardcoded)
3. **PM2 not using ecosystem.config.js** (old process still running)
4. **Result: HTTP 000 (connection refused)**

## Fixes Applied

### 1. Dynamic Port Detection
- Health check now detects the actual port from PM2 logs
- Falls back to checking which ports are listening (3000 or 8000)
- Tries both ports if one fails

### 2. PM2 Process Management
- Deletes old PM2 process before starting new one
- Ensures ecosystem.config.js is used
- Properly sets PORT=3000 in ecosystem.config.js

### 3. Better Error Handling
- Checks .env file for PORT conflicts
- Shows which port is being used
- Better logging for debugging

## Required Actions on Server

### Option 1: Update .env file (Recommended)
```bash
# SSH into server
ssh root@your-server

# Edit .env file
cd /root/proof
nano .env

# Change PORT=8000 to PORT=3000
# Or remove PORT line entirely (PM2 will set it)
```

### Option 2: Let PM2 override (Current Fix)
The ecosystem.config.js sets PORT=3000, which should override .env.
The dynamic port detection will find the correct port automatically.

## Verification

After deployment, check:
```bash
# Check which port is listening
lsof -i :3000
lsof -i :8000

# Check PM2 logs for port info
pm2 logs proof-server --out --lines 10

# Test health endpoint
curl http://localhost:3000/api/test
curl http://localhost:8000/api/test
```

## Next Deployment

The deployment script will now:
1. Delete old PM2 process
2. Start with ecosystem.config.js (PORT=3000)
3. Detect actual port from logs
4. Check health on correct port
5. Fallback to port 8000 if 3000 fails

