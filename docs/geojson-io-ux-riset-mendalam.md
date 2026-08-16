# Riset UX Mendalam — geojson.io

> Tanggal riset: 15 Agustus 2026  
> Fokus: User Experience (UX), interaction model, workflow, usability, dan prinsip desain geojson.io.  
> Konteks: Studi kasus untuk pembelajaran GIS Developer dan pengembangan mini GIS editor berbasis SvelteKit + OpenLayers.

## 1. Ringkasan Eksekutif

geojson.io dapat dipahami sebagai **spatial editor yang map-first dan task-oriented**.

Filosofi UX utamanya:

> Bawa user langsung ke pekerjaan spasial, bukan ke proses konfigurasi GIS.

Alur utamanya:

```text
USER INTENT
    ↓
MAP
    ↓
DIRECT MANIPULATION
    ↓
GEOJSON
    ↓
EDIT / VERIFY
    ↓
EXPORT / SHARE
```

Repository resmi mendeskripsikan geojson.io sebagai tool cepat dan sederhana untuk membuat, melihat, dan berbagi spatial data. Generasi 2026 mengalami overhaul besar ke React + TypeScript dengan UI yang diperbarui, drawing tools yang lebih baik, multiselect, bulk editing, spatial operations, search-to-Point, dan peningkatan import/export.

Sumber utama:
- https://github.com/mapbox/geojson.io
- https://github.com/mapbox/geojson.io/blob/main/API.md

---

## 2. Filosofi UX

geojson.io meminimalkan **time-to-first-action**.

Dibanding workflow GIS yang kompleks:

```text
Project setup
 ↓
Layer configuration
 ↓
CRS configuration
 ↓
Data source
 ↓
Map
```

geojson.io cenderung:

```text
Open
 ↓
Map
 ↓
Draw / Import
 ↓
Edit
 ↓
Export
```

Kompleksitas disembunyikan sampai user membutuhkannya.

Ini merupakan bentuk **progressive disclosure**.

---

## 3. Target Persona

### Developer

Tujuan: memeriksa apakah GeoJSON/API menghasilkan geometry yang benar.

```text
API
 ↓
GeoJSON
 ↓
geojson.io
 ↓
Visual inspection
```

geojson.io dapat berfungsi sebagai **visual debugger untuk spatial data**.

### GIS User Ringan

```text
Search
 ↓
Draw
 ↓
Edit properties
 ↓
Export
```

### Data Analyst

```text
Import
 ↓
Map
 ↓
Table
 ↓
Edit
 ↓
Export
```

### GIS/Developer Power User

```text
Map
 ↔
Table
 ↔
JSON
 ↔
API
```

---

## 4. Spatial-First UX

User tidak perlu memahami GeoJSON terlebih dahulu untuk menggambar.

Contoh:

```text
lihat lokasi
 ↓
klik Polygon
 ↓
klik titik A
klik titik B
klik titik C
klik titik A
 ↓
Polygon selesai
```

Baru kemudian:

```text
properties
JSON
table
export
```

Ini merupakan **direct manipulation** dan **progressive disclosure**.

---

## 5. Map sebagai Workspace

Map bukan sekadar preview.

Secara konseptual:

```text
MAP
 ├── navigation
 ├── search
 ├── drawing
 ├── selection
 └── editing
```

Map menjadi **spatial canvas** tempat pekerjaan utama dilakukan.

---

## 6. Human View vs Machine View

Salah satu aspek UX terkuat:

```text
              GEOJSON
                 │
       ┌─────────┴─────────┐
       ↓                   ↓
     HUMAN               MACHINE
       │                   │
      MAP                 JSON
```

Map menjawab:

> Seperti apa bentuknya?

JSON menjawab:

> Bagaimana data tersebut direpresentasikan?

---

## 7. Map ↔ Data

Model interaksinya:

```text
Map
 ↕
Data Model
 ↕
JSON / Table
```

Saat user menggambar:

```text
Draw
 ↓
Geometry
 ↓
Feature
 ↓
GeoJSON state
 ↓
Map + UI
```

Saat data diedit:

```text
JSON / Table
 ↓
GeoJSON state
 ↓
Geometry
 ↓
Map
```

Prinsip:

> **Data model harus menjadi source of truth.**

---

## 8. Split View

Pola UI historis geojson.io memperlihatkan hubungan erat antara map dan data editor:

```text
┌─────────────────────┬──────────────────────┐
│                     │                      │
│        MAP          │        JSON          │
│                     │                      │
└─────────────────────┴──────────────────────┘
```

Keuntungannya:

```text
Saya menggambar
 ↓
lihat perubahan JSON

Saya mengubah data
 ↓
lihat perubahan map
```

---

## 9. Drawing sebagai Primary Interaction

Drawing merupakan core interaction:

```text
TOOL
 ↓
MAP GESTURE
 ↓
GEOMETRY
 ↓
FEATURE
 ↓
GEOJSON
```

User berpikir:

> Saya ingin menggambar polygon.

Bukan:

> Saya ingin mengisi coordinate array.

---

## 10. Drawing sebagai State Machine

Polygon drawing dapat dimodelkan:

```text
Idle
 ↓
Polygon mode
 ↓
First point
 ↓
Second point
 ↓
Third point
 ↓
...
 ↓
Close polygon
 ↓
Completed
 ↓
Selected
 ↓
Edit properties
```

User harus selalu tahu:

> Sekarang saya sedang melakukan apa?

---

## 11. Selection UX

GIS editor memiliki beberapa interaction mode:

```text
NAVIGATE
   ↓
SELECT
   ↓
EDIT
```

Contoh:

```text
drag map
→ pan

click feature
→ select

drag vertex
→ edit geometry
```

Perbedaan mode harus jelas secara visual.

---

## 12. Selection Feedback

Saat feature dipilih:

```text
Normal
   ↓
Selected
```

harus ada feedback seperti:

- perubahan visual;
- vertex/handle;
- property editor;
- selection state.

Prinsip:

> User harus mengetahui object mana yang sedang aktif.

---

## 13. Feature Editor

Feature terdiri dari:

```text
Feature
 ├── Geometry
 └── Properties
```

Feature editor memungkinkan perpindahan dari:

```text
Spatial thinking
```

ke:

```text
Attribute thinking
```

Contoh:

```text
Polygon
 +
name = Sukatani
 +
status = active
```

---

## 14. Table Panel

Table Panel mengubah representasi:

```text
Spatial
```

menjadi:

```text
Tabular
```

Contoh:

```text
ID | name     | category
---|----------|---------
1  | Area A   | pump
2  | Area B   | pump
3  | Area C   | reservoir
```

Satu row mewakili satu feature.

---

## 15. Map vs Table

Map bagus untuk:

> Di mana?

Table bagus untuk:

> Nilainya apa?

Workflow:

```text
MAP
 ↓
discover / select
 ↓
TABLE
 ↓
inspect / edit
 ↓
MAP
 ↓
verify
```

---

## 16. Bulk Editing

Ketika dataset bertambah, editing satu per satu tidak efisien:

```text
click feature
 ↓
edit
 ↓
save
 ↓
click next
```

Bulk editing:

```text
select many
 ↓
edit property
 ↓
apply
```

Repository terbaru menyebut bulk property editing dan multiselect sebagai bagian dari overhaul 2026.

---

## 17. JSON Editor

Tiga tingkat representasi:

```text
LEVEL 1
Map

LEVEL 2
Table / Properties

LEVEL 3
Raw JSON
```

Untuk pemula JSON dapat terasa kompleks.

Untuk developer GIS, JSON sangat berguna.

Karena itu JSON ideal sebagai **advanced representation**, bukan primary interaction.

---

## 18. JSON sebagai Visual Debugger

Workflow:

```text
Backend
 ↓
GeoJSON API
 ↓
geojson.io
 ↓
Visual inspection
```

Daripada membaca ribuan koordinat, developer dapat langsung melihat hasil geometry di map.

Ini merupakan **visual debugging**.

---

## 19. Progressive Disclosure

Tiga tingkat pengguna:

```text
                    GEOJSON.IO
                         │
          ┌──────────────┼──────────────┐
          ↓              ↓              ↓
      Beginner        Regular         Power
          │              │              │
          ↓              ↓              ↓
         Map          Map/Table      JSON/API
          │              │              │
        Draw         Edit data     manipulate
```

Beginner:

```text
Search → Draw → Export
```

Regular:

```text
Search → Draw → Select → Properties → Table
```

Power user:

```text
Map → Table → JSON → API
```

---

## 20. Discoverability vs Minimalism

Minimal UI memberikan:

- tampilan bersih;
- fokus tinggi;
- interaksi cepat.

Namun:

```text
minimal UI
     ↓
lebih sedikit petunjuk
     ↓
discoverability menurun
```

Tooltip menjadi penting:

```text
Icon
 ↓
Hover
 ↓
Tooltip
 ↓
Meaning
```

---

## 21. Search UX

Search tidak hanya sebaiknya berfungsi sebagai navigation.

Generasi baru geojson.io menambahkan kemampuan menjadikan hasil pencarian sebagai Point feature.

Evolusinya:

```text
search = navigation
```

menjadi:

```text
search = spatial creation
```

Workflow ideal:

```text
Search "Purwakarta"
 ↓
Map moves
 ↓
Draw polygon
 ↓
Edit
```

---

## 22. Import/Export UX

Model:

```text
Import
 ↓
Internal GeoJSON
 ↓
Map / Table / JSON
 ↓
Export
```

Format dapat meliputi:

```text
GeoJSON
KML
CSV
Shapefile
```

User tidak perlu memahami mekanisme konversi internal.

---

## 23. Export sebagai Task Completion

Mental model geojson.io lebih dekat ke:

```text
Create
 ↓
Edit
 ↓
Export
```

daripada:

```text
Create
 ↓
Account
 ↓
Workspace
 ↓
Save to cloud
```

Hal ini membantu aplikasi tetap terasa ringan.

---

## 24. Share UX

Prinsip kuat:

```text
Create
 ↓
Share
 ↓
Link
```

tanpa workflow panjang seperti:

```text
Register
 ↓
Workspace
 ↓
Invite
 ↓
Publish
```

Dokumentasi historis geojson.io menunjukkan penggunaan Share untuk link dan embed.

---

## 25. URL sebagai State

geojson.io mendukung parameter URL untuk map dan data.

Contoh:

```text
#map=zoom/latitude/longitude
```

Konsep:

```text
URL
 ↓
Application State
```

URL dapat menjadi **transport layer untuk application state**.

---

## 26. Deep Linking

Traditional:

```text
Download file
 ↓
Open application
 ↓
Import file
```

Deep linking:

```text
URL
 ↓
Open
 ↓
Ready
```

Ini mengurangi friction.

---

## 27. API sebagai Escape Hatch

Dokumentasi geojson.io mengekspos sejumlah object melalui browser console, antara lain:

```js
window.api.map
window.api.data
window.api.draw
window.api.on()
```

Konsep:

```text
GUI
 │
 ├── Beginner path
 │
 └── Console/API
       ↓
       Power user path
```

Power user mendapatkan **escape hatch** tanpa membuat UI utama semakin kompleks.

---

## 28. Keyboard Shortcuts

Keyboard shortcuts relevan untuk repetitive actions:

```text
draw
select
delete
undo
redo
navigate
```

Untuk power user:

```text
mouse → keyboard
```

dapat mengurangi interaction cost.

Namun shortcut tidak boleh menjadi satu-satunya jalur interaksi.

---

## 29. Feedback Loop

Setiap interaction idealnya mengikuti:

```text
ACTION
 ↓
FEEDBACK
 ↓
STATE CHANGE
```

Contoh:

```text
Draw Polygon
 ↓
Polygon preview
 ↓
Polygon created
 ↓
Selected
 ↓
Properties available
```

Jika feedback hilang:

```text
Action
 ↓
????
```

user kehilangan confidence.

---

## 30. Kasus Bug Rectangle/Circle 2026

Issue #1013 pada Juni 2026 menjadi contoh penting dari sudut pandang UX.

Dilaporkan bahwa:

1. user memilih Rectangle/Circle;
2. melakukan single click;
3. feature masuk ke GeoJSON;
4. geometry tidak dirender sebagaimana diharapkan;
5. feature editor tidak terbuka.

Dari perspektif UX:

```text
User action
 ↓
Data berubah
 ↓
Visual tidak konsisten
 ↓
User bingung
```

Prinsip:

> **Every spatial action needs immediate and consistent feedback.**

Sumber:

https://github.com/mapbox/geojson.io/issues/1013

---

## 31. Error Prevention

GIS drawing memiliki risiko:

```text
wrong click
wrong geometry
wrong location
invalid geometry
```

UX perlu menyediakan:

- preview;
- selection feedback;
- vertex handles;
- clear completion gesture;
- undo;
- error state.

Tujuan bukan hanya menangani error, tetapi mencegah kesalahan.

---

## 32. Undo/Redo

Dalam direct manipulation:

```text
click
drag
draw
delete
edit
```

kesalahan mudah terjadi.

Maka:

```text
Undo
Redo
```

merupakan **safety net UX**.

Untuk mini geojson.io, fitur ini sebaiknya masuk roadmap cukup awal.

---

## 33. Scalability UX

Perbedaan dataset:

```text
5 features
```

vs.

```text
50,000 features
```

membutuhkan strategi UX berbeda.

Map:

```text
visual overview
```

Table:

```text
attribute management
```

JSON:

```text
raw structure
```

Table dan bulk editing menjadi penting ketika jumlah feature bertambah.

---

## 34. Mobile UX

Paradigma geojson.io lebih natural pada:

```text
desktop
laptop
```

karena membutuhkan:

```text
MAP
+
DATA PANEL
```

Pada mobile:

```text
┌──────────────┐
│     MAP      │
├──────────────┤
│     DATA     │
└──────────────┘
```

Interaction cost meningkat karena:

- layar kecil;
- drawing membutuhkan ruang;
- table membutuhkan ruang;
- JSON editor membutuhkan ruang;
- toolbar harus tetap usable.

---

## 35. Accessibility

GIS UI memiliki tantangan accessibility lebih tinggi daripada form biasa.

Drawing bergantung pada:

```text
pointer
mouse
visual map
```

Maka kombinasi yang ideal:

```text
Mouse / Touch
+
Keyboard
+
Visible controls
```

Keyboard shortcut membantu power user, tetapi tidak boleh menjadi satu-satunya jalur.

---

## 36. Visual Hierarchy

Hierarchy utama dapat dipahami sebagai:

```text
1. Map
2. Drawing
3. Data
4. Secondary tools
```

Ini konsisten dengan prinsip:

> **Map is the workspace.**

---

## 37. Task-Oriented GIS

geojson.io lebih tepat dipahami sebagai:

> **task-oriented GIS tool**

daripada:

> **full GIS workstation**

Task user:

```text
Saya ingin menggambar boundary.
```

bukan:

```text
Saya ingin membuat GIS project.
```

Workflow:

```text
Open
 ↓
Search
 ↓
Draw
 ↓
Edit
 ↓
Export
```

---

## 38. geojson.io vs QGIS dari Perspektif UX

| Aspek | geojson.io | QGIS |
|---|---|---|
| Fokus | Task cepat | Full GIS |
| Setup | Minimal | Lebih kompleks |
| Map-first | Sangat kuat | Kuat |
| Data editing | Ringan/menengah | Sangat kuat |
| Spatial analysis | Lebih terbatas | Sangat luas |
| Database | Bukan fokus utama | Sangat kuat |
| Time-to-first-action | Sangat rendah | Lebih tinggi |
| Full GIS power | Terbatas | Sangat tinggi |

Kesimpulan:

> geojson.io bukan QGIS versi web. Keduanya memiliki tujuan UX berbeda.

---

## 39. Prinsip UX yang Dapat Diambil

### 39.1 Minimize Time-to-First-Action

User harus dapat melakukan sesuatu dengan cepat.

### 39.2 Map is the Workspace

Map adalah tempat pekerjaan dilakukan.

### 39.3 Direct Manipulation

User memanipulasi geometry langsung di map.

### 39.4 Progressive Disclosure

Kompleksitas ditampilkan ketika diperlukan.

### 39.5 Visual Feedback

Setiap action spatial harus memiliki feedback.

### 39.6 Map ↔ Table ↔ JSON

Tiga representasi melayani tiga kebutuhan mental model.

### 39.7 Bulk Editing

Attribute editing harus scalable.

### 39.8 URL sebagai UX

Deep linking dapat menghilangkan banyak langkah.

### 39.9 Escape Hatch untuk Power User

GUI untuk mayoritas; API/console untuk power user.

### 39.10 Simplicity ≠ Few Features

Banyak fitur tetap dapat terasa sederhana jika tidak semuanya ditampilkan sekaligus.

---

## 40. UX Skeleton geojson.io

```text
              USER INTENT
                   │
                   ↓
                SEARCH
                   │
                   ↓
                LOCATE
                   │
                   ↓
                 DRAW
                   │
                   ↓
                SELECT
                   │
                   ↓
                 EDIT
                   │
          ┌────────┴────────┐
          ↓                 ↓
        TABLE              JSON
          │                 │
          └────────┬────────┘
                   ↓
                VERIFY
                   │
          ┌────────┴────────┐
          ↓                 ↓
       EXPORT             SHARE
```

---

## 41. Rekomendasi UX untuk Mini geojson.io

Untuk proyek:

```text
dev-gis-road/
└── mini-geojson-editor/
```

UI:

```text
┌──────────────────────────────────────────────┐
│ Logo │ Search │ Import │ Export │ Share      │
├────────────────────────────┬─────────────────┤
│                            │                 │
│           MAP              │      DATA       │
│                            │                 │
│                            │  JSON / TABLE   │
│                            │                 │
└────────────────────────────┴─────────────────┘
```

Map:

```text
Map
 ├── navigation
 ├── search
 ├── drawing
 ├── selection
 └── editing
```

Data panel:

```text
Data
 ├── JSON
 ├── Table
 └── Properties
```

---

## 42. UX Architecture untuk SvelteKit + OpenLayers

```text
                 APP
                  │
        ┌─────────┴─────────┐
        ↓                   ↓
     Spatial              Data
     Workspace            Workspace
        │                   │
        ↓                   ↓
    OpenLayers           GeoJSON State
        │                   │
        └─────────┬─────────┘
                  ↓
              Interaction
                  │
       ┌──────────┼──────────┐
       ↓          ↓          ↓
      Draw      Select      Edit
```

Kemudian:

```text
GeoJSON State
      │
 ┌────┼────┐
 ↓    ↓    ↓
Map  Table JSON
```

---

## 43. UX Testing untuk Mini Project

Jangan hanya mengukur apakah UI terlihat mirip geojson.io.

Gunakan usability task.

### Task 1 — Buat Point

Pertanyaan:

> Apakah user dapat melakukannya tanpa dokumentasi?

### Task 2 — Buat Polygon

Pertanyaan:

> Apakah user memahami kapan polygon selesai?

### Task 3 — Ubah nama feature

Pertanyaan:

> Apakah user tahu lokasi property editor?

### Task 4 — Edit banyak feature

Pertanyaan:

> Apakah bulk editing mudah ditemukan?

### Task 5 — Export GeoJSON

Pertanyaan:

> Apakah user memahami task sudah selesai?

### Task 6 — Batalkan kesalahan

Pertanyaan:

> Apakah undo mudah ditemukan?

### Task 7 — Debug GeoJSON API

Pertanyaan:

> Apakah user dapat menggunakan map + JSON sebagai visual debugger?

---

## 44. UX Metrics

Untuk mini project, ukur:

```text
Time to First Action
Task Completion Rate
Error Rate
Number of Clicks
Number of Mode Switches
Time to Complete Task
```

Contoh:

```text
Task:
Buat polygon dan export GeoJSON.

Target:
< 30 detik
```

Ini lebih objektif daripada sekadar:

> UI terasa enak.

---

## 45. Prioritas Implementasi

### Phase 1

```text
Map
+
GeoJSON
```

### Phase 2

```text
Draw Point
Draw Line
Draw Polygon
```

### Phase 3

```text
Selection
Geometry editing
```

### Phase 4

```text
Properties
```

### Phase 5

```text
Table
```

### Phase 6

```text
JSON editor
```

### Phase 7

```text
Import / Export
```

### Phase 8

```text
Undo / Redo
```

### Phase 9

```text
Turf spatial operations
```

### Phase 10

```text
Geocoding
Deep linking
API
```

---

## 46. Posisi geojson.io dalam Roadmap GIS

```text
GIS Fundamentals
        ↓
Coordinate System
        ↓
GeoJSON
        ↓
OpenLayers
        ↓
Feature / Source / Layer
        ↓
Interaction
        ↓
Drawing
        ↓
Turf.js
        ↓
PostGIS
        ↓
Spatial API
        ↓
┌──────────────────────────┐
│ UX GIS Editor            │
│ geojson.io case study    │
└──────────────────────────┘
```

geojson.io paling baik dipelajari ketika fundamental GIS dan frontend mapping sudah mulai dipahami.

---

## 47. Insight untuk GIS Developer

OpenLayers mengajarkan:

```text
Bagaimana map bekerja?
```

Turf mengajarkan:

```text
Bagaimana spatial computation bekerja?
```

PostGIS mengajarkan:

```text
Bagaimana spatial data disimpan dan di-query?
```

geojson.io mengajarkan:

```text
Bagaimana kemampuan tersebut
diubah menjadi workflow yang dapat digunakan manusia?
```

Ini merupakan kompetensi yang berbeda dan penting.

---

## 48. Kesimpulan

UX geojson.io dapat diringkas:

```text
              SIMPLE ENTRY
                   ↓
               MAP FIRST
                   ↓
          DIRECT MANIPULATION
                   ↓
                GEOJSON
                   ↓
       ┌───────────┼───────────┐
       ↓           ↓           ↓
      MAP        TABLE       JSON
       │           │           │
       └───────────┼───────────┘
                   ↓
                 VERIFY
                   ↓
             EXPORT / SHARE
```

Hal terpenting untuk dipelajari bukan warna, icon, posisi tombol, atau framework UI, tetapi:

- interaction model;
- spatial canvas;
- progressive disclosure;
- direct manipulation;
- map/data synchronization;
- selection state;
- drawing feedback;
- attribute editing;
- bulk editing;
- deep linking;
- developer escape hatch.

---

## 49. Insight untuk `dev-gis-road`

Target proyek bukan:

> Saya berhasil membuat clone geojson.io.

Target yang lebih bernilai:

> **Saya mampu merancang dan mengimplementasikan interaction model sebuah aplikasi GIS web.**

Workflow:

```text
GIS Concept
     ↓
OpenLayers implementation
     ↓
UX problem
     ↓
geojson.io reference
     ↓
Own implementation
     ↓
Usability test
     ↓
Refactor
```

Skill yang dihasilkan:

```text
GIS
+
Frontend
+
Spatial Interaction
+
UX
+
Data Modeling
+
Spatial Analysis
```

---

## 50. Sumber Utama

1. geojson.io Repository  
   https://github.com/mapbox/geojson.io

2. geojson.io API  
   https://github.com/mapbox/geojson.io/blob/main/API.md

3. geojson.io Website  
   https://geojson.io/

4. geojson.io Issue #1013  
   https://github.com/mapbox/geojson.io/issues/1013

5. geojson.io Pull Requests  
   https://github.com/mapbox/geojson.io/pulls

6. Tutorial penggunaan  
   https://mapninja.github.io/Pixels2Points/section02.html

---

## 51. Catatan Metodologi

Riset ini merupakan **analisis UX berbasis studi produk dan dokumentasi**, bukan usability test formal dengan responden.

Observasi mengenai:

- spatial-first;
- direct manipulation;
- progressive disclosure;
- map/table/JSON mental model;
- visual debugging;
- task-oriented workflow;

merupakan interpretasi UX dari perilaku dan struktur produk.

Status teknis dan fitur 2026 dirujuk terutama dari repository resmi geojson.io dan dokumentasi API-nya.
