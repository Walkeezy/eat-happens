import { AdminTabs } from '@/components/layout/admin-tabs';
import { PageHeader } from '@/components/layout/page-header';
import { type AdminUserRow, UsersTable } from '@/components/users-table';
import { calendarDateOf, displayCalendarDate } from '@/lib/calendar-date';
import { requireAdminPage } from '@/lib/verify-session';
import { getAllUsers } from '@/services/users';

export default async function UsersPage() {
  // The query does not depend on who is asking, so it runs while the session is being verified.
  const [{ user }, users] = await Promise.all([requireAdminPage(), getAllUsers()]);
  const pendingCount = users.filter((candidate) => !candidate.isConfirmed).length;

  // The table is a client component - hand it only the fields it renders.
  const rows: AdminUserRow[] = users.map(({ id, name, email, image, isAdmin, isConfirmed, createdAt }) => ({
    id,
    name,
    email,
    image,
    isAdmin,
    isConfirmed,
    registeredOn: displayCalendarDate(calendarDateOf(createdAt)),
  }));

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Benutzer"
        description={pendingCount > 0 ? `${pendingCount} warten auf Bestätigung` : `${users.length} Benutzer`}
      />
      <AdminTabs />
      <UsersTable users={rows} currentUserId={user.id} />
    </>
  );
}
