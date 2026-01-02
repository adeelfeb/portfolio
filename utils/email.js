import axios from 'axios';
import nodemailer from 'nodemailer';
import { env } from '../lib/config';
import { logger } from './logger';

/**
 * Email utility for sending emails via SMTP2Go
 * 
 * Supports both:
 * 1. REST API (requires SMTP2GO_API_KEY)
 * 2. SMTP Protocol (requires SMTP_USERNAME, SMTP_PASSWORD, SMTP_HOST, SMTP_PORT)
 * 
 * Environment variables:
 * - SMTP2GO_API_KEY: Your SMTP2Go API key (for REST API)
 * - SMTP2GO_FROM_EMAIL: The sender email address
 * - SMTP2GO_FROM_NAME: The sender name (optional)
 * - SMTP_USERNAME: SMTP username (for SMTP protocol)
 * - SMTP_PASSWORD: SMTP password (for SMTP protocol)
 * - SMTP_HOST: SMTP host (defaults to mail.smtp2go.com)
 * - SMTP_PORT: SMTP port (defaults to 25)
 * - SMTP_SECURE: Use SSL/TLS (defaults to false)
 */

const SMTP2GO_API_URL = 'https://api.smtp2go.com/v3/email/send';

/**
 * Send email using SMTP protocol (fallback when API key is not available)
 */
async function sendEmailViaSMTP({ to, subject, htmlBody, textBody, from, fromName }) {
  const smtpHost = env.SMTP_HOST || 'mail.smtp2go.com';
  const smtpPort = parseInt(env.SMTP_PORT || '25', 10);
  const smtpUsername = env.SMTP_USERNAME;
  const smtpPassword = env.SMTP_PASSWORD;
  const smtpSecure = env.SMTP_SECURE || false;
  const defaultFrom = env.SMTP_FROM;
  const defaultFromName = 'The Server';

  if (!smtpUsername || smtpUsername.trim() === '' || !smtpPassword || smtpPassword.trim() === '') {
    logger.error('SMTP_USERNAME and SMTP_PASSWORD are required for SMTP protocol. Check your .env file.');
    throw new Error('SMTP_USERNAME and SMTP_PASSWORD are required for SMTP protocol. Please add them to your .env or .env.local file.');
  }

  if (!defaultFrom || defaultFrom.trim() === '') {
    logger.error('SMTP_FROM is not configured. Check your .env file.');
    throw new Error('SMTP_FROM is not configured. Please add it to your .env or .env.local file.');
  }

  // Create transporter with timeout configuration
  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure, // true for 465, false for other ports
    auth: {
      user: smtpUsername,
      pass: smtpPassword,
    },
    connectionTimeout: 10000, // 10 seconds to establish connection
    socketTimeout: 10000, // 10 seconds for socket operations
    greetingTimeout: 10000, // 10 seconds for SMTP greeting
  });

  // Normalize 'to' to array
  const recipients = Array.isArray(to) ? to : [to];

  // Send email
  const mailOptions = {
    from: fromName 
      ? `${fromName} <${from || defaultFrom}>` 
      : (from || defaultFrom),
    to: recipients.join(', '),
    subject: subject,
    html: htmlBody,
    text: textBody || htmlBody.replace(/<[^>]*>/g, ''), // Strip HTML if no text body
  };

  // Send with timeout wrapper
  const sendPromise = transporter.sendMail(mailOptions);
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('SMTP send timeout after 10 seconds')), 10000)
  );
  
  const info = await Promise.race([sendPromise, timeoutPromise]);
  
  // Only log in development
  if (process.env.NODE_ENV === 'development') {
    logger.info(`Email sent via SMTP to: ${recipients.join(', ')}, Message ID: ${info.messageId}`);
  }
  
  return {
    success: true,
    messageId: info.messageId,
    data: info,
  };
}

/**
 * Send email using SMTP2Go REST API
 */
async function sendEmailViaAPI({ to, subject, htmlBody, textBody, from, fromName }) {
  const apiKey = env.SMTP2GO_API_KEY;
  const defaultFrom = env.SMTP2GO_FROM_EMAIL;
  const defaultFromName = env.SMTP2GO_FROM_NAME || 'The Server';

  if (!apiKey || apiKey.trim() === '') {
    logger.error('SMTP2GO_API_KEY is not configured. Check your .env file.');
    throw new Error('SMTP2GO_API_KEY is not configured. Please add it to your .env or .env.local file.');
  }

  if (!defaultFrom || defaultFrom.trim() === '') {
    logger.error('SMTP2GO_FROM_EMAIL is not configured. Check your .env file.');
    throw new Error('SMTP2GO_FROM_EMAIL is not configured. Please add it to your .env or .env.local file.');
  }

  // Normalize 'to' to array
  const recipients = Array.isArray(to) ? to : [to];

  // Validate recipients
  if (recipients.length === 0) {
    throw new Error('At least one recipient email is required');
  }

  const emailData = {
    api_key: apiKey,
    to: recipients,
    sender: from || defaultFrom,
    subject: subject,
    html_body: htmlBody,
    ...(textBody && { text_body: textBody }),
    ...(fromName || defaultFromName ? { sender_name: fromName || defaultFromName } : {}),
  };

  try {
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      logger.info(`Sending email via API to: ${recipients.join(', ')}`);
    }
    const response = await axios.post(SMTP2GO_API_URL, emailData, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 second timeout to prevent hanging
    });

    // SMTP2Go API returns { data: { email_id: "...", ... } } on success
    if (response.data) {
      if (response.data.data && response.data.data.email_id) {
        // Only log in development
        if (process.env.NODE_ENV === 'development') {
          logger.info(`Email sent successfully. Message ID: ${response.data.data.email_id}`);
        }
        return {
          success: true,
          messageId: response.data.data.email_id,
          data: response.data.data,
        };
      }
      // Sometimes the response structure might be slightly different
      if (response.data.email_id) {
        // Only log in development
        if (process.env.NODE_ENV === 'development') {
          logger.info(`Email sent successfully. Message ID: ${response.data.email_id}`);
        }
        return {
          success: true,
          messageId: response.data.email_id,
          data: response.data,
        };
      }
    }

    throw new Error('Unexpected response format from SMTP2Go');
  } catch (error) {
    logger.error('Failed to send email via API:', error.response?.data || error.message);
    
    if (error.response) {
      // SMTP2Go API error - extract meaningful error message
      const errorData = error.response.data;
      let errorMessage = 'SMTP2Go API error';
      
      if (errorData?.data?.error) {
        errorMessage = errorData.data.error;
      } else if (errorData?.error) {
        errorMessage = errorData.error;
      } else if (errorData?.error_code) {
        errorMessage = `SMTP2Go error (${errorData.error_code}): ${errorData.error || 'Unknown error'}`;
      } else {
        errorMessage = `SMTP2Go API error: ${error.response.status} ${error.response.statusText || ''}`;
      }
      
      // Add helpful context for common errors
      if (error.response.status === 401) {
        errorMessage += ' - Check your SMTP2GO_API_KEY';
      } else if (error.response.status === 400) {
        errorMessage += ' - Verify your SMTP2GO_FROM_EMAIL is verified in SMTP2Go dashboard';
      }
      
      throw new Error(errorMessage);
    }
    
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

export async function sendEmail({
  to,
  subject,
  htmlBody,
  textBody,
  from,
  fromName,
}) {

  // Try REST API first if API key is available
  if (env.SMTP2GO_API_KEY && env.SMTP2GO_API_KEY.trim() !== '') {
    try {
      return await sendEmailViaAPI({ to, subject, htmlBody, textBody, from, fromName });
    } catch (error) {
      logger.warn('REST API failed, falling back to SMTP:', error.message);
      // Fall through to SMTP if API fails
    }
  }

  // Fall back to SMTP protocol if API key is not available or API failed
  if (env.SMTP_USERNAME && env.SMTP_USERNAME.trim() !== '' &&
      env.SMTP_PASSWORD && env.SMTP_PASSWORD.trim() !== '') {
    return await sendEmailViaSMTP({ to, subject, htmlBody, textBody, from, fromName });
  }

  // If neither method is configured, throw helpful error with debug info
  const errorMsg =
    'Email configuration missing. Please configure either:\n' +
    '1. SMTP2GO_API_KEY (for REST API), or\n' +
    '2. SMTP_USERNAME and SMTP_PASSWORD (for SMTP protocol)\n\n' +
    'Current status:\n' +
    `- SMTP2GO_API_KEY: ${env.SMTP2GO_API_KEY ? 'Set' : 'NOT SET'}\n` +
    `- SMTP_USERNAME: ${env.SMTP_USERNAME ? 'Set' : 'NOT SET'}\n` +
    `- SMTP_PASSWORD: ${env.SMTP_PASSWORD ? 'Set' : 'NOT SET'}\n` +
    `- SMTP_FROM: ${env.SMTP_FROM ? 'Set' : 'NOT SET'}\n` +
    `- SMTP2GO_FROM_EMAIL: ${env.SMTP2GO_FROM_EMAIL || 'NOT SET'}\n\n` +
    'Please check your .env or .env.local file and restart the server.';

  logger.error('Email configuration error:', errorMsg);
  throw new Error(errorMsg);
}

/**
 * Send email asynchronously without blocking (fire and forget)
 * Logs errors but doesn't throw - useful for non-critical emails
 * @param {Function} emailFn - Function that returns a promise for sending email
 * @param {string} context - Context for logging (e.g., 'signup', 'verification')
 * @returns {void} Returns immediately, email sends in background
 */
export function sendEmailAsync(emailFn, context = 'email') {
  // Execute email sending in background without blocking
  Promise.resolve()
    .then(() => emailFn())
    .then((result) => {
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        logger.info(`[${context}] Email sent successfully in background`, {
          messageId: result?.messageId,
          timestamp: new Date().toISOString(),
        });
      }
    })
    .catch((error) => {
      // Always log errors - these are important for production debugging
      logger.error(`[${context}] Background email sending failed:`, {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      });
    });
  
  // Return immediately - email is being sent in background
}

/**
 * Send OTP verification email
 * @param {string} email - Recipient email
 * @param {string} otp - OTP code
 * @param {string} [userName] - User's name (optional)
 * @returns {Promise<Object>} Response from sendEmail
 */
export async function sendOTPEmail(email, otp, userName = null) {
  const subject = 'Verify Your Email Address';
  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verification</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #f4f4f4; padding: 20px; border-radius: 5px;">
        <h2 style="color: #333; margin-top: 0;">Email Verification</h2>
        ${userName ? `<p>Hello ${userName},</p>` : '<p>Hello,</p>'}
        <p>Thank you for signing up! Please use the following code to verify your email address:</p>
        <div style="background-color: #fff; border: 2px dashed #333; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px;">
          <h1 style="color: #333; font-size: 32px; letter-spacing: 5px; margin: 0;">${otp}</h1>
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't create an account, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="font-size: 12px; color: #777;">This is an automated message, please do not reply.</p>
      </div>
    </body>
    </html>
  `;

  const textBody = `
Email Verification

${userName ? `Hello ${userName},` : 'Hello,'}

Thank you for signing up! Please use the following code to verify your email address:

${otp}

This code will expire in 10 minutes.

If you didn't create an account, please ignore this email.

---
This is an automated message, please do not reply.
  `;

  return sendEmail({
    to: email,
    subject,
    htmlBody,
    textBody,
  });
}

/**
 * Send welcome email after successful verification
 * @param {string} email - Recipient email
 * @param {string} userName - User's name
 * @returns {Promise<Object>} Response from sendEmail
 */
export async function sendWelcomeEmail(email, userName) {
  const subject = 'Welcome! Your Email Has Been Verified';
  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f7fa;">
      <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f7fa; padding: 20px;">
        <tr>
          <td align="center" style="padding: 20px 0;">
            <table role="presentation" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #0070f3 0%, #3291ff 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Welcome, ${userName}!</h1>
                </td>
              </tr>
              
              <!-- Main Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="color: #333; font-size: 16px; margin: 0 0 20px 0; line-height: 1.8;">
                    Your email has been successfully verified. Your account is now active and ready to use.
                  </p>
                  <p style="color: #333; font-size: 16px; margin: 0 0 30px 0; line-height: 1.8;">
                    You can now log in and start using all the features available to you.
                  </p>
                  
                  <!-- Services Section -->
                  <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-left: 4px solid #0070f3; padding: 25px; border-radius: 8px; margin: 30px 0;">
                    <h2 style="color: #0070f3; margin: 0 0 15px 0; font-size: 22px; font-weight: 600;">🚀 Need Professional Services?</h2>
                    <p style="color: #495057; font-size: 15px; margin: 0 0 15px 0; line-height: 1.7;">
                      If you're looking for professional services in <strong style="color: #212529;">website development</strong>, <strong style="color: #212529;">programming & software</strong>, <strong style="color: #212529;">app development</strong>, <strong style="color: #212529;">deployment</strong>, <strong style="color: #212529;">SEO</strong>, or <strong style="color: #212529;">email marketing</strong>, we're here to help!
                    </p>
                    <p style="color: #495057; font-size: 15px; margin: 0 0 20px 0; line-height: 1.7;">
                      <strong style="color: #28a745;">✨ Special Offer:</strong> Get <strong style="color: #dc3545;">discounted prices</strong> and <strong style="color: #0070f3;">free guidance</strong> for your project workflow!
                    </p>
                    
                    <!-- Links Section -->
                    <div style="margin-top: 25px;">
                      <p style="color: #495057; font-size: 14px; margin: 0 0 12px 0; font-weight: 600;">Connect with us:</p>
                      <table role="presentation" style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td style="padding: 8px 0;">
                            <a href="https://www.fiverr.com/s/EgQz3ey" style="display: inline-block; background-color: #1dbf73; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 14px; margin-right: 10px;">📦 Fiverr</a>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0;">
                            <a href="https://www.upwork.com/freelancers/~015f09e4ce1f66527f?p=1804023285153173504" style="display: inline-block; background-color: #14a800; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 14px; margin-right: 10px;">💼 Upwork</a>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0;">
                            <a href="https://designndev.com/" style="display: inline-block; background-color: #0070f3; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 14px;">🌐 Our Website</a>
                          </td>
                        </tr>
                      </table>
                    </div>
                  </div>
                  
                  <p style="color: #6c757d; font-size: 14px; margin: 30px 0 0 0; line-height: 1.6;">
                    If you have any questions, feel free to reach out to our support team.
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e9ecef;">
                  <p style="color: #6c757d; font-size: 12px; margin: 0; line-height: 1.5;">
                    This is an automated message, please do not reply.<br>
                    © ${new Date().getFullYear()} Design & Dev. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const textBody = `
Welcome, ${userName}!

Your email has been successfully verified. Your account is now active and ready to use.

You can now log in and start using all the features available to you.

Need Professional Services?

If you're looking for professional services in website development, programming & software, app development, deployment, SEO, or email marketing, we're here to help!

Special Offer: Get discounted prices and free guidance for your project workflow!

Connect with us:
- Fiverr: https://www.fiverr.com/s/EgQz3ey
- Upwork: https://www.upwork.com/freelancers/~015f09e4ce1f66527f?p=1804023285153173504
- Our Website: https://designndev.com/

If you have any questions, feel free to reach out to our support team.

---
This is an automated message, please do not reply.
© ${new Date().getFullYear()} Design & Dev. All rights reserved.
  `;

  return sendEmail({
    to: email,
    subject,
    htmlBody,
    textBody,
  });
}

