'use client'

import { motion } from 'framer-motion'
import { Zap, TrendingUp, Target } from 'lucide-react'

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

export default function ValueProp() {
  return (
    <section aria-label="Why choose us" className="py-14 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm font-medium tracking-widest uppercase text-blue-600 mb-3">Why us</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Building Faster, Smarter, and More Efficient Websites.
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              In the digital age, your website is your venture&apos;s most valuable asset. Whether you are launching a{' '}
              <strong className="text-gray-900">new startup idea</strong>, scaling an existing business, or need a complex{' '}
              <strong className="text-gray-900">custom integration</strong>, you need a partner who understands modern technology.
              We specialize in <strong className="text-gray-900">high-performance web development</strong> that ranks high on Google, loads instantly, and converts visitors into customers.
            </p>

            <div className="space-y-4">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.08 }}
                    className="flex gap-4 p-4 rounded-xl border border-gray-200 bg-gray-50/50 hover:border-blue-200 hover:bg-blue-50/30 transition-colors"
                  >
                    <div className="w-11 h-11 shrink-0 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{feature.title}</h3>
                      <p className="text-sm text-gray-600 mt-0.5">{feature.description}</p>
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
            <VisualPanel />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function VisualPanel() {
  return (
    <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-xl bg-slate-900 aspect-[4/5] max-h-[520px] grain-overlay">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-blue-950" />
      <div className="relative z-10 p-6 h-full flex flex-col">
        <div className="flex items-center gap-2 mb-6">
          <span className="w-3 h-3 rounded-full bg-red-400/80" />
          <span className="w-3 h-3 rounded-full bg-amber-400/80" />
          <span className="w-3 h-3 rounded-full bg-emerald-400/80" />
          <span className="ml-2 text-xs text-gray-500 font-mono">project.tsx</span>
        </div>
        <div className="flex-1 font-mono text-sm leading-relaxed space-y-1.5 text-gray-400">
          <p><span className="text-purple-400">const</span> <span className="text-blue-300">build</span> = <span className="text-amber-200">async</span> () =&gt; {'{'}</p>
          <p className="pl-4"><span className="text-purple-400">const</span> site = <span className="text-emerald-300">await</span> create({'{'}</p>
          <p className="pl-8">stack: [<span className="text-amber-200">&apos;Next.js&apos;</span>, <span className="text-amber-200">&apos;React&apos;</span>],</p>
          <p className="pl-8">seo: <span className="text-amber-200">true</span>,</p>
          <p className="pl-8">performance: <span className="text-amber-200">&apos;optimized&apos;</span>,</p>
          <p className="pl-4">{'}'})</p>
          <p className="pl-4"><span className="text-purple-400">return</span> deploy(site)</p>
          <p>{'}'}</p>
        </div>
        <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-3 gap-3">
          {[
            { label: 'Projects', value: '50+' },
            { label: 'Avg. rating', value: '5.0' },
            { label: 'Stack', value: 'MERN' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
