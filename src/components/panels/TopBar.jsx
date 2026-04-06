import React, { useState } from "react";
import { useSanctuaryStore } from "../../store/sanctuaryStore";
import SongLibrary from "./SongLibrary";
import { SyncButton } from "./SyncManager";
import styles from "./TopBar.module.css";

function getServiceDate() {
  const now = new Date();
  return now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function TopBar() {
  // Granular selectors — TopBar only re-renders when these specific values change
  const isLive = useSanctuaryStore((s) => s.isLive);
  const mode = useSanctuaryStore((s) => s.mode);
  const isBlackOut = useSanctuaryStore((s) => s.isBlackOut);
  const activeSection = useSanctuaryStore((s) => s.activeSection);
  const setMode = useSanctuaryStore((s) => s.setMode);
  const toggleBlackOut = useSanctuaryStore((s) => s.toggleBlackOut);
  const setActiveSection = useSanctuaryStore((s) => s.setActiveSection);
  const resetServiceOrder = useSanctuaryStore((s) => s.resetServiceOrder);

  const [showLibrary, setShowLibrary] = useState(false);
  const [confirmNewService, setConfirmNewService] = useState(false);
  const [showDisplayPicker, setShowDisplayPicker] = useState(false);
  const [displays, setDisplays] = useState([]);
  const [selectedDisplayId, setSelectedDisplayId] = useState(null);

  const handleGoLive = async () => {
    if (!isLive) {
      if (typeof window.sanctuary?.getDisplays === "function") {
        const d = await window.sanctuary.getDisplays();
        const external = d.filter((x) => !x.isPrimary);
        if (external.length > 0) {
          setDisplays(d);
          const largest = external.reduce((a, b) =>
            b.bounds.width * b.bounds.height > a.bounds.width * a.bounds.height
              ? b
              : a,
          );
          setSelectedDisplayId(largest.id);
          setShowDisplayPicker(true);
          return;
        }
        await window.sanctuary.openProjector();
      } else if (typeof window.sanctuary !== "undefined") {
        await window.sanctuary.openProjector();
      }
      useSanctuaryStore.getState().goLive();
      useSanctuaryStore.getState().setMode("preview");
    } else {
      useSanctuaryStore.getState().endLive();
    }
  };

  const handleLaunchWithDisplay = async () => {
    setShowDisplayPicker(false);
    if (typeof window.sanctuary !== "undefined") {
      await window.sanctuary.openProjector(selectedDisplayId);
    }
    useSanctuaryStore.getState().goLive();
    useSanctuaryStore.getState().setMode("preview");
  };

  return (
    <>
      <header className={styles.topbar}>
        <div className={styles.left}>
          <div className={styles.brand}>
            <div className={styles.brandIcon}>D</div>
            <div className={styles.brandStack}>
              <span className={styles.brandName}>Declare</span>
              <span className={styles.serviceDate}>{getServiceDate()}</span>
            </div>
          </div>
          <div className={styles.sectionTabs}>
            {["preService", "service", "postService"].map((s) => (
              <button
                key={s}
                className={`${styles.tab} ${activeSection === s ? styles.tabActive : ""}`}
                onClick={() => setActiveSection(s)}
              >
                {s === "preService"
                  ? "Pre-Service"
                  : s === "service"
                    ? "Service"
                    : "Post-Service"}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.center}>
          {isLive && (
            <div className={styles.liveIndicator}>
              <span className={styles.liveDot} />
              <span className={styles.liveLabel}>LIVE</span>
            </div>
          )}
          <div
            className={`${styles.toggleTrack} ${mode === "preview" ? styles.togglePreview : styles.toggleEdit}`}
            onClick={() => setMode(mode === "preview" ? "edit" : "preview")}
            title={
              mode === "preview"
                ? "Switch to Edit mode"
                : "Switch to Preview / Control mode"
            }
          >
            <div className={styles.toggleThumb} />
            <span className={`${styles.toggleLabel} ${styles.toggleLabelLeft}`}>
              Preview
            </span>
            <span
              className={`${styles.toggleLabel} ${styles.toggleLabelRight}`}
            >
              Edit
            </span>
          </div>
          {isLive && mode === "preview" && (
            <span className={styles.clickHint}>click slide = live</span>
          )}
        </div>

        <div className={styles.right}>
          <SyncButton />
          {confirmNewService ? (
            <div className={styles.confirmRow}>
              <span className={styles.confirmText}>Clear service order?</span>
              <button
                className={styles.confirmYes}
                onClick={() => {
                  resetServiceOrder();
                  setConfirmNewService(false);
                }}
              >
                Yes
              </button>
              <button
                className={styles.confirmNo}
                onClick={() => setConfirmNewService(false)}
              >
                No
              </button>
            </div>
          ) : (
            <button
              className={styles.newServiceBtn}
              onClick={() => setConfirmNewService(true)}
              title="Start a new service"
            >
              + New Service
            </button>
          )}
          <button
            className={styles.libraryBtn}
            onClick={() => setShowLibrary(true)}
            title="Song Library"
          >
            ♪ Library
          </button>
          <button
            className={`${styles.blackOutBtn} ${isBlackOut ? styles.blackActive : ""}`}
            onClick={toggleBlackOut}
            title="Black out screen (B)"
          >
            {isBlackOut ? "● Screen Off" : "○ Black Out"}
          </button>
          <button
            className={`${styles.goLiveBtn} ${isLive ? styles.endLive : styles.startLive}`}
            onClick={handleGoLive}
          >
            {isLive ? "■ End Live" : "▶ Go Live"}
          </button>
        </div>
      </header>

      {showLibrary && <SongLibrary onClose={() => setShowLibrary(false)} />}

      {showDisplayPicker && (
        <div
          className={styles.displayOverlay}
          onClick={() => setShowDisplayPicker(false)}
        >
          <div
            className={styles.displayModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.displayModalTitle}>
              Select Projector Display
            </div>
            <div className={styles.displayList}>
              {displays
                .filter((d) => !d.isPrimary)
                .map((d) => (
                  <button
                    key={d.id}
                    className={`${styles.displayOption} ${selectedDisplayId === d.id ? styles.displayOptionSelected : ""}`}
                    onClick={() => setSelectedDisplayId(d.id)}
                  >
                    {d.label}
                  </button>
                ))}
            </div>
            <div className={styles.displayModalActions}>
              <button
                className={styles.displayCancel}
                onClick={() => setShowDisplayPicker(false)}
              >
                Cancel
              </button>
              <button
                className={styles.displayLaunch}
                onClick={handleLaunchWithDisplay}
              >
                ▶ Go Live
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
