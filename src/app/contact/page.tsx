import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { inquiryAction } from "@/engine/actions";
import { getSite } from "@/engine/api";
import { themeFor } from "@/themes";
import { SystemPageFrame } from "@/themes/render";

export const metadata: Metadata = { title: "Contact", alternates: { canonical: "/contact" } };

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
