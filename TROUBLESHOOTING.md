# Troubleshooting Deployment Issues

## Current Issue: Server Running but Not Accessible

If PM2 shows the process as "online" but `curl http://localhost:8000` fails, follow these steps:

## Step 1: Check PM2 Logs

```bash
# Check recent logs
pm2 logs proof-server --lines 50

# Check error logs only
pm2 logs proof-server --err --lines 50

# Check output logs only
pm2 logs proof-server --out --lines 50
```

Look for:
- Error messages
- "Ready on http://0.0.0.0:8000" message
- Any port binding errors

## Step 2: Check if Port is Listening

```bash
# Check if port 8000 is listening
netstat -tulpn | grep 8000
# OR
ss -tulpn | grep 8000
# OR
lsof -i :8000
```

Expected output should show something like:
```
tcp  0  0  0.0.0.0:8000  0.0.0.0:*  LISTEN  1114211/node
```

If you see `127.0.0.1:8000` instead of `0.0.0.0:8000`, the server is only binding to localhost.

## Step 3: Check PM2 Process Details

```bash
pm2 describe proof-server
```

Check:
- `script path` - should point to npm or ecosystem.config.js
- `exec cwd` - should be `/root/proof`
- `env` - should show `HOSTNAME=0.0.0.0` and `PORT=8000`

## Step 4: Verify Build Exists

```bash
cd /root/proof
ls -la .next
```

If `.next` directory doesn't exist or is empty, the build failed.

## Step 5: Test Start Script Manually

```bash
cd /root/proof
chmod +x scripts/start-server.sh
HOSTNAME=0.0.0.0 PORT=8000 bash scripts/start-server.sh
```

This should start the server. Press Ctrl+C to stop it.

## Step 6: Check Environment Variables

```bash
cd /root/proof
pm2 env proof-server
```

Verify `HOSTNAME` and `PORT` are set correctly.

## Step 7: Restart PM2 Process

```bash
cd /root/proof

# Stop the process
pm2 stop proof-server

# Delete it
pm2 delete proof-server

# Start fresh with ecosystem config
pm2 start ecosystem.config.js

# Check status
pm2 status

# Check logs
pm2 logs proof-server --lines 20
```

## Step 8: Verify Start Script is Executable

```bash
ls -la /root/proof/scripts/start-server.sh
```

Should show `-rwxr-xr-x` (executable). If not:
```bash
chmod +x /root/proof/scripts/start-server.sh
```

## Common Issues and Fixes

### Issue 1: Server binding to localhost instead of 0.0.0.0
**Fix**: Ensure `HOSTNAME=0.0.0.0` is set in ecosystem.config.js and restart PM2.

### Issue 2: Port already in use
**Fix**: 
```bash
# Find what's using port 8000
lsof -i :8000
# Kill the process if needed
kill -9 <PID>
```

### Issue 3: Build directory missing
**Fix**: Run `npm run build` manually and check for errors.

### Issue 4: Next.js not found
**Fix**: The start script now uses `npx next` which should work. If not:
```bash
cd /root/proof
npm install
```

### Issue 5: PM2 not picking up environment variables
**Fix**: Use `pm2 restart` instead of `pm2 reload` to ensure new env vars are loaded.

## Quick Fix Command

If nothing else works, try this complete reset:

```bash
cd /root/proof
pm2 delete proof-server
chmod +x scripts/start-server.sh
pm2 start ecosystem.config.js
pm2 save
pm2 logs proof-server --lines 20
```

