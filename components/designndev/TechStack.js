'use client'

import { motion } from 'framer-motion'

export default function TechStack() {
  const technologies = [
    'React.js',
    'Next.js',
    'HTML5',
    'CSS3',
    'Tailwind CSS',
    'Node.js',
    'Express.js',
    'MongoDB',
    'PostgreSQL',
    'WordPress',
    'Webflow',
    'Vercel',
    'AWS',
  ]

  return (
    <section id="tech-stack" className="py-20 md:py-32 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Powered by Modern Technology
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            We use cutting-edge tools and frameworks to build scalable, performant applications
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          {technologies.map((tech, index) => (
            <motion.div
              key={tech}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={{ scale: 1.1, y: -5 }}
              className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white font-semibold hover:bg-white/20 hover:border-white/30 transition-all duration-300 cursor-default"
            >
              {tech}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}


