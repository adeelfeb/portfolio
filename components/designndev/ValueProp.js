'use client'

import { motion } from 'framer-motion'
import { Zap, TrendingUp, Target, Rocket, ShieldCheck, BarChart3 } from 'lucide-react'
import Image from 'next/image'

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Sites that load instantly and rank higher',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: TrendingUp,
    title: 'SEO Optimized',
    description: 'Built to rank on Google from day one',
    color: 'from-teal-500 to-teal-500',
  },
  {
    icon: Target,
    title: 'Conversion Focused',
    description: 'Designed to turn visitors into customers',
    color: 'from-violet-500 to-purple-500',
  },
]

const stats = [
  { icon: Rocket, value: '50+', label: 'Projects Shipped' },
  { icon: ShieldCheck, value: '5.0', label: 'Avg. Rating' },
  { icon: BarChart3, value: '98%', label: 'Client Satisf. ' },
]

export default function ValueProp() {
  return (
    <section aria-label="Why choose us" className="py-10 md:py-16 bg-gradient-to-b from-white via-blue-50/30 to-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full mb-4">
              <Zap className="w-3.5 h-3.5" />
              Why Us
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              Websites That <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Perform</span>
            </h2>
            <p className="text-base text-gray-600 leading-relaxed mb-6 max-w-lg">
              We build high-performance web applications optimized for speed, SEO, and conversions — using modern stacks that scale.
            </p>

            <div className="space-y-3">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.08 }}
                    className="flex gap-4 p-4 rounded-xl border border-gray-200 bg-white/80 hover:border-blue-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <div className={`w-11 h-11 shrink-0 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center shadow-sm`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{feature.title}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">{feature.description}</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-xl aspect-[4/5] max-h-[460px]">
              <Image
                src="/images/office-team.jpg"
                alt="Professional web development team collaborating in modern office"
                fill
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <div className="grid grid-cols-3 gap-2">
                  {stats.map((stat) => {
                    const Icon = stat.icon
                    return (
                      <div key={stat.label} className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                        <Icon className="w-4 h-4 text-blue-300 mx-auto mb-1" />
                        <p className="text-lg font-bold text-white">{stat.value}</p>
                        <p className="text-[10px] text-gray-300 mt-0.5">{stat.label}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
