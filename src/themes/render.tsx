import type { ComponentType } from "react";

import type { Section } from "@/engine/sections";
import type { SectionComponentProps } from "@/engine/theme";
import type { Site } from "@/engine/types";
import { themeFor } from "./index";

/** Renders validated section blocks with the site's theme. Pages that don't
 * open with a hero get the theme's title band first. */
export function PageSections({ site, sections, title }: { site: Site; sections: Section[]; title?: string }) {
  const theme = themeFor(site.theme.key);
  const opensWithHero = sections[0]?.type === "hero";
  return (
    <>
      {!opensWithHero && title && <theme.PageTitle title={title} eyebrow={site.name} />}
      {sections.map((section, index) => {
        const Component = theme.sections[section.type] as ComponentType<SectionComponentProps<typeof section.type>> | undefined;
        return Component ? <Component key={section.id} props={section.props} site={site} index={index} /> : null;
      })}
    </>
  );
}
