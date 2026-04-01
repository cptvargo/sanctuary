import React from 'react'

export function sectionBadge(section = '') {
  const s = section.trim()
  if (!s) return ''
  const u = s.toUpperCase()
  if (/^CHORUS\s*(\d*)$/.test(u)) { const n = u.replace('CHORUS','').trim(); return n ? `C${n}` : 'C' }
  if (/^VERSE\s*(\d+)$/.test(u)) return u.replace('VERSE','').trim()
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
    textColor = '#ffffff',
    bgImageUrl = null,
    fontSize = 100,  // percentage scale, 100 = default
  } = slide

  const nonEmptyLines = lines.filter(l => l && l.trim())
  const badge = sectionBadge(section)
  const badgeColor = getBadgeColor(badge)

  // Base font size from line count, then scaled by user fontSize %
  const lineCount = nonEmptyLines.length || 1
  const basePct = lineCount <= 2 ? 9 : lineCount <= 4 ? 7 : lineCount <= 6 ? 5.5 : lineCount <= 8 ? 4.5 : 3.5
  const scaledPct = (basePct * (fontSize / 100)).toFixed(2)

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: bgImageUrl
        ? `linear-gradient(rgba(0,0,0,0.55),rgba(0,0,0,0.55)),url(${bgImageUrl}) center/cover no-repeat`
        : bgColor,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '6% 8%',
      position: 'relative',
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2%',
        width: '100%',
      }}>
        {nonEmptyLines.map((line, i) => (
          <div key={i} style={{
            fontSize: `${scaledPct}cqh`,
            color: textColor,
            textAlign: 'center',
            lineHeight: 1.3,
            fontWeight: 400,
            textShadow: '0 2px 16px rgba(0,0,0,0.9)',
            letterSpacing: '0.01em',
            width: '100%',
          }}>
            {line}
          </div>
        ))}
      </div>

      {/* Section badge — bottom right, Proclaim style */}
      {badge && (
        <div style={{
          position: 'absolute',
          bottom: '4%',
          right: '3%',
          background: badgeColor,
          color: '#000',
          fontFamily: "'Inter', sans-serif",
          fontSize: '3.5cqh',
          fontWeight: 800,
          padding: '1% 2.5%',
          borderRadius: '4px',
          lineHeight: 1,
          letterSpacing: '0.04em',
          minWidth: '5%',
          textAlign: 'center',
        }}>
          {badge}
        </div>
      )}

      {/* Song title — bottom left */}
      {song && (
        <div style={{
          position: 'absolute',
          bottom: '4%',
          left: '3%',
          fontSize: '2.2cqh',
          color: `${textColor}55`,
          fontFamily: "'Inter', sans-serif",
          fontWeight: 400,
          letterSpacing: '0.05em',
          maxWidth: '70%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {song}
        </div>
      )}
    </div>
  )
}
