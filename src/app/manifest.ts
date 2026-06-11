import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Geovara — Free Online GeoJSON Editor & Map Drawing Tool',
    short_name: 'Geovara',
    description:
      'Professional GeoJSON editor with AI-powered spatial analysis. Draw, edit, and export geometries on an interactive map. Free, no signup required.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f1729',
    theme_color: '#2e9e8f',
    orientation: 'any',
    categories: ['developer', 'utilities', 'productivity'],
    icons: [
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
