import { AppLayout } from '@/components/layout/app-layout';
import { UsersTable } from '@/components/users-table';
import { requireAdminPage } from '@/lib/verify-session';
import { getAllUsers } from '@/services/users';

export default async function UsersPage() {
  const { user } = await requireAdminPage();
  const users = await getAllUsers();

  return (
    <AppLayout>
      <h1 className="mb-4 text-2xl font-bold">Benutzer</h1>
      <UsersTable users={users} currentUserId={user.id} />
    </AppLayout>
  );
}
