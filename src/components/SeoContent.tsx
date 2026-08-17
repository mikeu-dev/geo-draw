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
      <h1>Geovara — Free Online GeoJSON Editor, Shapefile Viewer &amp; Map Drawing Suite</h1>

      <article>
        <h2>Professional Geospatial Data Editing &amp; Analysis Platform</h2>
        <p>
          Geovara is a free, modern web-based GIS platform and GeoJSON editor designed for
          geospatial engineers, developers, urban planners, and GIS analysts. Draw, edit, convert,
          validate, and analyze geographic data across standard 2D cartographic projections and
          photorealistic 3D globe views — 100% in-browser with zero registration or installation required.
        </p>

        <h3>Automatic Shapefile (SHP/ZIP) Import &amp; Reprojection</h3>
        <p>
          Import Shapefile .zip archives seamlessly. Geovara automatically parses SHP, DBF, PRJ,
          and CPG components. When projected coordinate reference systems (such as UTM Zone 48S / EPSG:32748)
          are detected, Geovara leverages Proj4js to automatically reproject geometry coordinates
          into standard WGS 84 (EPSG:4326), guaranteeing instant and accurate visualization on the map.
        </p>

        <h3>Comprehensive Multi-Format Spatial Importer &amp; Exporter</h3>
        <p>
          Convert and edit across leading geospatial file formats: GeoJSON, TopoJSON, Shapefile (.zip),
          Comma-Separated Values (CSV with latitude/longitude or WKT geometries), Well-Known Text (WKT),
          Keyhole Markup Language (KML), and GPS Exchange Format (GPX).
        </p>

        <h3>Interactive Geometry Drawing &amp; Knife Splitting Tool</h3>
        <p>
          Digitize spatial features with high-precision tools: Point, LineString, Polygon, Rectangle,
          and Circle. Utilize the Knife / Slice tool to split polygons into separate geometries with
          automatic attribute preservation. Benefit from magnetic vertex snapping, live vertex editing,
          and complete undo/redo action history (Ctrl+Z / Ctrl+Y).
        </p>

        <h3>Advanced Spatial Operations &amp; Analysis</h3>
        <p>
          Execute powerful geometric algorithms directly in the browser powered by Turf.js: Buffer
          generation with custom distance radius, Convex Hull generation, Polygon Dissolve (merging
          overlapping boundaries), Bounding Box calculation, Centroid extraction, and Douglas-Peucker
          geometry simplification.
        </p>

        <h3>Real-time Geodesic Measurement</h3>
        <p>
          Calculate geodesic distances and polygon surface areas in real-time. Measurement labels
          are dynamically clamped and formatted in metric units (meters, kilometers, m², and km²).
        </p>

        <h3>Photorealistic 3D Globe with Atmosphere &amp; Cartographic Labels</h3>
        <p>
          Experience 3D geospatial exploration powered by CesiumJS. Features include realistic atmospheric
          scattering, dynamic solar lighting, star constellations, synchronized basemap imagery, and
          automatic ground-clamped 3D vector rendering with place name labels.
        </p>

        <h3>0ms Deterministic RFC 7946 Validator</h3>
        <p>
          Validate GeoJSON syntax, geometry types, coordinate bounds, and winding order rules in 0ms
          latency with zero AI quota consumption. Get instant actionable error indicators with exact
          line numbers in the Monaco code editor.
        </p>

        <h3>AI-Powered Spatial Assistant</h3>
        <p>
          Interact with your geospatial data using natural language commands powered by Google Gemini AI.
          Ask the assistant to fly to geographic coordinates, perform spatial buffers, filter feature
          attributes, or query spatial relationships.
        </p>

        <h3>Privacy-First Stateless Architecture</h3>
        <p>
          Geovara processes all spatial operations locally on your machine using in-memory Web Workers.
          Share full map workspaces instantly via URL hashes compressed with LZW algorithms — no data
          is stored on remote servers.
        </p>
      </article>

      <article>
        <h2>Frequently Asked Questions</h2>

        <h3>What is Geovara and how does it compare to geojson.io?</h3>
        <p>
          Geovara is a modern, high-performance alternative to geojson.io. While retaining the simplicity
          of instant browser-based GeoJSON editing, Geovara introduces advanced capabilities including
          automatic Shapefile reprojection, polygon knife slicing, photorealistic 3D globe visualization,
          multi-format conversion (CSV, WKT, KML, TopoJSON), and AI spatial assistance.
        </p>

        <h3>How do I convert Shapefile to GeoJSON online for free?</h3>
        <p>
          Simply drag and drop your Shapefile .zip archive into Geovara. The platform automatically
          extracts the files, detects the coordinate reference system from the .prj file, reprojects
          projected coordinates (like UTM) to WGS84, and outputs valid GeoJSON in the editor for instant export.
        </p>

        <h3>How do I split or cut polygons on a map?</h3>
        <p>
          Activate the Knife (Slice) tool from the toolbar and draw a cut-line across any polygon on the map.
          Geovara computes the intersection and splits the polygon into distinct feature parts while
          retaining all property attributes.
        </p>

        <h3>Can I import CSV files with coordinates or WKT?</h3>
        <p>
          Yes, Geovara automatically parses CSV files containing latitude/longitude columns (such as lat,
          lon, latitude, longitude, Y, X) or Well-Known Text (WKT) geometry columns into interactive map features.
        </p>

        <h3>Is my data private and secure in Geovara?</h3>
        <p>
          Yes. Geovara operates entirely client-side. Your geospatial files, coordinates, and attribute
          tables are never uploaded to or stored on external database servers.
        </p>
      </article>

      <article>
        <h2>Technical Specifications</h2>
        <ul>
          <li>Framework: Next.js (App Router) &amp; TypeScript (Strict Mode)</li>
          <li>2D Mapping Engine: OpenLayers (v9+)</li>
          <li>3D Globe Engine: CesiumJS &amp; OL-Cesium</li>
          <li>Spatial Algorithms: Turf.js &amp; Proj4js</li>
          <li>Code Editor: Monaco Editor with JSON schema validation</li>
          <li>Multi-Threading: Web Worker data parsing</li>
          <li>Supported Projections: WGS 84 (EPSG:4326), Web Mercator (EPSG:3857), UTM Zones</li>
          <li>File Formats: GeoJSON, TopoJSON, Shapefile (ZIP), CSV, WKT, KML, GPX</li>
        </ul>
      </article>
    </section>
  );
}
