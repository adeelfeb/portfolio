'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart, Link2, Mail, Palette, ArrowRight, Sparkles, Gift } from 'lucide-react'
import Link from 'next/link'

const VALENTINES_DAY = new Date(2026, 1, 14) // Feb 14, 2026
const CONTEST_MAX_LENGTH = 500
const CONTEST_MIN_LENGTH = 20

// Floating heart for background decoration
function FloatingHeart({ delay = 0, size = 24, x = '0%', y = '0%' }) {
  return (
    <motion.div
      className="absolute text-rose-300/40 pointer-events-none"
      style={{ left: x, top: y, width: size, height: size }}
      initial={{ opacity: 0, y: 0 }}
      animate={{
        opacity: [0.2, 0.5, 0.2],
        y: [0, -12, 0],
      }}
      transition={{
        duration: 4,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <Heart className="w-full h-full fill-current" />
    </motion.div>
  )
}

function getCountdown(target) {
  const now = new Date()
  const diff = Math.max(0, target.getTime() - now.getTime())
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  return { days, hours, minutes, seconds }
}

const INITIAL_COUNTDOWN = { days: 0, hours: 0, minutes: 0, seconds: 0 }

export default function Valentine() {
  const [countdown, setCountdown] = useState(INITIAL_COUNTDOWN)
  const [featuredMessage, setFeaturedMessage] = useState(null)
  const [contestMessage, setContestMessage] = useState('')
  const [contestSubmitting, setContestSubmitting] = useState(false)
  const [contestSuccess, setContestSuccess] = useState(false)
  const [contestError, setContestError] = useState('')

  const countdownOver = countdown.days === 0 && countdown.hours === 0 && countdown.minutes === 0 && countdown.seconds === 0

  useEffect(() => {
    setCountdown(getCountdown(VALENTINES_DAY))
    const t = setInterval(() => setCountdown(getCountdown(VALENTINES_DAY)), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    let cancelled = false
    fetch('/api/valentine/contest/featured')
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data.success && data.data?.hasFeatured && data.data?.message) {
          setFeaturedMessage(data.data.message)
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!contestError) return
    const id = setTimeout(() => setContestError(''), 8000)
    return () => clearTimeout(id)
  }, [contestError])

  function containsUrl(text) {
    if (!text || typeof text !== 'string') return false
    const t = text.trim()
    if (!t) return false
    if (/https?:\/\//i.test(t)) return true
    if (/\bwww\./i.test(t)) return true
    if (/\b[a-z0-9][-a-z0-9]*\.(com|org|net|io|co|uk|me|info|biz)\b/i.test(t)) return true
    return false
  }

  async function handleContestSubmit(e) {
    e.preventDefault()
    const msg = contestMessage.trim()
    if (msg.length < CONTEST_MIN_LENGTH) {
      setContestError(`Please write at least ${CONTEST_MIN_LENGTH} characters.`)
      return
    }
    if (containsUrl(msg)) {
      setContestError('Messages cannot contain links or URLs. Please write a short romantic message only.')
      return
    }
    setContestSubmitting(true)
    setContestError('')
    setContestSuccess(false)
    try {
      const res = await fetch('/api/valentine/contest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg.slice(0, CONTEST_MAX_LENGTH) }),
      })
      const data = await res.json()
      if (data.success) {
        setContestSuccess(true)
        setContestMessage('')
      } else {
        setContestError(data.message || 'Something went wrong. Please try again.')
      }
    } catch {
      setContestError('Something went wrong. Please try again.')
    } finally {
      setContestSubmitting(false)
    }
  }

  const features = [
    {
      icon: Link2,
      title: 'Your own link',
      description: 'Create a unique, shareable link that opens a personal page just for your special someone.',
    },
    {
      icon: Mail,
      title: 'Custom message',
      description: 'Write a heartfelt message, "Will you be my Valentine?", or a love letter they’ll never forget.',
    },
    {
      icon: Palette,
      title: 'Themes & style',
      description: 'Pick from romantic, classic, or minimal themes and colors so the page feels like you.',
    },
    {
      icon: Heart,
      title: 'Private & free',
      description: 'No ads, no tracking of your message. Just a beautiful page for the one you love.',
    },
  ]

  const messageIdeas = [
    {
      title: 'Sweet & simple',
      examples: [
        'Happy Valentine’s Day to my favorite person. Life’s just better when you’re next to me.',
        'Every day with you is my favorite. Let’s make a million more of them.',
        "You're my happily ever after.",
      ],
    },
    {
      title: 'Romantic',
      examples: [
        "I'd choose you in every lifetime. Over and over. Happy Valentine's Day.",
        'You may hold my hand for a while, but you hold my heart forever.',
        'Every love story is beautiful but ours is my favorite.',
      ],
    },
    {
      title: 'Ask the question',
      examples: [
        "Will you be my Valentine? I've been hoping you'd say yes.",
        "I made something just for you. Will you be my Valentine?",
        'There’s no one else I’d rather spend Valentine’s with. Be mine?',
      ],
    },
  ]

  return (
    <div className="bg-white overflow-hidden">
      {/* Hero with animated background */}
      <section className="relative pt-20 sm:pt-24 lg:pt-28 pb-16 sm:pb-20 lg:pb-28 min-h-0 flex items-center">
        {/* Animated gradient background */}
        <div className="absolute inset-0 overflow-hidden valentine-hero-bg" aria-hidden>
          <div className="absolute inset-0 valentine-gradient-shift" />
          <div className="absolute -top-40 -right-40 w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-rose-200/60 blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute top-1/3 -left-20 w-56 sm:w-72 h-56 sm:h-72 rounded-full bg-pink-200/50 blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '0.5s' }} />
          <div className="absolute bottom-20 right-1/4 w-48 h-48 rounded-full bg-rose-100/50 blur-2xl animate-pulse" style={{ animationDuration: '3.5s', animationDelay: '1s' }} />
          <FloatingHeart delay={0} size={20} x="10%" y="15%" />
          <FloatingHeart delay={1.2} size={16} x="85%" y="20%" />
          <FloatingHeart delay={0.6} size={14} x="75%" y="70%" />
          <FloatingHeart delay={2} size={18} x="15%" y="65%" />
          <FloatingHeart delay={1.5} size={12} x="50%" y="85%" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full py-6">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: { staggerChildren: 0.08, delayChildren: 0.1 },
                },
              }}
              className="relative"
            >
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 12, scale: 0.98 },
                  visible: { opacity: 1, y: 0, scale: 1 },
                }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/80 sm:bg-rose-50 border border-rose-100 text-rose-700 mb-6 sm:mb-8 shadow-sm"
              >
                <Heart className="w-4 h-4 fill-rose-500 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-semibold uppercase tracking-wide">Valentine’s Day</span>
              </motion.div>

              <motion.h1
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 mb-6 sm:mb-8 leading-tight px-1"
              >
                A personal link for{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 bg-[length:200%_auto] animate-gradient-x">
                  someone you love
                </span>
              </motion.h1>

              <motion.p
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 sm:mb-10 leading-relaxed max-w-2xl mx-auto px-1"
              >
                Create a beautiful, one-of-a-kind page with your message—ask them to be your Valentine,
                share a love letter, or tell them how much they mean to you. One link, one moment, all yours.
              </motion.p>

              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center items-center"
              >
                <Link
                  href="/login?redirect=/dashboard#valentine-urls"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold text-white transition-all duration-200 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full hover:shadow-lg hover:shadow-rose-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 no-underline"
                >
                  Create my Valentine link
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 flex-shrink-0" />
                </Link>
                <a
                  href="#how-it-works"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold text-gray-700 transition-all duration-200 bg-white/90 border border-gray-200 rounded-full hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 no-underline shadow-sm"
                >
                  How it works
                </a>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .valentine-hero-bg {
          background: linear-gradient(135deg, #fff5f5 0%, #ffe4ec 25%, #fce7f3 50%, #fdf2f8 75%, #fff5f5 100%);
          background-size: 400% 400%;
          animation: valentineGradient 12s ease infinite;
        }
        @keyframes valentineGradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .valentine-gradient-shift {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          animation: valentineShine 8s ease-in-out infinite;
        }
        @keyframes valentineShine {
          0%, 100% { opacity: 0; transform: translateX(-100%); }
          50% { opacity: 1; transform: translateX(100%); }
        }
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          animation: gradient-x 6s ease infinite;
        }
      `}</style>

      {/* Contest banner: countdown + featured message contest */}
      <section id="contest" className="relative py-16 sm:py-20 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(160deg, #fef2f2 0%, #fce7f3 40%, #fdf2f8 100%)' }}
          aria-hidden
        />
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(251, 207, 232, 0.4), transparent)' }}
          aria-hidden
        />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 border border-rose-200 text-rose-700 mb-6 shadow-sm">
              <Gift className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">Valentine&apos;s Day — February 14, 2026</span>
            </div>

            {countdownOver ? (
              <>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                  Happy Valentine&apos;s Day!
                </h2>
                {featuredMessage ? (
                  <div className="max-w-2xl mx-auto mb-8 p-6 rounded-2xl bg-white/95 border border-pink-200 shadow-md text-left">
                    <p className="text-sm font-semibold text-rose-600 uppercase tracking-wide mb-2">Featured message</p>
                    <p className="text-lg text-gray-800 leading-relaxed whitespace-pre-wrap">{featuredMessage}</p>
                  </div>
                ) : (
                  <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                    We&apos;re still choosing a featured message. Check back soon—or enjoy the day with someone you love!
                  </p>
                )}
              </>
            ) : (
              <>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                  Countdown to Valentine&apos;s Day
                </h2>
                <div className="flex flex-wrap justify-center gap-3 sm:gap-6 mb-8">
                  <div className="flex flex-col items-center min-w-[4rem] py-3 px-4 bg-white/90 border border-pink-200/60 rounded-xl shadow-sm">
                    <span className="text-2xl font-bold text-rose-700 leading-tight">{String(countdown.days).padStart(2, '0')}</span>
                    <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-rose-800 mt-1">Days</span>
                  </div>
                  <div className="flex flex-col items-center min-w-[4rem] py-3 px-4 bg-white/90 border border-pink-200/60 rounded-xl shadow-sm">
                    <span className="text-2xl font-bold text-rose-700 leading-tight">{String(countdown.hours).padStart(2, '0')}</span>
                    <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-rose-800 mt-1">Hours</span>
                  </div>
                  <div className="flex flex-col items-center min-w-[4rem] py-3 px-4 bg-white/90 border border-pink-200/60 rounded-xl shadow-sm">
                    <span className="text-2xl font-bold text-rose-700 leading-tight">{String(countdown.minutes).padStart(2, '0')}</span>
                    <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-rose-800 mt-1">Min</span>
                  </div>
                  <div className="flex flex-col items-center min-w-[4rem] py-3 px-4 bg-white/90 border border-pink-200/60 rounded-xl shadow-sm">
                    <span className="text-2xl font-bold text-rose-700 leading-tight">{String(countdown.seconds).padStart(2, '0')}</span>
                    <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-rose-800 mt-1">Sec</span>
                  </div>
                </div>
                {featuredMessage && (
                  <div className="max-w-2xl mx-auto mb-6 p-4 rounded-xl bg-white/90 border border-pink-200 text-left">
                    <p className="text-xs font-semibold text-rose-600 uppercase tracking-wide mb-1">Current featured message</p>
                    <p className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap line-clamp-3">{featuredMessage}</p>
                  </div>
                )}
                <p className="text-base sm:text-lg text-gray-700 mb-2 max-w-2xl mx-auto leading-relaxed">
                  The most romantic message will be featured on this page.
                </p>
                <p className="text-sm sm:text-base text-gray-600 mb-8 max-w-2xl mx-auto">
                  It will be chosen from all entries. Write a short message to your loved one below to enter the contest.
                </p>
              </>
            )}

            {!countdownOver && (
            <form onSubmit={handleContestSubmit} className="text-left max-w-[32rem] mx-auto">
              <label htmlFor="contest-message" className="block text-sm font-medium text-gray-700 mb-2">
                Your message to your loved one
              </label>
              <textarea
                id="contest-message"
                className="w-full py-3 px-4 border border-pink-200 rounded-xl text-base leading-relaxed text-gray-700 bg-white resize-y min-h-[100px] placeholder:text-gray-400 focus:outline-none focus:border-pink-400 focus:ring-3 focus:ring-pink-200/50 transition-all"
                value={contestMessage}
                onChange={(e) => setContestMessage(e.target.value)}
                placeholder="Write something sweet and romantic..."
                maxLength={CONTEST_MAX_LENGTH}
                rows={4}
                disabled={contestSubmitting}
                required
              />
              <p className="text-xs text-gray-500 mb-3">
                {contestMessage.length}/{CONTEST_MAX_LENGTH} characters (min {CONTEST_MIN_LENGTH}). Messages are checked for appropriateness. Links and URLs are not allowed.
              </p>
              {contestError && (
                <p className="text-sm text-rose-600 mb-3" role="alert">
                  {contestError}
                </p>
              )}
              {contestSuccess && (
                <p className="text-sm text-teal-600 font-medium mb-3" role="status">
                  Thank you! Your message has been submitted.
                </p>
              )}
              <button
                type="submit"
                className="inline-flex items-center justify-center py-3 px-6 text-base font-semibold text-white bg-gradient-to-r from-rose-600 to-pink-500 rounded-full transition-all hover:opacity-95 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                disabled={contestSubmitting || contestMessage.trim().length < CONTEST_MIN_LENGTH}
              >
                {contestSubmitting ? 'Submitting…' : 'Enter the contest'}
              </button>
            </form>
            )}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 bg-gray-50/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How it works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Sign in, create your link in the dashboard, and share. Your recipient gets a private page with your message.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-rose-100 hover:shadow-md transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 mb-4">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Message ideas */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-rose-600 mb-4">
              <Sparkles className="w-5 h-5" />
              <span className="font-medium">What to write</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Message ideas for your link</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Use these as inspiration. The best messages are personal—add a memory, inside joke, or their name.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {messageIdeas.map((group, i) => (
              <motion.div
                key={group.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
              >
                <h3 className="text-lg font-semibold text-rose-700 mb-4">{group.title}</h3>
                <ul className="space-y-3">
                  {group.examples.map((text, j) => (
                    <li key={j} className="text-gray-600 text-sm leading-relaxed pl-3 border-l-2 border-rose-100">
                      "{text}"
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-rose-50 to-pink-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Ready to create your Valentine link?
          </h2>
          <p className="text-gray-600 mb-8">
            Sign in and go to Valentine Links in your dashboard. Add their name, your message, pick a theme—then share the link.
          </p>
          <Link
            href="/login?redirect=/dashboard#valentine-urls"
            className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-500 rounded-full hover:shadow-lg hover:shadow-rose-200 hover:scale-105 transition-all duration-200 no-underline"
          >
            Create my link
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>
    </div>
  )
}
