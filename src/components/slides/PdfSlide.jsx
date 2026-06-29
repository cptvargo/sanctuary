import React from 'react'

export default function PdfSlide({ slide, mini = false }) {
  const { pages = [], currentPageIndex = 0 } = slide
  const page = pages[Math.min(currentPageIndex, pages.length - 1)]

  if (!pages.length) {
    return (
      <div style={{
        width: '100%', height: '100%', background: '#0f0a18',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: '1cqh', fontFamily: "'Inter', sans-serif",
      }}>
        <div style={{ fontSize: mini ? '2.5cqh' : '5cqh', color: 'rgba(255,255,255,0.15)' }}>⊞</div>
        {!mini && <div style={{ fontSize: '1.6cqh', color: 'rgba(255,255,255,0.25)' }}>No PDF imported</div>}
      </div>
    )
  }

  return (
    <div style={{ width: '100%', height: '100%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <img
        src={page}
        alt={`Page ${currentPageIndex + 1}`}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
    </div>
  )
}
