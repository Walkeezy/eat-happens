/**
 * Get the full name of a user from their first and last name
 */
export function getUserFullName(firstName: string | null, lastName: string | null): string {
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  }
  if (firstName) {
    return firstName;
  }
  if (lastName) {
    return lastName;
  }

  return 'User';
}

/**
 * Get user initials from first and last name
 */
export function getUserInitials(firstName: string | null, lastName: string | null): string {
  const parts: string[] = [];

  if (firstName) {
    parts.push(firstName[0]);
  }
  if (lastName) {
    parts.push(lastName[0]);
  }

  if (parts.length === 0) {
    return 'U';
  }

  return parts.join('').toUpperCase();
}
