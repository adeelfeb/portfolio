import { sendEmail } from '../../../utils/email';
import { jsonError, jsonSuccess } from '../../../lib/response';
import { applyCors } from '../../../utils';
import { logger } from '../../../utils/logger';
import { env } from '../../../lib/config';

/**
 * Test endpoint for email configuration
 * POST /api/test/email
 * Body: { "to": "test@example.com", "subject": "Test", "message": "Test message" }
 */
export default async function handler(req, res) {
  if (await applyCors(req, res)) return;

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return jsonError(res, 405, `Method ${req.method} not allowed`);
  }

  // Check if required environment variables are set (using config file)
  const apiKey = env.SMTP2GO_API_KEY;
  const fromEmail = env.SMTP2GO_FROM_EMAIL;
  const fromName = env.SMTP2GO_FROM_NAME || 'The Server';

  const missing = [];
  if (!apiKey) missing.push('SMTP2GO_API_KEY');
  if (!fromEmail) missing.push('SMTP2GO_FROM_EMAIL');

  if (missing.length > 0) {
    return jsonError(
      res,
      500,
      `Missing required environment variables: ${missing.join(', ')}. Please check your .env.local file.`,
      {
        missing,
        configured: {
          SMTP2GO_API_KEY: apiKey ? '✅ Set' : '❌ Missing',
          SMTP2GO_FROM_EMAIL: fromEmail ? '✅ Set' : '❌ Missing',
          SMTP2GO_FROM_NAME: fromName || 'Using default: "The Server"',
        },
      }
    );
  }

  const { to, subject, message } = req.body || {};

  if (!to) {
    return jsonError(res, 400, 'Missing required field: to (recipient email)');
  }

  const emailOk = typeof to === 'string' && /.+@.+\..+/.test(to);
  if (!emailOk) {
    return jsonError(res, 400, 'Invalid email format');
  }

  try {
    const testSubject = subject || 'Test Email from Your Application';
    const testMessage = message || 'This is a test email to verify your SMTP2Go configuration is working correctly.';

    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Test Email</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f4f4f4; padding: 20px; border-radius: 5px;">
          <h2 style="color: #333; margin-top: 0;">Test Email</h2>
          <p>${testMessage}</p>
          <p>If you received this email, your SMTP2Go configuration is working correctly! ✅</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="font-size: 12px; color: #777;">
            <strong>Configuration Details:</strong><br>
            From Email: ${fromEmail}<br>
            From Name: ${fromName}<br>
            API Key: ${apiKey.substring(0, 10)}... (hidden)
          </p>
        </div>
      </body>
      </html>
    `;

    const textBody = `
Test Email

${testMessage}

If you received this email, your SMTP2Go configuration is working correctly! ✅

---
Configuration Details:
From Email: ${fromEmail}
From Name: ${fromName}
    `;

    const result = await sendEmail({
      to,
      subject: testSubject,
      htmlBody,
      textBody,
    });

    logger.info(`Test email sent successfully to: ${to}`);

    return jsonSuccess(res, 200, 'Test email sent successfully!', {
      recipient: to,
      messageId: result.messageId,
      configuration: {
        fromEmail,
        fromName,
        apiKeyConfigured: true,
      },
    });
  } catch (error) {
    logger.error('Test email failed:', error.message);
    return jsonError(res, 500, 'Failed to send test email', {
      error: error.message,
      configuration: {
        SMTP2GO_API_KEY: apiKey ? '✅ Set' : '❌ Missing',
        SMTP2GO_FROM_EMAIL: fromEmail ? '✅ Set' : '❌ Missing',
        SMTP2GO_FROM_NAME: fromName || 'Using default',
      },
    });
  }
}

