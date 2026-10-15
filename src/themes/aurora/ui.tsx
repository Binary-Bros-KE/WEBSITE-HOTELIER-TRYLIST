import Link from "next/link";
import type { ReactNode } from "react";

import { safeHref } from "@/engine/safe";

export function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function Container({ children, className, narrow }: { children: ReactNode; className?: string; narrow?: boolean }) {
  return <div className={cx("mx-auto w-full px-5 sm:px-8", narrow ? "max-w-3xl" : "max-w-7xl", className)}>{children}</div>;
}

/** Hairline — diamond — hairline. */
export function Ornament({ className, light }: { className?: string; light?: boolean }) {
  return (
    <span aria-hidden className={cx("flex items-center gap-3", className)}>
      <span className={cx("h-px w-10", light ? "bg-white/40" : "bg-accent/60")} />
      <span className={cx("size-1.5 rotate-45 border", light ? "border-white/70" : "border-accent")} />
      <span className={cx("h-px w-10", light ? "bg-white/40" : "bg-accent/60")} />
    </span>
  );
}

export function SectionHeading({
  eyebrow, title, intro, align = "center", light, as: Tag = "h2",
}: {
  eyebrow?: string; title?: string; intro?: string; align?: "center" | "left"; light?: boolean; as?: "h1" | "h2";
}) {
  if (!eyebrow && !title && !intro) return null;
  const center = align === "center";
  return (
    <header className={cx("flex flex-col gap-5", center ? "items-center text-center" : "items-start text-left")}>
      {eyebrow && <p className={cx("aurora-eyebrow", light && "!text-white/80")}>{eyebrow}</p>}
      {title && (
        <Tag className={cx("font-display text-4xl font-light leading-[1.08] tracking-[-0.01em] sm:text-5xl", light ? "text-white" : "text-ink", center && "max-w-3xl text-balance")}>
          {title}
        </Tag>
      )}
      <Ornament light={light} className={center ? "" : "-ml-0.5"} />
      {intro && <p className={cx("max-w-2xl text-[1.0625rem] leading-relaxed", light ? "text-white/80" : "text-ink-soft")}>{intro}</p>}
    </header>
  );
}

type ButtonVariant = "solid" | "outline" | "light" | "ghost-light";

const BUTTON_STYLES: Record<ButtonVariant, string> = {
  solid: "bg-brand text-paper hover:bg-brand-deep",
  outline: "border border-ink/25 text-ink hover:border-ink hover:bg-ink hover:text-paper",
  light: "bg-paper text-ink hover:bg-white",
  "ghost-light": "border border-white/50 text-white hover:border-white hover:bg-white hover:text-ink",
};

export function ButtonLink({ href, children, variant = "solid", className }: { href: string; children: ReactNode; variant?: ButtonVariant; className?: string }) {
  const safe = safeHref(href);
  if (!safe) return null;
  return (
    <Link
      href={safe}
      className={cx(
        "inline-flex items-center justify-center gap-3 px-7 py-3.5 text-[0.7rem] font-medium uppercase tracking-[0.24em] transition-colors duration-300",
        BUTTON_STYLES[variant],
        className,
      )}
    >
      {children}
    </Link>
  );
}

/** Understated text link with a drawn arrow. */
export function ArrowLink({ href, children, light, className }: { href: string; children: ReactNode; light?: boolean; className?: string }) {
  const safe = safeHref(href);
  if (!safe) return null;
  return (
    <Link
      href={safe}
      className={cx(
        "group inline-flex items-center gap-3 text-[0.7rem] font-medium uppercase tracking-[0.24em]",
        light ? "text-white" : "text-ink",
        className,
      )}
    >
      <span className="border-b border-current/30 pb-1 transition-colors group-hover:border-current">{children}</span>
      <svg aria-hidden viewBox="0 0 24 8" className="h-2 w-6 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M0 4h23M19.5 0.5 23 4l-3.5 3.5" />
      </svg>
    </Link>
  );
}

export function Section({ children, tone = "light", className, id }: { children: ReactNode; tone?: "light" | "sand" | "dark"; className?: string; id?: string }) {
  return (
    <section
      id={id}
      className={cx(
        "py-20 sm:py-28",
        tone === "light" && "bg-paper",
        tone === "sand" && "bg-sand",
        tone === "dark" && "bg-brand-deep text-paper",
        className,
      )}
    >
      {children}
    </section>
  );
}
