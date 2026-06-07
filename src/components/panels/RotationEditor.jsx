import React, { useState } from 'react'
import { useSanctuaryStore } from '../../store/sanctuaryStore'
import SlideCanvas from '../slides/SlideCanvas'
import cpStyles from './CenterPanel.module.css'
import styles from './RotationEditor.module.css'

// All images bundled in public/backgrounds/ — available in both dev and prod
const BUILT_IN_IMAGES = [
  { file: 'pre_service_silence.png',  label: 'Silence Phones' },
  { file: 'mothers_day.png',          label: "Mother's Day" },
  { file: 'verse_proverbs_1_7.png',   label: 'Proverbs 1:7' },
  { file: 'verse_proverbs_29_23.png', label: 'Proverbs 29:23' },
  { file: 'verse_proverbs_4_13.png',  label: 'Proverbs 4:13' },
  { file: 'verse_psalm_45_1.png',     label: 'Psalm 45:1' },
  { file: 'bg-he-is-risen.png',       label: 'He Is Risen' },
  { file: 'bg-victorious.jpg',        label: 'Victorious' },
  { file: 'Victorious.png',           label: 'Victorious (alt)' },
  { file: 'bg-divine-light.jpg',      label: 'Divine Light' },
  { file: 'bg-divine-pillars.png',    label: 'Divine Pillars' },
  { file: 'bg-empty-tomb.jpg',        label: 'Empty Tomb' },
  { file: 'bg-three-crosses.jpg',     label: 'Three Crosses' },
  { file: 'bg-crosses-sunset.jpg',    label: 'Crosses Sunset' },
  { file: 'bg-crystal-cross.jpg',     label: 'Crystal Cross' },
  { file: 'light-breaking-through.png', label: 'Light Breaking Through' },
  { file: 'refiners-fire.png',        label: "Refiner's Fire" },
  { file: 'bg-heavenly-sky.jpg',      label: 'Heavenly Sky' },
  { file: 'bg-night-sky.jpg',         label: 'Night Sky' },
  { file: 'bg-star-cluster.jpg',      label: 'Star Cluster' },
  { file: 'bg-blue-nebula.jpg',       label: 'Blue Nebula' },
  { file: 'bg-light-waves.jpg',       label: 'Light Waves' },
  { file: 'bg-neon-burst.jpg',        label: 'Neon Burst' },
  { file: 'bg-palm-leaves.jpg',       label: 'Palm Leaves' },
  { file: 'bg-announcement.jpg',      label: 'Announcement BG' },
  { file: 'cherry-dark.png',          label: 'Cherry Dark' },
  { file: 'navy_abstract.png',        label: 'Navy Abstract' },
  { file: 'red_sky.png',              label: 'Red Sky' },
]

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
  const { isLive, liveSlideId, mode, updateRotationItem, addRotationImage, removeRotationImage } = useSanctuaryStore()
  const storeItem = useSanctuaryStore(s => s.serviceOrder.find(i => i.id === item.id)) || item
  const { images = [], intervalSeconds = 7 } = storeItem
  const isRunning = isLive && liveSlideId === item.id
  const isClickToSend = isLive && mode === 'preview'
  const [showBuiltIn, setShowBuiltIn] = useState(false)
  const [adding, setAdding] = useState(null) // filename being added

  const previewSlide = { id: storeItem.id, type: 'rotation-image', images, intervalSeconds }

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
      addRotationImage(item.id, { dataUrl, caption: img.label })
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

  const handleCaption = (imgId, caption) => {
    const updated = images.map(img => img.id === imgId ? { ...img, caption } : img)
    updateRotationItem(item.id, { images: updated })
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
                <input
                  className={styles.captionInput}
                  value={img.caption || ''}
                  onChange={e => handleCaption(img.id, e.target.value)}
                  placeholder="Caption…"
                />
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
            {BUILT_IN_IMAGES.map(img => (
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
      </div>
    </div>
  )
}
