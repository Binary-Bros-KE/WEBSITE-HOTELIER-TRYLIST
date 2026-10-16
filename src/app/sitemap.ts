import type { MetadataRoute } from "next";

import { getMemberships, getPageList, getRoomTypes, getServices, getSite, siteOrigin } from "@/engine/api";

// Per-host sitemap: the home page, every published content page, and the
// built-in pages this site's features switch on (one entry per room type).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = await getSite();
  if (!site || site.preview) return [];
  const origin = await siteOrigin(site);
  const f = site.features;
  const [pages, rooms, services, plans] = await Promise.all([
    getPageList(),
    f.rooms ? getRoomTypes() : Promise.resolve([]),
    f.services ? getServices() : Promise.resolve([]),
    f.memberships ? getMemberships() : Promise.resolve([]),
  ]);

  const entries = new Map<string, MetadataRoute.Sitemap[number]>();
  const add = (path: string, priority: number, lastModified?: string) => entries.set(path, { url: `${origin}${path}`, priority, ...(lastModified ? { lastModified } : {}) });

  add("/", 1);
  if (f.rooms) add("/rooms", 0.9);
  for (const room of rooms) add(`/rooms/${room.id}`, 0.8);
  if (f.menu) add("/dining", 0.8);
  // Listed only when they have something to show (empty ones answer 404).
  if (services.some((c) => c.services.length > 0)) add("/services", 0.7);
  if (plans.length > 0) add("/memberships", 0.6);
  add("/contact", 0.7);
  for (const page of pages) {
    if (page.kind === "HOME") { add("/", 1, page.updatedAt); continue; }
    // Built-in pages are listed above only when their feature is on.
    if (page.kind === "SYSTEM") { const existing = entries.get(`/${page.slug}`); if (existing) existing.lastModified = page.updatedAt; continue; }
    add(`/${page.slug}`, 0.6, page.updatedAt);
  }
  add("/privacy", 0.2);
  return [...entries.values()];
}
