import React, { useState, useEffect } from 'react'
import { useSanctuaryStore } from '../../store/sanctuaryStore'
import { SMART_MEDIA_PRESETS, FONT_OPTIONS, applySmartMedia } from '../slides/SmartMediaPresets'
import LyricsSlide from '../slides/LyricsSlide'
import styles from './ThemeManager.module.css'

const SAMPLE_SLIDE = {
  type: 'lyrics',
  lines: ['I love You Lord', 'Oh Your mercy never fails me', 'All my days'],
  song: 'Sample Song',
  section: 'Chorus 1',
  fontSize: 100,
}

const CUSTOM_THEMES_KEY = 'sanctuary-custom-themes'

function loadCustomThemes() {
  try { return JSON.parse(localStorage.getItem(CUSTOM_THEMES_KEY) || '[]') } catch { return [] }
}
function saveCustomThemes(themes) {
  try { localStorage.setItem(CUSTOM_THEMES_KEY, JSON.stringify(themes)) } catch {}
}

export default function ThemeManager({ onClose }) {
  const { serviceOrder } = useSanctuaryStore()
  const [customThemes, setCustomThemes] = useState(() => loadCustomThemes())
  const [hiddenIds, setHiddenIds] = useState(() => { try { return JSON.parse(localStorage.getItem('sanctuary-hidden-themes') || '[]') } catch { return [] } })
  const [nameOverrides, setNameOverrides] = useState(() => { try { return JSON.parse(localStorage.getItem('sanctuary-theme-names') || '{}') } catch { return {} } })
  const [selected, setSelected] = useState(null)
  const [editingName, setEditingName] = useState(null)
  const [editName, setEditName] = useState('')
  const [applyScope, setApplyScope] = useState('all')

  const songs = serviceOrder.filter(i => i.kind === 'song')

  // All themes combined
  const builtInThemes = SMART_MEDIA_PRESETS
    .filter(p => !hiddenIds.includes(p.id))
    .map(p => ({
      id: p.id,
      label: nameOverrides[p.id] || p.label,
      type: p.type,
      bgImageUrl: p.bgImageUrl || null,
      bgGradient: p.bgGradient || null,
      bgColor: p.bgColor,
      textColor: p.textColor,
      overlayOpacity: p.overlayOpacity,
      fontId: p.fontId || 'montserrat',
      isBuiltIn: true,
    }))

  const allThemes = [...builtInThemes, ...customThemes]

  const selectedTheme = allThemes.find(t => t.id === selected)

  // Preview slide with selected theme applied
  const previewSlide = selectedTheme ? {
    ...SAMPLE_SLIDE,
    ...applySmartMedia(selectedTheme),
  } : { ...SAMPLE_SLIDE, bgColor: '#050813', textColor: '#ffffff' }

  const handleUpload = async () => {
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
    const newTheme = {
      id: `custom-${Date.now()}`,
      label: 'My Theme',
      type: 'image',
      bgImageUrl: dataUrl,
      bgGradient: null,
      bgColor: '#000',
      textColor: '#ffffff',
      overlayOpacity: 0.55,
      fontId: 'montserrat',
      isBuiltIn: false,
    }
    const updated = [...customThemes, newTheme]
    setCustomThemes(updated)
    saveCustomThemes(updated)
    setSelected(newTheme.id)
  }

  const handleDelete = (id) => {
    if (customThemes.find(t => t.id === id)) {
      const updated = customThemes.filter(t => t.id !== id)
      setCustomThemes(updated)
      saveCustomThemes(updated)
    } else {
      // Hide built-in theme
      const updated = [...hiddenIds, id]
      setHiddenIds(updated)
      localStorage.setItem('sanctuary-hidden-themes', JSON.stringify(updated))
    }
    if (selected === id) setSelected(null)
  }

  const handleRename = (id) => {
    const t = allThemes.find(t => t.id === id)
    setEditingName(id)
    setEditName(t.label)
  }

  const handleRenameSubmit = (id) => {
    if (customThemes.find(t => t.id === id)) {
      const updated = customThemes.map(t => t.id === id ? { ...t, label: editName } : t)
      setCustomThemes(updated)
      saveCustomThemes(updated)
    } else {
      // Built-in theme name override
      const updated = { ...nameOverrides, [id]: editName }
      setNameOverrides(updated)
      localStorage.setItem('sanctuary-theme-names', JSON.stringify(updated))
    }
    setEditingName(null)
  }

  const handleApply = () => {
    if (!selectedTheme) return
    const themeChanges = applySmartMedia(selectedTheme)
    useSanctuaryStore.setState(state => ({
      serviceOrder: state.serviceOrder.map(item => {
        if (item.kind !== 'song') return item
        if (applyScope !== 'all' && item.id !== applyScope) return item
        return { ...item, slides: item.slides.map(s => ({ ...s, ...themeChanges })) }
      }),
    }))
    onClose()
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className={styles.header}>
          <span className={styles.title}>Theme Library</span>
          <button className={styles.uploadBtn} onClick={handleUpload}>+ Upload Image</button>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <div className={styles.body}>
          {/* Left: theme grid */}
          <div className={styles.grid}>
            {allThemes.map(theme => (
              <div
                key={theme.id}
                className={`${styles.tile} ${selected === theme.id ? styles.tileSelected : ''}`}
                onClick={() => setSelected(theme.id)}
              >
                {/* Thumbnail */}
                <div
                  className={styles.thumb}
                  style={{
                    background: theme.type === 'image' && theme.bgImageUrl
                      ? `url(${theme.bgImageUrl}) center/cover`
                      : theme.bgGradient || theme.bgColor,
                  }}
                >
                  <div className={styles.thumbOverlay} />
                  <span className={styles.thumbText}>Aa</span>
                </div>

                {/* Name */}
                <div className={styles.tileFooter}>
                  {editingName === theme.id ? (
                    <input
                      className={styles.nameInput}
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onBlur={() => handleRenameSubmit(theme.id)}
                      onKeyDown={e => e.key === 'Enter' && handleRenameSubmit(theme.id)}
                      autoFocus
                      onClick={e => e.stopPropagation()}
                    />
                  ) : (
                    <span className={styles.tileName}>{theme.label}</span>
                  )}
                  <div className={styles.tileActions}>
                    <button className={styles.tileActionBtn}
                      onClick={e => { e.stopPropagation(); handleRename(theme.id) }}
                      title="Rename">✎</button>
                    <button className={`${styles.tileActionBtn} ${styles.deleteBtn}`}
                      onClick={e => { e.stopPropagation(); handleDelete(theme.id) }}
                      title="Delete">×</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right: preview + apply */}
          <div className={styles.sidebar}>
            <div className={styles.previewLabel}>
              {selectedTheme ? selectedTheme.label : 'Select a theme to preview'}
            </div>

            {/* Live preview */}
            <div className={styles.previewCanvas} style={{ containerType: 'size' }}>
              <LyricsSlide slide={previewSlide} />
            </div>

            {/* Apply section */}
            <div className={styles.applySection}>
              <div className={styles.applyLabel}>Apply to</div>
              <select
                className={styles.applySelect}
                value={applyScope}
                onChange={e => setApplyScope(e.target.value)}
              >
                <option value="all">All songs in service</option>
                {songs.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <button
                className={styles.applyBtn}
                onClick={handleApply}
                disabled={!selectedTheme}
              >
                Apply Theme
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
