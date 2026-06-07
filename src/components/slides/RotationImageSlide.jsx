import React, { useState, useEffect, useRef } from 'react'

export default function RotationImageSlide({ slide, mini = false }) {
  const { images = [], intervalSeconds = 7 } = slide
  const [currentIdx, setCurrentIdx] = useState(0)
  const [fading, setFading] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    if (mini || images.length <= 1) return
    const advance = () => {
      setFading(true)
      setTimeout(() => {
        setCurrentIdx(i => (i + 1) % images.length)
        setFading(false)
      }, 500)
    }
    timerRef.current = setInterval(advance, intervalSeconds * 1000)
    return () => clearInterval(timerRef.current)
  }, [images.length, intervalSeconds, mini])

  // Reset index when images change (e.g. new rotation item goes live)
  useEffect(() => { setCurrentIdx(0) }, [slide.id])

  if (!images.length) {
    return (
      <div style={{
        width: '100%', height: '100%', background: '#0a0a14',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1cqh',
      }}>
        <div style={{ fontSize: mini ? '2.5cqh' : '5cqh', color: 'rgba(255,255,255,0.15)' }}>⟳</div>
        {!mini && <div style={{ fontSize: '1.6cqh', color: 'rgba(255,255,255,0.25)' }}>No images in rotation</div>}
      </div>
    )
  }

  const displayIdx = mini ? 0 : currentIdx
  const img = images[Math.min(displayIdx, images.length - 1)]

  return (
    <div style={{ width: '100%', height: '100%', background: '#000', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <img
        src={img.dataUrl}
        alt=""
        style={{
          width: '100%', height: '100%', objectFit: 'contain',
          opacity: fading ? 0 : 1,
          transition: fading ? 'opacity 0.5s ease-out' : 'opacity 0.5s ease-in',
        }}
      />
    </div>
  )
}
