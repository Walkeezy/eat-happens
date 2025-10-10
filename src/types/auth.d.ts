import 'better-auth/types';

declare module 'better-auth/types' {
  interface User {
    firstName: string | null;
    lastName: string | null;
    isAdmin: boolean;
    isConfirmed: boolean;
  }
}
