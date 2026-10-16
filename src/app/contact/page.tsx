import type { Metadata } from "next";
import { systemPageMetadata } from "@/engine/meta";
import { notFound } from "next/navigation";

import { inquiryAction } from "@/engine/actions";
import { getSite } from "@/engine/api";
import { themeFor } from "@/themes";
import { SystemPageFrame } from "@/themes/render";

export function generateMetadata(): Promise<Metadata> {
  return systemPageMetadata("contact", "Contact", (site, w) => `How to reach ${site.name}${w} — address, map, phone, WhatsApp and email, or send us a message.`);
}

export default async function ContactRoute() {
  const site = await getSite();
  if (!site) notFound();
  const { pages } = themeFor(site.theme.key);
  return (
    <SystemPageFrame site={site} slug="contact" title="Contact" eyebrow="We look forward to welcoming you">
      <pages.contact site={site} inquiryAction={site.features.inquiries ? inquiryAction : undefined} />
    </SystemPageFrame>
  );
}
