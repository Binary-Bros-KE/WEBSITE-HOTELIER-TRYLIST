import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getMenu, getSite } from "@/engine/api";
import { themeFor } from "@/themes";
import { SystemPageFrame } from "@/themes/render";

export const metadata: Metadata = { title: "Dining", alternates: { canonical: "/dining" } };

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
