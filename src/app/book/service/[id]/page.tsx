import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { bookAppointmentAction } from "@/engine/actions";
import { getServices, getSite } from "@/engine/api";
import { themeFor } from "@/themes";

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: "Book an appointment", robots: { index: false, follow: false } };

export default async function BookServiceRoute({ params }: Props) {
  const [{ id }, site] = await Promise.all([params, getSite()]);
  if (!site || !site.features.appointments) notFound();
  const service = (await getServices()).flatMap((c) => c.services).find((s) => s.id === id && s.bookableOnline);
  if (!service) notFound();
  const { pages, PageTitle } = themeFor(site.theme.key);
  return (
    <>
      <PageTitle title="Book an appointment" eyebrow={service.name} />
      <pages.bookService site={site} service={service} action={bookAppointmentAction} />
    </>
  );
}
