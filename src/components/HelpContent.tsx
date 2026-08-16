'use client';

export default function HelpContent() {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none p-4 rounded-md border border-border bg-card text-card-foreground">
      <h2>Help & User Guide</h2>
      <p>
        <strong>Geovara</strong> is a professional geospatial platform for creating,
        viewing, editing, analyzing, and sharing geographic data. Combining an interactive
        vector canvas with a Monaco code editor, tabular attribute manager, deterministic
        RFC 7946 validation, Turf.js spatial intelligence, and 3D globe visualization, Geovara provides
        engineering-grade tools in a stateless browser-based environment.
      </p>

      <h3>Getting Started & Data Import</h3>
      <p>
        <strong>Import files:</strong> Drag and drop files directly onto the map canvas or use the
        upload zone in the Features tab. Geovara natively parses:
      </p>
      <ul>
        <li><strong>GeoJSON</strong> (.geojson, .json) — RFC 7946 FeatureCollections & Geometries</li>
        <li><strong>ESRI Shapefile</strong> (.zip, .shp) — Native client-side binary parser with DBF attribute extraction</li>
        <li><strong>CSV</strong> (.csv) — Auto-detects coordinate columns (lat, lon, latitude, longitude, wkt)</li>
        <li><strong>WKT</strong> (.wkt, .txt) — Well-Known Text geometric definitions</li>
        <li><strong>TopoJSON</strong> (.topojson, .json) — Topology-preserving vector data</li>
        <li><strong>KML / KMZ</strong> (.kml, .kmz) — Google Earth standard geographic formats</li>
      </ul>

      <p>
        <strong>Location Search:</strong> Use the search bar at the top of the map to find and smoothly
        fly to any address, city, coordinate, or landmark worldwide, with the option to convert results directly into Point features.
      </p>

      <h3>Drawing & Vector Tools</h3>
      <p>
        Use the drawing toolbar on the right side of the map to create geometries with live contextual guidance:
      </p>
      <ul>
        <li><strong>Point:</strong> Single coordinate landmark</li>
        <li><strong>LineString:</strong> Connected line segments, paths, or trajectories</li>
        <li><strong>Polygon:</strong> Enclosed boundaries and geofenced areas</li>
        <li><strong>Rectangle:</strong> Axis-aligned bounding box (BBox)</li>
        <li><strong>Circle:</strong> Geodesic circle approximated as high-fidelity polygon</li>
        <li><strong>Knife / Slice Tool:</strong> Draw a cutting line across any polygon to cleanly split it into separate valid geometries.</li>
        <li><strong>Magnetic Snapping:</strong> Toggle the Magnet icon to automatically snap drawn vertices to existing feature edges and corners.</li>
        <li><strong>Cursor Guide:</strong> Real-time tooltip banner following pointer mouse with gesture instructions.</li>
      </ul>

      <h3>Attribute Table & Batch Field Engineering</h3>
      <p>
        Switch to the <strong>Table</strong> tab to inspect and manipulate data in a high-speed tabular grid:
      </p>
      <ul>
        <li><strong>Inline Cell Editing:</strong> Click on any property cell to edit its value directly.</li>
        <li><strong>Multi-Select Checkboxes:</strong> Select specific rows or click <em>Select All</em> in the header.</li>
        <li><strong>Batch Edit & Calculations:</strong> Click <em>Batch Edit</em> to:
          <ul>
            <li>Mass assign values across multiple features.</li>
            <li>Calculate geometric metrics automatically (<code>$area_ha</code>, <code>$area_m2</code>, <code>$area_km2</code>, <code>$length_m</code>, <code>$centroid_lon</code>, <code>$centroid_lat</code>, <code>$bbox</code>).</li>
            <li>Rename or delete property columns across the entire dataset in a single click.</li>
          </ul>
        </li>
      </ul>

      <h3>Turf.js Spatial Analysis Toolkit</h3>
      <p>
        Click the <strong>Sparkles</strong> icon on the drawing toolbar to open the interactive spatial operations dialog:
      </p>
      <ul>
        <li><strong>Buffer Generator:</strong> Create geodesic buffer zones with custom radius units (meters, kilometers, miles, feet).</li>
        <li><strong>Multi-Ring Reachability:</strong> Generate concentric buffer rings with heat spectrum color gradients for accessibility and hazard zoning.</li>
        <li><strong>Simplify Geometry:</strong> Reduce vertex density using the Douglas-Peucker algorithm with High-Quality topology preservation.</li>
        <li><strong>Convex Hull:</strong> Calculate the minimum bounding convex envelope enclosing coordinate points.</li>
        <li><strong>Centroids Generator:</strong> Extract true geometric centers of mass as Point features.</li>
        <li><strong>Unkink Polygons:</strong> Automatically resolve and split self-intersecting polygon kinks into valid geometries.</li>
        <li><strong>Boolean Union:</strong> Merge multiple overlapping or adjacent polygons into a single seamless polygon.</li>
      </ul>

      <h3>Monaco Code Editor & Real-Time Validation</h3>
      <p>
        Under the <strong>JSON</strong> tab, the full GeoJSON structure is editable via the Monaco IDE engine:
      </p>
      <ul>
        <li><strong>Deterministic RFC 7946 Validation:</strong> Runs continuously in 0ms with zero AI token consumption.</li>
        <li><strong>Interactive Error Locator:</strong> Syntax and structural errors show exact line and column numbers. Clicking the error banner instantly jumps the editor cursor to the faulty line.</li>
        <li><strong>JSON Schema Autocompletion:</strong> Real-time tooltip suggestions and structural validation warnings.</li>
      </ul>

      <h3>2D Projections & Cesium 3D Globe</h3>
      <p>
        Toggle projections and visual dimensions from the Projection Switcher icon in the toolbar:
      </p>
      <ul>
        <li><strong>Web Mercator (EPSG:3857):</strong> Standard projection for web basemaps and interactive panning.</li>
        <li><strong>WGS 84 (EPSG:4326):</strong> Unprojected geographic coordinate system for GIS data interchange.</li>
        <li><strong>Cesium 3D Globe:</strong> Interactive WebGL 3D globe with Carto Voyager and OpenStreetMap imagery.</li>
      </ul>

      <h3>Editing & Keyboard Shortcuts</h3>
      <div className="not-prose my-3">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="py-2 pr-4 font-semibold text-muted-foreground">Category</th>
              <th className="py-2 font-semibold text-muted-foreground">Shortcuts</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border">
              <td className="py-1.5 pr-3 font-medium text-muted-foreground">Drawing</td>
              <td className="py-1.5">
                <kbd className="kbd">V</kbd> Select · <kbd className="kbd">P</kbd> Point · <kbd className="kbd">L</kbd> Line · <kbd className="kbd">G</kbd> Polygon
              </td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-1.5 pr-3 font-medium text-muted-foreground">Shapes</td>
              <td className="py-1.5">
                <kbd className="kbd">R</kbd> Rectangle · <kbd className="kbd">C</kbd> Circle · <kbd className="kbd">E</kbd> Edit
              </td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-1.5 pr-3 font-medium text-muted-foreground">Measure</td>
              <td className="py-1.5">
                <kbd className="kbd">M</kbd> Distance · <kbd className="kbd">A</kbd> Area
              </td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-1.5 pr-3 font-medium text-muted-foreground">AI & Search</td>
              <td className="py-1.5">
                <kbd className="kbd">Ctrl+K</kbd> / <kbd className="kbd">Cmd+K</kbd> Ask Geovara AI
              </td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-1.5 pr-3 font-medium text-muted-foreground">History</td>
              <td className="py-1.5">
                <kbd className="kbd">Ctrl+Z</kbd> Undo · <kbd className="kbd">Ctrl+Y</kbd> Redo
              </td>
            </tr>
            <tr>
              <td className="py-1.5 pr-3 font-medium text-muted-foreground">General</td>
              <td className="py-1.5">
                <kbd className="kbd">Esc</kbd> Deselect · <kbd className="kbd">Del</kbd> / <kbd className="kbd">Backspace</kbd> Delete Feature
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3>Exporting Data</h3>
      <p>Click the Download icon in the toolbar to export your dataset into:</p>
      <ul>
        <li><strong>GeoJSON</strong> — Standard RFC 7946 FeatureCollection</li>
        <li><strong>CSV</strong> — Tabular latitude and longitude spreadsheet</li>
        <li><strong>WKT</strong> — Well-Known Text representation for PostGIS / QGIS</li>
        <li><strong>TopoJSON</strong> — Arc-shared topology vector format</li>
        <li><strong>KML / KMZ</strong> — Keyhole Markup Language for Google Earth</li>
      </ul>

      <h3>Developer & URL API</h3>
      <h4>1. Remote Public GeoJSON Loader</h4>
      <p className="text-xs text-muted-foreground bg-muted p-2 rounded-md font-code break-words">
        <code>/?url=https://example.com/data.geojson</code>
      </p>

      <h4>2. Viewport & Data Deep Linking</h4>
      <p className="text-xs text-muted-foreground bg-muted p-2 rounded-md font-code break-words">
        <code>/#data=N4KABGBEAuCe...&amp;map=8/51.5/-0.1</code>
      </p>

      <h4>3. Browser Console API (<code>window.geovara</code>)</h4>
      <ul className="text-xs space-y-1">
        <li><code>geovara.getGeoJSON()</code> — Returns current FeatureCollection object.</li>
        <li><code>geovara.setGeoJSON(data)</code> — Replaces map features with new GeoJSON object or string.</li>
        <li><code>geovara.addFeature(geom, props)</code> — Adds a single feature to the map.</li>
        <li><code>geovara.clear()</code> — Clears all features from the map and editor.</li>
        <li><code>geovara.zoomToExtent()</code> — Animates camera viewport to fit all features.</li>
        <li><code>geovara.getMap()</code> — Returns the underlying OpenLayers Map instance.</li>
      </ul>
    </div>
  );
}
