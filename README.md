# Geovara: Professional Geospatial Platform & GeoJSON Engineering Tool

Geovara is an advanced, high-performance, stateless geospatial data engineering platform and map editor. Built with Next.js App Router, OpenLayers, CesiumJS, and Turf.js, it combines the flexibility of an interactive vector drawing canvas with a Monaco-powered code editor, deterministic RFC 7946 validation, client-side spatial intelligence, and realistic 3D globe visualization.

---

## Architecture Principles

- **Stateless by Design**: No server-side database required. All geometries, projections, and viewport coordinates are synchronized in real-time via LZW-compressed URL hash parameters (`#data=...&map=...`), making every project instantly shareable.
- **Client-Side Privacy**: Data stays inside the client browser. No feature collections are stored on external servers unless requested explicitly via third-party export.
- **Dual View Synchronization**: Bidirectional, non-blocking synchronization between the interactive OpenLayers vector layer, the Attribute Table grid, and the Monaco code editor.
- **Deterministic Accuracy**: Zero-latency spatial algorithms and strict RFC 7946 GeoJSON schema validation operating completely offline.
- **Indonesian Archipelago Default Extent**: Default 2D map and 3D globe viewports are centered around the Indonesian archipelago (`[118.0148, -2.5489]`, `zoom = 5`).

---

## Core Capabilities

### 1. Vector Drawing & Geometry Manipulation
- **Multi-Geometry Creation**: Draw Point, LineString, Polygon, Rectangle (BBox), and Circle geometries with real-time coordinate calculation.
- **Interactive Knife / Slice Tool**: Draw a cutting line across any active polygon to cleanly split it into separate valid sub-polygons with inherited attributes.
- **Magnetic Snapping Engine**: Automatically snaps drawn vertices to existing feature edges and corners within a 12px tolerance to prevent polygon slivers.
- **Contextual Cursor Guide**: Real-time floating tooltip providing gesture guidance for every active drawing and measurement tool.
- **Vertex Editing & Snapping**: Modify existing boundaries, move vertices, and drag geometries interactively.
- **Visual Styling**: Customize fill color, stroke color, opacity, and stroke width per feature with instant map and table synchronization.
- **Measurement Tools**: Real-time geodesic distance (meters/kilometers) and polygon area (square meters/hectares/square kilometers) calculation tools.

### 2. Monaco Code Editor & Inline Real-Time Validation
- **Integrated IDE Experience**: Fully embedded Monaco Editor with JSON syntax highlighting, formatting, and folding.
- **Deterministic RFC 7946 Validator**: High-speed schema validator that verifies geometry types, coordinate bounds, closure rules, and nesting levels in 0ms without consuming AI tokens.
- **Interactive Error Jump**: The status bar displays syntax errors with exact line and column numbers. Clicking on the error banner instantly jumps the Monaco editor cursor to the faulty line.
- **Schema Autocompletion**: Integrated GeoJSON JSON Schema for inline autocompletion and structural tooltips.
- **Safe Deletion & Confirmation Modals**: Interactive modal dialogs (*AlertDialog*) prevent accidental data loss when clearing datasets or deleting individual features.

### 3. Attribute Table & Batch Property Engineering
- **Interactive Data Grid**: Tabular inspection of all properties associated with GeoJSON features.
- **Inline Cell Editing**: Modify property keys and values directly in the table with instant feature reflection.
- **Batch Property Mutation**: Mass-assign values, rename fields, or delete columns across multiple features in a single click.
- **Calculated Geometry Metrics**: Auto-compute geometric properties (`$area_ha`, `$area_m2`, `$area_km2`, `$length_m`, `$centroid_lon`, `$centroid_lat`, `$bbox`) into tabular columns.
- **Multi-Selection Checkboxes**: Select rows individually or in bulk for targeted batch transformations.
- **Search-to-Point Focus**: Filter features by keyword and zoom directly to the selected geometry on the canvas.

### 4. Turf.js Spatial Analysis Toolkit
- **Client-Side Spatial Operations**: Dedicated visual modal for instantaneous geometric calculations:
  - **Buffer Generator**: Compute geodesic buffers with custom radius units (meters, kilometers, miles, feet).
  - **Multi-Ring Reachability**: Generate concentric buffer rings with heat spectrum color gradients for accessibility and hazard zoning.
  - **Douglas-Peucker Simplification**: Reduce geometry vertex count with High-Quality topology preservation.
  - **Convex Hull**: Compute the outer bounding polygon enclosing selected coordinates.
  - **Centroids Extraction**: Generate center-of-mass Point features from complex polygon networks.
  - **Unkink Polygons**: Automatically resolve and untangle self-intersecting polygon kinks.
  - **Boolean Operations**: Perform geometric Union, Intersection, and Difference cuts between overlapping polygons.

### 5. Multi-Format Interoperability & Auto-Reprojection
- **GeoJSON**: Standard RFC 7946 import and export.
- **ESRI Shapefile with Proj4 Reprojection**: Native client-side binary parser for zipped Shapefile archives (`.zip` containing `.shp`, `.dbf`, `.prj`, and `.cpg`) and standalone `.shp` files. Automatically reads `.prj` files to reproject projected coordinate systems (such as UTM Zone 48S / EPSG:32748, Web Mercator, State Plane) into standard WGS84 (`EPSG:4326`), with `.cpg` charset decoding.
- **TopoJSON**: Export and topological conversion via `topojson-server` and `topojson-client`.
- **CSV Support**: Auto-detects latitude/longitude coordinate columns (`lat`, `latitude`, `lng`, `lon`, `longitude`, `wkt`) or embedded WKT strings.
- **WKT (Well-Known Text)**: Parse and generate WKT geometries (`POINT`, `LINESTRING`, `POLYGON`, `MULTIPOINT`, `MULTILINESTRING`, `MULTIPOLYGON`).
- **KML / KMZ**: Native import support for Google Earth and GIS workflows.
- **Drag-and-Drop & Remote Loader**: Drag files directly onto the viewport or load external datasets using the URL query parameter (`?url=https://.../data.geojson`).

### 6. Realistic 3D Globe Visualization (CesiumJS)
- **Interactive 3D WebGL Globe**: Realistic Earth representation featuring dynamic solar/lunar lighting, star-field space skybox, and realistic atmospheric haze.
- **Global Hybrid Reference Overlay**: Multi-layered cartographic place labels, cities, islands, and country boundaries (Google Earth and geojson.io style).
- **Synchronized Basemap Engine**: Real-time basemap synchronization between 2D flat maps and the 3D globe across OpenStreetMap, Esri World Imagery (Satellite), OpenTopoMap (Topography), and CartoDB Dark Matter.
- **Mini Preview Cards UI**: 2x2 SVG visual thumbnail switcher with zero layout shift and dynamic opacity controls.
- **Zero-Token WGS84 Fallback**: Operates using the standard WGS84 ellipsoid without third-party token dependencies. Supports optional Cesium Ion 3D World Terrain when an access token is provided.

### 7. Resizable Workspace Layout
- **Horizontal Drag Resize**: Click and drag the right edge of the sidebar horizontally to expand up to 50% of the viewport width (`50vw`).
- **Drag-to-Collapse**: Dragging past the threshold collapses the sidebar completely to maximize the map canvas.
- **Conditional Toggle Button**: A subtle toggle button appears on the edge only when the sidebar is hidden.

### 8. Coordinate Reference Systems (CRS)
- **Web Mercator (EPSG:3857)**: Industry-standard projection for web basemaps and interactive panning.
- **WGS 84 (EPSG:4326)**: Geographic coordinate system for spatial analysis and global data exchange.
- **On-the-Fly Reprojection**: Toggle between projections seamlessly without data loss.

### 9. AI Natural Language Assistant (Google Gemini)
- **Conversational Geospatial Commands**: Transform natural language instructions into spatial operations (e.g., "draw a polygon around Monas Jakarta", "create a 5km buffer around selected features", "fix self intersecting polygon", "calculate area in hectares").
- **Zero-Latency Pattern Matcher**: Local regex-based fast parser resolves common commands in 0ms before routing complex requests to the LLM.
- **LRU Intent Cache**: In-memory caching layer eliminates redundant API calls for repeated prompt structures.

### 10. Developer Console API (`window.geovara`)
Full programmatic access via the browser DevTools (F12) console:
```javascript
// Access the active GeoJSON dataset
window.geovara.getGeoJSON();

// Update map features programmatically
window.geovara.setGeoJSON({
  type: "FeatureCollection",
  features: [...]
});

// Run client-side Turf.js spatial operations directly
const buffered = window.geovara.spatial.buffer(window.geovara.getGeoJSON(), 500, 'meters');
const rings = window.geovara.spatial.multiRingBuffer(window.geovara.getFeatures()[0], [100, 300, 500], 'meters');
const merged = window.geovara.spatial.union(window.geovara.getGeoJSON());
const clean = window.geovara.spatial.unkink(window.geovara.getGeoJSON());

// Fit map view to current features
window.geovara.zoomToExtent();
```

---

## Technical Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 15+ (App Router), React 19 |
| **Language** | TypeScript (Strict Mode) |
| **2D Mapping Engine** | OpenLayers 9+ |
| **3D Visualization** | CesiumJS 1.113 & OLCesium 2.17 |
| **Spatial Computation** | Turf.js 7 |
| **Projection Engine** | `proj4` (on-the-fly coordinate reprojection) |
| **Code Editor** | Monaco Editor (`@monaco-editor/react`) |
| **Shapefile / Archive** | `jszip`, Custom binary SHP/DBF parser with `.prj` & `.cpg` support |
| **State & URL Sync** | `lz-string` (LZW algorithm) |
| **Styling & Components** | Tailwind CSS, Radix UI, Lucide Icons |
| **AI Integration** | Google Genkit / Gemini 2.0 Flash |
| **Testing Suite** | Vitest, Playwright E2E |

---

## Project Structure

```
geovara/
├── public/                  # Static assets, PWA manifests, icons, Cesium bundles
├── src/
│   ├── ai/                  # Genkit and Gemini AI configuration & spatial intent flows
│   ├── app/                 # Next.js App Router (layout, page, route handlers)
│   ├── components/          # UI and map components
│   │   ├── ui/              # Radix UI primitives (alert-dialog, buttons, dialogs, dropdowns)
│   │   ├── AttributeTable.tsx
│   │   ├── BasemapSwitcher.tsx
│   │   ├── BatchPropertyModal.tsx
│   │   ├── CesiumController.tsx
│   │   ├── CursorGuide.tsx
│   │   ├── DrawingTools.tsx
│   │   ├── FileDropZone.tsx
│   │   ├── HelpContent.tsx
│   │   ├── LocationSearch.tsx
│   │   ├── MapComponent.tsx
│   │   ├── MonacoEditor.tsx
│   │   ├── SpatialToolsDialog.tsx
│   │   └── Sidebar.tsx
│   ├── hooks/               # Custom React hooks (useMap, useUndoHistory, useToast)
│   ├── lib/                 # Core algorithms and utilities
│   │   ├── ai-intent-cache.ts
│   │   ├── csv-geojson.ts
│   │   ├── dev-api.ts
│   │   ├── geojson-validator.ts
│   │   ├── shapefile-parser.ts
│   │   ├── spatial-operations.ts
│   │   ├── url-state.ts
│   │   └── wkt-geojson.ts
│   └── types/               # TypeScript interfaces and schema declarations
├── tests/                   # Vitest unit and integration test suites (15 suites, 103 tests)
├── e2e/                     # Playwright automated UX usability benchmark suite
├── .env.example             # Environment configuration template
├── package.json             # Project dependencies and script definitions
└── tsconfig.json            # TypeScript configuration
```

---

## Getting Started

### Prerequisites
- Node.js 18.18+ or 20+
- npm, pnpm, or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/mikeu-dev/geovara.git
   cd geovara
   ```

2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` and add your `GEMINI_API_KEY` (obtained from Google AI Studio).

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:9002`.

---

## Verification & Quality Assurance

### Run Unit Tests
```bash
npm run test
```
Executes all 15 test suites (103 tests, 100% passed) covering Shapefile parsing with `proj4` projection transforms, spatial operations, Boolean geometry algorithms, CSV/WKT parsing, URL compression, and deterministic GeoJSON validation.

### Run TypeScript Verification
```bash
npm run typecheck
```
Ensures strict type compliance with zero compilation warnings.

### Run Linting
```bash
npm run lint
```

### Run End-to-End Tests
```bash
npm run test:e2e
```

### Build Production Bundle
```bash
npm run build
```

---

## Security & Compliance

- **No Data Retention**: Client edits are kept in local memory and compressed in the URL hash.
- **Input Sanitization**: All imports (CSV, WKT, GeoJSON, KML, Shapefiles) are strictly validated before being injected into the OpenLayers data source.
- **Environment Isolation**: Secret API keys (`GEMINI_API_KEY`) remain strictly on the server-side Next.js route handler and are never exposed to the client bundle.

---

## Author & Maintainer

- **Author**: [mikeu-dev](https://github.com/mikeu-dev)
- **Contact**: `rikiruswandi28@gmail.com`

---

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for full details.

Copyright (c) 2026 mikeu-dev &lt;rikiruswandi28@gmail.com&gt;
