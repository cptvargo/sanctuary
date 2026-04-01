import React, { useState, useEffect } from 'react'
import { useSanctuaryStore } from '../../store/sanctuaryStore'
import { makeSlide } from '../../store/sanctuaryStore'
import styles from './SongEditor.module.css'

// ─── Parse song text into slides ─────────────────────────────────────────────
// Supports labels like: [Verse 1], [Chorus], [Bridge], [Pre-Chorus], [Outro]
// Lines per slide: auto-split long sections every N lines

const SECTION_RE = /^\[(.+)\]$/

function parseSongText(text, linesPerSlide = 4, songName = '') {
  const lines = text.split('\n')
  const slides = []
  let currentSection = ''
  let currentLines = []

  const flushSection = (section, lns) => {
    if (!lns.length) return
    // Split long sections into multiple slides
    for (let i = 0; i < lns.length; i += linesPerSlide) {
      const chunk = lns.slice(i, i + linesPerSlide)
      const isMulti = lns.length > linesPerSlide
      const partNum = Math.floor(i / linesPerSlide) + 1
      const totalParts = Math.ceil(lns.length / linesPerSlide)
      const label = isMulti && totalParts > 1 ? `${section} (${partNum}/${totalParts})` : section
      slides.push(makeSlide('lyrics', {
        name: label || `Slide ${slides.length + 1}`,
        song: songName,
        section: label,
        lines: chunk,
      }))
    }
  }

  for (const raw of lines) {
    const line = raw.trimEnd()
    const match = line.match(SECTION_RE)
    if (match) {
      flushSection(currentSection, currentLines)
      currentSection = match[1]
      currentLines = []
    } else {
      // Skip blank lines between sections but keep blanks within
      if (line === '' && currentLines.length === 0) continue
      currentLines.push(line)
    }
  }
  flushSection(currentSection, currentLines)

  return slides
}

// ─── Convert slides back to song text ────────────────────────────────────────

function slidesToText(slides) {
  // Merge slides that share the same base section name (de-duplicate multi-part labels)
  const sections = new Map()
  for (const slide of slides) {
    // Strip "(1/2)" style suffixes to recover the base section name
    const base = (slide.section || slide.name || '').replace(/\s*\(\d+\/\d+\)$/, '')
    if (!sections.has(base)) sections.set(base, [])
    sections.get(base).push(...slide.lines.filter(l => l !== undefined))
  }
  return Array.from(sections.entries())
    .map(([section, lines]) => `[${section}]\n${lines.join('\n')}`)
    .join('\n\n')
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SongEditor({ song, onClose }) {
  const { updateSongName, serviceOrder } = useSanctuaryStore()

  // Reconstruct full text from current slides
  const [songName, setSongName] = useState(song.name)
  const [text, setText] = useState(() => slidesToText(song.slides))
  const [linesPerSlide, setLinesPerSlide] = useState(4)
  const [preview, setPreview] = useState([])
  const [saved, setSaved] = useState(false)

  // Live preview of parsed slides
  useEffect(() => {
    const slides = parseSongText(text, linesPerSlide, songName)
    setPreview(slides)
  }, [text, linesPerSlide, songName])

  const handleSave = () => {
    const newSlides = parseSongText(text, linesPerSlide, songName)
    useSanctuaryStore.setState(state => ({
      serviceOrder: state.serviceOrder.map(item =>
        item.id === song.id
          ? { ...item, name: songName, slides: newSlides }
          : item
      ),
    }))
    setSaved(true)
    setTimeout(() => { setSaved(false); onClose() }, 600)
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onClose}>‹ Back</button>
        <span className={styles.title}>Song Editor</span>
        <button className={`${styles.saveBtn} ${saved ? styles.saved : ''}`} onClick={handleSave}>
          {saved ? '✓ Saved' : 'Save'}
        </button>
      </div>

      {/* Song name */}
      <div className={styles.nameRow}>
        <span className={styles.nameLabel}>Song title</span>
        <input
          className={styles.nameInput}
          value={songName}
          onChange={e => setSongName(e.target.value)}
          placeholder="Song title"
        />
      </div>

      {/* Lines per slide */}
      <div className={styles.optRow}>
        <span className={styles.optLabel}>Lines per slide</span>
        <div className={styles.stepper}>
          <button className={styles.stepBtn} onClick={() => setLinesPerSlide(l => Math.max(1, l - 1))}>−</button>
          <span className={styles.stepVal}>{linesPerSlide}</span>
          <button className={styles.stepBtn} onClick={() => setLinesPerSlide(l => Math.min(8, l + 1))}>+</button>
        </div>
      </div>

      {/* Hint */}
      <div className={styles.hint}>
        Use <code>[Section Name]</code> labels to split into slides.
        Long sections auto-split every {linesPerSlide} lines.
      </div>

      {/* Text editor */}
      <textarea
        className={styles.textarea}
        value={text}
        onChange={e => setText(e.target.value)}
        spellCheck={false}
        placeholder={`[Verse 1]\nAmazing grace how sweet the sound\nThat saved a wretch like me\n\n[Chorus]\nMy chains are gone\nI've been set free`}
      />

      {/* Slide preview */}
      <div className={styles.previewHeader}>
        Preview — {preview.length} slide{preview.length !== 1 ? 's' : ''}
      </div>
      <div className={styles.previewList}>
        {preview.map((slide, i) => (
          <div key={i} className={styles.previewSlide}>
            <div className={styles.previewSection}>{slide.section || slide.name}</div>
            <div className={styles.previewLines}>
              {slide.lines.filter(l => l).map((line, j) => (
                <div key={j} className={styles.previewLine}>{line}</div>
              ))}
            </div>
          </div>
        ))}
        {preview.length === 0 && (
          <div className={styles.emptyPreview}>Start typing with section labels to see slides</div>
        )}
      </div>
    </div>
  )
}
