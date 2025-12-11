# Config.js Environment Variables Fix

## Issue
Environment variables (especially `SMTP2GO_API_KEY`, `SMTP_USERNAME`, `SMTP_PASSWORD`) were not being loaded correctly, causing email sending to fail with:
```
Email configuration missing. Please configure either:
1. SMTP2GO_API_KEY (for REST API), or
2. SMTP_USERNAME and SMTP_PASSWORD (for SMTP protocol)
```

## Root Cause
The `dotenv.config()` calls were not properly handling the precedence of environment files and weren't checking if files exist before trying to load them. Additionally, the `override` option wasn't being used correctly.

## Solution Applied

### 1. Fixed `lib/config.js`
- ✅ Added file existence checks before loading `.env` files
- ✅ Properly set `override: false` for base files (to not override Next.js loaded vars)
- ✅ Properly set `override: true` for `.local` files (to ensure they take precedence)
- ✅ Load files in correct order of precedence:
  1. `.env` (base)
  2. `.env.development` or `.env.production` (environment-specific)
  3. `.env.local` (highest priority, overrides)
  4. `.env.development.local` or `.env.production.local` (highest priority, overrides)
- ✅ Improved `getEnvVar()` helper to strip quotes from values
- ✅ Enhanced `debugEnv()` function to check for `SMTP2GO_API_KEY` and all email config vars

### 2. Improved `utils/email.js`
- ✅ Better error messages that guide users to check their `.env` file
- ✅ Added logging for debugging email configuration issues
- ✅ Improved validation to check for empty strings, not just falsy values

## What You Need to Do

### Step 1: Check Your `.env` or `.env.local` File

Make sure you have the required email configuration variables. You need **ONE** of these options:

#### Option A: SMTP2Go REST API (Recommended)
```env
SMTP2GO_API_KEY=your_api_key_here
SMTP2GO_FROM_EMAIL=your-verified-email@example.com
SMTP2GO_FROM_NAME=The Server
```

#### Option B: SMTP Protocol (Fallback)
```env
SMTP_USERNAME=your_smtp_username
SMTP_PASSWORD=your_smtp_password
SMTP_HOST=mail.smtp2go.com
SMTP_PORT=25
SMTP_SECURE=false
SMTP2GO_FROM_EMAIL=your-verified-email@example.com
```

### Step 2: Restart Your Development Server

⚠️ **CRITICAL**: You MUST restart your Next.js development server after making changes to environment variables or the config file.

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 3: Verify Environment Variables Are Loaded

Visit the debug endpoint to check if your environment variables are loaded:
```
http://localhost:3000/api/debug/env
```

This will show you:
- Which environment variables are set
- Which ones are missing
- The current configuration values

### Step 4: Test Email Functionality

Try signing up a new user. The OTP email should now be sent successfully.

## Troubleshooting

### If environment variables still aren't loading:

1. **Check file location**: `.env` or `.env.local` should be in the project root (same level as `package.json`)

2. **Check file name**: Should be exactly `.env` or `.env.local` (not `.env.txt`)

3. **Check file format**: No spaces around `=`
   ```env
   # ✅ Correct
   SMTP2GO_API_KEY=api-xxxxx
   
   # ❌ Wrong
   SMTP2GO_API_KEY = api-xxxxx
   ```

4. **Check for quotes**: Values should not have quotes (the code will strip them automatically)
   ```env
   # ✅ Correct
   SMTP2GO_API_KEY=api-xxxxx
   
   # ⚠️ Will work but quotes will be stripped
   SMTP2GO_API_KEY="api-xxxxx"
   ```

5. **Use the debug endpoint**: Visit `/api/debug/env` to see what's actually loaded

6. **Check server logs**: Look for any errors when the server starts

## Environment Variable Priority

Next.js and our config load environment variables in this order (later files override earlier ones):

1. `.env` (base file)
2. `.env.development` or `.env.production` (based on NODE_ENV)
3. `.env.local` (highest priority, ignored by git)
4. `.env.development.local` or `.env.production.local` (highest priority, ignored by git)

**Recommendation**: Use `.env.local` for your local development secrets (it's in `.gitignore` by default).

## Testing

After restarting your server, test the configuration:

```bash
# Test the debug endpoint
curl http://localhost:3000/api/debug/env

# Or test email sending via signup
# Just try to sign up a new user and check if OTP email is sent
```

## Additional Notes

- The config now properly handles both Next.js's built-in env loading AND dotenv as a fallback
- File existence is checked before attempting to load (prevents errors)
- Better error messages guide you to the solution
- Debug endpoint shows exactly what's loaded and what's missing

If you still encounter issues after following these steps, check the debug endpoint output and verify your `.env` file format matches the examples above.


