# Eat Happens

A restaurant rating app for a group of friends who dine together monthly. Rate restaurants, track events, and see what everyone thinks!

## Prerequisites

- Node.js 22+
- PostgreSQL database

## Environment Variables

1. Copy the environment variables template:

```bash
cp .env.example .env
```

2. Fill in the required values in `.env`:

### Database Setup

- Set up a PostgreSQL database
- Update `DATABASE_URL` with your database credentials

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" and create OAuth 2.0 Client ID
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for development)
   - `https://yourdomain.com/api/auth/callback/google` (for production)
6. Copy the Client ID and Client Secret to your `.env` file

### Better Auth Secret

Generate a random secret for `BETTER_AUTH_SECRET`:

```bash
openssl rand -base64 32
```

## Installation

1. Install dependencies:

```bash
npm install
```

2. Push database schema to your database:

```bash
npm run db:push
```

Or alternatively, generate and run migrations:

```bash
npm run db:generate
npm run db:migrate
```

## Running the App

Start the development server:

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the login page.

## Admin Setup

By default, the first user to sign up will need to be manually set as admin in the database:

```sql
UPDATE "user" SET "is_admin" = true WHERE email = 'your-email@example.com';
```

You can also use Drizzle Studio to manage your database:

```bash
npm run db:studio
```

## Next Steps

- Set up your production database
- Configure production environment variables
- Deploy to your hosting platform (Vercel, etc.)
