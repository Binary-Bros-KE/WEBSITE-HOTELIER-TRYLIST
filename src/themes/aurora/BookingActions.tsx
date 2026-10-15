"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";

import type { FormState } from "@/engine/actions";
import { formatMoney } from "@/engine/format";
import type { FormAction } from "@/engine/theme";
import type { PaymentState } from "@/engine/types";
import { FormError, SubmitButton, TextField } from "./forms";
import { cx } from "./ui";

const POLL_MS = 3000;
const GIVE_UP_MS = 3 * 60_000;

/** Watches an M-Pesa prompt until it settles, then reloads the page without it. */
export function PaymentWatcher({ token, requestId }: { token: string; requestId: string }) {
  const router = useRouter();
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const started = Date.now();
    let stopped = false;
    const base = `/booking/${encodeURIComponent(token)}`;
    async function tick() {
      if (stopped) return;
      try {
        const res = await fetch(`${base}/payment?id=${encodeURIComponent(requestId)}`, { cache: "no-store" });
        if (res.ok) {
          const state = (await res.json()) as PaymentState;
          if (state.status === "SUCCESS") { router.replace(`${base}?paid=1`); return; }
          if (state.status !== "PENDING") { router.replace(`${base}?payError=${encodeURIComponent(state.message ?? "The payment didn't go through")}`); return; }
        }
      } catch {
        // Network blip — keep polling.
      }
      if (Date.now() - started > GIVE_UP_MS) { setSlow(true); return; }
      window.setTimeout(tick, POLL_MS);
    }
    const first = window.setTimeout(tick, POLL_MS);
    return () => { stopped = true; window.clearTimeout(first); };
  }, [router, token, requestId]);

  return (
    <div role="status" className="flex items-start gap-5 border border-brand/30 bg-paper p-6">
      <span aria-hidden className="mt-1 size-5 shrink-0 animate-spin rounded-full border-2 border-brand/25 border-t-brand" />
      <div className="space-y-1">
        <p className="font-display text-2xl text-ink">Check your phone</p>
        <p className="text-sm leading-relaxed text-ink-soft">
          {slow ? "We haven't heard back from M-Pesa yet. If you completed the payment, refresh this page in a minute — otherwise you can send a new prompt below."
            : "Enter your M-Pesa PIN on the prompt we just sent. This page updates by itself."}
        </p>
      </div>
    </div>
  );
}

export function PayForm({ action, depositDue, fullAmount, currency, holdExpiresAt }: { action: FormAction; depositDue: number; fullAmount: number; currency: string; holdExpiresAt: string | null }) {
  const [state, formAction] = useActionState<FormState, FormData>(action, {});
  const [choice, setChoice] = useState<"deposit" | "full">("deposit");
  const options: ("deposit" | "full")[] = depositDue < fullAmount ? ["deposit", "full"] : ["full"];
  const chosen = options.includes(choice) ? choice : options[0];
  const until = holdExpiresAt ? new Date(holdExpiresAt).toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Nairobi" }) : null;
  return (
    <form action={formAction} className="flex flex-col gap-6 border border-line bg-paper p-6">
      <div>
        <p className="font-display text-2xl text-ink">Complete your payment</p>
        {until && <p className="pt-1 text-sm text-ink-soft">Your room is held until {until}.</p>}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((p) => (
          <label key={p} className={cx("flex cursor-pointer items-center gap-4 border px-5 py-4", chosen === p ? "border-brand" : "border-line")}>
            <input type="radio" name="payment" value={p} checked={chosen === p} onChange={() => setChoice(p)} className="size-4 accent-[var(--brand)]" />
            <span>
              <span className="block font-display text-xl text-ink">{formatMoney(p === "full" ? fullAmount : depositDue, currency)}</span>
              <span className="text-xs uppercase tracking-[0.16em] text-ink-soft">{p === "full" ? "Pay in full" : "Deposit"}</span>
            </span>
          </label>
        ))}
      </div>
      <TextField label="M-Pesa number" name="phone" state={state} type="tel" required placeholder="07…" />
      <FormError state={state} />
      <SubmitButton pendingLabel="Sending prompt…">Send M-Pesa prompt</SubmitButton>
    </form>
  );
}

export function CancelBooking({ action, label }: { action: (prev: FormState) => Promise<FormState>; label: string }) {
  const [state, formAction] = useActionState<FormState>(action, {});
  return (
    <form
      action={formAction}
      onSubmit={(e) => { if (!window.confirm("Cancel this booking? This can't be undone.")) e.preventDefault(); }}
      className="flex flex-col gap-3"
    >
      <FormError state={state} />
      <button type="submit" className="w-fit text-[0.68rem] font-medium uppercase tracking-[0.22em] text-ink-soft underline decoration-line underline-offset-8 transition-colors hover:text-red-800">
        {label}
      </button>
    </form>
  );
}
