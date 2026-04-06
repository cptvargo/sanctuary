import React, { useState, useEffect, useRef } from "react";
import { useSanctuaryStore, makeSlide } from "../../store/sanctuaryStore";
import SlideCanvas from "../slides/SlideCanvas";
import { sectionBadge } from "../slides/LyricsSlide";
import {
  SMART_MEDIA_PRESETS,
  applySmartMedia,
} from "../slides/SmartMediaPresets";
import LogoEditor from "../slides/editors/LogoEditor";
import CountdownEditor from "../slides/editors/CountdownEditor";
import ScriptureEditor, {
  AnnouncementEditor,
} from "../slides/editors/ScriptureEditor";
import ImageEditor from "../slides/editors/ImageEditor";
import CustomImageManager from "./CustomImageManager";
import ThemeManager from "./ThemeManager";
import styles from "./CenterPanel.module.css";
import smStyles from "../slides/editors/SmartMedia.module.css";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function badgeColorFor(section) {
  const b = sectionBadge(section);
  const map = {
    C: "#ff9500",
    C1: "#ff9500",
    C2: "#ff9500",
    C3: "#ff9500",
    B: "#bf5af2",
    B2: "#bf5af2",
    PC: "#30d158",
    I: "#636366",
    O: "#636366",
    T: "#30d158",
    H: "#30d158",
  };
  if (map[b]) return map[b];
  if (/^\d+$/.test(b)) return "#7b8fff";
  return "#636366";
}

function slidesToText(slides) {
  if (!slides?.length) return "";
  const parts = [];
  let lastSection = null;
  for (const s of slides) {
    if (s.section && s.section !== lastSection) {
      parts.push(`[${s.section}]`);
      lastSection = s.section;
    }
    if (s.lines) parts.push(...s.lines.filter(Boolean));
    parts.push("");
  }
  return parts.join("\n").trim();
}

function parseSongText(text, songName) {
  const lines = text.split("\n");
  const slides = [];
  let currentSection = null;
  let currentLines = [];

  const flush = () => {
    const nonEmpty = currentLines.filter((l) => l.trim());
    if (nonEmpty.length > 0 || currentSection) {
      slides.push({ section: currentSection || "", lines: nonEmpty });
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const sectionMatch = line.match(/^\[([^\]]+)\]$/);
    if (sectionMatch) {
      flush();
      currentSection = sectionMatch[1];
      currentLines = [];
    } else {
      currentLines.push(line);
    }
  }
  flush();

  return slides.map((s) =>
    makeSlide("lyrics", { song: songName, section: s.section, lines: s.lines }),
  );
}

// ─── Auto-bracket section labels ─────────────────────────────────────────────

const SECTION_KEYWORDS = [
  "verse",
  "chorus",
  "bridge",
  "pre-chorus",
  "prechorus",
  "pre chorus",
  "intro",
  "outro",
  "hook",
  "tag",
  "interlude",
  "refrain",
  "vamp",
  "instrumental",
  "turnaround",
  "ending",
  "break",
];

function autoBracketLine(line) {
  const trimmed = line.trim();
  if (!trimmed) return line;
  // Already bracketed
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) return line;
  const lower = trimmed.toLowerCase();
  const matched = SECTION_KEYWORDS.some((kw) => {
    // Match keyword at start, optionally followed by space + number/letter
    return (
      lower === kw || lower.startsWith(kw + " ") || lower.startsWith(kw + "	")
    );
  });
  if (matched) return `[${trimmed}]`;
  return line;
}

function autoBracketText(text) {
  return text.split("\n").map(autoBracketLine).join("\n");
}

// ─── Song text editor ─────────────────────────────────────────────────────────

function SongTextEditor({ item }) {
  const [name, setName] = useState(item.name);
  const [text, setText] = useState(() => slidesToText(item.slides));
  const [preview, setPreview] = useState([]);
  const [savedIndicator, setSavedIndicator] = useState(false);
  const [showThemeManager, setShowThemeManager] = useState(false);
  const [showMyImages, setShowMyImages] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    setName(item.name);
    setText(slidesToText(item.slides));
  }, [item.id]);
  useEffect(() => {
    setPreview(parseSongText(text, name));
  }, [text, name]);

  const autoSave = (newText, newName) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const newSlides = parseSongText(newText, newName);
      useSanctuaryStore.setState((state) => {
        const existing = state.serviceOrder.find((i) => i.id === item.id);
        // Preserve theme props from existing slides so editing never wipes the theme
        const existingSlides = existing?.slides || [];
        const themeProps = (() => {
          const src =
            existingSlides.find((s) => s.type === "lyrics") ||
            existingSlides[0];
          if (!src) return {};
          return {
            bgImageUrl: src.bgImageUrl ?? null,
            bgGradient: src.bgGradient ?? null,
            bgColor: src.bgColor ?? "#050813",
            textColor: src.textColor ?? "#ffffff",
            bgOverlayOpacity: src.bgOverlayOpacity ?? 0.55,
            fontSize: src.fontSize ?? 100,
            fontId: src.fontId ?? "montserrat",
            smartMediaId: src.smartMediaId ?? null,
          };
        })();
        const mergedSlides = newSlides.map((s) => ({ ...s, ...themeProps }));

        // Also sync back to song library if this song exists there (match by name)
        const updatedLibrary = state.songLibrary.map((libSong) =>
          libSong.name.toLowerCase() ===
          (existing?.name || newName).toLowerCase()
            ? {
                ...libSong,
                name: newName,
                slides: mergedSlides.map((s) => ({ ...s })),
              }
            : libSong,
        );

        return {
          serviceOrder: state.serviceOrder.map((i) =>
            i.id === item.id
              ? { ...i, name: newName, slides: mergedSlides }
              : i,
          ),
          songLibrary: updatedLibrary,
        };
      });
      setSavedIndicator(true);
      setTimeout(() => setSavedIndicator(false), 1200);
    }, 600);
  };

  const handleTextChange = (val) => {
    setText(val);
    autoSave(val, name);
  };
  const handleNameChange = (val) => {
    setName(val);
    autoSave(text, val);
  };

  // Auto-bracket on paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    const bracketed = autoBracketText(pasted);
    const textarea = e.target;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newVal = text.slice(0, start) + bracketed + text.slice(end);
    handleTextChange(newVal);
  };

  return (
    <div className={styles.songEditorWrap}>
      <div className={styles.songEditorHeader}>
        <input
          className={styles.songNameInput}
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="Song title"
        />
        <button
          className={smStyles.smartMediaBtn}
          onClick={() => setShowThemeManager(true)}
        >
          ✦ Themes
        </button>

        <span
          className={`${styles.autoSaveLabel} ${savedIndicator ? styles.autoSaveVisible : ""}`}
        >
          ✓ Auto-saved
        </span>
      </div>

      {showMyImages && (
        <CustomImageManager
          onClose={() => setShowMyImages(false)}
          onSelect={(img) => {
            const themeChanges = {
              bgImageUrl: img.dataUrl,
              bgGradient: null,
              bgColor: "#000000",
              bgOverlayOpacity: 0.5,
              textColor: "#ffffff",
              smartMediaId: img.id,
              fontId: "montserrat",
            };
            useSanctuaryStore.setState((state) => ({
              serviceOrder: state.serviceOrder.map((i) =>
                i.id === item.id && i.kind === "song"
                  ? {
                      ...i,
                      slides: i.slides.map((s) => ({ ...s, ...themeChanges })),
                    }
                  : i,
              ),
            }));
            setShowMyImages(false);
          }}
        />
      )}

      {showThemeManager && (
        <ThemeManager onClose={() => setShowThemeManager(false)} />
      )}

      <div className={styles.songEditorBody}>
        <div className={styles.textEditorPane}>
          <div className={styles.textEditorHint}>
            Use <code>[Section Name]</code> to create sections — e.g.{" "}
            <code>[Verse 1]</code>, <code>[Chorus]</code>, <code>[Bridge]</code>
          </div>
          <textarea
            className={styles.lyricsTextarea}
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            onPaste={handlePaste}
            spellCheck={false}
            placeholder={`[Verse 1]\nI love You Lord\nOh Your mercy never fails me\nAll my days\n\n[Chorus]\nAll my life You have been faithful`}
          />
        </div>
        <div className={styles.previewPane}>
          <div className={styles.previewPaneHeader}>
            Preview — {preview.length} slide{preview.length !== 1 ? "s" : ""}
          </div>
          <div className={styles.previewSlides}>
            {preview.map((slide, i) => (
              <div key={i} className={styles.previewCard}>
                <div className={styles.previewCardSection}>
                  {slide.section || slide.name}
                </div>
                {(slide.lines || []).filter(Boolean).map((line, j) => (
                  <div key={j} className={styles.previewCardLine}>
                    {line}
                  </div>
                ))}
              </div>
            ))}
            {!preview.length && (
              <div className={styles.previewEmpty}>
                Add section labels and lyrics to see slides
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Song slide grid ──────────────────────────────────────────────────────────

function SongSlideGrid({ item }) {
  const { activeSlideId, liveSlideId, isLive, mode } = useSanctuaryStore();
  const isClickToSend = isLive && mode === "preview";

  const handleClick = (slide) => {
    useSanctuaryStore.setState({ activeSlideId: slide.id });
    if (isLive && useSanctuaryStore.getState().mode === "preview") {
      useSanctuaryStore.setState({ liveSlideId: slide.id, isBlackOut: false });
      useSanctuaryStore.getState()._syncProjector();
    }
  };

  return (
    <div className={styles.slideGrid}>
      {item.slides.map((slide) => {
        const isActive = slide.id === activeSlideId;
        const isLiveSlide = slide.id === liveSlideId;
        const badge = sectionBadge(slide.section);
        return (
          <div
            key={slide.id}
            className={`${styles.slideTile} ${isActive ? styles.tileActive : ""} ${isLiveSlide ? styles.tileLive : ""} ${isClickToSend ? styles.tileClickable : styles.tileSelectable}`}
            onClick={() => handleClick(slide)}
          >
            <div className={styles.tileCanvas}>
              <SlideCanvas slide={slide} mini />
            </div>
            <div className={styles.tileLabel}>
              <span className={styles.tileName}>
                {slide.section || slide.name}
              </span>
              {isLiveSlide && (
                <span className={styles.tileLiveBadge}>LIVE</span>
              )}
              {!isLiveSlide && badge && (
                <span
                  className={styles.tileSectionBadge}
                  style={{ background: badgeColorFor(slide.section) }}
                >
                  {badge}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Standalone slide editor ──────────────────────────────────────────────────

function StandaloneEditor({ item }) {
  const { updateSlide, liveSlideId, isLive, mode, serviceOrder } =
    useSanctuaryStore();
  const storeItem = serviceOrder.find((i) => i.id === item.id);
  const slide = storeItem?.slide || item.slide;
  const isLiveSlide = slide.id === liveSlideId;
  const isClickToSend = isLive && mode === "preview";

  const handleClick = () => {
    useSanctuaryStore.setState({ activeSlideId: slide.id });
    if (isLive && useSanctuaryStore.getState().mode === "preview") {
      useSanctuaryStore.setState({ liveSlideId: slide.id, isBlackOut: false });
      useSanctuaryStore.getState()._syncProjector();
    }
  };

  const onChange = (changes) => updateSlide(slide.id, changes);
  const props = { slide, onChange };

  const renderEditor = () => {
    switch (slide.type) {
      case "logo":
        return <LogoEditor {...props} />;
      case "countdown":
        return <CountdownEditor {...props} />;
      case "scripture":
        return <ScriptureEditor {...props} />;
      case "announcement":
        return <AnnouncementEditor {...props} />;
      case "image":
        return <ImageEditor {...props} />;
      default:
        return null;
    }
  };

  // Image navigation bar
  const imgs =
    slide.type === "image"
      ? slide.images?.length > 0
        ? slide.images
        : slide.imageDataUrl
          ? [{}]
          : []
      : [];
  const imgIdx = slide.currentIndex || 0;

  return (
    <div className={styles.standaloneWrap}>
      <div
        className={`${styles.standaloneCanvas} ${styles.canvasClickable} ${isLiveSlide ? styles.canvasLive : ""}`}
        onClick={handleClick}
      >
        <SlideCanvas slide={slide} />
        {isLiveSlide && <div className={styles.liveOverlayBadge}>LIVE</div>}
        {isClickToSend && !isLiveSlide && (
          <div className={styles.clickToSendOverlay}>Click to send live</div>
        )}
      </div>

      {imgs.length > 1 && (
        <div className={styles.pptxNavBar}>
          <button
            className={styles.pptxNavBtn}
            onClick={() => {
              const n = Math.max(0, imgIdx - 1);
              updateSlide(slide.id, { currentIndex: n });
              if (isLive) useSanctuaryStore.getState()._syncProjector();
            }}
            disabled={imgIdx === 0}
          >
            ‹ Prev
          </button>
          <span className={styles.pptxNavInfo}>
            {imgIdx + 1} of {imgs.length}
          </span>
          <button
            className={styles.pptxNavBtn}
            onClick={() => {
              const n = Math.min(imgs.length - 1, imgIdx + 1);
              updateSlide(slide.id, { currentIndex: n });
              if (isLive) useSanctuaryStore.getState()._syncProjector();
            }}
            disabled={imgIdx >= imgs.length - 1}
          >
            Next ›
          </button>
        </div>
      )}

      {mode === "edit" && renderEditor() && (
        <div className={styles.standaloneEditor}>{renderEditor()}</div>
      )}
    </div>
  );
}

// ─── Save Style button (preview bar) ─────────────────────────────────────────

function SaveStyleBtn({ item }) {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const store = useSanctuaryStore.getState();
    const songItem = store.serviceOrder.find((i) => i.id === item.id);
    const src = songItem?.slides?.find((s) => s.type === "lyrics");
    if (!src) return;

    // Global style props applied to ALL slides (not fontSize — that stays per-slide)
    const globalProps = {
      bgImageUrl: src.bgImageUrl ?? null,
      bgGradient: src.bgGradient ?? null,
      bgColor: src.bgColor ?? "#050813",
      textColor: src.textColor ?? "#ffffff",
      bgOverlayOpacity: src.bgOverlayOpacity ?? 0.55,
      fontId: src.fontId ?? "montserrat",
      smartMediaId: src.smartMediaId ?? null,
    };

    useSanctuaryStore.setState((state) => {
      const songItem = state.serviceOrder.find((i) => i.id === item.id);
      // Apply global props to all slides but preserve each slide's own fontSize
      const updatedSlides =
        songItem?.slides?.map((s) => ({
          ...s,
          ...globalProps,
          fontSize: s.fontSize ?? 100, // keep each slide's own font size
        })) || [];
      const styleProps = { ...globalProps, fontSize: src.fontSize ?? 100 };
      return {
        activeThemeProps: styleProps,
        serviceOrder: state.serviceOrder.map((i) =>
          i.id === item.id && i.kind === "song"
            ? { ...i, slides: updatedSlides }
            : i,
        ),
        // Sync back to library too
        songLibrary: state.songLibrary.map((libSong) =>
          libSong.name.toLowerCase() === (songItem?.name || "").toLowerCase()
            ? { ...libSong, slides: updatedSlides.map((s) => ({ ...s })) }
            : libSong,
        ),
      };
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <button
      className={styles.tileEditorReset}
      onClick={handleSave}
      style={{
        padding: "2px 10px",
        minWidth: 90,
        color: saved ? "var(--green)" : undefined,
        borderColor: saved ? "var(--green)" : undefined,
      }}
    >
      {saved ? "✓ Saved" : "💾 Save Style"}
    </button>
  );
}

// ─── Main CenterPanel ─────────────────────────────────────────────────────────

export default function CenterPanel({ activeItem }) {
  const { mode, isLive } = useSanctuaryStore();

  if (!activeItem) {
    return (
      <div className={styles.panel}>
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>◻</div>
          <div className={styles.emptyText}>
            Select an item from the service order
          </div>
        </div>
      </div>
    );
  }

  const isSong = activeItem.kind === "song";
  const isEditMode = mode === "edit";
  const isClickToSend = isLive && mode === "preview";
  const { activeSlideId, updateSlide } = useSanctuaryStore();
  const selectedSlide = isSong
    ? activeItem.slides.find((s) => s.id === activeSlideId) || null
    : null;

  return (
    <div className={styles.panel}>
      <div className={styles.itemHeader}>
        <div className={styles.itemTitle}>
          <span className={styles.itemIcon}>{isSong ? "♪" : "◻"}</span>
          <span className={styles.itemName}>
            {isSong ? activeItem.name : activeItem.slide?.name}
          </span>
          {isSong && (
            <span className={styles.slideCount}>
              {activeItem.slides.length} slides
            </span>
          )}
        </div>
        <div className={styles.itemActions}>
          {isClickToSend && (
            <span className={styles.liveHint}>
              ● Preview — click any slide to send live
            </span>
          )}
          {isSong && isEditMode && (
            <span className={styles.editingBadge}>
              ✎ Editing — changes auto-save
            </span>
          )}
        </div>
      </div>

      <div className={styles.content}>
        {isSong && isEditMode ? (
          <SongTextEditor item={activeItem} />
        ) : isSong ? (
          <SongSlideGrid item={activeItem} />
        ) : (
          <StandaloneEditor item={activeItem} />
        )}
      </div>

      {isSong &&
        !isEditMode &&
        selectedSlide &&
        selectedSlide.type === "lyrics" && (
          <div className={styles.tileEditorBar}>
            <span className={styles.tileEditorLabel}>
              {selectedSlide.section || selectedSlide.name}
            </span>
            <span className={styles.tileEditorDivider} />
            {(selectedSlide.bgImageUrl ||
              (selectedSlide.smartMediaId &&
                selectedSlide.smartMediaId !== "none")) && (
              <>
                <label className={styles.tileEditorFieldLabel}>🌑 Dim</label>
                <input
                  type="range"
                  min={0}
                  max={0.95}
                  step={0.05}
                  value={selectedSlide.bgOverlayOpacity ?? 0.55}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    const store = useSanctuaryStore.getState();
                    store.serviceOrder.forEach((item) => {
                      if (item.kind === "song" && item.id === activeItem.id) {
                        item.slides.forEach((s) => {
                          if (s.smartMediaId === selectedSlide.smartMediaId) {
                            store.updateSlide(s.id, { bgOverlayOpacity: val });
                          }
                        });
                      }
                    });
                  }}
                  style={{ width: 90, accentColor: "var(--accent)" }}
                />
                <span className={styles.tileEditorVal}>
                  {Math.round((selectedSlide.bgOverlayOpacity ?? 0.55) * 100)}%
                </span>
                <span className={styles.tileEditorDivider} />
              </>
            )}
            <label className={styles.tileEditorFieldLabel}>Font size</label>
            <input
              type="range"
              min={40}
              max={180}
              step={5}
              value={selectedSlide.fontSize || 100}
              onChange={(e) =>
                updateSlide(selectedSlide.id, {
                  fontSize: Number(e.target.value),
                })
              }
              style={{ width: 100, accentColor: "var(--accent)" }}
            />
            <span className={styles.tileEditorVal}>
              {selectedSlide.fontSize || 100}%
            </span>
            <button
              className={styles.tileEditorReset}
              onClick={() => updateSlide(selectedSlide.id, { fontSize: 100 })}
            >
              ↺
            </button>
            <span className={styles.tileEditorDivider} />
            <SaveStyleBtn item={activeItem} />
          </div>
        )}
    </div>
  );
}
