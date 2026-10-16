import { z } from "zod";

// The section-block contract between page content (WebsitePage.sections, edited
// in the platform admin) and themes. A page is an ordered list of blocks:
//   { id, type: "hero", props: { ... } }
// Every schema defaults every field, so a half-filled block still renders; a
// block whose type is unknown or whose props don't validate is skipped rather
// than breaking the page. Themes render these types — the seeded WebsiteTheme
// row lists which ones each theme supports.

const text = (fallback = "") => z.string().trim().max(5000).default(fallback);
const optionalText = z.string().trim().max(5000).optional();

const link = z.object({ label: z.string().trim().min(1).max(60), href: z.string().trim().min(1).max(500) });
const image = z.object({ url: z.string().trim().min(1).max(1000), alt: z.string().trim().max(200).default("") });

const heading = {
  eyebrow: optionalText,
  title: text(),
  intro: optionalText,
};

export const sectionSchemas = {
  hero: z.object({
    eyebrow: optionalText,
    title: text(),
    subtitle: optionalText,
    /** One image = still hero; several = slow crossfade. */
    images: z.array(image).max(8).default([]),
    primaryCta: link.optional(),
    secondaryCta: link.optional(),
    /** Check-in/out search bar — only shown when the site takes room bookings. */
    showBookingBar: z.boolean().default(true),
    height: z.enum(["full", "tall"]).default("full"),
  }),

  "rich-text": z.object({
    ...heading,
    /** Plain text; blank lines separate paragraphs. */
    body: text(),
    align: z.enum(["center", "left"]).default("center"),
    signature: optionalText,
    /** Tighter spacing, for runs of text blocks (e.g. a policy page). */
    compact: z.boolean().default(false),
  }),

  "image-text": z.object({
    ...heading,
    body: text(),
    image: image.optional(),
    imageSide: z.enum(["left", "right"]).default("left"),
    bullets: z.array(z.string().trim().max(200)).max(12).default([]),
    cta: link.optional(),
    tone: z.enum(["light", "sand"]).default("light"),
  }),

  "rooms-showcase": z.object({
    ...heading,
    /** Specific room types in this order; empty = all shown types. */
    roomTypeIds: z.array(z.string()).max(24).default([]),
    limit: z.number().int().min(1).max(24).default(3),
    cta: link.optional(),
  }),

  "menu-highlights": z.object({
    ...heading,
    /** Menu category names to feature; empty = the first few categories. */
    categories: z.array(z.string().trim()).max(12).default([]),
    itemsPerCategory: z.number().int().min(1).max(30).default(5),
    image: image.optional(),
    cta: link.optional(),
  }),

  "services-showcase": z.object({
    ...heading,
    categories: z.array(z.string().trim()).max(12).default([]),
    limit: z.number().int().min(1).max(24).default(6),
    cta: link.optional(),
  }),

  "membership-plans": z.object({
    ...heading,
    cta: link.optional(),
  }),

  amenities: z.object({
    ...heading,
    items: z.array(z.object({
      icon: z.string().trim().max(40).default("star"),
      title: z.string().trim().min(1).max(80),
      text: z.string().trim().max(300).default(""),
    })).max(16).default([]),
    tone: z.enum(["light", "sand", "dark"]).default("sand"),
  }),

  gallery: z.object({
    ...heading,
    images: z.array(image.extend({ caption: z.string().trim().max(120).optional() })).max(24).default([]),
  }),

  /** Cards that route each kind of guest — Stay, Celebrate, Meet, Dine. */
  pathways: z.object({
    ...heading,
    items: z.array(z.object({
      title: z.string().trim().min(1).max(60),
      text: z.string().trim().max(200).default(""),
      image: image.optional(),
      link: link,
    })).max(6).default([]),
  }),

  testimonials: z.object({
    ...heading,
    items: z.array(z.object({
      quote: z.string().trim().min(1).max(800),
      author: z.string().trim().min(1).max(80),
      origin: z.string().trim().max(80).optional(),
    })).max(12).default([]),
  }),

  faq: z.object({
    ...heading,
    items: z.array(z.object({ question: z.string().trim().min(1).max(300), answer: z.string().trim().min(1).max(3000) })).max(30).default([]),
  }),

  cta: z.object({
    ...heading,
    image: image.optional(),
    primaryCta: link.optional(),
    secondaryCta: link.optional(),
  }),

  "contact-map": z.object({
    ...heading,
    /** Free text, e.g. "Monday – Sunday · 6:00 AM – 11:00 PM". */
    hours: optionalText,
    showMap: z.boolean().default(true),
  }),
} as const;

export type SectionType = keyof typeof sectionSchemas;
export type SectionProps<T extends SectionType> = z.infer<(typeof sectionSchemas)[T]>;
export type Section = { [T in SectionType]: { id: string; type: T; props: SectionProps<T> } }[SectionType];

const isSectionType = (value: unknown): value is SectionType => typeof value === "string" && value in sectionSchemas;

/** Validates raw page blocks; drops (and logs) anything a theme couldn't render. */
export function parseSections(raw: unknown): Section[] {
  if (!Array.isArray(raw)) return [];
  const sections: Section[] = [];
  raw.forEach((block, index) => {
    const b = (block ?? {}) as { id?: unknown; type?: unknown; props?: unknown };
    if (!isSectionType(b.type)) { console.warn(`[sections] skipped block ${index}: unknown type ${String(b.type)}`); return; }
    const parsed = sectionSchemas[b.type].safeParse(b.props ?? {});
    if (!parsed.success) { console.warn(`[sections] skipped ${b.type} block ${index}:`, parsed.error.issues[0]?.message); return; }
    sections.push({ id: typeof b.id === "string" ? b.id : `${b.type}-${index}`, type: b.type, props: parsed.data } as Section);
  });
  return sections;
}
