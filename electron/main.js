const { app, BrowserWindow, ipcMain, dialog, screen } = require('electron')
const { autoUpdater } = require('electron-updater')
const path = require('path')
const fs = require('fs')
const https = require('https')
const http = require('http')
const os = require('os')

const isDev = !app.isPackaged

let operatorWin = null
let projectorWin = null

// ─── Paths ────────────────────────────────────────────────────────────────────

// Lock userData to 'declare' folder regardless of productName changes
app.setPath('userData', path.join(app.getPath('appData'), 'declare'))

// User data dir for persisted service file
const USER_DATA = app.getPath('userData')
const SERVICE_FILE = path.join(USER_DATA, 'service.json')
const CONFIG_FILE  = path.join(USER_DATA, 'config.json')

function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'))
  } catch (_) {}
  return { githubToken: '', githubOwner: '', githubRepo: 'sanctuary' }
}

function saveConfig(cfg) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2))
}

// ─── Auto-updater ─────────────────────────────────────────────────────────────

function setupAutoUpdater() {
  if (isDev) return

  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true

  autoUpdater.on('update-available', () => {
    if (operatorWin) operatorWin.webContents.send('update:available')
  })

  autoUpdater.on('update-downloaded', () => {
    if (operatorWin) operatorWin.webContents.send('update:ready')
  })

  autoUpdater.on('update-available', () => {
    if (operatorWin && !operatorWin.isDestroyed())
      operatorWin.webContents.send('update:available')
  })

  autoUpdater.on('update-downloaded', () => {
    if (operatorWin && !operatorWin.isDestroyed())
      operatorWin.webContents.send('update:ready')
  })

  autoUpdater.on('error', (err) => {
    console.log('[updater] error:', err.message)
  })

  setTimeout(() => {
    autoUpdater.checkForUpdates().catch(err => console.log('[updater] check failed:', err.message))
  }, 3000)

  setInterval(() => {
    autoUpdater.checkForUpdates().catch(err => console.log('[updater] check failed:', err.message))
  }, 30 * 60 * 1000)
}

// ─── GitHub service sync ──────────────────────────────────────────────────────

// Save service JSON to a GitHub Gist (identified by gist ID stored in config)
function githubRequest(method, endpoint, token, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null
    const options = {
      hostname: 'api.github.com',
      path: endpoint,
      method,
      headers: {
        'User-Agent': 'Declare-App',
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    }

    const req = https.request(options, (res) => {
      let raw = ''
      res.on('data', chunk => raw += chunk)
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(raw) }) }
        catch (_) { resolve({ status: res.statusCode, body: raw }) }
      })
    })

    req.on('error', reject)
    if (data) req.write(data)
    req.end()
  })
}

async function pushServiceToGist(serviceData, config) {
  const { githubToken, gistId } = config
  if (!githubToken) throw new Error('No GitHub token configured')

  const content = JSON.stringify(serviceData, null, 2)

  if (gistId) {
    // Update existing gist
    const res = await githubRequest('PATCH', `/gists/${gistId}`, githubToken, {
      files: { 'sanctuary-service.json': { content } }
    })
    if (res.status !== 200) throw new Error(`Gist update failed: ${res.status}`)
    return gistId
  } else {
    // Create new gist
    const res = await githubRequest('POST', '/gists', githubToken, {
      description: 'Declare Church Service Data',
      public: false,
      files: { 'sanctuary-service.json': { content } }
    })
    if (res.status !== 201) throw new Error(`Gist create failed: ${res.status}`)
    const newId = res.body.id
    // Save gist ID to config
    const newConfig = { ...config, gistId: newId }
    saveConfig(newConfig)
    return newId
  }
}

async function pullServiceFromGist(config) {
  const { githubToken, gistId } = config
  if (!githubToken || !gistId) return null

  const res = await githubRequest('GET', `/gists/${gistId}`, githubToken)
  if (res.status !== 200) throw new Error(`Gist fetch failed: ${res.status}`)

  const fileContent = res.body.files?.['sanctuary-service.json']?.content
  if (!fileContent) return null
  return JSON.parse(fileContent)
}

// ─── Window creation ─────────────────────────────────────────────────────────

function createOperatorWindow() {
  operatorWin = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    title: 'Declare',
    backgroundColor: '#111318',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (isDev) {
    operatorWin.loadURL('http://localhost:5175')
  } else {
    operatorWin.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  operatorWin.on('closed', () => {
    operatorWin = null
    if (projectorWin) projectorWin.close()
  })
}

function createProjectorWindow(preferredDisplayId = null) {
  const displays = screen.getAllDisplays()
  const primary = screen.getPrimaryDisplay()
  let target
  if (preferredDisplayId) {
    target = displays.find(d => d.id === preferredDisplayId)
  }
  if (!target) {
    const externals = displays.filter(d => d.id !== primary.id)
    if (externals.length > 1) {
      target = externals.reduce((a, b) =>
        (b.bounds.width * b.bounds.height) > (a.bounds.width * a.bounds.height) ? b : a
      )
    } else {
      target = externals[0] || primary
    }
  }

  projectorWin = new BrowserWindow({
    x: target.bounds.x,
    y: target.bounds.y,
    width: target.bounds.width,
    height: target.bounds.height,
    frame: false,
    alwaysOnTop: !isDev,
    backgroundColor: '#000000',
    title: 'Declare — Projector',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (isDev) {
    projectorWin.loadURL('http://localhost:5175/?projector=1')
    projectorWin.setSize(960, 540)
    projectorWin.setPosition(target.bounds.x + 200, target.bounds.y + 150)
    projectorWin.setAlwaysOnTop(false)
  } else {
    projectorWin.loadFile(path.join(__dirname, '../dist/index.html'), {
      query: { projector: '1' },
    })
    if (target && target.id !== screen.getPrimaryDisplay().id) projectorWin.setFullScreen(true)
  }

  projectorWin.on('closed', () => { projectorWin = null })
}

// ─── IPC handlers ─────────────────────────────────────────────────────────────

// Projector relay
ipcMain.on('projector:update', (event, payload) => {
  if (projectorWin && !projectorWin.isDestroyed()) {
    projectorWin.webContents.send('projector:update', payload)
  }
})

ipcMain.handle('projector:open', (event, preferredDisplayId = null) => {
  if (!projectorWin || projectorWin.isDestroyed()) {
    createProjectorWindow(preferredDisplayId)
    return true
  }
  return false
})

ipcMain.handle('projector:close', () => {
  if (projectorWin && !projectorWin.isDestroyed()) projectorWin.close()
})

// Return all available displays so the UI can show a picker
ipcMain.handle('displays:get', () => {
  const primary = screen.getPrimaryDisplay()
  return screen.getAllDisplays().map((d, i) => ({
    id: d.id,
    label: d.id === primary.id ? `Display ${i + 1} (Primary)` : `Display ${i + 1} — ${d.bounds.width}x${d.bounds.height}`,
    bounds: d.bounds,
    isPrimary: d.id === primary.id,
  }))
})

// File dialogs
ipcMain.handle('dialog:openPptx', async () => {
  const result = await dialog.showOpenDialog(operatorWin, {
    title: 'Import PowerPoint',
    filters: [{ name: 'PowerPoint', extensions: ['pptx', 'ppt'] }],
    properties: ['openFile'],
  })
  if (result.canceled || !result.filePaths.length) return null
  return result.filePaths[0]
})

ipcMain.handle('dialog:openImage', async () => {
  const result = await dialog.showOpenDialog(operatorWin, {
    title: 'Select Image',
    filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'svg', 'webp'] }],
    properties: ['openFile'],
  })
  if (result.canceled || !result.filePaths.length) return null
  const filePath = result.filePaths[0]
  const buffer = fs.readFileSync(filePath)
  const ext = path.extname(filePath).slice(1).toLowerCase()
  const mime = ext === 'svg' ? 'image/svg+xml' : `image/${ext}`
  return `data:${mime};base64,${buffer.toString('base64')}`
})

// Multiple image picker for announcements
ipcMain.handle('dialog:openImages', async () => {
  const result = await dialog.showOpenDialog(operatorWin, {
    title: 'Select Images',
    filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'webp'] }],
    properties: ['openFile', 'multiSelections'],
  })
  if (result.canceled || !result.filePaths.length) return []
  return result.filePaths.map(filePath => {
    const buffer = fs.readFileSync(filePath)
    const ext = path.extname(filePath).slice(1).toLowerCase()
    return `data:image/${ext};base64,${buffer.toString('base64')}`
  })
})

ipcMain.handle('file:read', async (event, filePath) => {
  try { return fs.readFileSync(filePath).toString('base64') }
  catch (_) { return null }
})

// ── Watch folder (Pastor photo pipeline) ─────────────────────────────────────

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.heic'])
let watchFolderWatcher = null
let watchFolderKnown = new Set()

function stopWatchFolder() {
  if (watchFolderWatcher) { watchFolderWatcher.close(); watchFolderWatcher = null }
  watchFolderKnown.clear()
}

function startWatchFolder(folderPath) {
  stopWatchFolder()
  try {
    fs.readdirSync(folderPath)
      .filter(f => IMAGE_EXTS.has(path.extname(f).toLowerCase()))
      .forEach(f => watchFolderKnown.add(f))
  } catch (_) { return }

  watchFolderWatcher = fs.watch(folderPath, (eventType, filename) => {
    if (!filename || eventType !== 'rename') return
    const ext = path.extname(filename).toLowerCase()
    if (!IMAGE_EXTS.has(ext)) return
    if (watchFolderKnown.has(filename)) return
    watchFolderKnown.add(filename)
    const fullPath = path.join(folderPath, filename)
    // Wait for file to finish writing before reading
    setTimeout(() => {
      try {
        if (!fs.existsSync(fullPath)) { watchFolderKnown.delete(filename); return }
        const buffer = fs.readFileSync(fullPath)
        const mime = (ext === '.jpg' || ext === '.jpeg') ? 'image/jpeg' : `image/${ext.slice(1)}`
        const dataUrl = `data:${mime};base64,${buffer.toString('base64')}`
        if (operatorWin && !operatorWin.isDestroyed()) {
          operatorWin.webContents.send('watchFolder:newImage', { dataUrl, filename })
        }
      } catch (_) {}
    }, 1500)
  })
}

ipcMain.handle('dialog:openFolder', async () => {
  const result = await dialog.showOpenDialog(operatorWin, {
    title: 'Select Watch Folder',
    properties: ['openDirectory'],
  })
  if (result.canceled || !result.filePaths.length) return null
  return result.filePaths[0]
})

ipcMain.handle('watchFolder:set', (_, folderPath) => {
  startWatchFolder(folderPath)
  const p = loadPrefs(); p['watchFolderPath'] = folderPath
  try { fs.writeFileSync(PREFS_FILE, JSON.stringify(p, null, 2)) } catch (_) {}
  return { ok: true }
})

ipcMain.handle('watchFolder:get', () => loadPrefs()['watchFolderPath'] || null)

ipcMain.handle('watchFolder:clear', () => {
  stopWatchFolder()
  const p = loadPrefs(); delete p['watchFolderPath']
  try { fs.writeFileSync(PREFS_FILE, JSON.stringify(p, null, 2)) } catch (_) {}
  return { ok: true }
})

// ── Phone WiFi upload server ──────────────────────────────────────────────────

const PHONE_UPLOAD_PORT = 4242

function getLocalIP() {
  for (const ifaces of Object.values(os.networkInterfaces())) {
    for (const iface of ifaces) {
      if (iface.family === 'IPv4' && !iface.internal) return iface.address
    }
  }
  return 'localhost'
}

const UPLOAD_PAGE_HTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Declare — Send Photo</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#111318;color:#fff;font-family:-apple-system,sans-serif;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px}
h1{font-size:22px;font-weight:700;margin-bottom:6px}
.sub{color:#666;font-size:14px;margin-bottom:36px;text-align:center}
.btn{display:block;width:100%;max-width:320px;padding:18px;border:none;border-radius:14px;font-size:17px;font-weight:600;cursor:pointer;margin-bottom:12px;transition:opacity .15s}
.btn:active{opacity:.75}
.btn-lib{background:#4a9edd;color:#fff}
.btn-cam{background:#22c55e;color:#fff}
input[type=file]{display:none}
#preview{width:100%;max-width:320px;border-radius:12px;margin-top:20px;display:none}
#status{margin-top:20px;font-size:15px;min-height:22px;text-align:center;transition:color .2s}
.ok{color:#22c55e}.err{color:#f87171}.busy{color:#aaa}
</style>
</head>
<body>
<h1>📸 Send to Declare</h1>
<p class="sub">Select a photo to add it directly to the service</p>
<button class="btn btn-lib" onclick="document.getElementById('lib').click()">Choose from Library</button>
<input type="file" id="lib" accept="image/*" multiple>
<button class="btn btn-cam" onclick="document.getElementById('cam').click()">Take Photo</button>
<input type="file" id="cam" accept="image/*" capture="environment">
<img id="preview">
<div id="status"></div>
<script>
async function send(files){
  const st=document.getElementById('status'),pr=document.getElementById('preview')
  for(const f of files){
    st.className='busy';st.textContent='Sending…'
    const dataUrl=await new Promise(r=>{const rd=new FileReader();rd.onload=e=>r(e.target.result);rd.readAsDataURL(f)})
    pr.src=dataUrl;pr.style.display='block'
    try{
      const res=await fetch('/upload',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({dataUrl,filename:f.name})})
      if(res.ok){st.className='ok';st.textContent='✓ Added to service!'}
      else{st.className='err';st.textContent='Upload failed'}
    }catch(e){st.className='err';st.textContent='Could not reach Declare'}
    setTimeout(()=>{st.textContent=''},4000)
  }
}
document.getElementById('lib').addEventListener('change',e=>send(e.target.files))
document.getElementById('cam').addEventListener('change',e=>send(e.target.files))
</script>
</body>
</html>`

let phoneServer = null

function startPhoneServer() {
  if (phoneServer) return
  phoneServer = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*')

    if (req.method === 'GET' && req.url === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.end(UPLOAD_PAGE_HTML)
      return
    }

    if (req.method === 'POST' && req.url === '/upload') {
      let body = ''
      req.on('data', chunk => { body += chunk; if (body.length > 20 * 1024 * 1024) req.destroy() })
      req.on('end', () => {
        try {
          const { dataUrl, filename } = JSON.parse(body)
          if (operatorWin && !operatorWin.isDestroyed()) {
            operatorWin.webContents.send('watchFolder:newImage', { dataUrl, filename: filename || 'photo.jpg' })
          }
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ ok: true }))
        } catch (_) {
          res.writeHead(400); res.end('Bad request')
        }
      })
      return
    }

    res.writeHead(404); res.end()
  })

  phoneServer.listen(PHONE_UPLOAD_PORT, '0.0.0.0', () => {
    console.log(`[phone-upload] listening on :${PHONE_UPLOAD_PORT}`)
  })
  phoneServer.on('error', err => console.log('[phone-upload] error:', err.message))
}

ipcMain.handle('phoneUpload:getUrl', () => `http://${getLocalIP()}:${PHONE_UPLOAD_PORT}`)

// ── Service data persistence ──────────────────────────────────────────────────

// Save service to local disk
// ── User preferences — persisted to userData so updates never wipe them ────
const PREFS_FILE = path.join(USER_DATA, 'userPrefs.json')
const loadPrefs = () => { try { return JSON.parse(fs.readFileSync(PREFS_FILE, 'utf8')) } catch { return {} } }

ipcMain.handle('prefs:get', (_, key) => loadPrefs()[key] ?? null)
ipcMain.handle('prefs:set', (_, key, value) => {
  try {
    const p = loadPrefs(); p[key] = value
    fs.writeFileSync(PREFS_FILE, JSON.stringify(p, null, 2))
    return { ok: true }
  } catch (e) { return { ok: false } }
})
ipcMain.handle('prefs:load', () => loadPrefs())
ipcMain.handle('prefs:save', (_, prefs) => {
  try {
    const p = { ...loadPrefs(), ...prefs }
    fs.writeFileSync(PREFS_FILE, JSON.stringify(p, null, 2))
    return { ok: true }
  } catch (e) { return { ok: false } }
})

ipcMain.handle('service:save', async (event, serviceData) => {
  try {
    await fs.promises.writeFile(SERVICE_FILE, JSON.stringify(serviceData, null, 2), 'utf8')
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e.message }
  }
})

// Load service from local disk
ipcMain.handle('service:load', async () => {
  try {
    try { await fs.promises.access(SERVICE_FILE) } catch { return { ok: false, error: 'No saved service' } }
    const data = JSON.parse(await fs.promises.readFile(SERVICE_FILE, 'utf8'))
    return { ok: true, data }
  } catch (e) {
    return { ok: false, error: e.message }
  }
})

// Push service to GitHub Gist
ipcMain.handle('service:push', async (event, serviceData) => {
  try {
    const config = loadConfig()
    const gistId = await pushServiceToGist(serviceData, config)
    return { ok: true, gistId }
  } catch (e) {
    return { ok: false, error: e.message }
  }
})

// Pull service from GitHub Gist
ipcMain.handle('service:pull', async () => {
  try {
    const config = loadConfig()
    const data = await pullServiceFromGist(config)
    if (!data) return { ok: false, error: 'No cloud data found' }
    // Also save locally
    fs.writeFileSync(SERVICE_FILE, JSON.stringify(data, null, 2))
    return { ok: true, data }
  } catch (e) {
    return { ok: false, error: e.message }
  }
})

// Config (GitHub token etc.)
ipcMain.handle('config:get', () => {
  const cfg = loadConfig()
  // Don't send token to renderer in full — just indicate if it's set
  return { ...cfg, githubToken: cfg.githubToken ? '***set***' : '' }
})

ipcMain.handle('config:set', (event, cfg) => {
  const current = loadConfig()
  // If token is the masked value, keep existing
  const token = cfg.githubToken === '***set***' ? current.githubToken : cfg.githubToken
  saveConfig({ ...current, ...cfg, githubToken: token })
  return { ok: true }
})

// Auto-updater controls
ipcMain.handle('updater:install', () => {
  autoUpdater.quitAndInstall()
})

// ─── App lifecycle ────────────────────────────────────────────────────────────

app.whenReady().then(() => {
  createOperatorWindow()
  setupAutoUpdater()
  // Restore watch folder from prefs
  const savedFolder = loadPrefs()['watchFolderPath']
  if (savedFolder) startWatchFolder(savedFolder)
  startPhoneServer()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createOperatorWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})