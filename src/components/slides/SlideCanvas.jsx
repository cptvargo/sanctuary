import React from 'react'
import LogoSlide from './LogoSlide'
import LyricsSlide from './LyricsSlide'
import CountdownSlide from './CountdownSlide'
import BlankSlide from './BlankSlide'
import ScriptureSlide from './ScriptureSlide'
import AnnouncementSlide from './AnnouncementSlide'
import ImageSlide from './ImageSlide'
import styles from './SlideCanvas.module.css'

export default function SlideCanvas({ slide, mini = false }) {
  if (!slide) return <div className={styles.canvas} style={{ background: '#000' }} />

  const renderSlide = () => {
    switch (slide.type) {
      case 'logo':         return <LogoSlide slide={slide} />
      case 'lyrics':       return <LyricsSlide slide={slide} mini={mini} />
      case 'countdown':    return <CountdownSlide slide={slide} />
      case 'blank':        return <BlankSlide slide={slide} />
      case 'scripture':    return <ScriptureSlide slide={slide} />
      case 'announcement': return <AnnouncementSlide slide={slide} />
      case 'image':         return <ImageSlide slide={slide} />
      default:             return <BlankSlide slide={slide} />
    }
  }

  return (
    <div className={`${styles.canvas} ${mini ? styles.mini : ''}`}>
      {renderSlide()}
    </div>
  )
}
