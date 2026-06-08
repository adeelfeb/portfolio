'use client'

import Image from 'next/image'

function isBase64Image(src) {
  return typeof src === 'string' && src.startsWith('data:image')
}

function isExternalUrl(src) {
  return typeof src === 'string' && (src.startsWith('http://') || src.startsWith('https://'))
}

export default function PortfolioImage({ src, alt, fill, className = '', width, height, loading = 'lazy' }) {
  if (!src) return null

  if (isBase64Image(src) || isExternalUrl(src) || (!src.startsWith('/'))) {
    if (fill) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className={`absolute inset-0 w-full h-full ${className}`} loading={loading} />
      )
    }
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} width={width} height={height} className={className} loading={loading} />
    )
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={className}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        loading={loading}
        priority={loading === 'eager'}
      />
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width || 400}
      height={height || 300}
      className={className}
      loading={loading}
    />
  )
}
