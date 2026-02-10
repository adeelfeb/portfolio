'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/router';

/**
 * Loads the reCAPTCHA script early on app mount (except on dashboard).
 * By the time users reach a form and click submit, the script is cached and ready.
 * @see https://developers.google.com/recaptcha/docs/loading
 */
export default function RecaptchaPreloader() {
  const router = useRouter();
  const pathname = router?.pathname ?? '';
  const isDashboard = pathname === '/dashboard' || (pathname && pathname.startsWith('/dashboard'));

  useEffect(() => {
    if (!router?.isReady) return;
    if (isDashboard) return;
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (!siteKey) return;
    import('../utils/recaptcha').then(({ loadRecaptchaScript }) => {
      loadRecaptchaScript();
    });
  }, [pathname, isDashboard, router?.isReady]);
  return null;
}
