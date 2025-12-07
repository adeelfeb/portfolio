# Environment Variables Fix

## Issue Fixed

Environment variables from `.env` file were not being loaded correctly in the Next.js project.

## Root Cause

The previous configuration was not properly loading environment variables in all contexts. Next.js does load `.env` files automatically, but we need to ensure they're available when the config module is imported.

## Solution

Updated `lib/config.js` to:
1. **Explicitly load .env files** using `dotenv.config()` with proper paths
2. **Load environment-specific files** (`.env.development`, `.env.production`, etc.)
3. **Only load on server-side** (checking for `window` object)
4. **Use absolute paths** to ensure files are found correctly

## Changes Made

### `lib/config.js`
- Added proper dotenv configuration with explicit file paths
- Loads `.env`, `.env.local`, and environment-specific files
- Added `debugEnv()` helper function for troubleshooting
- Only loads on server-side to avoid client-side issues

### `pages/api/debug/env.js` (New)
- Debug endpoint to check if environment variables are loaded
- Only available in development mode
- Access at: `GET /api/debug/env`

## How to Verify

1. **Restart your development server** (important!):
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

2. **Check environment variables are loaded**:
   - Visit: `http://localhost:3000/api/debug/env` (development only)
   - Or check the server logs when starting

3. **Test email functionality**:
   - Try signing up a new user
   - The SMTP credentials should now be loaded from `.env`

## Important Notes

### Server Restart Required
⚠️ **You MUST restart your Next.js development server** after changing environment variables or the config file. Next.js caches environment variables at startup.

### .env File Format
Make sure your `.env` file follows this format:
```env
VARIABLE_NAME=value
# Comments are allowed
ANOTHER_VAR=value
```

**Common issues:**
- ❌ No spaces around `=`: `VAR = value` (wrong)
- ✅ Correct: `VAR=value`
- ❌ Quotes in values: `VAR="value"` (may cause issues)
- ✅ Correct: `VAR=value` (or handle quotes in code)

### Environment Variable Priority

Next.js loads environment variables in this order (later files override earlier ones):
1. `.env`
2. `.env.local` (ignored by git)
3. `.env.development` or `.env.production` (based on NODE_ENV)
4. `.env.development.local` or `.env.production.local`

## Current Environment Variables

Based on your `.env` file, these should be loaded:
- ✅ `MONGODB_URI`
- ✅ `JWT_SECRET`
- ✅ `NEXT_PUBLIC_BASE_URL`
- ✅ `SMTP_HOST`
- ✅ `SMTP_PORT`
- ✅ `SMTP_USERNAME`
- ✅ `SMTP_PASSWORD`
- ✅ `SMTP_FROM`
- ✅ `SMTP_SECURE`

## Troubleshooting

If environment variables are still not loading:

1. **Check file location**: `.env` should be in the project root (same level as `package.json`)

2. **Check file name**: Should be exactly `.env` (not `.env.txt` or `.env.local`)

3. **Restart server**: Always restart after changing `.env` files

4. **Check for syntax errors**: Make sure there are no syntax errors in `.env` file

5. **Use debug endpoint**: Visit `/api/debug/env` to see what's loaded

6. **Check console logs**: Look for any errors when the server starts

## Testing

After restarting your server, test that environment variables are working:

```bash
# Test the debug endpoint (development only)
curl http://localhost:3000/api/debug/env

# Or test email sending
curl -X POST http://localhost:3000/api/test/email \
  -H "Content-Type: application/json" \
  -d '{"to": "your-email@example.com"}'
```

If you still see "environment variable not configured" errors, check the debug endpoint output to see which variables are missing.

