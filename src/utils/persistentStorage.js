// Persistent storage that survives app updates.
// In Electron: saves to userData folder (never wiped on update)
// In browser dev: falls back to localStorage

const isElectron = typeof window !== 'undefined' && typeof window.sanctuary?.prefs !== 'undefined'

export async function persistGet(key) {
  if (isElectron) {
    return await window.sanctuary.prefs.get(key)
  }
  try { return JSON.parse(localStorage.getItem(key)) } catch { return null }
}

export async function persistSet(key, value) {
  if (isElectron) {
    await window.sanctuary.prefs.set(key, value)
  } else {
    try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
  }
}

// Sync versions for components that can't use async easily
export function persistGetSync(key) {
  try { return JSON.parse(localStorage.getItem(key)) } catch { return null }
}

export function persistSetSync(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
  // Also fire async save to userData if in Electron
  if (isElectron) {
    window.sanctuary.prefs.set(key, value).catch(() => {})
  }
}

// Load all prefs from userData on startup and populate localStorage as cache
export async function syncPrefsToLocalStorage() {
  if (!isElectron) return
  try {
    const prefs = await window.sanctuary.prefs.load()
    if (!prefs) return
    for (const [key, value] of Object.entries(prefs)) {
      try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
    }
  } catch {}
}
