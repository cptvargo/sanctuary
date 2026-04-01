import React from 'react'

export default function LogoSlide({ slide }) {
  const {
    churchName = 'The Floodgates Church',
    tagline = 'Newport News, VA',
    logoDataUrl = null,
    bgColor = '#000000',
    textColor = '#c8a84a',
  } = slide

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: bgColor,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '5%',
      fontFamily: "'Cormorant Garamond', Georgia, serif",
    }}>
      {/* Logo area */}
      {logoDataUrl ? (
        <img
          src={logoDataUrl}
          alt="Church logo"
          style={{ width: '55%', maxHeight: '60%', objectFit: 'contain' }}
        />
      ) : (
        <div style={{
          width: '18%', aspectRatio: '1', borderRadius: '50%',
          border: `2px solid ${textColor}44`, background: `${textColor}11`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: '3.5vw', color: textColor }}>✦</span>
        </div>
      )}

      {/* Church name */}
      <div style={{
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1%',
      }}>
        <div style={{
          fontSize: 'clamp(14px, 2.8vw, 48px)',
          fontWeight: 300,
          color: textColor,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          lineHeight: 1.2,
        }}>
          {churchName}
        </div>
        {tagline && (
          <div style={{
            fontSize: 'clamp(8px, 1vw, 18px)',
            color: `${textColor}66`,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            fontWeight: 400,
          }}>
            {tagline}
          </div>
        )}
      </div>
    </div>
  )
}
