import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { getPage, getSite } from "@/engine/api";
import { safeImage } from "@/engine/safe";
import { parseSections } from "@/engine/sections";
import { PageSections } from "@/themes/render";

// Free-form content pages (WebsitePage rows). Built-in pages like /rooms get
// their own routes, which take precedence over this catch-all segment.

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) return {};
  const og = safeImage(page.ogImageUrl);
  return {
    title: page.seoTitle ? { absolute: page.seoTitle } : page.title,
    description: page.seoDescription ?? undefined,
    ...(og ? { openGraph: { images: [{ url: og }] } } : {}),
    alternates: { canonical: `/${page.slug}` },
  };
}

export default async function ContentPage({ params }: Props) {
  const { slug } = await params;
  if (slug === "home") permanentRedirect("/");
  const [site, page] = await Promise.all([getSite(), getPage(slug)]);
  if (!site || !page) notFound();
  return <PageSections site={site} sections={parseSections(page.sections)} title={page.title} />;
}
