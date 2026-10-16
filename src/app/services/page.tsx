import type { Metadata } from "next";
import { systemPageMetadata } from "@/engine/meta";
import { notFound } from "next/navigation";

import { getServices, getSite } from "@/engine/api";
import { themeFor } from "@/themes";
import { SystemPageFrame } from "@/themes/render";

export function generateMetadata(): Promise<Metadata> {
  return systemPageMetadata("services", "Wellness", (site, w) => `Spa, wellness and other services at ${site.name}${w}, with durations and prices.`);
}

export default async function Route() {
  const site = await getSite();
  if (!site || !site.features.services) notFound();
  const data = await getServices();
  // Nothing shown online yet: no empty "coming soon" page for search engines to find.
  if (!data.some((c) => c.services.length > 0)) notFound();
  const { pages } = themeFor(site.theme.key);
  return (
    <SystemPageFrame site={site} slug="services" title="Wellness">
      <pages.services site={site} categories={data} />
    </SystemPageFrame>
  );
}
