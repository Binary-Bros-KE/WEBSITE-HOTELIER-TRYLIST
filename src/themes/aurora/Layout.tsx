import Link from "next/link";
import type { ReactNode } from "react";

import { navFor } from "@/engine/defaults";
import { formatPhone, joinAddress, telHref, whatsappHref } from "@/engine/format";
import { safeHref, safeImage } from "@/engine/safe";
import type { Site } from "@/engine/types";
import { Header } from "./Header";
import { SocialIcon } from "./icons";
import { Container, Ornament } from "./ui";

const hrefFor = (slug: string) => (slug === "home" ? "/" : `/${slug}`);

function addressLine(site: Site): string | null {
  const c = site.contact;
  return joinAddress([c.address, c.city, c.country]) || null;
}

export function AuroraLayout({ site, children }: { site: Site; children: ReactNode }) {
  const nav = navFor(site).map((item) => ({ href: hrefFor(item.slug), label: item.title }));
  const cta = site.features.roomBooking
    ? { href: "/rooms", label: "Book your stay" }
    : site.features.inquiries ? { href: "/contact", label: "Enquire" } : null;
  const { phone, email, whatsapp } = site.contact;

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-paper focus:px-4 focus:py-2">
        Skip to content
      </a>
      <Header
        name={site.name}
        logoUrl={safeImage(site.branding.logoUrl)}
        nav={nav}
        cta={cta}
        topBar={{ address: addressLine(site), phone: phone ? formatPhone(phone) : null, phoneHref: phone ? telHref(phone) : null, email }}
      />
      <main id="main" className="aurora-main">{children}</main>
      <Footer site={site} nav={nav} />
      {whatsapp && (
        <a
          href={whatsappHref(whatsapp)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with us on WhatsApp"
          className="fixed bottom-5 right-5 z-40 flex size-12 items-center justify-center rounded-full bg-brand text-paper shadow-[0_8px_30px_rgb(0_0_0/0.18)] transition-transform hover:scale-105"
        >
          <SocialIcon name="whatsapp" className="size-5" />
        </a>
      )}
    </>
  );
}

function Footer({ site, nav }: { site: Site; nav: { href: string; label: string }[] }) {
  const c = site.contact;
  const socials = Object.entries(site.social ?? {}).filter(([, url]) => safeHref(url));
  const year = new Date().getFullYear();

  return (
    <footer className="bg-brand-deep text-paper/75">
      <Container className="py-20">
        <div className="flex flex-col items-center gap-6 text-center">
          <p className="font-display text-3xl font-light text-paper sm:text-4xl">{site.name}</p>
          {site.branding.tagline && <p className="max-w-xl text-sm leading-relaxed">{site.branding.tagline}</p>}
          <Ornament light />
        </div>

        <div className="mt-16 grid gap-12 text-sm sm:grid-cols-2 lg:grid-cols-4">
          {(c.address || c.city || c.country) && <div>
            <h2 className="aurora-eyebrow mb-5">Visit</h2>
            <address className="not-italic leading-relaxed">
              {c.address && <p>{c.address}</p>}
              <p>{[c.city, c.county].filter(Boolean).join(", ")}</p>
              {c.country && <p>{c.country}</p>}
            </address>
          </div>}

          {(c.phone || c.alternativePhone || c.email) && <div>
            <h2 className="aurora-eyebrow mb-5">Contact</h2>
            <ul className="space-y-2">
              {c.phone && <li><a href={telHref(c.phone)} className="transition-colors hover:text-paper">{formatPhone(c.phone)}</a></li>}
              {c.alternativePhone && <li><a href={telHref(c.alternativePhone)} className="transition-colors hover:text-paper">{formatPhone(c.alternativePhone)}</a></li>}
              {c.email && <li><a href={`mailto:${c.email}`} className="transition-colors hover:text-paper">{c.email}</a></li>}
            </ul>
          </div>}

          <div>
            <h2 className="aurora-eyebrow mb-5">Explore</h2>
            <ul className="space-y-2">
              {nav.map((item) => (
                <li key={item.href}><Link href={item.href} className="transition-colors hover:text-paper">{item.label}</Link></li>
              ))}
            </ul>
          </div>

          {socials.length > 0 && (
            <div>
              <h2 className="aurora-eyebrow mb-5">Follow</h2>
              <ul className="flex gap-3">
                {socials.map(([name, url]) => (
                  <li key={name}>
                    <a
                      href={safeHref(url)!}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={name}
                      className="flex size-10 items-center justify-center rounded-full border border-paper/20 transition-colors hover:border-accent hover:text-accent"
                    >
                      <SocialIcon name={name} className="size-4" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Container>

      <div className="border-t border-paper/10">
        <Container className="flex flex-col items-center justify-between gap-3 py-6 text-[0.7rem] tracking-[0.12em] sm:flex-row">
          <p>© {year} {site.name}</p>
          <p className="flex gap-6">
            <Link href="/privacy" className="transition-colors hover:text-paper">Privacy</Link>
            <span className="text-paper/45">Powered by Hotelier</span>
          </p>
        </Container>
      </div>
    </footer>
  );
}
