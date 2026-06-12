# Eat Happens

A restaurant rating app for a group of friends who dine together monthly. Rate restaurants and see what everyone thinks!

## Tech Stack

- [Next.js](https://nextjs.org/) (App Router) with React
- [Tailwind CSS](https://tailwindcss.com/) and [shadcn/ui](https://ui.shadcn.com/)
- [Drizzle ORM](https://orm.drizzle.team/) with PostgreSQL
- [better-auth](https://www.better-auth.com/) with Google OAuth

## Getting Started

### Prerequisites

- Node.js 24+
- A PostgreSQL database
- Google OAuth credentials (client ID and secret)

### Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.template` to `.env` and fill in the values:

   | Variable               | Description                                          |
   | ---------------------- | ---------------------------------------------------- |
   | `DATABASE_URL`         | PostgreSQL connection string                         |
   | `NEXT_PUBLIC_APP_URL`  | Public app URL (e.g. `http://localhost:3000`)        |
   | `BETTER_AUTH_URL`      | Base URL for better-auth (usually same as app URL)   |
   | `BETTER_AUTH_SECRET`   | Auth secret, generate with `openssl rand -base64 32` |
   | `GOOGLE_CLIENT_ID`     | Google OAuth client ID                               |
   | `GOOGLE_CLIENT_SECRET` | Google OAuth client secret                           |

3. Apply database migrations:

   ```bash
   npm run db:migrate
   ```

4. Start the dev server:

   ```bash
   npm run dev
   ```

New users sign in with Google and must be confirmed by an admin (via `/users`) before they can use the app. The first admin must be set directly in the database (`user.is_admin = true`).

## Scripts

| Script                | Description                                  |
| --------------------- | -------------------------------------------- |
| `npm run dev`         | Start the development server                 |
| `npm run build`       | Production build                             |
| `npm run test`        | Run unit tests (Vitest)                      |
| `npm run lint`        | ESLint, type check, and unused exports check |
| `npm run format`      | Format all files with Prettier               |
| `npm run db:generate` | Generate a migration from schema changes     |
| `npm run db:migrate`  | Apply pending migrations                     |
| `npm run db:studio`   | Open Drizzle Studio                          |
