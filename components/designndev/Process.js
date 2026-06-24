'use client'

import { motion } from 'framer-motion'
import { Search, PenTool, Code2, Rocket, Layers } from 'lucide-react'

const steps = [
  {
    icon: Search,
    title: 'Discovery',
    description: 'Understand requirements and map out the technical plan.',
    number: '01',
    color: 'from-blue-500 to-cyan-500',
    tint: 'bg-blue-50 border-blue-100',
  },
  {
    icon: PenTool,
    title: 'Architecture',
    description: 'Structure the site with the best stack for your needs.',
    number: '02',
    color: 'from-violet-500 to-purple-500',
    tint: 'bg-purple-50 border-purple-100',
  },
  {
    icon: Code2,
    title: 'Development',
    description: 'Build in sprints with regular updates and reviews.',
    number: '03',
    color: 'from-emerald-500 to-teal-500',
    tint: 'bg-emerald-50 border-emerald-100',
  },
  {
    icon: Rocket,
    title: 'Launch & Scale',
    description: 'Deploy with SEO optimization and ongoing support.',
    number: '04',
    color: 'from-amber-500 to-orange-500',
    tint: 'bg-amber-50 border-amber-100',
  },
]

export default function Process() {
  return (
    <section id="process" aria-label="Our process" className="py-10 md:py-16 bg-white relative scroll-mt-24 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-50/40 via-transparent to-transparent pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-12"
        >
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full mb-3">
            <Layers className="w-3.5 h-3.5" />
            How We Work
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
            From Concept to Launch
          </h2>
          <p className="text-base text-gray-500 max-w-2xl mx-auto">
            A proven process that delivers on time
          </p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-blue-200 via-purple-200 to-amber-200 -translate-x-1/2" />

          <div className="space-y-6 md:space-y-10">
            {steps.map((step, index) => {
              const Icon = step.icon
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
                    <div className={`inline-block rounded-2xl border p-5 ${step.tint} max-w-md ${isLeft ? 'md:ml-auto' : ''} hover:shadow-md transition-shadow`}>
                      <span className="text-xs font-bold tracking-widest text-gray-400">{step.number}</span>
                      <div className="flex items-center gap-2 mt-1 mb-2">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${step.color} flex items-center justify-center shrink-0`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                      </div>
                      <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
                    </div>
                  </div>

                  <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white border-2 border-indigo-600 items-center justify-center z-10 shadow-sm">
                    <span className="text-xs font-bold text-indigo-600">{step.number}</span>
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
