const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('sanctuary', {
  // Projector
  openProjector:    () => ipcRenderer.invoke('projector:open'),
  closeProjector:   () => ipcRenderer.invoke('projector:close'),
  sendToProjector:  (payload) => ipcRenderer.send('projector:update', payload),
  onProjectorUpdate:(callback) => {
    ipcRenderer.on('projector:update', (event, payload) => callback(payload))
    return () => ipcRenderer.removeAllListeners('projector:update')
  },

  // File dialogs
  openPptxDialog:  () => ipcRenderer.invoke('dialog:openPptx'),
  openImageDialog: () => ipcRenderer.invoke('dialog:openImage'),
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
  onUpdateAvailable: (cb) => ipcRenderer.on('update:available', cb),
  onUpdateReady:     (cb) => ipcRenderer.on('update:ready', cb),
  installUpdate:     ()   => ipcRenderer.invoke('updater:install'),

  // Detect projector window
  isProjector: () => {
    const params = new URLSearchParams(window.location.search)
    return params.get('projector') === '1'
  },
})
