'use client'

import { motion } from 'framer-motion'
import { Search, Palette, Code2, Rocket } from 'lucide-react'

export default function Process() {
  const steps = [
    {
      icon: Search,
      title: 'Discovery & Strategy',
      description: 'You share your business idea. We map out technical requirements.',
      number: '01',
    },
    {
      icon: Palette,
      title: 'Design & Architecture',
      description: 'We structure your site using the best stack (e.g., Next.js for speed).',
      number: '02',
    },
    {
      icon: Code2,
      title: 'Agile Development',
      description: 'We build your custom website in sprints with regular updates.',
      number: '03',
    },
    {
      icon: Rocket,
      title: 'Launch & Scale',
      description: 'We deploy with optimized SEO settings and provide growth support.',
      number: '04',
    },
  ]

  return (
    <section id="process" className="py-20 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            From Concept to Launch
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our proven process ensures your project is delivered on time and exceeds expectations
          </p>
        </motion.div>

        <div className="relative">
          {/* Timeline line - hidden on mobile, visible on desktop */}
          <div className="hidden md:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="relative"
                >
                  {/* Step Number Badge */}
                  <div className="absolute -top-4 left-0 w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg z-10">
                    {step.number}
                  </div>

                  {/* Card */}
                  <div className="pt-8 bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 h-full">
                    <div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}


