'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'

function useInViewOnce({ rootMargin = '200px 0px', threshold = 0.01 } = {}) {
  const ref = useRef(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    if (isInView) return
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { rootMargin, threshold }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [isInView, rootMargin, threshold])

  return { ref, isInView }
}

function SectionSkeleton({ minHeight = 420 }) {
  return (
    <div className="w-full bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div
          className="w-full rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white animate-pulse"
          style={{ minHeight }}
        />
      </div>
    </div>
  )
}

function DeferredSection({ component: Component, skeletonMinHeight }) {
  const { ref, isInView } = useInViewOnce()
  return <div ref={ref}>{isInView ? <Component /> : <SectionSkeleton minHeight={skeletonMinHeight} />}</div>
}

const ValueProp = dynamic(() => import('./ValueProp'), { ssr: false })
const Services = dynamic(() => import('./Services'), { ssr: false })
const FeaturedWork = dynamic(() => import('./FeaturedWork'), { ssr: false })
const Process = dynamic(() => import('./Process'), { ssr: false })
const Reviews = dynamic(() => import('./Reviews'), { ssr: false })
const TechStack = dynamic(() => import('./TechStack'), { ssr: false })
const ContactForm = dynamic(() => import('./ContactForm'), { ssr: false })
const Footer = dynamic(() => import('./Footer'), { ssr: false })

export default function HomeSections() {
  return (
    <>
      <DeferredSection component={ContactForm} skeletonMinHeight={500} />
      <DeferredSection component={ValueProp} skeletonMinHeight={480} />
      <DeferredSection component={Services} skeletonMinHeight={660} />
      <DeferredSection component={FeaturedWork} skeletonMinHeight={560} />
      <DeferredSection component={Process} skeletonMinHeight={600} />
      <DeferredSection component={Reviews} skeletonMinHeight={480} />
      <DeferredSection component={TechStack} skeletonMinHeight={440} />
      <DeferredSection component={Footer} skeletonMinHeight={780} />
    </>
  )
}
