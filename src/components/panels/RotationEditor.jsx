import React, { useState, useEffect } from 'react'
import { useSanctuaryStore } from '../../store/sanctuaryStore'
import SlideCanvas from '../slides/SlideCanvas'
import cpStyles from './CenterPanel.module.css'
import styles from './RotationEditor.module.css'

function fileToLabel(filename) {
  return filename
    .replace(/\.[^.]+$/, '')               // strip extension
    .replace(/^pre_service_/, '')          // strip prefix
    .replace(/_/g, ' ')                    // underscores → spaces
    .replace(/([a-z])(\d)/g, '$1 $2')     // silence3 → silence 3
    .replace(/\b\w/g, c => c.toUpperCase()) // capitalize
}

async function fetchAsDataUrl(filename) {
  // Use relative path (no leading /) — works in both Vite dev and Electron prod
  const resp = await fetch(`backgrounds/${filename}`)
  const blob = await resp.blob()
  return new Promise(resolve => {
    const reader = new FileReader()
    reader.onload = e => resolve(e.target.result)
    reader.readAsDataURL(blob)
  })
}

async function pickImages() {
  if (typeof window.sanctuary !== 'undefined' && window.sanctuary.openImagesDialog) {
    return await window.sanctuary.openImagesDialog()
  }
  return new Promise(res => {
    const input = document.createElement('input')
    input.type = 'file'; input.accept = 'image/*'; input.multiple = true
    input.onchange = e => {
      const files = Array.from(e.target.files)
      if (!files.length) { res([]); return }
      Promise.all(files.map(file => new Promise(r => {
        const reader = new FileReader()
        reader.onload = ev => r(ev.target.result)
        reader.readAsDataURL(file)
      }))).then(res)
    }
    input.click()
  })
}

export default function RotationEditor({ item }) {
  const { isLive, liveSlideId, mode, updateRotationItem, addRotationImage, removeRotationImage, countdownRemaining, initCountdown, addCountdownMinutes } = useSanctuaryStore()
  const storeItem = useSanctuaryStore(s => s.serviceOrder.find(i => i.id === item.id)) || item
  const { images = [], intervalSeconds = 7, countdownEnabled = false, countdownMinutes = 5, countdownMessage = 'Service begins in', countdownPosition = 'top' } = storeItem
  const isRunning = isLive && liveSlideId === item.id
  const isClickToSend = isLive && mode === 'preview'
  const [showBuiltIn, setShowBuiltIn] = useState(false)
  const [adding, setAdding] = useState(null)
  const [builtInImages, setBuiltInImages] = useState([])

  useEffect(() => {
    window.sanctuary?.listBackgrounds?.().then(files => {
      setBuiltInImages(
        files
          .filter(f => f.startsWith('pre_service_'))
          .map(file => ({ file, label: fileToLabel(file) }))
      )
    })
  }, [])

  // Initialize countdown time when first enabled
  useEffect(() => {
    if (countdownEnabled && countdownRemaining[item.id] === undefined) {
      initCountdown(item.id, countdownMinutes)
    }
  }, [countdownEnabled, item.id])

  const remaining = countdownRemaining[item.id] ?? (countdownMinutes * 60)
  const cdMins = Math.floor(remaining / 60)
  const cdSecs = remaining % 60
  const cdTimeStr = `${cdMins}:${String(cdSecs).padStart(2, '0')}`

  const handleResetCountdown = () => {
    useSanctuaryStore.setState(s => ({
      countdownRemaining: { ...s.countdownRemaining, [item.id]: countdownMinutes * 60 },
    }))
    if (isRunning) useSanctuaryStore.getState()._syncProjector()
  }

  const previewSlide = { id: storeItem.id, type: 'rotation-image', images, intervalSeconds, countdownEnabled, countdownMessage, countdownPosition }

  const handleClick = () => {
    useSanctuaryStore.setState({ activeSlideId: item.id })
    if (isLive && useSanctuaryStore.getState().mode === 'preview') {
      useSanctuaryStore.setState({ liveSlideId: item.id, isBlackOut: false })
      useSanctuaryStore.getState()._syncProjector()
    }
  }

  const handleAddFromFiles = async () => {
    const dataUrls = await pickImages()
    if (!dataUrls?.length) return
    dataUrls.forEach(dataUrl => addRotationImage(item.id, { dataUrl, caption: '' }))
  }

  const handleAddBuiltIn = async (img) => {
    setAdding(img.file)
    try {
      const dataUrl = await fetchAsDataUrl(img.file)
      addRotationImage(item.id, { dataUrl, caption: img.label, source: 'builtin', file: img.file })
    } catch (err) {
      console.error('Failed to load built-in image:', img.file, err)
    } finally {
      setAdding(null)
    }
  }

  const handleStartStop = () => {
    if (isRunning) {
      useSanctuaryStore.getState().endLive()
    } else {
      useSanctuaryStore.setState({ activeSlideId: item.id })
      useSanctuaryStore.getState().sendToProjector()
    }
  }

return (
    <div className={cpStyles.standaloneWrap}>
      <div
        className={`${cpStyles.standaloneCanvas} ${cpStyles.canvasClickable} ${isRunning ? cpStyles.canvasLive : ''}`}
        onClick={handleClick}
      >
        <SlideCanvas slide={previewSlide} />
        {isRunning && <div className={cpStyles.liveOverlayBadge}>LIVE</div>}
        {isClickToSend && !isRunning && (
          <div className={cpStyles.clickToSendOverlay}>Click to start rotation</div>
        )}
      </div>

      <div className={styles.editorPanel}>
        {/* Controls row */}
        <div className={styles.controlRow}>
          <label className={styles.controlLabel}>Interval</label>
          <select
            className={styles.select}
            value={intervalSeconds}
            onChange={e => updateRotationItem(item.id, { intervalSeconds: Number(e.target.value) })}
          >
            <option value={5}>5 seconds</option>
            <option value={7}>7 seconds</option>
            <option value={10}>10 seconds</option>
            <option value={15}>15 seconds</option>
            <option value={20}>20 seconds</option>
          </select>
          <button
            className={`${styles.startBtn} ${isRunning ? styles.stopBtn : ''}`}
            onClick={handleStartStop}
          >
            {isRunning ? '■ Stop Rotation' : '▶ Start Rotation'}
          </button>
        </div>

        {/* Added images */}
        {images.length > 0 && (
          <div className={styles.imageGrid}>
            {images.map((img, idx) => (
              <div key={img.id} className={styles.imageCard}>
                <div className={styles.thumb} style={{ backgroundImage: `url(${img.dataUrl})` }}>
                  <button className={styles.removeBtn} onClick={() => removeRotationImage(item.id, img.id)}>×</button>
                  <span className={styles.indexBadge}>{idx + 1}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add buttons */}
        <div className={styles.addRow}>
          <button className={styles.addFileBtn} onClick={handleAddFromFiles}>
            📂 From Files…
          </button>
          <button
            className={`${styles.addFileBtn} ${showBuiltIn ? styles.addFileBtnActive : ''}`}
            onClick={() => setShowBuiltIn(v => !v)}
          >
            🖼 App Images {showBuiltIn ? '▲' : '▼'}
          </button>
        </div>

        {/* Built-in image picker */}
        {showBuiltIn && (
          <div className={styles.builtInGrid}>
            {builtInImages.map(img => (
              <button
                key={img.file}
                className={styles.builtInCard}
                onClick={() => handleAddBuiltIn(img)}
                disabled={adding === img.file}
                title={img.label}
              >
                <div
                  className={styles.builtInThumb}
                  style={{ backgroundImage: `url(backgrounds/${img.file})` }}
                >
                  {adding === img.file && <div className={styles.addingSpinner}>…</div>}
                </div>
                <span className={styles.builtInLabel}>{img.label}</span>
              </button>
            ))}
          </div>
        )}

        {images.length === 0 && !showBuiltIn && (
          <div className={styles.emptyHint}>
            Add images above — they'll auto-advance with a fade transition
          </div>
        )}

        {/* Countdown overlay section */}
        <div className={styles.countdownSection}>
          <div className={styles.countdownHeader}>
            <span className={styles.controlLabel}>⏱ Countdown Overlay</span>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {countdownEnabled && (
                <button
                  className={styles.toggleBtn}
                  title="Position of the countdown bar"
                  onClick={() => {
                    updateRotationItem(item.id, { countdownPosition: countdownPosition === 'top' ? 'bottom' : 'top' })
                    if (isRunning) setTimeout(() => useSanctuaryStore.getState()._syncProjector(), 50)
                  }}
                >
                  {countdownPosition === 'top' ? '↑ Top' : '↓ Bottom'}
                </button>
              )}
              <button
                className={`${styles.toggleBtn} ${countdownEnabled ? styles.toggleBtnOn : ''}`}
                onClick={() => {
                  const next = !countdownEnabled
                  updateRotationItem(item.id, { countdownEnabled: next })
                  if (next && countdownRemaining[item.id] === undefined) {
                    initCountdown(item.id, countdownMinutes)
                  }
                  if (isRunning) setTimeout(() => useSanctuaryStore.getState()._syncProjector(), 50)
                }}
              >
                {countdownEnabled ? 'On' : 'Off'}
              </button>
            </div>
          </div>

          {countdownEnabled && (
            <>
              <div className={styles.countdownTime}>{cdTimeStr}</div>
              <div className={styles.timeButtons}>
                {[1, 2, 5, 10].map(m => (
                  <button key={m} className={styles.timeBtn}
                    onClick={() => {
                      addCountdownMinutes(item.id, m)
                      if (isRunning) useSanctuaryStore.getState()._syncProjector()
                    }}
                  >
                    +{m} min
                  </button>
                ))}
                <button className={styles.timeBtn} onClick={handleResetCountdown}>Reset</button>
              </div>
              <input
                className={styles.messageInput}
                type="text"
                value={countdownMessage}
                onChange={e => updateRotationItem(item.id, { countdownMessage: e.target.value })}
                placeholder="Service begins in"
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
