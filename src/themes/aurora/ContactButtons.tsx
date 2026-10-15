import type { ContactLink } from "@/engine/stay";
import { SocialIcon } from "./icons";
import { cx } from "./ui";

/** The first link is the solid call to action and the rest are quieter —
 * unless `quiet`, when another button on the page is the main action. */
export function ContactButtons({ links, className, stacked, quiet }: { links: ContactLink[]; className?: string; stacked?: boolean; quiet?: boolean }) {
  if (links.length === 0) return null;
  return (
    <div className={cx("flex gap-3", stacked ? "flex-col" : "flex-wrap", className)}>
      {links.map((link, i) => (
        <a
          key={link.kind}
          href={link.href}
          target={link.kind === "whatsapp" ? "_blank" : undefined}
          rel={link.kind === "whatsapp" ? "noopener noreferrer" : undefined}
          className={cx(
            "inline-flex items-center justify-center gap-3 px-6 py-3.5 text-[0.68rem] font-medium uppercase tracking-[0.22em] transition-colors duration-300",
            i === 0 && !quiet ? "bg-brand text-paper hover:bg-brand-deep" : "border border-ink/20 text-ink hover:border-ink",
          )}
        >
          {link.kind === "whatsapp" && <SocialIcon name="whatsapp" className="size-4" />}
          {link.label}
        </a>
      ))}
    </div>
  );
}
