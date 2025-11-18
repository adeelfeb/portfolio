# Deployment Fix Summary - External Access Issue

## Problem Identified

The GitHub Actions deployment was completing successfully, and PM2 showed the server as "online", but the domain could not access the application. The root causes were:

1. **Hostname Binding Issue**: Next.js was binding to `localhost` (127.0.0.1) by default, making it only accessible from the server itself, not from external domains.

2. **Port Configuration Mismatch**: The deployment script was manually starting PM2 with port 8000, but not using the `ecosystem.config.js` file, leading to inconsistent configuration.

3. **Missing External Interface Binding**: The server needed to bind to `0.0.0.0` (all network interfaces) to accept connections from external sources.

## Fixes Applied

### 1. Created Start Script (`scripts/start-server.sh`)
- Created a dedicated start script that properly handles hostname and port configuration
- Uses environment variables `HOSTNAME` and `PORT` with sensible defaults
- Binds to `0.0.0.0` by default to allow external access
- Uses `--hostname` and `--port` flags for Next.js

### 2. Updated `package.json`
- Modified the `start` script to use the new `start-server.sh` script
- Ensures consistent hostname binding across all environments

### 3. Updated `ecosystem.config.js`
- Set `HOSTNAME: '0.0.0.0'` in the environment variables
- Set `PORT: 8000` to match the deployment script's health check
- This ensures PM2 passes the correct environment variables to the start script

### 4. Updated `scripts/deploy.sh`
- Changed from manually starting PM2 with `pm2 start npm --name "${PM2_PROCESS}" -- start -- -p 8000`
- Now uses `pm2 start ecosystem.config.js` to ensure all configuration is applied
- Added `chmod +x` for the start script to ensure it's executable
- Updated rollback function to also use `ecosystem.config.js`

## Key Changes

### Before:
```bash
# Deployment script manually started with port only
pm2 start npm --name "proof-server" -- start -- -p 8000
# Next.js bound to localhost (not accessible externally)
```

### After:
```bash
# Deployment script uses ecosystem.config.js
pm2 start ecosystem.config.js
# Next.js binds to 0.0.0.0 (accessible externally)
```

## Verification Steps

After deployment, verify the server is accessible:

1. **Check PM2 Status**:
   ```bash
   pm2 status
   pm2 describe proof-server
   ```

2. **Check Server Binding**:
   ```bash
   # Should show process listening on 0.0.0.0:8000
   netstat -tulpn | grep 8000
   # OR
   ss -tulpn | grep 8000
   ```

3. **Test Local Access**:
   ```bash
   curl http://localhost:8000/api/test
   ```

4. **Test External Access**:
   ```bash
   # From another machine or using the domain
   curl http://your-domain.com/api/test
   ```

5. **Check PM2 Logs**:
   ```bash
   pm2 logs proof-server --lines 50
   # Look for: "Ready on http://0.0.0.0:8000"
   ```

## Additional Considerations

### Firewall Configuration
Ensure your server's firewall allows incoming traffic on port 8000:
```bash
# Ubuntu/Debian
sudo ufw allow 8000/tcp
sudo ufw status
```

### Reverse Proxy (if applicable)
If you're using Nginx or another reverse proxy, ensure it's configured to forward requests to `http://0.0.0.0:8000` or `http://127.0.0.1:8000`.

### DNS Configuration
Verify that your domain's DNS records correctly point to your server's IP address.

## Files Modified

1. `scripts/start-server.sh` - **NEW FILE** - Start script with proper hostname binding
2. `package.json` - Updated start script to use new start-server.sh
3. `ecosystem.config.js` - Added HOSTNAME environment variable
4. `scripts/deploy.sh` - Updated to use ecosystem.config.js and make start script executable

## Next Deployment

The next GitHub Actions deployment will:
1. Pull the latest changes
2. Install dependencies
3. Build the Next.js application
4. Make the start script executable
5. Start PM2 with ecosystem.config.js (which sets HOSTNAME=0.0.0.0)
6. The server will bind to 0.0.0.0:8000, making it accessible from external domains

## Troubleshooting

If the domain still cannot access the application after these fixes:

1. **Check PM2 logs for errors**:
   ```bash
   pm2 logs proof-server --err --lines 50
   ```

2. **Verify the server is listening on 0.0.0.0**:
   ```bash
   netstat -tulpn | grep 8000
   # Should show: 0.0.0.0:8000, not 127.0.0.1:8000
   ```

3. **Test from the server itself**:
   ```bash
   curl http://0.0.0.0:8000/api/test
   curl http://localhost:8000/api/test
   curl http://127.0.0.1:8000/api/test
   ```

4. **Check firewall rules**:
   ```bash
   sudo ufw status
   sudo iptables -L -n | grep 8000
   ```

5. **Verify reverse proxy configuration** (if using Nginx/Apache):
   - Check that the proxy_pass points to the correct address
   - Verify the reverse proxy is running and configured correctly

