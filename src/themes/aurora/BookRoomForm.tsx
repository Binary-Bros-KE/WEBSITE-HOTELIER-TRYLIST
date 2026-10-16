"use client";

import { useActionState, useState } from "react";

import type { FormState } from "@/engine/actions";
import { formatMoney } from "@/engine/format";
import { formatDay, mealPlanLabel } from "@/engine/stay";
import type { FormAction } from "@/engine/theme";
import type { BookingRules, RoomType, StaySearch } from "@/engine/types";
import { FormError, Honeypot, SelectField, SubmitButton, TextAreaField, TextField } from "./forms";
import { cx } from "./ui";

type Props = {
  room: RoomType;
  rateId: string | null;
  search: StaySearch;
  currency: string;
  rules: BookingRules | null;
  action: FormAction;
};

/** Mirrors the API's rule: the larger of the percentage and the minimum, capped at the stay. */
function deposit(rules: BookingRules, total: number): number {
  return Math.min(total, Math.max((total * rules.depositPercent) / 100, rules.depositMinimum));
}

export function BookRoomForm({ room, rateId, search, currency, rules, action }: Props) {
  const [state, formAction] = useActionState<FormState, FormData>(action, {});
  const rates = room.rates.length > 0 ? room.rates : [{ id: "", name: "Room", mealPlan: null, price: room.priceFrom, unit: room.priceUnit }];
  const [selected, setSelected] = useState(rates.find((r) => r.id === rateId)?.id ?? rates[0].id);
  const [payment, setPayment] = useState<"deposit" | "full">("deposit");
  const rate = rates.find((r) => r.id === selected) ?? rates[0];
  const total = rate.price * search.nights;
  const takesPayment = Boolean(rules?.requirePayment);
  const paymentBlocked = takesPayment && !rules?.paymentAvailable;
  const depositAmount = rules ? Math.ceil(deposit(rules, total)) : 0;
  // When the deposit is the whole stay, "pay in full" is the only choice.
  const options: ("deposit" | "full")[] = depositAmount < Math.ceil(total) ? ["deposit", "full"] : ["full"];
  const chosen = options.includes(payment) ? payment : options[0];
  const payNow = chosen === "full" ? Math.ceil(total) : depositAmount;
  const guests = Math.min(search.guests, room.capacity);

  return (
    <form action={formAction} className="relative grid gap-16 lg:grid-cols-[1fr_24rem]">
      <Honeypot />
      <input type="hidden" name="roomTypeId" value={room.id} />
      <input type="hidden" name="checkIn" value={search.checkIn} />
      <input type="hidden" name="checkOut" value={search.checkOut} />
      {room.rates.length > 0 && <input type="hidden" name="rateId" value={selected} />}

      <div className="flex flex-col gap-14">
        {room.rates.length > 1 && (
          <fieldset className="flex flex-col gap-5">
            <legend className="aurora-eyebrow mb-5">Choose your rate</legend>
            {rates.map((r) => (
              <label key={r.id} className={cx("flex cursor-pointer items-center justify-between gap-6 border px-6 py-5 transition-colors", selected === r.id ? "border-brand bg-paper" : "border-line hover:border-ink/30")}>
                <span className="flex items-center gap-4">
                  <input type="radio" name="rateChoice" checked={selected === r.id} onChange={() => setSelected(r.id)} className="size-4 accent-[var(--brand)]" />
                  <span>
                    <span className="block font-display text-2xl text-ink">{r.name}</span>
                    {mealPlanLabel(r.mealPlan) && <span className="text-sm text-ink-soft">{mealPlanLabel(r.mealPlan)}</span>}
                  </span>
                </span>
                <span className="text-right">
                  <span className="block font-display text-xl text-ink">{formatMoney(r.price * search.nights, currency)}</span>
                  <span className="text-xs text-ink-soft">{formatMoney(r.price, currency)} / night</span>
                </span>
              </label>
            ))}
          </fieldset>
        )}

        <fieldset className="grid gap-8 sm:grid-cols-2">
          <legend className="aurora-eyebrow mb-8">Your details</legend>
          <TextField label="First name" name="firstName" state={state} required autoComplete="given-name" />
          <TextField label="Last name" name="lastName" state={state} autoComplete="family-name" />
          <TextField label="Phone" name="phone" state={state} required type="tel" autoComplete="tel" placeholder="07…" />
          <TextField label="Email" name="email" state={state} required type="email" autoComplete="email" hint="Your booking details are sent here" />
          <SelectField label="Adults" name="adults" state={state} defaultValue={String(guests)}>
            {Array.from({ length: room.capacity }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}
          </SelectField>
          <SelectField label="Children" name="children" state={state} defaultValue="0">
            {Array.from({ length: Math.max(room.capacity, 1) }, (_, i) => i).map((n) => <option key={n} value={n}>{n}</option>)}
          </SelectField>
          <TextAreaField label="Special requests" name="notes" state={state} className="sm:col-span-2" placeholder="Arrival time, dietary needs, a quiet room…" />
        </fieldset>

        {takesPayment && (
          <fieldset className="flex flex-col gap-6">
            <legend className="aurora-eyebrow mb-6">Payment</legend>
            {paymentBlocked ? (
              <p className="border-l-2 border-accent bg-accent-soft px-5 py-4 text-sm text-ink">Online payment isn&apos;t available right now — please call us to complete your booking.</p>
            ) : (
              <>
                <p className="text-sm leading-relaxed text-ink-soft">
                  We hold your room for {rules!.holdMinutes} minutes while you pay by M-Pesa. You&apos;ll get a prompt on your phone to enter your PIN.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {options.map((p) => (
                    <label key={p} className={cx("flex cursor-pointer items-center gap-4 border px-5 py-4 transition-colors", chosen === p ? "border-brand bg-paper" : "border-line hover:border-ink/30")}>
                      <input type="radio" name="payment" value={p} checked={chosen === p} onChange={() => setPayment(p)} className="size-4 accent-[var(--brand)]" />
                      <span>
                        <span className="block font-display text-xl text-ink">{formatMoney(p === "full" ? Math.ceil(total) : depositAmount, currency)}</span>
                        <span className="text-xs uppercase tracking-[0.16em] text-ink-soft">{p === "full" ? "Pay in full" : "Deposit now"}</span>
                      </span>
                    </label>
                  ))}
                </div>
                <TextField label="M-Pesa number" name="mpesaPhone" state={state} type="tel" placeholder="Same as your phone if left blank" />
              </>
            )}
          </fieldset>
        )}
      </div>

      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="flex flex-col gap-6 border border-line bg-sand p-7">
          <p className="aurora-eyebrow">Your stay</p>
          <div>
            <p className="font-display text-3xl text-ink">{room.name}</p>
            <p className="pt-1 text-sm text-ink-soft">{rate.name !== "Room" ? rate.name : ""}</p>
          </div>
          <dl className="divide-y divide-line border-y border-line text-sm">
            <div className="flex justify-between py-3"><dt className="text-ink-soft">Arrival</dt><dd className="text-ink">{formatDay(search.checkIn)}</dd></div>
            <div className="flex justify-between py-3"><dt className="text-ink-soft">Departure</dt><dd className="text-ink">{formatDay(search.checkOut)}</dd></div>
            <div className="flex justify-between py-3"><dt className="text-ink-soft">Nights</dt><dd className="text-ink">{search.nights}</dd></div>
            <div className="flex items-baseline justify-between py-3">
              <dt className="text-ink-soft">Total{!room.pricesIncludeTax && " (excl. VAT)"}</dt>
              <dd className="font-display text-2xl text-ink">{formatMoney(total, currency)}</dd>
            </div>
            {takesPayment && !paymentBlocked && (
              <div className="flex items-baseline justify-between py-3"><dt className="text-ink-soft">Due now by M-Pesa</dt><dd className="font-display text-xl text-brand">{formatMoney(payNow, currency)}</dd></div>
            )}
          </dl>
          <FormError state={state} />
          <SubmitButton pendingLabel={takesPayment ? "Sending M-Pesa prompt…" : "Sending request…"} disabled={paymentBlocked}>
            {takesPayment ? "Book & pay" : "Request booking"}
          </SubmitButton>
          <p className="text-xs leading-relaxed text-ink-soft">
            This is a booking request — our team confirms it shortly and you&apos;ll hear from us.
            <span className="mt-2 block">By sending this you agree to our <a href="/privacy" className="underline underline-offset-2 hover:text-ink">privacy notice</a>.</span>
          </p>
        </div>
      </aside>
    </form>
  );
}
