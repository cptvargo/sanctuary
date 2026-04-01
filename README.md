# Sanctuary 🎛️

A church presentation app built with Electron + React + Vite. Replaces Proclaim with full PowerPoint import, worship lyrics, countdown timer, logo slides, and a live/edit mode toggle.

---

## Setup

### Prerequisites
- Node.js 18+
- npm

### Install dependencies

```bash
npm install
npm install jszip   # required for .pptx import
```

### Run in development

```bash
npm run dev
```

This starts Vite (port 5173) and Electron simultaneously. The operator window opens automatically. To open the projector window, click **⊞ Projector** in the top bar.

**Single-monitor dev mode:** The projector window opens as a smaller floating window so you can see both at once.

**Dual-monitor production:** The projector window auto-detects your second display and goes full-screen.

---

## Build for distribution

```bash
npm run build
```

Output is in `dist-electron/`. On Windows this produces an NSIS installer.

---

## Architecture

```
sanctuary/
├── electron/
│   ├── main.js          # Main process — window management, IPC, file dialogs
│   └── preload.js       # Context bridge — exposes safe API to renderer
├── src/
│   ├── main.jsx         # Entry point — routes operator vs projector view
│   ├── App.jsx          # Operator window — keyboard shortcuts, layout
│   ├── store/
│   │   └── sanctuaryStore.js   # Zustand store — all app state
│   ├── components/
│   │   ├── panels/
│   │   │   ├── TopBar.jsx        # Live status, mode toggle, Go Live
│   │   │   ├── QueuePanel.jsx    # Slide queue with drag reorder + add menu
│   │   │   ├── EditorPanel.jsx   # Center canvas + editor controls
│   │   │   └── ProjectorPanel.jsx # Right sidebar — projector preview + up next
│   │   ├── slides/
│   │   │   ├── SlideCanvas.jsx   # 16:9 slide renderer (used in editor + projector)
│   │   │   ├── LogoSlide.jsx
│   │   │   ├── LyricsSlide.jsx
│   │   │   ├── CountdownSlide.jsx
│   │   │   ├── PptxSlide.jsx
│   │   │   ├── BlankSlide.jsx    # Also exports ScriptureSlide, AnnouncementSlide
│   │   │   └── editors/
│   │   │       ├── LyricsEditor.jsx
│   │   │       ├── LogoEditor.jsx
│   │   │       ├── CountdownEditor.jsx
│   │   │       ├── PptxEditor.jsx
│   │   │       ├── ScriptureEditor.jsx
│   │   │       └── AnnouncementEditor.jsx
│   │   └── ProjectorView.jsx     # Fullscreen projector output window
│   └── styles/
│       ├── global.css
│       └── App.module.css
└── index.html
```

---

## Slide types

| Type         | Description |
|--------------|-------------|
| Logo         | Church logo + name + tagline. Import PNG/SVG logo image. |
| Lyrics       | Multi-line worship lyrics. Per-slide colors. Song + section label. |
| Countdown    | Live countdown timer. Set duration, reset anytime. |
| PowerPoint   | Import a .pptx file. Cycle through all slides inside Sanctuary. |
| Scripture    | Bible verse with reference + translation label. Italic display. |
| Announcement | Title + body announcement slide. |
| Blank        | Pure black (or custom color) for transitions. |

---

## Key workflows

### Going live
1. Build your slide queue in the left panel.
2. Click **▶ Go Live** (or press `L`).
3. Select a slide and press **Enter** or click **▶ Push to Projector**.

### Edit/Preview toggle
- **Edit mode** (default): Shows the editor panel. You can make changes while still live — the projector continues showing the last pushed slide.
- **Preview mode**: Hides the editor. Shows a read-only view of what's on screen. Useful for presenting/following along.
- Toggle with `P` or the pill switch in the top bar.

### Black out
Press `B` or click **○ Black Out** to instantly send black to the projector without ending the live session.

### PowerPoint import
1. Add a **PowerPoint** slide to your queue.
2. In the editor panel, click **+ Import .pptx file**.
3. The app parses slide titles and body text from the .pptx XML.
4. Navigate slides with `‹ ›` or click a slide in the list.
5. Slide content renders directly — no external app needed.

### Drag to reorder
Drag any slide in the queue to reorder. Right-click for Duplicate / Delete.

---

## Keyboard shortcuts

| Key        | Action |
|------------|--------|
| `Space / →` | Next slide |
| `←`         | Previous slide |
| `Enter`     | Send active slide to projector |
| `B`         | Black out |
| `L`         | Toggle live |
| `P`         | Toggle Edit/Preview mode |

---

## Extending

### Add a new slide type
1. Add the type to `makeSlide()` defaults in `sanctuaryStore.js`
2. Create `src/components/slides/YourSlide.jsx`
3. Create `src/components/slides/editors/YourEditor.jsx`
4. Register both in `SlideCanvas.jsx` and `EditorPanel.jsx`
5. Add to `SLIDE_TYPE_META` in `QueuePanel.jsx`
6. Add to `ADD_TYPES` in `QueuePanel.jsx`

### Projector communication
Operator → Projector communication uses two parallel channels:
- **Electron IPC** (`ipcRenderer.send` / `ipcMain.on` relay): primary in production
- **BroadcastChannel** (`sanctuary-projector`): fallback for dev / browser testing

Both are fired on every `_syncProjector()` call in the store.
