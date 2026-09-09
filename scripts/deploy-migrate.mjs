#!/usr/bin/env node

/**
 * Applies pending Drizzle migrations as part of a production deploy.
 *
 * Migrations used to be a manual step, so a deploy could ship code that queries
 * columns the database does not have yet (see `0004_add_picked_by_user`).
 * Running this from the deploy build keeps schema and code in lockstep.
 *
 * Preview deploys are skipped on purpose: they usually share the production
 * DATABASE_URL, and a branch that is not merged yet must not migrate production.
 */

import { execFileSync } from 'node:child_process';

const deployEnv = process.env.VERCEL_ENV ?? process.env.DEPLOY_ENV;

if (deployEnv && deployEnv !== 'production') {
  console.info(`[migrate] skipped: deploy environment is "${deployEnv}", not "production"`);
  process.exit(0);
}

if (!process.env.DATABASE_URL) {
  console.error('[migrate] DATABASE_URL is not set, refusing to build without applying migrations');
  process.exit(1);
}

console.info('[migrate] applying pending migrations');
execFileSync('drizzle-kit', ['migrate'], { stdio: 'inherit' });
console.info('[migrate] done');
