'use client';

import { Slot } from '@radix-ui/react-slot';
import dynamic from 'next/dynamic';
import { type ReactNode, useEffect, useState } from 'react';

const loadDialogShell = () => import('@/components/dialog-shell').then((module) => module.DialogShell);

const DialogShell = dynamic(loadDialogShell, { ssr: false, loading: () => null });

type Props = {
  title: string;
  /** A single element, usually a Button; it gets the click handler and the dialog semantics. */
  trigger: ReactNode;
  /** Starts fetching the form's chunk; called together with the dialog's own chunk. Must be a stable function. */
  preloadForm: () => Promise<unknown>;
  /** The form, handed a callback that closes the dialog once it has saved. */
  children: (close: () => void) => ReactNode;
};

/**
 * A dialog that is nothing but its trigger until someone opens it. Radix Dialog and the form (react-hook-form,
 * zod) arrive in their own chunks: fetched on hover or focus, once the browser is idle, or at the latest on the
 * first tap - so none of it sits in the first-load bundle of the pages that show the trigger.
 */
export function LazyDialog({ title, trigger, preloadForm, children }: Props) {
  const [open, setOpen] = useState(false);
  // Stays true after the first open, so closing plays the exit animation instead of unmounting the sheet at once.
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  const preload = () => void Promise.all([loadDialogShell(), preloadForm()]);

  // On touch screens there is no hover to warn us, so fetch the chunks once the browser is idle: the sheet then
  // opens at once instead of after a download. Several dialogs on a page share the chunks, so this is cheap.
  useEffect(() => {
    const load = () => void Promise.all([loadDialogShell(), preloadForm()]);
    if (typeof requestIdleCallback === 'function') {
      const id = requestIdleCallback(load);
      return () => cancelIdleCallback(id);
    }

    const id = setTimeout(load, 2000);
    return () => clearTimeout(id);
  }, [preloadForm]);

  const openDialog = () => {
    setMounted(true);
    setOpen(true);
    // Dims the trigger while the chunks are still on their way, so a tap is acknowledged.
    setLoading(true);
    void Promise.all([loadDialogShell(), preloadForm()]).finally(() => setLoading(false));
  };

  const close = () => setOpen(false);

  return (
    <>
      {/* Adds the click handler and dialog semantics to the server-rendered trigger, as Radix's DialogTrigger would. */}
      <Slot
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-busy={loading || undefined}
        className="aria-busy:opacity-60"
        onClick={openDialog}
        onPointerEnter={preload}
        onFocus={preload}
      >
        {trigger}
      </Slot>
      {mounted ? (
        <DialogShell open={open} onOpenChange={setOpen} title={title}>
          {children(close)}
        </DialogShell>
      ) : null}
    </>
  );
}

/** Placeholder while a form's chunk is still on its way. A plain div: the shadcn Skeleton would bring tailwind-merge along. */
export function FormPlaceholder({ className }: { className: string }) {
  return <div aria-hidden className={`animate-pulse rounded-md bg-foreground/8 ${className}`} />;
}
