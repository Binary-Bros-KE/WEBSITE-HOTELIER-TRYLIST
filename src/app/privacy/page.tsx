import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getSite } from "@/engine/api";
import { privacySections } from "@/engine/privacy";
import { parseSections } from "@/engine/sections";
import { PageSections } from "@/themes/render";

export const metadata: Metadata = { title: "Privacy notice", alternates: { canonical: "/privacy" } };

export default async function PrivacyRoute() {
  const site = await getSite();
  if (!site) notFound();
  return <PageSections site={site} sections={parseSections(privacySections(site))} title="Privacy notice" />;
}
