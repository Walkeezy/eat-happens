import { AdminTabs } from '@/components/layout/admin-tabs';
import { PageHeader } from '@/components/layout/page-header';
import { UsersTable } from '@/components/users-table';
import { requireAdminPage } from '@/lib/verify-session';
import { getAllUsers } from '@/services/users';

export default async function UsersPage() {
  const { user } = await requireAdminPage();
  const users = await getAllUsers();
  const pendingCount = users.filter((candidate) => !candidate.isConfirmed).length;

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Benutzer"
        description={pendingCount > 0 ? `${pendingCount} warten auf Bestätigung` : `${users.length} Benutzer`}
      />
      <AdminTabs />
      <UsersTable users={users} currentUserId={user.id} />
    </>
  );
}
