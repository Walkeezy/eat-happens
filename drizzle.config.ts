import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    // DATABASE_URL isn't required for schema-only commands (e.g. `generate`) or static
    // analysis tools like knip that load this file without a live DB connection.
    url: process.env.DATABASE_URL as string,
  },
});
