import React from 'react'

export function BlankSlide({ slide }) {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: slide?.bgColor || '#000000',
    }} />
  )
}

export function ScriptureSlide({ slide }) {
  const {
    reference = '',
    text = '',
    translation = 'KJV',
    bgColor = '#050813',
    textColor = '#e0e8ff',
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
      padding: '8% 12%',
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      position: 'relative',
    }}>
      {/* Decorative quote mark */}
      <div style={{
        position: 'absolute',
        top: '6%',
        left: '6%',
        fontSize: 'clamp(30px, 6vw, 100px)',
        color: `${textColor}15`,
        lineHeight: 1,
        fontWeight: 700,
      }}>"</div>

      {text && (
        <div style={{
          fontSize: 'clamp(13px, 2.4vw, 40px)',
          color: textColor,
          textAlign: 'center',
          lineHeight: 1.6,
          fontWeight: 300,
          fontStyle: 'italic',
          marginBottom: '4%',
          textShadow: '0 2px 20px rgba(0,0,0,0.6)',
        }}>
          {text}
        </div>
      )}

      {reference && (
        <div style={{
          fontSize: 'clamp(9px, 1.1vw, 18px)',
          color: `${textColor}88`,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          fontStyle: 'normal',
          fontWeight: 500,
        }}>
          {reference}
          {translation && <span style={{ opacity: 0.5 }}> · {translation}</span>}
        </div>
      )}
    </div>
  )
}

export function AnnouncementSlide({ slide }) {
  const {
    title = '',
    body = '',
    bgColor = '#0a0a14',
    textColor = '#ffffff',
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
      padding: '8% 10%',
      fontFamily: "'Inter', sans-serif",
      gap: '4%',
    }}>
      {title && (
        <div style={{
          fontSize: 'clamp(16px, 3.5vw, 56px)',
          fontWeight: 600,
          color: textColor,
          textAlign: 'center',
          lineHeight: 1.2,
        }}>
          {title}
        </div>
      )}
      {body && (
        <div style={{
          fontSize: 'clamp(10px, 1.8vw, 28px)',
          color: `${textColor}bb`,
          textAlign: 'center',
          lineHeight: 1.6,
          fontWeight: 300,
        }}>
          {body}
        </div>
      )}
    </div>
  )
}

export default BlankSlide
