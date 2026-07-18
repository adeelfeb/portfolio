'use client'
export default function TextureOverlay({ opacity = 0.08, className = '' }) {
  return (
    <div
      className={`absolute inset-0 w-full h-full bg-cover bg-center pointer-events-none ${className}`}
      style={{
        backgroundImage: `url(/images/hero-texture.webp)`,
        opacity,
      }}
      aria-hidden
    />
  )
}
