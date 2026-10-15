import type { NavItem, Site } from "./types";

// What a site shows before anyone has written content for it: a sensible
// home page and navigation derived from the features the tenant has on. Once
// the platform admin publishes a "home" page / nav pages, those win.

export function defaultHomeSections(site: Site): unknown[] {
  const f = site.features;
  const blocks: unknown[] = [
    {
      id: "hero",
      type: "hero",
      props: {
        eyebrow: [site.contact.city, site.contact.country].filter(Boolean).join(" · ") || undefined,
        title: site.name,
        subtitle: site.branding.tagline ?? undefined,
        images: site.seo.ogImageUrl ? [{ url: site.seo.ogImageUrl, alt: site.name }] : [],
        primaryCta: f.rooms ? { label: "Explore rooms", href: "/rooms" } : undefined,
      },
    },
  ];
  if (f.rooms) blocks.push({ id: "rooms", type: "rooms-showcase", props: { eyebrow: "Stay", title: "Rooms & Suites" } });
  if (f.menu) blocks.push({ id: "menu", type: "menu-highlights", props: { eyebrow: "Dine", title: "From our kitchen" } });
  if (f.services) blocks.push({ id: "services", type: "services-showcase", props: { eyebrow: "Unwind", title: "Spa & Wellness" } });
  if (f.memberships) blocks.push({ id: "plans", type: "membership-plans", props: { eyebrow: "Belong", title: "Memberships" } });
  blocks.push({ id: "contact", type: "contact-map", props: { eyebrow: "Visit", title: "Find us" } });
  return blocks;
}

/** Built-in pages each feature brings (their routes arrive in Phase 5). */
export function defaultNav(site: Site): NavItem[] {
  const f = site.features;
  const items: NavItem[] = [];
  if (f.rooms) items.push({ slug: "rooms", title: "Rooms & Suites", kind: "SYSTEM" });
  if (f.menu) items.push({ slug: "dining", title: "Dining", kind: "SYSTEM" });
  if (f.services) items.push({ slug: "services", title: "Wellness", kind: "SYSTEM" });
  if (f.memberships) items.push({ slug: "memberships", title: "Memberships", kind: "SYSTEM" });
  items.push({ slug: "contact", title: "Contact", kind: "SYSTEM" });
  return items;
}

export function navFor(site: Site): NavItem[] {
  const pages = site.nav.filter((item) => item.slug !== "home");
  return pages.length > 0 ? pages : defaultNav(site);
}
