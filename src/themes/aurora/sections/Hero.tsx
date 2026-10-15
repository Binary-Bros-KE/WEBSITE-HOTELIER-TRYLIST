import type { SectionComponentProps } from "@/engine/theme";
import { safeImage } from "@/engine/safe";
import { ButtonLink, Container, cx, Ornament } from "../ui";
import { HeroSlides } from "./HeroSlides";

/** Today in the property's timezone, as YYYY-MM-DD for date inputs. */
function todayIso(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Nairobi" }).format(new Date());
}

export function Hero({ props, site, index }: SectionComponentProps<"hero">) {
  const images = props.images
    .map((image) => ({ url: safeImage(image.url), alt: image.alt || site.name }))
    .filter((image): image is { url: string; alt: string } => Boolean(image.url));
  const showBookingBar = props.showBookingBar && site.features.roomBooking;
  const Title = index === 0 ? "h1" : "h2";

  return (
    <section
      className={cx(
        "relative isolate flex flex-col overflow-hidden bg-brand-deep text-white",
        props.height === "full" ? "min-h-[100svh]" : "min-h-[80svh]",
      )}
    >
      {/* Lets the header go transparent over the first hero (CSS :has). */}
      {index === 0 && <div data-hero-sentinel aria-hidden className="hidden" />}
      <HeroSlides images={images} />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-black/50 via-black/20 to-black/65" />

      <Container className="flex flex-1 flex-col items-center justify-center pb-16 pt-40 text-center">
        <div className="aurora-rise flex flex-col items-center gap-7">
          {props.eyebrow && <p className="aurora-eyebrow !text-white/85">{props.eyebrow}</p>}
          <Title className="max-w-4xl text-balance font-display text-5xl font-light leading-[1.02] tracking-[-0.015em] sm:text-7xl lg:text-[5.5rem]">
            {props.title || site.name}
          </Title>
          <Ornament light />
          {props.subtitle && <p className="max-w-xl text-lg font-light leading-relaxed text-white/85">{props.subtitle}</p>}
          {(props.primaryCta || props.secondaryCta) && (
            <div className="mt-3 flex flex-wrap justify-center gap-4">
              {props.primaryCta && <ButtonLink href={props.primaryCta.href} variant="light">{props.primaryCta.label}</ButtonLink>}
              {props.secondaryCta && <ButtonLink href={props.secondaryCta.href} variant="ghost-light">{props.secondaryCta.label}</ButtonLink>}
            </div>
          )}
        </div>
      </Container>

      {showBookingBar && <BookingBar />}
    </section>
  );
}

function BookingBar() {
  const today = todayIso();
  const field = "w-full border-0 border-b border-line bg-transparent px-0 pb-2 pt-1 font-display text-xl text-ink focus:border-accent focus:outline-none focus:ring-0";
  return (
    <Container className="relative pb-10 sm:pb-14">
      <form action="/rooms" method="get" className="grid gap-6 bg-paper/95 p-6 text-ink shadow-[0_20px_60px_rgb(0_0_0/0.25)] backdrop-blur sm:grid-cols-2 sm:p-8 lg:grid-cols-[1fr_1fr_0.7fr_auto] lg:items-end lg:gap-10">
        <label className="flex flex-col gap-2">
          <span className="aurora-eyebrow">Arrival</span>
          <input type="date" name="checkIn" min={today} required className={field} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="aurora-eyebrow">Departure</span>
          <input type="date" name="checkOut" min={today} required className={field} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="aurora-eyebrow">Guests</span>
          <select name="guests" defaultValue="2" className={field}>
            {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n} {n === 1 ? "guest" : "guests"}</option>)}
          </select>
        </label>
        <button type="submit" className="bg-brand px-8 py-4 text-[0.7rem] font-medium uppercase tracking-[0.24em] text-paper transition-colors duration-300 hover:bg-brand-deep sm:col-span-2 lg:col-span-1">
          Check availability
        </button>
      </form>
    </Container>
  );
}
