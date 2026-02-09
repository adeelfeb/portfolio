'use client';

import { useEffect } from 'react';

/**
 * Loads the reCAPTCHA script early on app mount.
 * By the time users reach a form and click submit, the script is cached and ready.
 * @see https://developers.google.com/recaptcha/docs/loading
 */
export default function RecaptchaPreloader() {
  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (!siteKey) return;
    import('../utils/recaptcha').then(({ loadRecaptchaScript }) => {
      loadRecaptchaScript();
    });
  }, []);
  return null;
}
