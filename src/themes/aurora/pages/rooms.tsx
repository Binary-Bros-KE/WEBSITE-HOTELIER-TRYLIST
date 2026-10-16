import Link from "next/link";

import { formatMoney, unitLabel } from "@/engine/format";
import { safeImage } from "@/engine/safe";
import { mealPlanLabel, reserveLinks, staySummary } from "@/engine/stay";
import type { StayState, ThemePages } from "@/engine/theme";
import type { RoomAvailability, RoomType, Site, StaySearch } from "@/engine/types";
import { ContactButtons } from "../ContactButtons";
import { RoomCard } from "../RoomCard";
import { StayForm } from "../StayForm";
import { ArrowLink, Container, cx, Section, SectionHeading } from "../ui";

const searchQuery = (s: StaySearch | null) => (s ? `?${new URLSearchParams({ checkIn: s.checkIn, checkOut: s.checkOut, guests: String(s.guests) })}` : "");

function AvailabilityTag({ availability }: { availability: RoomAvailability | undefined }) {
  if (!availability) return null;
  const { available, fitsGuests, roomsLeft } = availability;
  const text = !fitsGuests ? "Too small for your party" : !available ? "Fully booked for these dates" : roomsLeft ? `Only ${roomsLeft} left` : "Available";
  return (
    <span className={cx("inline-flex items-center gap-2 text-[0.68rem] font-medium uppercase tracking-[0.2em]", available ? "text-brand" : "text-ink-soft")}>
      <span aria-hidden className={cx("size-1.5 rounded-full", available ? "bg-brand" : "bg-ink-soft/50")} />
      {text}
    </span>
  );
}

function StayNotice({ stay, extra }: { stay: StayState; extra?: string }) {
  if (stay.error) return <p role="alert" className="border-l-2 border-accent bg-accent-soft px-5 py-4 text-sm text-ink">{stay.error}</p>;
  if (!stay.search) return null;
  return (
    <p className="text-sm text-ink-soft">
      <span className="font-display text-xl text-ink">{staySummary(stay.search)}</span>
      {extra && <span className="block pt-1">{extra}</span>}
    </p>
  );
}

function RoomRow({ site, room, search, availability, index }: { site: Site; room: RoomType; search: StaySearch | null; availability?: RoomAvailability; index: number }) {
  const cover = safeImage(room.imageUrls[0]);
  const unit = unitLabel(room.priceUnit);
  const bookable = !availability || availability.available;
  const href = `/rooms/${room.id}${searchQuery(search)}`;
  return (
    <li className={cx("grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-16", !bookable && "opacity-70")}>
      <Link href={href} className={cx("group relative block aspect-[4/3] overflow-hidden bg-stone", index % 2 === 1 && "lg:order-2")}>
        {cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt={room.name} loading={index < 2 ? "eager" : "lazy"} className="size-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-105" />
        )}
      </Link>
      <div className="flex flex-col justify-center gap-6">
        <div className="flex flex-col gap-3">
          <p className="aurora-eyebrow">Sleeps {room.capacity}</p>
          <h2 className="font-display text-4xl font-light text-ink"><Link href={href} className="transition-colors hover:text-brand">{room.name}</Link></h2>
          <AvailabilityTag availability={availability} />
        </div>
        {room.description && <p className="leading-relaxed text-ink-soft">{room.description}</p>}
        {room.amenities.length > 0 && (
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink">
            {room.amenities.slice(0, 6).map((a) => (
              <li key={a} className="flex items-center gap-2"><span aria-hidden className="size-1 rotate-45 bg-accent" />{a}</li>
            ))}
          </ul>
        )}
        <div className="flex flex-wrap items-end justify-between gap-6 border-t border-line pt-6">
          <p className="text-sm text-ink-soft">
            From <span className="font-display text-3xl text-ink">{formatMoney(room.priceFrom, site.currency)}</span>
            {unit && <span> / {unit}</span>}
            <span className="block pt-1 text-[0.7rem] uppercase tracking-[0.16em]">
              {search && bookable ? `${formatMoney(room.priceFrom * search.nights, site.currency)} for ${search.nights} night${search.nights === 1 ? "" : "s"}` : room.rates.length > 1 ? `${room.rates.length} rates` : ""}
              {!room.pricesIncludeTax && " · excl. VAT"}
            </span>
          </p>
          <ArrowLink href={href}>{bookable ? "View & reserve" : "View room"}</ArrowLink>
        </div>
      </div>
    </li>
  );
}

export const RoomsPage: ThemePages["rooms"] = ({ site, roomTypes, stay, availability }) => {
  const byId = new Map((availability ?? []).map((a) => [a.roomTypeId, a]));
  // With a search, rooms that can take the stay come first.
  const rooms = availability
    ? [...roomTypes].sort((a, b) => Number(byId.get(b.id)?.available ?? false) - Number(byId.get(a.id)?.available ?? false))
    : roomTypes;
  const availableCount = availability?.filter((a) => a.available).length ?? 0;

  return (
    <>
      {site.features.roomBooking && (
        <section className="border-b border-line bg-sand py-10">
          <Container className="flex flex-col gap-6">
            <StayForm action="/rooms" search={stay.search} className="bg-paper shadow-[0_1px_0_var(--line)]" />
            <StayNotice
              stay={stay}
              extra={availability ? (availableCount ? `${availableCount} of ${roomTypes.length} room types available` : "Nothing is free for these dates — try other dates or call us.") : undefined}
            />
          </Container>
        </section>
      )}
      <Section>
        <Container>
          {rooms.length === 0 ? (
            <p className="py-16 text-center font-display text-2xl text-ink-soft">Our rooms will be online soon — please call us to book.</p>
          ) : (
            <ul className="flex flex-col gap-24">
              {rooms.map((room, i) => <RoomRow key={room.id} site={site} room={room} search={stay.search} availability={byId.get(room.id)} index={i} />)}
            </ul>
          )}
        </Container>
      </Section>
    </>
  );
};

function Gallery({ room }: { room: RoomType }) {
  const images = room.imageUrls.map(safeImage).filter((u): u is string => Boolean(u)).slice(0, 5);
  if (images.length === 0) return null;
  const [first, ...rest] = images;
  return (
    <div className={cx("grid gap-3", rest.length > 0 && "lg:grid-cols-[2fr_1fr]")}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={first} alt={room.name} className="aspect-[4/3] w-full object-cover lg:aspect-auto lg:h-[34rem]" />
      {rest.length > 0 && (
        <div className={cx("grid gap-3", rest.length > 1 ? "grid-cols-2 lg:grid-cols-1 lg:grid-rows-2" : "")}>
          {rest.slice(0, 2).map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src + i} src={src} alt={`${room.name}, view ${i + 2}`} loading="lazy" className="aspect-[4/3] w-full object-cover lg:aspect-auto lg:h-full" />
          ))}
        </div>
      )}
    </div>
  );
}

export const RoomPage: ThemePages["room"] = ({ site, room, others, stay, availability }) => {
  const unit = unitLabel(room.priceUnit) ?? "night";
  const bookable = !availability || availability.available;
  const cheapest = room.rates[0];
  const links = reserveLinks(site, room.name, stay.search, cheapest ? { name: cheapest.name, price: cheapest.price } : undefined);

  return (
    <>
      <section className="bg-paper pb-12 pt-12 sm:pt-16">
        <Container className="flex flex-col gap-10">
          <div className="flex flex-col gap-4">
            <Link href="/rooms" className="aurora-eyebrow w-fit hover:text-brand">← Rooms & Suites</Link>
            <h1 className="font-display text-5xl font-light leading-[1.05] text-ink sm:text-6xl">{room.name}</h1>
            <p className="text-sm uppercase tracking-[0.2em] text-ink-soft">Sleeps {room.capacity} · from {formatMoney(room.priceFrom, site.currency)} / {unit}</p>
          </div>
          <Gallery room={room} />
        </Container>
      </section>

      <Section className="!pt-8">
        <Container className="grid gap-16 lg:grid-cols-[1fr_24rem]">
          <div className="flex flex-col gap-14">
            {room.description && <p className="font-display text-2xl font-light leading-relaxed text-ink">{room.description}</p>}

            {room.amenities.length > 0 && (
              <div className="flex flex-col gap-5">
                <h2 className="aurora-eyebrow">In the room</h2>
                <ul className="grid gap-x-8 gap-y-3 border-y border-line py-6 sm:grid-cols-2">
                  {room.amenities.map((a) => (
                    <li key={a} className="flex items-center gap-3 text-ink"><span aria-hidden className="size-1 rotate-45 bg-accent" />{a}</li>
                  ))}
                </ul>
              </div>
            )}

            {room.rates.length > 0 && (
              <div className="flex flex-col gap-5">
                <h2 className="aurora-eyebrow">Rates</h2>
                <ul className="divide-y divide-line border-y border-line">
                  {room.rates.map((rate) => (
                    <li key={rate.id} className="flex flex-wrap items-baseline justify-between gap-4 py-5">
                      <span>
                        <span className="block font-display text-2xl text-ink">{rate.name}</span>
                        {mealPlanLabel(rate.mealPlan) && <span className="text-sm text-ink-soft">{mealPlanLabel(rate.mealPlan)}</span>}
                      </span>
                      <span className="text-right">
                        <span className="font-display text-2xl text-ink">{formatMoney(rate.price, site.currency)}</span>
                        <span className="text-sm text-ink-soft"> / {unitLabel(rate.unit) ?? unit}</span>
                        {stay.search && <span className="block text-xs uppercase tracking-[0.14em] text-ink-soft">{formatMoney(rate.price * stay.search.nights, site.currency)} for {stay.search.nights} night{stay.search.nights === 1 ? "" : "s"}</span>}
                      </span>
                    </li>
                  ))}
                </ul>
                {!room.pricesIncludeTax && <p className="text-xs uppercase tracking-[0.16em] text-ink-soft">Rates exclude VAT</p>}
              </div>
            )}
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="border border-line bg-sand">
              <div className="border-b border-line px-6 py-5">
                <p className="aurora-eyebrow">Plan your stay</p>
                <p className="pt-2 font-display text-3xl text-ink">{formatMoney(room.priceFrom, site.currency)} <span className="font-sans text-sm text-ink-soft">/ {unit}</span></p>
              </div>
              {site.features.roomBooking && <StayForm action={`/rooms/${room.id}`} search={stay.search} layout="stacked" />}
              <div className="flex flex-col gap-4 border-t border-line px-6 py-6">
                {stay.error && <p role="alert" className="text-sm text-ink">{stay.error}</p>}
                {stay.search && availability && <AvailabilityTag availability={availability} />}
                {bookable && site.features.roomBooking && stay.search ? (
                  <>
                    <a
                      href={`/book/room?${new URLSearchParams({ roomTypeId: room.id, checkIn: stay.search.checkIn, checkOut: stay.search.checkOut, guests: String(stay.search.guests), ...(cheapest ? { rateId: cheapest.id } : {}) })}`}
                      className="inline-flex items-center justify-center bg-brand px-6 py-4 text-[0.7rem] font-medium uppercase tracking-[0.24em] text-paper transition-colors hover:bg-brand-deep"
                    >
                      Book now
                    </a>
                    <p className="pt-2 text-xs uppercase tracking-[0.16em] text-ink-soft">Or reach us directly</p>
                    <ContactButtons links={links.map((l) => (l.kind === "whatsapp" ? { ...l, label: "WhatsApp us" } : l))} stacked quiet />
                  </>
                ) : bookable && site.features.roomBooking ? (
                  <p className="text-sm leading-relaxed text-ink-soft">Choose your dates above to book online.</p>
                ) : bookable ? (
                  <ContactButtons links={links} stacked />
                ) : (
                  <p className="text-sm leading-relaxed text-ink-soft">This room is taken for those dates. Try other dates, or <Link href={`/rooms${searchQuery(stay.search)}`} className="text-ink underline underline-offset-4">see what's free</Link>.</p>
                )}
              </div>
            </div>
          </aside>
        </Container>
      </Section>

      {others.length > 0 && (
        <Section tone="sand">
          <Container className="flex flex-col gap-16">
            <SectionHeading eyebrow="Stay" title="Other rooms" />
            <ul className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {others.slice(0, 3).map((other) => <li key={other.id}><RoomCard room={other} currency={site.currency} query={searchQuery(stay.search)} /></li>)}
            </ul>
          </Container>
        </Section>
      )}
    </>
  );
};
