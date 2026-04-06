import React, { useEffect, useState } from "react";
import { useSanctuaryStore } from "../../store/sanctuaryStore";
import styles from "./SyncManager.module.css";

// ─── Update notification banner ───────────────────────────────────────────────

export function UpdateBanner() {
  const [state, setState] = useState(null);

  useEffect(() => {
    if (typeof window.sanctuary === "undefined") return;
    window.sanctuary.onUpdateAvailable(() => setState("available"));
    window.sanctuary.onUpdateReady(() => setState("ready"));
  }, []);

  if (!state) return null;

  return (
    <div className={styles.updateBanner}>
      {state === "available" && <span>⬇ Downloading update…</span>}
      {state === "ready" && (
        <>
          <span>✓ Update ready</span>
          <button
            className={styles.installBtn}
            onClick={() => window.sanctuary?.installUpdate()}
          >
            Restart to update
          </button>
        </>
      )}
    </div>
  );
}

// ─── Sync settings modal ──────────────────────────────────────────────────────

export function SyncSettings({ onClose }) {
  const [token, setToken] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokenSet, setTokenSet] = useState(false);
  const [gistId, setGistId] = useState("");

  useEffect(() => {
    if (typeof window.sanctuary === "undefined") return;
    window.sanctuary.getConfig().then((cfg) => {
      setTokenSet(cfg.githubToken === "***set***");
      setGistId(cfg.gistId || "");
    });
  }, []);

  const handleSave = async () => {
    if (!token && !tokenSet) {
      setStatus("Please enter your GitHub token");
      return;
    }
    setLoading(true);
    try {
      await window.sanctuary.setConfig({ githubToken: token || "***set***" });
      setTokenSet(true);
      setStatus("✓ Token saved");
    } catch (e) {
      setStatus("Error: " + e.message);
    }
    setLoading(false);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <span className={styles.modalTitle}>Sync Settings</span>
          <button className={styles.closeBtn} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.section}>
            <div className={styles.sectionTitle}>GitHub Token</div>
            <div className={styles.sectionDesc}>
              Used to sync your service order between home and church. Generate
              a token at GitHub → Settings → Developer Settings → Personal
              Access Tokens → Tokens (classic). Check <strong>gist</strong>{" "}
              scope only.
            </div>
            <div className={styles.tokenRow}>
              <input
                className={styles.tokenInput}
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder={
                  tokenSet ? "Token already saved" : "ghp_xxxxxxxxxxxx"
                }
                style={{ color: "#ffffff", WebkitTextSecurity: "disc" }}
              />
              <button
                className={styles.saveTokenBtn}
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? "Saving…" : "Save"}
              </button>
            </div>
            {status && <div className={styles.statusMsg}>{status}</div>}
            {gistId && (
              <div className={styles.gistRow}>
                <span className={styles.gistLabel}>Gist ID:</span>
                <span className={styles.gistValue}>{gistId}</span>
              </div>
            )}
          </div>

          <div className={styles.section}>
            <div className={styles.sectionTitle}>How it works</div>
            <div className={styles.sectionDesc}>
              <strong>At home:</strong> Build your Sunday service, then click{" "}
              <strong>Push to Cloud</strong> in the top bar. Takes 2 seconds.
              <br />
              <br />
              <strong>At church:</strong> Open Sanctuary — it automatically
              pulls the latest service on startup. Everything is already set up.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sync button component (used in TopBar) ───────────────────────────────────

export function SyncButton() {
  const { serviceOrder, checklist, songLibrary } = useSanctuaryStore();
  const [syncState, setSyncState] = useState("idle"); // idle | pushing | pulling | done | error
  const [showSettings, setShowSettings] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  // Auto-load on startup
  useEffect(() => {
    if (typeof window.sanctuary === "undefined") return;
    pullOnStartup();
  }, []);

  // Auto-save locally on every change with a short debounce
  const saveTimerRef = React.useRef(null);
  useEffect(() => {
    if (typeof window.sanctuary === "undefined") return;
    // Debounce saves to avoid hammering disk on every keystroke
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => autoSaveLocal(), 2000);
    return () => clearTimeout(saveTimerRef.current);
  }, [serviceOrder, checklist, songLibrary]);

  // Also save on window close
  useEffect(() => {
    if (typeof window.sanctuary === "undefined") return;
    const handleUnload = () => {
      // Synchronous save attempt on close
      window.sanctuary.saveService(getServiceData()).catch(() => {});
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [serviceOrder, checklist, songLibrary]);

  const getServiceData = () => ({
    serviceOrder,
    songLibrary,
    // checklist intentionally excluded — always loads from store defaults
    savedAt: new Date().toISOString(),
    version: "1.0",
  });

  const autoSaveLocal = () => {
    // Fire and forget — don't block UI waiting for disk write
    window.sanctuary.saveService(getServiceData()).catch(() => {});
  };

  const pullOnStartup = async () => {
    try {
      // Always load local first — it's the most recent save
      const local = await window.sanctuary.loadService();
      if (local.ok && local.data) {
        loadServiceData(local.data);
        return;
      }
      // If no local data, try cloud
      const cloud = await window.sanctuary.pullService();
      if (cloud.ok && cloud.data) {
        loadServiceData(cloud.data);
        setLastSync(new Date());
      }
    } catch (_) {}
  };

  const loadServiceData = (data) => {
    if (!data?.serviceOrder) return;
    const currentState = useSanctuaryStore.getState();

    // Merge saved song library with built-in defaults
    // so new songs added in app updates always appear
    let mergedLibrary = currentState.songLibrary; // start with built-in defaults
    if (data.songLibrary && data.songLibrary.length > 0) {
      // Add any saved songs that aren't already in the built-in library
      const builtInNames = new Set(
        mergedLibrary.map((s) => s.name.toLowerCase()),
      );
      const userSongs = data.songLibrary.filter(
        (s) => !builtInNames.has(s.name.toLowerCase()),
      );
      mergedLibrary = [...mergedLibrary, ...userSongs];
    }

    useSanctuaryStore.setState({
      serviceOrder: data.serviceOrder,
      songLibrary: mergedLibrary,
      // Checklist always uses store defaults
    });
  };

  const handlePush = async () => {
    if (typeof window.sanctuary === "undefined") return;
    setSyncState("pushing");
    try {
      const result = await window.sanctuary.pushService(getServiceData());
      if (result.ok) {
        setLastSync(new Date());
        setSyncState("done");
        setTimeout(() => setSyncState("idle"), 2500);
      } else {
        setSyncState("error");
        setTimeout(() => setSyncState("idle"), 3000);
      }
    } catch (_) {
      setSyncState("error");
      setTimeout(() => setSyncState("idle"), 3000);
    }
  };

  const handlePull = async () => {
    if (typeof window.sanctuary === "undefined") return;
    setSyncState("pulling");
    try {
      const result = await window.sanctuary.pullService();
      if (result.ok && result.data) {
        loadServiceData(result.data);
        setLastSync(new Date());
        setSyncState("done");
        setTimeout(() => setSyncState("idle"), 2500);
      } else {
        setSyncState("error");
        setTimeout(() => setSyncState("idle"), 3000);
      }
    } catch (_) {
      setSyncState("error");
      setTimeout(() => setSyncState("idle"), 3000);
    }
  };

  const syncLabel = {
    idle: "☁ Sync",
    pushing: "↑ Pushing…",
    pulling: "↓ Pulling…",
    done: "✓ Synced",
    error: "✗ Error",
  }[syncState];

  return (
    <>
      <div className={styles.syncGroup}>
        <button
          className={`${styles.syncBtn} ${styles[syncState]}`}
          onClick={handlePush}
          disabled={syncState !== "idle"}
          title="Push service to cloud (home → church)"
        >
          {syncLabel}
        </button>
        <button
          className={styles.syncMenuBtn}
          onClick={() => setShowSettings(true)}
          title="Sync settings"
        >
          ⚙
        </button>
      </div>
      {lastSync && (
        <span className={styles.lastSync}>
          Synced{" "}
          {lastSync.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      )}
      {showSettings && <SyncSettings onClose={() => setShowSettings(false)} />}
    </>
  );
}
