import { CalendarDays, ChartNoAxesCombined, House, type LucideIcon, ShieldUser, Trophy, Users } from 'lucide-react';
import { previousCalendarYearRange } from '@/lib/calendar-date';

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  isActive: (pathname: string) => boolean;
};

const home: NavItem = { href: '/', label: 'Übersicht', icon: House, isActive: (pathname) => pathname === '/' };

const statistics: NavItem = {
  href: '/statistics',
  label: 'Statistiken',
  icon: ChartNoAxesCombined,
  isActive: (pathname) => pathname.startsWith('/statistics'),
};

const yearInReview = (): NavItem => ({
  href: `/jahresrueckblick/${previousCalendarYearRange().year}`,
  label: 'Rückblick',
  icon: Trophy,
  isActive: (pathname) => pathname.startsWith('/jahresrueckblick'),
});

const events: NavItem = {
  href: '/events',
  label: 'Events',
  icon: CalendarDays,
  isActive: (pathname) => pathname.startsWith('/events'),
};

const users: NavItem = {
  href: '/users',
  label: 'Benutzer',
  icon: Users,
  isActive: (pathname) => pathname.startsWith('/users'),
};

/** Header links: admin pages get their own entries since there is room for them. */
export function headerNavItems(isAdmin: boolean): NavItem[] {
  return isAdmin ? [home, statistics, yearInReview(), events, users] : [home, statistics, yearInReview()];
}

/** Bottom tab bar: the admin pages share a single tab to keep it at four entries. */
export function bottomNavItems(isAdmin: boolean): NavItem[] {
  const admin: NavItem = {
    href: '/events',
    label: 'Admin',
    icon: ShieldUser,
    isActive: (pathname) => events.isActive(pathname) || users.isActive(pathname),
  };

  return isAdmin ? [home, statistics, yearInReview(), admin] : [home, statistics, yearInReview()];
}
