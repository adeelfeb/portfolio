# Environment Variables Checklist for Email Verification

## ✅ Required Environment Variables

Add these to your `.env.local` file (or `.env` file):

```env
# ============================================
# SMTP2Go Email Configuration (REQUIRED)
# ============================================
SMTP2GO_API_KEY=your_api_key_here
SMTP2GO_FROM_EMAIL=your-verified-email@example.com

# ============================================
# SMTP2Go Email Configuration (OPTIONAL)
# ============================================
SMTP2GO_FROM_NAME=Your App Name
```

## 📋 Quick Setup Steps

### 1. Get Your SMTP2Go API Key
- [ ] Sign up/login at [smtp2go.com](https://www.smtp2go.com)
- [ ] Go to **Settings** → **API Keys**
- [ ] Create or copy your API key
- [ ] Add to `.env.local` as `SMTP2GO_API_KEY`

### 2. Verify Your Sender Email
- [ ] In SMTP2Go dashboard, go to **Sending** → **Verified Senders**
- [ ] Add your sender email address
- [ ] Verify the email (check inbox for verification link)
- [ ] Add to `.env.local` as `SMTP2GO_FROM_EMAIL`

### 3. Optional: Set Sender Name
- [ ] Add `SMTP2GO_FROM_NAME` to `.env.local` (defaults to "The Server")

### 4. Test Your Configuration
- [ ] Restart your development server
- [ ] Test using: `POST /api/test/email`
- [ ] Or try signing up a new user

## 🔍 Verification Checklist

Use this checklist to verify your setup:

- [ ] `SMTP2GO_API_KEY` is set in `.env.local`
- [ ] `SMTP2GO_FROM_EMAIL` is set in `.env.local`
- [ ] Sender email is verified in SMTP2Go dashboard
- [ ] Server has been restarted after adding env variables
- [ ] Test email endpoint works: `POST /api/test/email`
- [ ] Signup flow sends OTP email successfully
- [ ] OTP verification works correctly

## 🧪 Test Your Setup

### Method 1: Test Endpoint
```bash
curl -X POST http://localhost:8000/api/test/email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "your-email@example.com",
    "subject": "Test Email",
    "message": "Testing SMTP2Go configuration"
  }'
```

### Method 2: Signup Flow
1. Sign up a new user
2. Check email inbox for OTP
3. Verify email with OTP code

## ❌ Common Issues

| Issue | Solution |
|-------|----------|
| "SMTP2GO_API_KEY is not configured" | Add `SMTP2GO_API_KEY` to `.env.local` and restart server |
| "SMTP2GO_FROM_EMAIL is not configured" | Add `SMTP2GO_FROM_EMAIL` to `.env.local` |
| "401 Unauthorized" | Check API key is correct, no extra spaces |
| "400 Bad Request" | Verify sender email in SMTP2Go dashboard |
| Emails not received | Check spam folder, verify recipient email |

## 📝 Example .env.local

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

## 🔗 Resources

- [SMTP2Go Dashboard](https://app.smtp2go.com/)
- [SMTP2Go API Documentation](https://www.smtp2go.com/docs/api/)
- [Full Setup Guide](./EMAIL_SETUP_GUIDE.md)

