import type { ComponentType, CSSProperties, ReactNode } from "react";

import type { SectionProps, SectionType } from "./sections";
import type { FormState } from "./actions";
import type { GuestBooking, MembershipPlan, MenuCategory, RoomAvailability, RoomType, Service, ServiceCategory, Site, StaySearch } from "./types";

/** A server action as a form receives it (bound actions already carry their extra arguments). */
export type FormAction = (prev: FormState, form: FormData) => Promise<FormState>;

/** A room search as the built-in pages receive it: validated (or rejected) by the engine. */
export type StayState = { search: StaySearch | null; error: string | null };

/** Built-in, data-driven pages. The engine fetches and checks everything; the
 * theme only lays it out. */
export type ThemePages = {
  rooms: ComponentType<{ site: Site; roomTypes: RoomType[]; stay: StayState; availability: RoomAvailability[] | null }>;
  room: ComponentType<{ site: Site; room: RoomType; others: RoomType[]; stay: StayState; availability: RoomAvailability | null }>;
  dining: ComponentType<{ site: Site; menu: MenuCategory[] }>;
  services: ComponentType<{ site: Site; categories: ServiceCategory[] }>;
  memberships: ComponentType<{ site: Site; plans: MembershipPlan[] }>;
  /** inquiryAction is present when the site takes enquiries. */
  contact: ComponentType<{ site: Site; inquiryAction?: FormAction }>;
  bookRoom: ComponentType<{ site: Site; room: RoomType; rateId: string | null; search: StaySearch; availability: RoomAvailability | null; action: FormAction }>;
  bookService: ComponentType<{ site: Site; service: Service; action: FormAction }>;
  /** The guest's own page for a booking, opened from the link in their confirmation. */
  booking: ComponentType<{
    site: Site;
    booking: GuestBooking;
    token: string;
    justCreated: boolean;
    /** An M-Pesa prompt in flight, to watch until it settles. */
    payingId: string | null;
    payError: string | null;
    payAction: FormAction;
    cancelAction: (prev: FormState) => Promise<FormState>;
  }>;
};

// The contract every theme fulfils. Themes are presentation only: the engine
// fetches data, validates content and decides what's enabled; a theme gets
// finished values and draws them. Adding theme #2 = a new src/themes/<key>
// folder implementing this, registered in src/themes/index.ts, plus a
// WebsiteTheme row with the same key.

export type SectionComponentProps<T extends SectionType> = {
  props: SectionProps<T>;
  site: Site;
  /** Position on the page — lets a theme treat the first block (usually the hero) specially. */
  index: number;
};

export type Theme = {
  key: string;
  /** Header, footer and page chrome around every page. */
  Layout: ComponentType<{ site: Site; children: ReactNode }>;
  /** Title band for pages that don't open with a hero. */
  PageTitle: ComponentType<{ title: string; eyebrow?: string }>;
  /** Shown inside the Layout for an unknown path. */
  NotFound: ComponentType;
  /** Built-in pages: rooms, room detail, dining, services, memberships, contact. */
  pages: ThemePages;
  /** A renderer per supported block type; unsupported types are skipped. */
  sections: { [T in SectionType]?: ComponentType<SectionComponentProps<T>> };
  /** CSS custom properties carrying the tenant's branding into the theme. */
  brandStyle: (site: Site) => CSSProperties;
  /** Class names for the theme's fonts, applied to <html>. */
  fontClassName: string;
};
