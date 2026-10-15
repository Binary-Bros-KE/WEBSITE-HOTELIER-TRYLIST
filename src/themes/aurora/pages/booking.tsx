import Link from "next/link";

import { formatDuration, formatMoney } from "@/engine/format";
import { safeImage } from "@/engine/safe";
import { contactLinks, formatDay } from "@/engine/stay";
import type { ThemePages } from "@/engine/theme";
import type { AppointmentView, RoomBookingView, Site } from "@/engine/types";
import { BookRoomForm } from "../BookRoomForm";
import { CancelBooking, PayForm, PaymentWatcher } from "../BookingActions";
import { ContactButtons } from "../ContactButtons";
import { BookServiceForm } from "../ServiceForms";
import { Container, cx, Ornament, Section } from "../ui";

export const BookRoomPage: ThemePages["bookRoom"] = ({ site, room, rateId, search, availability, action }) => {
  if (availability && !availability.available) {
    return (
      <Section>
        <Container narrow className="flex flex-col items-center gap-6 text-center">
          <p className="font-display text-3xl text-ink">The {room.name} isn&apos;t free for those dates</p>
          <p className="text-ink-soft">{formatDay(search.checkIn)} – {formatDay(search.checkOut)}</p>
          <Link href={`/rooms?${new URLSearchParams({ checkIn: search.checkIn, checkOut: search.checkOut, guests: String(search.guests) })}`} className="text-[0.68rem] font-medium uppercase tracking-[0.22em] text-ink underline decoration-accent underline-offset-8">
            See rooms that are free
          </Link>
        </Container>
      </Section>
    );
  }
  return (
    <Section className="!pt-14">
      <Container>
        <BookRoomForm room={room} rateId={rateId} search={search} currency={site.currency} rules={site.booking ?? null} action={action} />
      </Container>
    </Section>
  );
};

export const BookServicePage: ThemePages["bookService"] = ({ site, service, action }) => (
  <Section className="!pt-14">
    <Container>
      <BookServiceForm service={service} currency={site.currency} action={action} />
    </Container>
  </Section>
);

// ─── The guest's booking page ─────────────────────────────────────────────

type Step = { label: string; done: boolean; current?: boolean };

function Steps({ steps }: { steps: Step[] }) {
  return (
    <ol className="grid gap-4 sm:grid-cols-3">
      {steps.map((step, i) => (
        <li key={step.label} className="flex items-center gap-3">
          <span className={cx("flex size-8 shrink-0 items-center justify-center rounded-full border text-xs", step.done ? "border-brand bg-brand text-paper" : step.current ? "border-brand text-brand" : "border-line text-ink-soft")}>
            {step.done ? "✓" : i + 1}
          </span>
          <span className={cx("text-sm", step.done || step.current ? "text-ink" : "text-ink-soft")}>{step.label}</span>
        </li>
      ))}
    </ol>
  );
}

const ROOM_STATUS: Record<RoomBookingView["status"], { title: string; text: string }> = {
  PENDING: { title: "Booking request received", text: "Our team will confirm your booking shortly." },
  CONFIRMED: { title: "Your booking is confirmed", text: "We look forward to welcoming you." },
  CHECKED_IN: { title: "Welcome — you're checked in", text: "Enjoy your stay." },
  CHECKED_OUT: { title: "Thank you for staying with us", text: "We hope to see you again soon." },
  CANCELLED: { title: "This booking is cancelled", text: "If this wasn't expected, please get in touch." },
  NO_SHOW: { title: "This booking was closed", text: "Please get in touch if you'd like to rebook." },
};

const APPOINTMENT_STATUS: Record<AppointmentView["status"], { title: string; text: string }> = {
  BOOKED: { title: "Appointment request received", text: "Our team will confirm your time shortly." },
  CONFIRMED: { title: "Your appointment is confirmed", text: "We look forward to seeing you." },
  IN_PROGRESS: { title: "Your appointment is under way", text: "Relax and enjoy." },
  COMPLETED: { title: "Thank you for visiting", text: "We hope to see you again soon." },
  CANCELLED: { title: "This appointment is cancelled", text: "If this wasn't expected, please get in touch." },
  NO_SHOW: { title: "This appointment was closed", text: "Please get in touch if you'd like to rebook." },
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-6 py-4">
      <dt className="text-sm text-ink-soft">{label}</dt>
      <dd className="text-right text-ink">{value}</dd>
    </div>
  );
}

function Banner({ title, text, tone }: { title: string; text: string; tone: "good" | "info" | "bad" }) {
  return (
    <div className={cx("flex flex-col gap-2 border-l-2 px-6 py-5", tone === "good" ? "border-brand bg-paper" : tone === "bad" ? "border-red-800/60 bg-red-50" : "border-accent bg-accent-soft")}>
      <p className="font-display text-2xl text-ink">{title}</p>
      <p className="text-sm leading-relaxed text-ink-soft">{text}</p>
    </div>
  );
}

function Help({ site, reference }: { site: Site; reference: string | null }) {
  const links = contactLinks(site, `Booking ${reference ?? ""}`.trim(), `Hello ${site.name}, about my booking ${reference ?? ""}: `);
  if (links.length === 0) return null;
  return (
    <div className="flex flex-col gap-4 border-t border-line pt-8">
      <p className="aurora-eyebrow">Questions about your booking?</p>
      <ContactButtons links={links} />
    </div>
  );
}

export const BookingPage: ThemePages["booking"] = ({ site, booking, token, justCreated, payingId, payError, payAction, cancelAction }) => {
  if (booking.kind === "appointment") {
    const a = booking.booking;
    const status = APPOINTMENT_STATUS[a.status];
    return (
      <Section className="!pt-14">
        <Container narrow className="flex flex-col gap-10">
          {justCreated && <Banner tone="good" title="Thank you — we've received your request" text="Keep this page: it's where you can see your appointment and cancel it if plans change." />}
          <header className="flex flex-col gap-4">
            <p className="aurora-eyebrow">{a.reference ? `Reference ${a.reference}` : "Your appointment"}</p>
            <h1 className="font-display text-5xl font-light text-ink">{status.title}</h1>
            <p className="text-ink-soft">{status.text}</p>
            <Ornament className="pt-2" />
          </header>
          <Steps steps={[{ label: "Requested", done: true }, { label: "Confirmed by our team", done: a.status !== "BOOKED", current: a.status === "BOOKED" }, { label: "Your visit", done: a.status === "COMPLETED" }]} />
          <dl className="divide-y divide-line border-y border-line">
            <Row label="Service" value={a.service.variant ? `${a.service.name} — ${a.service.variant}` : a.service.name} />
            <Row label="When" value={`${formatDay(a.date)} · ${a.time}`} />
            {formatDuration(a.durationMinutes) && <Row label="Duration" value={formatDuration(a.durationMinutes)!} />}
            <Row label="Guest" value={`${a.guest.firstName} ${a.guest.lastName ?? ""}`.trim()} />
            <Row label="Price" value={formatMoney(a.amount, site.currency)} />
          </dl>
          {a.canCancel && <CancelBooking action={cancelAction} label="Cancel this appointment" />}
          <Help site={site} reference={a.reference} />
        </Container>
      </Section>
    );
  }

  const r = booking.booking;
  const status = ROOM_STATUS[r.status];
  const image = safeImage(r.roomType.imageUrl);
  const payStep = r.paymentDue > 0 || r.paid > 0;
  const steps: Step[] = [
    { label: "Requested", done: true },
    ...(payStep ? [{ label: "Payment", done: r.paid > 0, current: r.paymentDue > 0 }] : []),
    { label: "Confirmed by our team", done: r.status !== "PENDING" && r.status !== "CANCELLED", current: r.status === "PENDING" && r.paymentDue === 0 },
  ];

  return (
    <Section className="!pt-14">
      <Container className="grid gap-14 lg:grid-cols-[1fr_22rem]">
        <div className="flex flex-col gap-10">
          {justCreated && <Banner tone="good" title="Thank you — we've received your booking" text="Keep this page: it's where you can follow your booking and cancel it if plans change." />}
          {payError && <Banner tone="bad" title="The payment didn't go through" text={payError} />}
          <header className="flex flex-col gap-4">
            <p className="aurora-eyebrow">Reference {r.reference}</p>
            <h1 className="font-display text-5xl font-light text-ink">{status.title}</h1>
            <p className="text-ink-soft">{status.text}</p>
            <Ornament className="pt-2" />
          </header>
          {r.status !== "CANCELLED" && <Steps steps={steps.slice(0, 3)} />}

          {r.status === "PENDING" && payingId && <PaymentWatcher token={token} requestId={payingId} />}
          {r.status === "PENDING" && !payingId && r.paymentDue > 0 && (
            <PayForm action={payAction} depositDue={Math.ceil(r.paymentDue)} fullAmount={Math.ceil(r.estimatedTotal)} currency={site.currency} holdExpiresAt={r.holdExpiresAt} />
          )}

          <dl className="divide-y divide-line border-y border-line">
            <Row label="Room" value={r.rateName ? `${r.roomType.name} — ${r.rateName}` : r.roomType.name} />
            <Row label="Arrival" value={formatDay(r.checkIn)} />
            <Row label="Departure" value={formatDay(r.checkOut)} />
            <Row label="Guests" value={`${r.adults} adult${r.adults === 1 ? "" : "s"}${r.children ? `, ${r.children} child${r.children === 1 ? "" : "ren"}` : ""}`} />
            <Row label="Estimated total" value={`${formatMoney(r.estimatedTotal, site.currency)} · ${r.nights} night${r.nights === 1 ? "" : "s"}`} />
            {r.paid > 0 && <Row label="Paid" value={formatMoney(r.paid, site.currency)} />}
          </dl>
          {r.canCancel && <CancelBooking action={cancelAction} label="Cancel this booking" />}
          {r.status === "CANCELLED" && r.paid > 0 && <p className="text-sm text-ink-soft">Our team will be in touch about your payment.</p>}
          <Help site={site} reference={r.reference} />
        </div>
        {image && (
          <aside className="lg:sticky lg:top-28 lg:self-start">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt={r.roomType.name} className="aspect-[4/5] w-full object-cover" />
          </aside>
        )}
      </Container>
    </Section>
  );
};
