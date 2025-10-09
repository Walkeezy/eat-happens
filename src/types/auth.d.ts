import 'better-auth/types';

declare module 'better-auth/types' {
  interface User {
    isAdmin: boolean;
    isConfirmed: boolean;
  }
}
