import React, { useState } from 'react'
import { useSanctuaryStore } from '../../store/sanctuaryStore'
import ChecklistPanel from './ChecklistPanel'
import SongEditor from './SongEditor'
import styles from './ServiceNavigator.module.css'

const SLIDE_ICONS = {
  logo: '✦', lyrics: '♪', countdown: '⏱', pptx: '⊞', blank: '◻', scripture: '✝', announcement: '!',
}
const SLIDE_COLORS = {
  logo: 'var(--gold)', lyrics: 'var(--accent)', countdown: 'var(--green)',
  pptx: 'var(--purple)', blank: 'var(--text-dim)', scripture: 'var(--gold)', announcement: '#cc8844',
}

export default function ServiceNavigator() {
  const {
    serviceOrder, activeSlideId, liveSlideId, activeSection, isLive, mode,
    setActiveSlide, sendToProjector, toggleSongExpanded, removeItem,
    removeSlideFromSong, addSlideItem, addSongItem, addSlideToSong, reorderItems,
  } = useSanctuaryStore()

  const [showAddMenu, setShowAddMenu] = useState(false)
  const [addAfter, setAddAfter] = useState(null)
  const [dragIdx, setDragIdx] = useState(null)
  const [dropIdx, setDropIdx] = useState(null)
  const [contextMenu, setContextMenu] = useState(null)
  const [editingSongId, setEditingSongId] = useState(null)

  if (activeSection === 'preService')  return <ChecklistPanel section="preService"  title="Pre-Service Checklist" />
  if (activeSection === 'postService') return <ChecklistPanel section="postService" title="Post-Service Checklist" />
  if (editingSongId) {
    const song = serviceOrder.find(i => i.id === editingSongId)
    if (song) return <SongEditor song={song} onClose={() => setEditingSongId(null)} />
  }

  // When live + preview mode: clicking a slide = instant projector send
  const handleSlideClick = (slideId) => {
    setActiveSlide(slideId)
    if (isLive && mode === 'preview') {
      // Directly sync without waiting for state round-trip
      useSanctuaryStore.setState({ activeSlideId: slideId, liveSlideId: slideId, isBlackOut: false })
      useSanctuaryStore.getState()._syncProjector()
    }
  }

  const openAdd = (afterId) => { setAddAfter(afterId); setShowAddMenu(true) }
  const handleAdd = (type) => {
    if (type === 'song') addSongItem(addAfter)
    else addSlideItem(type, addAfter)
    setShowAddMenu(false)
  }

  const isClickToSend = isLive && mode === 'preview'

  return (
    <aside className={styles.panel} onClick={() => setContextMenu(null)}>
      <div className={styles.header}>
        <span className={styles.headerLabel}>Service Order</span>
        {isClickToSend && <span className={styles.clickToSendBadge}>Click = Live</span>}
        {!isClickToSend && <button className={styles.addBtn} onClick={() => openAdd(null)} title="Add item">+</button>}
      </div>

      <div className={styles.list}>
        {serviceOrder.map((item, idx) => {
          const isDragging = dragIdx === idx
          const isDropTarget = dropIdx === idx && dragIdx !== idx

          if (item.kind === 'song') {
            const isAnyLive = item.slides.some(s => s.id === liveSlideId)
            return (
              <div
                key={item.id}
                className={`${styles.songGroup} ${isDragging ? styles.dragging : ''} ${isDropTarget ? styles.dropTarget : ''}`}
                draggable={!isClickToSend}
                onDragStart={e => { setDragIdx(idx); e.dataTransfer.effectAllowed = 'move' }}
                onDragOver={e => { e.preventDefault(); setDropIdx(idx) }}
                onDrop={e => { e.preventDefault(); if (dragIdx !== null && dragIdx !== idx) reorderItems(dragIdx, idx); setDragIdx(null); setDropIdx(null) }}
                onDragEnd={() => { setDragIdx(null); setDropIdx(null) }}
                onContextMenu={e => { e.preventDefault(); setContextMenu({ id: item.id, kind: 'song', x: e.clientX, y: e.clientY }) }}
              >
                {/* Song header */}
                <div className={`${styles.songHeader} ${isAnyLive ? styles.songLive : ''}`}>
                  <span className={styles.songChevron} onClick={() => toggleSongExpanded(item.id)}>
                    {item.expanded ? '▾' : '▸'}
                  </span>
                  <span className={styles.songIcon}>♪</span>
                  <span className={styles.songName} onClick={() => toggleSongExpanded(item.id)}>{item.name}</span>
                  {isAnyLive && <span className={styles.livePip} />}
                  {!isClickToSend && (
                    <button
                      className={styles.editSongBtn}
                      onClick={e => { e.stopPropagation(); setEditingSongId(item.id) }}
                      title="Edit song lyrics"
                    >✎</button>
                  )}
                  <span className={styles.songCount}>{item.slides.length}</span>
                </div>

                {/* Song slides */}
                {item.expanded && (
                  <div className={styles.songSlides}>
                    {item.slides.map(slide => {
                      const isActive = slide.id === activeSlideId
                      const isLiveSlide = slide.id === liveSlideId
                      return (
                        <div
                          key={slide.id}
                          className={`${styles.songSlide} ${isActive ? styles.activeSlide : ''} ${isLiveSlide ? styles.liveSlide : ''} ${isClickToSend ? styles.clickable : ''}`}
                          onClick={() => handleSlideClick(slide.id)}
                          onContextMenu={e => { e.preventDefault(); setContextMenu({ id: item.id, slideId: slide.id, kind: 'songSlide', x: e.clientX, y: e.clientY }) }}
                        >
                          <span className={styles.slideSection}>{slide.section || slide.name}</span>
                          {isLiveSlide && <span className={styles.liveBadge}>LIVE</span>}
                        </div>
                      )
                    })}
                    {!isClickToSend && (
                      <button className={styles.addSlideToSong} onClick={() => addSlideToSong(item.id)}>+ slide</button>
                    )}
                  </div>
                )}
              </div>
            )
          }

          // Standalone slide item
          const slide = item.slide
          const isActive = slide.id === activeSlideId
          const isLiveSlide = slide.id === liveSlideId
          const icon = SLIDE_ICONS[slide.type] || '◻'
          const color = SLIDE_COLORS[slide.type] || 'var(--text-muted)'

          return (
            <div
              key={item.id}
              className={`${styles.slideItem} ${isActive ? styles.activeSlide : ''} ${isLiveSlide ? styles.liveSlide : ''} ${isDragging ? styles.dragging : ''} ${isDropTarget ? styles.dropTarget : ''} ${isClickToSend ? styles.clickable : ''}`}
              onClick={() => handleSlideClick(slide.id)}
              onContextMenu={e => { e.preventDefault(); setContextMenu({ id: item.id, kind: 'slide', x: e.clientX, y: e.clientY }) }}
              draggable={!isClickToSend}
              onDragStart={e => { setDragIdx(idx); e.dataTransfer.effectAllowed = 'move' }}
              onDragOver={e => { e.preventDefault(); setDropIdx(idx) }}
              onDrop={e => { e.preventDefault(); if (dragIdx !== null && dragIdx !== idx) reorderItems(dragIdx, idx); setDragIdx(null); setDropIdx(null) }}
              onDragEnd={() => { setDragIdx(null); setDropIdx(null) }}
            >
              <span className={styles.slideIcon} style={{ color }}>{icon}</span>
              <span className={styles.slideName}>{slide.name}</span>
              {isLiveSlide && <span className={styles.liveBadge}>LIVE</span>}
            </div>
          )
        })}

        {!isClickToSend && (
          <button className={styles.addBottom} onClick={() => openAdd(null)}>+ Add item</button>
        )}
      </div>

      {/* Add menu */}
      {showAddMenu && (
        <div className={styles.menuOverlay} onClick={() => setShowAddMenu(false)}>
          <div className={styles.addMenu} onClick={e => e.stopPropagation()}>
            <div className={styles.menuTitle}>Add to Service</div>
            {[
              { type: 'song',         label: 'Song',         icon: '♪', desc: 'Expandable song with lyrics editor' },
              { type: 'lyrics',       label: 'Lyrics Slide', icon: '♪', desc: 'Single lyrics slide' },
              { type: 'logo',         label: 'Church Logo',  icon: '✦', desc: 'Logo / welcome screen' },
              { type: 'countdown',    label: 'Countdown',    icon: '⏱', desc: 'Pre-service timer' },
              { type: 'pptx',         label: 'PowerPoint',   icon: '⊞', desc: 'Import .pptx file' },
              { type: 'scripture',    label: 'Scripture',    icon: '✝', desc: 'Bible verse' },
              { type: 'announcement', label: 'Announcement', icon: '!', desc: 'Title + body' },
              { type: 'blank',        label: 'Blank',        icon: '◻', desc: 'Black screen' },
            ].map(({ type, label, icon, desc }) => (
              <button key={type} className={styles.menuItem} onClick={() => handleAdd(type)}>
                <span className={styles.menuIcon}>{icon}</span>
                <span className={styles.menuInfo}>
                  <span className={styles.menuLabel}>{label}</span>
                  <span className={styles.menuDesc}>{desc}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Context menu */}
      {contextMenu && (
        <div className={styles.contextMenu} style={{ left: contextMenu.x, top: contextMenu.y }} onClick={e => e.stopPropagation()}>
          {contextMenu.kind === 'song' && (
            <button onClick={() => { setEditingSongId(contextMenu.id); setContextMenu(null) }}>Edit lyrics</button>
          )}
          {contextMenu.kind === 'songSlide' && (
            <button onClick={() => { removeSlideFromSong(contextMenu.id, contextMenu.slideId); setContextMenu(null) }}>Remove slide</button>
          )}
          {(contextMenu.kind === 'song' || contextMenu.kind === 'slide') && (
            <button onClick={() => { removeItem(contextMenu.id); setContextMenu(null) }}>
              {contextMenu.kind === 'song' ? 'Remove song' : 'Remove'}
            </button>
          )}
        </div>
      )}
    </aside>
  )
}
