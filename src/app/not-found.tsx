import { getSite } from "@/engine/api";
import { themeFor } from "@/themes";

export default async function NotFoundPage() {
  const site = await getSite();
  if (site) {
    const { NotFound } = themeFor(site.theme.key);
    return <NotFound />;
  }
  // No published site on this host at all.
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "2rem", textAlign: "center", fontFamily: "Georgia, serif", color: "#23211d", background: "#fbf8f3" }}>
      <div>
        <h1 style={{ fontSize: "2rem", fontWeight: 400, margin: 0 }}>There&apos;s no website here yet</h1>
        <p style={{ color: "#6d665c", marginTop: "1rem" }}>Check the address, or come back soon.</p>
      </div>
    </main>
  );
}
