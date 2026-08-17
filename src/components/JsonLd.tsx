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
    'Professional GeoJSON editor and geospatial suite. Draw, edit, and export geometries with automatic Shapefile (SHP/ZIP) reprojection, CSV/WKT/KML/TopoJSON converter, polygon knife splitting, buffer analysis, photorealistic 3D globe, and AI spatial assistance — free, no signup required.',
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
    'Interactive Map Drawing (Point, Line, Polygon, Rectangle, Circle)',
    'Polygon Slicing & Knife Tool (Line Split Operations)',
    'Automatic Shapefile (SHP/ZIP) Import & Proj4 Reprojection to WGS84',
    'Multi-Format Conversion (GeoJSON, TopoJSON, CSV, WKT, KML, GPX)',
    'CesiumJS 3D Globe with Atmosphere, Sunlight, & Cartographic Labels',
    'Real-time Deterministic RFC 7946 GeoJSON Validator (0ms Latency)',
    'AI-Powered Natural Language Spatial Assistant (Google Gemini)',
    'Advanced Spatial Analysis (Buffer, Dissolve, Convex Hull, Bounding Box, Centroid)',
    'Real-time Geodesic Distance & Area Measurement',
    'CRS Projection Switching (EPSG:4326 WGS84 / EPSG:3857 Web Mercator)',
    'Monaco Code Editor with Bidirectional Real-time Map Sync',
    'Stateless URL-Driven Sharing Architecture with LZW Compression',
    'Web Worker Multi-Threaded Processing for Large Datasets (>5MB)',
    'Full Undo/Redo Action History Stack (Ctrl+Z / Ctrl+Y)',
    'Map Screenshot & High-Resolution Canvas Export',
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
    ratingValue: '4.9',
    ratingCount: '180',
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
        text: 'Geovara is a free, professional-grade online GeoJSON editor, Shapefile viewer, and GIS analysis platform. It enables users to draw, edit, analyze, and convert geospatial data in standard 2D projections and photorealistic 3D globe views directly in the browser with no signup required.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I import and reproject Shapefile (SHP/ZIP) files in Geovara?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! Geovara includes built-in Shapefile parsing and automatic reprojection powered by Proj4js and CPG encoding detection. You can drag and drop Shapefile .zip archives (including projected coordinates like UTM) and Geovara will automatically reproject and display them in standard WGS84 coordinates.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I split or cut a polygon in Geovara?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Select the Knife (Slice) tool from the drawing toolbar and draw a line that cuts completely across your polygon. Geovara uses Turf.js line-split algorithms to slice the polygon into multiple independent geometries while preserving attribute properties.',
      },
    },
    {
      '@type': 'Question',
      name: 'What geospatial file formats are supported for import and export?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Geovara supports importing and exporting GeoJSON, TopoJSON, Shapefile (.zip), CSV (latitude/longitude or WKT columns), Well-Known Text (WKT), KML, and GPX files.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does 3D Globe mode work in Geovara?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Geovara integrates CesiumJS to provide a photorealistic 3D globe with atmospheric scattering, dynamic solar lighting, and cartographic place labels. All 2D vector data is automatically synchronized, clamped to the globe surface, and labeled in 3D space.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is Geovara free and privacy-friendly?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, Geovara is 100% free with no account creation or watermarks. All spatial processing and file parsing execute locally in your browser (in-memory and Web Workers), ensuring complete privacy for your geospatial data.',
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
