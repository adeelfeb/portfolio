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

export default function Reviews() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        // Cycle through all reviews
        return (prevIndex + 1) % reviews.length
      })
    }, 5000) // Change reviews every 5 seconds

    return () => clearInterval(interval)
  }, [])

  // Get visible reviews - show 1 on mobile, 3 on desktop
  const getVisibleReviews = () => {
    const reviewsToShow = []
    const numToShow = isMobile ? 1 : 3
    
    for (let i = 0; i < numToShow; i++) {
      const index = (currentIndex + i) % reviews.length
      reviewsToShow.push(reviews[index])
    }
    return reviewsToShow
  }

  const visibleReviews = getVisibleReviews()

  return (
    <section className="pt-8 pb-12 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-8"
        >
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
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {visibleReviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white rounded-2xl p-6 border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col"
                >
                  {/* Header with name, country, and rating */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {review.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {review.country} • {review.timeAgo}
                        </p>
                      </div>
                    </div>
                    {/* Star Rating */}
                    <div className="flex items-center gap-1 mt-2">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Review Text */}
                  <p className="text-gray-700 leading-relaxed text-sm md:text-base flex-grow">
                    {review.review}
                  </p>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Indicator dots */}
        <div className="flex justify-center gap-2 mt-6">
          {reviews.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'w-8 bg-blue-600'
                  : 'w-2 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to review ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
