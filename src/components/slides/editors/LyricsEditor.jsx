import React from 'react'
import styles from './Editor.module.css'

export default function LyricsEditor({ slide, onChange }) {
  const {
    lines = ['', '', '', ''],
    song = '',
    section = '',
    bgColor = '#050813',
    textColor = '#ffffff',
    fontSize = 100,
  } = slide

  const updateLine = (i, value) => {
    const next = [...lines]
    next[i] = value
    onChange({ lines: next })
  }

  const addLine = () => onChange({ lines: [...lines, ''] })
  const removeLine = (i) => onChange({ lines: lines.filter((_, idx) => idx !== i) })

  return (
    <div className={styles.editor}>
      <div className={styles.row}>
        <label className={styles.label}>Song</label>
        <input className={styles.input} value={song} onChange={e => onChange({ song: e.target.value })} placeholder="Song title" />
        <label className={styles.label}>Section</label>
        <input className={styles.input} value={section} onChange={e => onChange({ section: e.target.value })} placeholder="Verse 1, Chorus…" style={{ width: 110 }} />
      </div>

      {/* Font size slider */}
      <div className={styles.row} style={{ marginTop: 4 }}>
        <label className={styles.label}>Font size</label>
        <input
          type="range"
          min={40}
          max={180}
          step={5}
          value={fontSize}
          onChange={e => onChange({ fontSize: Number(e.target.value) })}
          style={{ flex: 1, accentColor: 'var(--accent)' }}
        />
        <span className={styles.label} style={{ minWidth: 36, textAlign: 'right' }}>{fontSize}%</span>
        <button
          className={styles.removeBtn}
          style={{ fontSize: 10, padding: '2px 6px', opacity: fontSize !== 100 ? 1 : 0.3 }}
          onClick={() => onChange({ fontSize: 100 })}
          title="Reset to default"
        >↺</button>
      </div>

      <div className={styles.sectionLabel}>Lyrics Lines</div>
      {lines.map((line, i) => (
        <div key={i} className={styles.lineRow}>
          <span className={styles.lineNum}>{i + 1}</span>
          <input
            className={`${styles.input} ${styles.lineInput}`}
            value={line}
            onChange={e => updateLine(i, e.target.value)}
            placeholder={`Line ${i + 1}…`}
          />
          <button className={styles.removeBtn} onClick={() => removeLine(i)}>×</button>
        </div>
      ))}
      <button className={styles.addLineBtn} onClick={addLine}>+ Add line</button>

      <div className={styles.row} style={{ marginTop: 8 }}>
        <label className={styles.label}>Background</label>
        <input type="color" className={styles.colorPicker} value={bgColor} onChange={e => onChange({ bgColor: e.target.value })} />
        <label className={styles.label}>Text color</label>
        <input type="color" className={styles.colorPicker} value={textColor} onChange={e => onChange({ textColor: e.target.value })} />
      </div>
    </div>
  )
}
