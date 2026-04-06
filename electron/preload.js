const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('sanctuary', {
  // Projector
  openProjector:    (displayId) => ipcRenderer.invoke('projector:open', displayId),
  getDisplays:      () => ipcRenderer.invoke('displays:get'),
  closeProjector:   () => ipcRenderer.invoke('projector:close'),
  sendToProjector:  (payload) => ipcRenderer.send('projector:update', payload),
  onProjectorUpdate:(callback) => {
    ipcRenderer.on('projector:update', (event, payload) => callback(payload))
    return () => ipcRenderer.removeAllListeners('projector:update')
  },

  // File dialogs
  openPptxDialog:  () => ipcRenderer.invoke('dialog:openPptx'),
  openImageDialog:  () => ipcRenderer.invoke('dialog:openImage'),
  prefs: {
    get:  (key)        => ipcRenderer.invoke('prefs:get', key),
    set:  (key, value) => ipcRenderer.invoke('prefs:set', key, value),
    load: ()           => ipcRenderer.invoke('prefs:load'),
    save: (prefs)      => ipcRenderer.invoke('prefs:save', prefs),
  },
  openImagesDialog: () => ipcRenderer.invoke('dialog:openImages'),
  readFile:        (filePath) => ipcRenderer.invoke('file:read', filePath),

  // Service data sync
  saveService: (data) => ipcRenderer.invoke('service:save', data),
  loadService: ()     => ipcRenderer.invoke('service:load'),
  pushService: (data) => ipcRenderer.invoke('service:push', data),
  pullService: ()     => ipcRenderer.invoke('service:pull'),

  // Config
  getConfig: ()    => ipcRenderer.invoke('config:get'),
  setConfig: (cfg) => ipcRenderer.invoke('config:set', cfg),

  // Auto-updater
  onUpdateAvailable:    (cb) => ipcRenderer.on('update:available', cb),
  onUpdateReady:        (cb) => ipcRenderer.on('update:ready', cb),
  onUpdateChecking:     (cb) => ipcRenderer.on('update:checking', cb),
  onUpdateNotAvailable: (cb) => ipcRenderer.on('update:not-available', (_, v) => cb(v)),
  onUpdateError:        (cb) => ipcRenderer.on('update:error', (_, msg) => cb(msg)),
  installUpdate:        ()   => ipcRenderer.invoke('updater:install'),

  // Detect projector window
  isProjector: () => {
    const params = new URLSearchParams(window.location.search)
    return params.get('projector') === '1'
  },
})