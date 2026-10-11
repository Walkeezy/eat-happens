import type { NextConfig } from 'next';

/** Sent with every response. The app embeds nothing from other origins except Google profile pictures. */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  typedRoutes: true,
  experimental: {
    // Lets React's <ViewTransition> animate route changes (see PageTransition).
    viewTransition: true,
    // Switching back to a tab visited in the last 30s renders from the router cache instead of waiting on the
    // server. Server actions revalidate, so a user's own changes still show immediately.
    staleTimes: { dynamic: 30 },
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
