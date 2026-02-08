import crypto from 'crypto';
import connectDB from '../lib/db';
import User from '../models/User';
import ValentineUrl from '../models/ValentineUrl';
import ValentineVisit from '../models/ValentineVisit';
import ValentineReply from '../models/ValentineReply';
import ValentineCreditRequest from '../models/ValentineCreditRequest';
import { MAX_REPLIES_PER_SESSION, DEFAULT_MESSAGE_MAX_LENGTH } from '../models/ValentineReply';
import { jsonError, jsonSuccess } from '../lib/response';
import { sendValentineLinkEmail, sendValentineReplyNotificationEmail, sendEmailAsync } from '../utils/email';
import { checkText, checkFields, getBlockedMessage } from '../lib/contentModeration';

const DEFAULT_CREDITS = 1;
const LINK_CREDITS_PER_PACK = 10;
const EMAIL_CREDITS_PER_PACK = 10;
const PRICE_LINK_USD_PER_10 = 0.3;
const PRICE_LINK_PKR_PER_10 = 30;
const PRICE_EMAIL_USD_PER_10 = 0.2;
const PRICE_EMAIL_PKR_PER_10 = 20;
// Legacy / fallback
const CREDITS_PER_PACK = LINK_CREDITS_PER_PACK;
const PRICE_USD = PRICE_LINK_USD_PER_10;
const PRICE_PKR = PRICE_LINK_PKR_PER_10;

function toSlug(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function generateSecureSlug(recipientName) {
  const namePart = toSlug(recipientName).slice(0, 30) || 'val';
  const randomPart = crypto.randomBytes(10).toString('base64url').slice(0, 14);
  return `val-${namePart}-${randomPart}`;
}

function generateSecretToken() {
  return crypto.randomBytes(24).toString('base64url');
}

function sanitizeForOwner(valentine) {
  if (!valentine) return null;
  const id = valentine._id?.toString?.() || valentine._id;
  const buttonTextNoRaw = valentine.buttonTextNo;
  const buttonTextNo = (typeof buttonTextNoRaw === 'string' && buttonTextNoRaw.trim()) ? buttonTextNoRaw.trim() : 'Maybe later';
  return {
    id,
    slug: valentine.slug,
    recipientName: valentine.recipientName,
    recipientEmail: valentine.recipientEmail || null,
    emailSubject: valentine.emailSubject || null,
    emailBody: valentine.emailBody || null,
    emailTheme: valentine.emailTheme || null,
    welcomeText: valentine.welcomeText,
    mainMessage: valentine.mainMessage,
    buttonText: valentine.buttonText,
    buttonTextNo,
    theme: valentine.theme,
    themeColor: valentine.themeColor,
    decorations: Array.isArray(valentine.decorations) ? valentine.decorations : [],
    replyPromptLabel: (valentine.replyPromptLabel && String(valentine.replyPromptLabel).trim()) ? valentine.replyPromptLabel.trim() : 'Write a message to the sender',
    replyMaxLength: typeof valentine.replyMaxLength === 'number' && valentine.replyMaxLength >= 100 ? Math.min(2000, valentine.replyMaxLength) : 500,
    createdBy: valentine.createdBy?._id || valentine.createdBy,
    createdByName: valentine.createdByName,
    createdAt: valentine.createdAt,
    updatedAt: valentine.updatedAt,
    emailResendCount: typeof valentine.emailResendCount === 'number' ? valentine.emailResendCount : 0,
  };
}

function sanitizeForPublic(valentine) {
  if (!valentine) return null;
  const buttonTextNoRaw = valentine.buttonTextNo;
  const buttonTextNo = (typeof buttonTextNoRaw === 'string' && buttonTextNoRaw.trim()) ? buttonTextNoRaw.trim() : 'Maybe later';
  return {
    slug: valentine.slug,
    recipientName: valentine.recipientName,
    welcomeText: valentine.welcomeText,
    mainMessage: valentine.mainMessage,
    buttonText: valentine.buttonText,
    buttonTextNo,
    theme: valentine.theme,
    themeColor: valentine.themeColor,
    decorations: Array.isArray(valentine.decorations) ? valentine.decorations : [],
    replyPromptLabel: (valentine.replyPromptLabel && String(valentine.replyPromptLabel).trim()) ? valentine.replyPromptLabel.trim() : 'Write a message to the sender',
    replyMaxLength: typeof valentine.replyMaxLength === 'number' && valentine.replyMaxLength >= 100 ? Math.min(2000, valentine.replyMaxLength) : 500,
  };
}

export async function getMyValentineUrls(req, res) {
  try {
    await connectDB();
    if (!req.user) {
      return jsonError(res, 401, 'Authentication required');
    }
    const list = await ValentineUrl.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 })
      .lean();
    return jsonSuccess(res, 200, 'Valentine URLs retrieved', {
      valentineUrls: list.map(sanitizeForOwner),
    });
  } catch (error) {
    console.error('Error fetching Valentine URLs:', error);
    return jsonError(res, 500, 'Failed to fetch Valentine URLs', error.message);
  }
}

export async function getValentineCredits(req, res) {
  try {
    await connectDB();
    if (!req.user) {
      return jsonError(res, 401, 'Authentication required');
    }
    const user = await User.findById(req.user._id).select('valentineCredits valentineEmailCredits').lean();
    const credits = user?.valentineCredits != null ? Math.max(0, Number(user.valentineCredits)) : DEFAULT_CREDITS;
    const emailCredits = user?.valentineEmailCredits != null ? Math.max(0, Number(user.valentineEmailCredits)) : 0;
    return jsonSuccess(res, 200, 'Credits retrieved', { credits, emailCredits });
  } catch (error) {
    console.error('Error fetching Valentine credits:', error);
    return jsonError(res, 500, 'Failed to fetch credits', error.message);
  }
}

export async function createValentineUrl(req, res) {
  try {
    await connectDB();
    if (!req.user) {
      return jsonError(res, 401, 'Authentication required');
    }
    let user = await User.findById(req.user._id).select('valentineCredits').lean();
    if (user?.valentineCredits == null) {
      await User.findByIdAndUpdate(req.user._id, { $set: { valentineCredits: DEFAULT_CREDITS } });
      user = { ...user, valentineCredits: DEFAULT_CREDITS };
    }
    const credits = Math.max(0, Number(user.valentineCredits));
    if (credits < 1) {
      return jsonError(res, 403, 'No credits left. Request more credits to create additional Valentine links.', 'INSUFFICIENT_CREDITS');
    }
    const body = req.body || {};
    const {
      recipientName,
      recipientEmail,
      emailSubject,
      emailBody,
      emailTheme,
      welcomeText,
      mainMessage,
      buttonText,
      theme,
      themeColor,
      decorations,
    } = body;
    const buttonTextNo = body.buttonTextNo;
    const replyPromptLabel = body.replyPromptLabel;
    const replyMaxLength = body.replyMaxLength;

    if (!recipientName || !recipientName.trim()) {
      return jsonError(res, 400, 'Recipient name is required');
    }

    const moderation = checkFields({
      recipientName: recipientName.trim(),
      emailSubject: body.emailSubject,
      emailBody: body.emailBody,
      welcomeText: body.welcomeText,
      mainMessage: body.mainMessage,
      buttonText: body.buttonText,
      buttonTextNo: body.buttonTextNo,
      replyPromptLabel: body.replyPromptLabel,
    });
    if (moderation.blocked) {
      return jsonError(res, 400, getBlockedMessage(), 'CONTENT_BLOCKED');
    }

    const emailTrimmed = recipientEmail && typeof recipientEmail === 'string' ? recipientEmail.trim().toLowerCase() : null;

    let slug = generateSecureSlug(recipientName.trim());
    let exists = await ValentineUrl.findOne({ slug });
    let attempts = 0;
    while (exists && attempts < 10) {
      slug = generateSecureSlug(recipientName.trim() + '-' + attempts);
      exists = await ValentineUrl.findOne({ slug });
      attempts++;
    }
    if (exists) {
      return jsonError(res, 500, 'Could not generate unique URL. Please try again.');
    }

    const secretToken = generateSecretToken();
    const doc = await ValentineUrl.create({
      slug,
      secretToken,
      recipientName: recipientName.trim(),
      recipientEmail: emailTrimmed || null,
      emailSubject: emailSubject && typeof emailSubject === 'string' ? emailSubject.trim() : null,
      emailBody: emailBody && typeof emailBody === 'string' ? emailBody.trim() : null,
      emailTheme: emailTheme && typeof emailTheme === 'string' ? emailTheme.trim() : null,
      welcomeText: (welcomeText || '').trim() || "You've got something special",
      mainMessage: (mainMessage || '').trim(),
      buttonText: (buttonText || '').trim() || 'Open',
      buttonTextNo: (typeof buttonTextNo === 'string' ? buttonTextNo.trim() : '') || 'Maybe later',
      theme: theme || 'romantic',
      themeColor: themeColor || 'rose',
      decorations: Array.isArray(decorations) ? decorations.filter((d) => ['flowers', 'teddy', 'chocolate', 'hearts'].includes(d)) : [],
      replyPromptLabel: (typeof replyPromptLabel === 'string' && replyPromptLabel.trim()) ? replyPromptLabel.trim().slice(0, 120) : 'Write a message to the sender',
      replyMaxLength: typeof replyMaxLength === 'number' && replyMaxLength >= 100 ? Math.min(2000, replyMaxLength) : 500,
      createdBy: req.user._id,
      createdByName: req.user.name || '',
    });

    // Email is sent only when the user clicks "Resend email", not on create or update.
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { valentineCredits: -1 },
    });

    const baseUrl = getBaseUrl(req) || req.headers?.origin || '';
    return jsonSuccess(res, 201, 'Valentine URL created', {
      valentineUrl: sanitizeForOwner(doc),
      fullUrl: baseUrl ? `${baseUrl}/valentine/${doc.slug}` : '',
    });
  } catch (error) {
    console.error('Error creating Valentine URL:', error);
    if (error.code === 11000) {
      return jsonError(res, 400, 'This URL already exists. Please try again.');
    }
    return jsonError(res, 500, 'Failed to create Valentine URL', error.message);
  }
}

export async function createCreditRequest(req, res) {
  try {
    await connectDB();
    if (!req.user) {
      return jsonError(res, 401, 'Authentication required');
    }
    const requestedCredits = Math.max(0, Math.min(1000, Math.floor(Number(req.body.requestedCredits) || 0)));
    const requestedEmailCredits = Math.max(0, Math.min(1000, Math.floor(Number(req.body.requestedEmailCredits) || 0)));
    if (requestedCredits < 1 && requestedEmailCredits < 1) {
      return jsonError(res, 400, 'Request at least 1 link credit or 1 email credit.');
    }
    const message = (req.body.message && String(req.body.message).trim().slice(0, 500)) || '';
    const linkPacks = Math.ceil(Math.max(0, requestedCredits) / LINK_CREDITS_PER_PACK) || 0;
    const emailPacks = Math.ceil(Math.max(0, requestedEmailCredits) / EMAIL_CREDITS_PER_PACK) || 0;
    const amountUsd = (linkPacks * PRICE_LINK_USD_PER_10) + (emailPacks * PRICE_EMAIL_USD_PER_10);
    const amountPkr = (linkPacks * PRICE_LINK_PKR_PER_10) + (emailPacks * PRICE_EMAIL_PKR_PER_10);
    const doc = await ValentineCreditRequest.create({
      user: req.user._id,
      userEmail: req.user.email || '',
      userName: req.user.name || '',
      requestedCredits: requestedCredits || 0,
      requestedEmailCredits: requestedEmailCredits || 0,
      amountUsd,
      amountPkr,
      message,
      status: 'pending',
    });
    return jsonSuccess(res, 201, 'Credit request submitted. After payment the developer will add your credits.', {
      request: {
        id: doc._id.toString(),
        requestedCredits: doc.requestedCredits,
        requestedEmailCredits: doc.requestedEmailCredits ?? 0,
        amountUsd: doc.amountUsd,
        amountPkr: doc.amountPkr,
        status: doc.status,
      },
    });
  } catch (error) {
    console.error('Error creating credit request:', error);
    return jsonError(res, 500, 'Failed to submit request', error.message);
  }
}

export async function getCreditRequests(req, res) {
  try {
    await connectDB();
    if (!req.user) {
      return jsonError(res, 401, 'Authentication required');
    }
    const list = await ValentineCreditRequest.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name email')
      .lean();
    const requests = list.map((r) => ({
      id: r._id.toString(),
      userId: r.user?._id?.toString() || r.user?.toString(),
      userName: r.userName || r.user?.name,
      userEmail: r.userEmail || r.user?.email,
      requestedCredits: r.requestedCredits ?? 0,
      requestedEmailCredits: r.requestedEmailCredits ?? 0,
      amountUsd: r.amountUsd,
      amountPkr: r.amountPkr ?? r.amountInr,
      message: r.message,
      status: r.status,
      processedAt: r.processedAt,
      notes: r.notes,
      createdAt: r.createdAt,
    }));
    return jsonSuccess(res, 200, 'Credit requests retrieved', { requests });
  } catch (error) {
    console.error('Error fetching credit requests:', error);
    return jsonError(res, 500, 'Failed to fetch credit requests', error.message);
  }
}

export async function fulfillCreditRequest(req, res) {
  try {
    await connectDB();
    if (!req.user) {
      return jsonError(res, 401, 'Authentication required');
    }
    const { id } = req.query;
    if (!id) {
      return jsonError(res, 400, 'Request ID is required');
    }
    const request = await ValentineCreditRequest.findById(id);
    if (!request) {
      return jsonError(res, 404, 'Credit request not found');
    }
    if (request.status !== 'pending') {
      return jsonError(res, 400, 'Request already processed');
    }
    const raw = req.body.creditsToAdd != null ? Number(req.body.creditsToAdd) : null;
    const creditsToAdd = (raw != null && !Number.isNaN(raw) && raw >= 0 && raw <= 1000)
      ? Math.floor(raw)
      : (request.requestedCredits ?? 0);
    const emailRaw = req.body.emailCreditsToAdd != null ? Number(req.body.emailCreditsToAdd) : null;
    const emailCreditsToAdd = (emailRaw != null && !Number.isNaN(emailRaw) && emailRaw >= 0 && emailRaw <= 1000)
      ? Math.floor(emailRaw)
      : (request.requestedEmailCredits ?? 0);
    if (creditsToAdd === 0 && emailCreditsToAdd === 0) {
      return jsonError(res, 400, 'Add at least 1 link or email credit.');
    }
    await ValentineCreditRequest.findByIdAndUpdate(id, {
      status: 'paid',
      processedAt: new Date(),
      processedBy: req.user._id,
      notes: (request.notes || '') + (req.body.notes ? `\n${String(req.body.notes).trim().slice(0, 500)}` : ''),
    });
    const update = {};
    if (creditsToAdd > 0) update.$inc = { ...(update.$inc || {}), valentineCredits: creditsToAdd };
    if (emailCreditsToAdd > 0) update.$inc = { ...(update.$inc || {}), valentineEmailCredits: emailCreditsToAdd };
    if (Object.keys(update).length) {
      await User.findByIdAndUpdate(request.user, update);
    }
    return jsonSuccess(res, 200, 'Credits added to user', {
      requestId: id,
      creditsAdded: creditsToAdd,
      emailCreditsAdded: emailCreditsToAdd,
    });
  } catch (error) {
    console.error('Error fulfilling credit request:', error);
    return jsonError(res, 500, 'Failed to fulfill request', error.message);
  }
}

function getBaseUrl(req) {
  const host = req.headers?.['x-forwarded-host'] || req.headers?.host || '';
  const proto = req.headers?.['x-forwarded-proto'] === 'https' ? 'https' : 'http';
  if (host) return `${proto}://${host}`;
  const envUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || process.env.SITE_URL;
  if (envUrl) {
    const base = envUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
    return envUrl.startsWith('http') ? envUrl.replace(/\/$/, '') : `https://${base}`;
  }
  return '';
}

export async function getValentineUrlById(req, res) {
  try {
    await connectDB();
    if (!req.user) {
      return jsonError(res, 401, 'Authentication required');
    }
    const { id } = req.query;
    if (!id) {
      return jsonError(res, 400, 'ID is required');
    }
    const doc = await ValentineUrl.findOne({
      _id: id,
      createdBy: req.user._id,
    }).lean();
    if (!doc) {
      return jsonError(res, 404, 'Valentine URL not found');
    }
    return jsonSuccess(res, 200, 'Valentine URL retrieved', {
      valentineUrl: sanitizeForOwner(doc),
      fullUrl: `${getBaseUrl(req)}/valentine/${doc.slug}`,
    });
  } catch (error) {
    console.error('Error fetching Valentine URL:', error);
    return jsonError(res, 500, 'Failed to fetch Valentine URL', error.message);
  }
}

export async function updateValentineUrl(req, res) {
  try {
    await connectDB();
    if (!req.user) {
      return jsonError(res, 401, 'Authentication required');
    }
    const { id } = req.query;
    if (!id) {
      return jsonError(res, 400, 'ID is required');
    }
    const existing = await ValentineUrl.findOne({ _id: id, createdBy: req.user._id }).lean();
    if (!existing) {
      return jsonError(res, 404, 'Valentine URL not found');
    }
    const body = req.body || {};
    const {
      recipientName,
      recipientEmail,
      emailSubject,
      emailBody,
      emailTheme,
      welcomeText,
      mainMessage,
      buttonText,
      theme,
      themeColor,
      decorations,
    } = body;
    const buttonTextNoRaw = body.buttonTextNo;
    const replyPromptLabel = body.replyPromptLabel;
    const replyMaxLength = body.replyMaxLength;
    const emailTrimmed = recipientEmail !== undefined && recipientEmail && typeof recipientEmail === 'string'
      ? recipientEmail.trim().toLowerCase()
      : (existing.recipientEmail || null);

    const $set = {};
    if (recipientName !== undefined) $set.recipientName = recipientName.trim();
    if (recipientEmail !== undefined) $set.recipientEmail = emailTrimmed || null;
    if (emailSubject !== undefined) $set.emailSubject = emailSubject && typeof emailSubject === 'string' ? emailSubject.trim() : null;
    if (emailBody !== undefined) $set.emailBody = emailBody && typeof emailBody === 'string' ? emailBody.trim() : null;
    if (emailTheme !== undefined) $set.emailTheme = emailTheme && typeof emailTheme === 'string' ? emailTheme.trim() : null;
    if (welcomeText !== undefined) $set.welcomeText = welcomeText.trim();
    if (mainMessage !== undefined) $set.mainMessage = mainMessage.trim();
    if (buttonText !== undefined) $set.buttonText = (typeof buttonText === 'string' ? buttonText.trim() : '') || 'Open';
    if (buttonTextNoRaw !== undefined) $set.buttonTextNo = (typeof buttonTextNoRaw === 'string' ? buttonTextNoRaw.trim() : '') || 'Maybe later';
    if (theme !== undefined) $set.theme = theme;
    if (themeColor !== undefined) $set.themeColor = themeColor;
    if (decorations !== undefined) $set.decorations = Array.isArray(decorations) ? decorations.filter((d) => ['flowers', 'teddy', 'chocolate', 'hearts'].includes(d)) : [];
    if (replyPromptLabel !== undefined) $set.replyPromptLabel = (typeof replyPromptLabel === 'string' && replyPromptLabel.trim()) ? replyPromptLabel.trim().slice(0, 120) : 'Write a message to the sender';
    if (replyMaxLength !== undefined) $set.replyMaxLength = typeof replyMaxLength === 'number' && replyMaxLength >= 100 ? Math.min(2000, replyMaxLength) : 500;

    const effective = {
      recipientName: $set.recipientName ?? existing.recipientName,
      emailSubject: $set.emailSubject !== undefined ? $set.emailSubject : existing.emailSubject,
      emailBody: $set.emailBody !== undefined ? $set.emailBody : existing.emailBody,
      welcomeText: $set.welcomeText !== undefined ? $set.welcomeText : existing.welcomeText,
      mainMessage: $set.mainMessage !== undefined ? $set.mainMessage : existing.mainMessage,
      buttonText: $set.buttonText !== undefined ? $set.buttonText : existing.buttonText,
      buttonTextNo: $set.buttonTextNo !== undefined ? $set.buttonTextNo : existing.buttonTextNo,
      replyPromptLabel: $set.replyPromptLabel !== undefined ? $set.replyPromptLabel : existing.replyPromptLabel,
    };
    const updateModeration = checkFields(effective);
    if (updateModeration.blocked) {
      return jsonError(res, 400, getBlockedMessage(), 'CONTENT_BLOCKED');
    }

    const doc = await ValentineUrl.findOneAndUpdate(
      { _id: id, createdBy: req.user._id },
      { $set },
      { new: true, runValidators: true }
    );

    // Email is sent only when the user clicks "Resend email", not on update.
    const baseUrl = getBaseUrl(req) || req.headers?.origin || '';
    return jsonSuccess(res, 200, 'Valentine URL updated', {
      valentineUrl: sanitizeForOwner(doc),
      fullUrl: baseUrl ? `${baseUrl}/valentine/${doc.slug}` : '',
    });
  } catch (error) {
    console.error('Error updating Valentine URL:', error);
    return jsonError(res, 500, 'Failed to update Valentine URL', error.message);
  }
}

export async function resendValentineEmail(req, res) {
  try {
    await connectDB();
    if (!req.user) {
      return jsonError(res, 401, 'Authentication required');
    }
    const { id } = req.query;
    if (!id) {
      return jsonError(res, 400, 'ID is required');
    }
    const doc = await ValentineUrl.findOne({ _id: id, createdBy: req.user._id }).lean();
    if (!doc) {
      return jsonError(res, 404, 'Valentine URL not found');
    }
    const recipientEmail = (doc.recipientEmail && typeof doc.recipientEmail === 'string' && doc.recipientEmail.trim())
      ? doc.recipientEmail.trim().toLowerCase()
      : null;
    if (!recipientEmail) {
      return jsonError(res, 400, 'This link has no recipient email. Add one in Edit to resend.');
    }
    const role = (req.user.role || 'base_user').toLowerCase();
    const hasUnlimitedResend = role === 'developer' || role === 'superadmin';
    if (!hasUnlimitedResend) {
      const resendCount = typeof doc.emailResendCount === 'number' ? doc.emailResendCount : 0;
      const FREE_RESENDS_PER_LINK = 3;
      const hasFreeResend = resendCount < FREE_RESENDS_PER_LINK;
      if (!hasFreeResend) {
        const user = await User.findById(req.user._id).select('valentineEmailCredits').lean();
        const emailCredits = user?.valentineEmailCredits != null ? Math.max(0, Number(user.valentineEmailCredits)) : 0;
        if (emailCredits < 1) {
          return jsonError(res, 403, 'No email credits left. Add email credits to resend (10 for Rs 20 / $0.20).', 'INSUFFICIENT_EMAIL_CREDITS');
        }
        await User.findByIdAndUpdate(req.user._id, { $inc: { valentineEmailCredits: -1 } });
      }
    }
    const baseUrl = getBaseUrl(req) || req.headers?.origin || '';
    const fullUrl = baseUrl ? `${baseUrl}/valentine/${doc.slug}` : '';
    if (!fullUrl) {
      return jsonError(res, 500, 'Server URL not configured. Set NEXT_PUBLIC_APP_URL or VERCEL_URL.', 'BASE_URL_MISSING');
    }
    await sendValentineLinkEmail(recipientEmail, {
      recipientName: doc.recipientName,
      linkUrl: fullUrl,
      theme: doc.theme,
      themeColor: doc.themeColor,
      emailTheme: doc.emailTheme || undefined,
      subject: doc.emailSubject || undefined,
      body: doc.emailBody || undefined,
    });
    await ValentineUrl.findByIdAndUpdate(id, { $inc: { emailResendCount: 1 } });
    return jsonSuccess(res, 200, 'Email resent to recipient', {
      emailSent: true,
      emailResendCount: (typeof doc.emailResendCount === 'number' ? doc.emailResendCount : 0) + 1,
    });
  } catch (error) {
    console.error('Error resending Valentine email:', error);
    return jsonError(res, 500, 'Failed to resend email', error.message);
  }
}

export async function deleteValentineUrl(req, res) {
  try {
    await connectDB();
    if (!req.user) {
      return jsonError(res, 401, 'Authentication required');
    }
    const { id } = req.query;
    if (!id) {
      return jsonError(res, 400, 'ID is required');
    }
    const doc = await ValentineUrl.findOne({ _id: id, createdBy: req.user._id });
    if (!doc) {
      return jsonError(res, 404, 'Valentine URL not found');
    }
    await ValentineUrl.findByIdAndDelete(id);
    return jsonSuccess(res, 200, 'Valentine URL deleted');
  } catch (error) {
    console.error('Error deleting Valentine URL:', error);
    return jsonError(res, 500, 'Failed to delete Valentine URL', error.message);
  }
}

export async function getValentineBySlug(req, res) {
  try {
    await connectDB();
    const { slug } = req.query;
    if (!slug || !slug.trim()) {
      return jsonError(res, 400, 'Invalid link');
    }
    const doc = await ValentineUrl.findOne({ slug: slug.trim().toLowerCase() }).lean();
    if (!doc) {
      return jsonError(res, 404, 'This link is invalid or has been removed');
    }
    return jsonSuccess(res, 200, 'OK', {
      page: sanitizeForPublic(doc),
    });
  } catch (error) {
    console.error('Error fetching Valentine by slug:', error);
    return jsonError(res, 500, 'Failed to load page', error.message);
  }
}

export async function submitValentineReply(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return jsonError(res, 405, 'Method not allowed');
  }
  try {
    await connectDB();
    const body = req.body || {};
    const slug = (body.slug || '').toString().trim().toLowerCase();
    const sessionId = (body.sessionId || '').toString().trim().slice(0, 128);
    let message = typeof body.message === 'string' ? body.message.trim() : '';
    if (!slug) {
      return jsonError(res, 400, 'Slug is required');
    }
    if (!sessionId) {
      return jsonError(res, 400, 'Session is required');
    }
    const valentine = await ValentineUrl.findOne({ slug }).lean();
    if (!valentine) {
      return jsonError(res, 404, 'Invalid link');
    }
    const maxLength = typeof valentine.replyMaxLength === 'number' && valentine.replyMaxLength >= 100
      ? Math.min(2000, valentine.replyMaxLength)
      : DEFAULT_MESSAGE_MAX_LENGTH;
    if (message.length > maxLength) {
      message = message.slice(0, maxLength);
    }
    if (!message) {
      return jsonError(res, 400, 'Message cannot be empty');
    }
    const replyModeration = checkText(message);
    if (replyModeration.blocked) {
      return jsonError(res, 400, getBlockedMessage(), 'CONTENT_BLOCKED');
    }
    const valentineId = valentine._id;
    const count = await ValentineReply.countDocuments({ valentineId, sessionId });
    if (count >= MAX_REPLIES_PER_SESSION) {
      return jsonError(res, 429, `You can send at most ${MAX_REPLIES_PER_SESSION} messages. Limit reached.`);
    }
    await ValentineReply.create({
      valentineId,
      sessionId,
      message,
    });
    const newCount = count + 1;

    const creator = await User.findById(valentine.createdBy).select('email name role').lean();
    const creatorRole = (creator?.role || '').toLowerCase();
    const isDeveloperOrSuperadmin = creatorRole === 'developer' || creatorRole === 'superadmin';
    if (isDeveloperOrSuperadmin && creator?.email) {
      const baseUrl = getBaseUrl(req) || req.headers?.origin || '';
      const dashboardRepliesUrl = baseUrl ? `${baseUrl}/dashboard#valentine-urls` : '';
      sendEmailAsync(
        () =>
          sendValentineReplyNotificationEmail(creator.email, {
            creatorName: creator.name || null,
            linkRecipientName: valentine.recipientName || null,
            messagePreview: message.slice(0, 120),
            dashboardRepliesUrl: dashboardRepliesUrl || undefined,
          }),
        'valentine-reply-notification'
      );
    }

    return jsonSuccess(res, 201, 'Reply sent', {
      repliesLeft: Math.max(0, MAX_REPLIES_PER_SESSION - newCount),
      replyCount: newCount,
    });
  } catch (error) {
    console.error('Error submitting Valentine reply:', error);
    return jsonError(res, 500, 'Failed to send reply', error.message);
  }
}

export async function getValentineReplyCount(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return jsonError(res, 405, 'Method not allowed');
  }
  try {
    await connectDB();
    const slug = (req.query.slug || '').toString().trim().toLowerCase();
    const sessionId = (req.query.sessionId || '').toString().trim().slice(0, 128);
    if (!slug || !sessionId) {
      return jsonSuccess(res, 200, 'OK', { replyCount: 0, repliesLeft: MAX_REPLIES_PER_SESSION });
    }
    const valentine = await ValentineUrl.findOne({ slug }).select('_id').lean();
    if (!valentine) {
      return jsonSuccess(res, 200, 'OK', { replyCount: 0, repliesLeft: MAX_REPLIES_PER_SESSION });
    }
    const replyCount = await ValentineReply.countDocuments({ valentineId: valentine._id, sessionId });
    const repliesLeft = Math.max(0, MAX_REPLIES_PER_SESSION - replyCount);
    return jsonSuccess(res, 200, 'OK', { replyCount, repliesLeft });
  } catch (error) {
    console.error('Error fetching reply count:', error);
    return jsonError(res, 500, 'Failed to fetch count', error.message);
  }
}

/**
 * GET ?since=ISO date - for authenticated user (base user push notification polling).
 * Returns count of new replies on the user's links since the given time.
 */
export async function getValentineReplyNotifications(req, res) {
  try {
    await connectDB();
    if (!req.user) {
      return jsonError(res, 401, 'Authentication required');
    }
    const sinceParam = (req.query.since || '').toString().trim();
    const since = sinceParam ? new Date(sinceParam) : new Date(0);
    if (Number.isNaN(since.getTime())) {
      return jsonError(res, 400, 'Invalid since parameter (use ISO date).');
    }
    const myLinkIds = await ValentineUrl.find({ createdBy: req.user._id }).select('_id').lean();
    const ids = myLinkIds.map((u) => u._id);
    if (ids.length === 0) {
      return jsonSuccess(res, 200, 'OK', { hasNewReplies: false, newCount: 0 });
    }
    const newCount = await ValentineReply.countDocuments({
      valentineId: { $in: ids },
      createdAt: { $gt: since },
    });
    return jsonSuccess(res, 200, 'OK', {
      hasNewReplies: newCount > 0,
      newCount,
    });
  } catch (error) {
    console.error('Error fetching reply notifications:', error);
    return jsonError(res, 500, 'Failed to fetch notifications', error.message);
  }
}

export async function getValentineReplies(req, res) {
  try {
    await connectDB();
    if (!req.user) {
      return jsonError(res, 401, 'Authentication required');
    }
    const id = (req.query.id || '').toString().trim();
    if (!id) {
      return jsonError(res, 400, 'ID is required');
    }
    const isSlug = id.includes('-') && !/^[a-f0-9]{24}$/i.test(id);
    const valentine = await ValentineUrl.findOne(
      isSlug ? { slug: id.toLowerCase(), createdBy: req.user._id } : { _id: id, createdBy: req.user._id }
    ).lean();
    if (!valentine) {
      return jsonError(res, 404, 'Valentine URL not found');
    }
    const replies = await ValentineReply.find({ valentineId: valentine._id })
      .sort({ createdAt: -1 })
      .select('message createdAt sessionId')
      .lean();
    const list = replies.map((r) => ({
      id: r._id.toString(),
      message: r.message,
      createdAt: r.createdAt,
      sessionId: r.sessionId ? r.sessionId.slice(0, 12) + '…' : '',
    }));
    return jsonSuccess(res, 200, 'Replies retrieved', { replies: list });
  } catch (error) {
    console.error('Error fetching Valentine replies:', error);
    return jsonError(res, 500, 'Failed to fetch replies', error.message);
  }
}

const MAX_EVENTS_PER_BATCH = 50;
const MAX_REFERRER_LENGTH = 512;
const MAX_USER_AGENT_LENGTH = 512;
const MAX_ACCESS_PAYLOAD_LENGTH = 4096;

function parseUserAgent(ua) {
  if (!ua || typeof ua !== 'string') return { deviceType: 'Unknown', browser: 'Unknown' };
  const u = ua.trim().slice(0, MAX_USER_AGENT_LENGTH);
  let deviceType = 'Desktop';
  if (/iPad|Tablet|PlayBook|Silk/i.test(u)) deviceType = 'Tablet';
  else if (/Mobile|Android|iPhone|iPod|webOS|BlackBerry|IEMobile|Opera Mini|Windows Phone/i.test(u)) deviceType = 'Mobile';
  let browser = 'Unknown';
  if (/Edg\//i.test(u)) browser = 'Edge';
  else if (/Chrome\//i.test(u) && !/Edg\//i.test(u)) browser = 'Chrome';
  else if (/Firefox\//i.test(u)) browser = 'Firefox';
  else if (/Safari\//i.test(u) && !/Chrome\//i.test(u)) browser = 'Safari';
  else if (/Opera|OPR\//i.test(u)) browser = 'Opera';
  else if (/MSIE|Trident\//i.test(u)) browser = 'IE';
  return { deviceType, browser };
}

export async function trackValentineEvents(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return jsonError(res, 405, 'Method not allowed');
  }
  try {
    await connectDB();
    const requestUserAgent =
      (req.headers && typeof req.headers['user-agent'] === 'string' && req.headers['user-agent'].trim())
        ? req.headers['user-agent'].trim().slice(0, MAX_USER_AGENT_LENGTH)
        : '';
    const body = typeof req.body === 'object' && req.body !== null ? req.body : {};
    let events = Array.isArray(body.events) ? body.events : [];
    if (events.length > MAX_EVENTS_PER_BATCH) {
      events = events.slice(0, MAX_EVENTS_PER_BATCH);
    }
    if (events.length === 0) {
      return jsonSuccess(res, 200, 'No events to process', { processed: 0 });
    }
    const slugToValentineId = new Map();
    const byKey = new Map();
    for (const ev of events) {
      const type = ev && ev.type;
      const slug = ev && typeof ev.slug === 'string' ? ev.slug.trim().toLowerCase() : '';
      const sessionId = ev && typeof ev.sessionId === 'string' ? ev.sessionId.trim().slice(0, 128) : '';
      if (!slug || !sessionId || (type !== 'visit' && type !== 'button_click')) continue;
      if (!slugToValentineId.has(slug)) {
        const v = await ValentineUrl.findOne({ slug }).select('_id').lean();
        if (!v) continue;
        slugToValentineId.set(slug, v._id.toString());
      }
      const valentineId = slugToValentineId.get(slug);
      const key = `${valentineId}:${sessionId}`;
      if (!byKey.has(key)) {
        byKey.set(key, { valentineId, slug, sessionId, visit: null, buttonClicks: 0 });
      }
      const row = byKey.get(key);
      if (type === 'visit') {
        const referrer =
          ev.referrer != null && typeof ev.referrer === 'string'
            ? ev.referrer.trim().slice(0, MAX_REFERRER_LENGTH)
            : '';
        let userAgentRaw =
          ev.userAgent != null && typeof ev.userAgent === 'string'
            ? ev.userAgent.trim().slice(0, MAX_USER_AGENT_LENGTH)
            : '';
        if (!userAgentRaw && requestUserAgent) userAgentRaw = requestUserAgent;
        let accessPayloadStr = '';
        if (ev.accessPayload != null) {
          try {
            const raw =
              typeof ev.accessPayload === 'string'
                ? ev.accessPayload
                : JSON.stringify(ev.accessPayload);
            accessPayloadStr = raw.trim().slice(0, MAX_ACCESS_PAYLOAD_LENGTH);
          } catch (_) {}
        }
        const { deviceType, browser } = parseUserAgent(userAgentRaw);
        const visitedAt = ev.timestamp ? new Date(ev.timestamp) : new Date();
        if (!row.visit) {
          row.visit = {
            visitedAt,
            referrer,
            userAgent: userAgentRaw,
            deviceType,
            browser,
            accessPayload: accessPayloadStr,
          };
        }
      } else if (type === 'button_click') {
        row.buttonClicks += 1;
      }
    }
    for (const [, row] of byKey) {
      if (!row.visit) {
        const { deviceType, browser } = parseUserAgent(requestUserAgent);
        row.visit = {
          visitedAt: new Date(),
          referrer: '',
          userAgent: requestUserAgent,
          deviceType: deviceType || 'Unknown',
          browser: browser || 'Unknown',
          accessPayload: '',
        };
      }
      await ValentineVisit.findOneAndUpdate(
        { valentineId: row.valentineId, sessionId: row.sessionId },
        {
          $set: {
            slug: row.slug,
            visitedAt: row.visit.visitedAt,
            referrer: row.visit.referrer,
            userAgent: row.visit.userAgent || '',
            deviceType: row.visit.deviceType || 'Unknown',
            browser: row.visit.browser || 'Unknown',
            accessPayload: row.visit.accessPayload || '',
          },
          $inc: { buttonClicks: row.buttonClicks },
        },
        { upsert: true }
      );
    }
    return jsonSuccess(res, 200, 'Events processed', { processed: byKey.size });
  } catch (error) {
    console.error('Valentine track error:', error);
    return jsonError(res, 500, 'Failed to record events', error.message);
  }
}

function sanitizeForMonitor(valentine, creator) {
  if (!valentine) return null;
  const id = valentine._id?.toString?.() || valentine._id;
  const buttonTextNoRaw = valentine.buttonTextNo;
  const buttonTextNo = (typeof buttonTextNoRaw === 'string' && buttonTextNoRaw.trim()) ? buttonTextNoRaw.trim() : 'Maybe later';
  return {
    id,
    slug: valentine.slug,
    recipientName: valentine.recipientName,
    recipientEmail: valentine.recipientEmail || null,
    emailSubject: valentine.emailSubject || null,
    emailBody: valentine.emailBody || null,
    emailTheme: valentine.emailTheme || null,
    welcomeText: valentine.welcomeText,
    mainMessage: valentine.mainMessage,
    buttonText: valentine.buttonText,
    buttonTextNo,
    theme: valentine.theme,
    themeColor: valentine.themeColor,
    decorations: Array.isArray(valentine.decorations) ? valentine.decorations : [],
    replyPromptLabel: (valentine.replyPromptLabel && String(valentine.replyPromptLabel).trim()) ? valentine.replyPromptLabel.trim() : 'Write a message to the sender',
    replyMaxLength: typeof valentine.replyMaxLength === 'number' && valentine.replyMaxLength >= 100 ? Math.min(2000, valentine.replyMaxLength) : 500,
    createdAt: valentine.createdAt,
    updatedAt: valentine.updatedAt,
    createdBy: valentine.createdBy?._id?.toString?.() || valentine.createdBy?.toString?.() || valentine.createdBy,
    createdByName: valentine.createdByName || creator?.name,
    creator: creator ? {
      id: creator._id?.toString?.(),
      name: creator.name,
      email: creator.email || null,
      role: creator.role || 'base_user',
    } : null,
  };
}

export async function getValentineMonitorData(req, res) {
  try {
    await connectDB();
    if (!req.user) {
      return jsonError(res, 401, 'Authentication required');
    }
    const role = (req.user.role || '').toLowerCase();
    if (role !== 'developer' && role !== 'superadmin') {
      return jsonError(res, 403, 'Developer access required');
    }

    const list = await ValentineUrl.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email role')
      .lean();

    const valentineIds = list.map((v) => v._id);

    const [visitStats, repliesByValentine, visitsByDay, creationsByDay] = await Promise.all([
      ValentineVisit.aggregate([
        { $match: { valentineId: { $in: valentineIds } } },
        {
          $group: {
            _id: '$valentineId',
            totalVisits: { $sum: 1 },
            totalButtonClicks: { $sum: '$buttonClicks' },
          },
        },
      ]),
      ValentineReply.aggregate([
        { $match: { valentineId: { $in: valentineIds } } },
        {
          $group: {
            _id: '$valentineId',
            count: { $sum: 1 },
          },
        },
      ]),
      ValentineVisit.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$visitedAt' } },
            visits: { $sum: 1 },
            buttonClicks: { $sum: '$buttonClicks' },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      ValentineUrl.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const statsMap = new Map();
    visitStats.forEach((s) => {
      statsMap.set(s._id.toString(), { totalVisits: s.totalVisits, totalButtonClicks: s.totalButtonClicks });
    });
    const repliesMap = new Map();
    repliesByValentine.forEach((r) => {
      repliesMap.set(r._id.toString(), r.count);
    });

    const items = list.map((v) => {
      const full = sanitizeForMonitor(v, v.createdBy);
      const stats = statsMap.get(v._id.toString()) || { totalVisits: 0, totalButtonClicks: 0 };
      const replyCount = repliesMap.get(v._id.toString()) || 0;
      return {
        ...full,
        totalVisits: stats.totalVisits,
        totalButtonClicks: stats.totalButtonClicks,
        replyCount,
      };
    });

    const trending = {
      visitsByDay: visitsByDay.map((d) => ({ date: d._id, visits: d.visits, buttonClicks: d.buttonClicks })),
      creationsByDay: creationsByDay.map((d) => ({ date: d._id, count: d.count })),
    };

    return jsonSuccess(res, 200, 'Monitor data retrieved', {
      items,
      trending,
      summary: {
        totalLinks: items.length,
        totalVisits: items.reduce((acc, i) => acc + (i.totalVisits || 0), 0),
        totalButtonClicks: items.reduce((acc, i) => acc + (i.totalButtonClicks || 0), 0),
        totalReplies: items.reduce((acc, i) => acc + (i.replyCount || 0), 0),
      },
    });
  } catch (error) {
    console.error('Error fetching Valentine monitor data:', error);
    return jsonError(res, 500, 'Failed to fetch monitor data', error.message);
  }
}

export async function getValentineAnalytics(req, res) {
  try {
    await connectDB();
    if (!req.user) {
      return jsonError(res, 401, 'Authentication required');
    }
    const id = (req.query.id || req.query.slug || '').toString().trim();
    if (!id) {
      return jsonError(res, 400, 'ID or slug is required');
    }
    const isSlug = id.includes('-') && !/^[a-f0-9]{24}$/i.test(id);
    const doc = await ValentineUrl.findOne(
      isSlug ? { slug: id.toLowerCase(), createdBy: req.user._id } : { _id: id, createdBy: req.user._id }
    ).lean();
    if (!doc) {
      return jsonError(res, 404, 'Valentine URL not found');
    }
    const valentineId = doc._id;
    const [totalStats, byReferrer, recentVisits, repliesList] = await Promise.all([
      ValentineVisit.aggregate([
        { $match: { valentineId } },
        {
          $group: {
            _id: null,
            totalVisits: { $sum: 1 },
            totalButtonClicks: { $sum: '$buttonClicks' },
          },
        },
      ]).then((r) => r[0] || { totalVisits: 0, totalButtonClicks: 0 }),
      ValentineVisit.aggregate([
        { $match: { valentineId } },
        {
          $group: {
            _id: { $cond: [{ $eq: ['$referrer', ''] }, '(direct)', '$referrer'] },
            visits: { $sum: 1 },
            buttonClicks: { $sum: '$buttonClicks' },
          },
        },
        { $sort: { visits: -1 } },
        { $limit: 20 },
        {
          $project: {
            referrer: '$_id',
            visits: 1,
            buttonClicks: 1,
            _id: 0,
          },
        },
      ]),
      ValentineVisit.find({ valentineId })
        .sort({ visitedAt: -1 })
        .select('visitedAt referrer buttonClicks userAgent deviceType browser accessPayload')
        .lean(),
      ValentineReply.find({ valentineId }).sort({ createdAt: -1 }).select('message createdAt sessionId').lean(),
    ]);
    const replies = (repliesList || []).map((r) => ({
      id: r._id.toString(),
      message: r.message,
      createdAt: r.createdAt,
      sessionId: r.sessionId ? r.sessionId.slice(0, 12) + '…' : '',
    }));
    const allVisits = recentVisits.map((v) => ({
      visitedAt: v.visitedAt,
      referrer: v.referrer || '(direct)',
      buttonClicks: v.buttonClicks || 0,
      deviceType: v.deviceType || 'Unknown',
      browser: v.browser || 'Unknown',
      userAgent: v.userAgent ? v.userAgent.slice(0, 120) : '',
      accessPayload: v.accessPayload || '',
    }));
    return jsonSuccess(res, 200, 'Analytics retrieved', {
      analytics: {
        totalVisits: totalStats.totalVisits || 0,
        totalButtonClicks: totalStats.totalButtonClicks || 0,
        buttonText: doc.buttonText || 'Open',
        byReferrer,
        allVisits,
        replies,
      },
    });
  } catch (error) {
    console.error('Error fetching Valentine analytics:', error);
    return jsonError(res, 500, 'Failed to load analytics', error.message);
  }
}
