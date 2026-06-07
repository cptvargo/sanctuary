import React from 'react'
import styles from './Editor.module.css'

export default function VideoEditor({ slide, onChange }) {
  const { videoName, bgColor = '#000000' } = slide

  const handlePick = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'video/*'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (!file) return
      // Revoke any previous object URL
      if (slide.videoObjectUrl) URL.revokeObjectURL(slide.videoObjectUrl)
      // file.path is available in Electron's renderer for the absolute file path
      const filePath = file.path || null
      const objectUrl = URL.createObjectURL(file)
      onChange({ videoFilePath: filePath, videoObjectUrl: objectUrl, videoName: file.name })
    }
    input.click()
  }

  return (
    <div className={styles.editor}>
      <div className={styles.row}>
        <label className={styles.label}>Video file</label>
        <button
          className={styles.importBtn}
          onClick={handlePick}
          style={{ fontFamily: 'var(--font-ui)', fontSize: 12 }}
        >
          {videoName ? `📹 ${videoName}` : '📂 Choose Video…'}
        </button>
      </div>
      {videoName && (
        <div className={styles.row} style={{ fontSize: 11, color: 'var(--text-dim)', lineHeight: 1.4 }}>
          Session-only — you'll need to re-select after restarting the app
        </div>
      )}
      <div className={styles.row}>
        <label className={styles.label}>Background</label>
        <input
          type="color"
          className={styles.colorPicker}
          value={bgColor}
          onChange={e => onChange({ bgColor: e.target.value })}
        />
      </div>
    </div>
  )
}
