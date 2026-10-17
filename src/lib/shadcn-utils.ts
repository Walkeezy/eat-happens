import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Joins Tailwind classes, later ones winning over conflicting earlier ones. tailwind-merge is 26 kB, so client
 * components use plain `clsx` with class sets that never conflict; `cn` is for the shadcn primitives and server
 * components, where a caller's `className` has to override the defaults.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
