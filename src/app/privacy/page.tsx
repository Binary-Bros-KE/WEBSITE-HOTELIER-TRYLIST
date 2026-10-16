import type { Metadata } from "next";
import { systemPageMetadata } from "@/engine/meta";
import { notFound } from "next/navigation";

import { getSite } from "@/engine/api";
import { privacySections } from "@/engine/privacy";
import { parseSections } from "@/engine/sections";
import { PageSections } from "@/themes/render";

export function generateMetadata(): Promise<Metadata> {
  return systemPageMetadata("privacy", "Privacy notice", (site) => `How ${site.name} collects, uses and protects your personal data, and your rights under Kenya's Data Protection Act.`);
}

export default async function PrivacyRoute() {
  const site = await getSite();
  if (!site) notFound();
  return <PageSections site={site} sections={parseSections(privacySections(site))} title="Privacy notice" />;
}
