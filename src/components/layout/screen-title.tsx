'use client';

import { useEffect, useRef } from 'react';
import { useShell } from '@/components/layout/shell-context';

/**
 * Registers the page title with the shell and watches when it scrolls under the bar, so the bar can show the
 * title in its place. Renders only a sentinel; the visible h1 stays server-rendered.
 */
export function ScreenTitle({ title }: { title: string }) {
  const { setTitle, setCollapsed } = useShell();
  const sentinel = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    setTitle(title);

    return () => setTitle(null);
  }, [title, setTitle]);

  useEffect(() => {
    const element = sentinel.current;
    if (!element) {
      return;
    }

    const barBottom = document.getElementById('app-header')?.getBoundingClientRect().bottom ?? 56;
    const observer = new IntersectionObserver(
      ([entry]) => setCollapsed(entry !== undefined && entry.boundingClientRect.bottom <= barBottom),
      { rootMargin: `-${Math.round(barBottom)}px 0px 0px 0px` },
    );
    observer.observe(element);

    return () => observer.disconnect();
  }, [setCollapsed]);

  return <span ref={sentinel} aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px" />;
}
