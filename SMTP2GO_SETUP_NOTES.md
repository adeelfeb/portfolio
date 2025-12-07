# SMTP2Go Configuration Notes

## Current Setup

Your `.env` file contains SMTP protocol variables:
- `SMTP_HOST=mail.smtp2go.com`
- `SMTP_PORT=25`
- `SMTP_USERNAME=noreply@designndev.com`
- `SMTP_PASSWORD=...`
- `SMTP_FROM="noreply@designndev.com"`

## Important: API Key Required

The current code uses **SMTP2Go's REST API** (not SMTP protocol), which requires an **API Key** instead of username/password.

### Option 1: Use REST API (Current Implementation) ✅

1. **Get your API Key from SMTP2Go:**
   - Log in to [SMTP2Go Dashboard](https://app.smtp2go.com/)
   - Go to **Settings** → **API Keys**
   - Create or copy your API key

2. **Add to your `.env` file:**
   ```env
   SMTP2GO_API_KEY=your_api_key_here
   SMTP2GO_FROM_EMAIL=noreply@designndev.com
   SMTP2GO_FROM_NAME=Design n Dev
   ```

3. **The config file will automatically use `SMTP_FROM` as fallback** if `SMTP2GO_FROM_EMAIL` is not set.

### Option 2: Switch to SMTP Protocol (Alternative)

If you prefer to use SMTP protocol instead of REST API, the code would need to be modified to use a library like `nodemailer` with your existing SMTP credentials.

## Current Configuration

The `lib/config.js` file now includes:
- ✅ `SMTP2GO_API_KEY` - For REST API
- ✅ `SMTP2GO_FROM_EMAIL` - Falls back to `SMTP_FROM` if not set
- ✅ `SMTP2GO_FROM_NAME` - Defaults to "The Server"
- ✅ `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_SECURE` - Available for future SMTP implementation

## Code Updates

✅ All code now uses `env` from `lib/config.js` instead of `process.env` directly:
- `utils/email.js` - Uses `env.SMTP2GO_API_KEY`, `env.SMTP2GO_FROM_EMAIL`, `env.SMTP2GO_FROM_NAME`
- `pages/api/test/email.js` - Uses `env` from config file

## Next Steps

1. Add `SMTP2GO_API_KEY` to your `.env` file
2. Optionally add `SMTP2GO_FROM_EMAIL` (will use `SMTP_FROM` as fallback)
3. Restart your server
4. Test using `/api/test/email` endpoint

