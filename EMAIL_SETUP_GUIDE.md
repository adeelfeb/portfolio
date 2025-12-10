# Email Verification Setup Guide - SMTP2Go

This guide will help you configure SMTP2Go for email verification in your application.

## Prerequisites

1. **SMTP2Go Account**: Sign up at [https://www.smtp2go.com](https://www.smtp2go.com)
2. **Verified Sender Email**: You need to verify at least one sender email address in your SMTP2Go account

## Step 1: Get Your SMTP2Go API Key

1. Log in to your SMTP2Go account
2. Navigate to **Settings** → **API Keys** (or **SMTP Users** → **API Keys**)
3. Create a new API key or copy an existing one
4. **Important**: Save this API key securely - you'll need it for the environment variable

## Step 2: Verify Your Sender Email

1. In your SMTP2Go dashboard, go to **Sending** → **Verified Senders**
2. Add the email address you want to use as the sender
3. Verify the email address by clicking the verification link sent to that email
4. **Note**: The sender email must be verified before you can send emails

## Step 3: Configure Environment Variables

You can use either the SMTP2Go API (recommended) or standard SMTP protocol (fallback).

### Option A: SMTP Protocol (Current Setup)

Your `.env` or `.env.local` file should look like this:

```env
# Email Configuration - SMTP Protocol
SMTP_HOST=mail.smtp2go.com
SMTP_PORT=25
SMTP_USERNAME=noreply@designndev.com
SMTP_PASSWORD=your_password_here
SMTP_FROM=noreply@designndev.com
SMTP_SECURE=false
```

### Option B: SMTP2Go API

If you prefer to use the API key method:

```env
# SMTP2Go Configuration (API)
SMTP2GO_API_KEY=your_smtp2go_api_key_here
SMTP2GO_FROM_EMAIL=your-verified-email@example.com
SMTP2GO_FROM_NAME=The Server
```

### Environment Variables Explained

| Variable | Required (SMTP) | Required (API) | Description |
|----------|----------------|----------------|-------------|
| `SMTP_USERNAME` | ✅ Yes | ❌ No | SMTP username |
| `SMTP_PASSWORD` | ✅ Yes | ❌ No | SMTP password |
| `SMTP_HOST` | ✅ Yes | ❌ No | SMTP host (mail.smtp2go.com) |
| `SMTP_PORT` | ✅ Yes | ❌ No | SMTP port (25, 2525, 587, etc.) |
| `SMTP_FROM` | ✅ Yes | ❌ No | Sender email address |
| `SMTP2GO_API_KEY` | ❌ No | ✅ Yes | SMTP2Go API key |
| `SMTP2GO_FROM_EMAIL` | ❌ No | ✅ Yes | Verified sender email for API |

## Step 4: Verify Your Setup

### Option 1: Use the Test Endpoint

You can test your email configuration by calling the test endpoint:

```bash
# Test email sending
curl -X POST http://localhost:8000/api/test/email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "your-test-email@example.com",
    "subject": "Test Email",
    "message": "This is a test email from your application"
  }'
```

### Option 2: Test via Signup Flow

1. Start your development server: `npm run dev`
2. Try to sign up a new user
3. Check the email inbox for the OTP code
4. Verify the email using the OTP code

## Troubleshooting

### Error: "SMTP2GO_API_KEY is not configured"

**Solution**: Make sure you've added `SMTP2GO_API_KEY` to your `.env.local` file and restarted your server.

### Error: "SMTP2GO_FROM_EMAIL is not configured"

**Solution**: Add `SMTP2GO_FROM_EMAIL` to your `.env.local` file with a verified email address.

### Error: "SMTP2Go API error: 401" or "Invalid API key"

**Solution**: 
- Verify your API key is correct
- Make sure there are no extra spaces or quotes around the API key
- Check that your API key hasn't been revoked in the SMTP2Go dashboard

### Error: "SMTP2Go API error: 400" or "Sender not verified"

**Solution**:
- Ensure the email in `SMTP2GO_FROM_EMAIL` is verified in your SMTP2Go account
- Go to **Sending** → **Verified Senders** in SMTP2Go dashboard
- Verify the sender email address

### Emails Not Being Received

**Check**:
1. Check spam/junk folder
2. Verify the recipient email address is correct
3. Check SMTP2Go dashboard for delivery status
4. Review server logs for any error messages

## Example .env.local File

```env
# Database
MONGODB_URI=mongodb://127.0.0.1:27017/proofresponse

# JWT
JWT_SECRET=your_jwt_secret_key_here

# Application
NEXT_PUBLIC_BASE_URL=http://localhost:8000
NODE_ENV=development

# SMTP2Go Email Configuration
SMTP2GO_API_KEY=api-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SMTP2GO_FROM_EMAIL=noreply@yourdomain.com
SMTP2GO_FROM_NAME=The Server

# CORS
CORS_DEFAULT_ORIGINS=http://localhost:3000

# Superadmin Setup
SUPERADMIN_SETUP_TOKEN=your_setup_token_here
```

## Production Deployment

When deploying to production:

1. **Set environment variables** in your hosting platform (Vercel, AWS, etc.)
2. **Verify sender domain** (recommended for production):
   - Add SPF, DKIM, and DMARC records to your domain DNS
   - This improves email deliverability
3. **Monitor email delivery** in SMTP2Go dashboard
4. **Set up email alerts** for failed deliveries

## API Endpoints

### Signup (Sends OTP)
```
POST /api/auth/signup
Body: { "name": "John Doe", "email": "john@example.com", "password": "password123" }
```

### Verify Email
```
POST /api/auth/verify-email
Body: { "email": "john@example.com", "otp": "123456" }
```

### Resend OTP
```
POST /api/auth/resend-otp
Body: { "email": "john@example.com" }
```

## Additional Resources

- [SMTP2Go Documentation](https://www.smtp2go.com/docs/)
- [SMTP2Go API Reference](https://www.smtp2go.com/docs/api/)
- [SMTP2Go Support](https://support.smtp2go.com/)

