import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import JsonLd from '@/components/JsonLd';
import SeoContent from '@/components/SeoContent';

const CESIUM_VERSION = '1.113';
const CESIUM_BASE = `https://cesium.com/downloads/cesiumjs/releases/${CESIUM_VERSION}/Build/Cesium`;

const BASE_URL = 'https://geovara.vercel.app';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f6f8' },
    { media: '(prefers-color-scheme: dark)', color: '#0f1729' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  title: {
    default: 'Geovara — Free Online GeoJSON Editor & Map Drawing Tool',
    template: '%s | Geovara',
  },

  description:
    'Professional GeoJSON editor with AI-powered spatial analysis. Draw, edit, and export geometries on an interactive map. Buffer analysis, TopoJSON conversion, 3D globe view, measurement tools — free, no signup required.',

  keywords: [
    'geojson editor',
    'geojson editor online',
    'online map editor',
    'draw on map',
    'geospatial data editor',
    'map drawing tool',
    'geojson validator',
    'spatial analysis tool',
    'web gis tool',
    'geojson to topojson',
    'buffer analysis',
    'polygon drawing tool',
    'free gis software',
    'openlayers editor',
    'geojson creator',
    'geojson viewer',
    'draw polygon on map online',
    'map editor free',
    'geofence drawing tool',
    'interactive map tool',
    'geojson.io alternative',
    'geojson map editor',
    'coordinate reference system',
    'EPSG 4326',
    'web mercator',
  ],

  authors: [{ name: 'Geovara Team', url: BASE_URL }],
  creator: 'Geovara',
  publisher: 'Geovara',

  applicationName: 'Geovara',
  category: 'Technology',
  classification: 'Geographic Information System',

  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: BASE_URL,
    siteName: 'Geovara',
    title: 'Geovara — Free Online GeoJSON Editor & Map Drawing Tool',
    description:
      'Professional GeoJSON editor with AI spatial analysis. Draw, edit, and export geometries on an interactive map — free, no signup.',
    images: [
      {
        url: '/og-image.png',
        width: 1024,
        height: 1024,
        alt: 'Geovara — Professional GeoJSON Editor & Map Drawing Tool',
        type: 'image/png',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Geovara — Free Online GeoJSON Editor & Map Drawing Tool',
    description:
      'Professional GeoJSON editor with AI spatial analysis. Draw, edit, and export geometries on an interactive map — free, no signup.',
    images: ['/og-image.png'],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  alternates: {
    canonical: '/',
  },

  verification: {
    google: 'googleaa30292efcadb7ba',
  },

  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'Geovara',
  },

  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href={`${CESIUM_BASE}/Widgets/widgets.css`} />
        <Script
          id="cesium-base-url"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `window.CESIUM_BASE_URL = '${CESIUM_BASE}/';`,
          }}
        />
        <Script src={`${CESIUM_BASE}/Cesium.js`} strategy="beforeInteractive" />
        <Script
          src="https://cdn.jsdelivr.net/npm/ol-cesium@2.17.0/dist/olcesium.js"
          strategy="beforeInteractive"
        />
        <JsonLd />
      </head>
      <body className="font-body antialiased h-full">
        <SeoContent />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
