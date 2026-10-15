import type { SiteFixture } from "./index";
import type { MenuCategory, RoomType } from "../types";
import menu from "./omega-menu.json";

// Demo of the first client, for design work without a database. Rates are the
// real Sept 2026 rate sheet (VAT-exclusive, see NODE/apply-omega-room-rates.mjs),
// the menu is the real food menu (NODE/omega-food-menu.json), copy and photos
// come from the client's current site. Room descriptions/amenities are
// placeholders to confirm with the client.

const IMG = "https://omegagardenshotelandspa.com";

const RATE_SHEET: [string, string, number, number, number, number, string][] = [
  ["Standard", "Single", 1, 4500, 5700, 6900, "/accomodations/room-1.jpg"],
  ["Standard", "Double", 2, 5500, 7900, 10300, "/accomodations/room-6.jpg"],
  ["Superior", "Single", 1, 5500, 6700, 7900, "/accomodations/room-2.jpg"],
  ["Superior", "Double", 2, 6500, 8900, 11300, "/accomodations/room-4.jpg"],
  ["Deluxe", "Single", 1, 6500, 7700, 8900, "/accomodations/room-3.jpg"],
  ["Deluxe", "Double", 2, 7500, 9900, 12300, "/accomodations/room-5.jpg"],
];

const DESCRIPTIONS: Record<string, string> = {
  Standard: "A calm, well-appointed room for a restful night — everything you need, nothing you don't.",
  Superior: "More space to settle in, with a comfortable seating corner and soft garden light.",
  Deluxe: "Our most generous rooms, finished for longer stays and slower mornings.",
};

const roomTypes: RoomType[] = RATE_SHEET.map(([category, occupancy, capacity, bb, hb, fb, image], i) => ({
  id: `rt-${category.toLowerCase()}-${occupancy.toLowerCase()}`,
  name: `${category} ${occupancy}`,
  description: DESCRIPTIONS[category],
  capacity,
  amenities: ["Free Wi-Fi", "En-suite bathroom", "Flat-screen TV", "Daily housekeeping"],
  imageUrls: [`${IMG}${image}`, `${IMG}/accomodations/room-${((i + 1) % 6) + 1}.jpg`],
  priceFrom: bb,
  priceUnit: "night",
  pricesIncludeTax: false,
  rates: [
    { id: `r${i}-bb`, name: "Bed & Breakfast", mealPlan: "BED_AND_BREAKFAST", price: bb, unit: "night" },
    { id: `r${i}-hb`, name: "Half Board", mealPlan: "HALF_BOARD", price: hb, unit: "night" },
    { id: `r${i}-fb`, name: "Full Board", mealPlan: "FULL_BOARD", price: fb, unit: "night" },
  ],
}));

export const omega: SiteFixture = {
  site: {
    name: "Omega Gardens Hotel & Spa",
    slug: "omega",
    canonicalHost: "omega.site.hoteliermanagement.app",
    businessType: "HOTEL",
    currency: "KES",
    theme: { key: "aurora" },
    branding: {
      // A deep garden green, used sparingly — the theme's ivory and champagne
      // carry the page.
      primaryColor: "#2F4A3E",
      accentColor: "#B4935A",
      fontFamily: null,
      logoUrl: `${IMG}/logo.png`,
      faviconUrl: null,
      tagline: "A garden retreat on the Karatina–Nairobi Highway",
    },
    seo: {
      title: "Omega Gardens Hotel & Spa — Karatina",
      description: "Garden rooms, a refreshing pool, spa and wellness, and all-day dining along the Karatina–Nairobi Highway.",
      ogImageUrl: `${IMG}/home/accomodations.jpg`,
    },
    analyticsId: null,
    contact: {
      phone: "+254 795 106 483",
      alternativePhone: null,
      email: "info@omegagardens.com",
      whatsapp: "+254795106483",
      address: "Along Karatina–Nairobi Highway",
      city: "Karatina",
      county: "Nyeri",
      country: "Kenya",
      mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.6754390408682!2d37.131234574041116!3d-0.48489763527337687!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182887fbbe128361%3A0x83db3009f7951c38!2sOmega%20Gardens%20Hotel!5e0!3m2!1sen!2ske!4v1754922637639!5m2!1sen!2ske",
      latitude: -0.484898,
      longitude: 37.133809,
    },
    social: {
      facebook: "https://www.facebook.com/theomegaleisuregardens",
      instagram: "https://www.instagram.com/omegagardens_/",
      tiktok: "https://www.tiktok.com/tag/omegagardenhotelkaratina",
    },
    features: { rooms: true, roomBooking: true, menu: true, services: false, appointments: false, memberships: false, inquiries: true },
    nav: [
      { slug: "rooms", title: "Rooms & Suites", kind: "SYSTEM" },
      { slug: "dining", title: "Dining", kind: "SYSTEM" },
      { slug: "wellness", title: "Spa & Wellness", kind: "STANDARD" },
      { slug: "events", title: "Weddings & Events", kind: "STANDARD" },
      { slug: "contact", title: "Contact", kind: "SYSTEM" },
    ],
  },

  pages: [
    {
      slug: "home",
      title: "Home",
      kind: "HOME",
      seoTitle: null,
      seoDescription: null,
      ogImageUrl: null,
      sections: [
        {
          id: "hero",
          type: "hero",
          props: {
            eyebrow: "Karatina · Kenya",
            title: "Where the garden slows the day",
            subtitle: "Quiet rooms, a sunlit pool and unhurried dining — just off the Karatina–Nairobi Highway.",
            images: [
              { url: `${IMG}/home/accomodations.jpg`, alt: "A guest room at Omega Gardens" },
              { url: `${IMG}/home/swimming.jpg`, alt: "The swimming pool" },
              { url: `${IMG}/bar-menu/backyard/backyard.jpg`, alt: "The backyard garden" },
            ],
            primaryCta: { label: "Explore rooms", href: "/rooms" },
            secondaryCta: { label: "Discover dining", href: "/dining" },
          },
        },
        {
          id: "welcome",
          type: "rich-text",
          props: {
            eyebrow: "Welcome",
            title: "Quiet luxury, rooted in the garden",
            body: "Omega Gardens Hotel & Spa is a place to arrive and exhale. Set in leafy grounds along the Karatina–Nairobi Highway, it brings together restful rooms, a refreshing pool, wellness and grooming, and a kitchen that runs from the first coffee to the last cocktail.\n\nWhether you are passing through, gathering your team or celebrating the day of your life, we take care of every detail — so you can simply be here.",
            signature: "Open daily · 6:00 AM – 11:00 PM",
          },
        },
        {
          id: "rooms",
          type: "rooms-showcase",
          props: {
            eyebrow: "Stay",
            title: "Rooms & Suites",
            intro: "Three categories of room, each in single or double occupancy, with bed & breakfast, half board or full board.",
            limit: 3,
            roomTypeIds: ["rt-standard-double", "rt-superior-double", "rt-deluxe-double"],
            cta: { label: "View all rooms", href: "/rooms" },
          },
        },
        {
          id: "dining",
          type: "image-text",
          props: {
            eyebrow: "Dine",
            title: "Our culinary experience",
            body: "Start your day with carefully crafted breakfast selections and artisanal coffee, linger over a long lunch, or gather for golden-hour grills in the backyard. From hearty morning meals to afternoon pick-me-ups, there is something for every moment.",
            image: { url: `${IMG}/menu/breakfast.jpg`, alt: "Breakfast at Omega Gardens" },
            imageSide: "left",
            bullets: ["Breakfast served from 6:00 AM", "Omega breakfast buffet", "Backyard BBQ & steaks", "Kids' menu"],
            cta: { label: "View the menu", href: "/dining" },
            tone: "light",
          },
        },
        {
          id: "amenities",
          type: "amenities",
          props: {
            eyebrow: "The grounds",
            title: "Everything within the garden walls",
            items: [
              { icon: "pool", title: "Swimming Pool", text: "A refreshing pool, with a shallow pool just for children." },
              { icon: "spa", title: "Spa & Wellness", text: "Complete mind, body and soul rejuvenation." },
              { icon: "gym", title: "Fitness Centre", text: "Modern equipment and certified trainers." },
              { icon: "conference", title: "Conference & Boardrooms", text: "Professional spaces for meetings of every size." },
              { icon: "bar", title: "Bar & Cellar", text: "Premium spirits, signature cocktails and a curated wine list." },
              { icon: "kids", title: "Kids' Garden", text: "Playgrounds, trampolines and skating, safely supervised." },
              { icon: "grooming", title: "Barbershop", text: "Traditional craft, modern comfort." },
              { icon: "events", title: "Weddings & Events", text: "From intimate ceremonies to grand receptions." },
            ],
            tone: "sand",
          },
        },
        {
          id: "menu",
          type: "menu-highlights",
          props: {
            eyebrow: "From the kitchen",
            title: "A taste of the menu",
            categories: ["Breakfast", "Beef", "Fish", "Platters"],
            itemsPerCategory: 4,
            cta: { label: "See the full menu", href: "/dining" },
          },
        },
        {
          id: "weddings",
          type: "image-text",
          props: {
            eyebrow: "Celebrate",
            title: "Weddings & events in the garden",
            body: "From intimate ceremonies to grand receptions, our team brings your vision to life with elegance and attention to every detail. Conferences, team building and private dinners are planned with the same care.",
            image: { url: `${IMG}/home/wedding.png`, alt: "A wedding set-up in the gardens" },
            imageSide: "right",
            cta: { label: "Plan your event", href: "/events" },
            tone: "sand",
          },
        },
        {
          id: "gallery",
          type: "gallery",
          props: {
            eyebrow: "Moments",
            title: "Life at Omega Gardens",
            images: [
              { url: `${IMG}/home/swimming.jpg`, alt: "Swimming pool", caption: "The pool" },
              { url: `${IMG}/bar-menu/indoor-bar/omega-bar-indoor-1.jpg`, alt: "Indoor bar", caption: "The bar" },
              { url: `${IMG}/home/conference.jpg`, alt: "Conference hall", caption: "Conference hall" },
              { url: `${IMG}/bar-menu/backyard/backyard-2.jpg`, alt: "Backyard dining", caption: "The backyard" },
              { url: `${IMG}/gym/gym-1.webp`, alt: "Fitness centre", caption: "Fitness" },
              { url: `${IMG}/kids/playground.jpg`, alt: "Children's playground", caption: "Kids' garden" },
            ],
          },
        },
        {
          id: "cta",
          type: "cta",
          props: {
            eyebrow: "Plan your stay",
            title: "We would love to welcome you",
            intro: "Call us, send a message on WhatsApp, or check availability online.",
            image: { url: `${IMG}/home/swimming.jpg`, alt: "" },
            primaryCta: { label: "Check availability", href: "/rooms" },
            secondaryCta: { label: "Call +254 795 106 483", href: "tel:+254795106483" },
          },
        },
        {
          id: "contact",
          type: "contact-map",
          props: {
            eyebrow: "Visit",
            title: "Find us",
            hours: "Monday – Sunday · 6:00 AM – 11:00 PM",
          },
        },
      ],
    },
    {
      slug: "wellness",
      title: "Spa & Wellness",
      kind: "STANDARD",
      seoTitle: null,
      seoDescription: "Fitness, spa treatments and professional grooming at Omega Gardens, Karatina.",
      ogImageUrl: null,
      sections: [
        {
          id: "intro",
          type: "rich-text",
          props: {
            eyebrow: "Your wellness journey starts here",
            title: "Body, mind and a little time for yourself",
            body: "Whether you are looking to maintain your fitness routine or unwind with a relaxing spa treatment, our wellness centre offers everything you need for a balanced stay.",
          },
        },
        {
          id: "fitness",
          type: "image-text",
          props: {
            eyebrow: "Fitness",
            title: "Train with expert guidance",
            body: "Modern equipment and certified trainers to guide your fitness journey — goal-oriented, results-driven, and never rushed.",
            image: { url: `${IMG}/gym/gym-1.webp`, alt: "The fitness centre" },
            bullets: ["Certified trainers", "Modern equipment", "Personal programmes", "Holistic wellness"],
          },
        },
        {
          id: "grooming",
          type: "image-text",
          props: {
            eyebrow: "The gentleman's experience",
            title: "Professional grooming",
            body: "Step into our classic barbershop where traditional craftsmanship meets contemporary style. Our master barbers provide personalised grooming in a relaxing, refined setting.",
            image: { url: `${IMG}/home/barbershop.jpg`, alt: "The barbershop" },
            imageSide: "right",
            tone: "sand",
          },
        },
        {
          id: "cta",
          type: "cta",
          props: {
            title: "Book a session",
            intro: "Call or message us and we will reserve your time.",
            image: { url: `${IMG}/home/gym.jpeg`, alt: "" },
            primaryCta: { label: "Call us", href: "tel:+254795106483" },
          },
        },
      ],
    },
    {
      slug: "events",
      title: "Weddings & Events",
      kind: "STANDARD",
      seoTitle: null,
      seoDescription: "Weddings, conferences and team building in the gardens at Omega Gardens, Karatina.",
      ogImageUrl: null,
      sections: [
        {
          id: "hero",
          type: "hero",
          props: {
            eyebrow: "Weddings · Conferences · Team building",
            title: "Moments worth gathering for",
            subtitle: "From intimate ceremonies to grand receptions and productive offsites.",
            images: [{ url: `${IMG}/home/wedding.png`, alt: "A wedding in the gardens" }],
            showBookingBar: false,
            height: "tall",
          },
        },
        {
          id: "weddings",
          type: "image-text",
          props: {
            eyebrow: "Weddings",
            title: "Your perfect day, in the garden",
            body: "At Omega Gardens Hotel & Spa, we transform your special day into an unforgettable celebration. From intimate ceremonies to grand receptions, our expert team brings your vision to life with elegance and attention to every detail.\n\nWe take care of every detail so you can focus on what matters most — celebrating your love.",
            image: { url: `${IMG}/home/wedding.png`, alt: "Wedding set-up" },
          },
        },
        {
          id: "meetings",
          type: "image-text",
          props: {
            eyebrow: "Meetings",
            title: "Conferences & boardrooms",
            body: "Professional meeting spaces for every size of gathering, from an executive boardroom to a full conference hall.",
            image: { url: `${IMG}/home/conference.jpg`, alt: "The conference hall" },
            imageSide: "right",
            tone: "sand",
          },
        },
        {
          id: "teams",
          type: "image-text",
          props: {
            eyebrow: "Team building",
            title: "Build stronger teams",
            body: "Strengthen bonds, improve communication and boost morale with expertly designed team building programmes. Our facilitators create engaging experiences that bring teams together and drive results.",
            image: { url: `${IMG}/gym/teambulding.jpg`, alt: "A team building activity" },
          },
        },
        {
          id: "cta",
          type: "cta",
          props: {
            eyebrow: "Ready to start planning?",
            title: "Let us host your next occasion",
            intro: "Our events team will help you shape the day — tell us what you have in mind.",
            image: { url: `${IMG}/home/boardroom.jpg`, alt: "" },
            primaryCta: { label: "Call +254 795 106 483", href: "tel:+254795106483" },
          },
        },
      ],
    },
  ],

  roomTypes,
  menu: menu as MenuCategory[],
  services: [],
  memberships: [],
};
