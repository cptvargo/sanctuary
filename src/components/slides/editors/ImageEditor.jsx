import React, { useState } from 'react'
import styles from './Editor.module.css'
import imgStyles from './ImageEditor.module.css'

async function pickImage() {
  if (typeof window.sanctuary !== 'undefined') {
    return await window.sanctuary.openImageDialog()
  }
  return new Promise(res => {
    const input = document.createElement('input')
    input.type = 'file'; input.accept = 'image/*'
    input.onchange = e => {
      const file = e.target.files[0]; if (!file) { res(null); return }
      const reader = new FileReader()
      reader.onload = ev => res(ev.target.result)
      reader.readAsDataURL(file)
    }
    input.click()
  })
}

export default function ImageEditor({ slide, onChange }) {
  const {
    images = [],          // array of { dataUrl, caption }
    currentIndex = 0,
    displayMode = 'fill',
    bgColor = '#000000',
    // Legacy single image support
    imageDataUrl = null,
    caption = '',
  } = slide

  // Migrate legacy single image to images array
  const allImages = images.length > 0 ? images
    : imageDataUrl ? [{ dataUrl: imageDataUrl, caption }]
    : []

  const [activeIdx, setActiveIdx] = useState(0)

  const handleAddImage = async () => {
    // Use multi-select dialog if available
    if (typeof window.sanctuary !== 'undefined' && window.sanctuary.openImagesDialog) {
      const dataUrls = await window.sanctuary.openImagesDialog()
      if (!dataUrls?.length) return
      const newImgs = dataUrls.map(dataUrl => ({ dataUrl, caption: '' }))
      const updated = [...allImages, ...newImgs]
      onChange({ images: updated, currentIndex: updated.length - 1, imageDataUrl: null })
      setActiveIdx(updated.length - 1)
    } else {
      const dataUrl = await pickImage()
      if (!dataUrl) return
      const updated = [...allImages, { dataUrl, caption: '' }]
      onChange({ images: updated, currentIndex: updated.length - 1, imageDataUrl: null })
      setActiveIdx(updated.length - 1)
    }
  }

  const handleRemove = (idx) => {
    const updated = allImages.filter((_, i) => i !== idx)
    const newIdx = Math.min(activeIdx, updated.length - 1)
    onChange({ images: updated, currentIndex: Math.max(0, newIdx), imageDataUrl: null })
    setActiveIdx(Math.max(0, newIdx))
  }

  const handleCaption = (idx, val) => {
    const updated = allImages.map((img, i) => i === idx ? { ...img, caption: val } : img)
    onChange({ images: updated })
  }

  const handleReplace = async (idx) => {
    const dataUrl = await pickImage()
    if (!dataUrl) return
    const updated = allImages.map((img, i) => i === idx ? { ...img, dataUrl } : img)
    onChange({ images: updated })
  }

  const handleReorder = (idx, dir) => {
    const updated = [...allImages]
    const swap = idx + dir
    if (swap < 0 || swap >= updated.length) return;
    [updated[idx], updated[swap]] = [updated[swap], updated[idx]]
    onChange({ images: updated, currentIndex: swap })
    setActiveIdx(swap)
  }

  return (
    <div className={styles.editor}>
      {/* Toolbar */}
      <div className={styles.row}>
        <label className={styles.label}>Display</label>
        <select className={styles.select} value={displayMode} onChange={e => onChange({ displayMode: e.target.value })}>
          <option value="fill">Fill screen</option>
          <option value="centered">Centered</option>
          <option value="centered-dark">Centered on dark surround</option>
        </select>
        {(displayMode === 'centered' || displayMode === 'centered-dark') && (
          <input type="color" className={styles.colorPicker} value={bgColor}
            onChange={e => onChange({ bgColor: e.target.value })} />
        )}
      </div>

      {/* Image list */}
      <div className={imgStyles.imageList}>
        {allImages.map((img, idx) => (
          <div key={idx} className={`${imgStyles.imageRow} ${idx === activeIdx ? imgStyles.imageRowActive : ''}`}
            onClick={() => { setActiveIdx(idx); onChange({ currentIndex: idx }) }}>
            <div className={imgStyles.thumb} style={{ backgroundImage: `url(${img.dataUrl})` }} />
            <div className={imgStyles.imageInfo}>
              <input
                className={imgStyles.captionInput}
                value={img.caption || ''}
                onChange={e => { e.stopPropagation(); handleCaption(idx, e.target.value) }}
                onClick={e => e.stopPropagation()}
                placeholder={`Caption for image ${idx + 1}…`}
              />
              <span className={imgStyles.imageNum}>{idx + 1} / {allImages.length}</span>
            </div>
            <div className={imgStyles.imageActions} onClick={e => e.stopPropagation()}>
              <button className={imgStyles.actionBtn} onClick={() => handleReorder(idx, -1)} disabled={idx === 0} title="Move up">↑</button>
              <button className={imgStyles.actionBtn} onClick={() => handleReorder(idx, 1)} disabled={idx === allImages.length - 1} title="Move down">↓</button>
              <button className={imgStyles.actionBtn} onClick={() => handleReplace(idx)} title="Replace">↺</button>
              <button className={`${imgStyles.actionBtn} ${imgStyles.deleteBtn}`} onClick={() => handleRemove(idx)} title="Remove">×</button>
            </div>
          </div>
        ))}

        {allImages.length === 0 && (
          <div className={imgStyles.empty}>No images yet — click Add Image to start</div>
        )}
      </div>

      <button className={imgStyles.addBtn} onClick={handleAddImage}>
        + Add Image
      </button>
    </div>
  )
}
