import React, { useState } from 'react'
import { SMART_MEDIA_PRESETS, FONT_OPTIONS, applySmartMedia } from '../SmartMediaPresets'
import styles from './Editor.module.css'
import CustomImageManager, { loadCustomImages } from '../../panels/CustomImageManager'
import smStyles from './SmartMedia.module.css'

export default function LyricsEditor({ slide, onChange }) {
  const {
    lines = ['', '', '', ''],
    song = '', section = '',
    textColor = '#ffffff',
    fontSize = 100,
    smartMediaId = 'none',
    bgImageUrl = null,
    bgOverlayOpacity = 0.55,
    fontId = 'montserrat',
  } = slide

  const [showSmartMedia, setShowSmartMedia] = useState(false)
  const [showMyImages, setShowMyImages] = useState(false)
  const [customImages, setCustomImages] = useState(() => loadCustomImages())

  const updateLine = (i, value) => {
    const next = [...lines]; next[i] = value; onChange({ lines: next })
  }
  const addLine = () => onChange({ lines: [...lines, ''] })
  const removeLine = (i) => onChange({ lines: lines.filter((_, idx) => idx !== i) })

  const handleSmartMedia = (preset) => {
    onChange(applySmartMedia(preset))
    setShowSmartMedia(false)
  }

  const handleBgImage = async () => {
    let dataUrl = null
    if (typeof window.sanctuary !== 'undefined') {
      dataUrl = await window.sanctuary.openImageDialog()
    } else {
      dataUrl = await new Promise(res => {
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
    if (dataUrl) onChange(applySmartMedia(null, dataUrl, bgOverlayOpacity))
  }

  const imagePresets = SMART_MEDIA_PRESETS.filter(p => p.type === 'image')
  const gradientPresets = SMART_MEDIA_PRESETS.filter(p => p.type === 'gradient' || p.type === 'color')

  return (
    <div className={styles.editor}>
      <div className={styles.row}>
        <label className={styles.label}>Song</label>
        <input className={styles.input} value={song} onChange={e => onChange({ song: e.target.value })} placeholder="Song title" />
        <label className={styles.label}>Section</label>
        <input className={styles.input} value={section} onChange={e => onChange({ section: e.target.value })} placeholder="Verse 1, Chorus…" style={{ width: 110 }} />
      </div>

      {/* Smart Media */}
      <div className={styles.row} style={{ marginTop: 4 }}>
        <button className={smStyles.smartMediaBtn} onClick={() => setShowSmartMedia(!showSmartMedia)}>
          ✦ Smart Media {showSmartMedia ? '▴' : '▾'}
        </button>
        <button
          className={smStyles.myImagesBtn}
          onClick={() => { setCustomImages(loadCustomImages()); setShowMyImages(true) }}
        >
          🖼 My Images
        </button>
        {(bgImageUrl || smartMediaId !== 'none') && (
          <button className={styles.resetBtn} onClick={() => onChange({ bgImageUrl: null, bgGradient: null, bgColor: '#050813', smartMediaId: 'none' })}>
            Clear
          </button>
        )}
        {smartMediaId !== 'none' && smartMediaId && (
          <span style={{ fontSize: 10, color: 'var(--accent)', marginLeft: 4 }}>
            ✓ {SMART_MEDIA_PRESETS.find(p => p.id === smartMediaId)?.label || 'Custom'}
          </span>
        )}
      </div>

      {showSmartMedia && (
        <div style={{ paddingBottom: 4 }}>
          {/* Image backgrounds */}
          <div className={smStyles.presetSection}>
            <div className={smStyles.presetSectionLabel}>Image Backgrounds</div>
            <div className={smStyles.presetGrid}>
              {imagePresets.map(preset => (
                <div
                  key={preset.id}
                  className={`${smStyles.preset} ${smartMediaId === preset.id ? smStyles.presetActive : ''}`}
                  onClick={() => handleSmartMedia(preset)}
                  style={{ backgroundImage: `url(${preset.preview})` }}
                  title={preset.label}
                >
                  <span className={smStyles.presetLabel}>{preset.label}</span>
                </div>
              ))}
              {/* Custom image upload */}
              <div
                className={`${smStyles.preset} ${smartMediaId === 'custom-image' ? smStyles.presetActive : ''}`}
                onClick={handleBgImage}
                style={{
                  backgroundImage: (bgImageUrl && smartMediaId === 'custom-image') ? `url(${bgImageUrl})` : 'none',
                  background: (bgImageUrl && smartMediaId === 'custom-image') ? undefined : '#1a1a2a',
                  border: '1px dashed var(--accent-border)',
                }}
              >
                <span className={smStyles.presetLabel}>{(bgImageUrl && smartMediaId === 'custom-image') ? '✓ Custom' : '+ Upload'}</span>
              </div>
            </div>
          </div>

          {/* Gradient/color backgrounds */}
          <div className={smStyles.presetSection}>
            <div className={smStyles.presetSectionLabel}>Gradient Backgrounds</div>
            <div className={smStyles.presetGrid}>
              {gradientPresets.map(preset => (
                <div
                  key={preset.id}
                  className={`${smStyles.preset} ${smartMediaId === preset.id ? smStyles.presetActive : ''}`}
                  onClick={() => handleSmartMedia(preset)}
                  style={{ background: preset.preview }}
                  title={preset.label}
                >
                  <span className={smStyles.presetLabel}>{preset.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Overlay slider — shown when image background is active */}
      {bgImageUrl && (
        <div className={styles.row}>
          <label className={styles.label}>Overlay</label>
          <input
            type="range" min={0} max={0.9} step={0.05}
            value={bgOverlayOpacity}
            onChange={e => onChange({ bgOverlayOpacity: Number(e.target.value) })}
            style={{ flex: 1, accentColor: 'var(--accent)' }}
          />
          <span className={styles.label} style={{ minWidth: 36, textAlign: 'right' }}>
            {Math.round(bgOverlayOpacity * 100)}%
          </span>
        </div>
      )}

      {/* Font style */}
      <div className={styles.row} style={{ marginTop: 4 }}>
        <label className={styles.label}>Font</label>
        <select className={styles.select} value={fontId} onChange={e => onChange({ fontId: e.target.value })}>
          {FONT_OPTIONS.map(f => (
            <option key={f.id} value={f.id}>{f.label} — {f.description}</option>
          ))}
        </select>
      </div>

      {/* Font size */}
      <div className={styles.row} style={{ marginTop: 4 }}>
        <label className={styles.label}>Font size</label>
        <input
          type="range" min={40} max={180} step={5}
          value={fontSize}
          onChange={e => onChange({ fontSize: Number(e.target.value) })}
          style={{ flex: 1, accentColor: 'var(--accent)' }}
        />
        <span className={styles.label} style={{ minWidth: 36, textAlign: 'right' }}>{fontSize}%</span>
        <button className={styles.removeBtn}
          style={{ fontSize: 10, padding: '2px 6px', opacity: fontSize !== 100 ? 1 : 0.3 }}
          onClick={() => onChange({ fontSize: 100 })}>↺</button>
      </div>

      <div className={styles.sectionLabel}>Lyrics Lines</div>
      {lines.map((line, i) => (
        <div key={i} className={styles.lineRow}>
          <span className={styles.lineNum}>{i + 1}</span>
          <input className={`${styles.input} ${styles.lineInput}`} value={line}
            onChange={e => updateLine(i, e.target.value)} placeholder={`Line ${i + 1}…`} />
          <button className={styles.removeBtn} onClick={() => removeLine(i)}>×</button>
        </div>
      ))}
      <button className={styles.addLineBtn} onClick={addLine}>+ Add line</button>

      <div className={styles.row} style={{ marginTop: 8 }}>
        <label className={styles.label}>Text color</label>
        <input type="color" className={styles.colorPicker} value={textColor}
          onChange={e => onChange({ textColor: e.target.value })} />
      </div>

      {showMyImages && (
        <CustomImageManager
          onClose={() => setShowMyImages(false)}
          onSelect={(img) => {
            onChange({
              bgImageUrl: img.dataUrl,
              bgGradient: null,
              bgColor: '#000000',
              bgOverlayOpacity: 0.50,
              textColor: '#ffffff',
              smartMediaId: img.id,
              fontId: 'montserrat',
            })
            setShowMyImages(false)
          }}
        />
      )}
    </div>
  )
}
