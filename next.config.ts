import type { NextConfig } from "next";

const API_URL = (process.env.API_URL ?? "http://localhost:4000").replace(/\/+$/, "");

// Content-Security-Policy for every tenant site: only what the sites actually
// use — our own origin, Google Maps embeds, Cloudflare Turnstile, and Google
// Analytics (loaded only after consent). 'unsafe-inline' scripts are needed by
// Next's inline bootstrap without nonces; no third-party script can load.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://challenges.cloudflare.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com",
  "frame-src https://www.google.com https://challenges.cloudflare.com",
  "frame-ancestors 'self'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  // No includeSubDomains: a client's own domain may have other subdomains (mail…) we don't control.
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Served on the VPS behind nginx; standalone keeps the deploy to one folder.
  output: "standalone",
  // Images uploaded in the platform admin are stored by the API as
  // /uploads/... paths. Proxying them makes those paths work on every site
  // host and custom domain, same-origin, with no absolute API URL in content.
  async rewrites() {
    return [{ source: "/uploads/:path*", destination: `${API_URL}/uploads/:path*` }];
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
