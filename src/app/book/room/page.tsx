import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { bookRoomAction } from "@/engine/actions";
import { getAvailability, getRoomType, getSite } from "@/engine/api";
import { parseStaySearch } from "@/engine/stay";
import { themeFor } from "@/themes";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export const metadata: Metadata = { title: "Complete your booking", robots: { index: false, follow: false } };

export default async function BookRoomRoute({ searchParams }: Props) {
  const [query, site] = await Promise.all([searchParams, getSite()]);
  if (!site || !site.features.roomBooking) notFound();
  const roomTypeId = typeof query.roomTypeId === "string" ? query.roomTypeId : "";
  const room = roomTypeId ? await getRoomType(roomTypeId) : null;
  if (!room) notFound();
  const search = parseStaySearch(query);
  // No (valid) dates yet: send them to the room page to pick some.
  if (!search || "error" in search) redirect(`/rooms/${room.id}`);
  const result = await getAvailability(search);
  if ("error" in result) redirect(`/rooms/${room.id}?${new URLSearchParams({ checkIn: search.checkIn, checkOut: search.checkOut, guests: String(search.guests) })}`);
  const { pages, PageTitle } = themeFor(site.theme.key);
  const rateId = typeof query.rateId === "string" ? query.rateId : null;
  return (
    <>
      <PageTitle title="Complete your booking" eyebrow={room.name} />
      <pages.bookRoom site={site} room={room} rateId={rateId} search={search} availability={result.availability.find((a) => a.roomTypeId === room.id) ?? null} action={bookRoomAction} />
    </>
  );
}
