import { sendEmail } from '../../utils/email';
import { jsonError, jsonSuccess } from '../../lib/response';
import { applyCors } from '../../utils';
import { logger } from '../../utils/logger';
import connectDB from '../../lib/db';
import ContactSubmission from '../../models/ContactSubmission';
import { requireRecaptcha } from '../../lib/recaptcha';

/**
 * Contact form endpoint
 * POST /api/contact
 * Body: { "name": "John Doe", "email": "john@example.com", "projectDetails"?: "...", "recaptchaToken"?: "..." }
 */
export default async function handler(req, res) {
  if (await applyCors(req, res)) return;

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return jsonError(res, 405, `Method ${req.method} not allowed`);
  }

  const ok = await requireRecaptcha(req, res, jsonError);
  if (!ok) return;

  const { name, email, projectDetails } = req.body || {};

  // Validation
  if (!name || !email) {
    return jsonError(res, 400, 'Name and email are required');
  }

  const nameStr = typeof name === 'string' ? name.trim() : '';
  const emailStr = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (!nameStr || !emailStr) {
    return jsonError(res, 400, 'Name and email are required');
  }

  const emailOk = /.+@.+\..+/.test(emailStr);
  if (!emailOk) {
    return jsonError(res, 400, 'Invalid email format');
  }

  const projectDetailsStr =
    typeof projectDetails === 'string' ? projectDetails.trim().slice(0, 2000) : '';

  try {
    const subject = `New Contact Form Submission from ${nameStr}`;
    
    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Contact Form Submission</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f4f4f4; padding: 20px; border-radius: 5px;">
          <h2 style="color: #333; margin-top: 0;">New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${nameStr}</p>
          <p><strong>Email:</strong> ${emailStr}</p>
          ${projectDetailsStr ? `<p><strong>Project Details:</strong></p><p style="white-space: pre-wrap;">${projectDetailsStr}</p>` : ''}
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="font-size: 12px; color: #777;">This is an automated message from the contact form on designndev.com</p>
        </div>
      </body>
      </html>
    `;

    const textBody = `
New Contact Form Submission

Name: ${nameStr}
Email: ${emailStr}
${projectDetailsStr ? `\nProject Details:\n${projectDetailsStr}\n` : ''}
---
This is an automated message from the contact form on designndev.com
    `;

    // Send email to at4563323@gmail.com
    const result = await sendEmail({
      to: 'at4563323@gmail.com',
      subject,
      htmlBody,
      textBody,
    });

    logger.info(`Contact form submission received from: ${nameStr} (${emailStr})`);

    // Save to database for dashboard viewing (non-blocking)
    try {
      await connectDB();
      await ContactSubmission.create({
        name: nameStr,
        email: emailStr,
        projectDetails: projectDetailsStr,
      });
    } catch (dbErr) {
      logger.warn('Contact submission save to DB failed:', dbErr.message);
    }

    return jsonSuccess(res, 200, 'Thank you for contacting us! We will get back to you soon.', {
      messageId: result.messageId,
    });
  } catch (error) {
    logger.error('Contact form submission failed:', error.message);
    return jsonError(res, 500, 'Failed to send message. Please try again later.', {
      error: error.message,
    });
  }
}
