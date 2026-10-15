"use client";

// Last resort when even the root layout fails (e.g. the API is unreachable while
// resolving the site). Deliberately plain: the theme may be what's missing.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: "100vh", display: "grid", placeItems: "center", padding: "2rem", textAlign: "center", fontFamily: "Georgia, serif", color: "#23211d", background: "#fbf8f3" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 400, margin: 0 }}>We&apos;ll be right back</h1>
          <p style={{ color: "#6d665c", margin: "1rem 0 2rem" }}>Our website is taking a short pause. Please try again in a moment.</p>
          <button onClick={reset} style={{ border: "1px solid #23211d", background: "transparent", padding: "0.8rem 1.6rem", letterSpacing: "0.2em", textTransform: "uppercase", fontSize: "0.7rem", cursor: "pointer" }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
