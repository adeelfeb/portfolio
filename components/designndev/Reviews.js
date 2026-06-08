'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Star } from 'lucide-react'
import { useState, useEffect } from 'react'

const reviews = [
  {
    id: 1,
    name: 'Tobey Sicard',
    country: 'United States',
    rating: 5,
    timeAgo: '1 week ago',
    review: `Excellent experience! Adeel fixed a complicated website issue with professionalism and attention to detail. He didn't just apply a quick fix—he resolved the root cause completely. Highly recommended!`,
  },
  {
    id: 2,
    name: 'Tobey Sicard',
    country: 'United States',
    rating: 5,
    timeAgo: '2 years ago',
    review: `As always, a well done job. Ahead of schedule and attention to detail.`,
  },
  {
    id: 3,
    name: 'Muhammad Ahmad',
    country: 'Pakistan',
    rating: 5,
    timeAgo: '2 months ago',
    review: `The portfolio website exceeded my expectations. Modern, fast, and fully optimized for SEO. Delivered efficiently within budget. Extremely satisfied!`,
  },
  {
    id: 4,
    name: 'Abdullah',
    country: 'Pakistan',
    rating: 5,
    timeAgo: '3 months ago',
    review: `Adeel built an excellent full-stack tourism website with Next.js, MongoDB, and Tailwind CSS. Very cooperative and guided us through everything. The custom admin dashboard works perfectly. Highly recommend!`,
  },
  {
    id: 5,
    name: 'Zaiff',
    country: 'Pakistan',
    rating: 5,
    timeAgo: '3 months ago',
    review: `Outstanding work! Fixed and optimized our database connection and API integration with complete professionalism. Identified and fixed additional issues proactively. Top-notch code quality!`,
  },
  {
    id: 6,
    name: 'Ibrar',
    country: 'Pakistan',
    rating: 5,
    timeAgo: '3 months ago',
    review: `Excellent experience! Delivered high-quality work on time with clear communication. Very professional and skilled. Would definitely hire again!`,
  },
  {
    id: 7,
    name: 'Sarah',
    country: 'Pakistan',
    rating: 5,
    timeAgo: '3 months ago',
    review: `Developed and deployed a full-stack Next.js portfolio website perfectly. Modern, responsive, SEO optimized. Deployment on DigitalOcean works flawlessly. Highly professional!`,
  },
  {
    id: 8,
    name: 'Sarah',
    country: 'Pakistan',
    rating: 5,
    timeAgo: '3 months ago',
    review: `Super impressed! Communication was smooth and professional. Delivered a clean, modern, and super fast Next.js site. Shared detailed progress updates throughout. Highly recommended!`,
  },
  {
    id: 9,
    name: 'Mudassar Ali',
    country: 'Pakistan',
    rating: 5,
    timeAgo: '4 months ago',
    review: `Fast, professional and very cooperative. Highly recommended.`,
  },
]

const AVATAR_COLORS = [
  'bg-blue-600',
  'bg-purple-600',
  'bg-emerald-600',
  'bg-amber-600',
  'bg-rose-600',
  'bg-indigo-600',
  'bg-cyan-600',
  'bg-orange-600',
  'bg-teal-600',
]

function getInitials(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function getAvatarColor(name) {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

export default function Reviews() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const getVisibleReviews = () => {
    const numToShow = isMobile ? 1 : 3
    return [...Array(numToShow)].map((_, i) => reviews[(currentIndex + i) % reviews.length])
  }

  const visibleReviews = getVisibleReviews()

  return (
    <section id="reviews" aria-label="Client reviews" className="py-14 md:py-20 bg-white scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <p className="text-sm font-medium tracking-widest uppercase text-blue-600 mb-2">Testimonials</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Client Reviews
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            See what our clients have to say about our development and deployment services
          </p>
        </motion.div>

        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.45, ease: 'easeInOut' }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {visibleReviews.map((review, cardIndex) => (
                <div
                  key={review.id}
                  className={`bg-gray-50 rounded-2xl p-6 border border-gray-200 flex flex-col ${
                    cardIndex === 0 && !isMobile ? 'ring-1 ring-blue-200' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${getAvatarColor(review.name)}`}
                    >
                      {getInitials(review.name)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{review.name}</h3>
                      <p className="text-xs text-gray-500">
                        {review.country} · {review.timeAgo}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  <p
                    className={`text-gray-700 leading-relaxed flex-grow ${
                      cardIndex === 0 && !isMobile ? 'text-base md:text-lg' : 'text-sm md:text-base'
                    }`}
                  >
                    &ldquo;{review.review}&rdquo;
                  </p>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex justify-center gap-2 mt-8">
          {reviews.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'w-8 bg-blue-600' : 'w-2 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to review ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
