import React, { useState } from 'react'
import CountdownThemeManager from '../../panels/CountdownThemeManager'
import { useSanctuaryStore } from '../../../store/sanctuaryStore'
import styles from './Editor.module.css'
import cStyles from './CountdownEditor.module.css'

export default function CountdownEditor({ slide, onChange }) {
  const { resetCountdown, addCountdownMinutes, countdownRemaining } = useSanctuaryStore()
  const {
    message = 'Service begins in',
    subMessage = 'Welcome — please be seated',
    durationMinutes = 10,
    bgColor = '#000000',
    accentColor = '#4a9edd',
    onEnd = 'advance',
  } = slide

  const remaining = countdownRemaining[slide.id] ?? durationMinutes * 60
  const remMins = Math.floor(remaining / 60)
  const remSecs = remaining % 60
  const remStr = `${remMins}:${String(remSecs).padStart(2,'0')}`

  const handleReset = () => resetCountdown(slide.id, durationMinutes)

  const handleDurationChange = (val) => {
    const mins = Math.max(1, Math.min(120, parseInt(val) || 1))
    onChange({ durationMinutes: mins })
    resetCountdown(slide.id, mins)
  }

  const [showThemes, setShowThemes] = useState(false)

  return (
    <div className={styles.editor}>

      {/* Themes button */}
      <div className={styles.row}>
        <button className={styles.importBtn} style={{ width: '100%' }} onClick={() => setShowThemes(true)}>
          ✦ Countdown Themes
        </button>
      </div>

      {showThemes && <CountdownThemeManager slide={slide} onClose={() => setShowThemes(false)} />}

      {/* Duration + live controls */}
      <div className={styles.row}>
        <label className={styles.label}>Duration (min)</label>
        <input
          type="number"
          className={styles.numberInput}
          value={durationMinutes}
          min={1} max={120}
          onChange={e => handleDurationChange(e.target.value)}
        />
        <button className={styles.resetBtn} onClick={handleReset}>↺ Reset</button>
        <button className={cStyles.addMinBtn} onClick={() => addCountdownMinutes(slide.id, 1)} title="Add 1 minute">+1 min</button>
        <button className={cStyles.addMinBtn} onClick={() => addCountdownMinutes(slide.id, 2)} title="Add 2 minutes">+2 min</button>
      </div>

      {/* Current remaining time display */}
      <div className={cStyles.remainingRow}>
        <span className={cStyles.remainingLabel}>Time remaining</span>
        <span className={cStyles.remainingTime}>{remStr}</span>
        <span className={cStyles.remainingNote}>(starts counting when slide goes live)</span>
      </div>

      {/* When timer ends */}
      <div className={cStyles.onEndSection}>
        <div className={cStyles.onEndLabel}>When the timer ends</div>
        {[
          { value: 'nothing',  label: 'Do nothing' },
          { value: 'loop',     label: 'Loop continuously' },
          { value: 'advance',  label: 'Automatically advance to the next slide' },
        ].map(opt => (
          <label key={opt.value} className={cStyles.radioRow}>
            <input
              type="radio"
              name={`onEnd-${slide.id}`}
              value={opt.value}
              checked={onEnd === opt.value}
              onChange={() => onChange({ onEnd: opt.value })}
              className={cStyles.radio}
            />
            <span className={cStyles.radioLabel}>{opt.label}</span>
          </label>
        ))}
      </div>

      {/* Messages */}
      <div className={styles.row}>
        <label className={styles.label}>Top message</label>
        <input className={styles.input} value={message} onChange={e => onChange({ message: e.target.value })} placeholder="Service begins in" />
      </div>
      <div className={styles.row}>
        <label className={styles.label}>Sub message</label>
        <input className={styles.input} value={subMessage} onChange={e => onChange({ subMessage: e.target.value })} placeholder="Welcome — please be seated" />
      </div>
      <div className={styles.row}>
        <label className={styles.label}>Background</label>
        <input type="color" className={styles.colorPicker} value={bgColor} onChange={e => onChange({ bgColor: e.target.value })} />
        <label className={styles.label}>Timer color</label>
        <input type="color" className={styles.colorPicker} value={accentColor} onChange={e => onChange({ accentColor: e.target.value })} />
      </div>

      {/* Background image */}
      <div className={styles.row}>
        <label className={styles.label}>BG Image</label>
        <button className={styles.importBtn} onClick={async () => {
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
          if (dataUrl) onChange({ bgImageUrl: dataUrl })
        }}>
          {slide.bgImageUrl ? '↺ Replace image' : '+ Background image'}
        </button>
        {slide.bgImageUrl && (
          <button className={styles.resetBtn} onClick={() => onChange({ bgImageUrl: null })}>Clear</button>
        )}
      </div>

      {slide.bgImageUrl && (
        <div className={styles.row}>
          <label className={styles.label}>Darkness</label>
          <input
            type="range" min={0} max={0.9} step={0.05}
            value={slide.bgOverlayOpacity ?? 0.6}
            onChange={e => onChange({ bgOverlayOpacity: Number(e.target.value) })}
            style={{ flex: 1, accentColor: 'var(--accent)' }}
          />
          <span className={styles.label} style={{ minWidth: 36, textAlign: 'right' }}>
            {Math.round((slide.bgOverlayOpacity ?? 0.6) * 100)}%
          </span>
        </div>
      )}
    </div>
  )
}
