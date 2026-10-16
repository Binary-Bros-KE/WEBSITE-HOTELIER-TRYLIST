import type { SVGProps } from "react";

// Fine line icons (24px grid, 1.25 stroke) for amenities. Content picks one by
// name; unknown names fall back to "star".

const PATHS: Record<string, string> = {
  pool: "M2 17c1.7 0 1.7-1.2 3.4-1.2S7.1 17 8.8 17s1.7-1.2 3.4-1.2 1.7 1.2 3.4 1.2 1.7-1.2 3.4-1.2S20.3 17 22 17M2 21c1.7 0 1.7-1.2 3.4-1.2S7.1 21 8.8 21s1.7-1.2 3.4-1.2 1.7 1.2 3.4 1.2 1.7-1.2 3.4-1.2S20.3 21 22 21M8 13V5a2 2 0 0 1 4 0M16 13V5a2 2 0 0 0-4 0M8 8h8M8 11h8",
  spa: "M12 21c-4.5 0-8-3-8-7 2.5 0 5 1 8 4 3-3 5.5-4 8-4 0 4-3.5 7-8 7ZM12 18c-2-2.5-3-5-2.5-8.5C10.5 7 11.2 5 12 3c.8 2 1.5 4 2.5 6.5.5 3.5-.5 6-2.5 8.5Z",
  gym: "M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11M3.5 9h3M3.5 15h3M17.5 9h3M17.5 15h3",
  conference: "M3 4h18M4 4v10h16V4M12 14v3M8 21l4-4 4 4M8 9h3M8 11.5h6",
  bar: "M7 3h10l-1 7a4 4 0 0 1-8 0L7 3ZM12 14v6M8.5 21h7M7.6 7h8.8",
  kids: "M12 3a5 5 0 0 1 5 5c0 3.5-3 6-5 6s-5-2.5-5-6a5 5 0 0 1 5-5ZM12 14l-1 2h2l-1-2Zm0 2c0 2-2 2.5-2 5",
  grooming: "M6 6a2.5 2.5 0 1 0 0 .01M6 18a2.5 2.5 0 1 0 0 .01M8.2 7.2 20 18M8.2 16.8 20 6",
  events: "M9 14a4.5 4.5 0 1 0 0 .01M15 14a4.5 4.5 0 1 0 0 .01M12 3l1.2 2.3L15.5 6l-2.3 1.2L12 9.5l-1.2-2.3L8.5 6l2.3-.7L12 3Z",
  dining: "M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 21V3c-2 1.5-3 4-3 8h3",
  wifi: "M2.5 9a14 14 0 0 1 19 0M5.5 12.2a9.5 9.5 0 0 1 13 0M8.6 15.4a5 5 0 0 1 6.8 0M12 19h.01",
  parking: "M4 3h16v18H4zM9.5 17V7h3.5a3 3 0 0 1 0 6H9.5",
  concierge: "M3 18h18M5 18a7 7 0 0 1 14 0M12 8V6M10 6h4",
  garden: "M12 21V10M12 10C12 6 9 3 4 3c0 5 3 7 8 7ZM12 13c0-3.5 2.5-6 7-6 0 4.5-2.5 6-7 6Z",
  breakfast: "M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9ZM17 10.5h1.5a2.5 2.5 0 0 1 0 5H17M8 3c0 1.5 1 1.5 1 3M12 3c0 1.5 1 1.5 1 3",
  star: "m12 3 2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.3 9.3l6.1-.7L12 3Z",
};

export function AmenityIcon({ name, ...props }: { name: string } & SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.25} strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <path d={PATHS[name] ?? PATHS.star} />
    </svg>
  );
}

const SOCIAL: Record<string, string> = {
  facebook: "M14 8.5V6.8c0-.8.5-1.3 1.3-1.3H17V2.5h-2.5C11.9 2.5 11 4.2 11 6.4v2.1H8.5v3H11v10h3v-10h2.6l.4-3h-3Z",
  instagram: "M7.5 2.5h9a5 5 0 0 1 5 5v9a5 5 0 0 1-5 5h-9a5 5 0 0 1-5-5v-9a5 5 0 0 1 5-5ZM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM17.3 6.2h.01",
  tiktok: "M14 2.5v12.3a3.3 3.3 0 1 1-3.3-3.3M14 2.5c.4 2.8 2.2 4.4 5 4.6",
  x: "M4 4l16 16M20 4 4 20",
  youtube: "M2.8 7.2C3 5.6 4.1 4.6 5.7 4.5 7.6 4.3 9.8 4.2 12 4.2s4.4.1 6.3.3c1.6.1 2.7 1.1 2.9 2.7.2 1.6.3 3.2.3 4.8s-.1 3.2-.3 4.8c-.2 1.6-1.3 2.6-2.9 2.7-1.9.2-4.1.3-6.3.3s-4.4-.1-6.3-.3c-1.6-.1-2.7-1.1-2.9-2.7-.2-1.6-.3-3.2-.3-4.8s.1-3.2.3-4.8ZM10 9v6l5-3-5-3Z",
  tripadvisor: "M7 15.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM17 15.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2 9.5h3M19 9.5h3M5 9.5C7 7 9.5 6 12 6s5 1 7 3.5M12 6v6",
  google: "M20.5 12.2c0-.6-.1-1.2-.2-1.7H12v3.3h4.8a4.2 4.2 0 0 1-1.8 2.7v2.2h2.9c1.7-1.6 2.6-3.9 2.6-6.5ZM12 21c2.4 0 4.4-.8 5.9-2.2l-2.9-2.2c-.8.5-1.8.9-3 .9a5.2 5.2 0 0 1-4.9-3.6H4.1v2.3A9 9 0 0 0 12 21ZM7.1 13.9a5.4 5.4 0 0 1 0-3.5V8.1H4.1a9 9 0 0 0 0 8.1l3-2.3ZM12 6.6c1.3 0 2.5.5 3.4 1.3l2.6-2.6A9 9 0 0 0 4.1 8.1l3 2.3A5.2 5.2 0 0 1 12 6.6Z",
  linkedin: "M4.5 9v11M4.5 4.5h.01M9.5 20v-6.5a3 3 0 0 1 6 0V20M9.5 9v11M15.5 13.5V20",
  whatsapp: "M4 20l1.2-3.6A8 8 0 1 1 8 19.2L4 20ZM9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.5-2-1-1 .8c-1-.4-2.4-1.8-2.8-2.8l.8-1-1-2-1.5 1Z",
};

export function SocialIcon({ name, ...props }: { name: string } & SVGProps<SVGSVGElement>) {
  const d = SOCIAL[name];
  if (!d) return null;
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <path d={d} />
    </svg>
  );
}
