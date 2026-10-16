import type { Metadata } from "next";
import { systemPageMetadata } from "@/engine/meta";
import { notFound } from "next/navigation";

import { getAvailability, getRoomTypes, getSite } from "@/engine/api";
import { parseStaySearch } from "@/engine/stay";
import type { StayState } from "@/engine/theme";
import { themeFor } from "@/themes";
import { SystemPageFrame } from "@/themes/render";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export function generateMetadata(): Promise<Metadata> {
  return systemPageMetadata("rooms", "Rooms & Suites", (site, w) => `Rooms and suites at ${site.name}${w} — compare rates, check live availability and request your stay online.`);
}

export default async function RoomsRoute({ searchParams }: Props) {
  const site = await getSite();
  if (!site || !site.features.rooms) notFound();
  const parsed = parseStaySearch(await searchParams);
  const searching = site.features.roomBooking && parsed !== null && !("error" in parsed);
  const [roomTypes, result] = await Promise.all([
    getRoomTypes(),
    searching ? getAvailability(parsed) : Promise.resolve(null),
  ]);
  const stay: StayState = {
    search: searching && result && !("error" in result) ? parsed : null,
    error: parsed && "error" in parsed ? parsed.error : result && "error" in result ? result.error : null,
  };
  const { pages } = themeFor(site.theme.key);
  return (
    <SystemPageFrame site={site} slug="rooms" title="Rooms & Suites">
      <pages.rooms site={site} roomTypes={roomTypes} stay={stay} availability={result && !("error" in result) ? result.availability : null} />
    </SystemPageFrame>
  );
}
