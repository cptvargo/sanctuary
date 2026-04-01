import { create } from 'zustand'

export const uid = () => crypto.randomUUID()

export const makeSlide = (type, overrides = {}) => {
  const defaults = {
    logo:         { name: 'Church Logo', churchName: 'The Floodgates Church', tagline: 'Newport News, VA', logoDataUrl: null, bgColor: '#000000', textColor: '#c8a84a' },
    lyrics:       { name: 'New Lyrics', song: '', section: '', lines: ['', '', '', ''], bgColor: '#050813', textColor: '#ffffff', bgImageUrl: null },
    countdown:    { name: 'Countdown', message: 'Service begins in', subMessage: 'Welcome — please be seated', durationMinutes: 10, bgColor: '#000000', accentColor: '#4a9edd', onEnd: 'advance' },
    pptx:         { name: 'PowerPoint', filePath: null, slides: [], currentSlideIndex: 0 },
    blank:        { name: 'Blank', bgColor: '#000000' },
    scripture:    { name: 'Scripture', reference: '', text: '', translation: 'KJV', bgColor: '#050813', textColor: '#e0e8ff' },
    announcement: { name: 'Announcement', title: '', body: '', bgColor: '#0a0a14', textColor: '#ffffff' },
  }
  return { id: uid(), type, transition: 'cut', ...(defaults[type] || {}), ...overrides }
}

export const makeSong = (overrides = {}) => ({
  id: uid(),
  kind: 'song',
  name: overrides.name || 'New Song',
  expanded: true,
  slides: overrides.slides || [makeSlide('lyrics', { name: 'V1' })],
})

const makeChecklist = () => ({
  preService: [
    { id: uid(), text: 'Sound system powered on', done: false },
    { id: uid(), text: 'Microphones tested', done: false },
    { id: uid(), text: 'Slides loaded and previewed', done: false },
    { id: uid(), text: 'Offering bags in place', done: false },
    { id: uid(), text: 'Stream / camera ready', done: false },
    { id: uid(), text: 'Bulletins printed and ready', done: false },
    { id: uid(), text: 'Worship team briefed on order', done: false },
    { id: uid(), text: 'Pastor notified — service ready', done: false },
  ],
  postService: [
    { id: uid(), text: 'Offering collected and secured', done: false },
    { id: uid(), text: 'Microphones returned and stored', done: false },
    { id: uid(), text: 'Sound system powered down', done: false },
    { id: uid(), text: 'Slides closed', done: false },
    { id: uid(), text: 'Projector off', done: false },
    { id: uid(), text: 'Lights checked', done: false },
    { id: uid(), text: 'Building secured', done: false },
  ],
})

export const flattenOrder = (order) => {
  const slides = []
  for (const item of order) {
    if (item.kind === 'slide') slides.push(item.slide)
    else if (item.kind === 'song') slides.push(...item.slides)
  }
  return slides
}

const logo = makeSlide('logo', { name: 'Church Logo' })
const countdown = makeSlide('countdown', { name: 'Countdown — 10 min' })
const pptx = makeSlide('pptx', { name: 'Sermon Notes' })
const blank = makeSlide('blank', { name: 'Blank' })

const goodness = makeSong({
  name: 'Goodness Of God',
  slides: [
    makeSlide('lyrics', { name: 'Verse 1', song: 'Goodness Of God', section: 'Verse 1', lines: ['I love You Lord', 'Oh Your mercy never fails me', 'All my days', "I've been held in Your hands", 'From the moment that I wake up', 'Until I lay my head', 'I will sing of the goodness of God'] }),
    makeSlide('lyrics', { name: 'Chorus 1', song: 'Goodness Of God', section: 'Chorus 1', lines: ['All my life You have been faithful', 'All my life You have been so so good', 'With every breath that I am able', 'I will sing of the goodness of God'] }),
    makeSlide('lyrics', { name: 'Verse 2', song: 'Goodness Of God', section: 'Verse 2', lines: ['I love Your voice', 'You have led me through the fire', 'In darkest night', 'You are close like no other', "I've known You as a father", "I've known You as a friend", 'I have lived in the goodness of God'] }),
    makeSlide('lyrics', { name: 'Chorus 1', song: 'Goodness Of God', section: 'Chorus 1', lines: ['All my life You have been faithful', 'All my life You have been so so good', 'With every breath that I am able', 'I will sing of the goodness of God'] }),
    makeSlide('lyrics', { name: 'Bridge', song: 'Goodness Of God', section: 'Bridge', lines: ['Your goodness is running after', "It's running after me", 'Your goodness is running after', "It's running after me", 'With my life laid down', "I'm surrendered now", 'I give You everything', 'Your goodness is running after', "It's running after me"] }),
    makeSlide('lyrics', { name: 'Chorus 1', song: 'Goodness Of God', section: 'Chorus 1', lines: ['All my life You have been faithful', 'All my life You have been so so good', 'With every breath that I am able', 'I will sing of the goodness of God'] }),
  ],
})

const defaultOrder = [
  { id: uid(), kind: 'slide', slide: logo },
  { id: uid(), kind: 'slide', slide: countdown },
  makeSong({
    name: 'Amazing Grace',
    slides: [
      makeSlide('lyrics', { name: 'Verse 1', song: 'Amazing Grace', section: 'Verse 1', lines: ['Amazing grace, how sweet the sound', 'That saved a wretch like me', 'I once was lost, but now am found', 'Was blind, but now I see'] }),
      makeSlide('lyrics', { name: 'Verse 2', song: 'Amazing Grace', section: 'Verse 2', lines: ["Through many dangers, toils and snares", 'I have already come', "'Twas grace that brought me safe thus far", 'And grace will lead me home'] }),
      makeSlide('lyrics', { name: 'Chorus 1', song: 'Amazing Grace', section: 'Chorus 1', lines: ["My chains are gone, I've been set free", 'My God, my Savior has ransomed me', 'And like a flood His mercy reigns', 'Unending love, amazing grace'] }),
    ],
  }),
  goodness,
  makeSong({
    name: 'I Am A Christian',
    slides: [
      makeSlide('lyrics', { name: 'Verse 1', song: 'I Am A Christian', section: 'Verse 1', lines: ['I am a Christian', 'A mighty mighty Christian', 'I am a Christian', 'A mighty mighty Christian'] }),
      makeSlide('lyrics', { name: 'Chorus 1', song: 'I Am A Christian', section: 'Chorus 1', lines: ["I've got a shield of faith", 'Righteous breastplate', 'Sword of the Spirit', 'My loins are covered by truth'] }),
    ],
  }),
  { id: uid(), kind: 'slide', slide: pptx },
  { id: uid(), kind: 'slide', slide: blank },
]

// ─── Single global countdown interval — owned by the store, not any component ──
let _countdownInterval = null

function _startCountdownInterval(get, set) {
  if (_countdownInterval) return // already running
  _countdownInterval = setInterval(() => {
    const state = get()
    if (!state.isLive || !state.liveSlideId) return
    const liveSlide = state.getLiveSlide()
    if (!liveSlide || liveSlide.type !== 'countdown') return
    const slideId = liveSlide.id
    const current = state.countdownRemaining[slideId] ?? 0
    if (current <= 0) {
      // Handle onEnd
      const onEnd = liveSlide.onEnd || 'advance'
      if (onEnd === 'advance') {
        const all = state.getAllSlides()
        const idx = all.findIndex(s => s.id === slideId)
        const next = all[idx + 1]
        if (next) {
          const slideWithFade = { ...next, transition: 'fade' }
          set({ activeSlideId: next.id, liveSlideId: next.id, isBlackOut: false })
          const s = get()
          const payload = { isLive: s.isLive, isBlackOut: false, slide: slideWithFade, countdownRemaining: null }
          if (typeof window !== 'undefined' && window.sanctuary) window.sanctuary.sendToProjector(payload)
          try { const bc = new BroadcastChannel('sanctuary-projector'); bc.postMessage(payload); bc.close() } catch (_) {}
        }
      } else if (onEnd === 'loop') {
        const mins = liveSlide.durationMinutes || 10
        set(s => ({ countdownRemaining: { ...s.countdownRemaining, [slideId]: mins * 60 } }))
        get()._syncProjector()
      }
      _stopCountdownInterval()
      return
    }
    set(s => ({ countdownRemaining: { ...s.countdownRemaining, [slideId]: current - 1 } }))
    get()._syncProjector()
  }, 1000)
}

function _stopCountdownInterval() {
  if (_countdownInterval) {
    clearInterval(_countdownInterval)
    _countdownInterval = null
  }
}

export const useSanctuaryStore = create((set, get) => ({
  serviceOrder: defaultOrder,
  activeSlideId: logo.id,
  liveSlideId: null,
  isLive: false,
  isBlackOut: false,
  mode: 'edit',
  activeSection: 'service',
  countdownRemaining: {},
  checklist: makeChecklist(),

  // Song library — persisted songs for reuse across services
  songLibrary: [
    { id: uid(), name: 'Goodness Of God', slides: goodness.slides },
  ],

  // ── Derived ───────────────────────────────────────────────────────────────
  getAllSlides: () => flattenOrder(get().serviceOrder),

  getActiveSlide: () => {
    const all = flattenOrder(get().serviceOrder)
    return all.find(s => s.id === get().activeSlideId) || all[0] || null
  },

  getLiveSlide: () => {
    const all = flattenOrder(get().serviceOrder)
    return all.find(s => s.id === get().liveSlideId) || null
  },

  // ── Service order ─────────────────────────────────────────────────────────
  addSlideItem: (type, afterItemId = null) => {
    const slide = makeSlide(type)
    const item = { id: uid(), kind: 'slide', slide }
    set(state => {
      const order = [...state.serviceOrder]
      const idx = afterItemId ? order.findIndex(i => i.id === afterItemId) : order.length
      order.splice(idx, 0, item)
      return { serviceOrder: order, activeSlideId: slide.id }
    })
  },

  addSongItem: (afterItemId = null) => {
    const song = makeSong({ name: 'New Song' })
    set(state => {
      const order = [...state.serviceOrder]
      const idx = afterItemId ? order.findIndex(i => i.id === afterItemId) + 1 : order.length
      order.splice(idx, 0, song)
      return { serviceOrder: order, activeSlideId: song.slides[0]?.id }
    })
  },

  addSlideToSong: (songId, type = 'lyrics') => {
    const slide = makeSlide(type, { name: 'New Slide' })
    set(state => ({
      serviceOrder: state.serviceOrder.map(item =>
        item.id === songId && item.kind === 'song'
          ? { ...item, slides: [...item.slides, slide] }
          : item
      ),
      activeSlideId: slide.id,
    }))
  },

  removeItem: (itemId) => {
    set(state => {
      const order = state.serviceOrder.filter(i => i.id !== itemId)
      const all = flattenOrder(order)
      return { serviceOrder: order, activeSlideId: all[0]?.id || null }
    })
  },

  removeSlideFromSong: (songId, slideId) => {
    set(state => ({
      serviceOrder: state.serviceOrder.map(item =>
        item.id === songId && item.kind === 'song'
          ? { ...item, slides: item.slides.filter(s => s.id !== slideId) }
          : item
      ),
    }))
  },

  toggleSongExpanded: (songId) => {
    set(state => ({
      serviceOrder: state.serviceOrder.map(item =>
        item.id === songId ? { ...item, expanded: !item.expanded } : item
      ),
    }))
  },

  reorderItems: (fromIdx, toIdx) => {
    set(state => {
      const order = [...state.serviceOrder]
      const [removed] = order.splice(fromIdx, 1)
      order.splice(toIdx, 0, removed)
      return { serviceOrder: order }
    })
  },

  updateSongName: (songId, name) => {
    set(state => ({
      serviceOrder: state.serviceOrder.map(item =>
        item.id === songId && item.kind === 'song' ? { ...item, name } : item
      ),
    }))
  },

  // ── Slide editing ─────────────────────────────────────────────────────────
  updateSlide: (slideId, changes) => {
    set(state => ({
      serviceOrder: state.serviceOrder.map(item => {
        if (item.kind === 'slide' && item.slide.id === slideId)
          return { ...item, slide: { ...item.slide, ...changes } }
        if (item.kind === 'song')
          return { ...item, slides: item.slides.map(s => s.id === slideId ? { ...s, ...changes } : s) }
        return item
      }),
    }))
  },

  setActiveSlide: (slideId) => set({ activeSlideId: slideId }),

  // ── Navigation ────────────────────────────────────────────────────────────
  navigateNext: () => {
    const all = flattenOrder(get().serviceOrder)
    const idx = all.findIndex(s => s.id === get().activeSlideId)
    if (idx < all.length - 1) set({ activeSlideId: all[idx + 1].id })
  },

  navigatePrev: () => {
    const all = flattenOrder(get().serviceOrder)
    const idx = all.findIndex(s => s.id === get().activeSlideId)
    if (idx > 0) set({ activeSlideId: all[idx - 1].id })
  },

  // ── Live ──────────────────────────────────────────────────────────────────
  goLive: () => {
    set({ isLive: true, liveSlideId: get().activeSlideId, isBlackOut: false })
    get()._syncProjector()
    get()._checkStartCountdown()
  },
  endLive: () => {
    _stopCountdownInterval()
    set({ isLive: false, liveSlideId: null })
    get()._syncProjector()
  },
  toggleLive: () => get().isLive ? get().endLive() : get().goLive(),
  sendToProjector: () => {
    if (!get().isLive) get().goLive()
    set({ liveSlideId: get().activeSlideId, isBlackOut: false })
    get()._syncProjector()
    get()._checkStartCountdown()
  },
  toggleBlackOut: () => { set(s => ({ isBlackOut: !s.isBlackOut })); get()._syncProjector() },
  setMode: (mode) => {
    set({ mode })
    // When toggling back to preview while live, push current state immediately
    const state = get()
    if (mode === 'preview' && state.isLive) {
      get()._syncProjector()
    }
  },
  setActiveSection: (section) => set({ activeSection: section }),

  // ── PPTX ─────────────────────────────────────────────────────────────────
  pptxNext: (slideId) => {
    const slide = flattenOrder(get().serviceOrder).find(s => s.id === slideId)
    if (!slide) return
    get().updateSlide(slideId, { currentSlideIndex: Math.min(slide.currentSlideIndex + 1, slide.slides.length - 1) })
    get()._syncProjector()
  },
  pptxPrev: (slideId) => {
    const slide = flattenOrder(get().serviceOrder).find(s => s.id === slideId)
    if (!slide) return
    get().updateSlide(slideId, { currentSlideIndex: Math.max(slide.currentSlideIndex - 1, 0) })
    get()._syncProjector()
  },
  pptxGoTo: (slideId, index) => { get().updateSlide(slideId, { currentSlideIndex: index }); get()._syncProjector() },

  // ── Countdown ─────────────────────────────────────────────────────────────
  initCountdown: (slideId, minutes) => {
    // Only initialize if not already set (don't reset a running timer)
    if (get().countdownRemaining[slideId] !== undefined) return
    set(state => ({ countdownRemaining: { ...state.countdownRemaining, [slideId]: minutes * 60 } }))
  },

  resetCountdown: (slideId, minutes) => {
    // Explicit reset — always sets to given duration
    set(state => ({ countdownRemaining: { ...state.countdownRemaining, [slideId]: minutes * 60 } }))
    const s = get()
    if (s.isLive && s.liveSlideId === slideId) get()._syncProjector()
  },
  // tickCountdown kept for compatibility but interval is now store-managed
  tickCountdown: (slideId) => {
    set(state => {
      const c = state.countdownRemaining[slideId] ?? 0
      if (c <= 0) return {}
      return { countdownRemaining: { ...state.countdownRemaining, [slideId]: c - 1 } }
    })
  },

  _checkStartCountdown: () => {
    const state = get()
    const liveSlide = state.getLiveSlide()
    if (liveSlide && liveSlide.type === 'countdown') {
      _startCountdownInterval(get, set)
    } else {
      _stopCountdownInterval()
    }
  },

  // ── Checklist ─────────────────────────────────────────────────────────────
  toggleChecklistItem: (section, id) => {
    set(state => ({
      checklist: { ...state.checklist, [section]: state.checklist[section].map(i => i.id === id ? { ...i, done: !i.done } : i) }
    }))
  },
  addChecklistItem: (section, text) => {
    set(state => ({
      checklist: { ...state.checklist, [section]: [...state.checklist[section], { id: uid(), text, done: false }] }
    }))
  },
  removeChecklistItem: (section, id) => {
    set(state => ({
      checklist: { ...state.checklist, [section]: state.checklist[section].filter(i => i.id !== id) }
    }))
  },
  resetChecklist: (section) => {
    set(state => ({
      checklist: { ...state.checklist, [section]: state.checklist[section].map(i => ({ ...i, done: false })) }
    }))
  },

  // ── Song library ──────────────────────────────────────────────────────────
  saveSongToLibrary: (song) => {
    set(state => {
      const existing = state.songLibrary.findIndex(s => s.name.toLowerCase() === song.name.toLowerCase())
      if (existing >= 0) {
        // Update existing
        const lib = [...state.songLibrary]
        lib[existing] = { ...song, id: lib[existing].id }
        return { songLibrary: lib }
      }
      return { songLibrary: [...state.songLibrary, { ...song, id: uid() }] }
    })
  },

  deleteSongFromLibrary: (id) => {
    set(state => ({ songLibrary: state.songLibrary.filter(s => s.id !== id) }))
  },

  addSongFromLibrary: (libSong) => {
    // Deep-clone with new IDs so it's independent
    const cloned = makeSong({
      name: libSong.name,
      slides: libSong.slides.map(s => ({ ...s, id: uid() })),
    })
    set(state => ({ serviceOrder: [...state.serviceOrder, cloned] }))
  },

  // ── Countdown controls ─────────────────────────────────────────────────────
  addCountdownMinutes: (slideId, minutes) => {
    set(state => ({
      countdownRemaining: {
        ...state.countdownRemaining,
        [slideId]: Math.max(0, (state.countdownRemaining[slideId] ?? 0) + minutes * 60),
      },
    }))
    // Sync immediately so projector reflects the new time
    get()._syncProjector()
  },

  // ── Projector sync ────────────────────────────────────────────────────────
  _syncProjector: () => {
    const state = get()
    const liveSlide = state.getLiveSlide()
    const payload = { isLive: state.isLive, isBlackOut: state.isBlackOut, slide: liveSlide, countdownRemaining: liveSlide ? state.countdownRemaining[liveSlide.id] : null }
    if (typeof window.sanctuary !== 'undefined') window.sanctuary.sendToProjector(payload)
    try { const bc = new BroadcastChannel('sanctuary-projector'); bc.postMessage(payload); bc.close() } catch (_) {}
    // Start/stop countdown interval based on what's now live
    if (liveSlide && liveSlide.type === 'countdown') {
      _startCountdownInterval(get, set)
    } else {
      _stopCountdownInterval()
    }
  },
}))
