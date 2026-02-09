/**
 * Google reCAPTCHA v2 Invisible - Client utilities
 * Loads the script early and provides executeRecaptcha for getting tokens.
 * @see https://developers.google.com/recaptcha/docs/invisible
 * @see https://developers.google.com/recaptcha/docs/loading
 */

const SCRIPT_URL = 'https://www.google.com/recaptcha/api.js';
const LOAD_KEY = '__RECAPTCHA_LOADED__';
const READY_KEY = '__RECAPTCHA_READY__';

/**
 * Polyfill: allows grecaptcha.ready() to be called before the script loads.
 * Callbacks are queued and run when reCAPTCHA finishes loading.
 * @see https://developers.google.com/recaptcha/docs/loading
 */
function ensureReadyPolyfill() {
  if (typeof window === 'undefined') return;
  if (typeof window.grecaptcha !== 'undefined' && window.grecaptcha.ready) return;
  const cfg = '__grecaptcha_cfg';
  window[cfg] = window[cfg] || {};
  window.grecaptcha = {
    ready: (cb) => {
      (window[cfg].fns = window[cfg].fns || []).push(cb);
    },
  };
}

/**
 * Load the reCAPTCHA script. Idempotent.
 * Call this early (e.g. on app load) so it's ready before form submission.
 * @returns {Promise<boolean>}
 */
export function loadRecaptchaScript() {
  if (typeof window === 'undefined') return Promise.resolve(false);
  ensureReadyPolyfill();

  if (window[LOAD_KEY]) return Promise.resolve(true);

  return new Promise((resolve) => {
    const existing = document.querySelector('script[src*="recaptcha/api"]');
    if (existing) {
      if (window.grecaptcha && window.grecaptcha.render) {
        window[LOAD_KEY] = true;
        return resolve(true);
      }
      existing.addEventListener('load', () => {
        window[LOAD_KEY] = true;
        resolve(true);
      });
      return;
    }

    const script = document.createElement('script');
    script.src = SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window[LOAD_KEY] = true;
      resolve(true);
    };
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

let _widgetId = null;
let _pendingResolve = null;
let _lastSiteKey = null;

const _globalCallback = (token) => {
  if (_pendingResolve) {
    _pendingResolve(token || null);
    _pendingResolve = null;
  }
};

/**
 * Preload script and pre-initialize the invisible widget.
 * Call when a form component mounts so reCAPTCHA is ready before user submits.
 * @param {string} siteKey
 * @returns {Promise<boolean>}
 */
export function preloadAndPrepare(siteKey) {
  if (typeof window === 'undefined' || !siteKey || !String(siteKey).trim()) return Promise.resolve(false);
  return loadRecaptchaScript().then((loaded) => {
    if (!loaded) return false;
    return new Promise((resolve) => {
      const run = () => {
        try {
          if (!window.grecaptcha || !window.grecaptcha.render) {
            resolve(false);
            return;
          }
          if (_widgetId != null && _lastSiteKey === siteKey) {
            resolve(true);
            return;
          }
          if (_widgetId != null) {
            resolve(true);
            return;
          }
          const container = document.createElement('div');
          container.id = 'recaptcha-invisible-' + Date.now();
          container.style.cssText = 'position:absolute;left:-9999px;top:-9999px;';
          document.body.appendChild(container);
          _widgetId = window.grecaptcha.render(container, {
            sitekey: siteKey,
            size: 'invisible',
            callback: _globalCallback,
            'expired-callback': () => {
              if (_pendingResolve) {
                _pendingResolve(null);
                _pendingResolve = null;
              }
            },
            'error-callback': () => {
              if (_pendingResolve) {
                _pendingResolve(null);
                _pendingResolve = null;
              }
            },
          });
          _lastSiteKey = siteKey;
          window[READY_KEY] = true;
          resolve(true);
        } catch (err) {
          resolve(false);
        }
      };
      if (window.grecaptcha && window.grecaptcha.ready) {
        window.grecaptcha.ready(run);
      } else {
        run();
      }
    });
  });
}

const EXECUTE_TIMEOUT_MS = 15000;

/**
 * Execute reCAPTCHA v2 Invisible and return the token via Promise.
 * Waits for grecaptcha.ready(), supports retry on first failure.
 * @param {string} siteKey - NEXT_PUBLIC_RECAPTCHA_SITE_KEY
 * @returns {Promise<string|null>} Token or null if failed/not configured
 */
export async function executeRecaptcha(siteKey) {
  if (typeof window === 'undefined') return null;
  if (!siteKey || !String(siteKey).trim()) return null;

  const doExecute = () => {
    return new Promise((resolve) => {
      let settled = false;
      const timeoutId = setTimeout(() => {
        if (!settled) {
          settled = true;
          _pendingResolve = null;
          resolve(null);
        }
      }, EXECUTE_TIMEOUT_MS);
      const wrappedResolve = (v) => {
        clearTimeout(timeoutId);
        if (!settled) {
          settled = true;
          _pendingResolve = null;
          resolve(v);
        }
      };
      _pendingResolve = wrappedResolve;
      const run = () => {
        try {
          if (_widgetId == null || _lastSiteKey !== siteKey) {
            const container = document.createElement('div');
            container.id = 'recaptcha-invisible-' + Date.now();
            container.style.cssText = 'position:absolute;left:-9999px;top:-9999px;';
            document.body.appendChild(container);
            _widgetId = window.grecaptcha.render(container, {
              sitekey: siteKey,
              size: 'invisible',
              callback: _globalCallback,
              'expired-callback': () => { if (_pendingResolve) { _pendingResolve(null); _pendingResolve = null; } },
              'error-callback': () => { if (_pendingResolve) { _pendingResolve(null); _pendingResolve = null; } },
            });
            _lastSiteKey = siteKey;
          }
          window.grecaptcha.reset(_widgetId);
          window.grecaptcha.execute(_widgetId);
        } catch (err) {
          wrappedResolve(null);
        }
      };
      if (window.grecaptcha && window.grecaptcha.ready) {
        window.grecaptcha.ready(run);
      } else {
        run();
      }
    });
  };

  try {
    await loadRecaptchaScript();
    if (!window.grecaptcha || !window.grecaptcha.render) return null;

    let token = await doExecute();
    if (!token) {
      await new Promise((r) => setTimeout(r, 800));
      token = await doExecute();
    }
    return token;
  } catch (err) {
    console.warn('[reCAPTCHA] Error:', err);
    return null;
  }
}
