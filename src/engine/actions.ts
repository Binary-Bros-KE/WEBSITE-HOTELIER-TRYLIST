"use server";

import { redirect } from "next/navigation";

import { cancelBooking, payBooking, submitAppointment, submitInquiry, submitRoomBooking } from "./submit";

// Form handlers for every theme. Each returns a FormState for the form to show
// (errors, field errors, done) or redirects to the guest's booking page.

export type FormState = { error?: string; fieldErrors?: Record<string, string[]>; done?: boolean };

const text = (form: FormData, key: string) => {
  const v = form.get(key);
  return typeof v === "string" ? v.trim() : "";
};
const optional = (form: FormData, key: string) => text(form, key) || undefined;
const guest = (form: FormData) => ({
  firstName: text(form, "firstName"),
  lastName: text(form, "lastName"),
  phone: text(form, "phone"),
  email: optional(form, "email"),
  notes: optional(form, "notes"),
  company: text(form, "company"), // honeypot
  turnstileToken: optional(form, "turnstileToken"),
});

const tokenPath = (token: string) => `/booking/${encodeURIComponent(token)}`;

export async function bookRoomAction(_prev: FormState, form: FormData): Promise<FormState> {
  if (!text(form, "email")) return { fieldErrors: { email: ["Enter your email so we can send your booking details"] } };
  const payment = text(form, "payment");
  const result = await submitRoomBooking({
    roomTypeId: text(form, "roomTypeId"),
    rateId: optional(form, "rateId"),
    checkIn: text(form, "checkIn"),
    checkOut: text(form, "checkOut"),
    adults: Number(text(form, "adults") || 1),
    children: Number(text(form, "children") || 0),
    ...(payment === "deposit" || payment === "full" ? { payment, mpesaPhone: optional(form, "mpesaPhone") } : {}),
    ...guest(form),
  });
  if (!result.ok) return { error: result.error, fieldErrors: result.fieldErrors };
  const { manageToken, payment: started, paymentError } = result.data;
  const query = started ? `?new=1&pay=${encodeURIComponent(started.requestId)}` : paymentError ? `?new=1&payError=${encodeURIComponent(paymentError)}` : "?new=1";
  redirect(`${tokenPath(manageToken)}${query}`);
}

export async function bookAppointmentAction(_prev: FormState, form: FormData): Promise<FormState> {
  const result = await submitAppointment({
    serviceId: text(form, "serviceId"),
    variantId: optional(form, "variantId"),
    date: text(form, "date"),
    time: text(form, "time"),
    ...guest(form),
  });
  if (!result.ok) return { error: result.error, fieldErrors: result.fieldErrors };
  redirect(`${tokenPath(result.data.manageToken)}?new=1`);
}

export async function inquiryAction(_prev: FormState, form: FormData): Promise<FormState> {
  const result = await submitInquiry({
    kind: text(form, "kind") || "GENERAL",
    name: text(form, "name"),
    email: optional(form, "email"),
    phone: optional(form, "phone"),
    subject: optional(form, "subject"),
    message: text(form, "message"),
    sourcePage: optional(form, "sourcePage"),
    company: text(form, "company"),
    turnstileToken: optional(form, "turnstileToken"),
  });
  if (!result.ok) return { error: result.error, fieldErrors: result.fieldErrors };
  return { done: true };
}

export async function payBookingAction(token: string, _prev: FormState, form: FormData): Promise<FormState> {
  const payment = text(form, "payment") === "full" ? "full" : "deposit";
  const result = await payBooking(token, text(form, "phone"), payment);
  if (!result.ok) return { error: result.error };
  redirect(`${tokenPath(token)}?pay=${encodeURIComponent(result.data.requestId)}`);
}

export async function cancelBookingAction(token: string, _prev: FormState): Promise<FormState> {
  const result = await cancelBooking(token);
  if (!result.ok) return { error: result.error };
  redirect(tokenPath(token));
}
