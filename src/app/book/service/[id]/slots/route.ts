import { NextResponse, type NextRequest } from "next/server";

import { fetchSlots } from "@/engine/submit";

// Open start times for a service on a date — fetched as the guest picks a day.
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const date = request.nextUrl.searchParams.get("date") ?? "";
  const variantId = request.nextUrl.searchParams.get("variantId") ?? undefined;
  const result = await fetchSlots(id, date, variantId);
  return result.ok
    ? NextResponse.json(result.data, { headers: { "cache-control": "no-store" } })
    : NextResponse.json({ error: result.error }, { status: result.status });
}
