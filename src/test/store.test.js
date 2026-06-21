import { describe, it, expect, beforeEach } from 'vitest'
import { useSanctuaryStore } from '../store/sanctuaryStore'

const getState = () => useSanctuaryStore.getState()

beforeEach(() => {
  useSanctuaryStore.setState({ serviceOrder: [], songLibrary: [], activeThemeProps: null })
})

// ─── addSongFromLibrary ───────────────────────────────────────────────────────

describe('addSongFromLibrary', () => {
  it('inherits fontSize from first existing service song when library slide has none', () => {
    useSanctuaryStore.setState({
      serviceOrder: [{
        id: 'song1', kind: 'song', name: 'Existing',
        slides: [{ id: 's1', type: 'lyrics', section: 'Verse 1', fontSize: 75, lines: ['test'] }],
      }],
    })
    getState().addSongFromLibrary({
      name: 'Way Maker',
      slides: [{ id: 'lib1', type: 'lyrics', section: 'Chorus', lines: ['Way maker'] }],
    })
    const added = getState().serviceOrder[1]
    expect(added.slides[0].fontSize).toBe(75)
  })

  it('respects explicit fontSize saved on the library slide', () => {
    useSanctuaryStore.setState({
      serviceOrder: [{
        id: 'song1', kind: 'song', name: 'Existing',
        slides: [{ id: 's1', type: 'lyrics', fontSize: 75, lines: [] }],
      }],
    })
    getState().addSongFromLibrary({
      name: 'Way Maker',
      slides: [{ id: 'lib1', type: 'lyrics', fontSize: 90, lines: [] }],
    })
    const added = getState().serviceOrder[1]
    expect(added.slides[0].fontSize).toBe(90)
  })

  it('assigns new unique ids to all cloned slides', () => {
    getState().addSongFromLibrary({
      name: 'Way Maker',
      slides: [{ id: 'original-id', type: 'lyrics', lines: [] }],
    })
    const added = getState().serviceOrder[0]
    expect(added.slides[0].id).not.toBe('original-id')
  })

  it('adds the song to the end of the service order', () => {
    useSanctuaryStore.setState({
      serviceOrder: [{ id: 'existing', kind: 'song', name: 'First', slides: [] }],
    })
    getState().addSongFromLibrary({ name: 'Second', slides: [] })
    expect(getState().serviceOrder).toHaveLength(2)
    expect(getState().serviceOrder[1].name).toBe('Second')
  })
})

// ─── saveSongToLibrary ────────────────────────────────────────────────────────

describe('saveSongToLibrary', () => {
  it('saves slides with their fontSize intact', () => {
    getState().saveSongToLibrary({
      name: 'Way Maker',
      slides: [{ id: 's1', type: 'lyrics', fontSize: 85, lines: [] }],
    })
    const saved = getState().songLibrary.find(s => s.name === 'Way Maker')
    expect(saved.slides[0].fontSize).toBe(85)
  })

  it('updates an existing library entry rather than duplicating', () => {
    getState().saveSongToLibrary({ name: 'Way Maker', slides: [{ fontSize: 85 }] })
    getState().saveSongToLibrary({ name: 'Way Maker', slides: [{ fontSize: 90 }] })
    const matches = getState().songLibrary.filter(s => s.name === 'Way Maker')
    expect(matches).toHaveLength(1)
    expect(matches[0].slides[0].fontSize).toBe(90)
  })

  it('is case-insensitive when matching existing entries', () => {
    getState().saveSongToLibrary({ name: 'Way Maker', slides: [] })
    getState().saveSongToLibrary({ name: 'way maker', slides: [] })
    expect(getState().songLibrary.filter(s => s.name.toLowerCase() === 'way maker')).toHaveLength(1)
  })
})

// ─── LyricsSlide font-size scaling (pure logic, no rendering) ────────────────

describe('LyricsSlide font-size scaling', () => {
  const basePct = (lineCount) =>
    lineCount <= 2 ? 9 : lineCount <= 4 ? 7 : lineCount <= 6 ? 5.5 : lineCount <= 8 ? 4.5 : 3.5

  it('slides with fewer lines get a larger base scale', () => {
    expect(basePct(2)).toBeGreaterThan(basePct(4))
    expect(basePct(4)).toBeGreaterThan(basePct(6))
    expect(basePct(6)).toBeGreaterThan(basePct(8))
  })

  it('fontSize multiplier scales proportionally', () => {
    const scaled = (lines, fontSize) => parseFloat((basePct(lines) * (fontSize / 100)).toFixed(2))
    expect(scaled(4, 85)).toBeCloseTo(5.95)
    expect(scaled(4, 85)).toBeLessThan(scaled(4, 100))
    // A short chorus (2 lines) at 85% still renders larger than a long verse (8 lines) at 100%
    expect(scaled(2, 85)).toBeGreaterThan(scaled(8, 100))
  })
})

// ─── autoSave per-slide fontSize preservation ─────────────────────────────────

describe('autoSave per-slide fontSize matching', () => {
  // Reproduces the logic from CenterPanel autoSave mergedSlides
  const merge = (newSlides, existingSlides, themeProps) =>
    newSlides.map((newSlide) => {
      const match = existingSlides.find(
        (s) => s.type === newSlide.type && s.section === newSlide.section,
      )
      return {
        ...newSlide,
        ...themeProps,
        ...(match?.fontSize != null ? { fontSize: match.fontSize } : {}),
      }
    })

  it('preserves individual slide fontSize when text is edited', () => {
    const existing = [
      { type: 'lyrics', section: 'Chorus', fontSize: 110 },
      { type: 'lyrics', section: 'Verse 1', fontSize: 80 },
    ]
    const parsed = [
      { type: 'lyrics', section: 'Chorus', lines: ['updated chorus text'] },
      { type: 'lyrics', section: 'Verse 1', lines: ['updated verse text'] },
    ]
    const theme = { fontSize: 100, bgColor: '#000' }
    const result = merge(parsed, existing, theme)
    expect(result[0].fontSize).toBe(110) // Chorus keeps its 110
    expect(result[1].fontSize).toBe(80)  // Verse keeps its 80
  })

  it('falls back to theme fontSize for new sections with no match', () => {
    const existing = [{ type: 'lyrics', section: 'Verse 1', fontSize: 80 }]
    const parsed  = [
      { type: 'lyrics', section: 'Verse 1', lines: [] },
      { type: 'lyrics', section: 'Bridge', lines: [] },   // new section
    ]
    const theme = { fontSize: 100 }
    const result = merge(parsed, existing, theme)
    expect(result[0].fontSize).toBe(80)  // matched — keeps 80
    expect(result[1].fontSize).toBe(100) // no match — uses theme default
  })
})
