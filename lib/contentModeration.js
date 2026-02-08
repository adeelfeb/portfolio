/**
 * Content moderation: check text against blocked words (vulgar, spam, reportable).
 * Reusable across Valentine links, New Year resolutions, and other components.
 * Uses word-boundary matching to reduce false positives (e.g. "classic" vs "ass").
 */

const enList = require('./blockedWords/en.js');
const romanUrduList = require('./blockedWords/romanUrdu.js');

const DEFAULT_MESSAGE =
  'Your message contains words that may be considered inappropriate or spammy. ' +
  'Using such language can get your emails flagged as spam and is not allowed. Please remove them and try again.';

/** All blocked terms (lowercase), combined and deduped */
const allTerms = [...new Set([...enList, ...romanUrduList].map((w) => w.toLowerCase().trim()).filter(Boolean))];

/** Normalize for matching: lowercase, collapse spaces, optional leet replacement */
function normalizeForMatch(text) {
  if (text == null || typeof text !== 'string') return '';
  let t = text.toLowerCase().trim().replace(/\s+/g, ' ');
  const leet = { '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '@': 'a', '$': 's' };
  t = t.replace(/[013457@$]/g, (c) => leet[c] || c);
  return t;
}

/** Escape special regex chars in a string for use in RegExp */
function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Check if text contains any blocked word (word-boundary match).
 * @param {string} text - Raw input
 * @returns {{ blocked: boolean, found: string[] }}
 */
function checkText(text) {
  const found = [];
  const normalized = normalizeForMatch(text);
  if (!normalized) return { blocked: false, found: [] };

  for (const term of allTerms) {
    if (!term) continue;
    const escaped = escapeRegex(term);
    const regex = new RegExp('(?:^|[^a-z0-9])' + escaped + '(?:[^a-z0-9]|$)', 'i');
    if (regex.test(normalized)) {
      found.push(term);
    }
  }

  return {
    blocked: found.length > 0,
    found,
  };
}

/**
 * Check multiple text fields. Returns first failure or success.
 * @param {Record<string, string>} fields - Map of field name -> value
 * @returns {{ blocked: boolean, found: string[], field?: string }}
 */
function checkFields(fields) {
  for (const [field, value] of Object.entries(fields)) {
    if (value == null || (typeof value === 'string' && !value.trim())) continue;
    const { blocked, found } = checkText(String(value));
    if (blocked) return { blocked: true, found, field };
  }
  return { blocked: false, found: [] };
}

/**
 * Get user-facing message when content is blocked (does not reveal which words).
 * @param {string} [customMessage] - Override default message
 */
function getBlockedMessage(customMessage) {
  return customMessage || DEFAULT_MESSAGE;
}

module.exports = {
  checkText,
  checkFields,
  getBlockedMessage,
  DEFAULT_MESSAGE,
};
