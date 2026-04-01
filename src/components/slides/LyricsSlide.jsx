import React from 'react'
import { FONT_OPTIONS } from './SmartMediaPresets'

export function sectionBadge(section = '') {
  const s = section.trim()
  if (!s) return ''
  const u = s.toUpperCase()
  if (/^CHORUS\s*(\d*)$/.test(u)) { const n = u.replace('CHORUS','').trim(); return n ? `C${n}` : 'C' }
  if (/^VERSE\s*(\d+)$/.test(u)) { const n = u.replace('VERSE','').trim(); return n ? `V${n}` : 'V' }
  if (/^BRIDGE\s*(\d*)$/.test(u)) { const n = u.replace('BRIDGE','').trim(); return n ? `B${n}` : 'B' }
  if (/^PRE.?CHORUS/.test(u)) return 'PC'
  if (/^INTRO/.test(u)) return 'I'
  if (/^OUTRO/.test(u)) return 'O'
  if (/^TAG/.test(u)) return 'T'
  if (/^HOOK/.test(u)) return 'H'
  return s.slice(0,2).toUpperCase()
}

const BADGE_COLORS = {
  C:'#ff9500', C1:'#ff9500', C2:'#ff9500', C3:'#ff9500',
  B:'#bf5af2', B2:'#bf5af2',
  PC:'#30d158', I:'#636366', O:'#636366', T:'#30d158', H:'#30d158',
}

function getBadgeColor(badge) {
  if (BADGE_COLORS[badge]) return BADGE_COLORS[badge]
  if (/^\d+$/.test(badge)) return '#7b8fff'
  return '#636366'
}

export default function LyricsSlide({ slide }) {
  const {
    lines = [],
    song = '',
    section = '',
    bgColor = '#050813',
    bgGradient = null,
    textColor = '#ffffff',
    bgImageUrl = null,
    bgOverlayOpacity = 0.55,
    fontSize = 100,
    fontId = 'montserrat',
  } = slide

  const fontOpt = FONT_OPTIONS.find(f => f.id === fontId) || FONT_OPTIONS[1]
  const fontFamily = fontOpt.family
  const fontWeight = fontOpt.weight

  const nonEmptyLines = lines.filter(l => l && l.trim())
  const badge = sectionBadge(section)
  const badgeColor = getBadgeColor(badge)

  const lineCount = nonEmptyLines.length || 1
  const basePct = lineCount <= 2 ? 9 : lineCount <= 4 ? 7 : lineCount <= 6 ? 5.5 : lineCount <= 8 ? 4.5 : 3.5
  const scaledPct = (basePct * (fontSize / 100)).toFixed(2)

  // Build background style
  let background
  if (bgImageUrl) {
    background = `url(${bgImageUrl}) center/cover no-repeat`
  } else if (bgGradient) {
    background = bgGradient
  } else {
    background = bgColor
  }

  return (
    <div style={{
      width: '100%', height: '100%',
      background,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '6% 8%', position: 'relative',
      fontFamily: fontFamily,
      overflow: 'hidden',
    }}>
      {/* Dark overlay for image backgrounds */}
      {bgImageUrl && bgOverlayOpacity > 0 && (
        <div style={{
          position: 'absolute', inset: 0,
          background: `rgba(0,0,0,${bgOverlayOpacity})`,
          pointerEvents: 'none',
        }} />
      )}

      {/* Lyrics */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: '3%',
        width: '100%', position: 'relative', zIndex: 1,
      }}>
        {nonEmptyLines.map((line, i) => (
          <div key={i} style={{
            fontSize: `${scaledPct}cqh`,
            color: textColor,
            textAlign: 'center',
            lineHeight: 1.3,
            fontFamily,
            fontWeight,
            textShadow: bgImageUrl
              ? '0 2px 12px rgba(0,0,0,1), 0 0 30px rgba(0,0,0,1), 0 4px 24px rgba(0,0,0,0.9)'
              : '0 2px 8px rgba(0,0,0,0.8)',
            letterSpacing: fontId === 'impact' ? '0.05em' : '0.01em',
            width: '100%',
          }}>
            {line}
          </div>
        ))}
      </div>

      {/* Section badge */}
      {badge && (
        <div style={{
          position: 'absolute', bottom: '4%', right: '3%',
          background: badgeColor, color: '#000',
          fontFamily: "'Inter', sans-serif",
          fontSize: '3.5cqh', fontWeight: 800,
          padding: '1% 2.5%', borderRadius: '4px',
          lineHeight: 1, letterSpacing: '0.04em',
          minWidth: '5%', textAlign: 'center', zIndex: 2,
        }}>
          {badge}
        </div>
      )}

      {/* Song title */}
      {song && (
        <div style={{
          position: 'absolute', bottom: '4%', left: '3%',
          fontSize: '2.2cqh', color: `${textColor}55`,
          fontFamily: "'Inter', sans-serif",
          fontWeight: 400, letterSpacing: '0.05em',
          maxWidth: '70%', overflow: 'hidden',
          textOverflow: 'ellipsis', whiteSpace: 'nowrap', zIndex: 2,
        }}>
          {song}
        </div>
      )}
    </div>
  )
}
