# Environment Variables to Add for Email Verification

## Problem
Your server is showing that SMTP variables are "NOT SET" even though they exist in your `.env` file. This is because the variables need to be in `.env.local` (which takes precedence).

## Solution: Add these variables to `.env.local`

Create or update your `.env.local` file with the following content:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/proofresponse
JWT_SECRET=f3b8c7e1d2a9b4f6c1e2d3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0

# Application URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Email Configuration - SMTP Protocol (REQUIRED for email verification)
SMTP_HOST=mail.smtp2go.com
SMTP_PORT=25
SMTP_USERNAME=noreply@designndev.com
SMTP_PASSWORD=000!!!@@@918815Cc9@@@!!!000
SMTP_FROM=noreply@designndev.com

# Node Environment
NODE_ENV=development

# CORS
CORS_DEFAULT_ORIGINS=http://localhost:3000

# Superadmin Setup
SUPERADMIN_SETUP_TOKEN=your_setup_token_here

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=dk06hi9th
CLOUDINARY_API_KEY=786333636952633
CLOUDINARY_API_SECRET=S4GkZRSajVPVr2cNq9fylwfyA5w

# Recaptcha
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Lfa1uErAAAAAPfZ3VZsBlg8Ym5QItcGzdCDiSp5
RECAPTCHA_SECRET_KEY=6Lfa1uErAAAAAKQg4tQz0L9Nx-t-kptJ4n8BcCt_

# Loxo API
LOXO_API_KEY=4467dcc7ab8489b9ccb3c489526b040b6b913b9cb267a952efb95d8799d368d01a5bd54824154ff41e5b0e093909edbd9dbd47c575c93d2d6f4cc063d743ba0b18799b17e8c086b9c9c9f14d37a11023c089a08ce537688652daeab9da35313ab53952f15861035b681b7a2f8f525e0c5763637da30477ff8b0daef1f85d8e33
LOXO_SLUG=the-foreign-venture-group
```

## What to Do

1. **Copy the above content** and paste it into your `.env.local` file
2. **Save the file**
3. **Restart your server**:
   ```bash
   npm run dev
   ```

## Why .env.local?

- `.env.local` takes precedence over `.env`
- It's in `.gitignore` (safe for secrets)
- Variables in `.env.local` override those in `.env`

## After Adding Variables

Once you restart the server, you should see in the logs:
- `[Config] SMTP_USERNAME: Set`
- `[Config] SMTP_PASSWORD: Set`
- `[Config] SMTP_FROM: Set`

And email verification should work for signup!

## For Production (Ubuntu)

The same SMTP variables will work on your Ubuntu production server. Just make sure to set these environment variables in your hosting platform or `.env.local` file on production.
