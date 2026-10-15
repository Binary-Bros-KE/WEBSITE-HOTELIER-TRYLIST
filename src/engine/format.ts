const CURRENCY_LABEL: Record<string, string> = { KES: "KSh", UGX: "USh", TZS: "TSh", USD: "$" };

/** "KSh 7,500" — whole units; hotel prices don't need cents. */
export function formatMoney(amount: number, currency: string): string {
  const label = CURRENCY_LABEL[currency] ?? currency;
  return `${label} ${Math.round(amount).toLocaleString("en-KE")}`;
}

/** "Per Night" → "night" for "KSh 7,500 / night". */
export function unitLabel(unit: string | null | undefined): string | null {
  if (!unit) return null;
  return unit.replace(/^per\s+/i, "").toLowerCase();
}

export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function whatsappHref(phone: string): string {
  return `https://wa.me/${phone.replace(/\D/g, "")}`;
}

export function formatDuration(minutes: number | null | undefined): string | null {
  if (!minutes) return null;
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} hr ${m} min` : `${h} hr`;
}

/** Splits editor text into paragraphs on blank lines. */
export function paragraphs(body: string | null | undefined): string[] {
  return (body ?? "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
}
