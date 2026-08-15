'use client';

export default function HelpContent() {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none p-4 rounded-md border border-border bg-card text-card-foreground">
      <h2>Help & User Guide</h2>
      <p>
        <strong>Geovara</strong> is a professional geospatial platform for creating,
        viewing, editing, analyzing, and sharing geographic data. Combining an interactive
        vector canvas with a Monaco code editor, tabular attribute manager, deterministic
        RFC 7946 validation, spatial intelligence, and 3D globe visualization, Geovara provides
        engineering-grade tools in a browser-based environment.
      </p>

      <h3>Getting Started & Data Import</h3>
      <p>
        <strong>Import files:</strong> Drag and drop files directly onto the map canvas or use the
        upload zone in the Features tab. Geovara natively parses:
      </p>
      <ul>
        <li><strong>GeoJSON</strong> (.geojson, .json) — RFC 7946 FeatureCollections & Geometries</li>
        <li><strong>CSV</strong> (.csv) — Auto-detects coordinate columns (lat, lon, latitude, longitude, wkt)</li>
        <li><strong>WKT</strong> (.wkt, .txt) — Well-Known Text geometric definitions</li>
        <li><strong>TopoJSON</strong> (.topojson, .json) — Topology-preserving vector data</li>
        <li><strong>KML / KMZ</strong> (.kml, .kmz) — Google Earth standard geographic formats</li>
      </ul>

      <p>
        <strong>Location Search:</strong> Use the search bar at the top of the map to find and smoothly
        fly to any address, city, coordinate, or landmark worldwide.
      </p>

      <h3>Drawing & Vector Tools</h3>
      <p>
        Use the drawing toolbar on the right side of the map to create geometries:
      </p>
      <ul>
        <li><strong>Point:</strong> Single coordinate landmark</li>
        <li><strong>LineString:</strong> Connected line segments, paths, or trajectories</li>
        <li><strong>Polygon:</strong> Enclosed boundaries and geofenced areas</li>
        <li><strong>Rectangle:</strong> Axis-aligned bounding box (BBox)</li>
        <li><strong>Circle:</strong> Geodesic circle (approximated as high-fidelity polygon for GeoJSON compatibility)</li>
      </ul>

      <h3>Attribute Table & Field Management</h3>
      <p>
        Switch to the <strong>Table</strong> tab to inspect and edit your data in a spreadsheet grid:
      </p>
      <ul>
        <li><strong>Inline Cell Editing:</strong> Click on any property cell to edit its value directly.</li>
        <li><strong>Add / Delete Field:</strong> Expand your dataset schema with new custom columns.</li>
        <li><strong>Search & Filter:</strong> Filter features across all attributes in real-time.</li>
        <li><strong>Search-to-Point Zoom:</strong> Click the target icon next to any feature row to focus the map directly on its geometry.</li>
      </ul>

      <h3>Monaco Code Editor & Real-Time Validation</h3>
      <p>
        Under the <strong>JSON</strong> tab, the full GeoJSON structure is editable via the Monaco IDE engine:
      </p>
      <ul>
        <li><strong>Deterministic RFC 7946 Validation:</strong> Runs continuously in 0ms with zero AI token consumption.</li>
        <li><strong>Interactive Error Locator:</strong> Syntax and structural errors show exact line and column numbers. Clicking the error banner instantly jumps the editor cursor to the exact line.</li>
        <li><strong>JSON Schema Autocompletion:</strong> Real-time tooltip suggestions and squiggly line warnings for malformed data.</li>
      </ul>

      <h3>2D Projections & Cesium 3D Globe</h3>
      <p>
        Toggle projections and visual dimensions from the Projection Switcher icon in the toolbar:
      </p>
      <ul>
        <li><strong>Web Mercator (EPSG:3857):</strong> Standard projection for web basemaps and interactive panning.</li>
        <li><strong>WGS 84 (EPSG:4326):</strong> Unprojected geographic coordinate system for GIS data interchange.</li>
        <li><strong>Cesium 3D Globe:</strong> Photorealistic 3D ellipsoid globe with high-resolution Carto Voyager and OpenStreetMap textures.</li>
      </ul>

      <h3>Measurement & Spatial Analysis</h3>
      <p>
        Use the measurement tools to compute live geodesic dimensions:
      </p>
      <ul>
        <li><strong>Measure Distance (Ruler):</strong> Calculates cumulative line length in meters or kilometers.</li>
        <li><strong>Measure Area (Square):</strong> Computes enclosed geodesic area in square meters, hectares, and square kilometers.</li>
      </ul>
      <p>Access the Spatial Analysis menu (crosshair icon) for geometric algorithms:</p>
      <ul>
        <li><strong>Buffer:</strong> Generate buffer zones around points, lines, or polygons with custom radius.</li>
        <li><strong>Centroid:</strong> Compute true geometric centers of complex polygons.</li>
        <li><strong>Simplify:</strong> Reduce vertex density using Douglas-Peucker algorithm.</li>
        <li><strong>Union:</strong> Dissolve and merge overlapping polygon geometries.</li>
      </ul>

      <h3>AI Natural Language Assistant</h3>
      <p>
        Press <kbd>Ctrl+K</kbd> (or <kbd>Cmd+K</kbd> on macOS) to open the <strong>Ask Geovara</strong> AI prompt:
      </p>
      <ul>
        <li>Execute natural language spatial commands (e.g., <em>&quot;Draw a 500m buffer around selected points&quot;</em>).</li>
        <li>Generate custom geometries and convert data structures on the fly.</li>
        <li>0ms Fast Pattern Matcher resolves common queries locally before routing complex requests to Gemini.</li>
      </ul>

      <h3>Editing & Keyboard Shortcuts</h3>
      <p>
        Click the <strong>Pencil</strong> icon to enter vertex modification mode. Drag vertices to reshape geometries.
        Hold <kbd>Shift</kbd> while dragging to move the entire geometry.
      </p>
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

      <h3>Feature Styling (simplestyle-spec)</h3>
      <p>
        Add properties to features to control visual rendering on the canvas:
      </p>
      <ul>
        <li><code>fill</code> — Fill color (HEX, RGB, or RGBA, e.g. <code>#9333ea</code>)</li>
        <li><code>fill-opacity</code> — Opacity of polygon fill (0.0 to 1.0)</li>
        <li><code>stroke</code> — Border and line stroke color</li>
        <li><code>stroke-width</code> — Line thickness in pixels</li>
        <li><code>stroke-opacity</code> — Opacity of line border (0.0 to 1.0)</li>
        <li><code>radius</code> — Point marker radius in pixels</li>
      </ul>

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
      <p>Preload any public CORS-enabled GeoJSON directly via URL query parameter:</p>
      <p className="text-xs text-muted-foreground bg-muted p-2 rounded-md font-code break-words">
        <code>/?url=https://example.com/data.geojson</code>
      </p>

      <h4>2. Viewport & Data Deep Linking</h4>
      <p className="text-xs text-muted-foreground bg-muted p-2 rounded-md font-code break-words">
        <code>/#data=N4KABGBEAuCe...&amp;map=8/51.5/-0.1</code>
      </p>

      <h4>3. Browser Console API (<code>window.geovara</code>)</h4>
      <p>Open Developer Tools (F12) Console to programmatically interact with Geovara:</p>
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

