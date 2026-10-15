import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Served on the VPS behind Caddy; standalone keeps the deploy to one folder.
  output: "standalone",
};

export default nextConfig;
