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

  const cycleDuration = 5
  const staggerDelay = 1
  const pauseDuration = 2
  const lastItemAnimationFinishTime = 2
  const totalCycleDuration = (textOptions.length - 1) * staggerDelay + lastItemAnimationFinishTime + pauseDuration

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.textWrapper}>
          <p className={styles.introText}>
            Building modern websites for
          </p>
          <div className={styles.droppingTexts}>
            {textOptions.map((text, index) => {
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
