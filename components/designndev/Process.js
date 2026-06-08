'use client'

import { motion } from 'framer-motion'

const steps = [
  {
    title: 'Discovery & Strategy',
    description: 'You share your business idea. We map out technical requirements.',
    number: '01',
    tint: 'bg-blue-50 border-blue-100',
  },
  {
    title: 'Design & Architecture',
    description: 'We structure your site using the best stack (e.g., Next.js for speed).',
    number: '02',
    tint: 'bg-purple-50 border-purple-100',
  },
  {
    title: 'Agile Development',
    description: 'We build your custom website in sprints with regular updates.',
    number: '03',
    tint: 'bg-emerald-50 border-emerald-100',
  },
  {
    title: 'Launch & Scale',
    description: 'We deploy with optimized SEO settings and provide growth support.',
    number: '04',
    tint: 'bg-amber-50 border-amber-100',
  },
]

export default function Process() {
  return (
    <section id="process" aria-label="Our process" className="py-14 md:py-20 bg-stone-50 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <p className="text-sm font-medium tracking-widest uppercase text-blue-600 mb-2">How we work</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            From Concept to Launch
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our proven process ensures your project is delivered on time and exceeds expectations
          </p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gray-200 -translate-x-1/2" />

          <div className="space-y-8 md:space-y-12">
            {steps.map((step, index) => {
              const isLeft = index % 2 === 0
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  className={`relative flex flex-col md:flex-row items-center gap-6 ${
                    isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  <div className={`flex-1 w-full ${isLeft ? 'md:text-right md:pr-10' : 'md:text-left md:pl-10'}`}>
                    <div className={`inline-block rounded-2xl border p-6 ${step.tint} max-w-md ${isLeft ? 'md:ml-auto' : ''}`}>
                      <span className="text-xs font-bold tracking-widest text-gray-400">{step.number}</span>
                      <h3 className="text-xl font-bold text-gray-900 mt-1 mb-2">{step.title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
                    </div>
                  </div>

                  <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white border-2 border-blue-600 items-center justify-center z-10 shadow-sm">
                    <span className="text-xs font-bold text-blue-600">{step.number}</span>
                  </div>

                  <div className="flex-1 hidden md:block" />
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
