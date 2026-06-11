import type { Metadata } from 'next';
import Script from 'next/script';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const CESIUM_VERSION = '1.113';
const CESIUM_BASE = `https://cesium.com/downloads/cesiumjs/releases/${CESIUM_VERSION}/Build/Cesium`;

export const metadata: Metadata = {
  title: 'Geovara',
  description: 'Draw geometries on a map and get GeoJSON.',
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
      </head>
      <body className={`${inter.className} font-body antialiased h-full`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
