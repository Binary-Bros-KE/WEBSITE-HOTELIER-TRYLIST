"use client";

import { useEffect, useRef, useState } from "react";

// Cloudflare Turnstile widget for website forms. Renders nothing when the
// site has no key. The token lands in a hidden "turnstileToken" field, which
// the form's server action forwards to the API for verification. A token is
// single-use, so pass the form's state as `resetOn` to get a fresh one after
// each submission attempt.

type TurnstileApi = {
  render: (el: HTMLElement, options: Record<string, unknown>) => string;
  reset: (id: string) => void;
  remove: (id: string) => void;
};

declare global {
  interface Window { turnstile?: TurnstileApi }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
let scriptLoading: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (!scriptLoading) {
    scriptLoading = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => { scriptLoading = null; reject(new Error("Turnstile failed to load")); };
      document.head.appendChild(script);
    });
  }
  return scriptLoading;
}

export function Turnstile({ siteKey, resetOn }: { siteKey: string | null | undefined; resetOn?: unknown }) {
  const box = useRef<HTMLDivElement>(null);
  const widget = useRef<string | null>(null);
  const [token, setToken] = useState("");

  useEffect(() => {
    if (!siteKey || !box.current) return;
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || !box.current || !window.turnstile) return;
        widget.current = window.turnstile.render(box.current, {
          sitekey: siteKey,
          theme: "light",
          callback: (t: string) => setToken(t),
          "expired-callback": () => setToken(""),
          "error-callback": () => setToken(""),
        });
      })
      .catch(() => { /* blocked by an extension or offline — the API decides what to do without a token */ });
    return () => {
      cancelled = true;
      if (widget.current && window.turnstile) window.turnstile.remove(widget.current);
      widget.current = null;
    };
  }, [siteKey]);

  // Fresh token after every submit attempt (the previous one is spent).
  useEffect(() => {
    if (widget.current && window.turnstile) { window.turnstile.reset(widget.current); setToken(""); }
  }, [resetOn]);

  if (!siteKey) return null;
  return (
    <div>
      <div ref={box} />
      <input type="hidden" name="turnstileToken" value={token} />
    </div>
  );
}
