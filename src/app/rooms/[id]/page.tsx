import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getAvailability, getRoomType, getRoomTypes, getSite } from "@/engine/api";
import { safeImage } from "@/engine/safe";
import { parseStaySearch } from "@/engine/stay";
import type { StayState } from "@/engine/theme";
import { themeFor } from "@/themes";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const room = await getRoomType(id);
  if (!room) return {};
  const image = safeImage(room.imageUrls[0]);
  return {
    title: room.name,
    description: room.description ?? undefined,
    alternates: { canonical: `/rooms/${room.id}` },
    ...(image ? { openGraph: { images: [{ url: image }] } } : {}),
  };
}

export default async function RoomRoute({ params, searchParams }: Props) {
  const [{ id }, query, site] = await Promise.all([params, searchParams, getSite()]);
  if (!site || !site.features.rooms) notFound();
  const room = await getRoomType(id);
  if (!room) notFound();
  const parsed = parseStaySearch(query);
  const searching = site.features.roomBooking && parsed !== null && !("error" in parsed);
  const [all, result] = await Promise.all([getRoomTypes(), searching ? getAvailability(parsed) : Promise.resolve(null)]);
  const stay: StayState = {
    search: searching && result && !("error" in result) ? parsed : null,
    error: parsed && "error" in parsed ? parsed.error : result && "error" in result ? result.error : null,
  };
  const availability = result && !("error" in result) ? result.availability.find((a) => a.roomTypeId === room.id) ?? null : null;
  const { pages } = themeFor(site.theme.key);
  return <pages.room site={site} room={room} others={all.filter((t) => t.id !== room.id)} stay={stay} availability={availability} />;
}
