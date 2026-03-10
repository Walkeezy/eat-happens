import { createAuthClient } from 'better-auth/react';

const appBaseURL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export const authClient = createAuthClient({
  baseURL: appBaseURL,
});
