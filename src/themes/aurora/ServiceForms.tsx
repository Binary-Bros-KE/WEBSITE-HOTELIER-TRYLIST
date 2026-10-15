"use client";

import { useActionState, useEffect, useState } from "react";

import type { FormState } from "@/engine/actions";
import { formatDuration, formatMoney } from "@/engine/format";
import type { FormAction } from "@/engine/theme";
import type { Service } from "@/engine/types";
import { FormError, Honeypot, SelectField, SubmitButton, TextAreaField, TextField } from "./forms";
import { cx } from "./ui";

function todayInNairobi(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Nairobi" }).format(new Date());
}

export function BookServiceForm({ service, currency, action }: { service: Service; currency: string; action: FormAction }) {
  const [state, formAction] = useActionState<FormState, FormData>(action, {});
  const [variantId, setVariantId] = useState(service.variants[0]?.id ?? "");
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<string[] | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [time, setTime] = useState("");
  const variant = service.variants.find((v) => v.id === variantId);
  const price = variant?.price ?? service.price;
  const duration = formatDuration(variant?.durationMinutes ?? service.durationMinutes);

  useEffect(() => {
    if (!date) return;
    let cancelled = false;
    const query = new URLSearchParams({ date, ...(variantId ? { variantId } : {}) });
    fetch(`/book/service/${encodeURIComponent(service.id)}/slots?${query}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { slots: [] }))
      .then((data: { slots?: string[] }) => { if (!cancelled) { setSlots(data.slots ?? []); setTime(""); } })
      .catch(() => { if (!cancelled) setSlots([]); })
      .finally(() => { if (!cancelled) setLoadingSlots(false); });
    return () => { cancelled = true; };
  }, [date, variantId, service.id]);

  return (
    <form action={formAction} className="relative grid gap-16 lg:grid-cols-[1fr_24rem]">
      <Honeypot />
      <input type="hidden" name="serviceId" value={service.id} />
      <input type="hidden" name="time" value={time} />
      <div className="flex flex-col gap-14">
        <fieldset className="grid gap-8 sm:grid-cols-2">
          <legend className="aurora-eyebrow mb-8">When</legend>
          {service.variants.length > 0 && (
            <SelectField label="Option" name="variantId" state={state} value={variantId} onChange={(e) => { setVariantId(e.target.value); setLoadingSlots(Boolean(date)); }} className="sm:col-span-2">
              {service.variants.map((v) => <option key={v.id} value={v.id}>{v.name} · {formatMoney(v.price, currency)}</option>)}
            </SelectField>
          )}
          <TextField label="Date" name="date" state={state} type="date" required min={todayInNairobi()} value={date} onChange={(e) => { setDate(e.target.value); setLoadingSlots(true); }} />
          <div className="flex flex-col gap-3 sm:col-span-2">
            <span className="aurora-eyebrow">Time</span>
            {!date ? <p className="text-sm text-ink-soft">Choose a date to see open times.</p>
              : loadingSlots ? <p className="text-sm text-ink-soft">Finding open times…</p>
              : slots && slots.length === 0 ? <p className="text-sm text-ink-soft">No open times that day — please try another date or call us.</p>
              : (
                <div className="flex flex-wrap gap-2">
                  {slots?.map((slot) => (
                    <button key={slot} type="button" onClick={() => setTime(slot)} aria-pressed={time === slot}
                      className={cx("min-w-20 border px-4 py-2.5 text-sm transition-colors", time === slot ? "border-brand bg-brand text-paper" : "border-line text-ink hover:border-ink/40")}>
                      {slot}
                    </button>
                  ))}
                </div>
              )}
          </div>
        </fieldset>
        <fieldset className="grid gap-8 sm:grid-cols-2">
          <legend className="aurora-eyebrow mb-8">Your details</legend>
          <TextField label="First name" name="firstName" state={state} required autoComplete="given-name" />
          <TextField label="Last name" name="lastName" state={state} autoComplete="family-name" />
          <TextField label="Phone" name="phone" state={state} required type="tel" autoComplete="tel" />
          <TextField label="Email" name="email" state={state} type="email" autoComplete="email" />
          <TextAreaField label="Anything we should know?" name="notes" state={state} className="sm:col-span-2" />
        </fieldset>
      </div>
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="flex flex-col gap-6 border border-line bg-sand p-7">
          <p className="aurora-eyebrow">Your appointment</p>
          <p className="font-display text-3xl text-ink">{service.name}</p>
          <dl className="divide-y divide-line border-y border-line text-sm">
            {variant && <div className="flex justify-between py-3"><dt className="text-ink-soft">Option</dt><dd className="text-ink">{variant.name}</dd></div>}
            {duration && <div className="flex justify-between py-3"><dt className="text-ink-soft">Duration</dt><dd className="text-ink">{duration}</dd></div>}
            {date && <div className="flex justify-between py-3"><dt className="text-ink-soft">When</dt><dd className="text-ink">{date}{time && ` · ${time}`}</dd></div>}
            <div className="flex items-baseline justify-between py-3"><dt className="text-ink-soft">Price</dt><dd className="font-display text-2xl text-ink">{formatMoney(price, currency)}</dd></div>
          </dl>
          <FormError state={state} />
          <SubmitButton pendingLabel="Sending request…" disabled={!time}>Request appointment</SubmitButton>
          <p className="text-xs leading-relaxed text-ink-soft">Pay at your visit. Our team confirms your time shortly.</p>
        </div>
      </aside>
    </form>
  );
}

const KINDS = [["GENERAL", "General question"], ["ROOM", "Rooms & stays"], ["EVENT", "Weddings & events"], ["SERVICE", "Spa & wellness"], ["MEMBERSHIP", "Memberships"]] as const;

export function InquiryForm({ action, sourcePage }: { action: FormAction; sourcePage: string }) {
  const [state, formAction] = useActionState<FormState, FormData>(action, {});
  if (state.done) {
    return (
      <div role="status" className="flex flex-col gap-3 border border-line bg-sand p-8">
        <p className="font-display text-3xl text-ink">Thank you</p>
        <p className="leading-relaxed text-ink-soft">Your message is with our team. We&apos;ll be in touch soon.</p>
      </div>
    );
  }
  return (
    <form action={formAction} className="relative grid gap-8 sm:grid-cols-2">
      <Honeypot />
      <input type="hidden" name="sourcePage" value={sourcePage} />
      <TextField label="Name" name="name" state={state} required autoComplete="name" className="sm:col-span-2" />
      <TextField label="Email" name="email" state={state} type="email" autoComplete="email" />
      <TextField label="Phone" name="phone" state={state} type="tel" autoComplete="tel" />
      <SelectField label="About" name="kind" state={state} defaultValue="GENERAL" className="sm:col-span-2">
        {KINDS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </SelectField>
      <TextAreaField label="Message" name="message" state={state} required rows={5} className="sm:col-span-2" />
      <div className="flex flex-col gap-4 sm:col-span-2">
        <FormError state={state} />
        <SubmitButton pendingLabel="Sending…" className="w-fit">Send message</SubmitButton>
      </div>
    </form>
  );
}
