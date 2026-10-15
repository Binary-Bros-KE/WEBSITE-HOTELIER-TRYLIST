import Link from "next/link";

import { formatMoney, unitLabel } from "@/engine/format";
import { safeImage } from "@/engine/safe";
import type { RoomType } from "@/engine/types";

/** Portrait room card — the home page showcase and "other rooms". */
export function RoomCard({ room, currency, query = "" }: { room: RoomType; currency: string; query?: string }) {
  const cover = safeImage(room.imageUrls[0]);
  const unit = unitLabel(room.priceUnit);
  return (
    <Link href={`/rooms/${room.id}${query}`} className="group flex flex-col gap-6">
      <div className="relative aspect-[4/5] overflow-hidden bg-stone">
        {cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt={room.name} loading="lazy" className="size-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-105" />
        )}
        <span className="absolute left-5 top-5 bg-paper/90 px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.2em] text-ink">
          Sleeps {room.capacity}
        </span>
      </div>
      <div className="flex flex-col gap-3">
        <h3 className="font-display text-3xl font-light text-ink">{room.name}</h3>
        {room.description && <p className="line-clamp-2 text-[0.95rem] leading-relaxed text-ink-soft">{room.description}</p>}
        <div className="mt-2 flex items-end justify-between gap-4 border-t border-line pt-4">
          <p className="text-sm text-ink-soft">
            From <span className="font-display text-2xl text-ink">{formatMoney(room.priceFrom, currency)}</span>
            {unit && <span> / {unit}</span>}
            {!room.pricesIncludeTax && <span className="block text-[0.7rem] uppercase tracking-[0.16em]">Excl. VAT</span>}
          </p>
          <span className="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-ink transition-colors group-hover:text-accent">Discover</span>
        </div>
      </div>
    </Link>
  );
}
