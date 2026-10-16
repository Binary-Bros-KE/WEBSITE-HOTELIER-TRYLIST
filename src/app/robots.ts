import type { MetadataRoute } from "next";

import { getSite, siteOrigin } from "@/engine/api";

// Booking flows and previews are private; a host with no published site is closed entirely.
export default async function robots(): Promise<MetadataRoute.Robots> {
  const site = await getSite();
  if (!site || site.preview) return { rules: { userAgent: "*", disallow: "/" } };
  const origin = await siteOrigin(site);
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/book/", "/booking/", "/site-preview", "/healthz"] },
    sitemap: `${origin}/sitemap.xml`,
  };
}
