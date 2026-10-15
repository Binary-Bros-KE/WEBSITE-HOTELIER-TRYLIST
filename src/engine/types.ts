// Shapes returned by the API's /public/site endpoints
// (NODE/src/modules/public-site/public-site.routes.ts). Keep in step with it.

export type SiteFeatures = {
  rooms: boolean;
  roomBooking: boolean;
  menu: boolean;
  services: boolean;
  appointments: boolean;
  memberships: boolean;
  inquiries: boolean;
};

export type NavItem = { slug: string; title: string; kind: PageKind };

export type Site = {
  name: string;
  slug: string;
  canonicalHost: string | null;
  businessType: string | null;
  currency: string;
  theme: { key: string };
  branding: {
    primaryColor: string | null;
    accentColor: string | null;
    fontFamily: string | null;
    logoUrl: string | null;
    faviconUrl: string | null;
    tagline: string | null;
  };
  seo: { title: string | null; description: string | null; ogImageUrl: string | null };
  analyticsId: string | null;
  contact: {
    phone: string | null;
    alternativePhone: string | null;
    email: string | null;
    whatsapp: string | null;
    address: string | null;
    city: string | null;
    county: string | null;
    country: string | null;
    mapEmbedUrl: string | null;
    latitude: number | null;
    longitude: number | null;
  };
  social: Record<string, string>;
  features: SiteFeatures;
  nav: NavItem[];
  /** True while a platform admin previews drafts (absent on live responses from older APIs). */
  preview?: boolean;
};

export type PageKind = "HOME" | "STANDARD" | "SYSTEM";

export type Page = {
  slug: string;
  title: string;
  kind: PageKind;
  /** Raw section blocks — validated by engine/sections.ts before rendering. */
  sections: unknown;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImageUrl: string | null;
};

export type RoomRate = { id: string; name: string; mealPlan: string | null; price: number; unit: string | null };

export type RoomType = {
  id: string;
  name: string;
  description: string | null;
  capacity: number;
  amenities: string[];
  imageUrls: string[];
  priceFrom: number;
  priceUnit: string | null;
  pricesIncludeTax: boolean;
  rates: RoomRate[];
};

export type RoomAvailability = {
  roomTypeId: string;
  available: boolean;
  fitsGuests: boolean;
  /** Exact count only when scarce (≤ 3), otherwise null. */
  roomsLeft: number | null;
};

/** A validated stay search: dates as YYYY-MM-DD. */
export type StaySearch = { checkIn: string; checkOut: string; guests: number; nights: number };

export type MenuVariant = { id: string; name: string; price: number };
export type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  photoUrl: string | null;
  price: number;
  isVegetarian: boolean;
  isAvailable: boolean;
  variants: MenuVariant[];
};
export type MenuCategory = { id: string; name: string; description: string | null; imageUrl: string | null; menuItems: MenuItem[] };

export type ServiceVariant = { id: string; name: string; price: number; durationMinutes: number | null };
export type Service = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  price: number;
  durationMinutes: number | null;
  bookableOnline: boolean;
  variants: ServiceVariant[];
};
export type ServiceCategory = { id: string; name: string; services: Service[] };

export type MembershipPlan = {
  id: string;
  name: string;
  description: string | null;
  highlights: string[];
  price: number;
  durationDays: number;
  discountPercent: number;
  visitLimit: number | null;
};
