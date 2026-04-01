import React, { useEffect } from "react";
import { useSanctuaryStore } from "../../store/sanctuaryStore";

export default function CountdownSlide({ slide }) {
  const { countdownRemaining, initCountdown } = useSanctuaryStore();

  const {
    message = "Service begins in",
    subMessage = "Welcome — please be seated",
    durationMinutes = 5,
    bgColor = "#000000",
    accentColor = "#4a9edd",
  } = slide;

  // Initialize if not yet set
  useEffect(() => {
    if (countdownRemaining[slide.id] === undefined) {
      initCountdown(slide.id, durationMinutes);
    }
  }, [slide.id, durationMinutes]);

  // No interval here — the store manages the single global tick
  const remaining = countdownRemaining[slide.id] ?? durationMinutes * 60;
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const timeStr = `${minutes}:${String(seconds).padStart(2, "0")}`;
  const isExpired = remaining <= 0;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: bgColor,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "2%",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {message && (
        <div
          style={{
            fontSize: "3.5cqh",
            color: `${accentColor}88`,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            fontWeight: 400,
          }}
        >
          {message}
        </div>
      )}
      <div
        style={{
          fontSize: "18cqh",
          fontWeight: 200,
          color: isExpired ? "#cc4444" : accentColor,
          letterSpacing: "0.04em",
          fontVariantNumeric: "tabular-nums",
          lineHeight: 1,
          transition: "color 0.5s ease",
        }}
      >
        {isExpired ? "—" : timeStr}
      </div>
      {subMessage && (
        <div
          style={{
            fontSize: "2.5cqh",
            color: `${accentColor}44`,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            marginTop: "1%",
          }}
        >
          {subMessage}
        </div>
      )}
    </div>
  );
}
