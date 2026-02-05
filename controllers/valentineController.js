import crypto from 'crypto';
import connectDB from '../lib/db';
import ValentineUrl from '../models/ValentineUrl';
import ValentineVisit from '../models/ValentineVisit';
import { jsonError, jsonSuccess } from '../lib/response';
import { sendValentineLinkEmail } from '../utils/email';

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
    theme: valentine.theme,
    themeColor: valentine.themeColor,
    decorations: Array.isArray(valentine.decorations) ? valentine.decorations : [],
    createdBy: valentine.createdBy?._id || valentine.createdBy,
    createdByName: valentine.createdByName,
    createdAt: valentine.createdAt,
    updatedAt: valentine.updatedAt,
  };
}

function sanitizeForPublic(valentine) {
  if (!valentine) return null;
  return {
    slug: valentine.slug,
    recipientName: valentine.recipientName,
    welcomeText: valentine.welcomeText,
    mainMessage: valentine.mainMessage,
    buttonText: valentine.buttonText,
    theme: valentine.theme,
    themeColor: valentine.themeColor,
    decorations: Array.isArray(valentine.decorations) ? valentine.decorations : [],
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

export async function createValentineUrl(req, res) {
  try {
    await connectDB();
    if (!req.user) {
      return jsonError(res, 401, 'Authentication required');
    }
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
    } = req.body;

    if (!recipientName || !recipientName.trim()) {
      return jsonError(res, 400, 'Recipient name is required');
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
      theme: theme || 'classic',
      themeColor: themeColor || 'rose',
      decorations: Array.isArray(decorations) ? decorations.filter((d) => ['flowers', 'teddy', 'chocolate', 'hearts'].includes(d)) : [],
      createdBy: req.user._id,
      createdByName: req.user.name || '',
    });

    let emailSent = false;
    if (emailTrimmed) {
      try {
        const fullUrl = `${getBaseUrl(req)}/valentine/${doc.slug}`;
        await sendValentineLinkEmail(emailTrimmed, {
          recipientName: doc.recipientName,
          linkUrl: fullUrl,
          theme: doc.theme,
          themeColor: doc.themeColor,
          emailTheme: doc.emailTheme || undefined,
          subject: doc.emailSubject || undefined,
          body: doc.emailBody || undefined,
        });
        emailSent = true;
      } catch (err) {
        console.error('Valentine link email failed:', err.message);
      }
    }

    return jsonSuccess(res, 201, 'Valentine URL created', {
      valentineUrl: sanitizeForOwner(doc),
      fullUrl: `${getBaseUrl(req)}/valentine/${doc.slug}`,
      emailSent,
    });
  } catch (error) {
    console.error('Error creating Valentine URL:', error);
    if (error.code === 11000) {
      return jsonError(res, 400, 'This URL already exists. Please try again.');
    }
    return jsonError(res, 500, 'Failed to create Valentine URL', error.message);
  }
}

function getBaseUrl(req) {
  const host = req.headers?.['x-forwarded-host'] || req.headers?.host || '';
  const proto = req.headers?.['x-forwarded-proto'] === 'https' ? 'https' : 'http';
  return host ? `${proto}://${host}` : '';
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
    const doc = await ValentineUrl.findOne({ _id: id, createdBy: req.user._id });
    if (!doc) {
      return jsonError(res, 404, 'Valentine URL not found');
    }
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
    } = req.body;
    if (recipientName !== undefined) doc.recipientName = recipientName.trim();
    const emailTrimmed = recipientEmail !== undefined && recipientEmail && typeof recipientEmail === 'string'
      ? recipientEmail.trim().toLowerCase()
      : (doc.recipientEmail || null);
    if (recipientEmail !== undefined) doc.recipientEmail = emailTrimmed || null;
    if (emailSubject !== undefined) doc.emailSubject = emailSubject && typeof emailSubject === 'string' ? emailSubject.trim() : null;
    if (emailBody !== undefined) doc.emailBody = emailBody && typeof emailBody === 'string' ? emailBody.trim() : null;
    if (emailTheme !== undefined) doc.emailTheme = emailTheme && typeof emailTheme === 'string' ? emailTheme.trim() : null;
    if (welcomeText !== undefined) doc.welcomeText = welcomeText.trim();
    if (mainMessage !== undefined) doc.mainMessage = mainMessage.trim();
    if (buttonText !== undefined) doc.buttonText = buttonText.trim();
    if (theme !== undefined) doc.theme = theme;
    if (themeColor !== undefined) doc.themeColor = themeColor;
    if (decorations !== undefined) doc.decorations = Array.isArray(decorations) ? decorations.filter((d) => ['flowers', 'teddy', 'chocolate', 'hearts'].includes(d)) : [];
    await doc.save();

    let emailSent = false;
    const emailProvidedThisRequest = recipientEmail !== undefined && typeof recipientEmail === 'string' && recipientEmail.trim().length > 0;
    if (emailProvidedThisRequest && emailTrimmed) {
      try {
        const fullUrl = `${getBaseUrl(req)}/valentine/${doc.slug}`;
        await sendValentineLinkEmail(emailTrimmed, {
          recipientName: doc.recipientName,
          linkUrl: fullUrl,
          theme: doc.theme,
          themeColor: doc.themeColor,
          emailTheme: doc.emailTheme || undefined,
          subject: doc.emailSubject || undefined,
          body: doc.emailBody || undefined,
        });
        emailSent = true;
      } catch (err) {
        console.error('Valentine link email failed:', err.message);
      }
    }

    return jsonSuccess(res, 200, 'Valentine URL updated', {
      valentineUrl: sanitizeForOwner(doc),
      fullUrl: `${getBaseUrl(req)}/valentine/${doc.slug}`,
      emailSent,
    });
  } catch (error) {
    console.error('Error updating Valentine URL:', error);
    return jsonError(res, 500, 'Failed to update Valentine URL', error.message);
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
    const [totalStats, byReferrer, recentVisits] = await Promise.all([
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
    ]);
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
      },
    });
  } catch (error) {
    console.error('Error fetching Valentine analytics:', error);
    return jsonError(res, 500, 'Failed to load analytics', error.message);
  }
}
