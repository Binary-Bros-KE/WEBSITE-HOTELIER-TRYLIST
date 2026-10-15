import type { ComponentType, ReactNode } from "react";

import { getPage } from "@/engine/api";
import { parseSections, type Section } from "@/engine/sections";
import type { SectionComponentProps } from "@/engine/theme";
import type { Site } from "@/engine/types";
import { themeFor } from "./index";

function renderSections(site: Site, sections: Section[], offset = 0) {
  const theme = themeFor(site.theme.key);
  return sections.map((section, i) => {
    const Component = theme.sections[section.type] as ComponentType<SectionComponentProps<typeof section.type>> | undefined;
    return Component ? <Component key={section.id} props={section.props} site={site} index={offset + i} /> : null;
  });
}

/** Renders validated section blocks with the site's theme. Pages that don't
 * open with a hero get the theme's title band first. */
export function PageSections({ site, sections, title }: { site: Site; sections: Section[]; title?: string }) {
  const theme = themeFor(site.theme.key);
  const opensWithHero = sections[0]?.type === "hero";
  return (
    <>
      {!opensWithHero && title && <theme.PageTitle title={title} eyebrow={site.name} />}
      {renderSections(site, sections)}
    </>
  );
}

/**
 * A built-in page (rooms, dining…) plus whatever the platform admin added on
 * its WebsitePage: a leading hero replaces the title band, every other block
 * follows the live content. With no page row, it's just the title band and
 * the live content.
 */
export async function SystemPageFrame({ site, slug, title, eyebrow, children }: {
  site: Site; slug: string; title: string; eyebrow?: string; children: ReactNode;
}) {
  const theme = themeFor(site.theme.key);
  const page = await getPage(slug);
  const sections = parseSections(page?.sections);
  const hero = sections[0]?.type === "hero" ? sections[0] : null;
  const rest = hero ? sections.slice(1) : sections;
  return (
    <>
      {hero ? renderSections(site, [hero]) : <theme.PageTitle title={page?.title ?? title} eyebrow={eyebrow ?? site.name} />}
      {children}
      {renderSections(site, rest, hero ? 1 : 0)}
    </>
  );
}
