import React from 'react'
import { useSanctuaryStore } from '../../store/sanctuaryStore'

export default function PptxSlide({ slide }) {
  const { pptxNext, pptxPrev, pptxGoTo } = useSanctuaryStore()
  const { slides = [], currentSlideIndex = 0, filePath, name } = slide

  // No file imported yet
  if (!filePath || slides.length === 0) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        background: '#0f0a18',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '3%',
        fontFamily: "'Inter', sans-serif",
        color: '#8a5aaa',
      }}>
        <div style={{ fontSize: 'clamp(24px, 4vw, 64px)' }}>⊞</div>
        <div style={{ fontSize: 'clamp(10px, 1.4vw, 22px)', opacity: 0.6 }}>
          No PowerPoint imported
        </div>
        <div style={{ fontSize: 'clamp(8px, 0.9vw, 14px)', opacity: 0.3, letterSpacing: '0.1em' }}>
          Use the editor panel to import a .pptx file
        </div>
      </div>
    )
  }

  const current = slides[currentSlideIndex]

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: '#fff',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* If we have a rendered image of the slide */}
      {current?.imageDataUrl ? (
        <img
          src={current.imageDataUrl}
          alt={`Slide ${currentSlideIndex + 1}`}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      ) : (
        // Fallback: render title + body text
        <div style={{
          width: '100%',
          height: '100%',
          padding: '6% 8%',
          background: current?.bgColor || '#ffffff',
          color: current?.textColor || '#1a1a2e',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          fontFamily: "'Inter', sans-serif",
        }}>
          {current?.title && (
            <div style={{
              fontSize: 'clamp(14px, 3vw, 48px)',
              fontWeight: 700,
              marginBottom: '4%',
              lineHeight: 1.2,
            }}>
              {current.title}
            </div>
          )}
          {current?.body && Array.isArray(current.body) && (
            <ul style={{ paddingLeft: '5%', display: 'flex', flexDirection: 'column', gap: '2%' }}>
              {current.body.map((item, i) => (
                <li key={i} style={{ fontSize: 'clamp(10px, 1.6vw, 26px)', lineHeight: 1.5 }}>{item}</li>
              ))}
            </ul>
          )}
          {current?.body && typeof current.body === 'string' && (
            <div style={{ fontSize: 'clamp(10px, 1.6vw, 26px)', lineHeight: 1.6 }}>{current.body}</div>
          )}
        </div>
      )}

      {/* Slide counter */}
      <div style={{
        position: 'absolute',
        bottom: '2%',
        right: '3%',
        fontSize: 'clamp(7px, 0.8vw, 13px)',
        color: 'rgba(128,128,128,0.7)',
        fontFamily: "'Inter', sans-serif",
        background: 'rgba(255,255,255,0.7)',
        padding: '1px 6px',
        borderRadius: '3px',
      }}>
        {currentSlideIndex + 1} / {slides.length}
      </div>

      {/* Dot navigation */}
      {slides.length > 1 && slides.length <= 20 && (
        <div style={{
          position: 'absolute',
          bottom: '3%',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '4px',
        }}>
          {slides.map((_, i) => (
            <div
              key={i}
              onClick={() => pptxGoTo(slide.id, i)}
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: i === currentSlideIndex ? '#555' : '#ccc',
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
