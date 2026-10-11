import 'server-only';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
import { db } from '@/db';

const appBaseURL = process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export const auth = betterAuth({
  baseURL: appBaseURL,
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  user: {
    additionalFields: {
      firstName: {
        type: 'string',
        required: false,
      },
      lastName: {
        type: 'string',
        required: false,
      },
      isAdmin: {
        type: 'boolean',
        defaultValue: false,
        input: false,
      },
      isConfirmed: {
        type: 'boolean',
        defaultValue: false,
        input: false,
      },
    },
  },
  emailAndPassword: {
    enabled: false, // Only using OAuth for now
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      mapProfileToUser: (profile) => ({
        firstName: profile.given_name,
        lastName: profile.family_name,
      }),
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 60, // 60 days
    updateAge: 60 * 60 * 24, // 1 day
    // Page renders read session and user from a signed cookie for up to five minutes instead of the database.
    // Mutations and admin checks bypass it (see verify-session.ts), so only revoking someone's confirmation
    // can take up to five minutes to hide the pages from them.
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  trustedOrigins: [appBaseURL],
  // Lets server actions (sign-in, sign-out) set and clear the auth cookies. Must stay the last plugin.
  plugins: [nextCookies()],
});
