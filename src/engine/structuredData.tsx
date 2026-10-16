import { formatMoney } from "./format";
import type { RoomType, Site } from "./types";

// schema.org description of the business for search engines (JSON-LD), built
// only from the site's own data. Theme-agnostic: every theme gets it.

const TYPE_BY_BUSINESS: Record<string, string> = {
  HOTEL: "Hotel",
  MOTEL: "Motel",
  RESTAURANT: "Restaurant",
  CAFE: "CafeOrCoffeeShop",
  CLUB: "NightClub",
};

const COUNTRY_CODES: Record<string, string> = { kenya: "KE", uganda: "UG", tanzania: "TZ", rwanda: "RW" };

const absolute = (origin: string, url: string | null | undefined) =>
  !url ? undefined : /^https?:\/\//i.test(url) ? url : url.startsWith("/") ? `${origin}${url}` : undefined;

/** International form for the telephone property: 0795106483 → +254795106483. */
function intlPhone(raw: string | null): string | undefined {
  if (!raw) return undefined;
  const digits = raw.replace(/[^\d+]/g, "");
  if (/^0\d{9}$/.test(digits)) return `+254${digits.slice(1)}`;
  return digits || undefined;
}

export function businessJsonLd(site: Site, origin: string, roomTypes: RoomType[]) {
  const c = site.contact;
  const prices = roomTypes.flatMap((t) => (t.rates.length ? t.rates.map((r) => r.price) : [t.priceFrom])).filter((p) => p > 0);
  const images = [site.seo.ogImageUrl, ...roomTypes.map((t) => t.imageUrls[0])].map((u) => absolute(origin, u)).filter(Boolean);
  const sameAs = Object.values(site.social ?? {}).filter((u) => /^https?:\/\//.test(u));

  return {
    "@context": "https://schema.org",
    "@type": TYPE_BY_BUSINESS[site.businessType ?? ""] ?? "LodgingBusiness",
    name: site.name,
    url: origin,
    description: site.seo.description ?? site.branding.tagline ?? undefined,
    logo: absolute(origin, site.branding.logoUrl),
    image: images.length ? [...new Set(images)] : undefined,
    telephone: intlPhone(c.phone),
    email: c.email ?? undefined,
    address: c.address || c.city ? {
      "@type": "PostalAddress",
      streetAddress: c.address?.replace(/[.,\s]+$/, "") || undefined,
      addressLocality: c.city ?? undefined,
      addressRegion: c.county ?? undefined,
      addressCountry: c.country ? COUNTRY_CODES[c.country.toLowerCase()] ?? c.country : undefined,
    } : undefined,
    geo: c.latitude != null && c.longitude != null ? { "@type": "GeoCoordinates", latitude: c.latitude, longitude: c.longitude } : undefined,
    hasMap: c.latitude != null && c.longitude != null ? `https://www.google.com/maps?q=${c.latitude},${c.longitude}` : undefined,
    priceRange: prices.length ? `${formatMoney(Math.min(...prices), site.currency)} – ${formatMoney(Math.max(...prices), site.currency)}` : undefined,
    currenciesAccepted: site.currency,
    sameAs: sameAs.length ? sameAs : undefined,
  };
}

/** Renders JSON-LD safely: "<" is escaped so stored text can't close the script tag. */
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\u003c") }} />;
}
