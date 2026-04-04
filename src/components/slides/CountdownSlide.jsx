import React, { useEffect } from 'react'
import { useSanctuaryStore } from '../../store/sanctuaryStore'

export default function CountdownSlide({ slide }) {
  const { countdownRemaining, initCountdown } = useSanctuaryStore()
  const {
    message = 'Service begins in',
    subMessage = 'Welcome — please be seated',
    durationMinutes = 5,
    bgColor = '#000000',
    accentColor = '#4a9edd',
    bgImageUrl = null,
    bgOverlayOpacity = 0.6,
    timerStyle = 'default',
  } = slide

  useEffect(() => {
    if (countdownRemaining[slide.id] === undefined) initCountdown(slide.id, durationMinutes)
  }, [slide.id, durationMinutes])

  const remaining = countdownRemaining[slide.id] ?? durationMinutes * 60
  const minutes = Math.floor(remaining / 60)
  const seconds = remaining % 60
  const timeStr = `${minutes}:${String(seconds).padStart(2, '0')}`
  const isExpired = remaining <= 0

  return <CountdownRenderer slide={slide} timeStr={timeStr} isExpired={isExpired} remaining={remaining} />
}

// Shared renderer — used by both CountdownSlide (operator) and ProjectorCountdown (projector)
export function CountdownRenderer({ slide, timeStr, isExpired }) {
  const {
    message = 'Service begins in',
    subMessage = 'Welcome — please be seated',
    bgColor = '#000000',
    accentColor = '#4a9edd',
    bgImageUrl = null,
    bgOverlayOpacity = 0.6,
    timerStyle = 'default',
  } = slide

  const style = (timerStyle || 'default').toLowerCase()
  const bg = bgImageUrl ? `url(${bgImageUrl}) center/cover no-repeat` : bgColor

  const baseStyle = {
    width: '100%', height: '100%',
    background: bg,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Inter', sans-serif",
    position: 'relative', overflow: 'hidden',
  }

  const overlay = bgImageUrl && (
    <div style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${bgOverlayOpacity})`, zIndex: 0 }} />
  )

  // ── Band style ─────────────────────────────────────────────────────────────
  if (style === 'band') {
    return (
      <div style={baseStyle}>
        {overlay}
        <div style={{
          position: 'relative', zIndex: 2,
          background: 'rgba(0,0,0,0.52)',
          padding: '4% 0', width: '100%', textAlign: 'center',
        }}>
          {message && (
            <div style={{
              fontSize: '3cqh', color: `${accentColor}99`,
              letterSpacing: '0.2em', textTransform: 'uppercase',
              fontWeight: 500, marginBottom: '1%',
            }}>{message}</div>
          )}
          <div style={{
            fontSize: '22cqh', fontWeight: 900,
            color: isExpired ? '#cc4444' : accentColor,
            letterSpacing: '0.04em',
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 1,
          }}>
            {isExpired ? '—' : timeStr}
          </div>
          {subMessage && (
            <div style={{
              fontSize: '2.2cqh', color: `${accentColor}66`,
              letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: '1%',
            }}>{subMessage}</div>
          )}
        </div>
      </div>
    )
  }

  // ── Minimal style ──────────────────────────────────────────────────────────
  if (style === 'minimal') {
    return (
      <div style={baseStyle}>
        {overlay}
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{
            fontSize: '22cqh', fontWeight: 100,
            color: isExpired ? '#cc4444' : accentColor,
            letterSpacing: '0.15em', fontVariantNumeric: 'tabular-nums',
          }}>
            {isExpired ? '—' : timeStr}
          </div>
          {message && (
            <div style={{
              fontSize: '2.5cqh', color: `${accentColor}66`,
              letterSpacing: '0.25em', textTransform: 'uppercase',
              fontWeight: 300, marginTop: '2%',
            }}>{message}</div>
          )}
        </div>
      </div>
    )
  }

  // ── Default style ──────────────────────────────────────────────────────────
  return (
    <div style={{ ...baseStyle, flexDirection: 'column', gap: '2%' }}>
      {overlay}
      {message && (
        <div style={{
          position: 'relative', zIndex: 1,
          fontSize: '3.5cqh', color: `${accentColor}88`,
          letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 400,
        }}>{message}</div>
      )}
      <div style={{
        position: 'relative', zIndex: 1,
        fontSize: '18cqh', fontWeight: 200,
        color: isExpired ? '#cc4444' : accentColor,
        letterSpacing: '0.04em', fontVariantNumeric: 'tabular-nums', lineHeight: 1,
        transition: 'color 0.5s ease',
      }}>
        {isExpired ? '—' : timeStr}
      </div>
      {subMessage && (
        <div style={{
          position: 'relative', zIndex: 1,
          fontSize: '2.5cqh', color: `${accentColor}44`,
          letterSpacing: '0.18em', textTransform: 'uppercase',
        }}>{subMessage}</div>
      )}
    </div>
  )
}
