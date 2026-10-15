import { NextResponse, type NextRequest } from "next/server";

import { fetchPaymentState } from "@/engine/submit";

// Polled by the booking page while an M-Pesa prompt is outstanding.
export async function GET(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing payment" }, { status: 400 });
  const result = await fetchPaymentState(token, id);
  return result.ok
    ? NextResponse.json(result.data, { headers: { "cache-control": "no-store" } })
    : NextResponse.json({ error: result.error }, { status: result.status });
}
