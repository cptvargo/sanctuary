import { create } from 'zustand'

export const uid = () => crypto.randomUUID()

export const makeSlide = (type, overrides = {}) => {
  const defaults = {
    logo:         { name: 'Church Logo', churchName: 'The Floodgates Church', tagline: 'Newport News, VA', logoDataUrl: null, bgColor: '#000000', textColor: '#c8a84a' },
    lyrics:       { name: 'New Lyrics', song: '', section: '', lines: ['', '', '', ''], bgColor: '#050813', textColor: '#ffffff', bgImageUrl: null },
    countdown:    { name: 'Countdown', message: 'Service begins in', subMessage: 'Welcome — please be seated', durationMinutes: 5, bgColor: '#000000', accentColor: '#4a9edd', onEnd: 'advance' },
    blank:        { name: 'Blank', bgColor: '#000000' },
    scripture:    { name: 'Scripture', reference: '', text: '', translation: 'KJV', bgColor: '#050813', textColor: '#e0e8ff' },
    announcement: { name: 'Announcement', title: '', body: '', bgColor: '#0a0a14', textColor: '#ffffff' },
    image:        { name: 'Announcement', images: [], currentIndex: 0, displayMode: 'announcement', bgColor: '#000000' },
  }
  return { id: uid(), type, transition: 'cut', ...(defaults[type] || {}), ...overrides }
}

export const makeSong = (overrides = {}) => ({
  id: uid(),
  kind: 'song',
  name: overrides.name || 'New Song',
  expanded: true,
  slides: overrides.slides || [makeSlide('lyrics', { name: 'V1', ...( overrides.slideOverrides || {}) })],
})

const makeChecklist = () => ({
  preService: [
    { id: uid(), text: 'Sound Board — Has soundboard cart been rolled out and powered on', done: false },
    { id: uid(), text: 'Sound Board — Has network cable been run to stage box', done: false },
    { id: uid(), text: 'Sound Board — Has channel routing been done (AVB outputs reset)', done: false },
    { id: uid(), text: 'Sound Board — Are wireless microphone packs hooked to correct transmitters', done: false },
    { id: uid(), text: "Sound Board — Batteries swapped out on Pastor Russ' & Nick's mic receivers", done: false },
    { id: uid(), text: "Sound Board — Battery swapped out on Mrs. Jamie's microphone", done: false },
    { id: uid(), text: 'Sound Board — Batteries swapped out on all in-ear monitors + brought to stage', done: false },
    { id: uid(), text: "Sound Board — Pastor Russ' mic put together, turned on, tested", done: false },
    { id: uid(), text: "Sound Board — Mrs. Jamie's mic turned on and tested", done: false },
    { id: uid(), text: 'Sound Board — Headphones connected to soundboard', done: false },
    { id: uid(), text: 'Sound Board — Is laptop connected to soundboard', done: false },
    { id: uid(), text: 'Laptop — Is power cord in and is there power to the laptop', done: false },
    { id: uid(), text: 'Laptop — Is Wi-Fi connected to laptop', done: false },
    { id: uid(), text: 'Laptop — Is OBS Studio on and working', done: false },
    { id: uid(), text: 'Laptop — Does Spotify have internet and is it working', done: false },
    { id: uid(), text: 'Laptop — Is projector on', done: false },
    { id: uid(), text: 'Laptop — Is HDMI cable connected to projector', done: false },
    { id: uid(), text: 'Laptop — Are slides prepared for service', done: false },
    { id: uid(), text: 'Camera — Camera on tripod', done: false },
    { id: uid(), text: 'Camera — Does camera have power', done: false },
    { id: uid(), text: 'Camera — Is camera connected to laptop', done: false },
    { id: uid(), text: 'Sound Check — Pastor Russ', done: false },
    { id: uid(), text: 'Sound Check — Mrs. Jamie', done: false },
    { id: uid(), text: 'Sound Check — Anna', done: false },
    { id: uid(), text: 'Sound Check — Kelsey', done: false },
    { id: uid(), text: 'Sound Check — Nick', done: false },
    { id: uid(), text: 'Sound Check — Bass', done: false },
    { id: uid(), text: 'Sound Check — Guitar', done: false },
    { id: uid(), text: 'Sound Check — Keyboard', done: false },
    { id: uid(), text: 'Sound Check — Drums', done: false },
    { id: uid(), text: 'Sound Check — Laptop', done: false },
  ],
  postService: [
    { id: uid(), text: 'Sound Board — Does Aux1 out have channel B', done: false },
    { id: uid(), text: 'Sound Board — Does Mono out have channel A', done: false },
    { id: uid(), text: 'Sound Board — Are Mics 1 thru 6 in ports 1 thru 6', done: false },
    { id: uid(), text: 'Sound Board — Is power cord in and power switch off', done: false },
    { id: uid(), text: "Sound Board — Is amp off (it's located off stage to the right)", done: false },
    { id: uid(), text: 'Sound Board — Is the projector off', done: false },
    { id: uid(), text: 'Floodgates Media — Is camera and its cord stored away', done: false },
    { id: uid(), text: 'Floodgates Media — Is the laptop and its cord stored away', done: false },
    { id: uid(), text: 'Floodgates Media — Is sound board stored away', done: false },
    { id: uid(), text: 'Floodgates Media — Microphone batteries charged or charging for next service', done: false },
    { id: uid(), text: 'Floodgates Media — All worship team equipment stored away', done: false },
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
const countdown = makeSlide('countdown', { name: 'Countdown' })

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


const iAmAChristian = makeSong({
  name: 'I Am A Christian',
  slides: [
    makeSlide('lyrics', { name: 'Chorus', song: 'I Am A Christian', section: 'Chorus 1', lines: ['I am a Christian', 'A mighty mighty Christian', 'I am a Christian', 'A mighty mighty Christian'] }),
    makeSlide('lyrics', { name: 'Verse', song: 'I Am A Christian', section: 'Verse 1', lines: ["I've got a shield of faith", 'Righteous breastplate', 'Sword of the Spirit', 'My loins are covered by truth'] }),
    makeSlide('lyrics', { name: 'Verse 2', song: 'I Am A Christian', section: 'Verse 1', lines: ['Helmet of salvation', 'Gospel shoes on', 'And above all', 'I said above all'] }),
    makeSlide('lyrics', { name: 'Verse 3', song: 'I Am A Christian', section: 'Verse 1', lines: ['I said above all', "I'm dressed in the whole armor of God", "'Cause I am a Christian"] }),
  ],
})

const faith = makeSong({
  name: 'F.A.I.T.H.',
  slides: [
    makeSlide('lyrics', { name: 'Chorus', song: 'F.A.I.T.H.', section: 'Chorus 1', lines: ['Give me an F(F)', 'A(A) I(I) TH(TH)', 'I said F(F) A(A)', 'I(I) TH(TH)', "We're talkin' power", 'That comes from F A I T H'] }),
    makeSlide('lyrics', { name: 'Verse 1', song: 'F.A.I.T.H.', section: 'Verse 1', lines: ['Got a mountain', "It's in your way", 'You want to move it', 'It wants to stay', 'You need the power', 'That comes from F A I T H'] }),
    makeSlide('lyrics', { name: 'Verse 2', song: 'F.A.I.T.H.', section: 'Verse 2', lines: ["We're talkin' sickness", 'Or poverty', 'Any problem has got to flee', 'With the power', 'That comes from F A I T H'] }),
    makeSlide('lyrics', { name: 'Verse 3', song: 'F.A.I.T.H.', section: 'Verse 3', lines: ['It will always work for you', 'The blood of Jesus', "Guarantees it's true", "It's the power", 'That comes from F A I T H'] }),
  ],
})

const biggerThanBig = makeSong({
  name: 'Bigger Than Big',
  slides: [
    makeSlide('lyrics', { name: 'Chorus', song: 'Bigger Than Big', section: 'Chorus 1', lines: ["God You're bigger than big", 'Stronger than strong', "Yeah You're mightier than mighty", 'And louder than this song'] }),
    makeSlide('lyrics', { name: 'Chorus 2', song: 'Bigger Than Big', section: 'Chorus 1', lines: ['Your love for me stretches farther than far', "And I can't imagine just how big You are", 'Just how big You are'] }),
    makeSlide('lyrics', { name: 'Verse', song: 'Bigger Than Big', section: 'Verse 1', lines: ['God You made our big blue sky', 'You made the oceans deep and wide', 'God You made the trees so tall', 'And Your love is bigger than it all'] }),
  ],
})

const knowingYou = makeSong({
  name: 'Knowing You',
  slides: [
    makeSlide('lyrics', { name: 'Verse 1', song: 'Knowing You', section: 'Verse 1', lines: ['I was made for You', 'To love and be loved by You', 'All of my life will be', 'An offering'] }),
    makeSlide('lyrics', { name: 'Verse 1b', song: 'Knowing You', section: 'Verse 1', lines: ['Oh I I was made for You'] }),
    makeSlide('lyrics', { name: 'Chorus', song: 'Knowing You', section: 'Chorus 1', lines: ['Knowing You', 'Knowing You', 'I found my reason for living', "And Jesus it's knowing You"] }),
    makeSlide('lyrics', { name: 'Chorus 2', song: 'Knowing You', section: 'Chorus 1', lines: ['Loving You', 'Loving You', 'I found my reason for breathing', "And Jesus it's loving You"] }),
    makeSlide('lyrics', { name: 'Verse 2', song: 'Knowing You', section: 'Verse 2', lines: ['I was made for You', 'To hear and obey Your voice', "There's life in the words You speak", 'Your servant is listening'] }),
    makeSlide('lyrics', { name: 'Verse 2b', song: 'Knowing You', section: 'Verse 2', lines: ['Oh I was made for You'] }),
    makeSlide('lyrics', { name: 'Verse 3', song: 'Knowing You', section: 'Verse 3', lines: ['We we were made for You', 'To worship and bless Your name', 'To sing of our risen hope', 'Until the whole world knows'] }),
    makeSlide('lyrics', { name: 'Verse 3b', song: 'Knowing You', section: 'Verse 3', lines: ['Oh we we were made for You'] }),
  ],
})

const cleansed = makeSong({
  name: 'Cleansed',
  slides: [
    makeSlide('lyrics', { name: 'Verse 1', song: 'Cleansed', section: 'Verse 1', lines: ['Here at the altar where I run to rest', 'Where I wait resurrection', 'And the touch of Your breath'] }),
    makeSlide('lyrics', { name: 'Pre-Chorus', song: 'Cleansed', section: 'Pre-Chorus', lines: ['I die now daily because I have learned to live', 'In the grace that belongs to all who are born again'] }),
    makeSlide('lyrics', { name: 'Chorus 1', song: 'Cleansed', section: 'Chorus 1', lines: ['I am cleansed I am washed', 'I am sanctified', 'I am Holy Ghost filled and water baptized'] }),
    makeSlide('lyrics', { name: 'Chorus 1b', song: 'Cleansed', section: 'Chorus 1', lines: ['I am right with my God for all time', "Cause Jesus my Savior's alive"] }),
    makeSlide('lyrics', { name: 'Verse 2', song: 'Cleansed', section: 'Verse 2', lines: ['Here at the table where children are fed', 'We are filled with', 'The mercy of the Lamb and the Bread'] }),
    makeSlide('lyrics', { name: 'Pre-Chorus 2', song: 'Cleansed', section: 'Pre-Chorus', lines: ['I feast now daily because I have learned to live', 'In the grace that belongs to all who are born again'] }),
    makeSlide('lyrics', { name: 'Bridge', song: 'Cleansed', section: 'Bridge', lines: ['Glory glory', 'This is what is called glory'] }),
    makeSlide('lyrics', { name: 'Chorus 2', song: 'Cleansed', section: 'Chorus 1', lines: ['I am cleansed I am washed', 'I am sanctified', 'I am Holy Ghost filled and water baptized'] }),
    makeSlide('lyrics', { name: 'Chorus 2b', song: 'Cleansed', section: 'Chorus 1', lines: ['I am right with my God for all time', 'Cause Jesus my Savior', 'Jesus my Savior', "Jesus my Savior's alive"] }),
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
  activeThemeProps: null, // stores last applied theme slide props

  // Song library — persisted songs for reuse across services
  songLibrary: [
    { id: uid(), name: 'Goodness Of God',   slides: goodness.slides },
    { id: uid(), name: 'I Am A Christian',  slides: iAmAChristian.slides },
    { id: uid(), name: 'F.A.I.T.H.',        slides: faith.slides },
    { id: uid(), name: 'Bigger Than Big',   slides: biggerThanBig.slides },
    { id: uid(), name: 'Knowing You',       slides: knowingYou.slides },
    { id: uid(), name: 'Cleansed',          slides: cleansed.slides },
    { id: uid(), name: 'Amazing Grace',     slides: [] }, // built-in
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
    const state = get()
    // Only use activeThemeProps if it came from a lyrics theme (not countdown)
    const themeProps = state.activeThemeProps || (() => {
      // Fallback: inherit from first existing song's lyrics slides only
      const existingSong = state.serviceOrder.find(i => i.kind === 'song' && i.slides?.some(s => s.type === 'lyrics'))
      const s = existingSong?.slides?.find(sl => sl.type === 'lyrics')
      return s ? { bgImageUrl: s.bgImageUrl || null, bgGradient: s.bgGradient || null, bgColor: s.bgColor || '#050813', textColor: s.textColor || '#ffffff', bgOverlayOpacity: s.bgOverlayOpacity ?? 0.55, fontSize: s.fontSize || 100, fontId: s.fontId || 'montserrat', smartMediaId: s.smartMediaId || null } : {}
    })()
    const song = makeSong({ name: 'New Song', slideOverrides: themeProps })
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
    // If the updated slide is currently live, push changes to projector immediately
    const s = get()
    if (s.isLive && s.liveSlideId === slideId) get()._syncProjector()
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

  // ── Service management ────────────────────────────────────────────────────
  resetServiceOrder: () => {
    const freshLogo = makeSlide('logo', { name: 'Church Logo', churchName: 'The Floodgates Church', tagline: 'Newport News, VA' })
    const freshCountdown = makeSlide('countdown', { name: 'Countdown', durationMinutes: 5, onEnd: 'advance' })
    set({
      serviceOrder: [
        { id: uid(), kind: 'slide', slide: freshLogo },
        { id: uid(), kind: 'slide', slide: freshCountdown },
      ],
      activeSlideId: freshLogo.id,
      liveSlideId: null,
      isLive: false,
      isBlackOut: false,
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
    const themeProps = get().activeThemeProps || {}
    const cloned = makeSong({
      name: libSong.name,
      slides: libSong.slides.map(s => ({ ...s, id: uid(), ...themeProps })),
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
    // Inject logo data url into lyrics slides so projector can show church logo watermark
    let enrichedSlide = liveSlide
    if (liveSlide?.type === 'lyrics') {
      const logoSlide = state.serviceOrder.find(i => i.slide?.type === 'logo')?.slide
      if (logoSlide?.logoDataUrl) {
        enrichedSlide = { ...liveSlide, _logoDataUrl: logoSlide.logoDataUrl }
      }
    }
    const payload = { isLive: state.isLive, isBlackOut: state.isBlackOut, slide: enrichedSlide, countdownRemaining: liveSlide ? state.countdownRemaining[liveSlide.id] : null }
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