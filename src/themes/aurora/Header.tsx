"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { cx } from "./ui";

export type HeaderLink = { href: string; label: string };

type HeaderProps = {
  name: string;
  logoUrl: string | null;
  nav: HeaderLink[];
  cta: HeaderLink | null;
  topBar: { address: string | null; phone: string | null; phoneHref: string | null; email: string | null };
};

/**
 * Fixed header. Over a hero (any page with a [data-hero-sentinel]) it starts
 * transparent with white text — that's pure CSS (:has(), see globals.css), so
 * there's no flash before hydration. This component only marks it solid once
 * the hero scrolls away, and runs the mobile menu.
 */
export function Header({ name, logoUrl, nav, cta, topBar }: HeaderProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [openedAt, setOpenedAt] = useState(pathname);

  // Close the menu when navigation lands on a new page.
  if (open && openedAt !== pathname) setOpen(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => { document.documentElement.style.overflow = ""; };
  }, [open]);

  const solid = scrolled || open;
  const isActive = (href: string) => href !== "/" && (pathname === href || pathname.startsWith(`${href}/`));

  return (
    <header className="aurora-header fixed inset-x-0 top-0 z-50" data-solid={solid ? "" : undefined}>
      <div className="aurora-topbar hidden items-center lg:flex">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-8 px-8 text-[0.68rem] uppercase tracking-[0.22em]">
          <span className="opacity-80">{topBar.address}</span>
          <span className="flex items-center gap-8 opacity-80">
            {topBar.phone && topBar.phoneHref && <a href={topBar.phoneHref} className="hover:opacity-100">{topBar.phone}</a>}
            {topBar.email && <a href={`mailto:${topBar.email}`} className="normal-case tracking-[0.12em] hover:opacity-100">{topBar.email}</a>}
          </span>
        </div>
      </div>

      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-3" aria-label={`${name} — home`}>
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={name} className="aurora-logo h-12 w-auto object-contain" />
          ) : (
            <span className="font-display text-2xl font-normal tracking-wide">{name}</span>
          )}
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-9 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cx(
                "relative py-2 text-[0.7rem] font-medium uppercase tracking-[0.22em] transition-opacity hover:opacity-100",
                isActive(item.href) ? "opacity-100" : "opacity-80",
                "after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:after:scale-x-100",
                isActive(item.href) && "after:scale-x-100",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {cta && (
            <Link href={cta.href} className="aurora-header-cta hidden px-6 py-3 text-[0.68rem] font-medium uppercase tracking-[0.24em] transition-colors duration-300 sm:inline-flex">
              {cta.label}
            </Link>
          )}
          <button
            type="button"
            onClick={() => { setOpenedAt(pathname); setOpen(!open); }}
            className="-mr-2 flex size-11 items-center justify-center lg:hidden"
            aria-expanded={open}
            aria-controls="aurora-menu"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            <span className="relative block h-3 w-6" aria-hidden>
              <span className={cx("absolute inset-x-0 top-0 h-px bg-current transition-transform duration-300", open && "translate-y-1.5 rotate-45")} />
              <span className={cx("absolute inset-x-0 bottom-0 h-px bg-current transition-transform duration-300", open && "-translate-y-1.5 -rotate-45")} />
            </span>
          </button>
        </div>
      </div>

      <div
        id="aurora-menu"
        className={cx(
          "fixed inset-x-0 bottom-0 top-20 overflow-y-auto bg-paper transition-[opacity,visibility] duration-300 lg:hidden",
          open ? "visible opacity-100" : "invisible opacity-0",
        )}
      >
        <nav aria-label="Mobile" className="flex flex-col px-6 py-10">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="border-b border-line py-5 font-display text-3xl font-light text-ink">
              {item.label}
            </Link>
          ))}
          {cta && (
            <Link href={cta.href} className="mt-10 bg-brand px-6 py-4 text-center text-[0.7rem] font-medium uppercase tracking-[0.24em] text-paper">
              {cta.label}
            </Link>
          )}
          {topBar.phone && topBar.phoneHref && (
            <a href={topBar.phoneHref} className="mt-8 text-center text-sm tracking-[0.12em] text-ink-soft">{topBar.phone}</a>
          )}
        </nav>
      </div>
    </header>
  );
}
