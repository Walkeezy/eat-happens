import type { FC } from 'react';
import { preload } from 'react-dom';
import logo from '@/assets/logo.svg';
import { cn } from '@/lib/shadcn-utils';

/**
 * The mark as a CSS mask filled with `currentColor`, so it takes the text colour of its parent like the inline SVG
 * did. The SVG itself is a hashed static asset the browser caches: before, its path data was inlined into the HTML
 * and again into the RSC payload of every page, and made up 60% of the compressed HTML of a page load.
 */
export const Logo: FC<{ className?: string }> = ({ className }) => {
  preload(logo.src, { as: 'image' });

  return (
    <span
      aria-hidden="true"
      className={cn('inline-block aspect-[467/864] bg-current mask-contain mask-center mask-no-repeat', className)}
      style={{ maskImage: `url(${logo.src})` }}
    />
  );
};
