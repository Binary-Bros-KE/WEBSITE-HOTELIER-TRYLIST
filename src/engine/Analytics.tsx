"use client";

import { useEffect, useState } from "react";

// Google Analytics, loaded only after the visitor accepts — nothing is sent
// before a choice, and "No thanks" is remembered. Styled with the theme's
// tokens (paper/ink/brand) so it sits quietly in any theme.

const KEY = "analytics-consent";
type Choice = "granted" | "denied";

function readChoice(): Choice | null {
  try {
    const v = window.localStorage.getItem(KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

function saveChoice(choice: Choice) {
  try { window.localStorage.setItem(KEY, choice); } catch { /* private mode: ask again next visit */ }
}

function loadGoogleAnalytics(id: string) {
  if (document.getElementById("ga-loader")) return;
  const script = document.createElement("script");
  script.id = "ga-loader";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(script);
  const w = window as unknown as { dataLayer: unknown[]; gtag: (...args: unknown[]) => void };
  w.dataLayer = w.dataLayer || [];
  w.gtag = function gtag() { w.dataLayer.push(arguments); };
  w.gtag("js", new Date());
  w.gtag("config", id, { anonymize_ip: true });
}

export function Analytics({ measurementId }: { measurementId: string }) {
  const [choice, setChoice] = useState<Choice | null | "unknown">("unknown");

  useEffect(() => {
    const stored = readChoice();
    setChoice(stored);
    if (stored === "granted") loadGoogleAnalytics(measurementId);
  }, [measurementId]);

  if (choice !== null) return null; // still reading, or already decided

  const decide = (c: Choice) => {
    saveChoice(c);
    setChoice(c);
    if (c === "granted") loadGoogleAnalytics(measurementId);
  };

  return (
    <div
      role="dialog"
      aria-label="Cookie choice"
      style={{
        position: "fixed", left: 16, right: 16, bottom: 16, zIndex: 65, margin: "0 auto", maxWidth: 560,
        display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16, padding: "16px 20px",
        background: "var(--paper, #fff)", color: "var(--ink, #222)", border: "1px solid var(--line, #ddd)",
        boxShadow: "0 12px 40px rgb(0 0 0 / 0.15)", fontSize: 14, lineHeight: 1.5,
      }}
    >
      <p style={{ flex: "1 1 260px", margin: 0 }}>
        May we use cookies to see how visitors use this site? It helps us improve it. <a href="/privacy" style={{ textDecoration: "underline" }}>Privacy notice</a>
      </p>
      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" onClick={() => decide("denied")} style={{ padding: "10px 16px", background: "transparent", border: "1px solid var(--line, #ccc)", color: "inherit", cursor: "pointer" }}>
          No thanks
        </button>
        <button type="button" onClick={() => decide("granted")} style={{ padding: "10px 16px", background: "var(--brand, #333)", color: "var(--paper, #fff)", border: 0, cursor: "pointer" }}>
          Accept
        </button>
      </div>
    </div>
  );
}
