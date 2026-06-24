'use client'

import { motion } from 'framer-motion'
import { Cpu } from 'lucide-react'

const technologies = [
  { name: 'React.js', Icon: ReactIcon },
  { name: 'Next.js', Icon: NextIcon },
  { name: 'HTML5', Icon: HtmlIcon },
  { name: 'CSS3', Icon: CssIcon },
  { name: 'Tailwind CSS', Icon: TailwindIcon },
  { name: 'Node.js', Icon: NodeIcon },
  { name: 'Express.js', Icon: ExpressIcon },
  { name: 'MongoDB', Icon: MongoIcon },
  { name: 'PostgreSQL', Icon: PostgresIcon },
  { name: 'WordPress', Icon: WordPressIcon },
  { name: 'Webflow', Icon: WebflowIcon },
  { name: 'Vercel', Icon: VercelIcon },
  { name: 'AWS', Icon: AwsIcon },
]

export default function TechStack() {
  return (
    <section id="tech-stack" aria-label="Technology stack" className="py-10 md:py-16 bg-gradient-to-b from-slate-900 to-slate-950 relative scroll-mt-24">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-10"
        >
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-blue-400 bg-blue-950/50 px-3 py-1.5 rounded-full mb-3 border border-blue-800/30">
            <Cpu className="w-3.5 h-3.5" />
            Stack
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3">
            Powered by Modern Technology
          </h2>
          <p className="text-base text-gray-400 max-w-2xl mx-auto">
            Cutting-edge tools for scalable applications
          </p>
        </motion.div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3 md:gap-4">
          {technologies.map((tech, index) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: index * 0.04 }}
              title={tech.name}
              className="group flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 hover:-translate-y-0.5 transition-all duration-300"
            >
              <tech.Icon className="w-8 h-8 text-white/90 group-hover:scale-110 transition-transform" />
              <span className="text-xs text-gray-400 text-center leading-tight group-hover:text-gray-300">
                {tech.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ReactIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 10.11c1.03 0 1.87.84 1.87 1.89 0 1-.84 1.85-1.87 1.85S10.13 13 10.13 12c0-1.05.84-1.89 1.87-1.89M7.37 20c.63.38 2.01-.2 3.6-1.7-.52-.4-1.01-.84-1.46-1.31C7.28 18.13 6.64 19.33 7.37 20M16.65 18.3c-.45.47-.94.91-1.46 1.31 1.59 1.5 2.97 2.08 3.6 1.7.73-.67.09-1.87-2.14-3.39M12 3.4c-2.5 2.13-4.58 5.25-5.96 8.72 1.38 3.47 3.46 6.59 5.96 8.72 2.5-2.13 4.58-5.25 5.96-8.72C16.58 8.65 14.5 5.53 12 3.4M12 1.5c3.53 3.05 6.44 7.05 8.08 11.62C18.44 17.7 15.53 21.7 12 24 8.47 21.7 5.56 17.7 3.92 13.12 5.56 8.55 8.47 4.55 12 1.5Z" />
    </svg>
  )
}

function NextIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M11.572 0c-.176 0-.31.001-.358.007a19.76 19.76 0 0 1-.364.033C7.443.346 4.25 2.185 2.228 5.012a11.875 11.875 0 0 0-2.119 5.243c-.096.659-.108.854-.108 1.747s.012 1.089.108 1.748c.652 4.506 4.317 8.165 8.818 8.811.659.096.854.108 1.747.108s1.089-.012 1.748-.108a11.9 11.9 0 0 0 5.245-2.12c2.826-2.022 4.666-5.215 4.972-8.85.007-.048.007-.182.007-.358V0h-4.43zm-1.143 17.77V6.23h2.7l4.43 7.77h-2.7l-1.43-2.54-1.43 2.54h-2.56zm5.13-7.77h2.56v11.54h-2.56V10z" />
    </svg>
  )
}

function HtmlIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#E44D26" aria-hidden="true">
      <path d="M1.5 0h21l-1.91 21.563L11.977 24l-8.564-2.438L1.5 0zm17.09 4.413L5.41 4.41l.213 2.622h10.125l-.255 2.716H5.64l.213 2.622h7.878l-.264 2.842-3.64 1.01-3.622-1.01-.188-2.11H4.773l.411 4.653 6.64 1.843 6.621-1.843 1.046-11.7H6.305z" />
    </svg>
  )
}

function CssIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#1572B6" aria-hidden="true">
      <path d="M1.5 0h21l-1.91 21.563L11.977 24l-8.565-2.438L1.5 0zm17.09 4.413L5.41 4.41l.213 2.622h10.125l-.255 2.716H5.64l.213 2.622h7.878l-.264 2.842-3.64 1.01-3.622-1.01-.188-2.11H4.773l.411 4.653 6.64 1.843 6.621-1.843 1.046-11.7H6.305z" />
    </svg>
  )
}

function TailwindIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#38BDF8" aria-hidden="true">
      <path d="M12 6c-2.67 0-4.33 1.33-5 4 1-1.33 2.17-1.83 3.5-1.5.76.19 1.3.74 1.9 1.35.98 1 2.12 2.15 4.6 2.15 2.67 0 4.33-1.33 5-4-1 1.33-2.17 1.83-3.5 1.5-.76-.19-1.3-.74-1.9-1.35C15.62 7.15 14.48 6 12 6zm-5 6c-2.67 0-4.33 1.33-5 4 1-1.33 2.17-1.83 3.5-1.5.76.19 1.3.74 1.9 1.35.98 1 2.12 2.15 4.6 2.15 2.67 0 4.33-1.33 5-4-1 1.33-2.17 1.83-3.5 1.5-.76-.19-1.3-.74-1.9-1.35C10.62 13.15 9.48 12 7 12z" />
    </svg>
  )
}

function NodeIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#339933" aria-hidden="true">
      <path d="M11.998 0C10.65 0 9.77.587 9.043 1.07L3.213 4.44A4.92 4.92 0 0 0 0 8.64v6.72a4.92 4.92 0 0 0 3.213 4.2l5.83 3.37c.827.483 1.607 1.07 2.955 1.07s2.128-.587 2.955-1.07l5.83-3.37A4.92 4.92 0 0 0 24 15.36V8.64a4.92 4.92 0 0 0-3.213-4.2l-5.83-3.37C14.226.587 13.346 0 11.998 0zm0 1.8c.62 0 1.17.31 1.59.553l5.83 3.37a3.12 3.12 0 0 1 2.04 2.66v6.72a3.12 3.12 0 0 1-2.04 2.66l-5.83 3.37c-.42.243-.97.553-1.59.553s-1.17-.31-1.59-.553l-5.83-3.37a3.12 3.12 0 0 1-2.04-2.66V8.38a3.12 3.12 0 0 1 2.04-2.66l5.83-3.37c.42-.243.97-.553 1.59-.553z" />
    </svg>
  )
}

function ExpressIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 18.588a1.529 1.529 0 0 1-1.895-.72l-3.45-4.771-.5-.667-4.003 5.444a1.466 1.466 0 0 1-1.802.708l5.158-6.92-4.798-6.251a1.595 1.595 0 0 1 1.9.666l3.576 4.83 3.596-4.81a1.435 1.435 0 0 1 1.788-.668L21.708 7.9l-2.791 3.716L24 18.588zM.002 11.576l.42-2.075c1.154-4.103 5.858-5.81 9.094-3.27 1.895 1.489 2.368 3.597 2.275 5.973H1.116C.943 16.447 4.005 19 7.08 19c1.634 0 3.14-.6 4.33-1.6l1.65 1.93C10.666 21.051 8.13 22 5.5 22 1.9 22-.5 18.4.002 11.576zM14.27 11.9c.028-2.532-1.237-4.318-3.3-4.868-2.063-.55-4.04.4-4.9 2.468H14.27z" />
    </svg>
  )
}

function MongoIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#47A248" aria-hidden="true">
      <path d="M17.193 9.555c-1.264-5.58-4.252-7.414-4.573-8.115-.28-.394-.53-.954-.735-1.44-.036.495-.055.685-.523 1.184-.723.566-4.438 3.682-4.74 10.02-.282 5.912 4.27 9.435 4.888 9.884l.07.05A73.49 73.49 0 0 1 11.91 24h.481c.114-1.032.284-2.056.51-3.07.417-.296 1.196-1.165 1.963-2.498.653-1.124 1.168-2.33 1.528-3.587.38-1.028.626-2.076.735-3.125a14.87 14.87 0 0 0 .193-3.165z" />
    </svg>
  )
}

function PostgresIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#4169E1" aria-hidden="true">
      <path d="M23.559 10.856c-.548-2.725-2.518-4.892-5.103-5.637-1.035-.32-2.13-.42-3.2-.3-.15-1.07-.45-2.12-1.05-3.03-.9-1.44-2.37-2.43-4.02-2.73-1.65-.3-3.36.05-4.77 1.02-1.41.97-2.37 2.49-2.67 4.17-.3 1.68.05 3.42.98 4.83.93 1.41 2.37 2.37 4.02 2.67.3.05.6.08.9.1-.6 1.35-.75 2.85-.45 4.29.3 1.44 1.05 2.76 2.13 3.78 1.08 1.02 2.46 1.65 3.93 1.8 1.47.15 2.97-.15 4.26-.87 1.29-.72 2.31-1.83 2.91-3.15.6-1.32.75-2.79.45-4.2-.3-1.41-1.05-2.7-2.13-3.69-.45-.42-.96-.78-1.5-1.08.75-.9 1.2-2.07 1.26-3.27.06-1.2-.27-2.4-1.02-3.36z" />
    </svg>
  )
}

function WordPressIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#21759B" aria-hidden="true">
      <path d="M21.469 12c0 5.24-4.26 9.469-9.469 9.469-5.24 0-9.469-4.229-9.469-9.469 0-5.24 4.229-9.469 9.469-9.469 5.209 0 9.469 4.229 9.469 9.469zm-9.469-7.5c-4.14 0-7.5 3.36-7.5 7.5s3.36 7.5 7.5 7.5 7.5-3.36 7.5-7.5-3.36-7.5-7.5-7.5zm3.75 11.25h-1.5v-3.75h-3v3.75h-1.5v-9h1.5v3.75h3v-3.75h1.5v9z" />
    </svg>
  )
}

function WebflowIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#146EF5" aria-hidden="true">
      <path d="M17.802 8.56l-2.364 8.88H12.45l-1.59-5.97-1.59 5.97H6.54L4.176 8.56h2.07l1.41 5.88 1.65-5.88h2.01l1.65 5.88 1.41-5.88h2.07z" />
    </svg>
  )
}

function VercelIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2L2 19.5h20L12 2z" />
    </svg>
  )
}

function AwsIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#FF9900" aria-hidden="true">
      <path d="M6.763 15.64c.34.19.69.37 1.05.53.36.16.73.3 1.11.42.38.12.77.21 1.17.27.4.06.81.09 1.23.09.62 0 1.19-.08 1.71-.24.52-.16.97-.39 1.35-.69.38-.3.68-.66.9-1.08.22-.42.33-.89.33-1.41 0-.5-.1-.93-.3-1.29-.2-.36-.47-.68-.81-.96-.34-.28-.74-.54-1.2-.78-.46-.24-.96-.48-1.5-.72-.7-.32-1.32-.64-1.86-.96-.54-.32-1-.66-1.38-1.02-.38-.36-.67-.76-.87-1.2-.2-.44-.3-.94-.3-1.5 0-.56.12-1.07.36-1.53.24-.46.57-.85.99-1.17.42-.32.91-.57 1.47-.75.56-.18 1.17-.27 1.83-.27.64 0 1.24.08 1.8.24.56.16 1.07.38 1.53.66l-.72 1.56c-.4-.22-.82-.41-1.26-.57-.44-.16-.92-.24-1.44-.24-.48 0-.9.07-1.26.21-.36.14-.66.33-.9.57-.24.24-.36.52-.36.84 0 .34.1.63.3.87.2.24.47.47.81.69.34.22.74.44 1.2.66.7.32 1.32.66 1.86 1.02.54.36.99.76 1.35 1.2.36.44.63.94.81 1.5.18.56.27 1.2.27 1.92 0 .62-.12 1.19-.36 1.71-.24.52-.58.97-1.02 1.35-.44.38-.97.68-1.59.9-.62.22-1.32.33-2.1.33-.72 0-1.41-.1-2.07-.3-.66-.2-1.27-.47-1.83-.81l.78-1.68z" />
    </svg>
  )
}
