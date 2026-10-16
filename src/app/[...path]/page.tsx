import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { getPage, getSite } from "@/engine/api";
import { matchRedirect } from "@/engine/redirects";
import { safeImage } from "@/engine/safe";
import { parseSections } from "@/engine/sections";
import { PageSections } from "@/themes/render";

// Everything without a route of its own: free-form content pages (WebsitePage
// rows, one segment deep) and, failing that, the site's redirects from old
// addresses (any depth) — then a real 404. Built-in pages like /rooms have
// their own routes, which take precedence over this catch-all.

type Props = { params: Promise<{ path: string[] }> };

const slugOf = (path: string[]) => (path.length === 1 ? decodeURIComponent(path[0]).toLowerCase() : null);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = slugOf((await params).path);
  const page = slug ? await getPage(slug) : null;
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
  const { path } = await params;
  const slug = slugOf(path);
  if (slug === "home") permanentRedirect("/");
  const [site, page] = await Promise.all([getSite(), slug ? getPage(slug) : Promise.resolve(null)]);
  if (!site) notFound();
  if (page) return <PageSections site={site} sections={parseSections(page.sections)} title={page.title} />;
  const target = matchRedirect(site.redirects, `/${path.map(decodeURIComponent).join("/")}`);
  if (target) permanentRedirect(target);
  notFound();
}
