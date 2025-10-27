# Eat Happens

A restaurant rating app for a group of friends who dine together monthly. Rate restaurants and see what everyone thinks!

## Configuration

### Environment Variables

- `DATABASE_URL` - Database connection string
- `AUTH_SECRET` - Authentication secret key
- `AUTH_URL` - Authentication URL
- `RATINGS_REVEAL_DATE` (optional) - ISO 8601 date string for when ratings should be revealed. If set, all ratings will be hidden until this date/time. Users can still see who has rated and their own rating, but not other users' ratings or average ratings.
  - Example: `2025-12-31T23:59:59Z` (UTC)
  - Example: `2025-12-31T23:59:59+01:00` (with timezone)
  - If not set, ratings will always be visible
