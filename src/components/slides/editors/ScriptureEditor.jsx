import React from 'react'
import styles from './Editor.module.css'

export function ScriptureEditor({ slide, onChange }) {
  const { reference = '', text = '', translation = 'KJV', bgColor = '#050813', textColor = '#e0e8ff' } = slide

  return (
    <div className={styles.editor}>
      <div className={styles.row}>
        <label className={styles.label}>Reference</label>
        <input className={styles.input} value={reference} onChange={e => onChange({ reference: e.target.value })} placeholder="John 3:16" style={{ maxWidth: 160 }} />
        <label className={styles.label}>Translation</label>
        <select className={styles.select} value={translation} onChange={e => onChange({ translation: e.target.value })}>
          <option>KJV</option>
          <option>NIV</option>
          <option>ESV</option>
          <option>NKJV</option>
          <option>NLT</option>
          <option>CSB</option>
          <option>ASR</option>
        </select>
      </div>
      <textarea
        className={styles.textarea}
        value={text}
        onChange={e => onChange({ text: e.target.value })}
        placeholder="For God so loved the world…"
        rows={4}
      />
      <div className={styles.row}>
        <label className={styles.label}>Background</label>
        <input type="color" className={styles.colorPicker} value={bgColor} onChange={e => onChange({ bgColor: e.target.value })} />
        <label className={styles.label}>Text color</label>
        <input type="color" className={styles.colorPicker} value={textColor} onChange={e => onChange({ textColor: e.target.value })} />
      </div>
    </div>
  )
}

export function AnnouncementEditor({ slide, onChange }) {
  const { title = '', body = '', bgColor = '#0a0a14', textColor = '#ffffff' } = slide

  return (
    <div className={styles.editor}>
      <div className={styles.row}>
        <label className={styles.label}>Title</label>
        <input className={styles.input} value={title} onChange={e => onChange({ title: e.target.value })} placeholder="Announcement title" />
      </div>
      <textarea
        className={styles.textarea}
        value={body}
        onChange={e => onChange({ body: e.target.value })}
        placeholder="Announcement body text…"
        rows={3}
      />
      <div className={styles.row}>
        <label className={styles.label}>Background</label>
        <input type="color" className={styles.colorPicker} value={bgColor} onChange={e => onChange({ bgColor: e.target.value })} />
        <label className={styles.label}>Text color</label>
        <input type="color" className={styles.colorPicker} value={textColor} onChange={e => onChange({ textColor: e.target.value })} />
      </div>
    </div>
  )
}

export default ScriptureEditor
