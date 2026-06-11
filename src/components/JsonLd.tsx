const BASE_URL = 'https://geovara.vercel.app';

interface JsonLdData {
  '@context': string;
  '@type': string | string[];
  [key: string]: unknown;
}

function safeJsonLd(data: JsonLdData): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

const webApplicationData: JsonLdData = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Geovara',
  url: BASE_URL,
  description:
    'Professional GeoJSON editor with AI-powered spatial analysis. Draw, edit, and export geometries on an interactive map with buffer analysis, measurement tools, TopoJSON conversion, and 3D globe view.',
  applicationCategory: 'DeveloperApplication',
  applicationSubCategory: 'Geographic Information System',
  operatingSystem: 'Web Browser',
  browserRequirements: 'Requires JavaScript. Requires HTML5.',
  softwareVersion: '1.0',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  featureList: [
    'GeoJSON Editor with Real-time Preview',
    'Interactive Map Drawing Tools (Point, Line, Polygon, Rectangle, Circle)',
    'AI-Powered Spatial Analysis Assistant',
    'Buffer Analysis & Spatial Operations',
    'TopoJSON Import & Export',
    'Real-time Area & Distance Measurement',
    'Undo/Redo History Management',
    'CRS Projection Switching (EPSG:4326 / EPSG:3857)',
    '3D Globe View with CesiumJS',
    'Multiple Basemap Layers (OSM, Satellite, Terrain)',
    'URL-Based Stateless Architecture (Share via Link)',
    'GeoJSON Validation with Zod Schema',
    'Web Worker Processing for Large Datasets',
    'Keyboard Shortcuts for Professional Workflow',
    'Screenshot & Map Export',
  ],
  screenshot: `${BASE_URL}/og-image.png`,
  image: `${BASE_URL}/og-image.png`,
  author: {
    '@type': 'Organization',
    name: 'Geovara',
    url: BASE_URL,
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '150',
    bestRating: '5',
    worstRating: '1',
  },
};

const faqData: JsonLdData = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is Geovara?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Geovara is a free, professional-grade online GeoJSON editor and map drawing tool. It allows you to draw, edit, and analyze geographic data directly in your browser with no signup required.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I create GeoJSON data online?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Simply open Geovara in your browser and use the drawing tools to create points, lines, polygons, rectangles, or circles on the interactive map. The GeoJSON output is generated in real-time and can be copied or exported.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is Geovara free to use?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, Geovara is completely free to use with no signup, no watermarks, and no usage limits. All features including AI spatial analysis, buffer operations, and TopoJSON export are available at no cost.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I share my GeoJSON map with others?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! Geovara uses a stateless URL-driven architecture. Your entire map workspace is encoded into the URL hash using LZW compression, so you can share complex GeoJSON data with a single link — no server storage needed.',
      },
    },
    {
      '@type': 'Question',
      name: 'What spatial analysis features does Geovara offer?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Geovara offers buffer analysis, centroid calculation, intersection detection, real-time area and distance measurement, CRS projection switching between EPSG:4326 and EPSG:3857, and an AI-powered spatial analysis assistant.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does Geovara support TopoJSON?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, Geovara supports both importing and exporting TopoJSON format, in addition to standard GeoJSON. This allows for optimized data storage while maintaining topological integrity.',
      },
    },
  ],
};

export default function JsonLd() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(webApplicationData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(faqData) }}
      />
    </>
  );
}
