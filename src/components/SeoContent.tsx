/**
 * Server Component — SEO-optimized crawlable content.
 *
 * This content is visually hidden (sr-only) but fully accessible to
 * search engine crawlers and screen readers. It provides the semantic
 * HTML structure and keyword-rich text that Google needs to understand
 * and rank this application.
 *
 * All content accurately describes real Geovara features.
 */
export default function SeoContent() {
  return (
    <section aria-label="About Geovara" className="sr-only">
      <h1>Geovara — Free Online GeoJSON Editor &amp; Map Drawing Tool</h1>

      <article>
        <h2>Professional Geospatial Data Editing Platform</h2>
        <p>
          Geovara is a free, browser-based GeoJSON editor designed for professional GIS workflows.
          Draw points, lines, polygons, rectangles, and circles on an interactive map powered by
          OpenLayers. Edit feature properties, validate GeoJSON structure, and export your data —
          all without signup or installation.
        </p>

        <h3>Interactive Map Drawing Tools</h3>
        <p>
          Create geographic features directly on the map with precision drawing tools. Geovara
          supports Point, LineString, Polygon, Rectangle, and Circle geometries. Edit existing
          features with drag-and-drop vertex manipulation. Delete individual features or clear the
          entire canvas. Every action supports undo and redo for a professional editing experience.
        </p>

        <h3>AI-Powered Spatial Analysis</h3>
        <p>
          Geovara includes an AI spatial assistant that understands natural language commands. Ask
          it to fly to a location, change the basemap, or perform buffer analysis on selected
          features. Powered by Google Gemini AI, the assistant provides intelligent geospatial
          operations without requiring GIS expertise.
        </p>

        <h3>Real-time GeoJSON Editor</h3>
        <p>
          View and edit raw GeoJSON code in a professional Monaco editor with syntax highlighting.
          Changes sync bidirectionally between the code editor and the map in real-time. Import
          GeoJSON, TopoJSON, or KML files by drag-and-drop. Export your work as GeoJSON or TopoJSON
          format.
        </p>

        <h3>Spatial Analysis &amp; Measurement</h3>
        <p>
          Perform advanced spatial operations including buffer analysis, centroid calculation, and
          intersection detection powered by Turf.js. Measure distances and areas in real-time with
          professional measurement tools. Results are displayed in metric units (meters, kilometers,
          square meters, square kilometers).
        </p>

        <h3>CRS Projection Support</h3>
        <p>
          Switch between WGS 84 (EPSG:4326) and Web Mercator (EPSG:3857) coordinate reference
          systems. Geovara handles projection transformation automatically, ensuring your geospatial
          data maintains accuracy across different coordinate systems used in web mapping and GIS
          applications.
        </p>

        <h3>3D Globe Visualization</h3>
        <p>
          Toggle between 2D map view and an immersive 3D globe powered by CesiumJS and OL-Cesium.
          Visualize your geographic data in a three-dimensional context with terrain elevation,
          satellite imagery, and smooth globe navigation.
        </p>

        <h3>Shareable Stateless Architecture</h3>
        <p>
          Geovara uses a unique URL-driven architecture where your entire workspace — including all
          GeoJSON features — is compressed using LZW algorithms and stored in the URL hash. Share
          complex map workspaces with a single link. No account, no server storage, no database
          required.
        </p>

        <h3>High-Performance Processing</h3>
        <p>
          Large GeoJSON datasets (over 5MB) are processed in dedicated Web Workers to maintain 60fps
          UI responsiveness. VectorImageLayer optimization uses rasterization caching for dense
          geometry datasets, significantly reducing GPU and CPU overhead during map interactions.
        </p>
      </article>

      <article>
        <h2>Frequently Asked Questions</h2>

        <h3>What is a GeoJSON editor?</h3>
        <p>
          A GeoJSON editor is a tool that allows you to create, view, edit, and validate GeoJSON
          data — the standard format (RFC 7946) for encoding geographic data structures. Geovara is
          a free online GeoJSON editor that provides both visual map-based editing and raw code
          editing with real-time synchronization.
        </p>

        <h3>How do I draw polygons on a map online?</h3>
        <p>
          Open Geovara in your browser and select the Polygon tool from the drawing toolbar. Click
          on the map to place vertices of your polygon. Double-click to finish drawing. Your polygon
          is automatically converted to GeoJSON format that you can copy, export, or share via URL.
        </p>

        <h3>Can I convert GeoJSON to TopoJSON?</h3>
        <p>
          Yes, Geovara supports exporting your map data as TopoJSON format. TopoJSON is an extension
          of GeoJSON that encodes topology, resulting in smaller file sizes while preserving the
          spatial relationships between features.
        </p>

        <h3>Is Geovara an alternative to geojson.io?</h3>
        <p>
          Yes, Geovara is a modern alternative to geojson.io with additional professional features
          including AI-powered spatial analysis, buffer operations, 3D globe visualization,
          measurement tools, and advanced CRS projection support. Like geojson.io, Geovara is free
          and requires no signup.
        </p>

        <h3>What file formats does Geovara support?</h3>
        <p>
          Geovara supports importing and exporting GeoJSON and TopoJSON formats. You can drag and
          drop GeoJSON or TopoJSON files directly onto the map to import geographic data. The
          platform validates all imported data using Zod schemas to ensure structural integrity.
        </p>
      </article>

      <article>
        <h2>Technical Specifications</h2>
        <ul>
          <li>Built with Next.js (App Router) and TypeScript</li>
          <li>Mapping engine: OpenLayers (enterprise-grade)</li>
          <li>3D visualization: CesiumJS with OL-Cesium integration</li>
          <li>Spatial computations: Turf.js</li>
          <li>AI assistant: Google Gemini via Genkit</li>
          <li>Data validation: Zod schema validation</li>
          <li>State management: URL-based with LZW compression</li>
          <li>UI framework: Tailwind CSS with Radix UI primitives</li>
          <li>Web Workers for off-thread data processing</li>
          <li>Supports EPSG:4326 and EPSG:3857 projections</li>
        </ul>
      </article>
    </section>
  );
}
