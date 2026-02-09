import React, { useState, useEffect, useRef } from 'react';
import { showNotification } from '../../utils/notifications';

const THEMES = [
  { value: 'classic', label: 'Classic' },
  { value: 'romantic', label: 'Romantic' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'vintage', label: 'Vintage' },
  { value: 'blush', label: 'Blush' },
];

const COLORS = [
  { value: 'rose', label: 'Rose' },
  { value: 'crimson', label: 'Crimson' },
  { value: 'blush', label: 'Blush' },
  { value: 'gold', label: 'Gold' },
  { value: 'lavender', label: 'Lavender' },
  { value: 'coral', label: 'Coral' },
];

const EMAIL_THEME_OPTIONS = [
  { value: 'classic_rose', label: 'Classic Rose' },
  { value: 'classic_crimson', label: 'Classic Crimson' },
  { value: 'classic_blush', label: 'Classic Blush' },
  { value: 'classic_gold', label: 'Classic Gold' },
  { value: 'classic_lavender', label: 'Classic Lavender' },
  { value: 'classic_coral', label: 'Classic Coral' },
  { value: 'romantic_rose', label: 'Romantic Rose' },
  { value: 'romantic_crimson', label: 'Romantic Crimson' },
  { value: 'romantic_blush', label: 'Romantic Blush' },
  { value: 'romantic_gold', label: 'Romantic Gold' },
  { value: 'romantic_lavender', label: 'Romantic Lavender' },
  { value: 'romantic_coral', label: 'Romantic Coral' },
  { value: 'minimal_rose', label: 'Minimal Rose' },
  { value: 'minimal_crimson', label: 'Minimal Crimson' },
  { value: 'minimal_blush', label: 'Minimal Blush' },
  { value: 'minimal_gold', label: 'Minimal Gold' },
  { value: 'minimal_lavender', label: 'Minimal Lavender' },
  { value: 'minimal_coral', label: 'Minimal Coral' },
  { value: 'vintage_rose', label: 'Vintage Rose' },
  { value: 'vintage_crimson', label: 'Vintage Crimson' },
  { value: 'vintage_blush', label: 'Vintage Blush' },
  { value: 'vintage_gold', label: 'Vintage Gold' },
  { value: 'vintage_lavender', label: 'Vintage Lavender' },
  { value: 'vintage_coral', label: 'Vintage Coral' },
  { value: 'blush_rose', label: 'Blush Rose' },
  { value: 'blush_crimson', label: 'Blush Crimson' },
  { value: 'blush_blush', label: 'Blush Pink' },
  { value: 'blush_gold', label: 'Blush Gold' },
  { value: 'blush_lavender', label: 'Blush Lavender' },
  { value: 'blush_coral', label: 'Blush Coral' },
];

function HeartIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function LinkIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function CopyIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function EditIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function TrashIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

function CheckIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ChartIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function MailIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

export default function ValentineUrlManager({ user }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [copiedSlug, setCopiedSlug] = useState(null);
  const [analyticsItem, setAnalyticsItem] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [credits, setCredits] = useState(null);
  const [emailCredits, setEmailCredits] = useState(0);
  const [showNoCreditsModal, setShowNoCreditsModal] = useState(false);
  const [showEmailCreditsModal, setShowEmailCreditsModal] = useState(false);
  const [creditRequestCredits, setCreditRequestCredits] = useState(5);
  const [creditRequestEmailCredits, setCreditRequestEmailCredits] = useState(0);
  const [creditRequestMessage, setCreditRequestMessage] = useState('');
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [creditRequestSuccessMessage, setCreditRequestSuccessMessage] = useState('');
  const [resendingId, setResendingId] = useState(null);
  const [formData, setFormData] = useState({
    recipientName: '',
    recipientEmail: '',
    emailSubject: '',
    emailBody: '',
    emailTheme: 'classic_rose',
    welcomeText: "You've got something special",
    mainMessage: '',
    buttonText: 'Open',
    buttonTextNo: 'Maybe later',
    replyPromptLabel: 'Write a message to the sender',
    replyMaxLength: 500,
    theme: 'romantic',
    themeColor: 'rose',
    decorations: [],
  });

  const lastReplyCheckRef = useRef(new Date().toISOString());

  useEffect(() => {
    fetchList();
    fetchCredits();
  }, []);

  useEffect(() => {
    const isBaseUser = (user?.role || 'base_user').toLowerCase() === 'base_user';
    if (!isBaseUser) return;
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) return;
    const poll = async () => {
      try {
        const res = await fetch(
          `/api/valentine/replies-notifications?since=${encodeURIComponent(lastReplyCheckRef.current)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        if (data.success && data.data?.hasNewReplies && data.data.newCount > 0) {
          lastReplyCheckRef.current = new Date().toISOString();
          const n = data.data.newCount;
          showNotification('New reply on your Valentine link', {
            body: n === 1 ? 'You have 1 new reply.' : `You have ${n} new replies.`,
            tag: 'valentine-reply',
          });
        }
      } catch (_) {}
    };
    const interval = setInterval(poll, 60000);
    poll();
    return () => clearInterval(interval);
  }, [user?.role]);

  async function fetchCredits() {
    try {
      const res = await fetch('/api/valentine/credits', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      if (data.success && data.data != null) {
        setCredits(data.data.credits ?? 0);
        setEmailCredits(data.data.emailCredits ?? 0);
      }
    } catch {
      setCredits(0);
      setEmailCredits(0);
    }
  }

  async function fetchList() {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/valentine', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      if (data.success) {
        setList(data.data?.valentineUrls || []);
      } else {
        setError(data.message || 'Failed to load');
      }
    } catch (err) {
      setError('Unable to connect. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function getFullUrl(slug) {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/valentine/${slug}`;
  }

  async function copyLink(slug) {
    const url = getFullUrl(slug);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 2000);
    } catch {
      setError('Could not copy. Please copy the URL manually.');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setSaving(true);
    try {
      const textsToCheck = [
        formData.recipientName,
        formData.emailSubject,
        formData.emailBody,
        formData.welcomeText,
        formData.mainMessage,
        formData.buttonText,
        formData.buttonTextNo ?? 'Maybe later',
        formData.replyPromptLabel ?? 'Write a message to the sender',
      ].filter(Boolean);
      const checkRes = await fetch('/api/moderation/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ texts: textsToCheck }),
      });
      const checkData = await checkRes.json();
      if (checkData.success && checkData.data?.blocked) {
        setError(checkData.data.message || 'Your message contains words that are not allowed. Please remove them to avoid your emails being marked as spam.');
        setSaving(false);
        return;
      }
      const url = editingId ? `/api/valentine/${editingId.id}` : '/api/valentine';
      const method = editingId ? 'PUT' : 'POST';
      const payload = {
        ...formData,
        buttonTextNo: formData.buttonTextNo ?? 'Maybe later',
        replyPromptLabel: formData.replyPromptLabel ?? 'Write a message to the sender',
        replyMaxLength: typeof formData.replyMaxLength === 'number' && formData.replyMaxLength >= 100 ? Math.min(2000, formData.replyMaxLength) : 500,
      };
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        await fetchList();
        await fetchCredits();
        setSuccessMessage('Link saved. Use "Resend email" on the link to send it to the recipient.');
        setTimeout(() => setSuccessMessage(''), 5000);
        resetForm();
      } else {
        if (data.error === 'CONTENT_BLOCKED') {
          setError(data.message || 'Your message contains words that are not allowed. Please remove them to avoid your emails being marked as spam.');
        } else if (data.error === 'INSUFFICIENT_CREDITS' || (res.status === 403 && data.message && data.message.includes('credits'))) {
          setCredits(0);
          setShowNoCreditsModal(true);
        } else {
          setError(data.message || 'Failed to save');
        }
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  function openCreateForm() {
    const c = credits != null ? credits : 1;
    if (c < 1) {
      setShowNoCreditsModal(true);
    } else {
      setShowForm(true);
    }
  }

  async function submitCreditRequest(e) {
    e.preventDefault();
    setRequestSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/valentine/credit-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          requestedCredits: Math.max(1, Math.min(100, Number(creditRequestCredits) || 5)),
          message: (creditRequestMessage || '').trim().slice(0, 500),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowNoCreditsModal(false);
        setCreditRequestMessage('');
        setCreditRequestCredits(5);
        setCreditRequestSuccessMessage('Credit request submitted. You will receive an invoice; after payment, credits will be added to your account.');
        setTimeout(() => setCreditRequestSuccessMessage(''), 8000);
      } else {
        setError(data.message || 'Failed to submit request');
      }
    } catch (err) {
      setError('Failed to submit request. Please try again.');
    } finally {
      setRequestSubmitting(false);
    }
  }

  async function handleDelete(item) {
    if (!confirm(`Delete this Valentine link for "${item.recipientName}"?`)) return;
    try {
      const res = await fetch(`/api/valentine/${item.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      if (data.success) {
        setList((prev) => prev.filter((x) => x.id !== item.id));
      } else {
        setError(data.message || 'Failed to delete');
      }
    } catch (err) {
      setError('Failed to delete');
    }
  }

  function resetForm() {
    setFormData({
      recipientName: '',
      recipientEmail: '',
      emailSubject: '',
      emailBody: '',
      emailTheme: 'classic_rose',
      welcomeText: "You've got something special",
      mainMessage: '',
      buttonText: 'Open',
      buttonTextNo: 'Maybe later',
      replyPromptLabel: 'Write a message to the sender',
      replyMaxLength: 500,
      theme: 'romantic',
      themeColor: 'rose',
      decorations: [],
    });
    setEditingId(null);
    setShowForm(false);
  }

  function handleEdit(item) {
    setFormData({
      recipientName: item.recipientName,
      recipientEmail: item.recipientEmail || '',
      emailSubject: item.emailSubject || '',
      emailBody: item.emailBody || '',
      emailTheme: item.emailTheme || 'classic_rose',
      welcomeText: item.welcomeText || "You've got something special",
      mainMessage: item.mainMessage || '',
      buttonText: item.buttonText || 'Open',
      buttonTextNo: item.buttonTextNo ?? 'Maybe later',
      replyPromptLabel: item.replyPromptLabel ?? 'Write a message to the sender',
      replyMaxLength: typeof item.replyMaxLength === 'number' ? item.replyMaxLength : 500,
      theme: item.theme || 'romantic',
      themeColor: item.themeColor || 'rose',
      decorations: Array.isArray(item.decorations) ? item.decorations : [],
    });
    setEditingId({ id: item.id });
    setShowForm(true);
  }

  async function openAnalytics(item) {
    setAnalyticsItem(item);
    setAnalyticsData(null);
    setAnalyticsLoading(true);
    try {
      const res = await fetch(`/api/valentine/analytics?id=${encodeURIComponent(item.id)}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      if (data.success && data.data?.analytics) {
        setAnalyticsData(data.data.analytics);
      } else {
        setAnalyticsData({ error: data.message || 'Failed to load analytics' });
      }
    } catch (err) {
      setAnalyticsData({ error: 'Unable to load analytics.' });
    } finally {
      setAnalyticsLoading(false);
    }
  }

  function closeAnalytics() {
    setAnalyticsItem(null);
    setAnalyticsData(null);
  }

  async function refreshAnalytics() {
    if (!analyticsItem) return;
    setAnalyticsLoading(true);
    try {
      const res = await fetch(`/api/valentine/analytics?id=${encodeURIComponent(analyticsItem.id)}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      if (data.success && data.data?.analytics) {
        setAnalyticsData(data.data.analytics);
      } else {
        setAnalyticsData({ error: data.message || 'Failed to load analytics' });
      }
    } catch (err) {
      setAnalyticsData({ error: 'Unable to load analytics.' });
    } finally {
      setAnalyticsLoading(false);
    }
  }

  const DECORATION_OPTIONS = [
    { value: 'flowers', label: 'Flowers' },
    { value: 'teddy', label: 'Teddy bear' },
    { value: 'chocolate', label: 'Chocolate' },
    { value: 'hearts', label: 'Hearts' },
  ];

  function toggleDecoration(value) {
    const list = formData.decorations || [];
    const next = list.includes(value) ? list.filter((d) => d !== value) : [...list, value];
    setFormData({ ...formData, decorations: next });
  }

  const showEmailOptions = formData.recipientEmail && formData.recipientEmail.trim().length > 0;

  const role = (user?.role || 'base_user').toLowerCase();
  const hasUnlimitedResend = role === 'developer' || role === 'superadmin';
  const isBaseUser = role === 'base_user';
  const FREE_RESENDS_PER_LINK = 3;
  function canResend(item) {
    if (!item.recipientEmail || !item.recipientEmail.trim()) return false;
    if (hasUnlimitedResend) return true;
    const used = typeof item.emailResendCount === 'number' ? item.emailResendCount : 0;
    return used < FREE_RESENDS_PER_LINK || (emailCredits != null && emailCredits >= 1);
  }

  async function handleResendEmail(item) {
    if (!item.recipientEmail || !item.recipientEmail.trim()) {
      setError('This link has no recipient email. Add one in Edit first.');
      return;
    }
    if (resendingId === item.id) return;
    if (!hasUnlimitedResend) {
      const used = typeof item.emailResendCount === 'number' ? item.emailResendCount : 0;
      if (used >= FREE_RESENDS_PER_LINK && (emailCredits == null || emailCredits < 1)) {
        setShowEmailCreditsModal(true);
        return;
      }
    }
    setResendingId(item.id);
    setError('');
    try {
      const res = await fetch(`/api/valentine/${item.id}/resend-email`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage('Email resent to recipient.');
        setTimeout(() => setSuccessMessage(''), 4000);
        await fetchList();
        await fetchCredits();
      } else {
        if (data.error === 'INSUFFICIENT_EMAIL_CREDITS') {
          setShowEmailCreditsModal(true);
        } else {
          setError(data.message || 'Failed to resend email');
        }
      }
    } catch (err) {
      setError('Failed to resend email. Please try again.');
    } finally {
      setResendingId(null);
    }
  }

  async function submitEmailCreditRequest(e) {
    e.preventDefault();
    const num = Math.max(1, Math.min(100, Number(creditRequestEmailCredits) || 10));
    setRequestSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/valentine/credit-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          requestedCredits: 0,
          requestedEmailCredits: num,
          message: (creditRequestMessage || '').trim().slice(0, 500),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowEmailCreditsModal(false);
        setCreditRequestMessage('');
        setCreditRequestEmailCredits(10);
        setCreditRequestSuccessMessage('Email credit request submitted. After payment, email credits will be added to your account.');
        setTimeout(() => setCreditRequestSuccessMessage(''), 8000);
      } else {
        setError(data.message || 'Failed to submit request');
      }
    } catch (err) {
      setError('Failed to submit request. Please try again.');
    } finally {
      setRequestSubmitting(false);
    }
  }

  return (
    <div className="valentine-manager">
      <header className="valentine-hero">
        <div className="valentine-hero-content">
          <div className="valentine-hero-badge">
            <HeartIcon size={16} />
            <span>Share something special</span>
          </div>
          <h2 className="valentine-hero-title">
            <span className="valentine-title-icon" aria-hidden><HeartIcon size={28} /></span>
            Valentine Links
          </h2>
          <p className="valentine-hero-desc">
            Create a unique, secure link with a custom message and theme. Only people with the link can see the page.
          </p>
          {credits != null && (
            <p className="valentine-hero-credits" aria-live="polite">
              Link credits: <strong>{credits}</strong> {credits === 1 ? 'link' : 'links'}
              {isBaseUser && emailCredits != null && (
                <> · Email resend credits: <strong>{emailCredits}</strong></>
              )}
            </p>
          )}
          {(user?.role === 'developer' || user?.role === 'superadmin') && (
            <p className="valentine-hero-dev-options">
              <a href="/dashboard#credit-requests" className="valentine-dev-link">Fulfill credit requests</a>
              {' · '}
              <a href="/dashboard#valentine-urls" className="valentine-dev-link">Valentine Links</a> (this page)
            </p>
          )}
          {!showForm && (
            <button
              type="button"
              className="valentine-btn-primary"
              onClick={openCreateForm}
              aria-label="Create new Valentine link"
            >
              <HeartIcon size={20} />
              Create New Link
            </button>
          )}
        </div>
      </header>

      {error && (
        <div className="valentine-alert" role="alert">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="valentine-success" role="status">
          {successMessage}
        </div>
      )}

      {creditRequestSuccessMessage && (
        <div className="valentine-success valentine-credit-request-success" role="status">
          {creditRequestSuccessMessage}
        </div>
      )}

      {showNoCreditsModal && (
        <div className="valentine-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="valentine-no-credits-title">
          <div className="valentine-modal">
            <h3 id="valentine-no-credits-title" className="valentine-modal-title">No credits left</h3>
            <p className="valentine-modal-p">
              You need more credits to create additional Valentine links. Request more credits and pay the invoice; after payment the developer will add credits to your account.
            </p>
            <p className="valentine-modal-p valentine-modal-pricing">
              <strong>10 link credits</strong> for <strong>$0.30 USD</strong> / <strong>Rs 30 PKR</strong>. You can request any number; the developer will send you an invoice. After paying, your credits will be added.
            </p>
            <form onSubmit={submitCreditRequest} className="valentine-credit-request-form">
              <div className="valentine-form-group">
                <label htmlFor="valentine-request-credits">Number of link credits to request</label>
                <input
                  id="valentine-request-credits"
                  type="number"
                  min={1}
                  max={100}
                  value={creditRequestCredits}
                  onChange={(e) => setCreditRequestCredits(Number(e.target.value) || 5)}
                  disabled={requestSubmitting}
                />
              </div>
              <div className="valentine-form-group">
                <label htmlFor="valentine-request-message">Message (optional)</label>
                <textarea
                  id="valentine-request-message"
                  value={creditRequestMessage}
                  onChange={(e) => setCreditRequestMessage(e.target.value)}
                  placeholder="e.g. I need 10 credits for multiple links"
                  rows={2}
                  maxLength={500}
                  disabled={requestSubmitting}
                />
              </div>
              <div className="valentine-modal-actions">
                <button
                  type="button"
                  className="valentine-btn-secondary"
                  onClick={() => { setShowNoCreditsModal(false); setCreditRequestMessage(''); setCreditRequestCredits(5); }}
                  disabled={requestSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="valentine-btn-primary"
                  disabled={requestSubmitting}
                >
                  {requestSubmitting ? 'Submitting…' : 'Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEmailCreditsModal && (
        <div className="valentine-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="valentine-email-credits-title">
          <div className="valentine-modal">
            <h3 id="valentine-email-credits-title" className="valentine-modal-title">Request email resend credits</h3>
            <p className="valentine-modal-p">
              You’ve used your 3 free resends for this link (or you’re out of email credits). To resend again, request more email credits below. Base users get 3 free resends per link; after that, each resend uses 1 email credit.
            </p>
            <p className="valentine-modal-p valentine-modal-pricing">
              <strong>10 email credits</strong> for <strong>$0.20 USD</strong> / <strong>Rs 20 PKR</strong>. Submit the request; after payment the developer will add credits to your account.
            </p>
            <form onSubmit={submitEmailCreditRequest} className="valentine-credit-request-form">
              <div className="valentine-form-group">
                <label htmlFor="valentine-request-email-credits">Number of email credits to request</label>
                <input
                  id="valentine-request-email-credits"
                  type="number"
                  min={1}
                  max={100}
                  value={creditRequestEmailCredits}
                  onChange={(e) => setCreditRequestEmailCredits(Number(e.target.value) || 10)}
                  disabled={requestSubmitting}
                />
              </div>
              <div className="valentine-form-group">
                <label htmlFor="valentine-request-message-email">Message (optional)</label>
                <textarea
                  id="valentine-request-message-email"
                  value={creditRequestMessage}
                  onChange={(e) => setCreditRequestMessage(e.target.value)}
                  placeholder="e.g. I need 20 email credits"
                  rows={2}
                  maxLength={500}
                  disabled={requestSubmitting}
                />
              </div>
              <div className="valentine-modal-actions">
                <button
                  type="button"
                  className="valentine-btn-secondary"
                  onClick={() => { setShowEmailCreditsModal(false); setCreditRequestMessage(''); setCreditRequestEmailCredits(10); }}
                  disabled={requestSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="valentine-btn-primary"
                  disabled={requestSubmitting}
                >
                  {requestSubmitting ? 'Submitting…' : 'Request email credits'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showForm && (
        <article className="valentine-form-card" aria-labelledby="valentine-form-title">
          <h3 id="valentine-form-title" className="valentine-form-title">
            {editingId ? 'Edit Valentine Link' : 'Create Valentine Link'}
          </h3>
          <form onSubmit={handleSubmit} className="valentine-form">
            <fieldset className="valentine-fieldset">
              <legend className="valentine-legend">Link & recipient</legend>
            <div className="valentine-form-group">
              <label htmlFor="valentine-recipient-name">Recipient name (for you; used in the URL slug)</label>
              <input
                id="valentine-recipient-name"
                type="text"
                value={formData.recipientName}
                onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                placeholder="e.g. Jane"
                required
                disabled={!!editingId}
                autoComplete="off"
              />
              {editingId && <span className="valentine-hint">Slug cannot be changed after creation.</span>}
            </div>
            <div className="valentine-form-group">
              <label htmlFor="valentine-recipient-email">Recipient email (optional)</label>
              <input
                id="valentine-recipient-email"
                type="email"
                value={formData.recipientEmail}
                onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
                placeholder="e.g. jane@example.com"
                disabled={saving}
                autoComplete="email"
              />
              <span className="valentine-hint">If provided, we&apos;ll send the link to this address. When set, you can customize the email below.</span>
            </div>
            </fieldset>
            {showEmailOptions && (
              <fieldset className="valentine-fieldset valentine-email-options">
                <legend className="valentine-legend">Email options</legend>
                <div className="valentine-form-group">
                  <label>Email subject</label>
                  <input
                    type="text"
                    value={formData.emailSubject}
                    onChange={(e) => setFormData({ ...formData, emailSubject: e.target.value })}
                    placeholder="e.g. You've got something special, Jane"
                    maxLength={200}
                    disabled={saving}
                  />
                </div>
                <div className="valentine-form-group">
                  <label>Email body</label>
                  <textarea
                    value={formData.emailBody}
                    onChange={(e) => setFormData({ ...formData, emailBody: e.target.value })}
                    placeholder="Optional message shown in the email before the link button. Leave blank for default text."
                    rows={3}
                    maxLength={2000}
                    disabled={saving}
                  />
                </div>
                <div className="valentine-form-group">
                  <label>Email theme</label>
                  <select
                    value={formData.emailTheme}
                    onChange={(e) => setFormData({ ...formData, emailTheme: e.target.value })}
                    disabled={saving}
                  >
                    {EMAIL_THEME_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <span className="valentine-hint">Visual style of the email (colors and layout).</span>
                </div>
              </fieldset>
            )}
            <fieldset className="valentine-fieldset">
              <legend className="valentine-legend">Page content & theme</legend>
            <div className="valentine-form-group">
              <label htmlFor="valentine-welcome">Welcome text</label>
              <input
                id="valentine-welcome"
                type="text"
                value={formData.welcomeText}
                onChange={(e) => setFormData({ ...formData, welcomeText: e.target.value })}
                placeholder="You've got something special"
                maxLength={200}
                autoComplete="off"
              />
            </div>
            <div className="valentine-form-group">
              <label>Main message (shown after they click the button)</label>
              <textarea
                value={formData.mainMessage}
                onChange={(e) => setFormData({ ...formData, mainMessage: e.target.value })}
                placeholder="Your heartfelt message..."
                rows={4}
                maxLength={2000}
              />
            </div>
            <div className="valentine-form-group">
              <label>Button text (main button)</label>
              <input
                type="text"
                value={formData.buttonText}
                onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                placeholder="Open"
                maxLength={50}
              />
            </div>
            <div className="valentine-form-group">
              <label>Second button text (disabled)</label>
              <input
                type="text"
                value={formData.buttonTextNo}
                onChange={(e) => setFormData({ ...formData, buttonTextNo: e.target.value })}
                placeholder="Maybe later"
                maxLength={50}
              />
              <span className="valentine-hint">Shown as a disabled button on the page. Fun &quot;no&quot; option.</span>
            </div>
            <div className="valentine-form-group">
              <label htmlFor="valentine-reply-prompt">Reply box label (after they click the main button)</label>
              <input
                id="valentine-reply-prompt"
                type="text"
                value={formData.replyPromptLabel}
                onChange={(e) => setFormData({ ...formData, replyPromptLabel: e.target.value })}
                placeholder="Write a message to the sender"
                maxLength={120}
              />
              <span className="valentine-hint">
                Label for the input where the recipient can send you a reply (max 5 replies per visit).
                {(user?.role === 'developer' || user?.role === 'superadmin') && (
                  <span className="valentine-hint-unlimited"> Links you create allow unlimited replies.</span>
                )}
              </span>
            </div>
            <div className="valentine-form-group">
              <label htmlFor="valentine-reply-max">Max reply length (characters)</label>
              <input
                id="valentine-reply-max"
                type="number"
                min={100}
                max={2000}
                value={formData.replyMaxLength}
                onChange={(e) => setFormData({ ...formData, replyMaxLength: Math.min(2000, Math.max(100, Number(e.target.value) || 500)) })}
              />
              <span className="valentine-hint">Between 100 and 2000 characters. Default 500.</span>
            </div>
            <div className="valentine-form-row">
              <div className="valentine-form-group">
                <label>Theme</label>
                <select
                  value={formData.theme}
                  onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                >
                  {THEMES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="valentine-form-group">
                <label>Color</label>
                <select
                  value={formData.themeColor}
                  onChange={(e) => setFormData({ ...formData, themeColor: e.target.value })}
                >
                  {COLORS.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="valentine-form-group">
              <label>Page decorations (optional)</label>
              <p className="valentine-hint">Show animated icons on the shared page. Select any combination.</p>
              <div className="valentine-decorations">
                {DECORATION_OPTIONS.map((opt) => (
                  <label key={opt.value} className="valentine-decoration-check">
                    <input
                      type="checkbox"
                      checked={(formData.decorations || []).includes(opt.value)}
                      onChange={() => toggleDecoration(opt.value)}
                      disabled={saving}
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
            </fieldset>
            <div className="valentine-form-actions">
              <button type="button" className="valentine-btn-secondary" onClick={resetForm} disabled={saving}>Cancel</button>
              <button type="submit" className="valentine-btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </form>
        </article>
      )}

      {loading ? (
        <div className="valentine-loading-wrap" aria-busy="true" aria-live="polite">
          <div className="valentine-loading-dots">
            <span /><span /><span />
          </div>
          <p className="valentine-loading-text">Loading your Valentine links…</p>
        </div>
      ) : (
        <div className="valentine-list-wrap">
          {list.length === 0 && !showForm ? (
            <div className="valentine-empty" role="status">
              <div className="valentine-empty-icon">
                <HeartIcon size={56} />
              </div>
              <h3 className="valentine-empty-title">No Valentine links yet</h3>
              <p className="valentine-empty-desc">Create one and share the link with someone special.</p>
              <button
                type="button"
                className="valentine-btn-primary valentine-empty-cta"
                onClick={openCreateForm}
              >
                <HeartIcon size={20} />
                Create your first link
              </button>
            </div>
          ) : list.length > 0 ? (
            <ul className="valentine-list" aria-label="Your Valentine links">
              {list.map((item) => (
                <li key={item.id} className="valentine-card">
                  <div className="valentine-card-accent" aria-hidden />
                  <div className="valentine-card-body">
                    <div className="valentine-card-top">
                      <span className="valentine-card-recipient">For: {item.recipientName}</span>
                      <span className="valentine-card-theme">{item.theme} / {item.themeColor}</span>
                      <div className="valentine-card-actions">
                        <button
                          type="button"
                          className={`valentine-icon-btn ${copiedSlug === item.slug ? 'valentine-copied' : ''}`}
                          onClick={() => copyLink(item.slug)}
                          title={copiedSlug === item.slug ? 'Copied' : 'Copy link'}
                          aria-label={copiedSlug === item.slug ? 'Link copied' : 'Copy link'}
                        >
                          {copiedSlug === item.slug ? <CheckIcon size={18} /> : <CopyIcon size={18} />}
                          {copiedSlug === item.slug ? ' Copied!' : ' Copy'}
                        </button>
                        <a href={getFullUrl(item.slug)} target="_blank" rel="noopener noreferrer" className="valentine-icon-btn" title="Open in new tab">
                          <LinkIcon size={18} />
                          Open
                        </a>
                        <button
                          type="button"
                          className="valentine-icon-btn"
                          onClick={() => handleResendEmail(item)}
                          title={!item.recipientEmail ? 'Add recipient email in Edit to resend' : 'Resend email to recipient (or request email credits if you’re out)'}
                          disabled={resendingId === item.id}
                        >
                          <MailIcon size={18} />
                          {resendingId === item.id ? 'Sending…' : 'Resend email'}
                        </button>
                        <button type="button" className="valentine-icon-btn" onClick={() => openAnalytics(item)} title="Analytics">
                          <ChartIcon size={18} />
                          Analytics
                        </button>
                        <button type="button" className="valentine-icon-btn" onClick={() => handleEdit(item)} title="Edit">
                          <EditIcon size={18} />
                          Edit
                        </button>
                        <button type="button" className="valentine-icon-btn valentine-delete" onClick={() => handleDelete(item)} title="Delete">
                          <TrashIcon size={18} />
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="valentine-card-url"
                      onClick={() => copyLink(item.slug)}
                      title="Click to copy URL"
                    >
                      <code>{getFullUrl(item.slug)}</code>
                    </button>
                    {item.welcomeText && <p className="valentine-card-preview">Welcome: &ldquo;{item.welcomeText}&rdquo;</p>}
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      )}

      {analyticsItem && (
        <div className="valentine-modal-backdrop" onClick={closeAnalytics} role="dialog" aria-modal="true" aria-labelledby="analytics-modal-title">
          <div className="valentine-modal" onClick={(e) => e.stopPropagation()}>
            <div className="valentine-modal-header">
              <h3 id="analytics-modal-title">Analytics — For: {analyticsItem.recipientName}</h3>
              <div className="valentine-modal-actions">
                <button type="button" className="valentine-modal-refresh" onClick={refreshAnalytics} disabled={analyticsLoading} aria-label="Refresh analytics" title="Refresh">
                  ↻
                </button>
                <button type="button" className="valentine-modal-close" onClick={closeAnalytics} aria-label="Close">×</button>
              </div>
            </div>
            <div className="valentine-modal-body">
              {analyticsLoading ? (
                <div className="valentine-analytics-loading">Loading analytics…</div>
              ) : analyticsData?.error ? (
                <div className="valentine-analytics-error">{analyticsData.error}</div>
              ) : analyticsData ? (
                <>
                  <div className="valentine-analytics-summary">
                    <div className="valentine-analytics-stat">
                      <span className="valentine-analytics-stat-value">{analyticsData.totalVisits ?? 0}</span>
                      <span className="valentine-analytics-stat-label">Link visits</span>
                    </div>
                    <div className="valentine-analytics-stat">
                      <span className="valentine-analytics-stat-value">{analyticsData.totalButtonClicks ?? 0}</span>
                      <span className="valentine-analytics-stat-label">“{analyticsData.buttonText || 'Open'}” clicks</span>
                    </div>
                  </div>
                  <p className="valentine-analytics-hint">Each visit is one page load. “{analyticsData.buttonText || 'Open'}” is how many times the main button was pressed in that visit.</p>
                  {analyticsData.byReferrer && analyticsData.byReferrer.length > 0 && (
                    <div className="valentine-analytics-section">
                      <h4>Visits by source</h4>
                      <div className="valentine-analytics-table-wrap">
                        <table className="valentine-analytics-table">
                          <thead>
                            <tr>
                              <th>Source</th>
                              <th>Visits</th>
                              <th>“{analyticsData.buttonText || 'Open'}” clicks</th>
                            </tr>
                          </thead>
                          <tbody>
                            {analyticsData.byReferrer.map((row, i) => (
                              <tr key={i}>
                                <td title={row.referrer}>{row.referrer.length > 48 ? row.referrer.slice(0, 48) + '…' : row.referrer}</td>
                                <td>{row.visits}</td>
                                <td>{row.buttonClicks}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  {analyticsData.replies && (
                    <div className="valentine-analytics-section valentine-analytics-replies-section">
                      <h4>
                        Replies from recipients
                        <span className="valentine-analytics-count">
                          {analyticsData.replies.length > 0
                            ? ` (${analyticsData.replies.length} message${analyticsData.replies.length === 1 ? '' : 's'}, latest first)`
                            : ''}
                        </span>
                      </h4>
                      {analyticsData.replies.length > 0 ? (
                        <ul className="valentine-analytics-replies-list">
                          {analyticsData.replies.map((r) => (
                            <li key={r.id} className="valentine-analytics-reply-item">
                              <p className="valentine-analytics-reply-message">{r.message}</p>
                              <span className="valentine-analytics-reply-meta">
                                {new Date(r.createdAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="valentine-analytics-empty">No replies yet. Recipients can send you a message after clicking the main button (up to 5 per visit).</p>
                      )}
                    </div>
                  )}
                  <div className="valentine-analytics-section valentine-analytics-all-visits-section">
                    <h4>
                      All visits
                      <span className="valentine-analytics-count">
                        {analyticsData.allVisits && analyticsData.allVisits.length > 0
                          ? ` (${analyticsData.allVisits.length} record${analyticsData.allVisits.length === 1 ? '' : 's'}, latest → oldest)`
                          : ' (latest → oldest)'}
                      </span>
                    </h4>
                    {analyticsData.allVisits && analyticsData.allVisits.length > 0 ? (
                      <div className="valentine-analytics-scroll-wrap">
                        <table className="valentine-analytics-table valentine-analytics-all-table">
                          <thead>
                            <tr>
                              <th>Date & time</th>
                              <th>Source</th>
                              <th>Device</th>
                              <th>Browser</th>
                              <th>Access / source info</th>
                              <th>“{analyticsData.buttonText || 'Open'}”</th>
                            </tr>
                          </thead>
                          <tbody>
                            {analyticsData.allVisits.map((v, i) => {
                              let accessSummary = '—';
                              let accessJson = '';
                              try {
                                if (v.accessPayload && typeof v.accessPayload === 'string') {
                                  const parsed = JSON.parse(v.accessPayload);
                                  const parts = [];
                                  if (parsed.origin) parts.push(parsed.origin);
                                  if (parsed.platform) parts.push(parsed.platform);
                                  if (parsed.timezone) parts.push(parsed.timezone);
                                  if (parsed.screen) parts.push(parsed.screen);
                                  accessSummary = parts.length ? parts.join(' · ') : '(see details)';
                                  accessJson = JSON.stringify(parsed, null, 2);
                                } else if (v.accessPayload && typeof v.accessPayload === 'object') {
                                  accessSummary = v.accessPayload.origin || v.accessPayload.platform || '(see details)';
                                  accessJson = JSON.stringify(v.accessPayload, null, 2);
                                }
                              } catch (_) {
                                accessSummary = v.accessPayload ? String(v.accessPayload).slice(0, 40) + '…' : '—';
                                accessJson = v.accessPayload || '';
                              }
                              return (
                                <tr key={i}>
                                  <td className="valentine-analytics-cell-date">{new Date(v.visitedAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}</td>
                                  <td className="valentine-analytics-cell-source" title={v.referrer}>{v.referrer.length > 36 ? v.referrer.slice(0, 36) + '…' : v.referrer}</td>
                                  <td className="valentine-analytics-cell-device">{v.deviceType || '—'}</td>
                                  <td className="valentine-analytics-cell-browser">{v.browser || '—'}</td>
                                  <td className="valentine-analytics-cell-access">
                                    {accessJson ? (
                                      <details className="valentine-access-details">
                                        <summary title={accessJson}>{accessSummary.length > 50 ? accessSummary.slice(0, 50) + '…' : accessSummary}</summary>
                                        <pre className="valentine-access-json">{accessJson}</pre>
                                      </details>
                                    ) : (
                                      <span>—</span>
                                    )}
                                  </td>
                                  <td className="valentine-analytics-cell-clicks">{v.buttonClicks}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="valentine-analytics-empty">No visit records yet. Share the link to see details here.</p>
                    )}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .valentine-manager {
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
        }

        /* Hero header */
        .valentine-hero {
          position: relative;
          padding: 1.75rem 1.5rem;
          background: linear-gradient(145deg, #fef7f8 0%, #fff5f7 50%, #fef2f2 100%);
          border: 1px solid rgba(225, 29, 72, 0.12);
          border-radius: 1.25rem;
          overflow: hidden;
        }
        .valentine-hero::before {
          content: '';
          position: absolute;
          top: -40%;
          right: -20%;
          width: 60%;
          height: 140%;
          background: radial-gradient(ellipse, rgba(225, 29, 72, 0.08) 0%, transparent 70%);
          pointer-events: none;
        }
        .valentine-hero-content {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          max-width: 52ch;
        }
        .valentine-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          align-self: flex-start;
          padding: 0.35rem 0.85rem;
          background: rgba(225, 29, 72, 0.12);
          color: #be123c;
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.03em;
          border-radius: 999px;
        }
        .valentine-hero-badge :global(svg) {
          flex-shrink: 0;
        }
        .valentine-hero-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.6rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.02em;
        }
        .valentine-title-icon {
          color: #e11d48;
          flex-shrink: 0;
        }
        .valentine-hero-desc {
          margin: 0;
          color: #64748b;
          font-size: 0.95rem;
          line-height: 1.6;
        }
        .valentine-hero-credits {
          margin: 0;
          font-size: 0.9rem;
          color: #64748b;
        }
        .valentine-hero-credits strong {
          color: #be123c;
        }
        .valentine-hero-dev-options {
          margin: 0.5rem 0 0 0;
          font-size: 0.85rem;
          color: #475569;
        }
        .valentine-dev-link {
          color: #2563eb;
          font-weight: 500;
          text-decoration: none;
        }
        .valentine-dev-link:hover {
          text-decoration: underline;
        }
        .valentine-hero-content .valentine-btn-primary {
          align-self: flex-start;
          margin-top: 0.25rem;
        }

        .valentine-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, #e11d48, #be123c);
          color: white;
          border: none;
          padding: 0.75rem 1.35rem;
          border-radius: 0.75rem;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          box-shadow: 0 4px 14px rgba(225, 29, 72, 0.35);
        }
        .valentine-btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(225, 29, 72, 0.4);
        }
        .valentine-btn-primary:focus-visible {
          outline: 2px solid #e11d48;
          outline-offset: 2px;
        }
        .valentine-btn-secondary {
          background: #f1f5f9;
          color: #475569;
          border: 1px solid #e2e8f0;
          padding: 0.6rem 1.1rem;
          border-radius: 0.75rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .valentine-btn-secondary:hover {
          background: #e2e8f0;
        }
        .valentine-btn-secondary:focus-visible {
          outline: 2px solid #64748b;
          outline-offset: 2px;
        }

        /* No-credits modal */
        .valentine-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }
        .valentine-modal {
          background: white;
          border-radius: 1rem;
          padding: 1.5rem;
          max-width: 420px;
          width: 100%;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          border: 1px solid #e2e8f0;
        }
        .valentine-modal-title {
          margin: 0 0 0.75rem 0;
          font-size: 1.25rem;
          font-weight: 700;
          color: #0f172a;
        }
        .valentine-modal-p {
          margin: 0 0 0.75rem 0;
          font-size: 0.9rem;
          color: #475569;
          line-height: 1.5;
        }
        .valentine-modal-pricing {
          margin-bottom: 1rem;
          font-size: 0.85rem;
          color: #64748b;
        }
        .valentine-credit-request-form .valentine-form-group {
          margin-bottom: 1rem;
        }
        .valentine-credit-request-form label {
          display: block;
          font-size: 0.85rem;
          font-weight: 500;
          color: #334155;
          margin-bottom: 0.35rem;
        }
        .valentine-credit-request-form input,
        .valentine-credit-request-form textarea {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          font-size: 0.9rem;
        }
        .valentine-modal-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 1.25rem;
          justify-content: flex-end;
        }
        .valentine-modal-success {
          margin: 0;
          color: #059669;
          font-weight: 500;
          font-size: 0.95rem;
        }

        .valentine-alert {
          padding: 0.9rem 1.15rem;
          background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
          border: 1px solid #fecaca;
          color: #991b1b;
          border-radius: 0.8rem;
          font-size: 0.9rem;
          line-height: 1.5;
          box-shadow: 0 2px 8px rgba(185, 28, 28, 0.06);
        }
        .valentine-success {
          padding: 0.9rem 1.15rem;
          background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
          border: 1px solid #a7f3d0;
          color: #065f46;
          border-radius: 0.8rem;
          font-size: 0.9rem;
          line-height: 1.5;
          box-shadow: 0 2px 8px rgba(5, 150, 105, 0.08);
        }

        /* Form card */
        .valentine-form-card {
          background: linear-gradient(180deg, #ffffff 0%, #fefafb 100%);
          border: 1px solid rgba(225, 29, 72, 0.12);
          border-radius: 1.3rem;
          padding: 1.75rem;
          box-shadow: 0 4px 24px rgba(225, 29, 72, 0.06), 0 2px 8px rgba(15, 23, 42, 0.04);
        }
        .valentine-form-title {
          margin: 0 0 1.25rem 0;
          font-size: 1.2rem;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.01em;
        }
        .valentine-form {
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .valentine-fieldset {
          border: none;
          margin: 0 0 1.5rem 0;
          padding: 0;
        }
        .valentine-legend {
          font-size: 0.9rem;
          font-weight: 600;
          color: #475569;
          margin-bottom: 0.75rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #e2e8f0;
          width: 100%;
        }
        .valentine-form-group {
          margin-bottom: 1rem;
        }
        .valentine-form-group:last-child {
          margin-bottom: 0;
        }
        .valentine-form-group label {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          color: #334155;
          margin-bottom: 0.4rem;
        }
        .valentine-form-group input,
        .valentine-form-group textarea,
        .valentine-form-group select {
          width: 100%;
          min-width: 0;
          max-width: 100%;
          box-sizing: border-box;
          padding: 0.65rem 0.85rem;
          border: 1px solid #cbd5e1;
          border-radius: 0.6rem;
          font-size: 0.95rem;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .valentine-form-group input:focus,
        .valentine-form-group textarea:focus,
        .valentine-form-group select:focus {
          outline: none;
          border-color: #e11d48;
          box-shadow: 0 0 0 3px rgba(225, 29, 72, 0.12);
        }
        .valentine-form-group input:disabled {
          background: #f8fafc;
          color: #64748b;
          cursor: not-allowed;
        }
        .valentine-hint {
          display: block;
          font-size: 0.8rem;
          color: #64748b;
          margin-top: 0.3rem;
          line-height: 1.45;
        }
        .valentine-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .valentine-email-options {
          padding: 1.25rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 0.85rem;
        }
        .valentine-email-options .valentine-legend {
          margin-bottom: 1rem;
        }
        .valentine-decorations {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem 1.25rem;
          margin-top: 0.5rem;
        }
        .valentine-decoration-check {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          color: #334155;
          cursor: pointer;
          padding: 0.4rem 0;
        }
        .valentine-decoration-check input {
          width: 1.1rem;
          height: 1.1rem;
          accent-color: #e11d48;
        }
        .valentine-form-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid #e2e8f0;
        }
        .valentine-form-actions button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        /* Loading state */
        .valentine-loading-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 2.5rem;
        }
        .valentine-loading-dots {
          display: flex;
          gap: 0.5rem;
        }
        .valentine-loading-dots span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #e11d48;
          animation: valentine-dot 1.2s ease-in-out infinite;
        }
        .valentine-loading-dots span:nth-child(2) { animation-delay: 0.2s; }
        .valentine-loading-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes valentine-dot {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.6; }
          40% { transform: scale(1.2); opacity: 1; }
        }
        .valentine-loading-text {
          margin: 0;
          color: #64748b;
          font-size: 0.95rem;
        }

        /* Empty state */
        .valentine-empty {
          text-align: center;
          padding: 2.85rem 1.6rem;
          background: linear-gradient(180deg, #fef7f8 0%, #fff5f7 50%, #fff 100%);
          border: 1px dashed rgba(225, 29, 72, 0.28);
          border-radius: 1.3rem;
          color: #64748b;
          box-shadow: 0 2px 16px rgba(225, 29, 72, 0.04);
        }
        .valentine-empty-icon {
          margin-bottom: 1.1rem;
          color: #e11d48;
          opacity: 0.9;
          filter: drop-shadow(0 2px 8px rgba(225, 29, 72, 0.2));
        }
        .valentine-empty-title {
          margin: 0 0 0.5rem 0;
          font-size: 1.18rem;
          font-weight: 700;
          color: #1e0a12;
          letter-spacing: -0.02em;
        }
        .valentine-empty-desc {
          margin: 0 0 1.35rem 0;
          font-size: 0.95rem;
          line-height: 1.55;
          max-width: 36ch;
          margin-left: auto;
          margin-right: auto;
        }
        .valentine-empty-cta {
          margin: 0 auto;
        }

        /* Link list & cards */
        .valentine-list-wrap {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .valentine-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .valentine-card {
          position: relative;
          background: linear-gradient(180deg, #ffffff 0%, #fefafb 100%);
          border: 1px solid rgba(225, 29, 72, 0.14);
          border-radius: 1.15rem;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(225, 29, 72, 0.06), 0 1px 3px rgba(15, 23, 42, 0.04);
          transition: box-shadow 0.25s ease, border-color 0.25s ease, transform 0.2s ease;
        }
        .valentine-card:hover {
          box-shadow: 0 8px 24px rgba(225, 29, 72, 0.1), 0 2px 8px rgba(15, 23, 42, 0.06);
          border-color: rgba(225, 29, 72, 0.28);
        }
        .valentine-card-accent {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #be123c 0%, #e11d48 50%, #f43f5e 100%);
          box-shadow: 0 1px 8px rgba(225, 29, 72, 0.25);
        }
        .valentine-card-body {
          padding: 1.35rem 1.35rem 1.35rem;
        }
        .valentine-card-top {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.85rem;
        }
        .valentine-card-recipient {
          font-weight: 600;
          color: #1e0a12;
          font-size: 1.02rem;
          letter-spacing: -0.01em;
        }
        .valentine-card-theme {
          font-size: 0.75rem;
          color: #9d174d;
          background: rgba(225, 29, 72, 0.1);
          padding: 0.35rem 0.65rem;
          border-radius: 0.5rem;
          font-weight: 600;
          letter-spacing: 0.02em;
          text-transform: capitalize;
        }
        .valentine-card-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-left: auto;
        }
        .valentine-icon-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.5rem 0.8rem;
          font-size: 0.85rem;
          background: #fff;
          border: 1px solid rgba(225, 29, 72, 0.15);
          border-radius: 0.55rem;
          color: #64748b;
          text-decoration: none;
          cursor: pointer;
          transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .valentine-icon-btn:hover {
          background: #fef7f8;
          color: #be123c;
          border-color: rgba(225, 29, 72, 0.25);
          box-shadow: 0 2px 8px rgba(225, 29, 72, 0.08);
        }
        .valentine-icon-btn:focus-visible {
          outline: 2px solid #e11d48;
          outline-offset: 2px;
        }
        .valentine-icon-btn.valentine-copied {
          background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
          color: #047857;
          border-color: #a7f3d0;
        }
        .valentine-icon-btn.valentine-delete:hover {
          background: #fef2f2;
          color: #b91c1c;
          border-color: #fecaca;
          box-shadow: 0 2px 8px rgba(185, 28, 28, 0.1);
        }
        .valentine-icon-btn.valentine-resend-disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .valentine-card-url {
          display: block;
          width: 100%;
          margin: 0;
          padding: 0.75rem 0.9rem;
          background: linear-gradient(135deg, #fef7f8 0%, #fdf2f4 100%);
          border: 1px solid rgba(225, 29, 72, 0.18);
          border-radius: 0.6rem;
          cursor: pointer;
          text-align: left;
          transition: background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .valentine-card-url:hover {
          background: linear-gradient(135deg, #fef2f2 0%, #fce7f3 100%);
          border-color: rgba(225, 29, 72, 0.3);
          box-shadow: 0 2px 12px rgba(225, 29, 72, 0.08);
        }
        .valentine-card-url code {
          font-size: 0.82rem;
          color: #831843;
          word-break: break-all;
          font-family: ui-monospace, 'SF Mono', monospace;
          letter-spacing: 0.01em;
        }
        .valentine-card-preview {
          margin: 0.65rem 0 0 0;
          font-size: 0.9rem;
          color: #64748b;
          line-height: 1.55;
          font-style: italic;
        }

        /* Analytics modal */
        .valentine-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(30, 10, 18, 0.55);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1.25rem;
          animation: valentine-fade-in 0.22s ease;
        }
        @keyframes valentine-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .valentine-modal {
          background: linear-gradient(180deg, #ffffff 0%, #fefafb 100%);
          border: 1px solid rgba(225, 29, 72, 0.12);
          border-radius: 1.4rem;
          box-shadow: 0 28px 64px rgba(30, 10, 18, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.5) inset;
          max-width: 54rem;
          width: 100%;
          max-height: 90vh;
          min-height: 20rem;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .valentine-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.35rem 1.5rem;
          background: linear-gradient(135deg, #fef7f8 0%, #fff5f7 100%);
          border-bottom: 1px solid rgba(225, 29, 72, 0.12);
        }
        .valentine-modal-header h3 {
          margin: 0;
          font-size: 1.12rem;
          font-weight: 700;
          color: #1e0a12;
          letter-spacing: -0.02em;
        }
        .valentine-modal-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .valentine-modal-refresh {
          width: 2.25rem;
          height: 2.25rem;
          border: 1px solid rgba(225, 29, 72, 0.2);
          background: #fff;
          border-radius: 0.6rem;
          font-size: 1.15rem;
          line-height: 1;
          color: #9d174d;
          cursor: pointer;
          transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
        }
        .valentine-modal-refresh:hover:not(:disabled) {
          background: #fef7f8;
          border-color: rgba(225, 29, 72, 0.35);
          color: #be123c;
        }
        .valentine-modal-refresh:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .valentine-modal-close {
          width: 2.25rem;
          height: 2.25rem;
          border: 1px solid rgba(225, 29, 72, 0.2);
          background: #fff;
          border-radius: 0.6rem;
          font-size: 1.3rem;
          line-height: 1;
          color: #64748b;
          cursor: pointer;
          transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
        }
        .valentine-modal-close:hover {
          background: #fef2f2;
          border-color: rgba(225, 29, 72, 0.3);
          color: #be123c;
        }
        .valentine-modal-body {
          padding: 1.6rem;
          overflow-y: auto;
          overflow-x: auto;
          background: #fff;
          flex: 1 1 auto;
          min-height: 0;
          -webkit-overflow-scrolling: touch;
        }
        .valentine-modal-body::-webkit-scrollbar {
          width: 12px;
          height: 12px;
        }
        .valentine-modal-body::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 12px;
          margin: 4px;
        }
        .valentine-modal-body::-webkit-scrollbar-thumb {
          background: rgba(225, 29, 72, 0.35);
          border-radius: 12px;
          border: 3px solid #f1f5f9;
        }
        .valentine-modal-body::-webkit-scrollbar-thumb:hover {
          background: rgba(225, 29, 72, 0.5);
        }
        .valentine-modal-body::-webkit-scrollbar-corner {
          background: #f1f5f9;
          border-radius: 0 0 0.5rem 0;
        }
        .valentine-analytics-loading {
          text-align: center;
          padding: 2.25rem;
          color: #9d174d;
          font-size: 0.95rem;
          font-weight: 500;
        }
        .valentine-analytics-error {
          text-align: center;
          padding: 2rem;
          color: #b91c1c;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 0.75rem;
          font-size: 0.9rem;
        }
        .valentine-analytics-summary {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1.15rem;
        }
        .valentine-analytics-stat {
          padding: 1.2rem 1rem;
          border-radius: 0.85rem;
          text-align: center;
          border: 1px solid transparent;
          transition: box-shadow 0.2s ease;
        }
        .valentine-analytics-stat:first-child {
          background: linear-gradient(135deg, #fef7f8 0%, #fce7f3 100%);
          border-color: rgba(225, 29, 72, 0.15);
          box-shadow: 0 2px 12px rgba(225, 29, 72, 0.08);
        }
        .valentine-analytics-stat:last-child {
          background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
          border-color: rgba(5, 150, 105, 0.2);
          box-shadow: 0 2px 12px rgba(5, 150, 105, 0.08);
        }
        .valentine-analytics-stat-value {
          display: block;
          font-size: 1.65rem;
          font-weight: 800;
          letter-spacing: -0.03em;
        }
        .valentine-analytics-stat:first-child .valentine-analytics-stat-value {
          color: #9d174d;
        }
        .valentine-analytics-stat:last-child .valentine-analytics-stat-value {
          color: #047857;
        }
        .valentine-analytics-stat-label {
          display: block;
          font-size: 0.8rem;
          margin-top: 0.25rem;
          font-weight: 500;
        }
        .valentine-analytics-stat:first-child .valentine-analytics-stat-label {
          color: #831843;
        }
        .valentine-analytics-stat:last-child .valentine-analytics-stat-label {
          color: #065f46;
        }
        .valentine-analytics-hint {
          margin: 0 0 1.35rem 0;
          font-size: 0.84rem;
          color: #64748b;
          line-height: 1.55;
          padding: 0.65rem 0.85rem;
          background: #f8fafc;
          border-radius: 0.6rem;
          border-left: 3px solid rgba(225, 29, 72, 0.35);
        }
        .valentine-analytics-section {
          margin-bottom: 1.5rem;
        }
        .valentine-analytics-section:last-child {
          margin-bottom: 0;
        }
        .valentine-analytics-section h4 {
          margin: 0 0 0.65rem 0;
          font-size: 1rem;
          font-weight: 700;
          color: #1e0a12;
          letter-spacing: -0.01em;
        }
        .valentine-analytics-replies-list {
          list-style: none;
          margin: 0;
          padding: 0;
          border: 1px solid rgba(225, 29, 72, 0.15);
          border-radius: 0.75rem;
          overflow: visible;
          max-height: none;
        }
        .valentine-analytics-reply-item {
          padding: 0.85rem 1rem;
          border-bottom: 1px solid rgba(225, 29, 72, 0.08);
          background: #fff;
        }
        .valentine-analytics-reply-item:last-child {
          border-bottom: none;
        }
        .valentine-analytics-reply-message {
          margin: 0 0 0.35rem 0;
          font-size: 0.95rem;
          line-height: 1.5;
          color: #334155;
          white-space: pre-wrap;
          word-break: break-word;
        }
        .valentine-analytics-reply-meta {
          font-size: 0.8rem;
          color: #64748b;
        }
        .valentine-analytics-count {
          font-weight: 500;
          color: #64748b;
          font-size: 0.85em;
        }
        .valentine-analytics-all-visits-section {
          flex: none;
          min-height: 0;
        }
        .valentine-analytics-all-visits-section h4 {
          flex-shrink: 0;
        }
        .valentine-analytics-scroll-wrap {
          overflow-x: auto;
          overflow-y: visible;
          max-height: none;
          border: 1px solid rgba(225, 29, 72, 0.15);
          border-radius: 0.75rem;
          box-shadow: 0 2px 12px rgba(225, 29, 72, 0.06);
          margin-top: 0.5rem;
        }
        .valentine-analytics-scroll-wrap::-webkit-scrollbar {
          height: 10px;
        }
        .valentine-analytics-scroll-wrap::-webkit-scrollbar-track {
          background: #f8fafc;
          border-radius: 10px;
        }
        .valentine-analytics-scroll-wrap::-webkit-scrollbar-thumb {
          background: rgba(225, 29, 72, 0.28);
          border-radius: 10px;
        }
        .valentine-analytics-scroll-wrap::-webkit-scrollbar-thumb:hover {
          background: rgba(225, 29, 72, 0.4);
        }
        .valentine-analytics-all-table thead {
          position: sticky;
          top: 0;
          z-index: 1;
          background: linear-gradient(180deg, #fef7f8 0%, #fdf2f4 100%);
          box-shadow: 0 2px 4px rgba(225, 29, 72, 0.06);
        }
        .valentine-analytics-all-table th {
          white-space: nowrap;
        }
        .valentine-analytics-cell-date {
          white-space: nowrap;
          font-size: 0.82rem;
          color: #475569;
        }
        .valentine-analytics-cell-source {
          max-width: 12rem;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .valentine-analytics-cell-device,
        .valentine-analytics-cell-browser {
          font-weight: 500;
          color: #334155;
        }
        .valentine-analytics-cell-clicks {
          font-weight: 600;
          color: #9d174d;
          text-align: center;
        }
        .valentine-analytics-cell-access {
          max-width: 14rem;
          vertical-align: top;
        }
        .valentine-access-details {
          font-size: 0.82rem;
          cursor: pointer;
        }
        .valentine-access-details summary {
          list-style: none;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #475569;
          padding: 0.2rem 0;
        }
        .valentine-access-details summary::-webkit-details-marker {
          display: none;
        }
        .valentine-access-details summary::before {
          content: '▸ ';
          color: #9d174d;
          font-size: 0.7rem;
        }
        .valentine-access-details[open] summary::before {
          content: '▾ ';
        }
        .valentine-access-json {
          margin: 0.5rem 0 0 0;
          padding: 0.6rem;
          background: #f8fafc;
          border: 1px solid rgba(225, 29, 72, 0.12);
          border-radius: 0.4rem;
          font-size: 0.75rem;
          font-family: ui-monospace, monospace;
          color: #334155;
          white-space: pre-wrap;
          word-break: break-all;
          max-height: 12rem;
          overflow-y: auto;
        }
        .valentine-analytics-table-wrap {
          overflow-x: auto;
          border: 1px solid rgba(225, 29, 72, 0.15);
          border-radius: 0.65rem;
          box-shadow: 0 2px 8px rgba(225, 29, 72, 0.05);
        }
        .valentine-analytics-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.88rem;
        }
        .valentine-analytics-table th,
        .valentine-analytics-table td {
          padding: 0.6rem 0.85rem;
          text-align: left;
          border-bottom: 1px solid rgba(225, 29, 72, 0.08);
        }
        .valentine-analytics-table th {
          background: linear-gradient(180deg, #fef7f8 0%, #fdf2f4 100%);
          font-weight: 600;
          color: #831843;
          font-size: 0.82rem;
          letter-spacing: 0.02em;
        }
        .valentine-analytics-table tbody tr:hover {
          background: #fef7f8;
        }
        .valentine-analytics-table td {
          color: #334155;
        }
        .valentine-analytics-visits {
          margin: 0;
          padding: 0;
          list-style: none;
          border: 1px solid rgba(225, 29, 72, 0.12);
          border-radius: 0.65rem;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(225, 29, 72, 0.04);
        }
        .valentine-analytics-visits li {
          display: grid;
          grid-template-columns: 1fr auto auto;
          gap: 0.85rem;
          padding: 0.65rem 0.9rem;
          border-bottom: 1px solid rgba(225, 29, 72, 0.06);
          font-size: 0.85rem;
          align-items: center;
          background: #fff;
          transition: background 0.2s ease;
        }
        .valentine-analytics-visits li:nth-child(even) {
          background: #fefafb;
        }
        .valentine-analytics-visits li:hover {
          background: #fef7f8;
        }
        .valentine-analytics-visits li:last-child {
          border-bottom: none;
        }
        .valentine-analytics-visit-date {
          color: #64748b;
          font-size: 0.82rem;
        }
        .valentine-analytics-visit-source {
          color: #475569;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .valentine-analytics-visit-clicks {
          color: #9d174d;
          font-weight: 600;
          font-size: 0.84rem;
        }
        .valentine-analytics-empty {
          margin: 0;
          font-size: 0.9rem;
          color: #64748b;
          text-align: center;
          padding: 1.25rem;
          background: #fef7f8;
          border: 1px dashed rgba(225, 29, 72, 0.2);
          border-radius: 0.75rem;
        }

        @media (max-width: 768px) {
          .valentine-modal {
            max-width: 95vw;
            max-height: 88vh;
          }
        }

        @media (max-width: 640px) {
          .valentine-form-card {
            padding: 1.25rem 1rem;
            min-width: 0;
          }
          .valentine-form-group input,
          .valentine-form-group textarea,
          .valentine-form-group select {
            padding: 0.75rem 0.85rem;
            font-size: 16px;
          }
          .valentine-credit-request-form input,
          .valentine-credit-request-form textarea {
            padding: 0.75rem 0.85rem;
            font-size: 16px;
            min-width: 0;
            box-sizing: border-box;
          }
          .valentine-email-options {
            padding: 1rem;
          }
          .valentine-form-row {
            grid-template-columns: 1fr;
          }
          .valentine-card-actions {
            margin-left: 0;
          }
          .valentine-hero {
            padding: 1.25rem 1.25rem;
          }
          .valentine-hero-title {
            font-size: 1.4rem;
          }
          .valentine-modal {
            max-width: 98vw;
            max-height: 90vh;
            border-radius: 1.2rem;
          }
          .valentine-modal-body {
            padding: 1.2rem;
          }
          .valentine-analytics-summary {
            grid-template-columns: 1fr;
          }
          .valentine-analytics-all-table {
            font-size: 0.82rem;
          }
          .valentine-analytics-all-table th,
          .valentine-analytics-all-table td {
            padding: 0.5rem 0.6rem;
          }
          .valentine-analytics-cell-source {
            max-width: 8rem;
          }
        }
        @media (max-width: 380px) {
          .valentine-form-card {
            padding: 1rem 0.75rem;
          }
          .valentine-form-group input,
          .valentine-form-group textarea,
          .valentine-form-group select {
            padding: 0.65rem 0.75rem;
          }
        }
      `}</style>
    </div>
  );
}
