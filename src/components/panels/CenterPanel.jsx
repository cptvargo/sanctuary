import React, { useState, useEffect, useRef } from 'react'
import { useSanctuaryStore, makeSlide } from '../../store/sanctuaryStore'
import SlideCanvas from '../slides/SlideCanvas'
import { sectionBadge } from '../slides/LyricsSlide'
import { SMART_MEDIA_PRESETS, applySmartMedia } from '../slides/SmartMediaPresets'
import CustomImageManager, { loadCustomImages } from './CustomImageManager'
import LogoEditor from '../slides/editors/LogoEditor'
import CountdownEditor from '../slides/editors/CountdownEditor'
import ScriptureEditor from '../slides/editors/ScriptureEditor'
import { AnnouncementEditor } from '../slides/editors/ScriptureEditor'
import ImageEditor from '../slides/editors/ImageEditor'
import styles from './CenterPanel.module.css'

const BADGE_COLORS = { C:'#ff9500',C1:'#ff9500',C2:'#ff9500',C3:'#ff9500', B:'#bf5af2',B2:'#bf5af2', PC:'#30d158', I:'#636366', O:'#636366', T:'#30d158' }
function badgeColorFor(section) {
  const b = sectionBadge(section)
  if (BADGE_COLORS[b]) return BADGE_COLORS[b]
  if (/^\d+$/.test(b)) return '#7b8fff'
  return '#636366'
}

// ─── Song text parser ─────────────────────────────────────────────────────────

const SECTION_RE = /^\[(.+)\]$/i

function parseSongText(text, songName) {
  const lines = text.split('\n')
  const slides = []
  let section = ''
  let buffer = []

  const flush = (sec, buf) => {
    if (!buf.length) return
    // One section = one slide, no splitting
    slides.push(makeSlide('lyrics', {
      name: sec || `Slide ${slides.length + 1}`,
      song: songName,
      section: sec,
      lines: buf,
    }))
  }

  for (const raw of lines) {
    const line = raw.trimEnd()
    const m = line.match(SECTION_RE)
    if (m) { flush(section, buffer); section = m[1]; buffer = [] }
    else if (line === '' && buffer.length === 0) continue
    else buffer.push(line)
  }
  flush(section, buffer)
  return slides
}

function slidesToText(slides) {
  const seen = new Map()
  for (const s of slides) {
    const base = (s.section || s.name || '').replace(/\s*\(\d+\/\d+\)$/, '')
    if (!seen.has(base)) seen.set(base, [])
    seen.get(base).push(...(s.lines || []))
  }
  return [...seen.entries()].map(([k, v]) => `[${k}]\n${v.join('\n')}`).join('\n\n')
}

// ─── Slide grid for a song ────────────────────────────────────────────────────

function SongSlideGrid({ item }) {
  const { activeSlideId, liveSlideId, isLive, mode } = useSanctuaryStore()
  const isClickToSend = isLive && mode === 'preview'

  const handleClick = (slide) => {
    // Always select the slide
    useSanctuaryStore.setState({ activeSlideId: slide.id })
    // If live + preview mode: push to projector immediately
    if (isLive && useSanctuaryStore.getState().mode === 'preview') {
      useSanctuaryStore.setState({ liveSlideId: slide.id, isBlackOut: false })
      useSanctuaryStore.getState()._syncProjector()
    }
  }

  return (
    <div className={styles.slideGrid}>
      {item.slides.map((slide, idx) => {
        const isActive = slide.id === activeSlideId
        const isLiveSlide = slide.id === liveSlideId
        return (
          <div
            key={slide.id}
            className={`${styles.slideTile} ${isActive ? styles.tileActive : ''} ${isLiveSlide ? styles.tileLive : ''} ${isClickToSend ? styles.tileClickable : styles.tileSelectable}`}
            onClick={() => handleClick(slide)}
          >
            <div className={styles.tileCanvas}>
              <SlideCanvas slide={slide} mini />
            </div>
            <div className={styles.tileLabel}>
              <span className={styles.tileName}>{slide.section || slide.name}</span>
              {isLiveSlide && <span className={styles.tileLiveBadge}>LIVE</span>}
              {!isLiveSlide && slide.section && (
                <span className={styles.tileSectionBadge} style={{ background: badgeColorFor(slide.section) }}>
                  {sectionBadge(slide.section)}
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Song text editor ─────────────────────────────────────────────────────────

function SongTextEditor({ item }) {
  const [name, setName] = useState(item.name)
  const [text, setText] = useState(() => slidesToText(item.slides))
  const [preview, setPreview] = useState([])
  const [savedIndicator, setSavedIndicator] = useState(false)
  const debounceRef = useRef(null)

  // Sync when item changes (switching songs)
  useEffect(() => {
    setName(item.name)
    setText(slidesToText(item.slides))
  }, [item.id])

  useEffect(() => {
    setPreview(parseSongText(text, name))
  }, [text, name])

  // Auto-save with debounce
  const autoSave = (newText, newName) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const newSlides = parseSongText(newText, newName)
      useSanctuaryStore.setState(state => ({
        serviceOrder: state.serviceOrder.map(i =>
          i.id === item.id ? { ...i, name: newName, slides: newSlides } : i
        ),
      }))
      setSavedIndicator(true)
      setTimeout(() => setSavedIndicator(false), 1200)
    }, 600)
  }

  const handleTextChange = (val) => {
    setText(val)
    autoSave(val, name)
  }

  const handleNameChange = (val) => {
    setName(val)
    autoSave(text, val)
  }

  const [showThemePicker, setShowThemePicker] = useState(false)
  const [showMyImages, setShowMyImages] = useState(false)

  const applyThemeToAllSlides = (preset) => {
    const themeChanges = applySmartMedia(preset)
    useSanctuaryStore.setState(state => ({
      serviceOrder: state.serviceOrder.map(i =>
        i.id === item.id && i.kind === 'song'
          ? { ...i, slides: i.slides.map(s => ({ ...s, ...themeChanges })) }
          : i
      ),
    }))
    setShowThemePicker(false)
  }

  return (
    <div className={styles.songEditorWrap}>
      <div className={styles.songEditorHeader}>
        <input
          className={styles.songNameInput}
          value={name}
          onChange={e => handleNameChange(e.target.value)}
          placeholder="Song title"
        />
        <button
          className={styles.themePickerBtn}
          onClick={() => setShowThemePicker(!showThemePicker)}
          title="Apply background theme to all slides in this song"
        >
          ✦ Theme {showThemePicker ? '▴' : '▾'}
        </button>
        <button
          className={styles.themePickerBtn}
          onClick={() => setShowMyImages(true)}
          title="Apply your own uploaded image to all slides"
          style={{ marginLeft: 4 }}
        >
          🖼 My Images
        </button>
        <span className={`${styles.autoSaveLabel} ${savedIndicator ? styles.autoSaveVisible : ''}`}>
          ✓ Auto-saved
        </span>
      </div>

      {/* Theme picker — applies to ALL slides in this song at once */}
      {showThemePicker && (
        <div className={styles.themePickerWrap}>
          <div className={styles.themePickerLabel}>Apply to all slides in this song</div>
          <div className={styles.themeGrid}>
            {SMART_MEDIA_PRESETS.map(preset => (
              <div
                key={preset.id}
                className={styles.themePreset}
                onClick={() => applyThemeToAllSlides(preset)}
                style={{
                  background: preset.type === 'image'
                    ? `url(${preset.bgImageUrl}) center/cover`
                    : preset.preview,
                }}
                title={preset.label}
              >
                <span className={styles.themePresetLabel}>{preset.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showMyImages && (
        <CustomImageManager
          onClose={() => setShowMyImages(false)}
          onSelect={(img) => {
            const themeChanges = {
              bgImageUrl: img.dataUrl,
              bgGradient: null,
              bgColor: '#000000',
              bgOverlayOpacity: 0.50,
              textColor: '#ffffff',
              smartMediaId: img.id,
              fontId: 'montserrat',
            }
            useSanctuaryStore.setState(state => ({
              serviceOrder: state.serviceOrder.map(i =>
                i.id === item.id && i.kind === 'song'
                  ? { ...i, slides: i.slides.map(s => ({ ...s, ...themeChanges })) }
                  : i
              ),
            }))
            setShowMyImages(false)
          }}
        />
      )}

      <div className={styles.songEditorBody}>
        {/* Left: text input */}
        <div className={styles.textEditorPane}>
          <div className={styles.textEditorHint}>
            Use <code>[Section Name]</code> to create sections — e.g. <code>[Verse 1]</code>, <code>[Chorus]</code>, <code>[Bridge]</code>
          </div>
          <textarea
            className={styles.lyricsTextarea}
            value={text}
            onChange={e => handleTextChange(e.target.value)}
            spellCheck={false}
            placeholder={`[Verse 1]\nI love You Lord\nOh Your mercy never fails me\nAll my days\n\n[Chorus]\nAll my life You have been faithful\nAll my life You have been so so good`}
          />
        </div>

        {/* Right: live preview of generated slides */}
        <div className={styles.previewPane}>
          <div className={styles.previewPaneHeader}>
            Preview — {preview.length} slide{preview.length !== 1 ? 's' : ''}
          </div>
          <div className={styles.previewSlides}>
            {preview.map((slide, i) => (
              <div key={i} className={styles.previewCard}>
                <div className={styles.previewCardSection}>{slide.section || slide.name}</div>
                {(slide.lines || []).filter(Boolean).map((line, j) => (
                  <div key={j} className={styles.previewCardLine}>{line}</div>
                ))}
              </div>
            ))}
            {!preview.length && (
              <div className={styles.previewEmpty}>Add section labels and lyrics to see slides</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Standalone slide editor ──────────────────────────────────────────────────

function StandaloneEditor({ item }) {
  const { updateSlide, liveSlideId, isLive, mode } = useSanctuaryStore()
  const slide = item.slide
  const isLiveSlide = slide.id === liveSlideId
  const isClickToSend = isLive && mode === 'preview'

  const handleClick = () => {
    useSanctuaryStore.setState({ activeSlideId: slide.id })
    if (isLive && useSanctuaryStore.getState().mode === 'preview') {
      useSanctuaryStore.setState({ liveSlideId: slide.id, isBlackOut: false })
      useSanctuaryStore.getState()._syncProjector()
    }
  }

  const onChange = (changes) => updateSlide(slide.id, changes)
  const props = { slide, onChange }

  const renderEditor = () => {
    switch (slide.type) {
      case 'logo':         return <LogoEditor {...props} />
      case 'countdown':    return <CountdownEditor {...props} />
      case 'scripture':    return <ScriptureEditor {...props} />
      case 'announcement': return <AnnouncementEditor {...props} />
      case 'image':         return <ImageEditor {...props} />
      default:             return null
    }
  }

  return (
    <div className={styles.standaloneWrap}>
      {/* Big slide preview — clickable when live */}
      <div
        className={`${styles.standaloneCanvas} ${styles.canvasClickable} ${isLiveSlide ? styles.canvasLive : ''}`}
        onClick={handleClick}
      >
        <SlideCanvas slide={slide} />
        {isLiveSlide && <div className={styles.liveOverlayBadge}>LIVE</div>}
        {isClickToSend && !isLiveSlide && <div className={styles.clickToSendOverlay}>Click to send live</div>}
      </div>

      {/* Editor controls — edit mode only */}
      {mode === 'edit' && renderEditor() && (
        <div className={styles.standaloneEditor}>
          {renderEditor()}
        </div>
      )}
    </div>
  )
}

// ─── Main CenterPanel ─────────────────────────────────────────────────────────

export default function CenterPanel({ activeItem }) {
  const { mode, isLive } = useSanctuaryStore()
  if (!activeItem) {
    return (
      <div className={styles.panel}>
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>◻</div>
          <div className={styles.emptyText}>Select an item from the service order</div>
        </div>
      </div>
    )
  }

  const isSong = activeItem.kind === 'song'
  const isEditMode = mode === 'edit'
  const isClickToSend = isLive && mode === 'preview'

  // Track which slide tile is selected for per-slide editing
  const { activeSlideId, updateSlide } = useSanctuaryStore()
  const selectedSlide = isSong
    ? activeItem.slides.find(s => s.id === activeSlideId) || null
    : null

  return (
    <div className={styles.panel}>
      {/* Item header */}
      <div className={styles.itemHeader}>
        <div className={styles.itemTitle}>
          <span className={styles.itemIcon}>{isSong ? '♪' : '◻'}</span>
          <span className={styles.itemName}>{isSong ? activeItem.name : activeItem.slide?.name}</span>
          {isSong && <span className={styles.slideCount}>{activeItem.slides.length} slides</span>}
        </div>
        <div className={styles.itemActions}>
          {isClickToSend && (
            <span className={styles.liveHint}>● Preview — click any slide to send live</span>
          )}
          {isSong && isEditMode && (
            <span className={styles.editingBadge}>✎ Editing — changes auto-save</span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {isSong && isEditMode ? (
          // Edit mode: song text editor fills the center
          <SongTextEditor item={activeItem} />
        ) : isSong ? (
          // Preview/Control mode: slide grid for clicking to send live
          <SongSlideGrid item={activeItem} />
        ) : (
          <StandaloneEditor item={activeItem} />
        )}
      </div>

      {/* Per-slide controls — shown when a tile is selected */}
      {isSong && !isEditMode && selectedSlide && selectedSlide.type === 'lyrics' && (
        <div className={styles.tileEditorBar}>
          <span className={styles.tileEditorLabel}>{selectedSlide.section || selectedSlide.name}</span>
          <span className={styles.tileEditorDivider} />

          {/* Image overlay dimmer — show when slide has any image background */}
          {(selectedSlide.bgImageUrl || (selectedSlide.smartMediaId && selectedSlide.smartMediaId !== 'none')) && (
            <>
              <label className={styles.tileEditorFieldLabel}>🌑 Dim</label>
              <input
                type="range"
                min={0} max={0.95} step={0.05}
                value={selectedSlide.bgOverlayOpacity ?? 0.55}
                onChange={e => {
                  const val = Number(e.target.value)
                  // Apply to ALL slides in this song that share the same bgImageUrl
                  const store = useSanctuaryStore.getState()
                  store.serviceOrder.forEach(item => {
                    if (item.kind === 'song' && item.id === activeItem.id) {
                      item.slides.forEach(s => {
                        if (s.bgImageUrl === selectedSlide.bgImageUrl) {
                          store.updateSlide(s.id, { bgOverlayOpacity: val })
                        }
                      })
                    }
                  })
                }}
                style={{ width: 90, accentColor: 'var(--accent)' }}
              />
              <span className={styles.tileEditorVal}>
                {Math.round((selectedSlide.bgOverlayOpacity ?? 0.55) * 100)}%
              </span>
              <span className={styles.tileEditorDivider} />
            </>
          )}

          <label className={styles.tileEditorFieldLabel}>Font size</label>
          <input
            type="range"
            min={40} max={180} step={5}
            value={selectedSlide.fontSize || 100}
            onChange={e => updateSlide(selectedSlide.id, { fontSize: Number(e.target.value) })}
            style={{ width: 100, accentColor: 'var(--accent)' }}
          />
          <span className={styles.tileEditorVal}>{selectedSlide.fontSize || 100}%</span>
          <button
            className={styles.tileEditorReset}
            onClick={() => updateSlide(selectedSlide.id, { fontSize: 100 })}
          >↺</button>
        </div>
      )}
    </div>
  )
}
