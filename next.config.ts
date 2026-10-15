import type { NextConfig } from "next";

const API_URL = (process.env.API_URL ?? "http://localhost:4000").replace(/\/+$/, "");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Served on the VPS behind Caddy; standalone keeps the deploy to one folder.
  output: "standalone",
  // Images uploaded in the platform admin are stored by the API as
  // /uploads/... paths. Proxying them makes those paths work on every site
  // host and custom domain, same-origin, with no absolute API URL in content.
  async rewrites() {
    return [{ source: "/uploads/:path*", destination: `${API_URL}/uploads/:path*` }];
  },
};

export default nextConfig;
