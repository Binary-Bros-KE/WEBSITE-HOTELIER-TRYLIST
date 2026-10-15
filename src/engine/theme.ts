import type { ComponentType, CSSProperties, ReactNode } from "react";

import type { SectionProps, SectionType } from "./sections";
import type { Site } from "./types";

// The contract every theme fulfils. Themes are presentation only: the engine
// fetches data, validates content and decides what's enabled; a theme gets
// finished values and draws them. Adding theme #2 = a new src/themes/<key>
// folder implementing this, registered in src/themes/index.ts, plus a
// WebsiteTheme row with the same key.

export type SectionComponentProps<T extends SectionType> = {
  props: SectionProps<T>;
  site: Site;
  /** Position on the page — lets a theme treat the first block (usually the hero) specially. */
  index: number;
};

export type Theme = {
  key: string;
  /** Header, footer and page chrome around every page. */
  Layout: ComponentType<{ site: Site; children: ReactNode }>;
  /** Title band for pages that don't open with a hero. */
  PageTitle: ComponentType<{ title: string; eyebrow?: string }>;
  /** Shown inside the Layout for an unknown path. */
  NotFound: ComponentType;
  /** A renderer per supported block type; unsupported types are skipped. */
  sections: { [T in SectionType]?: ComponentType<SectionComponentProps<T>> };
  /** CSS custom properties carrying the tenant's branding into the theme. */
  brandStyle: (site: Site) => CSSProperties;
  /** Class names for the theme's fonts, applied to <html>. */
  fontClassName: string;
};
