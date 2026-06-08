import Navbar from '../components/designndev/Navbar'
import Hero from '../components/designndev/Hero'
import HomeSections from '../components/designndev/HomeSections.client'
import { buildPageMetadata, buildHomeJsonLd } from '../lib/seo'

export const metadata = buildPageMetadata({
  path: '/',
})

export default function Home() {
  const jsonLd = buildHomeJsonLd()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen bg-white">
        <Navbar />
        <Hero />
        <HomeSections />
      </main>
    </>
  )
}
