export const getInitials = (name: string | null) => {
  if (!name) {
    return '?';
  }

  return name
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
};

export function displayName(user: { firstName?: string | null; name?: string | null; email?: string | null }): string {
  return user.firstName || user.name || user.email || 'Unbekannt';
}
