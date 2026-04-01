import React from 'react'
import { useSanctuaryStore } from '../../store/sanctuaryStore'
import SlideCanvas from '../slides/SlideCanvas'
import styles from './StageMonitor.module.css'

const SHORTCUTS = [
  { key: '→ / Space', desc: 'Next slide' },
  { key: '←',         desc: 'Prev slide' },
  { key: 'B',         desc: 'Black out' },
  { key: 'L',         desc: 'Toggle live' },
]

export default function StageMonitor() {
  const { getAllSlides, liveSlideId, isLive, isBlackOut, mode } = useSanctuaryStore()
  const all = getAllSlides()
  const liveSlide = all.find(s => s.id === liveSlideId) || null
  const liveIdx = all.findIndex(s => s.id === liveSlideId)
  const upNext = liveIdx >= 0 ? all.slice(liveIdx + 1, liveIdx + 4) : []

  return (
    <aside className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.headerLabel}>Stage Monitor</span>
        {isLive && <div className={styles.livePip} />}
      </div>

      <div className={`${styles.liveBar} ${isLive ? styles.liveBarOn : ''}`} />

      {/* Projector output preview */}
      <div className={styles.monitorWrap}>
        <div className={`${styles.monitor} ${isBlackOut ? styles.blacked : ''}`}>
          {isBlackOut ? (
            <span className={styles.blackText}>BLACKED OUT</span>
          ) : liveSlide ? (
            <div className={styles.monitorCanvas}>
              <SlideCanvas slide={liveSlide} mini />
            </div>
          ) : (
            <span className={styles.noOutput}>No output</span>
          )}
        </div>
        <div className={styles.monitorLabel}>
          {isLive
            ? isBlackOut ? 'Screen off' : `Live: ${liveSlide?.name || '—'}`
            : 'Projector offline'}
        </div>
      </div>

      {/* Mode indicator */}
      <div className={`${styles.modeBar} ${mode === 'preview' && isLive ? styles.modePreview : styles.modeEdit}`}>
        {mode === 'preview' && isLive
          ? '● Control mode — click slides to send'
          : '✎ Edit mode — projector frozen'}
      </div>

      {/* Up Next */}
      {isLive && upNext.length > 0 && (
        <div className={styles.upNext}>
          <div className={styles.upNextLabel}>Up Next</div>
          {upNext.map((s, i) => (
            <div key={s.id} className={styles.upNextItem}>
              <span className={styles.upNextIdx}>{i + 1}</span>
              <span className={styles.upNextName}>{s.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Shortcuts */}
      <div className={styles.shortcuts}>
        <div className={styles.shortcutsLabel}>Keyboard</div>
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
