// Per-site redirects for addresses from a client's previous website, so old
// links and search results land on the right page (301). Rules come from the
// platform admin: exact paths, or a prefix ending in "/*".

export type RedirectRule = { from: string; to: string };

const normalise = (path: string) => (path.length > 1 ? path.replace(/\/+$/, "") : path).toLowerCase();

export function matchRedirect(rules: RedirectRule[] | undefined, path: string): string | null {
  if (!rules?.length) return null;
  const p = normalise(path);
  for (const rule of rules) {
    const from = rule.from.trim();
    if (from.endsWith("/*")) {
      const base = normalise(from.slice(0, -2));
      if (p === base || p.startsWith(`${base}/`)) return rule.to;
    } else if (normalise(from) === p) {
      return rule.to;
    }
  }
  return null;
}
