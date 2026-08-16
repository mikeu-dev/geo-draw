# Riset Mendalam geojson.io

> **Status riset:** 15 Agustus 2026  
> **Fokus:** produk, sejarah arsitektur, data model, API, import/export, workflow developer, dan relevansinya untuk belajar GIS Developer.

## 1. Ringkasan Eksekutif

**geojson.io** adalah editor data spasial berbasis browser untuk membuat, melihat, mengedit, dan membagikan data geospasial. Proyek ini open source dan berada di repository `mapbox/geojson.io`.

Nilai geojson.io untuk seorang GIS Developer bukan hanya karena ia bisa menggambar polygon di browser. Ia merupakan contoh nyata bagaimana sebuah **spatial editor** dibangun:

- peta interaktif;
- geometry drawing/editing;
- GeoJSON sebagai model data;
- feature properties/attribute editing;
- import/export berbagai format;
- spatial operations;
- pencarian lokasi → Point feature;
- URL-based data loading;
- integrasi GitHub/Gist;
- API untuk berinteraksi dengan aplikasi dari browser console.

Repository resmi menyebut fitur pembuatan/editing geometry dan attributes, import/export GeoJSON, KML, CSV, Shapefile, drawing Point/Line/Polygon/Rectangle/Circle, bulk property editing, keyboard shortcuts, serta query parameters untuk preload data eksternal.

**Kesimpulan utama:** geojson.io layak dipelajari sebagai **referensi desain aplikasi GIS web**, bukan sebagai library yang harus dihafalkan.

---

# 2. Identitas Proyek

- Nama: **geojson.io**
- Repository: `mapbox/geojson.io`
- Kategori: browser-based spatial data editor
- Lisensi repository: ISC
- Bahasa modern codebase: TypeScript
- Fokus data utama: GeoJSON
- Platform: Web
- Website: https://geojson.io/
- Repository: https://github.com/mapbox/geojson.io

Repository resminya mendeskripsikan geojson.io sebagai tool yang cepat dan sederhana untuk membuat, melihat, dan berbagi spatial data.

Sumber:
- Repository resmi: https://github.com/mapbox/geojson.io

---

# 3. Sejarah dan Evolusi Arsitektur

## 3.1 Era awal — 2013

geojson.io awalnya dibuat pada 2013 oleh Tom MacWright sebagai editor sederhana untuk GeoJSON.

Versi awal menggunakan:

```text
Mapbox.js
    ↓
Leaflet
    ↓
Leaflet Draw
```

Fokusnya adalah membuat pengalaman sederhana untuk membuat dan mengedit GeoJSON di browser.

### Pelajaran arsitektur

Pada fase ini, geojson.io sangat dekat dengan paradigma Leaflet:

```text
DOM / SVG / Canvas
        ↓
Map rendering
        ↓
Drawing interaction
        ↓
GeoJSON
```

---

## 3.2 Migrasi akhir 2022

Pada akhir 2022, geojson.io direfaktor menggunakan:

```text
Mapbox GL JS
+
Mapbox GL Draw
```

Ini merupakan perubahan paradigma dari pendekatan berbasis Leaflet menuju rendering vector berbasis WebGL.

Secara konseptual:

```text
Generasi awal:

Leaflet
  ↓
DOM / SVG / Canvas
  ↓
Map interaction


Generasi 2022:

Mapbox GL JS
  ↓
WebGL
  ↓
Vector rendering
```

Perubahan ini penting karena menunjukkan bahwa GIS frontend mengikuti evolusi teknologi rendering browser.

---

## 3.3 Overhaul 2026

Pada awal 2026, geojson.io mengalami overhaul besar menggunakan fork dari **Placemark Play**, proyek open-source map editor lain yang dikembangkan Tom MacWright.

Repository resmi menyebut perubahan berupa:

- modernized React + TypeScript codebase;
- UI yang diperbarui;
- drawing tools yang lebih baik;
- multiselect;
- bulk editing;
- spatial operations;
- search result → Point feature;
- peningkatan import/export;
- peningkatan performa.

Ada pull request resmi:

> **Promote /next React app to repo root (legacy app cutover)**

PR #983 dibuka pada 28 Mei 2026.

Artinya, ketika mempelajari source code geojson.io pada 2026, kita tidak boleh hanya mengandalkan tutorial lama yang menjelaskan arsitektur Leaflet atau Mapbox GL generasi sebelumnya.

Sumber:
- Repository: https://github.com/mapbox/geojson.io
- Pull Request #983: https://github.com/mapbox/geojson.io/pull/983

---

# 4. Feature Set Saat Ini

Repository resmi menyebut kemampuan utama:

### Geometry

- Point
- LineString
- Polygon
- Rectangle
- Circle

### Data editing

- edit geometry;
- edit properties;
- Feature Editor;
- Table Panel;
- bulk editing;
- multiselect;
- keyboard shortcuts.

### Data format

- GeoJSON;
- KML;
- CSV;
- Shapefile.

### Spatial functionality

- spatial operations;
- search result menjadi Point feature.

### Integration

- URL query parameters;
- external GeoJSON;
- GitHub;
- GitHub Gist.

Sumber:
https://github.com/mapbox/geojson.io

---

# 5. GeoJSON sebagai Model Data

Konsep terpenting yang dapat dipelajari dari geojson.io adalah:

> **GeoJSON bukan hanya format export; ia dapat menjadi model data utama aplikasi spatial editor.**

Model sederhananya:

```text
FeatureCollection
        │
        ├── Feature
        │      │
        │      ├── Geometry
        │      │      ├── Point
        │      │      ├── LineString
        │      │      ├── Polygon
        │      │      └── ...
        │      │
        │      └── Properties
        │
        └── Feature
```

Contoh:

```json
{
  "type": "Feature",
  "properties": {
    "name": "Purwakarta"
  },
  "geometry": {
    "type": "Point",
    "coordinates": [107.5, -6.5]
  }
}
```

Di sini:

```text
Feature
 ├── geometry
 └── properties
```

adalah dua konsep berbeda.

---

# 6. Geometry vs Feature vs Properties

Ini merupakan fondasi GIS web development.

## Geometry

Menyatakan bentuk spasial:

```text
Point
LineString
Polygon
MultiPoint
MultiLineString
MultiPolygon
GeometryCollection
```

## Feature

Menggabungkan geometry dengan atribut:

```text
Feature
 ├── geometry
 └── properties
```

## FeatureCollection

Mengelompokkan banyak feature:

```text
FeatureCollection
 ├── Feature A
 ├── Feature B
 └── Feature C
```

Secara konseptual:

```text
Spatial Dataset
      │
      ├── Geometry
      │
      └── Attributes
```

Konsep ini nantinya muncul lagi pada:

- PostGIS;
- Shapefile;
- GeoPackage;
- GeoJSON;
- vector tiles;
- spatial APIs.

---

# 7. Prinsip "Data sebagai Source of Truth"

Untuk aplikasi seperti geojson.io, konsep yang sangat berguna adalah:

```text
                 GeoJSON State
                      │
          ┌───────────┴───────────┐
          ↓                       ↓
      Map Renderer             Editor UI
          ↓                       ↓
      Visual Map            Properties/Table
```

Bukan:

```text
Map
 ↓
tebak state
 ↓
buat GeoJSON
```

Tetapi:

```text
Data Model
    ↓
 ┌──┴──┐
 ↓     ↓
Map   UI
```

Ketika user menggambar:

```text
User Draw
    ↓
Geometry berubah
    ↓
Feature berubah
    ↓
GeoJSON state berubah
    ↓
UI + map mencerminkan state
```

Ini adalah prinsip arsitektur yang sangat berguna ketika membuat GIS app dengan SvelteKit + OpenLayers.

---

# 8. Feature Editor dan Attribute Table

GIS tidak hanya berurusan dengan geometry.

Setiap feature juga memiliki atribut:

```text
ID         : 123
name       : Sukatani
population : 102340
status     : active
```

dan geometry:

```text
Polygon
```

Sehingga:

```text
Feature
 ├── Geometry
 │      └── Polygon
 │
 └── Properties
        ├── name
        ├── population
        └── status
```

Feature Editor dan Table Panel membawa konsep ini mendekati **attribute table** yang umum di GIS desktop.

Ini sangat penting karena GIS Developer tidak hanya membuat peta; ia juga mengelola hubungan antara:

```text
Spatial Data
+
Attribute Data
```

---

# 9. Bulk Editing dan Multiselect

Overhaul 2026 memperkenalkan kemampuan bulk editing dan multiselect.

Secara konseptual:

```text
Map
 ├── Feature A
 ├── Feature B
 ├── Feature C
 └── Feature D
```

kemudian user dapat memilih beberapa feature:

```text
Feature A
Feature B
Feature D
```

dan mengubah atribut bersama.

Ini merupakan pola yang sangat relevan untuk aplikasi GIS administrasi/data management.

---

# 10. Spatial Operations

Spatial operations adalah salah satu perkembangan penting pada generasi baru geojson.io.

Secara konsep:

```text
Feature A
      +
Feature B
      ↓
Spatial operation
      ↓
Result Feature
```

Contoh operasi geometri yang secara umum ditemui dalam GIS:

```text
intersection
union
difference
buffer
distance
```

Hal ini mempertemukan dua dunia:

```text
Map Rendering
      +
Computational Geometry
```

Untuk implementasi web, library seperti Turf.js sangat relevan.

Konsep:

```text
GeoJSON
   ↓
Turf.js
   ↓
Spatial computation
   ↓
GeoJSON result
```

---

# 11. Search → Point

Generasi baru geojson.io juga menambahkan kemampuan menjadikan hasil pencarian sebagai Point feature.

Alurnya:

```text
User
 │
 │ "Purwakarta"
 ↓
Geocoder
 ↓
Search result
 ↓
longitude + latitude
 ↓
GeoJSON Point Feature
```

Ini merupakan contoh nyata hubungan antara:

```text
Geocoding
+
GeoJSON
+
Map Interaction
```

---

# 12. Import dan Export

geojson.io mendukung beberapa format.

```text
GeoJSON
KML
CSV
Shapefile
```

Model arsitektur yang baik adalah menjadikan GeoJSON sebagai representasi internal:

```text
KML ──────┐
CSV ──────┤
SHP ──────┼──→ Internal GeoJSON ──→ UI
GeoJSON ──┘
                    │
                    ↓
                 Export
```

Dengan demikian UI tidak harus memahami setiap format secara langsung.

---

# 13. KML → GeoJSON

Dalam ekosistem Mapbox terdapat `@mapbox/togeojson`.

Fungsinya:

```text
KML
 ↓
toGeoJSON
 ↓
GeoJSON
```

Library ini dapat digunakan di browser maupun Node.js.

Contoh CLI:

```bash
npm install -g @mapbox/togeojson

togeojson file.kml > file.geojson
```

Sumber:
https://github.com/mapbox/togeojson

---

# 14. WKT ↔ GeoJSON

Ekosistem terkait Mapbox juga memiliki `wellknown`.

Fungsinya:

```text
WKT → GeoJSON
GeoJSON → WKT
```

Contoh:

```text
POINT(107.5 -6.5)
```

dapat diparse menjadi geometry GeoJSON.

Repository:
https://github.com/mapbox/wellknown

Ini penting untuk dipahami karena GIS memiliki banyak format representasi geometry.

---

# 15. Vector Tile → GeoJSON

Terdapat pula `vt2geojson`, yang dapat mengambil feature dari vector tiles dan menghasilkan GeoJSON.

Konsep:

```text
Vector Tile
    ↓
vt2geojson
    ↓
GeoJSON FeatureCollection
```

Repository:
https://github.com/mapbox/vt2geojson

Ini membantu memahami hubungan:

```text
GeoJSON
vs
Vector Tiles
```

GeoJSON cocok untuk data feature yang perlu dibaca/edit secara langsung, sedangkan vector tiles dirancang untuk distribusi/rendering data dalam bentuk tile.

---

# 16. URL API geojson.io

Dokumentasi resmi menyediakan dua kelompok API:

1. URL API
2. Browser Console API

Sumber:
https://github.com/mapbox/geojson.io/blob/main/API.md

---

## 16.1 Map parameter

Format:

```text
#map=zoom/latitude/longitude
```

Contoh:

```text
https://geojson.io/#map=2/20/0
```

Ini memungkinkan aplikasi membuka map pada lokasi/zoom tertentu.

---

## 16.2 Inline GeoJSON

GeoJSON dapat dimasukkan melalui URL:

```text
#data=data:application/json,...
```

GeoJSON harus di-encode menggunakan konsep seperti:

```js
encodeURIComponent(
  JSON.stringify(geojson)
)
```

Konsep:

```text
GeoJSON
 ↓
JSON.stringify
 ↓
encodeURIComponent
 ↓
URL
 ↓
geojson.io
```

---

## 16.3 External GeoJSON

geojson.io juga dapat mengambil GeoJSON dari URL:

```text
#data=data:text/x-url,...
```

Resource harus:

- publicly accessible;
- tidak berada di balik password;
- mendukung CORS;
- menghasilkan GeoJSON valid.

Contoh workflow:

```text
Laravel API
    ↓
/api/areas.geojson
    ↓
CORS
    ↓
geojson.io
    ↓
Visual inspection
```

Ini sangat berguna untuk debugging API GIS.

---

# 17. GitHub Integration

API geojson.io mendukung pemuatan file GeoJSON dari GitHub.

Konsep URL:

```text
id=github:user/repository/blob/branch/file.geojson
```

GeoJSON juga dapat dimuat dari GitHub Gist.

Workflow developer:

```text
GitHub
   ↓
GeoJSON
   ↓
geojson.io
   ↓
Visual inspection
```

Ini membuat geojson.io sangat cocok sebagai tool debugging untuk repository yang berisi spatial data.

---

# 18. Browser Console API

Dokumentasi API juga mengekspos sebagian internal application melalui browser console.

### Map

```js
window.api.map
```

Merupakan instance map yang digunakan aplikasi pada arsitektur yang terdokumentasi tersebut.

### Data

```js
window.api.data
```

Merupakan data model.

Dokumentasi menunjukkan pola seperti:

```js
data.get('map')
data.set(...)
data.mergeFeatures(...)
```

### Draw

```js
window.api.draw
```

Mengekspos instance drawing engine.

### Events

```js
window.api.on(event, fn)
```

dapat digunakan untuk event yang diekspos aplikasi.

Sumber:
https://github.com/mapbox/geojson.io/blob/main/API.md

**Catatan:** Console API pada dokumentasi mencerminkan API aplikasi yang diekspos; jangan menganggap setiap detail internal tersebut sebagai kontrak API publik yang stabil untuk versi masa depan.

---

# 19. geojsonio-cli

Pernah terdapat CLI resmi:

```text
mapbox/geojsonio-cli
```

yang memungkinkan file atau stream dikirim ke geojson.io.

Contoh:

```bash
geojsonio map.geojson
```

atau:

```bash
cat map.geojson | geojsonio
```

Workflow KML:

```bash
togeojson foo.kml | geojsonio
```

Namun repository CLI tersebut **diarsipkan pada 18 September 2024** dan sekarang read-only.

Repository:
https://github.com/mapbox/geojsonio-cli

Jadi tool ini sebaiknya dianggap sebagai bagian dari sejarah/workflow legacy, bukan komponen aktif yang harus dijadikan fondasi proyek baru.

---

# 20. Workflow Developer yang Menarik

## Workflow 1 — Debug GeoJSON API

```text
Laravel / Node API
       ↓
GeoJSON endpoint
       ↓
geojson.io
       ↓
Visual inspection
```

Bermanfaat untuk memeriksa:

- geometry;
- coordinates;
- FeatureCollection;
- properties;
- validitas data secara praktis.

---

## Workflow 2 — KML inspection

```text
KML
 ↓
togeojson
 ↓
GeoJSON
 ↓
geojson.io
```

---

## Workflow 3 — GitHub spatial data

```text
Git repository
 ↓
*.geojson
 ↓
geojson.io
 ↓
Visual QA
```

---

## Workflow 4 — API development

```text
Database
 ↓
PostGIS
 ↓
Laravel API
 ↓
GeoJSON
 ↓
geojson.io
```

Ini sangat relevan untuk backend GIS.

---

# 21. Arsitektur Konseptual geojson.io

Jika disederhanakan menjadi model pembelajaran:

```text
┌──────────────────────────────────────────────┐
│                   UI Layer                   │
│                                              │
│ Toolbar │ Table │ JSON │ Feature Editor      │
└──────────────────────┬───────────────────────┘
                       │
                       ↓
┌──────────────────────────────────────────────┐
│                 Data Model                   │
│                                              │
│ FeatureCollection                            │
│ Features                                     │
│ Geometry                                     │
│ Properties                                   │
└──────────────┬─────────────────┬─────────────┘
               │                 │
               ↓                 ↓
        ┌─────────────┐   ┌──────────────┐
        │ Map Renderer │   │ Draw Engine  │
        └─────────────┘   └──────────────┘
               │
               ↓
        ┌────────────────┐
        │ Spatial Engine │
        └────────────────┘
               │
               ↓
        ┌────────────────┐
        │ Import /       │
        │ Export         │
        └────────────────┘
```

Ini adalah **model konseptual untuk pembelajaran**, bukan klaim bahwa source code saat ini tersusun persis dalam layer tersebut.

---

# 22. Perbandingan dengan Tool GIS Lain

| Tool | Fokus |
|---|---|
| geojson.io | editing/inspection spatial data |
| OpenLayers | map rendering + interaction |
| Leaflet | map rendering + interaction |
| MapLibre GL JS | vector map rendering |
| Mapbox GL JS | vector map rendering |
| Turf.js | spatial analysis/computation |
| PostGIS | spatial database |
| QGIS | desktop GIS |
| GDAL/OGR | geospatial data processing |

Kesalahan umum adalah menganggap:

```text
OpenLayers = GIS
```

Padahal lebih tepat:

```text
OpenLayers
    ↓
Map rendering + interaction
```

sementara:

```text
Turf.js
    ↓
Spatial computation
```

dan:

```text
PostGIS
    ↓
Spatial database
```

---

# 23. Posisi geojson.io dalam Ekosistem GIS Web

Model yang lebih tepat:

```text
                     GIS Web App
                         │
       ┌─────────────────┼─────────────────┐
       ↓                 ↓                 ↓
   Rendering           Data             Analysis
       │                 │                 │
 OpenLayers          GeoJSON           Turf.js
 MapLibre            Vector Tile       JSTS
 Mapbox GL           WFS               Custom
       │                 │                 │
       └─────────────────┼─────────────────┘
                         ↓
                     Backend
                         │
                     PostGIS
```

geojson.io berada terutama pada:

```text
Editing
+
Visualization
+
Data conversion
+
Spatial workflow
```

---

# 24. Apa yang Sebaiknya Dipelajari dari geojson.io?

Jangan mencoba menghafal seluruh source code.

Pelajari konsep berikut secara bertahap:

### Level 1 — GeoJSON

Pahami:

- Geometry;
- Feature;
- FeatureCollection;
- coordinates;
- properties.

### Level 2 — Map

Pahami:

- map;
- layer;
- source;
- projection;
- viewport;
- interaction.

### Level 3 — Drawing

Pahami:

```text
user gesture
 ↓
interaction
 ↓
geometry
 ↓
feature
 ↓
GeoJSON
```

### Level 4 — Editing

Pahami:

```text
Feature
 ├── geometry editor
 └── properties editor
```

### Level 5 — Import/Export

Pahami:

```text
KML
CSV
Shapefile
GeoJSON
```

dan bagaimana semuanya dikonversi menuju model internal.

### Level 6 — Spatial Analysis

Pelajari:

```text
buffer
intersection
union
difference
distance
```

### Level 7 — GIS Backend

Hubungkan:

```text
PostGIS
 ↓
API
 ↓
GeoJSON
 ↓
GIS frontend
```

---

# 25. Rekomendasi Capstone untuk dev-gis-road

Karena kamu sedang membuat roadmap GIS Developer, geojson.io sangat cocok dijadikan **capstone project**, bukan project pertama.

Struktur yang direkomendasikan:

```text
dev-gis-road/

├── 00-gis-fundamental/
├── 01-coordinate-system/
├── 02-geojson/
├── 03-openlayers/
├── 04-vector-layer/
├── 05-feature/
├── 06-source/
├── 07-interaction/
├── 08-drawing/
├── 09-feature-editor/
├── 10-attribute-table/
├── 11-import-export/
├── 12-turf/
├── 13-geocoding/
├── 14-spatial-operation/
├── 15-postgis/
├── 16-spatial-api/
│
└── 17-mini-geojson-editor/
```

---

# 26. Mini geojson.io

Target capstone:

```text
┌──────────────────────────────────────────────┐
│ Point │ Line │ Polygon │ Import │ Export     │
├──────────────────────┬───────────────────────┤
│                      │                       │
│                      │  GeoJSON              │
│        MAP           │                       │
│                      │  {                    │
│                      │    "type": ...        │
│                      │  }                    │
│                      │                       │
└──────────────────────┴───────────────────────┘
```

Teknologi:

```text
SvelteKit
    │
    ├── OpenLayers
    │      └── Map + Drawing
    │
    ├── GeoJSON
    │      └── Data model
    │
    ├── Turf.js
    │      └── Spatial operations
    │
    └── File API
           └── Import/export
```

---

# 27. Roadmap Implementasi Mini geojson.io

## Tahap 1

GeoJSON viewer:

```text
GeoJSON
 ↓
OpenLayers
 ↓
Map
```

## Tahap 2

Point drawing:

```text
Map
 ↓
Draw Point
 ↓
Feature
 ↓
GeoJSON
```

## Tahap 3

Line + Polygon:

```text
Point
LineString
Polygon
```

## Tahap 4

Feature editor:

```text
Feature
 ├── geometry
 └── properties
```

## Tahap 5

JSON editor:

```text
Map
+
JSON editor
```

## Tahap 6

Attribute table:

```text
FeatureCollection
 ↓
Table
```

## Tahap 7

Import/export:

```text
KML
CSV
GeoJSON
```

## Tahap 8

Turf:

```text
Feature A
+
Feature B
 ↓
Turf
 ↓
Result
```

## Tahap 9

Geocoding:

```text
Search
 ↓
Coordinates
 ↓
Point Feature
```

## Tahap 10

PostGIS:

```text
PostGIS
 ↓
API
 ↓
GeoJSON
 ↓
Mini geojson.io
```

---

# 28. Kenapa Project Ini Sangat Bagus untuk Belajar GIS Developer?

Karena satu aplikasi memaksa kamu memahami banyak konsep sekaligus:

```text
JavaScript / TypeScript
        +
Frontend architecture
        +
Map rendering
        +
Geometry
        +
GeoJSON
        +
Spatial interaction
        +
Spatial analysis
        +
Data conversion
        +
API
        +
Database
```

Ini jauh lebih dekat dengan pekerjaan GIS Developer dibanding sekadar membuat:

```text
"map dengan marker"
```

---

# 29. Hal yang Tidak Perlu Kamu Tiru

Jangan menjadikan geojson.io sebagai standar bahwa setiap aplikasi GIS harus:

- menggunakan React;
- menggunakan Mapbox;
- menggunakan Mapbox GL Draw;
- memiliki JSON editor;
- memiliki semua format import/export.

Yang perlu ditiru adalah **konsep dan keputusan arsitekturnya**.

Untuk stack kamu:

```text
geojson.io
     ↓
ambil konsep
     ↓
SvelteKit
     +
OpenLayers
     +
Turf.js
```

Ini justru menjadi eksperimen yang sangat bagus.

---

# 30. Temuan Penting tentang Status 2026

Repository resmi menunjukkan bahwa proyek masih aktif dikembangkan.

Pada Juni 2026 terdapat issue terkait tool Rectangle/Circle pada aplikasi baru, yang menunjukkan bahwa generasi baru masih mengalami penyempurnaan.

Contoh issue #1013 membahas kasus ketika single click pada Rectangle/Circle menghasilkan polygon tanpa area yang tidak dirender sebagaimana mestinya.

Sumber:
https://github.com/mapbox/geojson.io/issues/1013

Ini penting karena berarti:

> geojson.io pada 2026 bukan proyek legacy yang hanya dipertahankan; codebase dan UX-nya sedang mengalami evolusi aktif.

---

# 31. Catatan Penting tentang geojsonio-cli

Jangan mengikuti tutorial lama yang menganggap `geojsonio-cli` sebagai tool aktif.

Repository tersebut diarsipkan pada 18 September 2024.

Namun konsep workflow-nya tetap sangat berguna:

```text
CLI
 ↓
GeoJSON
 ↓
geojson.io
```

Jadi yang dipelajari adalah **workflow**, bukan ketergantungan pada CLI lama.

Sumber:
https://github.com/mapbox/geojsonio-cli

---

# 32. Rangkuman Arsitektur yang Perlu Dipahami

Jika semua riset disederhanakan:

```text
                    USER
                     │
                     ↓
                  GIS UI
                     │
        ┌────────────┼────────────┐
        ↓            ↓            ↓
      Draw         Edit         Search
        │            │            │
        └────────────┼────────────┘
                     ↓
                 GeoJSON
                     │
       ┌─────────────┼─────────────┐
       ↓             ↓             ↓
   Renderer       Analysis      Export
       │             │             │
 OpenLayers        Turf.js       KML
 MapLibre          JSTS          CSV
 Mapbox GL                       SHP
       │
       ↓
     Browser
       │
       ↓
      API
       │
       ↓
    PostGIS
```

---

# 33. Kesimpulan Akhir

geojson.io dapat dipandang dalam tiga level.

## Level 1 — Tool

Untuk:

```text
view
edit
draw
convert
share
```

spatial data.

## Level 2 — Developer Tool

Untuk:

```text
debug GeoJSON
inspect API
visual QA
test spatial data
```

## Level 3 — Studi Arsitektur

Untuk memahami:

```text
GeoJSON data model
        +
map rendering
        +
drawing interaction
        +
attribute editing
        +
spatial operations
        +
data conversion
        +
API integration
```

Untuk tujuanmu menjadi GIS Developer, **Level 3 adalah yang paling bernilai**.

---

# 34. Sumber Utama

1. **geojson.io repository**
   - https://github.com/mapbox/geojson.io

2. **geojson.io API**
   - https://github.com/mapbox/geojson.io/blob/main/API.md

3. **geojson.io website**
   - https://geojson.io/

4. **geojsonio-cli**
   - https://github.com/mapbox/geojsonio-cli

5. **togeojson**
   - https://github.com/mapbox/togeojson

6. **wellknown**
   - https://github.com/mapbox/wellknown

7. **vt2geojson**
   - https://github.com/mapbox/vt2geojson

8. **geojson.io Pull Requests**
   - https://github.com/mapbox/geojson.io/pulls

9. **geojson.io Issue #1013**
   - https://github.com/mapbox/geojson.io/issues/1013

---

# 35. Referensi Riset yang Dipakai

Informasi status proyek, sejarah, fitur, stack, dan overhaul 2026 berasal terutama dari README repository resmi geojson.io. Dokumentasi API digunakan untuk URL API dan Console API. Status cutover React diverifikasi melalui PR #983. Status bug generasi baru diverifikasi melalui issue #1013. Informasi `togeojson`, `wellknown`, dan `geojsonio-cli` berasal dari repository masing-masing.

