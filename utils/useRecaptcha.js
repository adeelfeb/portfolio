/**
 * React hook for Google reCAPTCHA v2 Invisible
 * Preloads script and widget on mount so reCAPTCHA is ready before first submit.
 */
import { useCallback, useEffect } from 'react';

const SITE_KEY = typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
  ? process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
  : '';

export function useRecaptcha() {
  useEffect(() => {
    if (!SITE_KEY) return;
    import('./recaptcha').then(({ preloadAndPrepare }) => {
      preloadAndPrepare(SITE_KEY);
    });
  }, []);

  const execute = useCallback(async () => {
    if (!SITE_KEY) return null;
    const { executeRecaptcha } = await import('./recaptcha');
    return executeRecaptcha(SITE_KEY);
  }, []);

  return {
    execute,
    isAvailable: !!SITE_KEY,
    siteKey: SITE_KEY,
  };
}
