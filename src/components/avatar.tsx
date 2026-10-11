import { cn } from '@/lib/shadcn-utils';

type Props = {
  src?: string | null;
  /** Read by assistive tech when the picture is the only thing naming the person; empty when a name sits next to it. */
  alt?: string;
  /** Initials shown while the picture loads and whenever there is none. */
  fallback: string;
  className?: string;
  fallbackClassName?: string;
};

/**
 * A plain `<img>` over an initials badge. It renders on the server, so the picture is in the first HTML and the
 * browser can start loading it before hydration - unlike a Radix avatar, which only mounts the image client-side
 * and flashes from initials to photo on every load. A picture that fails to load (empty `alt`) paints nothing and
 * leaves the initials visible.
 */
export function Avatar({ src, alt = '', fallback, className, fallbackClassName }: Props) {
  return (
    <span className={cn('relative flex size-10 shrink-0 overflow-hidden rounded-full', className)}>
      <span
        className={cn('flex h-full w-full items-center justify-center rounded-full bg-muted', fallbackClassName)}
        aria-hidden={src ? true : undefined}
      >
        {fallback}
      </span>
      {src ? (
        // biome-ignore lint/performance/noImgElement: tiny remote avatars, no need for next/image
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}
    </span>
  );
}
