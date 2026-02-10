import { useState, useEffect, useRef, useCallback } from 'react';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  showNotification,
} from '../../utils/notifications';
import styles from '../../styles/ChatNow.module.css';

const CHAT_NOTIFICATIONS_KEY = 'chatNotificationsEnabled';
const POLL_INTERVAL_VISIBLE_MS = 5000;
const POLL_INTERVAL_HIDDEN_MS = 15000;
const CONVERSATIONS_POLL_VISIBLE_MS = 5000;
const CONVERSATIONS_POLL_HIDDEN_MS = 20000;

function getAuthHeaders() {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function getNotificationsEnabled() {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(CHAT_NOTIFICATIONS_KEY) === 'true';
  } catch {
    return false;
  }
}

function setNotificationsEnabled(value) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CHAT_NOTIFICATIONS_KEY, value ? 'true' : 'false');
  } catch {}
}

export default function ChatNow({ user, onUnreadChange }) {
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [input, setInput] = useState('');
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [notifPermission, setNotifPermission] = useState('unsupported');
  const notifEnabledRef = useRef(false);
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);
  const convPollRef = useRef(null);
  const lastMessageIdsRef = useRef(new Set());
  const lastConvMessageAtRef = useRef({});
  const [refreshing, setRefreshing] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/chat/conversations', {
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to load conversations');
      }
      const data = await res.json();
      if (data.success && data.data) {
        const list = data.data.conversations || [];
        setConversations(list);
        list.forEach((c) => {
          if (c.lastMessageAt) lastConvMessageAtRef.current[c.id] = c.lastMessageAt;
        });
        return data.data.totalUnread ?? 0;
      }
      return 0;
    } catch (e) {
      setError(e.message || 'Failed to load conversations');
      return 0;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async (withId) => {
    if (!withId) return;
    setError('');
    try {
      const res = await fetch(`/api/chat/messages?with=${encodeURIComponent(withId)}`, {
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to load messages');
      }
      const data = await res.json();
      if (data.success && data.data) {
        setMessages(data.data.messages || []);
        setPartner(data.data.partner || null);
        const ids = (data.data.messages || []).map((m) => m.id);
        lastMessageIdsRef.current = new Set(ids);
      }
    } catch (e) {
      setError(e.message || 'Failed to load messages');
    }
  }, []);

  const markRead = useCallback(async (userId) => {
    try {
      await fetch('/api/chat/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        credentials: 'include',
        body: JSON.stringify({ userId }),
      });
      onUnreadChange?.();
      await fetchConversations();
    } catch {}
  }, [fetchConversations, onUnreadChange]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Sync notification preference and permission from localStorage/browser after mount (client-only)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = getNotificationsEnabled();
    setNotifEnabled(saved);
    notifEnabledRef.current = saved;
    setNotifPermission(isNotificationSupported() ? getNotificationPermission() : 'unsupported');
  }, []);

  // Keep ref in sync so polling always sees current preference
  useEffect(() => {
    notifEnabledRef.current = notifEnabled;
  }, [notifEnabled]);

  useEffect(() => {
    if (!selectedId) return;
    markRead(selectedId);
    fetchMessages(selectedId);
  }, [selectedId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Poll for new messages in selected conversation; show push if new from partner (use ref for preference)
  useEffect(() => {
    if (!selectedId || !partner) return;

    const poll = async () => {
      const res = await fetch(`/api/chat/messages?with=${encodeURIComponent(selectedId)}`, {
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      if (!res.ok) return;
      const data = await res.json();
      if (!data.success || !data.data?.messages) return;

      const list = data.data.messages;
      const prevIds = lastMessageIdsRef.current;
      const newFromPartner = list.filter(
        (m) => !m.sentByMe && !prevIds.has(m.id)
      );

      lastMessageIdsRef.current = new Set(list.map((m) => m.id));
      setMessages(list);
      onUnreadChange?.();

      if (newFromPartner.length > 0) {
        const enabled = notifEnabledRef.current;
        const perm = typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : '';
        const canNotify =
          enabled &&
          typeof window !== 'undefined' &&
          isNotificationSupported() &&
          perm === 'granted';

        if (canNotify) {
          const last = newFromPartner[newFromPartner.length - 1];
          const body =
            last.content.length > 80 ? last.content.slice(0, 77) + '...' : last.content;
          showNotification(`Message from ${partner.name}`, {
            body,
            tag: `chat-${selectedId}-${last.id}`,
          });
        }
      }
    };

    const isVisible = typeof document !== 'undefined' && !document.hidden;
    const intervalMs = isVisible ? POLL_INTERVAL_VISIBLE_MS : POLL_INTERVAL_HIDDEN_MS;
    pollRef.current = setInterval(poll, intervalMs);

    const onVisibility = () => {
      if (pollRef.current) clearInterval(pollRef.current);
      const visible = !document.hidden;
      pollRef.current = setInterval(poll, visible ? POLL_INTERVAL_VISIBLE_MS : POLL_INTERVAL_HIDDEN_MS);
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [selectedId, partner, onUnreadChange]);

  // Poll conversations list (visibility-aware: slower when tab hidden to reduce server load)
  useEffect(() => {
    const pollConvs = async () => {
      try {
        const res = await fetch('/api/chat/conversations', {
          headers: getAuthHeaders(),
          credentials: 'include',
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!data.success || !data.data?.conversations) return;

        const list = data.data.conversations;
        const prev = lastConvMessageAtRef.current;

        for (const c of list) {
          if (!c.lastMessageAt) continue;
          const prevAt = prev[c.id] ? new Date(prev[c.id]).getTime() : 0;
          const currAt = new Date(c.lastMessageAt).getTime();
          const isNewFromThem = !c.lastSentByMe && currAt > prevAt;
          if (prevAt > 0 && isNewFromThem) {
            const enabled = notifEnabledRef.current;
            const perm = typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : '';
            const canNotify =
              enabled &&
              typeof window !== 'undefined' &&
              'Notification' in window &&
              perm === 'granted';

            if (canNotify) {
              try {
                const body = c.lastMessage && c.lastMessage.length > 60 ? c.lastMessage.slice(0, 57) + '...' : (c.lastMessage || 'New message');
                showNotification(`Message from ${c.name}`, { body, tag: `chat-conv-${c.id}-${currAt}` });
              } catch (err) {
                console.warn('Chat notification failed:', err);
              }
            }
          }
          prev[c.id] = c.lastMessageAt;
        }
        lastConvMessageAtRef.current = { ...prev };
        setConversations(list);
        onUnreadChange?.();
      } catch {
        // ignore
      }
    };

    const getConvInterval = () => (typeof document !== 'undefined' && !document.hidden ? CONVERSATIONS_POLL_VISIBLE_MS : CONVERSATIONS_POLL_HIDDEN_MS);
    pollConvs();
    convPollRef.current = setInterval(pollConvs, getConvInterval());
    const onVisibility = () => {
      if (convPollRef.current) clearInterval(convPollRef.current);
      convPollRef.current = setInterval(pollConvs, getConvInterval());
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      if (convPollRef.current) clearInterval(convPollRef.current);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [onUnreadChange]);

  const handleSend = async (e) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || !selectedId || sending) return;

    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        credentials: 'include',
        body: JSON.stringify({ recipientId: selectedId, content: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send');

      if (data.success && data.data?.message) {
        setMessages((prev) => [...prev, data.data.message]);
        setInput('');
        onUnreadChange?.();
        const conv = conversations.find((c) => c.id === selectedId);
        if (conv) {
          setConversations((prev) =>
            prev.map((c) =>
              c.id === selectedId
                ? {
                    ...c,
                    lastMessage: text,
                    lastMessageAt: data.data.message.createdAt,
                    lastSentByMe: true,
                  }
                : c
            )
          );
        }
      }
    } catch (e) {
      setError(e.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleNotifToggle = async () => {
    if (typeof window === 'undefined' || !isNotificationSupported()) return;

    if (notifEnabled) {
      setNotifEnabled(false);
      notifEnabledRef.current = false;
      setNotificationsEnabled(false);
      return;
    }

    try {
      const perm = await requestNotificationPermission();
      setNotifPermission(perm);
      if (perm === 'granted') {
        setNotifEnabled(true);
        notifEnabledRef.current = true;
        setNotificationsEnabled(true);
        showNotification('Chat notifications on', {
          body: 'You’ll get a notification when you receive a new message (with this tab in the background).',
          tag: 'chat-notif-test',
        });
      } else {
        setNotifEnabled(false);
        notifEnabledRef.current = false;
        setNotificationsEnabled(false);
      }
    } catch {
      setNotifPermission(getNotificationPermission());
      setNotifEnabled(false);
      notifEnabledRef.current = false;
      setNotificationsEnabled(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchConversations();
      if (selectedId) {
        await fetchMessages(selectedId);
      }
      onUnreadChange?.();
    } finally {
      setTimeout(() => setRefreshing(false), 600);
    }
  }, [fetchConversations, fetchMessages, selectedId, onUnreadChange]);


  if (loading) {
    return (
      <div className={styles.wrap}>
        <div className={styles.loading}>Loading conversations…</div>
      </div>
    );
  }

  return (
    <div className={`${styles.wrap} ${selectedId ? styles.wrapMobileThread : ''}`}>
      <header className={styles.header}>
        <button
          type="button"
          className={styles.backBtn}
          onClick={() => setSelectedId(null)}
          aria-label="Back to conversations"
          title="Back to conversations"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <h2 className={styles.headerTitle}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          {selectedId && partner ? partner.name : 'Chat'}
        </h2>
        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.refreshBtn}
            onClick={handleRefresh}
            disabled={refreshing}
            aria-label="Refresh chat"
            title="Refresh conversations and messages"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={refreshing ? styles.refreshIconSpin : ''}>
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            <span className={styles.refreshLabel}>Refresh</span>
          </button>
          <div className={styles.notifWrap}>
            <span className={styles.notifLabel}>Push</span>
            <button
              type="button"
              role="switch"
              aria-checked={notifEnabled}
              className={`${styles.toggle} ${notifEnabled ? styles.toggleOn : ''}`}
              onClick={handleNotifToggle}
              aria-label={notifEnabled ? 'Disable push notifications' : 'Enable push notifications'}
              data-pressed={notifEnabled ? 'true' : 'false'}
            >
              <span className={styles.thumb} aria-hidden />
            </button>
          </div>
        </div>
      </header>

      <div className={styles.body}>
        <aside className={styles.sidebar}>
          <ul className={styles.convList}>
            {conversations.length === 0 ? (
              <li className={styles.loading}>No conversations yet.</li>
            ) : (
              conversations.map((c) => (
                <li key={c.id} className={styles.convItem}>
                  <button
                    type="button"
                    className={`${styles.convBtn} ${selectedId === c.id ? styles.convBtnActive : ''}`}
                    onClick={() => setSelectedId(c.id)}
                  >
                    <span className={styles.convName}>{c.name}</span>
                    {c.unreadCount > 0 && (
                      <span className={styles.convBadge}>
                        {c.unreadCount > 99 ? '99+' : c.unreadCount}
                      </span>
                    )}
                  </button>
                </li>
              ))
            )}
          </ul>
        </aside>

        <div className={`${styles.panel} ${selectedId ? styles.panelThread : ''}`}>
          {!selectedId ? (
            <div className={styles.placeholder}>
              Select a conversation to start messaging.
            </div>
          ) : (
            <>
              {error && <div className={styles.error}>{error}</div>}
              <div className={styles.messagesWrap}>
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`${styles.message} ${m.sentByMe ? styles.messageSent : styles.messageReceived}`}
                  >
                    <div>{m.content}</div>
                    <div className={styles.messageMeta}>
                      {m.sentByMe ? 'You' : m.senderName} · {new Date(m.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <form className={styles.form} onSubmit={handleSend}>
                <textarea
                  className={styles.input}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Type a message…"
                  rows={2}
                  disabled={sending}
                />
                <button
                  type="submit"
                  className={styles.sendBtn}
                  disabled={sending || !input.trim()}
                >
                  Send
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
