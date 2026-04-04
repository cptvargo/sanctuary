import React, { useState, useEffect, useRef } from "react";
import { useSanctuaryStore } from "../../store/sanctuaryStore";
import styles from "./CountdownThemeManager.module.css";

// Built-in countdown styles
export const COUNTDOWN_STYLES = [
  {
    id: "default",
    label: "Classic",
    bgColor: "#000000",
    bgImageUrl: null,
    accentColor: "#4a9edd",
    overlayOpacity: 0,
    timerStyle: "default",
  },
  {
    id: "dark-band",
    label: "Dark Band",
    bgColor: "#0a0a0a",
    bgImageUrl: null,
    accentColor: "#ffffff",
    overlayOpacity: 0,
    timerStyle: "band",
  },
  {
    id: "minimal-white",
    label: "Minimal White",
    bgColor: "#000000",
    bgImageUrl: null,
    accentColor: "#ffffff",
    overlayOpacity: 0,
    timerStyle: "minimal",
  },
  {
    id: "gold",
    label: "Gold",
    bgColor: "#0a0800",
    bgImageUrl: null,
    accentColor: "#ffd700",
    overlayOpacity: 0,
    timerStyle: "default",
  },
  {
    id: "three-crosses",
    label: "Three Crosses",
    bgColor: "#000000",
    bgImageUrl: "./backgrounds/bg-three-crosses.jpg",
    accentColor: "#ffffff",
    overlayOpacity: 0.65,
    timerStyle: "band",
  },
  {
    id: "divine-light",
    label: "Divine Light",
    bgColor: "#000000",
    bgImageUrl: "./backgrounds/bg-divine-light.jpg",
    accentColor: "#ffffff",
    overlayOpacity: 0.55,
    timerStyle: "band",
  },
  {
    id: "heavenly-sky",
    label: "Heavenly Sky",
    bgColor: "#000000",
    bgImageUrl: "./backgrounds/bg-heavenly-sky.jpg",
    accentColor: "#ffffff",
    overlayOpacity: 0.65,
    timerStyle: "band",
  },
  {
    id: "crosses-sunset",
    label: "Crosses Sunset",
    bgColor: "#000000",
    bgImageUrl: "./backgrounds/bg-crosses-sunset.jpg",
    accentColor: "#ffffff",
    overlayOpacity: 0.72,
    timerStyle: "band",
  },
  {
    id: "neon-burst",
    label: "Neon Burst",
    bgColor: "#000000",
    bgImageUrl: "./backgrounds/bg-neon-burst.jpg",
    accentColor: "#ffffff",
    overlayOpacity: 0.25,
    timerStyle: "band",
  },
  {
    id: "night-sky",
    label: "Night Sky",
    bgColor: "#000000",
    bgImageUrl: "./backgrounds/bg-night-sky.jpg",
    accentColor: "#7eb8f7",
    overlayOpacity: 0.4,
    timerStyle: "default",
  },
  {
    id: "star-cluster",
    label: "Star Cluster",
    bgColor: "#000000",
    bgImageUrl: "./backgrounds/bg-star-cluster.jpg",
    accentColor: "#ffffff",
    overlayOpacity: 0.35,
    timerStyle: "default",
  },
];

// Mini countdown preview component
function CountdownPreview({ style, remaining = 297 }) {
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const timeStr = `${minutes}:${String(seconds).padStart(2, "0")}`;

  const bg = style.bgImageUrl
    ? `url(${style.bgImageUrl}) center/cover no-repeat`
    : style.bgColor;

  if (style.timerStyle === "band") {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: bg,
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {style.bgImageUrl && style.overlayOpacity > 0 && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `rgba(0,0,0,${style.overlayOpacity})`,
            }}
          />
        )}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            background: "rgba(0,0,0,0.82)",
            padding: "4% 8%",
            width: "90%",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "14cqh",
              fontWeight: 900,
              color: style.accentColor,
              fontFamily: "'Inter', sans-serif",
              letterSpacing: "0.04em",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {timeStr}
          </div>
        </div>
      </div>
    );
  }

  if (style.timerStyle === "minimal") {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: bg,
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontSize: "16cqh",
            fontWeight: 100,
            color: style.accentColor,
            fontFamily: "'Inter', sans-serif",
            letterSpacing: "0.15em",
            fontVariantNumeric: "tabular-nums",
            position: "relative",
            zIndex: 1,
          }}
        >
          {timeStr}
        </div>
      </div>
    );
  }

  // Default style
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: bg,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "4%",
      }}
    >
      {style.bgImageUrl && style.overlayOpacity > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `rgba(0,0,0,${style.overlayOpacity})`,
          }}
        />
      )}
      <div
        style={{
          fontSize: "3cqh",
          color: `${style.accentColor}88`,
          fontFamily: "'Inter', sans-serif",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          position: "relative",
          zIndex: 1,
        }}
      >
        Service begins in
      </div>
      <div
        style={{
          fontSize: "16cqh",
          fontWeight: 200,
          color: style.accentColor,
          fontFamily: "'Inter', sans-serif",
          letterSpacing: "0.04em",
          fontVariantNumeric: "tabular-nums",
          position: "relative",
          zIndex: 1,
        }}
      >
        {timeStr}
      </div>
    </div>
  );
}

export default function CountdownThemeManager({ onClose, onApply, slideId }) {
  const { serviceOrder, updateSlide } = useSanctuaryStore();
  const [selected, setSelected] = useState(null);
  const [customStyles, setCustomStyles] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("sanctuary-countdown-styles") || "[]",
      );
    } catch {
      return [];
    }
  });
  const [tick, setTick] = useState(297);
  const tickRef = useRef(null);

  // Animate the preview timer
  useEffect(() => {
    tickRef.current = setInterval(() => {
      setTick((t) => (t <= 0 ? 299 : t - 1));
    }, 1000);
    return () => clearInterval(tickRef.current);
  }, []);

  const allStyles = [...COUNTDOWN_STYLES, ...customStyles];
  const selectedStyle = allStyles.find((s) => s.id === selected);

  const handleUploadBg = async () => {
    const dataUrl = await new Promise((res) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) {
          res(null);
          return;
        }
        const reader = new FileReader();
        reader.onload = (ev) => res(ev.target.result);
        reader.readAsDataURL(file);
      };
      input.click();
    });
    if (!dataUrl) return;
    const newStyle = {
      id: `custom-cd-${Date.now()}`,
      label: "My Countdown",
      bgColor: "#000000",
      bgImageUrl: dataUrl,
      accentColor: "#ffffff",
      overlayOpacity: 0.55,
      timerStyle: "band",
      isCustom: true,
    };
    const updated = [...customStyles, newStyle];
    setCustomStyles(updated);
    localStorage.setItem("sanctuary-countdown-styles", JSON.stringify(updated));
    setSelected(newStyle.id);
  };

  const handleDelete = (id) => {
    const updated = customStyles.filter((s) => s.id !== id);
    setCustomStyles(updated);
    localStorage.setItem("sanctuary-countdown-styles", JSON.stringify(updated));
    if (selected === id) setSelected(null);
  };

  const handleApply = () => {
    if (!selectedStyle) return;

    const updates = {
      bgColor: selectedStyle.bgColor,
      bgImageUrl: selectedStyle.bgImageUrl || null,
      bgOverlayOpacity: selectedStyle.overlayOpacity,
      accentColor: selectedStyle.accentColor,
      timerStyle: selectedStyle.timerStyle,
    };

    if (onApply) {
      onApply(updates);
    } else if (slideId) {
      updateSlide(slideId, updates);
    }

    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <span className={styles.title}>Countdown Styles</span>
          <button className={styles.uploadBtn} onClick={handleUploadBg}>
            + Upload Background
          </button>
          <button className={styles.closeBtn} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.grid}>
            {allStyles.map((style) => (
              <div
                key={style.id}
                className={`${styles.tile} ${selected === style.id ? styles.tileSelected : ""}`}
                onClick={() => setSelected(style.id)}
              >
                <div className={styles.thumb} style={{ containerType: "size" }}>
                  <CountdownPreview style={style} remaining={tick} />
                </div>
                <div className={styles.tileFooter}>
                  <span className={styles.tileName}>{style.label}</span>
                  {style.isCustom && (
                    <button
                      className={styles.deleteBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(style.id);
                      }}
                      title="Delete"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className={styles.sidebar}>
            <div className={styles.previewLabel}>
              {selectedStyle
                ? selectedStyle.label
                : "Select a style to preview"}
            </div>
            <div
              className={styles.previewCanvas}
              style={{ containerType: "size" }}
            >
              {selectedStyle ? (
                <CountdownPreview style={selectedStyle} remaining={tick} />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    background: "#000000",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#333333",
                    fontSize: "12px",
                  }}
                >
                  Select a style
                </div>
              )}
            </div>
            <button
              className={styles.applyBtn}
              onClick={handleApply}
              disabled={!selectedStyle}
            >
              Apply to Countdown
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
