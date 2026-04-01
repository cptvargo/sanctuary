import React from 'react'
import { useSanctuaryStore } from '../../store/sanctuaryStore'
import SlideCanvas from '../slides/SlideCanvas'
import LyricsEditor from '../slides/editors/LyricsEditor'
import LogoEditor from '../slides/editors/LogoEditor'
import CountdownEditor from '../slides/editors/CountdownEditor'
import PptxEditor from '../slides/editors/PptxEditor'
import ScriptureEditor from '../slides/editors/ScriptureEditor'
import { AnnouncementEditor } from '../slides/editors/ScriptureEditor'
import styles from './EditorPanel.module.css'

const BADGE = {
  logo:         { label: 'Logo',        bg: '#1a1400', color: '#c8a84a' },
  lyrics:       { label: 'Lyrics',      bg: 'var(--accent-bg)', color: 'var(--accent)' },
  countdown:    { label: 'Countdown',   bg: 'var(--green-bg)', color: 'var(--green)' },
  pptx:         { label: 'PowerPoint',  bg: 'var(--purple-bg)', color: 'var(--purple)' },
  blank:        { label: 'Blank',       bg: '#0a0a0a', color: '#555' },
  scripture:    { label: 'Scripture',   bg: '#1a1408', color: '#c0a06a' },
  announcement: { label: 'Announce',    bg: '#1a1008', color: '#cc8844' },
}

export default function EditorPanel() {
  const { getActiveSlide, updateSlide, navigatePrev, navigateNext, sendToProjector, mode, isLive } = useSanctuaryStore()

  const slide = getActiveSlide()
  if (!slide) return <div className={styles.panel} />

  const badge = BADGE[slide.type] || BADGE.blank
  const isEditMode = mode === 'edit'

  const renderEditor = () => {
    if (!isEditMode) return null
    const props = { slide, onChange: (c) => updateSlide(slide.id, c) }
    switch (slide.type) {
      case 'lyrics':       return <LyricsEditor {...props} />
      case 'logo':         return <LogoEditor {...props} />
      case 'countdown':    return <CountdownEditor {...props} />
      case 'pptx':         return <PptxEditor {...props} />
      case 'scripture':    return <ScriptureEditor {...props} />
      case 'announcement': return <AnnouncementEditor {...props} />
      default:             return null
    }
  }

  return (
    <div className={styles.panel}>
      {/* Slide header */}
      <div className={styles.slideBar}>
        <span className={styles.badge} style={{ background: badge.bg, color: badge.color }}>{badge.label}</span>
        <input
          className={styles.slideName}
          value={slide.name}
          onChange={e => updateSlide(slide.id, { name: e.target.value })}
          spellCheck={false}
        />
        <div className={styles.navArrows}>
          <button className={styles.navBtn} onClick={navigatePrev} title="← Previous">‹</button>
          <button className={styles.navBtn} onClick={navigateNext} title="→ Next">›</button>
        </div>
      </div>

      {!isEditMode && (
        <div className={styles.previewBanner}>
          👁 Preview Mode — {isLive ? 'projector is live' : 'projector offline'}
        </div>
      )}

      {/* 16:9 Canvas */}
      <div className={styles.canvasWrap}>
        <div className={styles.canvasOuter}>
          <SlideCanvas slide={slide} />
        </div>
      </div>

      {/* Editor */}
      {isEditMode && (
        <div className={styles.editorArea}>
          {renderEditor()}
        </div>
      )}

      {/* Action bar */}
      <div className={styles.actionBar}>
        <select
          className={styles.transitionSelect}
          value={slide.transition || 'cut'}
          onChange={e => updateSlide(slide.id, { transition: e.target.value })}
        >
          <option value="cut">Cut</option>
          <option value="fade">Fade</option>
        </select>
        {isLive && !isEditMode ? (
          <div className={styles.clickToSendHint}>
            ← Click any slide to send live
          </div>
        ) : (
          <button className={styles.sendLiveBtn} onClick={sendToProjector}>
            {isLive ? '▶ Push to Projector' : '▶ Go Live + Send'}
          </button>
        )}
      </div>
    </div>
  )
}
