import React, { useState } from 'react'
import { useSanctuaryStore } from '../../store/sanctuaryStore'
import SongLibrary from './SongLibrary'
import { SyncButton } from './SyncManager'
import styles from './TopBar.module.css'

function getServiceDate() {
  const now = new Date()
  return now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function TopBar() {
  const { isLive, mode, isBlackOut, activeSection, setMode, toggleBlackOut, setActiveSection } = useSanctuaryStore()
  const [showLibrary, setShowLibrary] = useState(false)

  const handleGoLive = async () => {
    if (!isLive) {
      if (typeof window.sanctuary !== 'undefined') {
        await window.sanctuary.openProjector()
      }
      useSanctuaryStore.getState().goLive()
      useSanctuaryStore.getState().setMode('preview')
    } else {
      useSanctuaryStore.getState().endLive()
    }
  }

  return (
    <>
      <header className={styles.topbar}>
        {/* Left: Brand + date + section tabs */}
        <div className={styles.left}>
          <div className={styles.brand}>
            <div className={styles.brandIcon}>S</div>
            <div className={styles.brandStack}>
              <span className={styles.brandName}>Sanctuary</span>
              <span className={styles.serviceDate}>{getServiceDate()}</span>
            </div>
          </div>

          <div className={styles.sectionTabs}>
            {['preService', 'service', 'postService'].map(s => (
              <button
                key={s}
                className={`${styles.tab} ${activeSection === s ? styles.tabActive : ''}`}
                onClick={() => setActiveSection(s)}
              >
                {s === 'preService' ? 'Pre-Service' : s === 'service' ? 'Service' : 'Post-Service'}
              </button>
            ))}
          </div>
        </div>

        {/* Center: Status + toggle */}
        <div className={styles.center}>
          {isLive && (
            <div className={styles.liveIndicator}>
              <span className={styles.liveDot} />
              <span className={styles.liveLabel}>LIVE</span>
            </div>
          )}

          <div
            className={`${styles.toggleTrack} ${mode === 'preview' ? styles.togglePreview : styles.toggleEdit}`}
            onClick={() => setMode(mode === 'preview' ? 'edit' : 'preview')}
            title={mode === 'preview' ? 'Switch to Edit mode' : 'Switch to Preview / Control mode'}
          >
            <div className={styles.toggleThumb} />
            <span className={`${styles.toggleLabel} ${styles.toggleLabelLeft}`}>Preview</span>
            <span className={`${styles.toggleLabel} ${styles.toggleLabelRight}`}>Edit</span>
          </div>

          {isLive && mode === 'preview' && (
            <span className={styles.clickHint}>click slide = live</span>
          )}
        </div>

        {/* Right: Library + Black out + Go Live */}
        <div className={styles.right}>
          <SyncButton />

          <button className={styles.libraryBtn} onClick={() => setShowLibrary(true)} title="Song Library">
            ♪ Library
          </button>

          <button
            className={`${styles.blackOutBtn} ${isBlackOut ? styles.blackActive : ''}`}
            onClick={toggleBlackOut}
            title="Black out screen (B)"
          >
            {isBlackOut ? '● Screen Off' : '○ Black Out'}
          </button>

          <button
            className={`${styles.goLiveBtn} ${isLive ? styles.endLive : styles.startLive}`}
            onClick={handleGoLive}
          >
            {isLive ? '■ End Live' : '▶ Go Live'}
          </button>
        </div>
      </header>

      {showLibrary && <SongLibrary onClose={() => setShowLibrary(false)} />}
    </>
  )
}
