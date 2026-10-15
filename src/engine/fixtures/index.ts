import type { MembershipPlan, MenuCategory, Page, RoomType, ServiceCategory, Site } from "../types";
import { omega } from "./omega";

/** Everything the API would return for one site, bundled for offline design work. */
export type SiteFixture = {
  site: Site;
  pages: Page[];
  roomTypes: RoomType[];
  menu: MenuCategory[];
  services: ServiceCategory[];
  memberships: MembershipPlan[];
};

const FIXTURES: Record<string, SiteFixture> = { omega };

export function fixtureFor(name: string | undefined): SiteFixture | null {
  if (!name) return null;
  const fixture = FIXTURES[name];
  if (!fixture) throw new Error(`SITE_FIXTURE="${name}" is not one of: ${Object.keys(FIXTURES).join(", ")}`);
  return fixture;
}
