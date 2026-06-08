import { absoluteUrl } from '../lib/seo'

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/api/', '/login', '/signup'],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
  }
}
