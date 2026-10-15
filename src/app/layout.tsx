import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { getSite } from "@/engine/api";
import { PreviewBadge } from "@/engine/preview";
import { safeImage } from "@/engine/safe";
import { themeFor } from "@/themes";
import "./globals.css";

// Every request is for one tenant's site, chosen by hostname (engine/api.ts).
// The root layout picks that site's theme and paints its branding; with no
// site for this host, pages render the bare not-found state.

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  if (!site) return { title: "Site not found", robots: { index: false, follow: false } };
  const og = safeImage(site.seo.ogImageUrl);
  const favicon = safeImage(site.branding.faviconUrl) ?? safeImage(site.branding.logoUrl);
  return {
    metadataBase: site.canonicalHost ? new URL(`https://${site.canonicalHost}`) : undefined,
    title: { default: site.seo.title ?? site.name, template: `%s · ${site.name}` },
    description: site.seo.description ?? site.branding.tagline ?? undefined,
    applicationName: site.name,
    icons: favicon ? { icon: favicon, apple: favicon } : undefined,
    openGraph: {
      type: "website",
      siteName: site.name,
      locale: "en_KE",
      images: og ? [{ url: og }] : undefined,
    },
    twitter: { card: og ? "summary_large_image" : "summary" },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fbf8f3",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const site = await getSite();
  const theme = themeFor(site?.theme.key);
  return (
    <html lang="en" className={theme.fontClassName} style={site ? theme.brandStyle(site) : undefined}>
      <body>
        {site ? <theme.Layout site={site}>{children}</theme.Layout> : children}
        {site?.preview && <PreviewBadge />}
      </body>
    </html>
  );
}
