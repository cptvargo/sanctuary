import React from 'react'

export default function VideoSlide({ slide, mini = false }) {
  const { videoFilePath, videoObjectUrl, videoName, bgColor = '#000000' } = slide

  // Build a src that works cross-window: prefer file:// path (works in both operator and projector)
  const videoSrc = videoFilePath
    ? `file:///${videoFilePath.replace(/\\/g, '/')}`
    : videoObjectUrl || null

  if (mini) {
    return (
      <div style={{
        width: '100%', height: '100%', background: bgColor,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.8cqh',
      }}>
        <div style={{ fontSize: '3cqh', color: 'rgba(255,255,255,0.4)' }}>▶</div>
        {videoName && (
          <div style={{ fontSize: '0.9cqh', color: 'rgba(255,255,255,0.25)', textAlign: 'center', padding: '0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '90%' }}>
            {videoName}
          </div>
        )}
      </div>
    )
  }

  if (!videoSrc) {
    return (
      <div style={{
        width: '100%', height: '100%', background: bgColor,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5cqh',
      }}>
        <div style={{ fontSize: '6cqh', color: 'rgba(255,255,255,0.15)' }}>▶</div>
        <div style={{ fontSize: '1.6cqh', color: 'rgba(255,255,255,0.25)' }}>No video loaded</div>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', height: '100%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <video
        src={videoSrc}
        controls
        style={{ maxWidth: '100%', maxHeight: '100%', width: '100%', height: '100%', objectFit: 'contain' }}
        autoPlay={false}
        loop={false}
        playsInline
      />
    </div>
  )
}
