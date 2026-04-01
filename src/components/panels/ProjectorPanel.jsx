import React from 'react'
import { useSanctuaryStore } from '../../store/sanctuaryStore'
import SlideCanvas from '../slides/SlideCanvas'
import styles from './ProjectorPanel.module.css'

const SHORTCUTS = [
  { key: 'Space/→', desc: 'Next slide' },
  { key: '←',       desc: 'Prev slide' },
  { key: 'Enter',   desc: 'Send to projector' },
  { key: 'B',       desc: 'Black out' },
  { key: 'L',       desc: 'Toggle live' },
  { key: 'P',       desc: 'Toggle preview' },
]

export default function ProjectorPanel() {
  const { serviceOrder, liveSlideId, isLive, isBlackOut, getAllSlides } = useSanctuaryStore()

  const all = getAllSlides()
  const liveSlide = all.find(s => s.id === liveSlideId) || null
  const liveIdx = all.findIndex(s => s.id === liveSlideId)
  const upNext = all.slice(liveIdx + 1, liveIdx + 4)

  return (
    <aside className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.headerLabel}>Projector Monitor</span>
        {isLive && <div className={styles.livePip} />}
      </div>

      <div className={`${styles.liveBar} ${isLive ? styles.liveBarOn : ''}`} />

      <div className={styles.previewWrap}>
        <div className={`${styles.preview} ${isBlackOut ? styles.blacked : ''}`}>
          {isBlackOut ? (
            <div className={styles.blackLabel}>BLACKED OUT</div>
          ) : liveSlide ? (
            <div className={styles.previewInner}>
              <SlideCanvas slide={liveSlide} mini />
            </div>
          ) : (
            <div className={styles.noOutput}>No output</div>
          )}
        </div>
        <div className={styles.previewLabel}>
          {isLive
            ? (isBlackOut ? 'Screen blacked out' : `Live: ${liveSlide?.name || '—'}`)
            : 'Projector offline'}
        </div>
      </div>

      {isLive && upNext.length > 0 && (
        <div className={styles.upNext}>
          <div className={styles.upNextHeader}>Up Next</div>
          {upNext.map(slide => (
            <div key={slide.id} className={styles.upNextItem}>
              <span className={styles.upNextDot} />
              <span className={styles.upNextName}>{slide.name}</span>
            </div>
          ))}
        </div>
      )}

      <div className={styles.shortcuts}>
        <div className={styles.shortcutsHeader}>Shortcuts</div>
        {SHORTCUTS.map(({ key, desc }) => (
          <div key={key} className={styles.shortcutRow}>
            <kbd className={styles.kbd}>{key}</kbd>
            <span className={styles.kbdDesc}>{desc}</span>
          </div>
        ))}
      </div>
    </aside>
  )
}
