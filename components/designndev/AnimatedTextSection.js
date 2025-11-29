'use client'

import styles from './AnimatedTextSection.module.css'

export default function AnimatedTextSection() {
  const textOptions = [
    'Startups',
    'Businesses',
    'Tech Ideas',
    'E-commerce',
    'Everyone'
  ]

  // Animation timing - matching reference code exactly
  // Each item uses 5s duration, staggered by 1s delay (like reference: 0s, 1s, 2s, 3s)
  // Regular items (roll): appear at 3-5%, visible until 20%, disappear by 27% (1.35s)
  // Last item "Everyone" (roll2): visible until 30% (1.5s), disappears by 37% (1.85s)
  const cycleDuration = 5 // seconds for one complete cycle per item (matches reference)
  const staggerDelay = 1 // seconds between each item (matches reference exactly)
  const pauseDuration = 2 // seconds to pause after last item completes before repeating
  // Calculate total cycle: last item starts at (length-1)*staggerDelay, finishes animation at 40% of cycleDuration (2s), then pause
  // Last item finishes at: (length-1)*staggerDelay + 2s, then add pause duration
  const lastItemAnimationFinishTime = 2 // seconds (40% of 5s cycle)
  const totalCycleDuration = (textOptions.length - 1) * staggerDelay + lastItemAnimationFinishTime + pauseDuration

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.textWrapper}>
          <p className={styles.introText}>
            Build fast, smart and more efficient website for
          </p>
          <div className={styles.droppingTexts}>
            {textOptions.map((text, index) => {
              // Calculate delay for each item
              const delay = index * staggerDelay
              const isLast = index === textOptions.length - 1
              
              return (
                <div
                  key={`${text}-${index}`}
                  className={isLast ? styles.lastItem : styles.item}
                  style={{
                    animationDelay: `${delay}s`,
                    animationDuration: `${totalCycleDuration}s`
                  }}
                >
                  {text}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

