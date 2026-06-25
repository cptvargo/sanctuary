import React, { useState, useEffect, useRef } from 'react'

function formatCountdown(seconds) {
  if (seconds == null || seconds < 0) return null
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function RotationImageSlide({ slide, mini = false, countdownRemaining }) {
  const {
    images = [], intervalSeconds = 7,
    countdownEnabled = false, countdownMessage = 'Service begins in', countdownPosition = 'top',
  } = slide
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

  const fadeStyle = {
    opacity: fading ? 0 : 1,
    transition: fading ? 'opacity 0.5s ease-out' : 'opacity 0.5s ease-in',
  }

  const timeStr = formatCountdown(countdownRemaining)
  const showCountdown = !mini && countdownEnabled && timeStr !== null

  const countdownBar = showCountdown && (
    <div style={{
      background: '#000', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: '2.5cqh', padding: '2.2cqh 0',
    }}>
      {countdownMessage && (
        <span style={{
          fontSize: '2.8cqh', color: 'rgba(255,255,255,0.65)',
          letterSpacing: '0.18em', textTransform: 'uppercase',
          fontFamily: "'Inter', sans-serif", fontWeight: 400,
        }}>
          {countdownMessage}
        </span>
      )}
      <span style={{
        fontSize: '6.5cqh', fontWeight: 700, color: '#ffffff',
        fontVariantNumeric: 'tabular-nums', letterSpacing: '0.04em',
        fontFamily: "'Inter', sans-serif",
        textShadow: '0 2px 12px rgba(0,0,0,0.8)',
      }}>
        {timeStr}
      </span>
    </div>
  )

  return (
    <div style={{
      width: '100%', height: '100%', background: '#000', overflow: 'hidden',
      display: 'flex', flexDirection: countdownPosition === 'top' ? 'column' : 'column-reverse',
    }}>
      {countdownBar}
      {/* Image area fills remaining space — nothing is blocked */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {/* Blurred fill */}
        <img
          src={img.dataUrl}
          alt=""
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', filter: 'blur(40px)', transform: 'scale(1.1)',
            opacity: fading ? 0 : 0.3,
            transition: fading ? 'opacity 0.5s ease-out' : 'opacity 0.5s ease-in',
          }}
        />
        {/* Main image */}
        <img
          src={img.dataUrl}
          alt=""
          style={{
            position: 'relative', width: '100%', height: '100%',
            objectFit: 'contain', ...fadeStyle,
          }}
        />
      </div>
    </div>
  )
}
