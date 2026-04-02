import React from 'react'

export default function ImageSlide({ slide }) {
  const {
    images = [],
    currentIndex = 0,
    imageDataUrl = null,
    caption = '',
  } = slide

  const allImages = images.length > 0 ? images
    : imageDataUrl ? [{ dataUrl: imageDataUrl, caption }]
    : []

  const current = allImages[Math.min(currentIndex, allImages.length - 1)] || allImages[0] || null

  if (!current) {
    return (
      <div style={{
        width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: "url('./backgrounds/bg-announcement.jpg')",
          backgroundSize: 'cover', backgroundPosition: 'center',
          filter: 'blur(8px) brightness(0.4)', transform: 'scale(1.05)',
        }} />
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          color: 'rgba(255,255,255,0.3)', fontFamily: 'Inter,sans-serif',
          fontSize: '2.5cqh', zIndex: 2,
        }}>Add images in Edit mode</div>
      </div>
    )
  }

  return (
    <div style={{
      width: '100%', height: '100%',
      position: 'relative', overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter', sans-serif",
    }}>
      {/* Blurred bokeh background */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: "url('./backgrounds/bg-announcement.jpg')",
        backgroundSize: 'cover', backgroundPosition: 'center',
        filter: 'blur(0px) brightness(0.85)',
        zIndex: 0,
      }} />

      {/* Dark overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,0.48)',
        zIndex: 1,
      }} />

      {/* Church name */}
      <div style={{
        position: 'absolute', top: '3%', left: '3.5%',
        fontSize: '1.3cqh', fontWeight: 600,
        color: 'rgba(255,255,255,0.28)',
        letterSpacing: '0.22em', textTransform: 'uppercase', zIndex: 3,
      }}>
        The Floodgates Church
      </div>

      {/* Full person photo — contain so nothing is cut off */}
      <img
        src={current.dataUrl}
        alt=""
        style={{
          position: 'relative', zIndex: 2,
          maxHeight: current.caption ? '76%' : '88%',
          maxWidth: '56%',
          objectFit: 'contain',
          display: 'block',
          borderRadius: '4px',
          boxShadow: '0 16px 80px rgba(0,0,0,0.95), 0 4px 20px rgba(0,0,0,0.8)',
        }}
      />

      {/* Black pill caption */}
      {current.caption && (
        <div style={{
          position: 'absolute',
          bottom: '5%',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 4,
        }}>
          <div style={{
            background: 'rgba(0,0,0,0.80)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '50px',
            padding: '1.1cqh 3.2cqh',
            color: '#ffffff',
            fontSize: '2.8cqh',
            fontWeight: 700,
            letterSpacing: '0.01em',
            textShadow: '0 1px 6px rgba(0,0,0,0.9)',
            whiteSpace: 'nowrap',
            fontFamily: "'Inter', sans-serif",
          }}>
            {current.caption}
          </div>
        </div>
      )}

      {/* Slide counter */}
      {allImages.length > 1 && (
        <div style={{
          position: 'absolute',
          bottom: current.caption ? '14%' : '2.5%',
          right: '2.5%',
          background: 'rgba(0,0,0,0.65)',
          color: 'rgba(255,255,255,0.75)',
          fontSize: '1.8cqh', fontWeight: 600,
          padding: '0.5% 1.5%', borderRadius: '20px', zIndex: 5,
        }}>
          {currentIndex + 1} / {allImages.length}
        </div>
      )}
    </div>
  )
}
