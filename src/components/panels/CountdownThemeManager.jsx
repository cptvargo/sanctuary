import React, { useState } from 'react'
import { persistGetSync, persistSetSync } from '../../utils/persistentStorage'
import { useSanctuaryStore } from '../../store/sanctuaryStore'
import { CountdownRenderer } from '../slides/CountdownSlide'
import styles from './CountdownThemeManager.module.css'

const COUNTDOWN_THEMES = [
  { id: 'default-blue',  label: 'Classic Blue',   timerStyle: 'default', bgColor: '#000000', accentColor: '#4a9edd', bgImageUrl: null, bgOverlayOpacity: 0.6 },
  { id: 'default-white', label: 'Classic White',  timerStyle: 'default', bgColor: '#050813', accentColor: '#ffffff', bgImageUrl: null, bgOverlayOpacity: 0.6 },
  { id: 'band-blue',     label: 'Band — Blue',    timerStyle: 'band',    bgColor: '#0a0a0a', accentColor: '#4a9edd', bgImageUrl: null, bgOverlayOpacity: 0.75 },
  { id: 'band-white',    label: 'Band — White',   timerStyle: 'band',    bgColor: '#0a0a0a', accentColor: '#ffffff', bgImageUrl: null, bgOverlayOpacity: 0.75 },
  { id: 'minimal-white', label: 'Minimal',        timerStyle: 'minimal', bgColor: '#000000', accentColor: '#ffffff', bgImageUrl: null, bgOverlayOpacity: 0.6 },
  { id: 'minimal-gold',  label: 'Minimal — Gold', timerStyle: 'minimal', bgColor: '#080600', accentColor: '#c8a84a', bgImageUrl: null, bgOverlayOpacity: 0.6 },
  { id: 'risen',         label: 'He Is Risen',    timerStyle: 'risen',      bgColor: '#1a0800', accentColor: '#f5c842', bgImageUrl: './backgrounds/bg-he-is-risen.jpg', bgOverlayOpacity: 0.28, message: 'Service begins in', subMessage: 'He Is Risen' },
  { id: 'victorious',    label: 'Victorious',      timerStyle: 'victorious', bgColor: '#f0f0f0', accentColor: '#e8140a', bgImageUrl: './backgrounds/bg-victorious.jpg', bgOverlayOpacity: 0 },
]

const CUSTOM_KEY = 'sanctuary-countdown-themes'
function loadCustom() { return persistGetSync(CUSTOM_KEY) || [] }
function saveCustom(t) { persistSetSync(CUSTOM_KEY, t) }

const PREVIEW_SLIDE = { type: 'countdown', message: 'Service begins in', subMessage: 'Welcome — please be seated', durationMinutes: 5 }

export default function CountdownThemeManager({ slide, onClose }) {
  const { updateSlide } = useSanctuaryStore()
  const [custom, setCustom] = useState(loadCustom)
  const [selected, setSelected] = useState(null)

  const allThemes = [...COUNTDOWN_THEMES, ...custom]
  const selectedTheme = allThemes.find(t => t.id === selected)
  const previewSlide = selectedTheme
    ? { ...PREVIEW_SLIDE, ...selectedTheme }
    : { ...PREVIEW_SLIDE, bgColor: '#000', accentColor: '#4a9edd', timerStyle: 'default' }

  const handleUploadBg = async () => {
    const dataUrl = await new Promise(res => {
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
    if (!dataUrl) return
    const newTheme = { id: `custom-cd-${Date.now()}`, label: 'My Countdown', timerStyle: 'band', bgColor: '#000', accentColor: '#ffffff', bgImageUrl: dataUrl, bgOverlayOpacity: 0.55 }
    const updated = [...custom, newTheme]
    setCustom(updated)
    saveCustom(updated)
    setSelected(newTheme.id)
  }

  const handleDelete = (id) => {
    const updated = custom.filter(t => t.id !== id)
    setCustom(updated); saveCustom(updated)
    if (selected === id) setSelected(null)
  }

  const handleApply = () => {
    if (!selectedTheme || !slide?.id) return
    const { id: _id, label: _label, message, subMessage, ...themeProps } = selectedTheme
    const updates = { ...themeProps }
    if (message) updates.message = message
    if (subMessage) updates.subMessage = subMessage
    updateSlide(slide.id, updates)
    useSanctuaryStore.getState()._syncProjector()
    onClose()
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <span className={styles.title}>Countdown Themes</span>
          <button className={styles.uploadBtn} onClick={handleUploadBg}>+ Upload Background</button>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <div className={styles.body}>
          <div className={styles.grid}>
            {allThemes.map(theme => {
              const isCustom = !!custom.find(t => t.id === theme.id)
              const thumbSlide = { ...PREVIEW_SLIDE, ...theme }
              return (
                <div key={theme.id}
                  className={`${styles.tile} ${selected === theme.id ? styles.tileSelected : ''}`}
                  onClick={() => setSelected(theme.id)}>
                  <div className={styles.thumb} style={{ containerType: 'size' }}>
                    <CountdownRenderer slide={thumbSlide} timeStr="4:56" isExpired={false} />
                  </div>
                  <div className={styles.tileFooter}>
                    <span className={styles.tileName}>{theme.label}</span>
                    {isCustom && (
                      <button className={styles.deleteBtn}
                        onClick={e => { e.stopPropagation(); handleDelete(theme.id) }}
                        title="Delete">×</button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div className={styles.sidebar}>
            <div className={styles.previewLabel}>{selectedTheme ? selectedTheme.label : 'Select a theme to preview'}</div>
            <div className={styles.previewCanvas} style={{ containerType: 'size' }}>
              <CountdownRenderer slide={previewSlide} timeStr="4:56" isExpired={false} />
            </div>
            {selectedTheme && (
              <div className={styles.styleInfo}>
                <span className={styles.stylePill}>{selectedTheme.timerStyle || 'default'}</span>
              </div>
            )}
            <button className={styles.applyBtn} onClick={handleApply} disabled={!selectedTheme}>
              Apply to Countdown
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
