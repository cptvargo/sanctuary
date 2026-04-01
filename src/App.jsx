import React, { useState, useEffect, useCallback } from 'react'
import { useSanctuaryStore } from './store/sanctuaryStore'
import TopBar from './components/panels/TopBar'
import ServiceList from './components/panels/ServiceList'
import CenterPanel from './components/panels/CenterPanel'
import StageMonitor from './components/panels/StageMonitor'
import styles from './styles/App.module.css'
import { UpdateBanner } from './components/panels/SyncManager'

export default function App() {
  const { serviceOrder, navigateNext, navigatePrev, toggleBlackOut, toggleLive, sendToProjector, setActiveSlide } = useSanctuaryStore()
  const [activeItemId, setActiveItemId] = useState(() => serviceOrder[0]?.id || null)
  const activeItem = serviceOrder.find(i => i.id === activeItemId) || serviceOrder[0] || null

  const handleSelectItem = (item) => {
    setActiveItemId(item.id)
    const firstSlide = item.kind === 'song' ? item.slides[0] : item.slide
    if (firstSlide) {
      setActiveSlide(firstSlide.id)
      // If live + preview: clicking an item in the list immediately sends it to projector
      const { isLive, mode } = useSanctuaryStore.getState()
      if (isLive && mode === 'preview') {
        useSanctuaryStore.setState({ liveSlideId: firstSlide.id, isBlackOut: false })
        useSanctuaryStore.getState()._syncProjector()
      }
    }
  }

  const handleKeyDown = useCallback((e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
    switch (e.key) {
      case 'ArrowRight': case ' ': e.preventDefault(); navigateNext(); break
      case 'ArrowLeft':  e.preventDefault(); navigatePrev(); break
      case 'b': case 'B': toggleBlackOut(); break
      case 'l': case 'L': toggleLive(); break
      case 'Enter': sendToProjector(); break
    }
  }, [navigateNext, navigatePrev, toggleBlackOut, toggleLive, sendToProjector])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <div className={styles.app}>
      <UpdateBanner />
      <TopBar />
      <div className={styles.workspace}>
        <ServiceList activeSongId={activeItemId} onSelectItem={handleSelectItem} />
        <CenterPanel activeItem={activeItem} />
        <StageMonitor />
      </div>
    </div>
  )
}
