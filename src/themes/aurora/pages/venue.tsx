import { formatDuration, formatMoney, formatPhone, telHref, whatsappHref } from "@/engine/format";
import { safeHref, safeImage, safeMapEmbed } from "@/engine/safe";
import { contactLinks } from "@/engine/stay";
import type { ThemePages } from "@/engine/theme";
import type { MenuItem } from "@/engine/types";
import { ContactButtons } from "../ContactButtons";
import { InquiryForm } from "../ServiceForms";
import { SocialIcon } from "../icons";
import { Container, cx, Section } from "../ui";

const anchor = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function Empty({ children }: { children: string }) {
  return <p className="py-16 text-center font-display text-2xl text-ink-soft">{children}</p>;
}

function Dish({ item, currency }: { item: MenuItem; currency: string }) {
  return (
    <li className={cx("break-inside-avoid py-4", !item.isAvailable && "opacity-50")}>
      <div className="flex items-baseline">
        <span className="font-display text-xl text-ink">{item.name}</span>
        {item.isVegetarian && <span title="Vegetarian" className="ml-2 text-[0.6rem] uppercase tracking-[0.2em] text-accent">V</span>}
        {item.variants.length === 0 && (
          <>
            <span aria-hidden className="aurora-leader" />
            <span className="whitespace-nowrap text-sm tracking-wide text-ink">{formatMoney(item.price, currency)}</span>
          </>
        )}
      </div>
      {item.description && <p className="mt-1 text-sm leading-relaxed text-ink-soft">{item.description}</p>}
      {item.variants.length > 0 && (
        <ul className="mt-1.5 space-y-1 pl-4">
          {item.variants.map((v) => (
            <li key={v.id} className="flex items-baseline text-sm text-ink-soft">
              <span>{v.name}</span>
              <span aria-hidden className="aurora-leader" />
              <span className="whitespace-nowrap text-ink">{formatMoney(v.price, currency)}</span>
            </li>
          ))}
        </ul>
      )}
      {!item.isAvailable && <p className="mt-1 text-[0.65rem] uppercase tracking-[0.2em] text-ink-soft">Not available today</p>}
    </li>
  );
}

export const DiningPage: ThemePages["dining"] = ({ site, menu }) => {
  const categories = menu.filter((c) => c.menuItems.length > 0);
  if (categories.length === 0) return <Section><Container><Empty>Our menu will be online soon.</Empty></Container></Section>;
  return (
    <>
      {/* Category index, pinned under the header while scrolling the menu. */}
      <nav aria-label="Menu sections" className="sticky top-20 z-30 border-b border-line bg-paper/95 backdrop-blur lg:top-20">
        <Container>
          <ul className="-mx-2 flex gap-1 overflow-x-auto py-3 [scrollbar-width:none]">
            {categories.map((c) => (
              <li key={c.id} className="shrink-0">
                <a href={`#${anchor(c.name)}`} className="block px-3 py-2 text-[0.68rem] font-medium uppercase tracking-[0.2em] text-ink-soft transition-colors hover:text-ink">{c.name}</a>
              </li>
            ))}
          </ul>
        </Container>
      </nav>
      <Section className="!pt-16">
        <Container className="flex flex-col gap-20">
          {categories.map((category, i) => {
            const image = safeImage(category.imageUrl);
            return (
              <section key={category.id} id={anchor(category.name)} className="scroll-mt-40">
                <div className={cx("grid gap-10", image && "lg:grid-cols-[1fr_2fr] lg:gap-16")}>
                  <header className={cx("flex flex-col gap-4", image && i % 2 === 1 && "lg:order-2")}>
                    <h2 className="font-display text-4xl font-light italic text-ink">{category.name}</h2>
                    <span aria-hidden className="h-px w-16 bg-accent" />
                    {category.description && <p className="leading-relaxed text-ink-soft">{category.description}</p>}
                    {image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={image} alt={category.name} loading="lazy" className="mt-4 aspect-[4/3] w-full object-cover" />
                    )}
                  </header>
                  <ul className={cx("gap-x-16", image ? "" : "sm:columns-2")}>
                    {category.menuItems.map((item) => <Dish key={item.id} item={item} currency={site.currency} />)}
                  </ul>
                </div>
              </section>
            );
          })}
          <p className="text-center text-xs uppercase tracking-[0.2em] text-ink-soft">Please let us know about any allergies · V — vegetarian</p>
        </Container>
      </Section>
    </>
  );
};

export const ServicesPage: ThemePages["services"] = ({ site, categories }) => {
  const shown = categories.filter((c) => c.services.length > 0);
  if (shown.length === 0) return <Section><Container><Empty>Our services will be online soon.</Empty></Container></Section>;
  return (
    <Section>
      <Container className="flex flex-col gap-24">
        {shown.map((category) => (
          <section key={category.id} className="flex flex-col gap-10">
            <header className="flex items-center gap-6">
              <h2 className="font-display text-4xl font-light italic text-ink">{category.name}</h2>
              <span aria-hidden className="h-px flex-1 bg-line" />
            </header>
            <ul className="grid gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {category.services.map((service) => {
                const image = safeImage(service.imageUrl);
                const duration = formatDuration(service.durationMinutes);
                const links = contactLinks(site, `Booking — ${service.name}`, `Hello ${site.name}, I would like to book: ${service.name}.`, "Book on WhatsApp");
                return (
                  <li key={service.id} className="flex flex-col gap-5">
                    {image && (
                      <div className="aspect-[3/2] overflow-hidden bg-stone">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={image} alt={service.name} loading="lazy" className="size-full object-cover" />
                      </div>
                    )}
                    <div className="flex flex-col gap-2">
                      <h3 className="font-display text-3xl font-light text-ink">{service.name}</h3>
                      {duration && <p className="aurora-eyebrow !text-ink-soft">{duration}</p>}
                    </div>
                    {service.description && <p className="leading-relaxed text-ink-soft">{service.description}</p>}
                    <ul className="border-y border-line">
                      {service.variants.length > 0 ? service.variants.map((v) => (
                        <li key={v.id} className="flex items-baseline py-2.5 text-sm">
                          <span className="text-ink">{v.name}{v.durationMinutes ? <span className="text-ink-soft"> · {formatDuration(v.durationMinutes)}</span> : null}</span>
                          <span aria-hidden className="aurora-leader" />
                          <span className="whitespace-nowrap text-ink">{formatMoney(v.price, site.currency)}</span>
                        </li>
                      )) : (
                        <li className="flex items-baseline py-2.5 text-sm">
                          <span className="text-ink-soft">Price</span>
                          <span aria-hidden className="aurora-leader" />
                          <span className="font-display text-xl text-ink">{formatMoney(service.price, site.currency)}</span>
                        </li>
                      )}
                    </ul>
                    {service.bookableOnline ? (
                      <a href={`/book/service/${service.id}`} className="mt-auto w-fit bg-brand px-6 py-3.5 text-[0.68rem] font-medium uppercase tracking-[0.22em] text-paper transition-colors hover:bg-brand-deep">
                        Book online
                      </a>
                    ) : links[0] && (
                      <a href={links[0].href} target={links[0].kind === "whatsapp" ? "_blank" : undefined} rel="noopener noreferrer" className="mt-auto text-[0.68rem] font-medium uppercase tracking-[0.22em] text-ink underline decoration-accent underline-offset-8 hover:text-brand">
                        {links[0].kind === "whatsapp" ? "Book on WhatsApp" : links[0].label}
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </Container>
    </Section>
  );
};

export const MembershipsPage: ThemePages["memberships"] = ({ site, plans }) => {
  if (plans.length === 0) return <Section><Container><Empty>Membership plans will be online soon.</Empty></Container></Section>;
  return (
    <Section tone="sand">
      <Container>
        <ul className={cx("mx-auto grid gap-6", plans.length >= 3 ? "lg:grid-cols-3" : "max-w-4xl sm:grid-cols-2")}>
          {plans.map((plan) => {
            const links = contactLinks(site, `Membership — ${plan.name}`, `Hello ${site.name}, I would like to join the ${plan.name} membership.`, "Join on WhatsApp");
            const perks = [...plan.highlights, ...(plan.discountPercent > 0 ? [`${plan.discountPercent}% off services`] : []), ...(plan.visitLimit ? [`Up to ${plan.visitLimit} visits`] : [])];
            return (
              <li key={plan.id} className="flex flex-col gap-7 border border-line bg-paper p-10 text-center">
                <h2 className="font-display text-3xl font-light text-ink">{plan.name}</h2>
                <p className="font-display text-5xl font-light text-ink">
                  {formatMoney(plan.price, site.currency)}
                  <span className="block pt-3 font-sans text-xs uppercase tracking-[0.2em] text-ink-soft">for {plan.durationDays} days</span>
                </p>
                {plan.description && <p className="text-sm leading-relaxed text-ink-soft">{plan.description}</p>}
                {perks.length > 0 && (
                  <ul className="space-y-3 border-t border-line pt-7 text-sm text-ink">
                    {perks.map((p) => <li key={p}>{p}</li>)}
                  </ul>
                )}
                <ContactButtons links={links.slice(0, 1)} className="mt-auto justify-center" />
              </li>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
};

export const ContactPage: ThemePages["contact"] = ({ site, inquiryAction }) => {
  const c = site.contact;
  const map = safeMapEmbed(c.mapEmbedUrl);
  const address = [c.address, c.city, c.county, c.country].map((p) => p?.trim().replace(/[.,;s]+$/, "")).filter((p): p is string => Boolean(p));
  const rows: { label: string; value: string; href?: string; external?: boolean }[] = [];
  if (c.phone) rows.push({ label: "Telephone", value: formatPhone(c.phone), href: telHref(c.phone) });
  if (c.alternativePhone) rows.push({ label: "Also", value: formatPhone(c.alternativePhone), href: telHref(c.alternativePhone) });
  if (c.whatsapp) rows.push({ label: "WhatsApp", value: formatPhone(c.whatsapp), href: whatsappHref(c.whatsapp), external: true });
  if (c.email) rows.push({ label: "Email", value: c.email, href: `mailto:${c.email}` });
  const socials = Object.entries(site.social ?? {}).filter(([, url]) => safeHref(url));
  const directions = c.latitude != null && c.longitude != null
    ? `https://www.google.com/maps/dir/?api=1&destination=${c.latitude},${c.longitude}`
    : address.length ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([site.name, ...address].join(", "))}` : null;

  return (
    <Section>
      <Container className={cx("grid gap-16", map && "lg:grid-cols-[0.9fr_1.1fr] lg:gap-20")}>
        <div className="flex flex-col gap-12">
          {address.length > 0 && (
            <div className="flex flex-col gap-4">
              <h2 className="aurora-eyebrow">Address</h2>
              <address className="font-display text-3xl font-light not-italic leading-snug text-ink">
                {address.map((line) => <span key={line} className="block">{line}</span>)}
              </address>
              {directions && <a href={directions} target="_blank" rel="noopener noreferrer" className="w-fit text-[0.68rem] font-medium uppercase tracking-[0.22em] text-ink underline decoration-accent underline-offset-8 hover:text-brand">Get directions</a>}
            </div>
          )}
          {rows.length > 0 && (
            <dl className="divide-y divide-line border-y border-line">
              {rows.map((row) => (
                <div key={row.label} className="grid gap-1 py-5 sm:grid-cols-[8rem_1fr]">
                  <dt className="aurora-eyebrow pt-1">{row.label}</dt>
                  <dd className="font-display text-xl text-ink">
                    {row.href ? <a href={row.href} target={row.external ? "_blank" : undefined} rel={row.external ? "noopener noreferrer" : undefined} className="transition-colors hover:text-accent">{row.value}</a> : row.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
          <ContactButtons links={contactLinks(site, `Enquiry — ${site.name}`, `Hello ${site.name}, `)} />
          {inquiryAction && (
            <div className="flex flex-col gap-8 border-t border-line pt-12">
              <h2 className="font-display text-3xl font-light text-ink">Send us a message</h2>
              <InquiryForm action={inquiryAction} sourcePage="/contact" />
            </div>
          )}
          {socials.length > 0 && (
            <ul className="flex gap-3">
              {socials.map(([name, url]) => (
                <li key={name}>
                  <a href={safeHref(url)!} target="_blank" rel="noopener noreferrer" aria-label={name} className="flex size-11 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-accent hover:text-accent">
                    <SocialIcon name={name} className="size-4" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
        {map && (
          <div className="relative min-h-[28rem] overflow-hidden bg-stone">
            <iframe src={map} title={`Map showing ${site.name}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="aurora-map absolute inset-0 size-full border-0" />
          </div>
        )}
      </Container>
    </Section>
  );
};
