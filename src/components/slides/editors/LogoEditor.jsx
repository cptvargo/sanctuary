import React from "react";
import styles from "./Editor.module.css";

export default function LogoEditor({ slide, onChange }) {
  const {
    churchName = "",
    tagline = "",
    bgColor = "#000000",
    textColor = "#c8a84a",
    logoDataUrl,
  } = slide;

  const handleLogoImport = async () => {
    if (typeof window.sanctuary !== "undefined") {
      const dataUrl = await window.sanctuary.openImageDialog();
      if (dataUrl) onChange({ logoDataUrl: dataUrl });
    } else {
      // Web fallback: file input
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => onChange({ logoDataUrl: ev.target.result });
        reader.readAsDataURL(file);
      };
      input.click();
    }
  };

  return (
    <div className={styles.editor}>
      <div className={styles.row}>
        <label className={styles.label}>Church Name</label>
        <input
          className={styles.input}
          value={churchName}
          onChange={(e) => onChange({ churchName: e.target.value })}
          placeholder="Church name"
        />
      </div>
      <div className={styles.row}>
        <label className={styles.label}>Tagline</label>
        <input
          className={styles.input}
          value={tagline}
          onChange={(e) => onChange({ tagline: e.target.value })}
          placeholder="City, State or motto"
        />
      </div>
      <div className={styles.row}>
        <label className={styles.label}>Logo image</label>
        <button className={styles.importBtn} onClick={handleLogoImport}>
          {logoDataUrl ? "↺ Replace logo" : "+ Import logo"}
        </button>
        {logoDataUrl && (
          <button
            className={styles.resetBtn}
            onClick={() => onChange({ logoDataUrl: null })}
          >
            Clear
          </button>
        )}
      </div>
      <div className={styles.row}>
        <label className={styles.label}>Background</label>
        <input
          type="color"
          className={styles.colorPicker}
          value={bgColor}
          onChange={(e) => onChange({ bgColor: e.target.value })}
        />
        <label className={styles.label}>Accent color</label>
        <input
          type="color"
          className={styles.colorPicker}
          value={textColor}
          onChange={(e) => onChange({ textColor: e.target.value })}
        />
      </div>
    </div>
  );
}
