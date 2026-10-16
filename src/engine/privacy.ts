import { formatPhone } from "./format";
import type { Site } from "./types";

// The privacy notice every site gets at /privacy, written for Kenya's Data
// Protection Act, 2019 and filled in from the site's own details and enabled
// features. Returned as ordinary section blocks so any theme renders it.
// A template to review with the client — not legal advice.

export function privacySections(site: Site): unknown[] {
  const f = site.features;
  const c = site.contact;
  const name = site.name;
  const reach = [c.email ? `email ${c.email}` : null, c.phone ? `call ${formatPhone(c.phone)}` : null].filter(Boolean).join(" or ") || "contact us at the property";

  const collected: string[] = [];
  if (f.roomBooking) collected.push("When you book a room: your name, phone number, email address, stay dates, number of guests and any special requests.");
  if (f.appointments) collected.push("When you book an appointment: your name, phone number, email address (if given), the service and time you chose, and any notes.");
  if (f.inquiries) collected.push("When you send us a message: your name, the contact details you give us and your message.");
  if (site.booking?.requirePayment) collected.push("When you pay by M-Pesa: the phone number the payment prompt is sent to and the transaction reference. Safaricom processes the payment — we never see your M-Pesa PIN.");
  collected.push("When you use the site: your IP address, used only to protect our forms from abuse and spam.");
  if (site.analyticsId) collected.push("Only if you accept analytics cookies: anonymous statistics about how the site is used (Google Analytics).");

  const block = (id: string, eyebrow: string, title: string, body: string) => ({ id, type: "rich-text", props: { eyebrow, title, body, align: "left", compact: true } });

  return [
    block("intro", "Privacy", "How we look after your information",
      `This notice explains how ${name} ("we", "us") collects and uses personal data when you use this website, in line with Kenya's Data Protection Act, 2019. We are the data controller for the information you give us here.`),
    block("collect", "What we collect", "Information you give us", collected.join("\n\n")),
    block("why", "Why", "How we use it",
      [
        "To handle your booking, appointment or enquiry, and to contact you about it — this is necessary to provide the service you asked for.",
        "To keep the guest and payment records the law requires of us, such as tax records.",
        "To keep this website secure and free of spam — our legitimate interest.",
        site.analyticsId ? "To understand how the site is used, only with your consent, which you can withdraw at any time." : null,
        "We do not sell your personal data, and we do not use it for marketing unless you have agreed to that separately.",
      ].filter(Boolean).join("\n\n")),
    block("share", "Sharing", "Who can see it",
      [
        "Our staff who look after bookings and guests.",
        "Our hotel management software provider and its hosting and security providers (including Cloudflare), who process the data only on our behalf and under our instructions.",
        site.booking?.requirePayment ? "Safaricom, to process M-Pesa payments." : null,
        site.analyticsId ? "Google, for anonymous site statistics — only if you accept analytics cookies." : null,
        "Some of these providers may store data outside Kenya; we only use providers that protect it to the standard the Act requires.",
      ].filter(Boolean).join("\n\n")),
    block("keep", "Retention", "How long we keep it",
      "We keep booking and payment records for as long as the law requires (for example, for tax purposes). Messages that don't lead to a booking are deleted once they are no longer needed. Spam-protection data is kept only briefly."),
    block("rights", "Your rights", "What you can ask of us",
      `Under the Data Protection Act you have the right to be told how your data is used, to see the data we hold about you, to have it corrected or deleted, to object to its use, and to withdraw any consent you have given. To make a request, ${reach}.\n\nIf you are not happy with how we handle your data, you can complain to the Office of the Data Protection Commissioner (www.odpc.go.ke).`),
    block("cookies", "Cookies", "Cookies on this site",
      site.analyticsId
        ? "This site uses analytics cookies only if you accept them in the banner; you can change your choice by clearing this site's data in your browser. No advertising cookies are used."
        : "This site does not use advertising or analytics cookies."),
  ];
}
