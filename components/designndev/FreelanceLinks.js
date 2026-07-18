'use client'
import { motion } from 'framer-motion'

const freelanceLinks = [
  {
    name: 'Fiverr',
    href: 'https://www.fiverr.com/s/EgQz3ey',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M22.93 6.97c-.05-.32-.34-.53-.67-.53h-3.6c-.33 0-.62.21-.67.53l-.84 5.09c-.02.14-.13.24-.27.24h-1.6c-.33 0-.62-.21-.67-.53l-.84-5.09c-.02-.14-.13-.24-.27-.24h-2.75c-.33 0-.62.21-.67.53l-1.24 7.52c-.05.32.16.63.49.63h2.42c.33 0 .62-.21.67-.53l.55-3.33c.02-.14.13-.24.27-.24h1.07c.33 0 .62.21.67.53l.55 3.33c.02.14.13.24.27.24h2.42c.33 0 .54-.31.49-.63l-1.24-7.52c-.02-.14-.13-.24-.27-.24h-1.6c-.33 0-.62-.21-.67-.53l-.84-5.09c-.02-.14-.13-.24-.27-.24h-3.6c-.33 0-.62.21-.67.53L4.5 19.18c-.05.32.16.63.49.63h3.43c.33 0 .62-.21.67-.53l.84-5.09c.02-.14.13-.24.27-.24h1.6c.33 0 .62.21.67.53l.84 5.09c.02.14.13.24.27.24h3.43c.33 0 .54-.31.49-.63l1.5-9.09z"/>
      </svg>
    ),
    color: 'from-teal-500 to-teal-600',
    hoverShadow: 'hover:shadow-teal-500/30',
  },
  {
    name: 'Upwork',
    href: 'https://www.upwork.com/freelancers/~015f09e4ce1f66527f?p=1804023285153173504',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M18.5 14.5c-1.1 0-2-.9-2-2V6.5c0-1.1.9-2 2-2s2 .9 2 2v6c0 1.1-.9 2-2 2zm-3 1.5c0-1.1.9-2 2-2h3.5c1.1 0 2 .9 2 2v3c0 1.1-.9 2-2 2h-3.5c-1.1 0-2-.9-2-2v-3zM7.5 9.5c-2.2 0-4 1.8-4 4s1.8 4 4 4c1.3 0 2.5-.6 3.3-1.6l-1.4-1.4c-.4.5-1 .8-1.8.8-1.4 0-2.5-1.1-2.5-2.5s1.1-2.5 2.5-2.5c.8 0 1.4.3 1.8.8l1.4-1.4C10 10.1 8.8 9.5 7.5 9.5z"/>
      </svg>
    ),
    color: 'from-blue-500 to-indigo-600',
    hoverShadow: 'hover:shadow-blue-500/30',
  },
  {
    name: 'WhatsApp',
    href: 'https://wa.me/923099670475',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    ),
    color: 'from-green-500 to-teal-600',
    hoverShadow: 'hover:shadow-green-500/30',
  },
]

export default function FreelanceLinks() {
  return (
    <section className="relative py-10 bg-white border-b border-gray-100">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6"
        >
          <h2 className="font-subheading text-sm font-semibold tracking-widest uppercase text-gray-400">
            Let&apos;s Work Together
          </h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {freelanceLinks.map((link, i) => (
            <motion.a
              key={link.name}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`group relative flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-br ${link.color} text-white font-subheading font-semibold text-base shadow-lg ${link.hoverShadow} hover:scale-[1.03] transition-all duration-300 no-underline`}
            >
              {link.icon}
              {link.name}
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  )
}
