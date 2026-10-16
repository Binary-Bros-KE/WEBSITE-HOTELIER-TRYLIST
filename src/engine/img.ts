// Right-sized WebP images for uploads, through Next's built-in optimiser:
// a srcset of widths so phones download phone-sized photos. External images
// (and anything not under /uploads/) are passed through unchanged.

const LARGE = [640, 828, 1200, 1920];   // must be in next.config images.deviceSizes
const SMALL = [128, 256, 384];          // must be in images.imageSizes

const optimised = (src: string, width: number) => `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=75`;

/** Props for an <img>: `sizes` describes how wide it displays, e.g. "(min-width: 1024px) 33vw, 100vw". */
export function responsiveImage(src: string | null | undefined, sizes: string, opts: { small?: boolean; max?: number } = {}) {
  if (!src) return null;
  if (!src.startsWith("/uploads/")) return { src };
  const widths = (opts.small ? SMALL : LARGE).filter((w) => w <= (opts.max ?? Infinity));
  return {
    src: optimised(src, widths[widths.length - 1]),
    srcSet: widths.map((w) => `${optimised(src, w)} ${w}w`).join(", "),
    sizes,
  };
}
