import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getPage, getSite } from "@/engine/api";
import { defaultHomeSections } from "@/engine/defaults";
import { safeImage } from "@/engine/safe";
import { parseSections } from "@/engine/sections";
import { PageSections } from "@/themes/render";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("home");
  const og = safeImage(page?.ogImageUrl);
  return {
    ...(page?.seoTitle ? { title: { absolute: page.seoTitle } } : {}),
    ...(page?.seoDescription ? { description: page.seoDescription } : {}),
    ...(og ? { openGraph: { images: [{ url: og }] } } : {}),
    alternates: { canonical: "/" },
  };
}

export default async function HomePage() {
  const site = await getSite();
  if (!site) notFound();
  // Until a home page is published, the site shows a starter page built from
  // its enabled features.
  const page = await getPage("home");
  const sections = parseSections(page?.sections ?? defaultHomeSections(site));
  return <PageSections site={site} sections={sections} />;
}
