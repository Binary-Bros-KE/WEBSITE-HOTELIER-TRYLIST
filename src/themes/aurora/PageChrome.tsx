import { ButtonLink, Container, Ornament } from "./ui";

export function PageTitle({ title, eyebrow }: { title: string; eyebrow?: string }) {
  return (
    <section className="border-b border-line bg-sand pb-20 pt-16 sm:pb-24 sm:pt-24">
      <Container narrow className="flex flex-col items-center gap-6 text-center">
        {eyebrow && <p className="aurora-eyebrow">{eyebrow}</p>}
        <h1 className="text-balance font-display text-5xl font-light leading-[1.05] text-ink sm:text-6xl">{title}</h1>
        <Ornament />
      </Container>
    </section>
  );
}

export function NotFound() {
  return (
    <section className="bg-paper py-32 sm:py-44">
      <Container narrow className="flex flex-col items-center gap-8 text-center">
        <p className="aurora-eyebrow">Page not found</p>
        <h1 className="font-display text-5xl font-light text-ink sm:text-6xl">This path leads elsewhere</h1>
        <Ornament />
        <p className="max-w-md leading-relaxed text-ink-soft">The page you were looking for has moved or no longer exists. Let us take you back to the beginning.</p>
        <ButtonLink href="/" variant="outline">Return home</ButtonLink>
      </Container>
    </section>
  );
}
