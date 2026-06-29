import React, { useState, useEffect } from 'react'
import { useSanctuaryStore } from '../../store/sanctuaryStore'
import SlideCanvas from '../slides/SlideCanvas'
import cpStyles from './CenterPanel.module.css'
import styles from './PdfEditor.module.css'

export default function PdfEditor({ item }) {
  const { isLive, liveSlideId, mode, updatePdfItem, pdfNext, pdfPrev, pdfGoTo } = useSanctuaryStore()
  const storeItem = useSanctuaryStore(s => s.serviceOrder.find(i => i.id === item.id)) || item
  const { pages = [], currentPageIndex = 0, name } = storeItem
  const isRunning = isLive && liveSlideId === item.id
  const isClickToSend = isLive && mode === 'preview'
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(null)
  const [error, setError] = useState(null)

  const previewSlide = { id: item.id, type: 'pdf', name, pages, currentPageIndex }

  useEffect(() => {
    if (!window.sanctuary?.onPdfProgress) return
    return window.sanctuary.onPdfProgress((data) => setProgress(data))
  }, [])

  const handleClick = () => {
    useSanctuaryStore.setState({ activeSlideId: item.id })
    if (isLive && useSanctuaryStore.getState().mode === 'preview') {
      useSanctuaryStore.setState({ liveSlideId: item.id, isBlackOut: false })
      useSanctuaryStore.getState()._syncProjector()
    }
  }

  const handleImport = async () => {
    if (!window.sanctuary?.renderPdfFromDialog) return
    setLoading(true)
    setError(null)
    setProgress(null)
    try {
      const result = await window.sanctuary.renderPdfFromDialog()
      if (!result) return // user cancelled
      if (!result.pages?.length) throw new Error('No pages rendered — PDF may be corrupt or password-protected.')
      updatePdfItem(item.id, {
        name: result.name,
        pages: result.pages,
        currentPageIndex: 0,
      })
    } catch (err) {
      console.error('PDF render error:', err)
      setError(err.message || 'Failed to render PDF.')
    } finally {
      setLoading(false)
      setProgress(null)
    }
  }

  const handleStartStop = () => {
    if (isRunning) {
      useSanctuaryStore.getState().endLive()
    } else {
      useSanctuaryStore.setState({ activeSlideId: item.id })
      useSanctuaryStore.getState().sendToProjector()
    }
  }

  return (
    <div className={cpStyles.standaloneWrap}>
      <div
        className={`${cpStyles.standaloneCanvas} ${cpStyles.canvasClickable} ${isRunning ? cpStyles.canvasLive : ''}`}
        onClick={handleClick}
      >
        <SlideCanvas slide={previewSlide} />
        {isRunning && <div className={cpStyles.liveOverlayBadge}>LIVE</div>}
        {isClickToSend && !isRunning && (
          <div className={cpStyles.clickToSendOverlay}>Click to go live</div>
        )}
      </div>

      <div className={styles.editorPanel}>
        <div className={styles.controlRow}>
          <button
            className={styles.importBtn}
            onClick={handleImport}
            disabled={loading}
          >
            {loading
              ? progress?.total
                ? `Rendering ${progress.current} / ${progress.total}…`
                : 'Loading…'
              : pages.length ? '↺ Re-import PDF' : '+ Import PDF'}
          </button>
          <button
            className={`${styles.sendBtn} ${isRunning ? styles.stopBtn : ''}`}
            onClick={handleStartStop}
            disabled={!pages.length}
          >
            {isRunning ? '■ Stop' : '▶ Send to Projector'}
          </button>
        </div>

        {pages.length > 0 && (
          <>
            <div className={styles.navRow}>
              <button className={styles.navBtn} onClick={() => pdfPrev(item.id)} disabled={currentPageIndex === 0}>‹</button>
              <span className={styles.pageInfo}>Page {currentPageIndex + 1} of {pages.length}</span>
              <button className={styles.navBtn} onClick={() => pdfNext(item.id)} disabled={currentPageIndex === pages.length - 1}>›</button>
            </div>

            <div className={styles.thumbGrid}>
              {pages.map((pageUrl, i) => (
                <button
                  key={i}
                  className={`${styles.thumbBtn} ${i === currentPageIndex ? styles.thumbActive : ''}`}
                  onClick={() => pdfGoTo(item.id, i)}
                  title={`Page ${i + 1}`}
                >
                  <img src={pageUrl} alt={`Page ${i + 1}`} className={styles.thumbImg} />
                  <span className={styles.thumbLabel}>{i + 1}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {error && (
          <div className={styles.errorHint}>{error}</div>
        )}
        {!pages.length && !loading && !error && (
          <div className={styles.emptyHint}>
            Import a PDF to display sermon slides, announcements, or any presentation on the projector.
          </div>
        )}
      </div>
    </div>
  )
}
