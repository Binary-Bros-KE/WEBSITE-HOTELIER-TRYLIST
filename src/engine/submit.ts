import "server-only";

import { headers } from "next/headers";

import { siteHost } from "./api";
import { fixtureFor } from "./fixtures";
import type { GuestBooking, PaymentState } from "./types";

// Writes and live reads for bookings, enquiries and payments — never cached.
// Each call forwards the visitor's IP (x-site-client-ip) so the API can
// rate-limit per visitor; the API's own view of the caller is this server.

const API_URL = (process.env.API_URL ?? "http://localhost:4000").replace(/\/+$/, "");

export type SubmitResult<T> = { ok: true; data: T } | { ok: false; status: number; error: string; fieldErrors?: Record<string, string[]> };

async function clientIp(): Promise<string> {
  const h = await headers();
  return (h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? "").trim();
}

async function call<T>(method: "GET" | "POST", path: string, body?: unknown): Promise<SubmitResult<T>> {
  if (fixtureFor(process.env.SITE_FIXTURE)) {
    return { ok: false, status: 503, error: "This is a design preview — bookings and messages are switched off here." };
  }
  const [host, ip] = await Promise.all([siteHost(), clientIp()]);
  let res: Response;
  try {
    res = await fetch(`${API_URL}/public/site${path}`, {
      method,
      headers: { "x-site-host": host, "x-site-client-ip": ip, accept: "application/json", ...(body ? { "content-type": "application/json" } : {}) },
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
  } catch {
    return { ok: false, status: 503, error: "We couldn't reach the booking system — please try again in a moment or call us." };
  }
  if (res.status === 204) return { ok: true, data: undefined as T };
  const json = (await res.json().catch(() => ({}))) as T & { error?: string; details?: { fieldErrors?: Record<string, string[]> } };
  if (!res.ok) return { ok: false, status: res.status, error: json.error ?? "Something went wrong — please try again.", fieldErrors: json.details?.fieldErrors };
  return { ok: true, data: json };
}

export type RoomBookingCreated = { manageToken: string; reservationNo: string; payment: { requestId: string; amount: number } | null; paymentError: string | null };

export const submitRoomBooking = (body: Record<string, unknown>) => call<RoomBookingCreated>("POST", "/bookings/room", body);
export const submitAppointment = (body: Record<string, unknown>) => call<{ manageToken: string; reference: string }>("POST", "/bookings/appointment", body);
export const submitInquiry = (body: Record<string, unknown>) => call<{ ok: true }>("POST", "/inquiries", body);
export const fetchBooking = (token: string) => call<GuestBooking>("GET", `/bookings/${encodeURIComponent(token)}`);
export const cancelBooking = (token: string) => call<void>("POST", `/bookings/${encodeURIComponent(token)}/cancel`);
export const payBooking = (token: string, phone: string, payment: "deposit" | "full") =>
  call<{ requestId: string; amount: number }>("POST", `/bookings/${encodeURIComponent(token)}/pay`, { phone, payment });
export const fetchPaymentState = (token: string, requestId: string) =>
  call<PaymentState>("GET", `/bookings/${encodeURIComponent(token)}/payments/${encodeURIComponent(requestId)}`);
export const fetchSlots = (serviceId: string, date: string, variantId?: string) =>
  call<{ slots: string[] }>("GET", `/services/${encodeURIComponent(serviceId)}/slots?${new URLSearchParams({ date, ...(variantId ? { variantId } : {}) })}`);
