import "server-only";

import { cache } from "react";
import { cookies, headers } from "next/headers";

import { fixtureFor } from "./fixtures";
import { PREVIEW_COOKIE } from "./preview";
import type { MembershipPlan, MenuCategory, Page, RoomAvailability, RoomType, ServiceCategory, Site, StaySearch } from "./types";

// The only door to tenant data. Every call names the visitor's hostname
// (x-site-host) — that's how the API knows whose site this is. Responses are
// cached for a minute in Next's data cache, tagged per host so a publish from
// the platform admin can purge one site (Phase 4).
//
// SITE_FIXTURE=<name> swaps the API for a bundled demo site — for design work
// with no database. Never set it in production.

const API_URL = (process.env.API_URL ?? "http://localhost:4000").replace(/\/+$/, "");
const REVALIDATE_SECONDS = 60;

/** The hostname the visitor asked for, lowercase and without a port. */
export const siteHost = cache(async (): Promise<string> => {
  const h = await headers();
  // Behind Caddy the original host arrives as x-forwarded-host.
  const raw = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  return raw.split(",")[0].trim().toLowerCase().replace(/:\d+$/, "");
});

class ApiError extends Error {
  constructor(public status: number, path: string) {
    super(`Site API ${path} answered ${status}`);
  }
}

/** The platform admin's preview token, if this visitor opened a preview link. */
const previewToken = cache(async (): Promise<string | null> => (await cookies()).get(PREVIEW_COOKIE)?.value ?? null);

async function apiGet<T>(path: string): Promise<T | null> {
  const [host, preview] = await Promise.all([siteHost(), previewToken()]);
  const res = await fetch(`${API_URL}/public/site${path}`, {
    headers: { "x-site-host": host, accept: "application/json", ...(preview ? { "x-site-preview": preview } : {}) },
    // Previews must always show the latest drafts — never cached.
    ...(preview ? { cache: "no-store" as const } : { next: { revalidate: REVALIDATE_SECONDS, tags: [`site:${host}`] } }),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new ApiError(res.status, path);
  return (await res.json()) as T;
}

const fixture = () => fixtureFor(process.env.SITE_FIXTURE);

/** The site for this request's host, or null when there's no published site here. */
export const getSite = cache(async (): Promise<Site | null> => {
  // Always read the host, even for a fixture: it's what marks every page as
  // per-request, so demo and production render the same way (never prebuilt).
  await siteHost();
  const demo = fixture();
  if (demo) return demo.site;
  return (await apiGet<{ site: Site }>("/resolve"))?.site ?? null;
});

export const getPage = cache(async (slug: string): Promise<Page | null> => {
  const demo = fixture();
  if (demo) return demo.pages.find((p) => p.slug === slug) ?? null;
  return (await apiGet<{ page: Page }>(`/pages/${encodeURIComponent(slug)}`))?.page ?? null;
});

export const getRoomTypes = cache(async (): Promise<RoomType[]> => {
  const demo = fixture();
  if (demo) return demo.roomTypes;
  return (await apiGet<{ roomTypes: RoomType[] }>("/rooms"))?.roomTypes ?? [];
});

export const getRoomType = cache(async (id: string): Promise<RoomType | null> => {
  const demo = fixture();
  if (demo) return demo.roomTypes.find((t) => t.id === id) ?? null;
  return (await apiGet<{ roomType: RoomType }>(`/rooms/${encodeURIComponent(id)}`))?.roomType ?? null;
});

/** Live availability for a stay — never cached. A rejected search (dates in
 * the past, too long…) comes back as { error } for the page to show. */
export async function getAvailability(search: StaySearch): Promise<{ availability: RoomAvailability[] } | { error: string }> {
  const demo = fixture();
  if (demo) {
    return { availability: demo.roomTypes.map((t) => ({ roomTypeId: t.id, available: t.capacity >= search.guests, fitsGuests: t.capacity >= search.guests, roomsLeft: null })) };
  }
  const [host, preview] = await Promise.all([siteHost(), previewToken()]);
  const query = new URLSearchParams({ checkIn: search.checkIn, checkOut: search.checkOut, guests: String(search.guests) });
  const res = await fetch(`${API_URL}/public/site/rooms/availability?${query}`, {
    headers: { "x-site-host": host, accept: "application/json", ...(preview ? { "x-site-preview": preview } : {}) },
    cache: "no-store",
  });
  if (res.status === 400) {
    const body = (await res.json().catch(() => ({}))) as { details?: { fieldErrors?: Record<string, string[]> } };
    const first = Object.values(body.details?.fieldErrors ?? {}).flat()[0];
    return { error: first ?? "Please check your dates" };
  }
  if (!res.ok) throw new ApiError(res.status, "/rooms/availability");
  return (await res.json()) as { availability: RoomAvailability[] };
}

export const getMenu = cache(async (): Promise<MenuCategory[]> => {
  const demo = fixture();
  if (demo) return demo.menu;
  return (await apiGet<{ categories: MenuCategory[] }>("/menu"))?.categories ?? [];
});

export const getServices = cache(async (): Promise<ServiceCategory[]> => {
  const demo = fixture();
  if (demo) return demo.services;
  return (await apiGet<{ categories: ServiceCategory[] }>("/services"))?.categories ?? [];
});

export const getMemberships = cache(async (): Promise<MembershipPlan[]> => {
  const demo = fixture();
  if (demo) return demo.memberships;
  return (await apiGet<{ plans: MembershipPlan[] }>("/memberships"))?.plans ?? [];
});
