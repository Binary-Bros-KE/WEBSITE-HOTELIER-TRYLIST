import type { CSSProperties } from "react";

import { safeColor } from "@/engine/safe";
import type { Theme } from "@/engine/theme";
import { cormorant, jost } from "./fonts";
import { AuroraLayout } from "./Layout";
import { NotFound, PageTitle } from "./PageChrome";
import { BookingPage, BookRoomPage, BookServicePage } from "./pages/booking";
import { RoomPage, RoomsPage } from "./pages/rooms";
import { ContactPage, DiningPage, MembershipsPage, ServicesPage } from "./pages/venue";
import { Amenities, CallToAction, Faq, Gallery, ImageText, Pathways, RichText, Testimonials } from "./sections/content";
import { ContactMap, MembershipPlans, MenuHighlights, RoomsShowcase, ServicesShowcase } from "./sections/data";
import { Hero } from "./sections/Hero";

/**
 * Aurora — classic, quiet hospitality. Ivory and sand neutrals, champagne
 * detailing, Cormorant Garamond over Jost. The tenant's colours are muted
 * toward warm grey (see .theme-aurora in globals.css) so any brand reads soft.
 */
export const aurora: Theme = {
  key: "aurora",
  Layout: AuroraLayout,
  PageTitle,
  NotFound,
  pages: { rooms: RoomsPage, room: RoomPage, dining: DiningPage, services: ServicesPage, memberships: MembershipsPage, contact: ContactPage, bookRoom: BookRoomPage, bookService: BookServicePage, booking: BookingPage },
  fontClassName: `${cormorant.variable} ${jost.variable} theme-aurora`,
  brandStyle: (site) => {
    const style: Record<string, string> = {};
    const brand = safeColor(site.branding.primaryColor);
    const accent = safeColor(site.branding.accentColor);
    if (brand) style["--brand-raw"] = brand;
    if (accent) style["--accent-raw"] = accent;
    return style as CSSProperties;
  },
  sections: {
    hero: Hero,
    "rich-text": RichText,
    "image-text": ImageText,
    "rooms-showcase": RoomsShowcase,
    "menu-highlights": MenuHighlights,
    "services-showcase": ServicesShowcase,
    "membership-plans": MembershipPlans,
    amenities: Amenities,
    gallery: Gallery,
    pathways: Pathways,
    testimonials: Testimonials,
    faq: Faq,
    cta: CallToAction,
    "contact-map": ContactMap,
  },
};
