import React, { useState, useEffect, useRef } from 'react'
import { useSanctuaryStore, makeSlide } from '../../store/sanctuaryStore'
import SlideCanvas from '../slides/SlideCanvas'
import { sectionBadge } from '../slides/LyricsSlide'
import LogoEditor from '../slides/editors/LogoEditor'
import CountdownEditor from '../slides/editors/CountdownEditor'
import PptxEditor from '../slides/editors/PptxEditor'
import ScriptureEditor from '../slides/editors/ScriptureEditor'
import { AnnouncementEditor } from '../slides/editors/ScriptureEditor'
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

  return (
    <div className={styles.songEditorWrap}>
      <div className={styles.songEditorHeader}>
        <input
          className={styles.songNameInput}
          value={name}
          onChange={e => handleNameChange(e.target.value)}
          placeholder="Song title"
        />
        <span className={`${styles.autoSaveLabel} ${savedIndicator ? styles.autoSaveVisible : ''}`}>
          ✓ Auto-saved
        </span>
      </div>

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
      case 'pptx':         return <PptxEditor {...props} />
      case 'scripture':    return <ScriptureEditor {...props} />
      case 'announcement': return <AnnouncementEditor {...props} />
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

      {/* Editor controls */}
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

      {/* Per-slide font size / color controls — shown when a tile is selected in preview mode */}
      {isSong && !isEditMode && selectedSlide && selectedSlide.type === 'lyrics' && (
        <div className={styles.tileEditorBar}>
          <span className={styles.tileEditorLabel}>{selectedSlide.section || selectedSlide.name}</span>
          <span className={styles.tileEditorDivider} />
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
