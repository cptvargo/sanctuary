import React, { useEffect, useState } from 'react'
import { useSanctuaryStore } from '../store/sanctuaryStore'
import LogoSlide from './slides/LogoSlide'
import LyricsSlide from './slides/LyricsSlide'
import PptxSlide from './slides/PptxSlide'
import BlankSlide, { ScriptureSlide, AnnouncementSlide } from './slides/BlankSlide'
import ImageSlide from './slides/ImageSlide'
import { CountdownRenderer } from './slides/CountdownSlide'

// Projector-side countdown — uses same CountdownRenderer as operator.
// No local tick — operator sends countdownRemaining every second via _syncProjector.
function ProjectorCountdown({ slide, countdownRemaining }) {
  const remaining = countdownRemaining ?? slide.durationMinutes * 60
  const minutes = Math.floor(remaining / 60)
  const seconds = remaining % 60
  const timeStr = `${minutes}:${String(seconds).padStart(2, '0')}`
  const isExpired = remaining <= 0
  return <CountdownRenderer slide={slide} timeStr={timeStr} isExpired={isExpired} />
}

function renderSlide(slide, countdownRemaining) {
  if (!slide) return null
  switch (slide.type) {
    case 'logo':         return <LogoSlide slide={slide} />
    case 'lyrics':       return <LyricsSlide slide={slide} />
    case 'countdown':    return <ProjectorCountdown slide={slide} countdownRemaining={countdownRemaining} />
    case 'pptx':         return <PptxSlide slide={slide} />
    case 'blank':        return <BlankSlide slide={slide} />
    case 'scripture':    return <ScriptureSlide slide={slide} />
    case 'announcement': return <AnnouncementSlide slide={slide} />
    case 'image':         return <ImageSlide slide={slide} />
    default:             return <BlankSlide slide={slide} />
  }
}

export default function ProjectorView() {
  const [state, setState] = useState({
    isLive: false, isBlackOut: false, slide: null, countdownRemaining: null,
  })
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    let cleanupIpc = null
    if (typeof window.sanctuary !== 'undefined') {
      cleanupIpc = window.sanctuary.onProjectorUpdate(handlePayload)
    }
    const bc = new BroadcastChannel('sanctuary-projector')
    bc.onmessage = (e) => handlePayload(e.data)
    return () => {
      if (cleanupIpc) cleanupIpc()
      bc.close()
    }
  }, [])

  const handlePayload = (payload) => {
    // For image slides, read full slide data from store (avoids BroadcastChannel size limits)
    let resolvedPayload = payload
    if (payload.slide?.type === 'image') {
      const storeSlide = useSanctuaryStore.getState().getLiveSlide()
      if (storeSlide?.type === 'image') {
        resolvedPayload = { ...payload, slide: storeSlide }
      }
    }
    if (resolvedPayload.slide?.transition === 'fade') {
      setVisible(false)
      setTimeout(() => { setState(resolvedPayload); setVisible(true) }, 200)
    } else {
      setState(resolvedPayload)
    }
  }

  const { isLive, isBlackOut, slide, countdownRemaining } = state

  if (isBlackOut || !isLive) {
    return (
      <div style={{ width: '100vw', height: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {!isLive && (
          <div style={{ color: '#1a1a1a', fontSize: '1.5vw', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>
            Sanctuary — Waiting for output
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{
      width: '100vw', height: '100vh', background: '#000', overflow: 'hidden',
      opacity: visible ? 1 : 0,
      transition: visible ? 'opacity 0.2s ease-in' : 'opacity 0.15s ease-out',
      containerType: 'size',
    }}>
      {slide ? renderSlide(slide, countdownRemaining) : <div style={{ width: '100%', height: '100%', background: '#000' }} />}
    </div>
  )
}
