import React, { useEffect } from 'react'
import { useSanctuaryStore } from '../../store/sanctuaryStore'

// Keyframes for the animated countdown styles (names prefixed to avoid clashes)
const CD_KEYFRAMES = `
@keyframes cdDrift { from { transform: scale(1) translate3d(0,0,0); } to { transform: scale(1.06) translate3d(-1%,-0.6%,0); } }
@keyframes cdTwinkle { 0%,100% { opacity: 0.12; } 50% { opacity: 0.85; } }
@keyframes cdBreathe { 0%,100% { opacity: 0.55; transform: scale(1); } 50% { opacity: 1; transform: scale(1.08); } }
@keyframes cdSway { from { transform: rotate(-5deg); } to { transform: rotate(5deg); } }
`

function CountdownKeyframes() {
  return <style>{CD_KEYFRAMES}</style>
}

// Fraction of the countdown still remaining (1 = full, 0 = done), read from the m:ss string
function getFraction(timeStr, isExpired, durationMinutes) {
  const [m, s] = (timeStr || '').split(':').map(Number)
  if (isExpired || Number.isNaN(m) || Number.isNaN(s)) return 0
  return Math.min(1, Math.max(0, (m * 60 + s) / ((durationMinutes || 5) * 60)))
}

// Background photo as its own layer so it can drift slowly behind the timer
function DriftingBackground({ url, seconds = 70 }) {
  if (!url) return null
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 0,
      background: `url(${url}) center/cover no-repeat`,
      animation: `cdDrift ${seconds}s ease-in-out infinite alternate`,
      willChange: 'transform',
    }} />
  )
}

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
  const frac = getFraction(timeStr, isExpired, slide.durationMinutes)
  const [minPart, secPart] = (timeStr || '0:00').split(':')
  const textColor = isExpired ? '#cc4444' : accentColor
  const thin = "'Montserrat', 'Inter', 'Helvetica Neue', Arial, sans-serif"

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

  // ── He Is Risen style ────────────────────────────────────────────────────
  if (style === 'risen') {
    return (
      <div style={baseStyle}>
        {overlay}
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          {/* Top label */}
          {message && (
            <div style={{
              fontSize: '2.8cqh', fontWeight: 400,
              color: 'rgba(255,235,180,0.75)',
              fontFamily: "'Inter', sans-serif",
              letterSpacing: '0.35em', textTransform: 'uppercase',
              marginBottom: '2cqh',
            }}>{message}</div>
          )}
          {/* Gold timer */}
          <div style={{
            fontSize: '26cqh', fontWeight: 800,
            color: isExpired ? '#888' : '#f5c842',
            fontFamily: "'Inter', sans-serif",
            letterSpacing: '-0.02em',
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 1,
            WebkitTextStroke: '1px rgba(255,255,255,0.2)',
          }}>
            {isExpired ? '—' : timeStr}
          </div>
          {/* White letterbox banner */}
          {subMessage && (
            <div style={{
              marginTop: '3cqh',
              background: 'rgba(255,255,255,0.92)',
              padding: '1.4cqh 5cqh',
              display: 'inline-block',
            }}>
              <div style={{
                fontSize: '3.8cqh', fontWeight: 900,
                color: '#1a0e00',
                fontFamily: "'Inter', sans-serif",
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
              }}>
                {subMessage}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── Victorious style ──────────────────────────────────────────────────────
  if (style === 'victorious') {
    return (
      <div style={baseStyle}>
        {overlay}
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          {/* Big bold red numbers with white stroke */}
          <div style={{
            fontSize: '28cqh',
            fontWeight: 900,
            color: isExpired ? '#888' : '#e8140a',
            fontFamily: "'Inter', 'Arial Black', sans-serif",
            letterSpacing: '-0.02em',
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 1,
            WebkitTextStroke: '2px #ffffff',
            textShadow: '0 2px 0 rgba(0,0,0,0.15)',
          }}>
            {isExpired ? '—' : timeStr}
          </div>
          {/* White letterbox banner */}
          {message && (
            <div style={{
              marginTop: '3cqh',
              background: 'rgba(255,255,255,0.92)',
              padding: '1.2cqh 4cqh',
              display: 'inline-block',
            }}>
              <div style={{
                fontSize: '3.8cqh',
                fontWeight: 900,
                color: '#1a1a1a',
                fontFamily: "'Inter', 'Arial Black', sans-serif",
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
              }}>
                {message}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── Dawn style ─────────────────────────────────────────────────────────────
  // Left-aligned numerals low in the frame; a thin line fills along the bottom
  // while warm light creeps up from the horizon as service time approaches.
  if (style === 'dawn') {
    const elapsed = 1 - frac
    return (
      <div style={{ ...baseStyle, background: bgColor, justifyContent: 'flex-start' }}>
        <CountdownKeyframes />
        <DriftingBackground url={bgImageUrl} seconds={90} />
        {overlay}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1, opacity: elapsed * 0.9,
          transition: 'opacity 1s linear',
          background: 'linear-gradient(to top, rgba(255,150,90,0.38) 0%, rgba(255,110,120,0.16) 35%, transparent 70%)',
        }} />
        <div style={{ position: 'absolute', left: '8%', bottom: '15%', zIndex: 2 }}>
          {message && (
            <div style={{
              fontSize: '2.2cqh', color: `${accentColor}b3`, fontFamily: thin, fontWeight: 400,
              letterSpacing: '0.38em', textTransform: 'uppercase', marginBottom: '2cqh',
            }}>{message}</div>
          )}
          <div style={{
            fontSize: '24cqh', fontWeight: 200, color: textColor, fontFamily: thin,
            letterSpacing: '0.01em', fontVariantNumeric: 'tabular-nums', lineHeight: 1,
          }}>
            {isExpired ? '—' : timeStr}
          </div>
        </div>
        <div style={{ position: 'absolute', left: '8%', right: '8%', bottom: '7%', height: '0.18cqh', background: 'rgba(255,255,255,0.22)', zIndex: 2 }}>
          <div style={{ width: `${elapsed * 100}%`, height: '100%', background: textColor, position: 'relative', transition: 'width 1s linear' }}>
            <div style={{ position: 'absolute', right: '-0.5cqh', top: '-0.4cqh', width: '1cqh', height: '1cqh', borderRadius: '50%', background: textColor }} />
          </div>
        </div>
      </div>
    )
  }

  // ── Glow style ─────────────────────────────────────────────────────────────
  // Serif numerals with a slow, breathing candlelight glow behind them.
  if (style === 'glow') {
    return (
      <div style={baseStyle}>
        <CountdownKeyframes />
        {overlay}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, pointerEvents: 'none' }}>
          <div style={{
            width: '95cqh', height: '65cqh',
            background: 'radial-gradient(closest-side, rgba(255,190,100,0.26), rgba(255,150,60,0.10) 55%, transparent 78%)',
            animation: 'cdBreathe 7s ease-in-out infinite',
          }} />
        </div>
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {message && (
            <div style={{
              fontSize: '2.4cqh', color: `${accentColor}99`, fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontWeight: 400, letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '2cqh',
            }}>{message}</div>
          )}
          <div style={{
            fontSize: '27cqh', fontWeight: 300, color: textColor,
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            letterSpacing: '0.03em', fontVariantNumeric: 'lining-nums tabular-nums', lineHeight: 1,
            textShadow: '0 0 5cqh rgba(255,170,80,0.35)',
          }}>
            {isExpired ? '—' : timeStr}
          </div>
          <div style={{ width: '7cqh', height: '0.2cqh', background: 'rgba(240,178,75,0.6)', marginTop: '3cqh' }} />
        </div>
      </div>
    )
  }

  // ── Starfield style ────────────────────────────────────────────────────────
  // Wide-tracked light numerals in a quiet night sky with a few slowly twinkling stars.
  if (style === 'starfield') {
    const stars = Array.from({ length: 34 }, (_, i) => ({
      x: (i * 61.803) % 100,
      y: (i * 38.197 + ((i * i) % 7) * 9) % 100,
      size: 0.28 + (i % 4) * 0.12,
      delay: (i * 0.37) % 6,
      duration: 4 + (i % 5),
    }))
    return (
      <div style={{ ...baseStyle, background: bgColor }}>
        <CountdownKeyframes />
        <DriftingBackground url={bgImageUrl} seconds={120} />
        {overlay}
        {stars.map((st, i) => (
          <div key={i} style={{
            position: 'absolute', left: `${st.x}%`, top: `${st.y}%`, zIndex: 1,
            width: `${st.size}cqh`, height: `${st.size}cqh`, borderRadius: '50%', background: '#ffffff',
            animation: `cdTwinkle ${st.duration}s ease-in-out ${st.delay}s infinite`,
          }} />
        ))}
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          {message && (
            <div style={{
              fontSize: '2.2cqh', color: `${accentColor}99`, fontFamily: thin, fontWeight: 400,
              letterSpacing: '0.45em', textTransform: 'uppercase', marginBottom: '3cqh',
            }}>{message}</div>
          )}
          <div style={{
            fontSize: '21cqh', fontWeight: 200, color: textColor, fontFamily: thin,
            letterSpacing: '0.08em', fontVariantNumeric: 'tabular-nums', lineHeight: 1,
          }}>
            {isExpired ? '—' : timeStr}
          </div>
        </div>
      </div>
    )
  }

  // ── Rays style ─────────────────────────────────────────────────────────────
  // Warm numerals under golden light whose beams sway slowly.
  if (style === 'rays') {
    return (
      <div style={{ ...baseStyle, background: bgColor }}>
        <CountdownKeyframes />
        <DriftingBackground url={bgImageUrl} seconds={80} />
        {overlay}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1, mixBlendMode: 'screen', opacity: 0.8,
          transformOrigin: '50% 12%', animation: 'cdSway 18s ease-in-out infinite alternate',
          background: 'repeating-conic-gradient(from 150deg at 50% 12%, rgba(255,210,140,0) 0deg, rgba(255,210,140,0.09) 3deg, rgba(255,210,140,0) 6deg)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 12%, #000 0%, transparent 70%)',
          maskImage: 'radial-gradient(ellipse at 50% 12%, #000 0%, transparent 70%)',
        }} />
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          {message && (
            <div style={{
              fontSize: '2.4cqh', color: `${accentColor}cc`, fontFamily: thin, fontWeight: 500,
              letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '2.5cqh',
              textShadow: '0 1px 12px rgba(0,0,0,0.8)',
            }}>{message}</div>
          )}
          <div style={{
            fontSize: '24cqh', fontWeight: 300, color: textColor, fontFamily: thin,
            letterSpacing: '0.03em', fontVariantNumeric: 'tabular-nums', lineHeight: 1,
            textShadow: '0 2px 24px rgba(0,0,0,0.75), 0 0 6cqh rgba(0,0,0,0.5)',
          }}>
            {isExpired ? '—' : timeStr}
          </div>
        </div>
      </div>
    )
  }

  // ── Waves style ────────────────────────────────────────────────────────────
  // Minutes and seconds as two labelled blocks split by a thin divider.
  if (style === 'waves') {
    const block = (value, label) => (
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontSize: '24cqh', fontWeight: 200, color: textColor, fontFamily: thin,
          fontVariantNumeric: 'tabular-nums', lineHeight: 1, minWidth: '26cqh',
        }}>{value}</div>
        <div style={{
          fontSize: '2cqh', color: `${accentColor}99`, fontFamily: thin, fontWeight: 400,
          letterSpacing: '0.5em', textTransform: 'uppercase', marginTop: '2.5cqh', paddingLeft: '0.5em',
        }}>{label}</div>
      </div>
    )
    return (
      <div style={{ ...baseStyle, background: bgColor }}>
        <CountdownKeyframes />
        <DriftingBackground url={bgImageUrl} seconds={60} />
        {overlay}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: '7cqh' }}>
          {isExpired ? block('—', 'Starting') : (
            <>
              {block(minPart, 'Min')}
              <div style={{ width: '0.18cqh', height: '20cqh', background: `${accentColor}4d` }} />
              {block(secPart, 'Sec')}
            </>
          )}
        </div>
      </div>
    )
  }

  // ── Mist (ticks) style ─────────────────────────────────────────────────────
  // Centered numerals above a ruler of 60 ticks that fade out as time runs down.
  if (style === 'ticks') {
    const lit = Math.ceil(frac * 60)
    return (
      <div style={{ ...baseStyle, background: bgColor }}>
        <CountdownKeyframes />
        <DriftingBackground url={bgImageUrl} seconds={90} />
        {overlay}
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{
            fontSize: '22cqh', fontWeight: 200, color: textColor, fontFamily: thin,
            letterSpacing: '0.04em', fontVariantNumeric: 'tabular-nums', lineHeight: 1,
            textShadow: '0 2px 20px rgba(0,0,0,0.45)',
          }}>
            {isExpired ? '—' : timeStr}
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.85cqh', marginTop: '6cqh', height: '3.4cqh' }}>
            {Array.from({ length: 60 }, (_, i) => (
              <div key={i} style={{
                width: '0.16cqh', height: i % 5 === 0 ? '3.4cqh' : '1.8cqh',
                background: textColor, opacity: i < lit ? 0.9 : 0.14,
                transition: 'opacity 0.6s ease',
              }} />
            ))}
          </div>
          {message && (
            <div style={{
              fontSize: '2cqh', color: `${accentColor}b3`, fontFamily: thin, fontWeight: 400,
              letterSpacing: '0.4em', textTransform: 'uppercase', marginTop: '4cqh',
              textShadow: '0 1px 12px rgba(0,0,0,0.5)',
            }}>{message}</div>
          )}
        </div>
      </div>
    )
  }

  // ── Ring style ─────────────────────────────────────────────────────────────
  // Thin progress ring with a marker that travels clockwise from 9 o'clock as time elapses.
  if (style === 'ring') {
    const cx = 80, cy = 45, r = 27
    const theta = Math.PI + 2 * Math.PI * (1 - frac)
    const pt = (rad, a) => [cx + rad * Math.cos(a), cy + rad * Math.sin(a)]
    const [hx, hy] = pt(r, theta)
    const [ix, iy] = pt(r - 1.1, theta)
    const [ox, oy] = pt(r + 1.1, theta)
    const remainingArc = frac >= 0.999
      ? null
      : `M ${hx} ${hy} A ${r} ${r} 0 ${frac > 0.5 ? 1 : 0} 1 ${cx - r} ${cy}`
    const ringColor = isExpired ? '#cc4444' : accentColor
    return (
      <div style={baseStyle}>
        {!bgImageUrl && (
          <svg
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0, transform: 'translateZ(0)' }}
            viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice"
          >
            <filter id="sanctuary-ring-texture" x="0" y="0" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.035 0.06" numOctaves="4" seed="7" result="noise" />
              <feDiffuseLighting in="noise" surfaceScale="1.6" diffuseConstant="1" lightingColor="#9a9a9a">
                <feDistantLight azimuth="235" elevation="50" />
              </feDiffuseLighting>
              <feColorMatrix type="saturate" values="0" />
              <feComponentTransfer>
                <feFuncR type="linear" slope="0.2" />
                <feFuncG type="linear" slope="0.2" />
                <feFuncB type="linear" slope="0.21" />
              </feComponentTransfer>
            </filter>
            <rect width="160" height="90" filter="url(#sanctuary-ring-texture)" />
          </svg>
        )}
        {overlay}
        <svg
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}
          viewBox="0 0 160 90" preserveAspectRatio="xMidYMid meet"
        >
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="0.24" />
          {frac >= 0.999
            ? <circle cx={cx} cy={cy} r={r} fill="none" stroke={ringColor} strokeWidth="0.26" />
            : remainingArc && frac > 0.001 && <path d={remainingArc} fill="none" stroke={ringColor} strokeWidth="0.26" />}
          <line x1={ix} y1={iy} x2={ox} y2={oy} stroke={ringColor} strokeWidth="0.8" />
        </svg>
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <div style={{
            fontSize: '22cqh', fontWeight: 200,
            color: ringColor,
            letterSpacing: '0.02em', fontVariantNumeric: 'tabular-nums',
            lineHeight: 1, fontFamily: "'Montserrat', 'Inter', 'Helvetica Neue', Arial, sans-serif",
          }}>
            {isExpired ? '—' : timeStr}
          </div>
        </div>
      </div>
    )
  }

  // ── Circle style ───────────────────────────────────────────────────────────
  if (style === 'circle') {
    return (
      <div style={baseStyle}>
        {overlay}
        {/* Thin ring with tick marks at 12 and 6 o'clock */}
        <svg
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}
          viewBox="0 0 160 90"
          preserveAspectRatio="xMidYMid meet"
        >
          <circle cx="80" cy="45" r="33" fill="none" stroke="rgba(255,235,180,0.85)" strokeWidth="0.35" />
          <line x1="80" y1="12"   x2="80" y2="15.5" stroke="rgba(255,235,180,1)"    strokeWidth="0.6"  strokeLinecap="round" />
          <line x1="80" y1="78"   x2="80" y2="74.5" stroke="rgba(255,235,180,1)"    strokeWidth="0.6"  strokeLinecap="round" />
        </svg>
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{
            fontSize: '20cqh', fontWeight: 200,
            color: isExpired ? '#cc4444' : '#ffffff',
            letterSpacing: '0.06em', fontVariantNumeric: 'tabular-nums',
            lineHeight: 1, fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
            textShadow: '0 2px 12px rgba(0,0,0,0.9), 0 0 40px rgba(0,0,0,0.7)',
          }}>
            {isExpired ? '—' : timeStr}
          </div>
          {subMessage && (
            <div style={{
              fontSize: '2cqh', color: '#ffffff',
              letterSpacing: '0.32em', textTransform: 'uppercase',
              fontWeight: 500, marginTop: '3cqh',
              fontFamily: "'Inter', sans-serif",
              textShadow: '0 1px 10px rgba(0,0,0,0.95), 0 0 20px rgba(0,0,0,0.8)',
            }}>
              {subMessage}
            </div>
          )}
          <div style={{ width: '6cqh', height: '0.22cqh', background: 'rgba(240,178,75,0.7)', marginTop: '2cqh' }} />
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
