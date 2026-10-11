'use client';

import dynamic from 'next/dynamic';

/**
 * Toasts only appear after someone saves something, so the toaster loads after hydration instead of sitting in
 * the first-load bundle of every page.
 */
export const LazyToaster = dynamic(() => import('@/components/shadcn/sonner').then((module) => module.Toaster), {
  ssr: false,
});
