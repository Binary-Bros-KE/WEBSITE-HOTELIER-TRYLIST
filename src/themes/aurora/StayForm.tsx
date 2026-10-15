import { todayIso } from "@/engine/stay";
import type { StaySearch } from "@/engine/types";
import { cx } from "./ui";

/**
 * Arrival / departure / guests search. A plain GET form — works without
 * JavaScript and makes every search a shareable URL.
 *   bar     — wide, over the hero or on the rooms page
 *   stacked — narrow, in the room page's sidebar
 */
export function StayForm({ action, search, layout = "bar", className }: { action: string; search?: StaySearch | null; layout?: "bar" | "stacked"; className?: string }) {
  const today = todayIso();
  const field = "w-full border-0 border-b border-line bg-transparent px-0 pb-2 pt-1 font-display text-xl text-ink focus:border-accent focus:outline-none focus:ring-0";
  const bar = layout === "bar";
  return (
    <form
      action={action}
      method="get"
      className={cx(
        // Background comes from the caller (solid on pages, translucent over the hero).
        "grid gap-6 text-ink",
        bar ? "p-6 sm:grid-cols-2 sm:p-8 lg:grid-cols-[1fr_1fr_0.7fr_auto] lg:items-end lg:gap-10" : "p-6",
        className,
      )}
    >
      <label className="flex flex-col gap-2">
        <span className="aurora-eyebrow">Arrival</span>
        <input type="date" name="checkIn" min={today} required defaultValue={search?.checkIn} className={field} />
      </label>
      <label className="flex flex-col gap-2">
        <span className="aurora-eyebrow">Departure</span>
        <input type="date" name="checkOut" min={today} required defaultValue={search?.checkOut} className={field} />
      </label>
      <label className="flex flex-col gap-2">
        <span className="aurora-eyebrow">Guests</span>
        <select name="guests" defaultValue={String(search?.guests ?? 2)} className={field}>
          {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n} {n === 1 ? "guest" : "guests"}</option>)}
        </select>
      </label>
      <button
        type="submit"
        className={cx(
          "bg-brand px-8 py-4 text-[0.7rem] font-medium uppercase tracking-[0.24em] text-paper transition-colors duration-300 hover:bg-brand-deep",
          bar && "sm:col-span-2 lg:col-span-1",
        )}
      >
        Check availability
      </button>
    </form>
  );
}
