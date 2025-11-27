'use client'

import { motion } from 'framer-motion'
import { Zap, TrendingUp, Target } from 'lucide-react'

export default function ValueProp() {
  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'High-performance websites that load instantly',
    },
    {
      icon: TrendingUp,
      title: 'SEO Optimized',
      description: 'Rank high on Google and drive organic traffic',
    },
    {
      icon: Target,
      title: 'Conversion Focused',
      description: 'Turn visitors into customers with optimized UX',
    },
  ]

  return (
    <section className="py-20 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Building Faster, Smarter, and More Efficient Websites.
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            In the digital age, your website is your venture's most valuable asset. Whether you are launching a <strong className="text-gray-900">new startup idea</strong>, scaling an existing business, or need a complex <strong className="text-gray-900">custom integration</strong>, you need a partner who understands modern technology. We specialize in <strong className="text-gray-900">high-performance web development</strong> that ranks high on Google, loads instantly, and converts visitors into customers.
          </p>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="p-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-100 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}


