import Link from "next/link";

import { getMemberships, getMenu, getRoomTypes, getServices } from "@/engine/api";
import { formatDuration, formatMoney, telHref, unitLabel } from "@/engine/format";
import { safeImage, safeMapEmbed } from "@/engine/safe";
import type { SectionComponentProps } from "@/engine/theme";
import type { MenuItem } from "@/engine/types";
import { ArrowLink, ButtonLink, Container, cx, Section, SectionHeading } from "../ui";

// Sections fed by the tenant's live data. Each one renders nothing when its
// feature is off or there's nothing to show, so a page never shows an empty
// shell.

export async function RoomsShowcase({ props, site }: SectionComponentProps<"rooms-showcase">) {
  if (!site.features.rooms) return null;
  const all = await getRoomTypes();
  const picked = props.roomTypeIds.length > 0
    ? props.roomTypeIds.map((id) => all.find((t) => t.id === id)).filter((t) => t !== undefined)
    : all;
  const rooms = picked.slice(0, props.limit);
  if (rooms.length === 0) return null;

  return (
    <Section>
      <Container className="flex flex-col gap-16">
        <SectionHeading eyebrow={props.eyebrow} title={props.title} intro={props.intro} />
        <ul className={cx("grid gap-x-8 gap-y-14 sm:grid-cols-2", rooms.length >= 3 && "lg:grid-cols-3")}>
          {rooms.map((room) => {
            const cover = safeImage(room.imageUrls[0]);
            const unit = unitLabel(room.priceUnit);
            return (
              <li key={room.id}>
                <Link href={`/rooms/${room.id}`} className="group flex flex-col gap-6">
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
                        From <span className="font-display text-2xl text-ink">{formatMoney(room.priceFrom, site.currency)}</span>
                        {unit && <span> / {unit}</span>}
                        {!room.pricesIncludeTax && <span className="block text-[0.7rem] uppercase tracking-[0.16em]">Excl. VAT</span>}
                      </p>
                      <span className="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-ink transition-colors group-hover:text-accent">Discover</span>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
        {props.cta && <div className="flex justify-center"><ButtonLink href={props.cta.href} variant="outline">{props.cta.label}</ButtonLink></div>}
      </Container>
    </Section>
  );
}

function MenuLine({ item, currency }: { item: MenuItem; currency: string }) {
  const price = item.variants.length > 0 ? Math.min(...item.variants.map((v) => v.price)) : item.price;
  return (
    <li className={cx("py-3", !item.isAvailable && "opacity-50")}>
      <div className="flex items-baseline">
        <span className="font-display text-xl text-ink">{item.name}</span>
        {item.isVegetarian && <span title="Vegetarian" className="ml-2 text-[0.6rem] uppercase tracking-[0.2em] text-accent">V</span>}
        <span aria-hidden className="aurora-leader" />
        <span className="whitespace-nowrap text-sm tracking-wide text-ink">
          {item.variants.length > 0 && <span className="text-ink-soft">from </span>}
          {formatMoney(price, currency)}
        </span>
      </div>
      {item.description && <p className="mt-1 text-sm leading-relaxed text-ink-soft">{item.description}</p>}
    </li>
  );
}

export async function MenuHighlights({ props, site }: SectionComponentProps<"menu-highlights">) {
  if (!site.features.menu) return null;
  const menu = await getMenu();
  const wanted = props.categories.map((c) => c.toLowerCase());
  const categories = (wanted.length > 0
    ? wanted.map((name) => menu.find((c) => c.name.toLowerCase() === name)).filter((c) => c !== undefined)
    : menu.slice(0, 4)
  ).filter((c) => c.menuItems.length > 0);
  if (categories.length === 0) return null;

  return (
    <Section tone="sand">
      <Container className="flex flex-col gap-16">
        <SectionHeading eyebrow={props.eyebrow} title={props.title} intro={props.intro} />
        <div className="grid gap-x-20 gap-y-14 bg-paper px-6 py-14 shadow-[0_1px_0_var(--line)] sm:px-12 lg:grid-cols-2 lg:px-16">
          {categories.map((category) => (
            <div key={category.id}>
              <h3 className="mb-2 flex items-center gap-4 font-display text-3xl font-light italic text-ink">
                {category.name}
                <span aria-hidden className="h-px flex-1 bg-accent/40" />
              </h3>
              {category.description && <p className="mb-3 text-sm text-ink-soft">{category.description}</p>}
              <ul>
                {category.menuItems.slice(0, props.itemsPerCategory).map((item) => <MenuLine key={item.id} item={item} currency={site.currency} />)}
              </ul>
            </div>
          ))}
        </div>
        {props.cta && <div className="flex justify-center"><ButtonLink href={props.cta.href} variant="outline">{props.cta.label}</ButtonLink></div>}
      </Container>
    </Section>
  );
}

export async function ServicesShowcase({ props, site }: SectionComponentProps<"services-showcase">) {
  if (!site.features.services) return null;
  const categories = await getServices();
  const wanted = props.categories.map((c) => c.toLowerCase());
  const services = categories
    .filter((c) => wanted.length === 0 || wanted.includes(c.name.toLowerCase()))
    .flatMap((c) => c.services)
    .slice(0, props.limit);
  if (services.length === 0) return null;

  return (
    <Section>
      <Container className="flex flex-col gap-16">
        <SectionHeading eyebrow={props.eyebrow} title={props.title} intro={props.intro} />
        <ul className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const img = safeImage(service.imageUrl);
            const duration = formatDuration(service.durationMinutes ?? service.variants[0]?.durationMinutes);
            const price = service.variants.length > 0 ? Math.min(...service.variants.map((v) => v.price)) : service.price;
            return (
              <li key={service.id} className="flex flex-col gap-5">
                {img && (
                  <div className="aspect-[3/2] overflow-hidden bg-stone">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={service.name} loading="lazy" className="size-full object-cover" />
                  </div>
                )}
                <h3 className="font-display text-2xl font-light text-ink">{service.name}</h3>
                {service.description && <p className="line-clamp-3 text-[0.95rem] leading-relaxed text-ink-soft">{service.description}</p>}
                <p className="mt-auto flex items-center justify-between border-t border-line pt-4 text-sm text-ink-soft">
                  <span>{duration}</span>
                  <span className="font-display text-xl text-ink">{service.variants.length > 0 && <span className="font-sans text-sm text-ink-soft">from </span>}{formatMoney(price, site.currency)}</span>
                </p>
              </li>
            );
          })}
        </ul>
        {props.cta && <div className="flex justify-center"><ButtonLink href={props.cta.href} variant="outline">{props.cta.label}</ButtonLink></div>}
      </Container>
    </Section>
  );
}

export async function MembershipPlans({ props, site }: SectionComponentProps<"membership-plans">) {
  if (!site.features.memberships) return null;
  const plans = await getMemberships();
  if (plans.length === 0) return null;

  return (
    <Section tone="sand">
      <Container className="flex flex-col gap-16">
        <SectionHeading eyebrow={props.eyebrow} title={props.title} intro={props.intro} />
        <ul className={cx("mx-auto grid w-full gap-6", plans.length >= 3 ? "lg:grid-cols-3" : "max-w-4xl sm:grid-cols-2")}>
          {plans.map((plan) => (
            <li key={plan.id} className="flex flex-col gap-6 border border-line bg-paper p-10 text-center">
              <h3 className="font-display text-3xl font-light text-ink">{plan.name}</h3>
              <p className="font-display text-4xl text-ink">
                {formatMoney(plan.price, site.currency)}
                <span className="block pt-2 font-sans text-xs uppercase tracking-[0.2em] text-ink-soft">{plan.durationDays} days</span>
              </p>
              {plan.description && <p className="text-sm leading-relaxed text-ink-soft">{plan.description}</p>}
              {(plan.highlights.length > 0 || plan.discountPercent > 0 || plan.visitLimit) && (
                <ul className="space-y-3 border-t border-line pt-6 text-sm text-ink">
                  {plan.highlights.map((h) => <li key={h}>{h}</li>)}
                  {plan.discountPercent > 0 && <li>{plan.discountPercent}% off services</li>}
                  {plan.visitLimit && <li>Up to {plan.visitLimit} visits</li>}
                </ul>
              )}
            </li>
          ))}
        </ul>
        {props.cta && <div className="flex justify-center"><ArrowLink href={props.cta.href}>{props.cta.label}</ArrowLink></div>}
      </Container>
    </Section>
  );
}

export function ContactMap({ props, site }: SectionComponentProps<"contact-map">) {
  const c = site.contact;
  const map = props.showMap ? safeMapEmbed(c.mapEmbedUrl) : null;
  const rows: { label: string; value: string; href?: string }[] = [];
  const address = [c.address, c.city, c.country].filter(Boolean).join(", ");
  if (address) rows.push({ label: "Address", value: address });
  if (c.phone) rows.push({ label: "Telephone", value: c.phone, href: telHref(c.phone) });
  if (c.email) rows.push({ label: "Email", value: c.email, href: `mailto:${c.email}` });
  if (props.hours) rows.push({ label: "Hours", value: props.hours });

  return (
    <Section>
      <Container className={cx("grid items-stretch gap-14", map && "lg:grid-cols-[0.85fr_1.15fr] lg:gap-20")}>
        <div className="flex flex-col gap-10">
          <SectionHeading eyebrow={props.eyebrow} title={props.title} intro={props.intro} align="left" />
          <dl className="divide-y divide-line border-y border-line">
            {rows.map((row) => (
              <div key={row.label} className="grid gap-1 py-5 sm:grid-cols-[8rem_1fr]">
                <dt className="aurora-eyebrow pt-1">{row.label}</dt>
                <dd className="font-display text-xl text-ink">
                  {row.href ? <a href={row.href} className="transition-colors hover:text-accent">{row.value}</a> : row.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        {map && (
          <div className="relative min-h-[22rem] overflow-hidden bg-stone">
            <iframe
              src={map}
              title={`Map showing ${site.name}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="aurora-map absolute inset-0 size-full border-0"
            />
          </div>
        )}
      </Container>
    </Section>
  );
}
