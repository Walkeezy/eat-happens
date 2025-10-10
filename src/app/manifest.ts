import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Eat Happens',
    short_name: 'Eat Happens',
    start_url: '/',
    display: 'fullscreen',
    orientation: 'portrait-primary',
    background_color: '#f8f5ff',
    theme_color: '#6929ff',
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
