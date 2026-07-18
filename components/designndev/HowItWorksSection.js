'use client'
import { motion } from 'framer-motion'

export default function HowItWorksSection() {
  const steps = [
    {
      number: '01',
      title: 'Report an Issue',
      description: 'Snap a photo and submit a waste report through our simple mobile-friendly form.',
      color: 'bg-teal-500',
    },
    {
      number: '02',
      title: 'Track Progress',
      description: 'Follow your report in real-time as authorities review and take action.',
      color: 'bg-blue-500',
    },
    {
      number: '03',
      title: 'See Results',
      description: 'Get notified when the issue is resolved and see the impact of your contribution.',
      color: 'bg-purple-500',
    },
  ]

  return (
    <section className="py-20 md:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto font-subheading">
            Three simple steps to make a real difference in your community.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-0.5 bg-gray-200" />

          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative text-center"
            >
              <div className={`w-12 h-12 ${step.color} rounded-full flex items-center justify-center text-white font-bold text-sm mx-auto mb-6 relative z-10`}>
                {step.number}
              </div>
              <h3 className="font-subheading text-xl font-semibold text-gray-900 mb-3">
                {step.title}
              </h3>
              <p className="text-gray-600 font-subheading leading-relaxed max-w-xs mx-auto">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
