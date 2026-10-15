import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { cancelBookingAction, payBookingAction } from "@/engine/actions";
import { getSite } from "@/engine/api";
import { fetchBooking } from "@/engine/submit";
import { themeFor } from "@/themes";

type Props = { params: Promise<{ token: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

// Private to whoever holds the link — never indexed.
export const metadata: Metadata = { title: "Your booking", robots: { index: false, follow: false } };

const one = (v: string | string[] | undefined) => (typeof v === "string" ? v : null);

export default async function BookingRoute({ params, searchParams }: Props) {
  const [{ token }, query, site] = await Promise.all([params, searchParams, getSite()]);
  if (!site) notFound();
  const result = await fetchBooking(token);
  if (!result.ok) notFound();
  const { pages } = themeFor(site.theme.key);
  const paying = one(query.pay);
  return (
    <pages.booking
      site={site}
      booking={result.data}
      token={token}
      justCreated={one(query.new) === "1"}
      payingId={paying && result.data.kind === "room" && result.data.booking.status === "PENDING" ? paying : null}
      payError={one(query.payError)}
      payAction={payBookingAction.bind(null, token)}
      cancelAction={cancelBookingAction.bind(null, token)}
    />
  );
}
