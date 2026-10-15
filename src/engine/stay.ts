import { formatMoney } from "./format";
import type { Site, StaySearch } from "./types";

// Room-search helpers shared by every theme: reading ?checkIn&checkOut&guests,
// and the "reserve" contact links used until online booking (Phase 6).

const DAY_MS = 24 * 60 * 60 * 1000;
const isoDate = /^\d{4}-\d{2}-\d{2}$/;

type Params = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/** Today in the property's timezone, YYYY-MM-DD. */
export function todayIso(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Nairobi" }).format(new Date());
}

/** A search from the query string, or null when none was made. Shape only —
 * the API has the final say (past dates, maximum stay…). */
export function parseStaySearch(params: Params): StaySearch | { error: string } | null {
  const checkIn = one(params.checkIn);
  const checkOut = one(params.checkOut);
  if (!checkIn && !checkOut) return null;
  if (!checkIn || !checkOut || !isoDate.test(checkIn) || !isoDate.test(checkOut)) return { error: "Choose both an arrival and a departure date" };
  const nights = Math.round((Date.parse(`${checkOut}T00:00:00Z`) - Date.parse(`${checkIn}T00:00:00Z`)) / DAY_MS);
  if (!(nights >= 1)) return { error: "Departure must be after arrival" };
  const guests = Math.min(Math.max(Number.parseInt(one(params.guests) ?? "2", 10) || 2, 1), 20);
  return { checkIn, checkOut, guests, nights };
}

/** "Mon 20 Oct" */
export function formatDay(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));
}

export function staySummary(search: StaySearch): string {
  return `${formatDay(search.checkIn)} – ${formatDay(search.checkOut)} · ${search.nights} night${search.nights === 1 ? "" : "s"} · ${search.guests} guest${search.guests === 1 ? "" : "s"}`;
}

export type ContactLink = { kind: "whatsapp" | "phone" | "email"; label: string; href: string };

/** WhatsApp / phone / email links, best first, with the message pre-written. */
export function contactLinks(site: Site, subject: string, message: string, whatsappLabel = "Message on WhatsApp"): ContactLink[] {
  const c = site.contact;
  const links: ContactLink[] = [];
  if (c.whatsapp) links.push({ kind: "whatsapp", label: whatsappLabel, href: `https://wa.me/${c.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(message)}` });
  if (c.phone) links.push({ kind: "phone", label: `Call ${c.phone}`, href: `tel:${c.phone.replace(/[^\d+]/g, "")}` });
  if (c.email) links.push({ kind: "email", label: "Email us", href: `mailto:${c.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}` });
  return links;
}

/** Ways to ask for a room right now, with the request pre-written. */
export function reserveLinks(site: Site, roomName: string, search: StaySearch | null, rate?: { name: string; price: number }): ContactLink[] {
  const lines = [`Hello ${site.name}, I would like to book the ${roomName}`];
  if (rate) lines[0] += ` (${rate.name}, ${formatMoney(rate.price, site.currency)} per night)`;
  if (search) lines.push(`Arrival: ${formatDay(search.checkIn)}`, `Departure: ${formatDay(search.checkOut)}`, `Guests: ${search.guests}`);
  return contactLinks(site, `Booking request — ${roomName}`, lines.join("\n"), "Reserve on WhatsApp");
}

const MEAL_PLANS: Record<string, string> = {
  ROOM_ONLY: "Room only",
  BED_AND_BREAKFAST: "Breakfast included",
  HALF_BOARD: "Breakfast & dinner",
  FULL_BOARD: "All meals included",
};

export function mealPlanLabel(plan: string | null): string | null {
  return plan ? MEAL_PLANS[plan] ?? null : null;
}
