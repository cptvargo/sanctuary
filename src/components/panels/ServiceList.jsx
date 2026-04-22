import React, { useState } from 'react'
import { useSanctuaryStore, makeSlide, uid } from '../../store/sanctuaryStore'
import ChecklistPanel from './ChecklistPanel'
import styles from './ServiceList.module.css'

const ITEM_ICONS = {
  song: '♪', logo: '✦', countdown: '⏱', image: '🖼',
  blank: '◻', scripture: '✝', announcement: '!', lyrics: '♪',
}

export default function ServiceList({ activeSongId, onSelectItem }) {
  const {
    serviceOrder, activeSection, liveSlideId, isLive, mode,
    addSlideItem, addSongItem, reorderItems, removeItem,
  } = useSanctuaryStore()

  const [showAddMenu, setShowAddMenu] = useState(false)
  const [dragIdx, setDragIdx] = useState(null)
  const [dropIdx, setDropIdx] = useState(null)
  const [contextMenu, setContextMenu] = useState(null)

  if (activeSection === 'preService')  return <ChecklistPanel section="preService"  title="Pre-Service Checklist" />
  if (activeSection === 'postService') return <ChecklistPanel section="postService" title="Post-Service Checklist" />

  const handleAdd = (type) => {
    if (type === 'song') addSongItem()
    else addSlideItem(type)
    setShowAddMenu(false)
  }

  return (
    <aside className={styles.panel} onClick={() => setContextMenu(null)}>
      <div className={styles.header}>
        <span className={styles.headerLabel}>Service</span>
        <button className={styles.addBtn} onClick={() => setShowAddMenu(true)}>+</button>
      </div>

      <div className={styles.list}>
        {serviceOrder.map((item, idx) => {
          const isActive = item.id === activeSongId
          const isDragging = dragIdx === idx
          const isDropTarget = dropIdx === idx && dragIdx !== idx

          const hasLiveSlide = item.kind === 'song'
            ? item.slides.some(s => s.id === liveSlideId)
            : item.slide?.id === liveSlideId

          const icon = item.kind === 'song' ? '♪' : ITEM_ICONS[item.slide?.type] || '◻'
          const name = item.kind === 'song' ? item.name : item.slide?.name

          return (
            <div
              key={item.id}
              className={`${styles.item} ${isActive ? styles.itemActive : ''} ${hasLiveSlide ? styles.itemLive : ''} ${isDragging ? styles.dragging : ''} ${isDropTarget ? styles.dropTarget : ''}`}
              onClick={() => onSelectItem(item)}
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
      </div>

      {showAddMenu && (
        <div className={styles.overlay} onClick={() => setShowAddMenu(false)}>
          <div className={styles.addMenu} onClick={e => e.stopPropagation()}>
            <div className={styles.menuTitle}>Add to Service</div>
            {[
              { type: 'song',         icon: '♪', label: 'Song',                     desc: 'Song with lyrics editor' },
              { type: 'logo',         icon: '✦', label: 'Church Logo',               desc: 'Logo / welcome screen' },
              { type: 'countdown',    icon: '⏱', label: 'Countdown',                 desc: 'Pre-service timer' },
              { type: 'image',        icon: '🖼', label: 'Image / Announcement',      desc: 'Photos, graphics, baby pics' },
              { type: 'scripture',    icon: '✝', label: 'Scripture',                  desc: 'Bible verse' },
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
