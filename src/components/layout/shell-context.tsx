'use client';

import { usePathname } from 'next/navigation';
import { createContext, type ReactNode, useContext, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { type NavDirection, navigationDirection } from '@/components/layout/nav-items';

type NavigationState = {
  pathname: string;
  previousPathname: string | undefined;
  direction: NavDirection;
  /** How many steps back stay inside the app. Reloading resets it; the back button then falls back to a plain link. */
  depth: number;
};

type ScreenState = {
  pathname: string;
  title: string | null;
  collapsed: boolean;
};

type ShellContextValue = {
  previousPathname: string | undefined;
  canGoBack: boolean;
  title: string | null;
  collapsed: boolean;
  setTitle: (title: string | null) => void;
  setCollapsed: (collapsed: boolean) => void;
};

const ShellContext = createContext<ShellContextValue | null>(null);

/**
 * Tracks where the user came from and what the current screen is called, so the mobile bar can show a back
 * button and a collapsed title without waiting for the page itself to render. The navigation state is derived
 * in render, which keeps it in step with the page that is being committed.
 */
export function ShellProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // Set by popstate before the router renders the new page, so the next route change counts as a step back.
  const [popped, setPopped] = useState(false);
  const [navigation, setNavigation] = useState<NavigationState>({
    pathname,
    previousPathname: undefined,
    direction: 'tab',
    depth: 0,
  });
  const [screen, setScreen] = useState<ScreenState>({ pathname, title: null, collapsed: false });

  if (navigation.pathname !== pathname) {
    setNavigation({
      pathname,
      previousPathname: navigation.pathname,
      direction: navigationDirection(navigation.pathname, pathname),
      // Going back is far more common than forward, so a history navigation counts as one step back.
      depth: popped ? Math.max(0, navigation.depth - 1) : navigation.depth + 1,
    });
    setPopped(false);
  }
  // Reset with the route, so the bar's view-transition snapshot never carries the previous screen's title.
  if (screen.pathname !== pathname) {
    setScreen({ pathname, title: null, collapsed: false });
  }

  useEffect(() => {
    const onPopState = () => setPopped(true);
    window.addEventListener('popstate', onPopState);

    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // A layout effect runs inside the view transition's update callback, i.e. before the browser resolves which
  // animation the page pseudo-elements get - see the `html[data-nav]` rules in globals.css.
  useLayoutEffect(() => {
    document.documentElement.dataset.nav = navigation.direction;
  }, [navigation.direction]);

  const value = useMemo<ShellContextValue>(
    () => ({
      previousPathname: navigation.previousPathname,
      canGoBack: navigation.depth > 0,
      title: screen.title,
      collapsed: screen.collapsed,
      setTitle: (title) => setScreen((current) => ({ ...current, title })),
      setCollapsed: (collapsed) =>
        setScreen((current) => (current.collapsed === collapsed ? current : { ...current, collapsed })),
    }),
    [navigation.previousPathname, navigation.depth, screen.title, screen.collapsed],
  );

  return <ShellContext value={value}>{children}</ShellContext>;
}

export function useShell(): ShellContextValue {
  const value = useContext(ShellContext);
  if (!value) {
    throw new Error('useShell must be used inside ShellProvider');
  }

  return value;
}
