import React, { useState, useRef } from 'react'
import { useSanctuaryStore } from '../../store/sanctuaryStore'
import styles from './QueuePanel.module.css'

const SLIDE_TYPE_META = {
  logo:         { label: 'Logo',       icon: '✦', color: '#c8a84a', bg: '#1a1400' },
  lyrics:       { label: 'Lyrics',     icon: '♪', color: '#6a82cc', bg: '#0d1428' },
  countdown:    { label: 'Timer',      icon: '⏱', color: '#5aaa5a', bg: '#0a1a0a' },
  pptx:         { label: 'PPT',        icon: '⊞', color: '#8a5aaa', bg: '#150a1e' },
  blank:        { label: 'Blank',      icon: '◻', color: '#444',    bg: '#0a0a0a' },
  scripture:    { label: 'Scripture',  icon: '✝', color: '#c0a06a', bg: '#1a1408' },
  announcement: { label: 'Notice',     icon: '!', color: '#cc8844', bg: '#1a1008' },
}

const ADD_TYPES = [
  { type: 'lyrics',       label: 'Lyrics Slide',       desc: 'Multi-line worship lyrics' },
  { type: 'logo',         label: 'Church Logo',         desc: 'Logo / welcome screen' },
  { type: 'countdown',    label: 'Countdown Timer',     desc: 'Pre-service countdown' },
  { type: 'pptx',         label: 'PowerPoint Import',   desc: 'Import and cycle .pptx' },
  { type: 'scripture',    label: 'Scripture',           desc: 'Bible verse display' },
  { type: 'announcement', label: 'Announcement',        desc: 'Title + body text' },
  { type: 'blank',        label: 'Blank / Black',       desc: 'Empty slide for transitions' },
]

export default function QueuePanel() {
  const { queue, activeSlideId, liveSlideId, setActiveSlide, addSlide, removeSlide, duplicateSlide, reorderQueue } = useSanctuaryStore()
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [contextMenu, setContextMenu] = useState(null) // { id, x, y }
  const [dragIdx, setDragIdx] = useState(null)
  const [dropIdx, setDropIdx] = useState(null)

  const handleAdd = (type) => {
    addSlide(type, activeSlideId)
    setShowAddMenu(false)
  }

  const handleContextMenu = (e, id) => {
    e.preventDefault()
    setContextMenu({ id, x: e.clientX, y: e.clientY })
  }

  const handleDragStart = (e, idx) => {
    setDragIdx(idx)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e, idx) => {
    e.preventDefault()
    setDropIdx(idx)
  }

  const handleDrop = (e, idx) => {
    e.preventDefault()
    if (dragIdx !== null && dragIdx !== idx) {
      reorderQueue(dragIdx, idx)
    }
    setDragIdx(null)
    setDropIdx(null)
  }

  const handleDragEnd = () => {
    setDragIdx(null)
    setDropIdx(null)
  }

  return (
    <aside className={styles.panel} onClick={() => setContextMenu(null)}>
      <div className={styles.header}>
        <span className={styles.headerLabel}>Slides</span>
        <button className={styles.addBtn} onClick={() => setShowAddMenu(true)} title="Add slide">+</button>
      </div>

      <div className={styles.queue}>
        {queue.map((slide, idx) => {
          const meta = SLIDE_TYPE_META[slide.type] || SLIDE_TYPE_META.blank
          const isActive = slide.id === activeSlideId
          const isLive = slide.id === liveSlideId
          const isDragging = dragIdx === idx
          const isDropTarget = dropIdx === idx && dragIdx !== idx

          return (
            <div
              key={slide.id}
              className={`
                ${styles.slideItem}
                ${isActive ? styles.active : ''}
                ${isLive ? styles.liveItem : ''}
                ${isDragging ? styles.dragging : ''}
                ${isDropTarget ? styles.dropTarget : ''}
              `}
              onClick={() => setActiveSlide(slide.id)}
              onContextMenu={(e) => handleContextMenu(e, slide.id)}
              draggable
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={(e) => handleDrop(e, idx)}
              onDragEnd={handleDragEnd}
            >
              <div
                className={styles.thumb}
                style={{ background: meta.bg, color: meta.color }}
              >
                <span className={styles.thumbIcon}>{meta.icon}</span>
                <span className={styles.thumbLabel}>{meta.label}</span>
                {isLive && <div className={styles.liveBadge}>LIVE</div>}
              </div>
              <div className={styles.slideName}>{slide.name}</div>
            </div>
          )
        })}
      </div>

      {/* Add Slide Menu */}
      {showAddMenu && (
        <div className={styles.menuOverlay} onClick={() => setShowAddMenu(false)}>
          <div className={styles.addMenu} onClick={e => e.stopPropagation()}>
            <div className={styles.menuHeader}>
              Add Slide
              <button className={styles.menuClose} onClick={() => setShowAddMenu(false)}>×</button>
            </div>
            {ADD_TYPES.map(({ type, label, desc }) => {
              const meta = SLIDE_TYPE_META[type]
              return (
                <button key={type} className={styles.addOption} onClick={() => handleAdd(type)}>
                  <div className={styles.addIcon} style={{ background: meta.bg, color: meta.color }}>
                    {meta.icon}
                  </div>
                  <div className={styles.addInfo}>
                    <div className={styles.addLabel}>{label}</div>
                    <div className={styles.addDesc}>{desc}</div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <div
          className={styles.contextMenu}
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={e => e.stopPropagation()}
        >
          <button onClick={() => { duplicateSlide(contextMenu.id); setContextMenu(null) }}>Duplicate</button>
          <button onClick={() => { removeSlide(contextMenu.id); setContextMenu(null) }}>Delete</button>
        </div>
      )}
    </aside>
  )
}
