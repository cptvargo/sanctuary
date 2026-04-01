import React from "react";
import styles from "./Editor.module.css";

export default function ImageEditor({ slide, onChange }) {
  const {
    imageDataUrl,
    caption = "",
    bgColor = "#000000",
    displayMode = "fill",
  } = slide;

  const handleImport = async () => {
    if (typeof window.sanctuary !== "undefined") {
      const dataUrl = await window.sanctuary.openImageDialog();
      if (dataUrl) onChange({ imageDataUrl: dataUrl });
    } else {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => onChange({ imageDataUrl: ev.target.result });
        reader.readAsDataURL(file);
      };
      input.click();
    }
  };

  return (
    <div className={styles.editor}>
      <div className={styles.row}>
        <label className={styles.label}>Image</label>
        <button className={styles.importBtn} onClick={handleImport}>
          {imageDataUrl ? "↺ Replace image" : "+ Import image"}
        </button>
        {imageDataUrl && (
          <button
            className={styles.resetBtn}
            onClick={() => onChange({ imageDataUrl: null })}
          >
            Clear
          </button>
        )}
      </div>

      <div className={styles.row}>
        <label className={styles.label}>Display</label>
        <select
          className={styles.select}
          value={displayMode}
          onChange={(e) => onChange({ displayMode: e.target.value })}
        >
          <option value="fill">Fill screen</option>
          <option value="centered">Centered (with bg color)</option>
          <option value="centered-dark">Centered on dark surround</option>
        </select>
      </div>

      {(displayMode === "centered" || displayMode === "centered-dark") && (
        <div className={styles.row}>
          <label className={styles.label}>Background</label>
          <input
            type="color"
            className={styles.colorPicker}
            value={bgColor}
            onChange={(e) => onChange({ bgColor: e.target.value })}
          />
          <span className={styles.label} style={{ opacity: 0.5, fontSize: 10 }}>
            surround color
          </span>
        </div>
      )}

      <div className={styles.row}>
        <label className={styles.label}>Caption</label>
        <input
          className={styles.input}
          value={caption}
          onChange={(e) => onChange({ caption: e.target.value })}
          placeholder="Optional caption overlay…"
        />
      </div>
    </div>
  );
}
