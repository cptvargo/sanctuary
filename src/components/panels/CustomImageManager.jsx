import React, { useState, useEffect } from 'react'
import styles from './CustomImageManager.module.css'

const STORAGE_KEY = 'sanctuary-custom-backgrounds'

export function loadCustomImages() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (_) { return [] }
}

function saveCustomImages(images) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(images))
  } catch (_) {}
}

export default function CustomImageManager({ onClose, onSelect }) {
  const [images, setImages] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')

  useEffect(() => {
    setImages(loadCustomImages())
  }, [])

  const handleUpload = async () => {
    const file = await new Promise(res => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.onchange = e => res(e.target.files[0] || null)
      input.click()
    })
    if (!file) return

    const dataUrl = await new Promise(res => {
      const reader = new FileReader()
      reader.onload = e => res(e.target.result)
      reader.readAsDataURL(file)
    })

    const name = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase())

    const newImage = {
      id: `custom-${Date.now()}`,
      name,
      dataUrl,
      addedAt: new Date().toISOString(),
    }

    const updated = [...images, newImage]
    setImages(updated)
    saveCustomImages(updated)
  }

  const handleRename = (id) => {
    const img = images.find(i => i.id === id)
    setEditingId(id)
    setEditName(img.name)
  }

  const handleRenameSubmit = (id) => {
    const updated = images.map(i => i.id === id ? { ...i, name: editName } : i)
    setImages(updated)
    saveCustomImages(updated)
    setEditingId(null)
  }

  const handleDelete = (id) => {
    const updated = images.filter(i => i.id !== id)
    setImages(updated)
    saveCustomImages(updated)
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <span className={styles.title}>My Backgrounds</span>
          <button className={styles.uploadBtn} onClick={handleUpload}>+ Upload Image</button>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        {images.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🖼</div>
            <div className={styles.emptyText}>No custom backgrounds yet</div>
            <div className={styles.emptyHint}>Upload images to build your own library</div>
            <button className={styles.uploadBtnLarge} onClick={handleUpload}>+ Upload your first image</button>
          </div>
        ) : (
          <div className={styles.grid}>
            {images.map(img => (
              <div key={img.id} className={styles.card}>
                <div
                  className={styles.preview}
                  style={{ backgroundImage: `url(${img.dataUrl})` }}
                  onClick={() => onSelect && onSelect(img)}
                />
                <div className={styles.cardFooter}>
                  {editingId === img.id ? (
                    <input
                      className={styles.nameInput}
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onBlur={() => handleRenameSubmit(img.id)}
                      onKeyDown={e => e.key === 'Enter' && handleRenameSubmit(img.id)}
                      autoFocus
                    />
                  ) : (
                    <span
                      className={styles.name}
                      onClick={() => handleRename(img.id)}
                      title="Click to rename"
                    >
                      {img.name}
                    </span>
                  )}
                  <div className={styles.cardActions}>
                    <button className={styles.applyBtn} onClick={() => onSelect && onSelect(img)}>
                      Apply
                    </button>
                    <button className={styles.deleteBtn} onClick={() => handleDelete(img.id)}>
                      ×
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
