import React, { useState } from 'react'
import { useSanctuaryStore } from '../../../store/sanctuaryStore'
import styles from './Editor.module.css'

// Parse a pptx file into slide data (title + body text extraction)
// This uses a lightweight approach: unzip the pptx (it's a zip) and parse the XML
async function parsePptx(filePath) {
  // In Electron: read the file as base64, then parse
  // We use a simple approach: read as ArrayBuffer via file input or IPC, then use JSZip
  if (typeof window.sanctuary !== 'undefined') {
    const base64 = await window.sanctuary.readFile(filePath)
    if (!base64) return []
    return parsePptxBase64(base64)
  }
  return []
}

async function parsePptxBase64(base64) {
  // Dynamically import JSZip (add to package.json: "jszip": "^3.10.1")
  try {
    const JSZip = (await import('jszip')).default
    const zip = await JSZip.loadAsync(base64, { base64: true })
    const slides = []

    // Get slide XML files in order
    const slideFiles = Object.keys(zip.files)
      .filter(f => /^ppt\/slides\/slide\d+\.xml$/.test(f))
      .sort((a, b) => {
        const na = parseInt(a.match(/\d+/)[0])
        const nb = parseInt(b.match(/\d+/)[0])
        return na - nb
      })

    for (const slideFile of slideFiles) {
      const xml = await zip.files[slideFile].async('text')
      const title = extractTitle(xml)
      const body = extractBody(xml)
      slides.push({ title, body, imageDataUrl: null })
    }

    return slides
  } catch (e) {
    console.error('PPTX parse error:', e)
    return []
  }
}

function extractTitle(xml) {
  // Look for title placeholder text
  const titleMatch = xml.match(/<p:sp[^>]*>[\s\S]*?<p:ph[^>]*type="title"[\s\S]*?<a:t>([\s\S]*?)<\/a:t>/)
  if (titleMatch) return stripTags(titleMatch[1])
  // Fallback: first large text block
  const firstText = xml.match(/<a:t>([\s\S]*?)<\/a:t>/)
  return firstText ? stripTags(firstText[1]) : ''
}

function extractBody(xml) {
  // Extract all <a:t> text nodes, skip title
  const allText = []
  const regex = /<a:t>([\s\S]*?)<\/a:t>/g
  let match
  let count = 0
  while ((match = regex.exec(xml)) !== null) {
    const text = stripTags(match[1]).trim()
    if (text && count > 0) allText.push(text) // skip first (title)
    count++
  }
  // Group into bullet-like array
  return allText.filter(t => t.length > 0)
}

function stripTags(str) {
  return str.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').trim()
}

export default function PptxEditor({ slide, onChange }) {
  const { pptxNext, pptxPrev, pptxGoTo } = useSanctuaryStore()
  const [loading, setLoading] = useState(false)
  const { slides = [], currentSlideIndex = 0, filePath } = slide

  const handleImport = async () => {
    let path = null

    if (typeof window.sanctuary !== 'undefined') {
      path = await window.sanctuary.openPptxDialog()
    } else {
      // Web fallback
      path = await new Promise(resolve => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.pptx,.ppt'
        input.onchange = async (e) => {
          const file = e.target.files[0]
          if (!file) { resolve(null); return }
          // For web: read directly
          const base64 = await new Promise(res => {
            const reader = new FileReader()
            reader.onload = ev => res(ev.target.result.split(',')[1])
            reader.readAsDataURL(file)
          })
          const parsedSlides = await parsePptxBase64(base64)
          onChange({
            filePath: file.name,
            name: file.name.replace(/\.(pptx?)/i, ''),
            slides: parsedSlides,
            currentSlideIndex: 0,
          })
          resolve(null) // path handled inline
        }
        input.click()
      })
    }

    if (!path) return

    setLoading(true)
    try {
      const parsedSlides = await parsePptx(path)
      const name = path.split(/[\\/]/).pop().replace(/\.(pptx?)/i, '')
      onChange({ filePath: path, name, slides: parsedSlides, currentSlideIndex: 0 })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.editor}>
      <div className={styles.row}>
        <button className={styles.importBtn} onClick={handleImport} disabled={loading}>
          {loading ? 'Importing…' : filePath ? '↺ Re-import .pptx' : '+ Import .pptx file'}
        </button>
        {filePath && (
          <span className={styles.uploadedFile} title={filePath}>
            {filePath.split(/[\\/]/).pop()}
          </span>
        )}
      </div>

      {slides.length > 0 && (
        <>
          <div className={styles.sectionLabel}>Navigate slides</div>
          <div className={styles.slideNav}>
            <button className={styles.slideNavBtn} onClick={() => pptxPrev(slide.id)}>‹</button>
            <span className={styles.slideNavInfo}>
              {currentSlideIndex + 1} / {slides.length}
            </span>
            <button className={styles.slideNavBtn} onClick={() => pptxNext(slide.id)}>›</button>
          </div>

          {/* Slide list for quick jump */}
          <div className={styles.sectionLabel}>All slides</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {slides.map((s, i) => (
              <button
                key={i}
                onClick={() => pptxGoTo(slide.id, i)}
                style={{
                  background: i === currentSlideIndex ? 'var(--accent-purple-bg)' : 'var(--bg-base)',
                  border: `1px solid ${i === currentSlideIndex ? '#3a1a5a' : 'var(--border-dim)'}`,
                  borderRadius: 'var(--radius-sm)',
                  color: i === currentSlideIndex ? 'var(--accent-purple)' : 'var(--text-muted)',
                  fontSize: 11,
                  fontFamily: 'var(--font-ui)',
                  padding: '4px 8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  transition: 'all var(--transition)',
                }}
              >
                <span style={{ opacity: 0.5, marginRight: 6 }}>{i + 1}.</span>
                {s.title || `Slide ${i + 1}`}
              </button>
            ))}
          </div>
        </>
      )}

      {!filePath && (
        <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>
          Import a .pptx file to cycle through sermon slides directly inside Sanctuary.
        </div>
      )}
    </div>
  )
}
