import Navbar from '../components/designndev/Navbar'
import Hero from '../components/designndev/Hero'
import HomeSections from '../components/designndev/HomeSections.client'
import { buildPageMetadata, buildHomeJsonLd } from '../lib/seo'

export const metadata = buildPageMetadata({
  path: '/',
})

export default function Home() {
  const jsonLd = buildHomeJsonLd()

  const reviewJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Design n Dev Web Development Services',
    description: 'Full-stack web development, Next.js solutions, CMS, e-commerce, and API integration services.',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5.0',
      bestRating: '5',
      ratingCount: '50',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewJsonLd) }}
      />
      <main className="min-h-screen bg-white">
        <Navbar />
        <Hero />
        <HomeSections />
      </main>
    </>
  )
}
