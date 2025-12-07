import axios from 'axios';
import { env } from '../lib/config';
import { logger } from './logger';

/**
 * Email utility for sending emails via SMTP2Go API
 * 
 * Environment variables required:
 * - SMTP2GO_API_KEY: Your SMTP2Go API key
 * - SMTP2GO_FROM_EMAIL: The sender email address
 * - SMTP2GO_FROM_NAME: The sender name (optional)
 */

const SMTP2GO_API_URL = 'https://api.smtp2go.com/v3/email/send';

/**
 * Send an email using SMTP2Go API
 * @param {Object} options - Email options
 * @param {string|string[]} options.to - Recipient email(s)
 * @param {string} options.subject - Email subject
 * @param {string} options.htmlBody - HTML email body
 * @param {string} [options.textBody] - Plain text email body (optional)
 * @param {string} [options.from] - Sender email (defaults to SMTP2GO_FROM_EMAIL)
 * @param {string} [options.fromName] - Sender name (defaults to SMTP2GO_FROM_NAME)
 * @returns {Promise<Object>} Response from SMTP2Go API
 */
export async function sendEmail({
  to,
  subject,
  htmlBody,
  textBody,
  from,
  fromName,
}) {
  const apiKey = process.env.SMTP2GO_API_KEY;
  const defaultFrom = process.env.SMTP2GO_FROM_EMAIL;
  const defaultFromName = process.env.SMTP2GO_FROM_NAME || 'The Server';

  if (!apiKey) {
    throw new Error('SMTP2GO_API_KEY is not configured');
  }

  if (!defaultFrom) {
    throw new Error('SMTP2GO_FROM_EMAIL is not configured');
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
    logger.info(`Sending email to: ${recipients.join(', ')}`);
    const response = await axios.post(SMTP2GO_API_URL, emailData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // SMTP2Go API returns { data: { email_id: "...", ... } } on success
    if (response.data) {
      if (response.data.data && response.data.data.email_id) {
        logger.info(`Email sent successfully. Message ID: ${response.data.data.email_id}`);
        return {
          success: true,
          messageId: response.data.data.email_id,
          data: response.data.data,
        };
      }
      // Sometimes the response structure might be slightly different
      if (response.data.email_id) {
        logger.info(`Email sent successfully. Message ID: ${response.data.email_id}`);
        return {
          success: true,
          messageId: response.data.email_id,
          data: response.data,
        };
      }
    }

    throw new Error('Unexpected response format from SMTP2Go');
  } catch (error) {
    logger.error('Failed to send email:', error.response?.data || error.message);
    
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
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #f4f4f4; padding: 20px; border-radius: 5px;">
        <h2 style="color: #333; margin-top: 0;">Welcome, ${userName}!</h2>
        <p>Your email has been successfully verified. Your account is now active and ready to use.</p>
        <p>You can now log in and start using all the features available to you.</p>
        <p>If you have any questions, feel free to reach out to our support team.</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="font-size: 12px; color: #777;">This is an automated message, please do not reply.</p>
      </div>
    </body>
    </html>
  `;

  const textBody = `
Welcome, ${userName}!

Your email has been successfully verified. Your account is now active and ready to use.

You can now log in and start using all the features available to you.

If you have any questions, feel free to reach out to our support team.

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

