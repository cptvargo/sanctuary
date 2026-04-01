import React, { useState } from 'react'
import { useSanctuaryStore } from '../../store/sanctuaryStore'
import styles from './SongLibrary.module.css'

export default function SongLibrary({ onClose }) {
  const { songLibrary, saveSongToLibrary, deleteSongFromLibrary, addSongFromLibrary, serviceOrder } = useSanctuaryStore()
  const [query, setQuery] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [added, setAdded] = useState(null)

  const filtered = songLibrary.filter(s =>
    s.name.toLowerCase().includes(query.toLowerCase())
  )

  const handleAdd = (song) => {
    addSongFromLibrary(song)
    setAdded(song.id)
    setTimeout(() => setAdded(null), 1500)
  }

  const handleDelete = (id) => {
    if (confirmDelete === id) {
      deleteSongFromLibrary(id)
      setConfirmDelete(null)
    } else {
      setConfirmDelete(id)
      setTimeout(() => setConfirmDelete(null), 2500)
    }
  }

  // Save all songs currently in service order to library
  const handleSaveFromService = () => {
    const songs = serviceOrder.filter(i => i.kind === 'song')
    songs.forEach(song => saveSongToLibrary(song))
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.title}>Song Library</span>
            <span className={styles.count}>{songLibrary.length} songs</span>
          </div>
          <div className={styles.headerRight}>
            <button className={styles.saveServiceBtn} onClick={handleSaveFromService} title="Save all songs from today's service to library">
              ↓ Save service songs
            </button>
            <button className={styles.closeBtn} onClick={onClose}>×</button>
          </div>
        </div>

        <div className={styles.searchRow}>
          <input
            className={styles.search}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search songs…"
            autoFocus
          />
        </div>

        <div className={styles.list}>
          {filtered.length === 0 && (
            <div className={styles.empty}>
              {query ? `No songs matching "${query}"` : 'No songs saved yet. Add songs from your service order.'}
            </div>
          )}
          {filtered.map(song => (
            <div key={song.id} className={styles.songRow}>
              <div className={styles.songInfo}>
                <span className={styles.songName}>{song.name}</span>
                <span className={styles.songSlideCount}>{song.slides?.length || 0} slides</span>
                <div className={styles.songSections}>
                  {(song.slides || []).map((s, i) => (
                    <span key={i} className={styles.sectionPill}>{s.section || s.name}</span>
                  ))}
                </div>
              </div>
              <div className={styles.songActions}>
                <button
                  className={`${styles.addBtn} ${added === song.id ? styles.addedBtn : ''}`}
                  onClick={() => handleAdd(song)}
                >
                  {added === song.id ? '✓ Added' : '+ Add to Service'}
                </button>
                <button
                  className={`${styles.deleteBtn} ${confirmDelete === song.id ? styles.confirmDelete : ''}`}
                  onClick={() => handleDelete(song.id)}
                  title={confirmDelete === song.id ? 'Click again to confirm delete' : 'Remove from library'}
                >
                  {confirmDelete === song.id ? 'Confirm?' : '×'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
