import type { Metadata } from "next";

import { getPage, getSite } from "./api";
import type { Site } from "./types";

// Titles and descriptions for built-in pages. A description written in the
// platform admin (that page's SEO description) wins; otherwise one is composed
// from the site's own details, so no two pages share the site-wide default.

const place = (site: Site) => [site.contact.city, site.contact.country].filter(Boolean).join(", ");

export async function systemPageMetadata(slug: string, title: string, describe: (site: Site, where: string) => string): Promise<Metadata> {
  const [site, page] = await Promise.all([getSite(), getPage(slug)]);
  if (!site) return { title };
  const where = place(site);
  return {
    title: page?.seoTitle ? { absolute: page.seoTitle } : title,
    description: page?.seoDescription ?? describe(site, where ? ` in ${where}` : ""),
    alternates: { canonical: `/${slug}` },
  };
}
