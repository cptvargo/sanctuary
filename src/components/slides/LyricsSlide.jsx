import React from "react";
import { FONT_OPTIONS, SMART_MEDIA_PRESETS } from "./SmartMediaPresets";
import { useSanctuaryStore } from "../../store/sanctuaryStore";

function ChurchLogoWatermark({ logoDataUrl: propLogoUrl, right = "3%" }) {
  const serviceOrder = useSanctuaryStore((s) => s.serviceOrder);
  const logoSlide = serviceOrder.find((i) => i.slide?.type === "logo")?.slide;
  // The bundled logo.png is the source of truth (relative path so it also resolves
  // under file:// in the installed app); an imported logo is only a fallback.
  const fallbackUrl = propLogoUrl || logoSlide?.logoDataUrl || null;
  const [useFallback, setUseFallback] = React.useState(false);
  const src = useFallback && fallbackUrl ? fallbackUrl : "./logo.png";

  return (
    <div
      style={{
        position: "absolute",
        bottom: "3.4%",
        right,
        zIndex: 2,
        display: "flex",
        alignItems: "center",
        // Lift the logo off any background without changing its colours
        filter:
          "drop-shadow(0 0.5cqh 1.6cqh rgba(0,0,0,0.55)) drop-shadow(0 0 1.2cqh rgba(255,255,255,0.22))",
      }}
    >
      <img
        src={src}
        alt="logo"
        style={{ height: "7.5cqh", width: "auto", objectFit: "contain" }}
        onError={(e) => {
          if (fallbackUrl && !useFallback) setUseFallback(true);
          else e.target.style.display = "none";
        }}
      />
    </div>
  );
}

// True when a #rgb / #rrggbb colour is light (so text in it needs a dark chip, and vice versa)
function isLightColor(hex = "#ffffff") {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return true;
  const h = m[1].length === 3 ? m[1].replace(/./g, "$&$&") : m[1];
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55;
}

const TITLE_KEYFRAMES = `
@keyframes lyricTitleIn { from { opacity: 0; transform: translateY(1.2cqh); } to { opacity: 1; transform: translateY(0); } }
`;

export function sectionBadge(section = "") {
  // Strip split-slide suffix like "(2/3)" before matching
  const s = section.trim().replace(/\s*\(\d+\/\d+\)$/, '');
  if (!s) return "";
  const u = s.toUpperCase();
  if (/^CHORUS\s*(\d*)$/.test(u)) {
    const n = u.replace("CHORUS", "").trim();
    return n ? `C${n}` : "C";
  }
  if (/^VERSE\s*(\d*)$/.test(u)) {
    const n = u.replace("VERSE", "").trim();
    return n ? `V${n}` : "V";
  }
  if (/^BRIDGE\s*(\d*)$/.test(u)) {
    const n = u.replace("BRIDGE", "").trim();
    return n ? `B${n}` : "B";
  }
  if (/^PRE.?CHORUS/.test(u)) return "PC";
  if (/^INTRO/.test(u)) return "I";
  if (/^OUTRO/.test(u)) return "O";
  if (/^TAG/.test(u)) return "T";
  if (/^HOOK/.test(u)) return "H";
  return s.slice(0, 2).toUpperCase();
}

const BADGE_COLORS = {
  V: "#5ac8fa",
  V1: "#5ac8fa",
  V2: "#5ac8fa",
  V3: "#5ac8fa",
  V4: "#5ac8fa",
  V5: "#5ac8fa",
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

function getBadgeColor(badge) {
  if (BADGE_COLORS[badge]) return BADGE_COLORS[badge];
  if (/^\d+$/.test(badge)) return "#7b8fff";
  return "#636366";
}

export default function LyricsSlide({
  slide,
  mini = false,
  hideChrome = false,
}) {
  const {
    lines = [],
    song = "",
    section = "",
    bgColor = "#050813",
    bgGradient = null,
    textColor: slideTextColor = "#ffffff",
    bgImageUrl = null,
    bgOverlayOpacity = 0,
    fontSize = 100,
    fontId = "montserrat",
    accentColor = "#f0b24b",
    smartMediaId = null,
    _logoDataUrl = null,
  } = slide;

  // Backgrounds with artwork at an edge anchor there, so a non-16:9 screen crops the empty side
  // instead, and keep lyrics and the logo clear of it (safeRight)
  const preset = SMART_MEDIA_PRESETS.find((p) => p.id === smartMediaId);
  const bgPosition = preset?.bgPosition || "center";
  const safeRight = preset?.safeRight || null;

  // Dark text on a light background goes unreadable once the Dim slider darkens that
  // background, so past 55% dim it flips to the preset's light colour.
  const flipToLight =
    preset?.lightBackground && bgOverlayOpacity >= 0.55 && !isLightColor(slideTextColor);
  const textColor = flipToLight ? preset.altTextColor || "#fff1cf" : slideTextColor;

  const lightText = isLightColor(textColor);

  const fontOpt = FONT_OPTIONS.find((f) => f.id === fontId) || FONT_OPTIONS[1];
  const fontFamily = fontOpt.family;
  const fontWeight = fontOpt.weight;

  const nonEmptyLines = lines.filter((l) => l && l.trim());
  const badge = sectionBadge(section);
  const badgeColor = getBadgeColor(badge);

  const lineCount = nonEmptyLines.length || 1;
  const basePct =
    lineCount <= 2
      ? 9
      : lineCount <= 4
        ? 7
        : lineCount <= 6
          ? 5.5
          : lineCount <= 8
            ? 4.5
            : 3.5;
  const scaledPct = (basePct * (fontSize / 100)).toFixed(2);

  // Build background style
  let background;
  if (bgImageUrl) {
    background = `url(${bgImageUrl}) ${bgPosition}/cover no-repeat`;
  } else if (bgGradient) {
    background = bgGradient;
  } else {
    background = bgColor;
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: safeRight ? `6% ${safeRight} 6% 8%` : "6% 8%",
        position: "relative",
        fontFamily: fontFamily,
        overflow: "hidden",
      }}
    >
      {/* Dark overlay for image backgrounds */}
      {bgImageUrl && bgOverlayOpacity > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `rgba(0,0,0,${bgOverlayOpacity})`,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Lyrics */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "3%",
          width: "100%",
          position: "relative",
          zIndex: 1,
        }}
      >
        {nonEmptyLines.map((line, i) => (
          <div
            key={i}
            style={{
              fontSize: `${scaledPct}cqh`,
              color: textColor,
              textAlign: "center",
              lineHeight: 1.3,
              fontFamily,
              fontWeight,
              textShadow: !lightText
                ? "0 1px 3px rgba(255,255,255,0.35)"
                : bgImageUrl
                  ? "0 2px 12px rgba(0,0,0,1), 0 0 30px rgba(0,0,0,1), 0 4px 24px rgba(0,0,0,0.9)"
                  : "0 2px 8px rgba(0,0,0,0.8)",
              letterSpacing: fontId === "impact" ? "0.05em" : "0.01em",
              width: "100%",
            }}
          >
            {line}
          </div>
        ))}
      </div>

      {/* Song title bottom-left — projector only */}
      {!mini && song && (
        <div
          key={song}
          style={{
            position: "absolute",
            bottom: "3.4%",
            left: "3%",
            zIndex: 2,
            display: "flex",
            alignItems: "center",
            gap: "1.3cqh",
            padding: "1.1cqh 2.4cqh 1.1cqh 1.6cqh",
            borderRadius: "0.9cqh",
            maxWidth: "52%",
            background: lightText ? "rgba(8,10,20,0.40)" : "rgba(255,255,255,0.50)",
            border: `1px solid ${lightText ? "rgba(255,255,255,0.16)" : "rgba(0,0,0,0.12)"}`,
            backdropFilter: "blur(10px) saturate(1.2)",
            WebkitBackdropFilter: "blur(10px) saturate(1.2)",
            boxShadow: "0 0.6cqh 2.4cqh rgba(0,0,0,0.30)",
            animation: "lyricTitleIn 0.7s ease-out both",
          }}
        >
          <style>{TITLE_KEYFRAMES}</style>
          {/* Accent bar */}
          <div
            style={{
              width: "0.5cqh",
              height: "3.6cqh",
              borderRadius: "0.25cqh",
              background: `linear-gradient(to bottom, ${accentColor}, ${accentColor}99)`,
              boxShadow: `0 0 1.4cqh ${accentColor}66`,
              flexShrink: 0,
            }}
          />
          <div
            style={{
              fontSize: "2.3cqh",
              color: lightText ? "rgba(255,255,255,0.94)" : textColor,
              fontFamily: "'Montserrat', 'Inter', sans-serif",
              fontWeight: 600,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              textShadow: lightText ? "0 1px 8px rgba(0,0,0,0.55)" : "none",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              lineHeight: 1.1,
            }}
          >
            {song}
          </div>
        </div>
      )}

      {/* Church logo bottom-right — projector only */}
      {!mini && (
        <ChurchLogoWatermark logoDataUrl={_logoDataUrl} right={safeRight || "3%"} />
      )}
    </div>
  );
}
