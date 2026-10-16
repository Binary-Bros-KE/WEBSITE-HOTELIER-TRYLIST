import Link from "next/link";
import type { SectionComponentProps } from "@/engine/theme";
import { responsiveImage } from "@/engine/img";
import { paragraphs } from "@/engine/format";
import { safeHref, safeImage } from "@/engine/safe";
import { AmenityIcon } from "../icons";
import { ArrowLink, ButtonLink, Container, cx, Section, SectionHeading } from "../ui";

export function RichText({ props }: SectionComponentProps<"rich-text">) {
  const center = props.align === "center";
  return (
    <Section className={props.compact ? "!py-10 sm:!py-14" : undefined}>
      <Container narrow className={cx("flex flex-col gap-10", center ? "items-center text-center" : "items-start")}>
        <SectionHeading eyebrow={props.eyebrow} title={props.title} intro={props.intro} align={props.align} />
        <div className="space-y-6 text-[1.0625rem] leading-[1.85] text-ink-soft">
          {paragraphs(props.body).map((p, i) => (
            <p key={i} className={cx(i === 0 && center && "font-display text-2xl font-light italic leading-relaxed text-ink")}>{p}</p>
          ))}
        </div>
        {props.signature && <p className="aurora-eyebrow !text-ink-soft">{props.signature}</p>}
      </Container>
    </Section>
  );
}

export function ImageText({ props }: SectionComponentProps<"image-text">) {
  const src = safeImage(props.image?.url);
  const imageRight = props.imageSide === "right";
  return (
    <Section tone={props.tone}>
      <Container className="grid items-center gap-14 lg:grid-cols-2 lg:gap-24">
        {src && (
          <div className={cx("relative", imageRight && "lg:order-2")}>
            <div aria-hidden className={cx("absolute -bottom-5 hidden h-full w-full border border-accent/50 lg:block", imageRight ? "-left-5" : "-right-5")} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img {...responsiveImage(src, "(min-width: 1024px) 50vw, 100vw")} alt={props.image?.alt ?? ""} loading="lazy" className="relative aspect-[4/3] w-full object-cover lg:aspect-square" />
          </div>
        )}
        <div className="flex flex-col items-start gap-8">
          <SectionHeading eyebrow={props.eyebrow} title={props.title} intro={props.intro} align="left" />
          <div className="space-y-5 text-[1.0625rem] leading-[1.85] text-ink-soft">
            {paragraphs(props.body).map((p, i) => <p key={i}>{p}</p>)}
          </div>
          {props.bullets.length > 0 && (
            <ul className="grid w-full gap-x-8 gap-y-3 border-y border-line py-6 sm:grid-cols-2">
              {props.bullets.map((b) => (
                <li key={b} className="flex items-center gap-3 text-sm text-ink">
                  <span aria-hidden className="size-1 rotate-45 bg-accent" />
                  {b}
                </li>
              ))}
            </ul>
          )}
          {props.cta && <ArrowLink href={props.cta.href}>{props.cta.label}</ArrowLink>}
        </div>
      </Container>
    </Section>
  );
}

export function Amenities({ props }: SectionComponentProps<"amenities">) {
  const dark = props.tone === "dark";
  return (
    <Section tone={props.tone}>
      <Container className="flex flex-col gap-16">
        <SectionHeading eyebrow={props.eyebrow} title={props.title} intro={props.intro} light={dark} />
        <ul className={cx("grid gap-px sm:grid-cols-2 lg:grid-cols-4", dark ? "bg-paper/10" : "bg-line")}>
          {props.items.map((item) => (
            <li key={item.title} className={cx("flex flex-col items-center gap-4 px-6 py-10 text-center", dark ? "bg-brand-deep" : props.tone === "sand" ? "bg-sand" : "bg-paper")}>
              <AmenityIcon name={item.icon} className="size-9 text-accent" />
              <h3 className={cx("font-display text-2xl font-normal", dark ? "text-paper" : "text-ink")}>{item.title}</h3>
              {item.text && <p className={cx("max-w-[16rem] text-sm leading-relaxed", dark ? "text-paper/70" : "text-ink-soft")}>{item.text}</p>}
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

export function Gallery({ props }: SectionComponentProps<"gallery">) {
  const images = props.images.map((img) => ({ ...img, url: safeImage(img.url) })).filter((img) => img.url);
  if (images.length === 0) return null;
  return (
    <Section>
      <Container className="flex flex-col gap-16">
        <SectionHeading eyebrow={props.eyebrow} title={props.title} intro={props.intro} />
        <ul className="grid auto-rows-[14rem] grid-cols-2 gap-3 sm:auto-rows-[18rem] lg:grid-cols-4">
          {images.map((img, i) => (
            <li
              key={`${img.url}-${i}`}
              // Repeating 6-tile pattern that fills whole rows on both the
              // 2-column (mobile) and 4-column (desktop) grid.
              className={cx(
                "group relative overflow-hidden bg-stone",
                i % 6 === 0 && "col-span-2 row-span-2",
                (i % 6 === 3 || i % 6 === 4) && "lg:col-span-2",
                i % 6 === 5 && "col-span-2",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img {...responsiveImage(img.url!, i % 6 === 0 ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw")} alt={img.alt} loading="lazy" className="size-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105" />
              {img.caption && (
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-5 font-display text-xl italic text-white opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  {img.caption}
                </span>
              )}
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

export function Testimonials({ props }: SectionComponentProps<"testimonials">) {
  if (props.items.length === 0) return null;
  return (
    <Section tone="sand">
      <Container className="flex flex-col gap-16">
        <SectionHeading eyebrow={props.eyebrow} title={props.title} intro={props.intro} />
        <ul className={cx("grid gap-12", props.items.length > 1 && "lg:grid-cols-3")}>
          {props.items.map((t) => (
            <li key={`${t.author}-${t.quote.slice(0, 20)}`}>
              <figure className="flex h-full flex-col items-center gap-6 text-center">
                <span aria-hidden className="font-display text-6xl leading-none text-accent">“</span>
                <blockquote className="font-display text-2xl font-light italic leading-relaxed text-ink">{t.quote}</blockquote>
                <figcaption className="mt-auto text-xs uppercase tracking-[0.24em] text-ink-soft">
                  {t.author}{t.origin && <span className="text-ink-soft/70"> · {t.origin}</span>}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

export function Faq({ props }: SectionComponentProps<"faq">) {
  if (props.items.length === 0) return null;
  return (
    <Section>
      <Container narrow className="flex flex-col gap-14">
        <SectionHeading eyebrow={props.eyebrow} title={props.title} intro={props.intro} />
        <div className="border-t border-line">
          {props.items.map((item) => (
            <details key={item.question} className="group border-b border-line">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 font-display text-xl text-ink [&::-webkit-details-marker]:hidden">
                {item.question}
                <span aria-hidden className="relative size-3 shrink-0">
                  <span className="absolute inset-x-0 top-1/2 h-px bg-accent" />
                  <span className="absolute inset-y-0 left-1/2 w-px bg-accent transition-transform duration-300 group-open:scale-y-0" />
                </span>
              </summary>
              <div className="space-y-4 pb-7 leading-relaxed text-ink-soft">
                {paragraphs(item.answer).map((p, i) => <p key={i}>{p}</p>)}
              </div>
            </details>
          ))}
        </div>
      </Container>
    </Section>
  );
}

export function CallToAction({ props }: SectionComponentProps<"cta">) {
  const src = safeImage(props.image?.url);
  return (
    <section className="relative isolate overflow-hidden bg-brand-deep py-32 text-white sm:py-40">
      {src && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img {...responsiveImage(src, "100vw")} alt="" loading="lazy" className="absolute inset-0 -z-20 size-full object-cover" />
          <div aria-hidden className="absolute inset-0 -z-10 bg-brand-deep/80" />
        </>
      )}
      <Container narrow className="flex flex-col items-center gap-10 text-center">
        <SectionHeading eyebrow={props.eyebrow} title={props.title} intro={props.intro} light />
        {(props.primaryCta || props.secondaryCta) && (
          <div className="flex flex-wrap justify-center gap-4">
            {props.primaryCta && <ButtonLink href={props.primaryCta.href} variant="light">{props.primaryCta.label}</ButtonLink>}
            {props.secondaryCta && <ButtonLink href={props.secondaryCta.href} variant="ghost-light">{props.secondaryCta.label}</ButtonLink>}
          </div>
        )}
      </Container>
    </section>
  );
}

/** One card per kind of guest — each a single clear next step. */
export function Pathways({ props }: SectionComponentProps<"pathways">) {
  const items = props.items.filter((item) => safeHref(item.link.href));
  if (items.length === 0) return null;
  return (
    <Section>
      <Container className="flex flex-col gap-14">
        <SectionHeading eyebrow={props.eyebrow} title={props.title} intro={props.intro} />
        <ul className={cx("grid grid-cols-2 gap-3 sm:gap-5", items.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3")}>
          {items.map((item) => {
            const image = safeImage(item.image?.url);
            return (
              <li key={item.title}>
                <Link href={safeHref(item.link.href)!} className="group relative flex aspect-[3/4] flex-col justify-end overflow-hidden bg-brand-deep text-white">
                  {image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img {...responsiveImage(image, "(min-width: 1024px) 25vw, 50vw")} alt={item.image?.alt ?? ""} loading="lazy" className="absolute inset-0 size-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-105" />
                  )}
                  <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                  <span className="relative flex flex-col gap-2 p-4 sm:p-6">
                    <span className="font-display text-2xl font-light sm:text-3xl">{item.title}</span>
                    {item.text && <span className="hidden text-sm leading-relaxed text-white/85 sm:block">{item.text}</span>}
                    <span className="pt-1 text-[0.62rem] font-medium uppercase tracking-[0.22em] text-white/90 underline decoration-white/40 underline-offset-8 transition-colors group-hover:decoration-white sm:text-[0.68rem]">
                      {item.link.label}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}
