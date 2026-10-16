import type { Metadata } from "next";
import { systemPageMetadata } from "@/engine/meta";
import { notFound } from "next/navigation";

import { getMenu, getSite } from "@/engine/api";
import { themeFor } from "@/themes";
import { SystemPageFrame } from "@/themes/render";

export function generateMetadata(): Promise<Metadata> {
  return systemPageMetadata("dining", "Dining", (site, w) => `The menu at ${site.name}${w}: breakfast, lunch, dinner and drinks, with prices.`);
}

export default async function Route() {
  const site = await getSite();
  if (!site || !site.features.menu) notFound();
  const data = await getMenu();
  const { pages } = themeFor(site.theme.key);
  return (
    <SystemPageFrame site={site} slug="dining" title="Dining">
      <pages.dining site={site} menu={data} />
    </SystemPageFrame>
  );
}
