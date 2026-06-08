export const SITE_NAME = 'Design n Dev'
export const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://designndev.com'
export const DEFAULT_TITLE = 'Design n Dev | Expert Full-Stack Web Development & Next.js Solutions'
export const DEFAULT_DESCRIPTION =
  'Turn your business idea into reality with Design n Dev. We specialize in fast, scalable custom development using Next.js, MERN Stack, and Node.js for startups and enterprises.'
export const DEFAULT_KEYWORDS =
  'Next.js development, MERN stack agency, Startup MVP development, Full-stack web development, React development, Node.js development, custom web solutions, e-commerce development'
export const DEFAULT_OG_IMAGE = '/og/default.jpg'

export function absoluteUrl(path = '') {
  const base = SITE_URL.replace(/\/$/, '')
  if (!path) return base
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}

export function buildPageMetadata({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  path = '/',
  image = DEFAULT_OG_IMAGE,
  type = 'website',
} = {}) {
  const url = absoluteUrl(path)
  const imageUrl = image.startsWith('http') ? image : absoluteUrl(image)

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${SITE_NAME} — Full-Stack Web Development`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export function buildHomeJsonLd() {
  const url = absoluteUrl('/')

  return {
    '@context': 'https://schema.org',
    '@graph': [
    {
      '@type': 'Organization',
      name: SITE_NAME,
      url,
      logo: absoluteUrl('/logo.svg'),
      email: 'hello@designndev.com',
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        email: 'hello@designndev.com',
        availableLanguage: 'English',
      },
    },
    {
      '@type': 'WebSite',
      name: SITE_NAME,
      url,
    },
    {
      '@type': 'ProfessionalService',
      name: SITE_NAME,
      url,
      description: DEFAULT_DESCRIPTION,
      email: 'hello@designndev.com',
      areaServed: 'Worldwide',
      serviceType: [
        'Full-Stack Web Development',
        'Next.js Development',
        'CMS Development',
        'E-Commerce Development',
        'API Integration',
      ],
    },
    ],
  }
}
