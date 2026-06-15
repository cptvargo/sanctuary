import React, { useState, useRef } from 'react'
import { useSanctuaryStore, makeSlide, uid } from '../../store/sanctuaryStore'
import ChecklistPanel from './ChecklistPanel'
import styles from './ServiceList.module.css'

const ITEM_ICONS = {
  song: '♪', logo: '✦', countdown: '⏱', image: '🖼',
  blank: '◻', scripture: '✝', announcement: '!', lyrics: '♪',
  video: '▶', rotation: '⟳',
}

export default function ServiceList({ activeSongId, onSelectItem }) {
  const {
    serviceOrder, activeSection, liveSlideId, isLive, mode,
    addSlideItem, addSongItem, addRotationItem, reorderItems, removeItem, removeItemsById,
    songLibrary, addSongFromLibrary,
  } = useSanctuaryStore()

  const [showAddMenu, setShowAddMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [dragIdx, setDragIdx] = useState(null)
  const [dropIdx, setDropIdx] = useState(null)
  const [contextMenu, setContextMenu] = useState(null)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const anchorIdxRef = useRef(null)
  const panelRef = useRef(null)
  const searchRef = useRef(null)
  const clipboardRef = useRef(null)

  if (activeSection === 'preService')  return <ChecklistPanel section="preService"  title="Pre-Service Checklist" />
  if (activeSection === 'postService') return <ChecklistPanel section="postService" title="Post-Service Checklist" />

  const handleAdd = (type) => {
    if (type === 'song') addSongItem()
    else if (type === 'rotation') addRotationItem()
    else addSlideItem(type)
    setShowAddMenu(false)
  }

  const deepCloneItem = (item) => {
    if (item.kind === 'song') {
      return { ...item, id: uid(), slides: item.slides.map(s => ({ ...s, id: uid() })) }
    }
    if (item.kind === 'rotation') {
      return { ...item, id: uid(), images: (item.images || []).map(img => ({ ...img, id: uid() })) }
    }
    return { ...item, id: uid(), slide: item.slide ? { ...item.slide, id: uid() } : item.slide }
  }

  const handleKeyDown = (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return

    if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
      e.preventDefault()
      const items = selectedIds.size > 0
        ? serviceOrder.filter(i => selectedIds.has(i.id))
        : serviceOrder.filter(i => i.id === activeSongId)
      if (items.length) clipboardRef.current = items
      return
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
      e.preventDefault()
      if (!clipboardRef.current?.length) return
      const clones = clipboardRef.current.map(deepCloneItem)
      useSanctuaryStore.setState(state => {
        const order = [...state.serviceOrder]
        const afterIdx = activeSongId
          ? order.findIndex(i => i.id === activeSongId)
          : order.length - 1
        order.splice(afterIdx + 1, 0, ...clones)
        return { serviceOrder: order }
      })
      return
    }

    if (e.key === 'Delete' && selectedIds.size > 0) {
      e.preventDefault()
      const count = selectedIds.size
      if (window.confirm(`Remove ${count} item${count !== 1 ? 's' : ''} from the service order?`)) {
        removeItemsById(selectedIds)
        setSelectedIds(new Set())
        anchorIdxRef.current = null
      }
    }
    if (e.key === 'Escape') {
      setSelectedIds(new Set())
      anchorIdxRef.current = null
    }
  }

  return (
    <aside
      ref={panelRef}
      className={styles.panel}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={() => setContextMenu(null)}
    >
      <div className={styles.header}>
        <span className={styles.headerLabel}>Service</span>
        <button className={styles.addBtn} onClick={() => setShowAddMenu(true)}>+</button>
      </div>

      <div className={styles.songSearch}>
        <input
          ref={searchRef}
          className={styles.songSearchInput}
          type="text"
          placeholder="Search songs..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button className={styles.songSearchClear} onClick={() => setSearchQuery('')}>×</button>
        )}
        {searchQuery.trim() && (
          <div className={styles.songSearchResults}>
            {(() => {
              const q = searchQuery.trim().toLowerCase()
              const matches = songLibrary.filter(s => s.name.toLowerCase().includes(q))
              if (matches.length === 0) return (
                <div className={styles.songSearchEmpty}>No match — <button className={styles.songSearchNewBtn} onClick={() => { addSongItem(); setSearchQuery('') }}>add blank song</button></div>
              )
              return matches.map(song => (
                <button key={song.name} className={styles.songSearchResult} onClick={() => {
                  addSongFromLibrary(song)
                  setSearchQuery('')
                }}>
                  <span className={styles.songSearchIcon}>♪</span>
                  {song.name}
                </button>
              ))
            })()}
          </div>
        )}
      </div>

      <div className={styles.list}>
        {serviceOrder.map((item, idx) => {
          const isActive = item.id === activeSongId
          const isSelected = selectedIds.has(item.id)
          const isDragging = dragIdx === idx
          const isDropTarget = dropIdx === idx && dragIdx !== idx

          const hasLiveSlide = item.kind === 'song'
            ? item.slides.some(s => s.id === liveSlideId)
            : item.kind === 'rotation'
            ? isLive && liveSlideId === item.id
            : item.slide?.id === liveSlideId

          const icon = item.kind === 'song' ? '♪'
            : item.kind === 'rotation' ? '⟳'
            : ITEM_ICONS[item.slide?.type] || '◻'
          const name = item.kind === 'song' ? item.name
            : item.kind === 'rotation' ? item.name
            : item.slide?.name

          return (
            <div
              key={item.id}
              className={`${styles.item} ${isActive ? styles.itemActive : ''} ${hasLiveSlide ? styles.itemLive : ''} ${isSelected ? styles.itemSelected : ''} ${isDragging ? styles.dragging : ''} ${isDropTarget ? styles.dropTarget : ''}`}
              onClick={(e) => {
                if (e.shiftKey && anchorIdxRef.current !== null) {
                  // Range select from anchor to this item
                  const lo = Math.min(anchorIdxRef.current, idx)
                  const hi = Math.max(anchorIdxRef.current, idx)
                  setSelectedIds(new Set(serviceOrder.slice(lo, hi + 1).map(i => i.id)))
                } else {
                  // Regular click — clear selection, set anchor
                  setSelectedIds(new Set())
                  anchorIdxRef.current = idx
                  onSelectItem(item)
                }
              }}
              onContextMenu={e => { e.preventDefault(); setContextMenu({ id: item.id, x: e.clientX, y: e.clientY }) }}
              draggable
              onDragStart={e => { setDragIdx(idx); e.dataTransfer.effectAllowed = 'move' }}
              onDragOver={e => { e.preventDefault(); setDropIdx(idx) }}
              onDrop={e => { e.preventDefault(); if (dragIdx !== null && dragIdx !== idx) reorderItems(dragIdx, idx); setDragIdx(null); setDropIdx(null) }}
              onDragEnd={() => { setDragIdx(null); setDropIdx(null) }}
            >
              <span className={styles.itemIcon}>{icon}</span>
              <span className={styles.itemName}>{name}</span>
              {hasLiveSlide && <span className={styles.liveDot} />}
            </div>
          )
        })}
        <button className={styles.addItemBtn} onClick={() => setShowAddMenu(true)}>+ Add item</button>
        {selectedIds.size > 0 && (
          <div className={styles.selectionHint}>
            {selectedIds.size} selected — Ctrl+C to copy, Delete to remove, Esc to cancel
          </div>
        )}
      </div>

      {showAddMenu && (
        <div className={styles.overlay} onClick={() => setShowAddMenu(false)}>
          <div className={styles.addMenu} onClick={e => e.stopPropagation()}>
            <div className={styles.menuTitle}>Add to Service</div>
            {[
              { type: 'song',      icon: '♪', label: 'Song',                desc: 'Song with lyrics editor' },
              { type: 'logo',      icon: '✦', label: 'Church Logo',          desc: 'Logo / welcome screen' },
              { type: 'countdown', icon: '⏱', label: 'Countdown',            desc: 'Pre-service timer' },
              { type: 'image',     icon: '🖼', label: 'Image / Announcement', desc: 'Photos, graphics, baby pics' },
              { type: 'video',     icon: '▶', label: 'Video',                 desc: 'Worship video for special events' },
              { type: 'rotation',  icon: '⟳', label: 'Image Rotation',       desc: 'Auto-advancing pre-service slides' },
              { type: 'scripture', icon: '✝', label: 'Scripture',             desc: 'Bible verse' },
            ].map(({ type, icon, label, desc }) => (
              <button key={type} className={styles.menuItem} onClick={() => handleAdd(type)}>
                <span className={styles.menuIcon}>{icon}</span>
                <div className={styles.menuText}>
                  <span className={styles.menuLabel}>{label}</span>
                  <span className={styles.menuDesc}>{desc}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {contextMenu && (
        <div className={styles.contextMenu} style={{ left: contextMenu.x, top: contextMenu.y }} onClick={e => e.stopPropagation()}>
          <button onClick={() => { removeItem(contextMenu.id); setContextMenu(null) }}>Remove</button>
        </div>
      )}
    </aside>
  )
}
