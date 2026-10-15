import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getServices, getSite } from "@/engine/api";
import { themeFor } from "@/themes";
import { SystemPageFrame } from "@/themes/render";

export const metadata: Metadata = { title: "Wellness", alternates: { canonical: "/services" } };

export default async function Route() {
  const site = await getSite();
  if (!site || !site.features.services) notFound();
  const data = await getServices();
  const { pages } = themeFor(site.theme.key);
  return (
    <SystemPageFrame site={site} slug="services" title="Wellness">
      <pages.services site={site} categories={data} />
    </SystemPageFrame>
  );
}
