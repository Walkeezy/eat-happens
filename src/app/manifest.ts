import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Eat Happens',
    short_name: 'Eat Happens',
    start_url: '/',
    scope: '/',
    // Standalone keeps the system status bar, like a native app; fullscreen would hide the clock and battery.
    display: 'standalone',
    orientation: 'portrait-primary',
    // Matches the page background (--muted) and header (--background), so the splash screen hands over without a flash.
    background_color: '#f8f5ff',
    theme_color: '#ffffff',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
