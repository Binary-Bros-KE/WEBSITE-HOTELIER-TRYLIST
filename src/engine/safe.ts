// Content is typed in by people (platform admins today, tenants later), so
// anything that lands in an attribute is checked here first.

/** Relative paths, anchors, http(s), mailto: and tel: — never javascript: or data:. */
export function safeHref(href: string | null | undefined): string | null {
  if (!href) return null;
  const value = href.trim();
  if (/^(\/(?!\/)|#|\?)/.test(value)) return value;
  if (/^(https?:\/\/|mailto:|tel:)/i.test(value)) return value;
  return null;
}

/** Only #rgb / #rrggbb / #rrggbbaa — the value goes into a CSS variable. */
export function safeColor(value: string | null | undefined): string | null {
  return value && /^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value.trim()) ? value.trim() : null;
}

/** Google Maps embeds only — anything else would be an arbitrary iframe. */
export function safeMapEmbed(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    return u.protocol === "https:" && /(^|\.)google\.com$/.test(u.hostname) && u.pathname.startsWith("/maps/embed") ? u.toString() : null;
  } catch {
    return null;
  }
}

/** Absolute http(s) or root-relative image URLs only. */
export function safeImage(url: string | null | undefined): string | null {
  if (!url) return null;
  const value = url.trim();
  return /^(https?:\/\/|\/(?!\/))/i.test(value) ? value : null;
}
