import type { auth } from '@/lib/auth';
import { inferAdditionalFields } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

const appBaseURL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export const authClient = createAuthClient({
  baseURL: appBaseURL,
  plugins: [inferAdditionalFields<typeof auth>()],
});
