# Geovara: Professional Geospatial Platform & GeoJSON Engineering Tool

Geovara is an advanced, high-performance, stateless geospatial data engineering platform and map editor. Built with Next.js App Router, OpenLayers, CesiumJS, and Turf.js, it combines the flexibility of an interactive vector drawing canvas with a Monaco-powered code editor, deterministic RFC 7946 validation, spatial intelligence, and 3D globe visualization.

---

## Architecture Principles

- **Stateless by Design**: No server-side database required. All geometries, projections, and viewport coordinates are synchronized in real-time via LZW-compressed URL hash parameters (`#data=...&map=...`), making every project instantly shareable.
- **Client-Side Privacy**: Data stays inside the client browser. No feature collections are stored on external servers unless requested explicitly via third-party export.
- **Dual View Synchronization**: Bidirectional, non-blocking synchronization between the interactive OpenLayers vector layer, the Attribute Table grid, and the Monaco code editor.
- **Deterministic Accuracy**: Zero-latency spatial algorithms and strict RFC 7946 GeoJSON schema validation operating completely offline.

---

## Core Capabilities

### 1. Vector Drawing & Geometry Manipulation
- **Multi-Geometry Creation**: Draw Point, LineString, Polygon, Rectangle (BBox), and Circle geometries with real-time coordinate calculation.
- **Vertex Editing & Snapping**: Modify existing boundaries, move vertices, and drag geometries interactively.
- **Visual Styling**: Customize fill color, stroke color, opacity, and stroke width per feature with instant map and table synchronization.
- **Measurement Tools**: Real-time geodesic distance (meters/kilometers) and polygon area (square meters/hectares/square kilometers) calculation tools.

### 2. Monaco Code Editor & Inline Real-Time Validation
- **Integrated IDE Experience**: Fully embedded Monaco Editor with JSON syntax highlighting, formatting, and folding.
- **Deterministic RFC 7946 Validator**: High-speed schema validator that verifies geometry types, coordinate bounds, closure rules, and nesting levels in 0ms without consuming AI tokens.
- **Interactive Error Jump**: The status bar displays syntax errors with exact line and column numbers. Clicking on the error banner instantly jumps the Monaco editor cursor to the faulty line.
- **Schema Autocompletion**: Integrated GeoJSON JSON Schema for inline autocompletion and structural tooltips.

### 3. Attribute Table & Field Management
- **Interactive Data Grid**: Tabular inspection of all properties associated with GeoJSON features.
- **Inline Cell Editing**: Modify property keys and values directly in the table with instant feature reflection.
- **Schema Expansion**: Add custom fields and delete existing properties across all features in a single click.
- **Search-to-Point Focus**: Filter features by keyword and zoom directly to the selected geometry on the canvas.

### 4. Multi-Format Interoperability
- **GeoJSON**: Standard RFC 7946 import and export.
- **TopoJSON**: Export and topological conversion via `topojson-server` and `topojson-client`.
- **CSV Support**: Auto-detects latitude/longitude coordinate columns (`lat`, `latitude`, `lng`, `lon`, `longitude`, `wkt`) or embedded WKT strings.
- **WKT (Well-Known Text)**: Parse and generate WKT geometries (`POINT`, `LINESTRING`, `POLYGON`, `MULTIPOINT`, `MULTILINESTRING`, `MULTIPOLYGON`).
- **KML**: Native import support for Google Earth and GIS workflows.
- **Drag-and-Drop & Remote Loader**: Drag files directly onto the viewport or load external datasets using the URL query parameter (`?url=https://.../data.geojson`).

### 5. 3D Globe Visualization (CesiumJS & OLCesium)
- **Cesium 3D Engine**: Seamless transition between 2D flat maps and an interactive 3D WebGL globe.
- **High-Resolution Basemap**: Integrated Carto Voyager and OpenStreetMap imagery layers projected onto the 3D ellipsoid.
- **Zero-Token WGS84 Fallback**: Operates using the standard WGS84 ellipsoid without requiring third-party token dependencies. Supports optional Cesium Ion 3D World Terrain when an access token is provided.
- **Memory-Safe Lifecycle**: Single-instance controller prevents WebGL canvas leaks across component re-renders.

### 6. Coordinate Reference Systems (CRS)
- **Web Mercator (EPSG:3857)**: Industry-standard projection for web basemaps and interactive panning.
- **WGS 84 (EPSG:4326)**: Geographic coordinate system for spatial analysis and global data exchange.
- **On-the-Fly Reprojection**: Toggle between projections seamlessly without data loss.

### 7. Spatial Intelligence & Computation (Turf.js)
- **Buffer Generation**: Compute geodesic buffers with custom radius units (meters, kilometers).
- **Centroid Calculation**: Generate geometric centers for complex polygon networks.
- **BBox & Extent Fitting**: Automated bounding box calculation with animated viewport framing.
- **Live Geometry Metrics**: Continuous calculation of perimeter, area, and bounding coordinates.

### 8. AI Natural Language Assistant (Google Gemini)
- **Conversational Geospatial Commands**: Transform natural language instructions into spatial operations (e.g., "draw a polygon around Monas Jakarta", "create a 5km buffer around selected features").
- **Zero-Latency Pattern Matcher**: Local regex-based fast parser resolves common commands in 0ms before routing complex requests to the LLM.
- **LRU Intent Cache**: In-memory caching layer eliminates redundant API calls for repeated prompt structures.

### 9. Developer Console API (`window.geovara`)
Full programmatic access via the browser console:
```javascript
// Access the active GeoJSON dataset
window.geovara.getGeoJSON();

// Update map features programmatically
window.geovara.setGeoJSON({
  type: "FeatureCollection",
  features: [...]
});

// Add a single feature
window.geovara.addFeature({
  type: "Feature",
  geometry: { type: "Point", coordinates: [106.8271, -6.1754] },
  properties: { name: "National Monument" }
});

// Fit map view to current features
window.geovara.zoomToExtent();

// Access the underlying OpenLayers Map instance
const map = window.geovara.getMap();
```

---

## Technical Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 15+ (App Router), React 19 |
| **Language** | TypeScript (Strict Mode) |
| **2D Mapping Engine** | OpenLayers 9 |
| **3D Visualization** | CesiumJS 1.113 & OLCesium 2.17 |
| **Spatial Computation** | Turf.js |
| **Code Editor** | Monaco Editor (`@monaco-editor/react`) |
| **State & URL Sync** | `lz-string` (LZW algorithm) |
| **Styling & Components** | Tailwind CSS, Radix UI, Lucide Icons |
| **AI Integration** | Google Genkit / Gemini 1.5 Pro |
| **Testing Suite** | Vitest, Testing Library, Playwright E2E |

---

## Project Structure

```
geovara/
├── public/                  # Static assets, PWA manifests, icons, Cesium bundles
├── src/
│   ├── ai/                  # Genkit and Gemini AI configuration
│   ├── app/                 # Next.js App Router (layout, page, route handlers)
│   ├── components/          # UI and map components
│   │   ├── ui/              # Radix UI primitives (buttons, dialogs, dropdowns)
│   │   ├── AttributeTable.tsx
│   │   ├── CesiumController.tsx
│   │   ├── DrawingTools.tsx
│   │   ├── LocationSearch.tsx
│   │   ├── MapComponent.tsx
│   │   ├── MonacoEditor.tsx
│   │   ├── SceneViewSwitcher.tsx
│   │   └── Sidebar.tsx
│   ├── hooks/               # Custom React hooks (useMap, useUndoHistory, useToast)
│   ├── lib/                 # Core algorithms and utilities
│   │   ├── ai-intent-cache.ts
│   │   ├── csv-geojson.ts
│   │   ├── dev-api.ts
│   │   ├── geojson-validator.ts
│   │   ├── spatial.ts
│   │   ├── url-state.ts
│   │   └── wkt-geojson.ts
│   └── types/               # TypeScript interfaces and schema declarations
├── tests/                   # Vitest unit and integration test suites
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

5. Open your browser and navigate to `http://localhost:9002` (or the port specified in `package.json`).

---

## Verification & Quality Assurance

### Run Unit Tests
```bash
npm run test
```
Executes all 12 test suites covering CSV parsing, WKT translation, URL compression, spatial calculations, and deterministic GeoJSON validation.

### Run TypeScript Verification
```bash
npm run typecheck
```
Ensures strict type compliance with zero compilation warnings.

### Run Linting
```bash
npm run lint
```

### Build Production Bundle
```bash
npm run build
```

---

## Security & Compliance

- **No Data Retention**: Client edits are kept in local memory and compressed in the URL hash.
- **Input Sanitization**: All imports (CSV, WKT, GeoJSON, KML) are strictly validated before being injected into the OpenLayers data source.
- **Environment Isolation**: Secret API keys (`GEMINI_API_KEY`) remain strictly on the server-side Next.js route handler and are never exposed to the client bundle.

---

## License

This project is licensed under the MIT License.
