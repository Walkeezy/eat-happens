import { cn } from '@/lib/shadcn-utils';

type Props = {
  src?: string | null;
  /** Names the person for assistive tech when the picture is the only thing identifying them. */
  alt?: string;
  /** Initials shown while the picture loads and whenever there is none or it fails. */
  fallback: string;
  className?: string;
  fallbackClassName?: string;
};

/** Keeps a URL inside `url("…")`: quotes, backslashes, parentheses and line breaks are percent-encoded. */
function cssUrl(src: string): string {
  return `url("${src.replace(/["\\()\n\r]/g, (char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)}")`;
}

/**
 * The picture is a background over an initials badge and renders on the server, so it loads before hydration -
 * unlike a Radix avatar, which mounts the image client-side and flashes from initials to photo on every load.
 * A background that fails to load (an expired Google URL, say) paints nothing, so the initials stay visible
 * instead of a broken-image icon, and avatars inside collapsed sections are not fetched at all.
 */
export function Avatar({ src, alt, fallback, className, fallbackClassName }: Props) {
  return (
    <span className={cn('relative flex size-10 shrink-0 overflow-hidden rounded-full', className)}>
      {alt ? <span className="sr-only">{alt}</span> : null}
      <span
        className={cn('flex h-full w-full items-center justify-center rounded-full bg-muted', fallbackClassName)}
        aria-hidden={alt ? true : undefined}
      >
        {fallback}
      </span>
      {src ? (
        <span aria-hidden className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: cssUrl(src) }} />
      ) : null}
    </span>
  );
}
