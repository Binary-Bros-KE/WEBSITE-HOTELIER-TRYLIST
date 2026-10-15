/** Cookie holding a platform admin's signed preview token (see app/site-preview). */
export const PREVIEW_COOKIE = "site_preview";

/** Small fixed badge so nobody mistakes a draft preview for the live site. */
export function PreviewBadge() {
  return (
    <div
      role="status"
      style={{
        position: "fixed", left: 16, bottom: 16, zIndex: 70, display: "flex", alignItems: "center", gap: 12,
        padding: "10px 14px", background: "#23211d", color: "#fbf8f3", font: "500 11px/1 system-ui, sans-serif",
        letterSpacing: "0.14em", textTransform: "uppercase", boxShadow: "0 8px 30px rgb(0 0 0 / 0.25)",
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: 9999, background: "#e0a23a" }} aria-hidden />
      Preview · drafts shown
      {/* A plain link: the route clears the cookie server-side. */}
      <a href="/site-preview?exit" style={{ color: "#e0c58f", textDecoration: "underline", textUnderlineOffset: 3 }}>Exit</a>
    </div>
  );
}
