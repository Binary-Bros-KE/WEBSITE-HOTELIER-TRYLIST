"use client";

import { useEffect, useState } from "react";
import { responsiveImage } from "@/engine/img";

import { cx } from "../ui";

const INTERVAL_MS = 7000;

/** Slow crossfade between hero photographs, each drifting gently while shown. */
export function HeroSlides({ images }: { images: { url: string; alt: string }[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setActive((i) => (i + 1) % images.length), INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [images.length]);

  return (
    <div className="absolute inset-0 -z-10" aria-hidden={images.length > 1 ? undefined : true}>
      {images.map((image, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`${image.url}-${i === active ? "on" : "off"}`}
          {...responsiveImage(image.url, "100vw")}
          alt={i === 0 ? image.alt : ""}
          loading={i === 0 ? "eager" : "lazy"}
          fetchPriority={i === 0 ? "high" : "low"}
          className={cx(
            "absolute inset-0 size-full object-cover transition-opacity duration-[1600ms] ease-in-out",
            i === active ? "aurora-drift opacity-100" : "opacity-0",
          )}
        />
      ))}
    </div>
  );
}
