import Navbar from '../components/designndev/Navbar'
import SiteHero from '../components/designndev/SiteHero'
import ProblemSection from '../components/designndev/ProblemSection'
import HowItWorksSection from '../components/designndev/HowItWorksSection'
import GoalsSection from '../components/designndev/GoalsSection'
import TargetUsersSection from '../components/designndev/TargetUsersSection'
import PartnershipFormSection from '../components/designndev/PartnershipFormSection'
import Footer from '../components/designndev/Footer'
import TextureOverlay from '../components/designndev/TextureOverlay'
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
      <main className="relative min-h-screen">
        <TextureOverlay />
        <Navbar />
        <div className="relative w-full mx-auto">
          <SiteHero />
          <ProblemSection />
          <HowItWorksSection />
          <GoalsSection />
          <TargetUsersSection />
          <PartnershipFormSection />
        </div>
        <Footer />
      </main>
    </>
  )
}
