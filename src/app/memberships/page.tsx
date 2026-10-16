import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getMemberships, getSite } from "@/engine/api";
import { themeFor } from "@/themes";
import { SystemPageFrame } from "@/themes/render";

export const metadata: Metadata = { title: "Memberships", alternates: { canonical: "/memberships" } };

export default async function Route() {
  const site = await getSite();
  if (!site || !site.features.memberships) notFound();
  const data = await getMemberships();
  // Nothing shown online yet: no empty "coming soon" page for search engines to find.
  if (data.length === 0) notFound();
  const { pages } = themeFor(site.theme.key);
  return (
    <SystemPageFrame site={site} slug="memberships" title="Memberships">
      <pages.memberships site={site} plans={data} />
    </SystemPageFrame>
  );
}
