'use client'

import { motion } from 'framer-motion'
import { Star, CheckCircle, PenTool, LayoutTemplate, ArrowRight, Save, Shield } from 'lucide-react'
import Link from 'next/link'

export default function NewYearResolution() {
  const features = [
    {
      icon: PenTool,
      title: 'Write & Personalize',
      description: 'Draft your resolutions in a clean, distraction-free environment.',
    },
    {
      icon: LayoutTemplate,
      title: 'Use Templates',
      description: 'Stuck? Choose from our curated list of resolution templates.',
    },
    {
      icon: Save,
      title: 'Save to Dashboard',
      description: 'Your goals are saved securely to your private dashboard.',
    },
    {
      icon: Shield,
      title: '100% Free & Private',
      description: 'We respect your privacy. Your resolutions are for your eyes only.',
    }
  ]

  const templates = [
    {
      title: 'Health & Wellness',
      items: ['Run 5km weekly', 'Drink 2L water daily', 'Sleep 8 hours'],
      color: 'bg-green-50 text-green-700',
      border: 'border-green-200'
    },
    {
      title: 'Career Growth',
      items: ['Learn a new skill', 'Update portfolio', 'Network monthly'],
      color: 'bg-blue-50 text-blue-700',
      border: 'border-blue-200'
    },
    {
      title: 'Financial Goals',
      items: ['Save 20% of income', 'Start investing', 'Track expenses'],
      color: 'bg-purple-50 text-purple-700',
      border: 'border-purple-200'
    },
    {
      title: 'Personal Development',
      items: ['Read 1 book/month', 'Meditate daily', 'Learn a language'],
      color: 'bg-orange-50 text-orange-700',
      border: 'border-orange-200'
    }
  ]

  return (
    <div className="bg-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-purple-100 blur-3xl opacity-50"></div>
          <div className="absolute top-20 -left-20 w-72 h-72 rounded-full bg-blue-100 blur-3xl opacity-50"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-100 text-purple-700 mb-8">
                <Star className="w-4 h-4 fill-purple-700" />
                <span className="text-sm font-semibold uppercase tracking-wide">New Year, New You</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 mb-8">
                Make Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">New Year Resolutions</span> Stick
              </h1>
              
              <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                A dedicated, free space to define, track, and achieve your goals for the year ahead. 
                Start with a clear vision and keep yourself accountable.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/login?redirect=/dashboard" className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white transition-all duration-200 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 no-underline">
                  Start Your Resolution
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
                <a href="#how-it-works" className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-gray-700 transition-all duration-200 bg-white border border-gray-200 rounded-full hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 no-underline">
                  How it Works
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Simple, Effective, Free</h2>
            <p className="text-lg text-gray-600">Turn your aspirations into a structured plan in minutes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6 text-blue-600">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Templates Preview Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Start with a <span className="text-purple-600">Template</span>
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Don't know where to start? We've curated a collection of popular and effective resolutions categories. 
                Select one, customize it to your needs, and save it to your dashboard instantly.
              </p>
              <ul className="space-y-4 mb-8">
                {['Pre-filled templates for every goal', 'Fully editable content', 'Track progress easily'].map((item) => (
                  <li key={item} className="flex items-center text-gray-700">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/login?redirect=/dashboard" className="text-blue-600 font-semibold hover:text-blue-700 inline-flex items-center transition-colors no-underline">
                View all templates <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {templates.map((template, index) => (
                <motion.div
                  key={template.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`p-6 rounded-2xl border ${template.border} ${template.color} transition-transform hover:-translate-y-1`}
                >
                  <h3 className="font-bold mb-4">{template.title}</h3>
                  <ul className="space-y-2">
                    {template.items.map((item) => (
                      <li key={item} className="flex items-start text-sm opacity-90">
                        <span className="mr-2">•</span> {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-900 to-purple-900 text-white overflow-hidden relative">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-20 transform -translate-x-1/2 translate-y-1/2"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Own This Year?</h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Join thousands of others who are turning their dreams into actionable plans. It's free, easy, and impactful.
          </p>
          <Link href="/login?redirect=/dashboard" className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-blue-900 transition-all duration-200 bg-white rounded-full hover:bg-blue-50 hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white no-underline">
            Create My Resolution
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>
    </div>
  )
}

