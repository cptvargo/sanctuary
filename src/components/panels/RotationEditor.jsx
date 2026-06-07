import React from 'react'
import { useSanctuaryStore } from '../../store/sanctuaryStore'
import SlideCanvas from '../slides/SlideCanvas'
import cpStyles from './CenterPanel.module.css'
import styles from './RotationEditor.module.css'

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

  const previewSlide = { id: storeItem.id, type: 'rotation-image', images, intervalSeconds }

  const handleClick = () => {
    useSanctuaryStore.setState({ activeSlideId: item.id })
    if (isLive && useSanctuaryStore.getState().mode === 'preview') {
      useSanctuaryStore.setState({ liveSlideId: item.id, isBlackOut: false })
      useSanctuaryStore.getState()._syncProjector()
    }
  }

  const handleAddImages = async () => {
    const dataUrls = await pickImages()
    if (!dataUrls?.length) return
    dataUrls.forEach(dataUrl => addRotationImage(item.id, { dataUrl, caption: '' }))
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
        <div className={styles.controls}>
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
        </div>

        {images.length === 0 ? (
          <div className={styles.dropZone} onClick={handleAddImages}>
            <div className={styles.dropZoneIcon}>⟳</div>
            <div>Click to add images</div>
            <div className={styles.dropZoneHint}>Images auto-advance with fade transition</div>
          </div>
        ) : (
          <>
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
                    placeholder="Caption (optional)…"
                  />
                </div>
              ))}
            </div>
            <button className={styles.addMoreBtn} onClick={handleAddImages}>+ Add More Images</button>
          </>
        )}
      </div>
    </div>
  )
}
