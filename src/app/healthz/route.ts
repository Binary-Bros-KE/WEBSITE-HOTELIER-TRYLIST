// Liveness check for the deploy script and monitoring — answers without a site
// host (route handlers don't render the tenant layout).
export function GET() {
  return Response.json({ status: "ok" }, { headers: { "cache-control": "no-store" } });
}
