import { absoluteUrl } from '../lib/seo'

const STATIC_ROUTES = [
  '/',
  '/contact',
  '/services',
  '/process',
  '/tech-stack',
  '/portfolio',
  '/portfolios',
  '/blogs',
  '/whatsapp-chat-analysis',
  '/privacy-policy',
]

export default function sitemap() {
  const lastModified = new Date()

  return STATIC_ROUTES.map((path) => ({
    url: absoluteUrl(path),
    lastModified,
    changeFrequency: path === '/' ? 'weekly' : 'monthly',
    priority: path === '/' ? 1 : 0.8,
  }))
}
