# Riset UI/UX GeoJSON.io — 3D Globe & Background

> Dokumen ini merangkum analisis UI/UX yang berfokus secara spesifik pada **tampilan 3D globe, background/latar belakang, atmosphere, lighting, visual hierarchy, dan keterbacaan data GeoJSON**. Analisis juga dipisahkan antara observasi desain dan landasan ilmiah agar keputusan UI tidak hanya didasarkan pada estetika.

**Tanggal riset:** 16 Agustus 2026

---

## 1. Tujuan Riset

Tujuan utama riset ini adalah menentukan bagaimana tampilan **3D globe** dapat digunakan sebagai spatial canvas untuk aplikasi yang terinspirasi oleh geojson.io tanpa mengorbankan fungsi utama GIS editor.

Fokus penelitian:

- globe sebagai spatial canvas;
- background/space;
- atmosphere;
- lighting;
- stars;
- visual hierarchy;
- keterbacaan GeoJSON;
- interaction dan orientation;
- hubungan globe dengan mode 2D;
- implikasi terhadap UX editing;
- evidence ilmiah dari penelitian geovisualization dan visual perception.

Prinsip utama:

> **Globe bukan dekorasi. Globe adalah canvas untuk membaca dan memanipulasi data spasial.**

---

# 2. Mental Model

Pada map 2D, transformasi spasial relatif sederhana:

```text
longitude → X
latitude  → Y
```

Pada globe:

```text
screen coordinate
       ↓
camera ray
       ↓
sphere intersection
       ↓
3D coordinate
       ↓
latitude / longitude
       ↓
GeoJSON coordinate
```

Implikasinya adalah bahwa interaksi globe memiliki kompleksitas lebih tinggi daripada map 2D.

Pengguna sebaiknya tetap merasa:

> "Saya sedang menggambar polygon."

dan bukan:

> "Saya sedang melakukan operasi 3D."

Kompleksitas matematis dan rendering harus disembunyikan oleh UI.

---

# 3. Globe Bukan Pengganti Map 2D

Salah satu kesimpulan terpenting dari literatur geovisualization adalah bahwa 2D dan 3D memiliki karakteristik penggunaan yang berbeda.

Penelitian Dong dkk. membandingkan penggunaan map dan globe dalam lingkungan VR dan desktop dengan 120 partisipan serta menggunakan eye-tracking. Hasil penelitian tersebut menunjukkan bahwa perilaku pengguna dan penggunaan representasi spasial dapat berbeda berdasarkan mode visualisasi dan lingkungan interaksi.

**Implikasi UX:**

```text
                 Spatial Editor
                       │
              ┌────────┴────────┐
              │                 │
            2D Map           3D Globe
              │                 │
      precision editing    spatial context
      vertex manipulation  global exploration
      coordinate work      presentation
```

Karena itu, desain yang lebih kuat adalah:

> **Globe dan map 2D menjadi dua mode dari spatial editor yang sama.**

Bukan menganggap globe sebagai versi superior dari map 2D.

---

# 4. Konsep Visual Utama

Sistem visual globe sebaiknya terdiri dari empat layer:

```text
┌─────────────────────────────┐
│ Background / Space          │
├─────────────────────────────┤
│ Atmosphere                  │
├─────────────────────────────┤
│ Globe Surface               │
├─────────────────────────────┤
│ GeoJSON Geometry            │
└─────────────────────────────┘
```

Urutan visual hierarchy yang direkomendasikan:

```text
1. GeoJSON feature
2. Globe surface
3. Globe boundary / atmosphere
4. UI interaction
5. Stars
6. Background
```

Background harus terasa ada, tetapi tidak boleh menjadi objek yang sedang diperhatikan pengguna.

---

# 5. Background / Space

## 5.1 Prinsip

Background sebaiknya:

- sangat gelap;
- static;
- memiliki sedikit atau tanpa detail;
- tidak bersaing dengan GeoJSON;
- memberikan negative space;
- membantu globe terlihat sebagai objek spherical.

Konsep gradient:

```text
#02040A
   ↓
#050914
   ↓
#080D18
   ↓
#0B1220
```

Gradient sebaiknya sangat subtle.

Tujuan utamanya bukan menciptakan efek visual yang dramatis, melainkan menciptakan:

> **deep negative space**

---

## 5.2 Kenapa background gelap?

Penelitian mengenai penggunaan warna dalam computer graphics menunjukkan bahwa warna terang dapat menarik perhatian secara kuat, terutama ketika ditempatkan pada background gelap.

Implikasi untuk globe:

```text
Background  → very dark
Globe       → muted
GeoJSON     → high contrast
```

Dengan demikian contrast tertinggi diberikan kepada data yang sedang dikerjakan.

### Prinsip:

> Background mendukung saliency, bukan menjadi saliency.

---

# 6. Atmosphere

Atmosphere merupakan elemen visual yang sangat penting pada globe.

Tanpa atmosphere:

```text
       █████████
     █████████████
    ███████████████
     █████████████
       █████████
```

Globe dapat terlihat seperti lingkaran datar.

Dengan atmospheric rim:

```text
        ░░░░░░░
      ░░███████░░
    ░█████████████░
   █████████████████
    ░█████████████░
      ░░███████░░
        ░░░░░░░
```

Atmosphere membantu:

- memperjelas boundary globe;
- memberikan depth cue;
- memisahkan globe dari background;
- memperkuat perception of scale;
- membuat permukaan spherical lebih mudah dikenali.

## 6.1 Atmosphere bukan dekorasi

Atmosphere sebaiknya dipahami sebagai bagian dari visual encoding.

Tetapi jangan terlalu kuat.

### Hindari:

```text
🔵🔵🔵🔵🔵
🔵       🔵
🔵 EARTH 🔵
🔵       🔵
🔵🔵🔵🔵🔵
```

Efek seperti ini mudah menggeser aplikasi menjadi "sci-fi dashboard".

### Rekomendasi:

> **Subtle atmospheric rim**

bukan:

> **dramatic neon glow**

---

# 7. Warna Atmosphere

Warna yang direkomendasikan:

- deep blue;
- muted cyan;
- low saturation.

Konsep palette:

```text
Space       → hampir hitam
Atmosphere  → deep blue
Globe       → muted blue/green
Data        → bright accent
UI          → dark translucent
```

Accent color sebaiknya digunakan terutama untuk:

- selected feature;
- active tool;
- hover state;
- vertex;
- geometry outline;
- important interaction.

---

# 8. Globe Surface

Untuk GIS editor, globe tidak perlu terlalu photorealistic.

Tiga pendekatan:

### Satellite

Kelebihan:
- sangat familiar;
- kaya konteks visual.

Kekurangan:
- texture terlalu dominan;
- GeoJSON dapat kalah perhatian;
- terasa seperti Google Earth.

### Cartographic

Kelebihan:
- cocok untuk GIS;
- country boundaries mudah dibaca;
- tetap memberikan konteks.

### Minimal cartographic

```text
dark land
slightly lighter ocean
subtle borders
```

Pendekatan ini paling cocok untuk editor GeoJSON.

Prinsip:

> **Gunakan globe untuk spatial context, bukan sebagai tujuan visual utama.**

---

# 9. Lighting

Globe membutuhkan directional lighting agar bentuk spherical mudah dipersepsikan.

Konsep:

```text
             ☀
              \
               \
                🌎
```

Lighting harus cukup untuk memberikan:

- depth;
- volume;
- spherical perception;
- pemisahan sisi terang dan gelap.

Tidak perlu simulasi astronomi realistis.

Tujuannya adalah:

> **sphere perception, bukan astronomical simulation.**

---

# 10. Day/Night Boundary

Day/night boundary dapat digunakan sebagai fitur tambahan.

Contoh:

```text
          DAY
       █████████
     █████████████
    ███████████████
    ███████░░░░░░░░
     █████░░░░░░░░
       ░░░░░░░
          NIGHT
```

Tetapi sebaiknya bukan default.

Default cukup menggunakan subtle directional lighting.

Day/night dapat ditempatkan pada:

```text
View
└── Atmospheric lighting
```

---

# 11. Stars

Stars sebaiknya sangat sedikit.

### Hindari:

```text
✦ ✦ ✧ ✦ ✧ ✦ ✦ ✧ ✦ ✧ ✦
```

### Lebih baik:

```text
        ·

                  ✦


   ·


                     ·


         ✧
```

Stars merupakan decorative background element.

Terlalu banyak titik terang dapat menciptakan competing visual signals.

## 11.1 Editing mode vs exploration mode

### Exploration Mode

```text
       ✦
              ·
          🌎
    ·              ✦
```

Lebih atmospheric.

### Editing Mode

```text
              🌎
       ─────────────
       GeoJSON data
```

Lebih minimal.

Ini membantu mengubah visual hierarchy berdasarkan task.

---

# 12. Jangan Membuat Starfield Bergerak

Rekomendasi:

```text
Globe       → user-controlled
Stars       → static
Background  → static
Atmosphere  → static
```

Hindari:

```text
Globe       → rotate
Stars       → move
Background  → animate
Atmosphere  → pulse
```

Dalam editor GIS, stability lebih penting daripada spectacle.

Pengguna membutuhkan reference frame yang stabil agar perubahan camera dapat dipahami.

---

# 13. GeoJSON Harus Menjadi Objek Visual Utama

Contoh hierarchy:

```text
GeoJSON      █████████████ HIGH
Globe        █████████ MEDIUM
Atmosphere   ███ LOW
Stars        █ VERY LOW
Background   ░ VERY LOW
```

Geometry harus "keluar" dari globe secara visual.

## State

### Normal

```text
semi-transparent fill
```

### Hover

```text
brighter outline
```

### Selected

```text
bright outline
+ subtle glow
+ vertex handles
```

Contoh:

```text
          ╭────────╮
        ╱            ╲
       │   ◉────◉     │
       │   │    │     │
       │   ◉────◉     │
        ╲            ╱
          ╰────────╯
```

---

# 14. Visual Hierarchy untuk Feature

Geometry tidak boleh tenggelam dalam globe.

Rekomendasi:

```text
Normal
  ↓
muted fill

Hover
  ↓
higher contrast outline

Selected
  ↓
high contrast outline
+ vertices
+ optional subtle glow
```

Accent color harus terutama digunakan untuk data/interaksi, bukan seluruh interface.

---

# 15. Graticule / Latitude-Longitude Grid

Graticule sebaiknya **tidak aktif secara default**.

Alasannya adalah grid menambah visual noise.

Default:

```text
clean globe
```

Optional:

```text
View
└── Graticule
```

Ketika aktif:

```text
       ╭──────────╮
     ╱  ─────────   ╲
    │ ╱────────────╲ │
    │ ────────────── │
     ╲──────────────╱
       ╰──────────╯
```

Graticule berguna untuk:

- coordinate understanding;
- projection;
- debugging;
- pembelajaran GIS.

---

# 16. Coordinate HUD

Untuk pengguna GIS, coordinate HUD dapat sangat berguna.

Contoh:

```text
LAT  -6.12345°
LON  107.12345°
ALT  532 m
```

HUD hanya muncul saat diperlukan, misalnya:

- pointer movement;
- geometry editing;
- vertex selection;
- coordinate inspection.

Jangan selalu tampil karena akan menambah UI noise.

---

# 17. Camera State

Informasi camera juga sebaiknya optional.

```text
CAMERA
Lat       -6.21°
Lon       106.84°
Altitude  1,250 km
```

Masuk ke:

```text
View
└── Camera information
```

Ini terutama berguna untuk advanced GIS users.

---

# 18. Spatial Orientation

Globe memiliki kemampuan visual yang kuat untuk menunjukkan spatial context, tetapi interaksi 3D juga dapat meningkatkan kompleksitas orientasi.

Karena itu:

- camera controls harus sederhana;
- globe rotation harus predictable;
- background harus static;
- reset view harus tersedia;
- current location/view harus mudah dipahami.

Recommended interaction:

```text
Drag       → rotate globe
Scroll     → zoom
Shift+Drag → tilt
Click      → select feature
Esc        → cancel
0          → reset view
```

Jangan mengekspos terlalu banyak konsep teknis seperti:

```text
orbit
roll
pitch
yaw
camera altitude
perspective
```

sebagai kontrol utama.

---

# 19. View Mode

Sediakan dua mode:

```text
┌────────────────────────────┐
│ ◉ Globe    ○ Map           │
└────────────────────────────┘
```

### Globe

Cocok untuk:

- global context;
- exploration;
- presentation;
- spatial orientation.

### Map

Cocok untuk:

- precision editing;
- vertex manipulation;
- polygon cleanup;
- coordinate inspection.

---

# 20. Precision Mode

Globe tidak ideal untuk semua pekerjaan presisi.

Karena itu sediakan precision mode:

```text
                 🌎

          ●──────●
          │      │
          │      │
          ●──────●

     ┌───────────────────┐
     │ Vertex             │
     │ Lat  -6.54321      │
     │ Lon  107.12345     │
     │                    │
     │ [Edit coordinate]  │
     └───────────────────┘
```

Mental model:

```text
Globe Mode
→ spatial exploration

Precision Mode
→ geometry editing
```

---

# 21. UI Chrome

Background space dan UI harus terasa sebagai satu visual system.

Hindari:

```text
space background
+
white solid sidebar
+
white toolbar
```

Hasilnya akan terasa seperti dashboard yang ditempel di atas space.

Lebih baik:

```text
Space
  ↓
dark translucent UI
  ↓
subtle border
  ↓
optional blur
```

Tetapi jangan berlebihan menggunakan glassmorphism.

GIS editor membutuhkan keterbacaan dan precision, bukan efek dekoratif.

---

# 22. Prinsip Visual Utama

## 22.1 Background harus quiet

> Background harus terasa ada, tetapi tidak boleh terasa sedang dilihat.

## 22.2 Globe harus menjadi spatial context

> Globe membantu memahami lokasi, skala, dan bentuk bumi.

## 22.3 GeoJSON harus menjadi visual focus

> Data yang diedit harus mempunyai contrast tertinggi.

## 22.4 Atmosphere harus mendukung depth

> Atmosphere bukan neon decoration.

## 22.5 Stars adalah optional decoration

> Stars tidak boleh bersaing dengan geometry.

## 22.6 2D dan 3D memiliki peran berbeda

> Jangan memaksakan semua workflow menjadi 3D.

---

# 23. Hipotesis UX yang Dapat Diuji

Untuk mengubah desain menjadi penelitian UX yang lebih akademis, beberapa hipotesis dapat diuji.

| ID | Hipotesis | Variabel |
|---|---|---|
| H1 | Atmosphere meningkatkan kemampuan mengenali boundary globe | Atmosphere ON/OFF |
| H2 | Background gelap meningkatkan saliency GeoJSON | Dark vs light |
| H3 | Starfield berlebihan meningkatkan visual distraction | Low vs high density |
| H4 | Globe meningkatkan spatial orientation pada skala global | Globe vs 2D |
| H5 | Globe menurunkan precision pada geometry editing | Globe vs 2D |
| H6 | Subtle lighting meningkatkan depth perception | Lighting ON/OFF |
| H7 | High-contrast GeoJSON mempercepat feature detection | Contrast level |
| H8 | 2D lebih efektif untuk precision editing | Editing task × projection |
| H9 | Static background meningkatkan spatial stability | Static vs animated |
| H10 | Mode-specific visual treatment meningkatkan usability | Explore vs Edit |

---

# 24. Metode Evaluasi

Literatur terbaru menunjukkan bahwa eye-tracking digunakan untuk mengevaluasi usability interactive geovisualization.

Metrik yang dapat digunakan:

### Task completion time

Berapa lama pengguna menemukan dan memilih feature?

### Error rate

Berapa banyak kesalahan ketika memilih atau mengedit geometry?

### Visual search

Berapa lama pengguna menemukan feature tertentu?

### Fixation

Di mana perhatian pengguna terkonsentrasi?

### Saccade

Bagaimana perpindahan perhatian antara globe, geometry, dan UI?

### NASA-TLX

Untuk mengukur perceived workload.

### SUS

Untuk evaluasi perceived usability.

---

# 25. Eksperimen yang Disarankan

## Eksperimen A — Background

Bandingkan:

```text
A: black
B: dark gradient
C: dark gradient + stars
```

Task:

> Temukan polygon tertentu.

Metrik:

- completion time;
- error;
- fixation;
- perceived distraction.

---

## Eksperimen B — Atmosphere

Bandingkan:

```text
A: no atmosphere
B: subtle atmosphere
C: strong atmosphere
```

Task:

> Identifikasi batas globe dan pilih feature.

Hipotesis:

> Subtle atmosphere memberikan boundary cue yang lebih baik tanpa meningkatkan distraction.

---

## Eksperimen C — Globe vs 2D

Task:

1. menemukan negara;
2. menggambar polygon;
3. memindahkan vertex;
4. membaca koordinat.

Bandingkan:

```text
Globe
vs
Mercator 2D
```

Hipotesis:

```text
Global orientation
→ Globe unggul

Precision editing
→ 2D unggul
```

---

# 26. Konsep UI Final

Komposisi yang direkomendasikan:

```text
┌──────────────────────────────────────────────────────┐
│                                                      │
│                  ·                                   │
│          ✦                         ·                 │
│                                                      │
│                         ░░░░                         │
│                    ░░░░████░░░░                     │
│                 ░░██████████████░░                  │
│               ░████████████████████░                │
│              ███████   GEOJSON  ███████             │
│              ███████   ██████   ███████             │
│               ░██████████████████████░              │
│                 ░░██████████████░░                  │
│                    ░░░░████░░░░                     │
│                         ░░                          │
│                                                      │
│              ·                         ✦             │
│                                                      │
└──────────────────────────────────────────────────────┘
```

Karakter visual:

- dark;
- quiet;
- spatial;
- technical;
- sedikit futuristic;
- tidak sci-fi;
- data-oriented.

---

# 27. Design Tokens Konseptual

```text
BACKGROUND
Deep Space
Very dark
Static

GLOBE
Muted Earth
Low-to-medium contrast

ATMOSPHERE
Deep blue / muted cyan
Low opacity

DATA
High contrast accent
Context dependent

UI
Dark translucent
Subtle border
Minimal blur

STARS
Very low density
Low brightness
Static
```

---

# 28. Kesimpulan

Riset ini menghasilkan prinsip desain berikut:

> **1. Globe sebaiknya menjadi spatial canvas, bukan dekorasi.**

> **2. Background harus menyediakan negative space dan visual stability.**

> **3. Dark background dapat membantu membangun contrast hierarchy, tetapi brightness harus dikontrol agar tidak semua elemen menjadi attention-grabbing.**

> **4. Atmosphere sebaiknya digunakan sebagai depth/boundary cue, bukan sebagai neon effect.**

> **5. Stars harus minimal atau bahkan dihilangkan dalam editing mode.**

> **6. Globe dan 2D map sebaiknya menjadi dua mode karena masing-masing memiliki kelebihan untuk task yang berbeda.**

> **7. GeoJSON geometry harus memiliki saliency tertinggi.**

> **8. Lighting harus membantu spherical perception tanpa membuat globe menjadi photorealistic.**

> **9. Background dan atmosphere sebaiknya stabil; motion terutama berasal dari interaksi camera pengguna.**

> **10. Desain akhir harus dievaluasi melalui usability testing, bukan hanya visual inspection.**

Kesimpulan paling penting:

> **Jangan mendesain globe berdasarkan apa yang terlihat paling keren. Desain globe berdasarkan bagaimana background, atmosphere, lighting, dan geometry membentuk visual hierarchy serta membantu pengguna membaca spatial information.**

---

# 29. Referensi

## Produk / Implementasi

### geojson.io

Repository dan implementasi geojson.io:

https://github.com/mapbox/geojson.io

### Mapbox GL JS — Globe

Dokumentasi globe, termasuk atmosphere, background, star intensity, dan konfigurasi globe:

https://docs.mapbox.com/mapbox-gl-js/ja/guides/globe/

### Mapbox — GeoJSON.io Update

Pembahasan implementasi dan perkembangan geojson.io:

https://www.mapbox.com/blog/updating-geojson-io

### globe.gl

Library WebGL untuk interactive 3D globe:

https://github.com/vasturiano/globe.gl

---

## Literatur Ilmiah / Akademik

### Dong et al. — Map vs Globe in VR/Desktop

Penelitian eksperimen mengenai penggunaan map dan globe dalam VR dan desktop, melibatkan 120 partisipan dan eye-tracking.

https://www.tandfonline.com/doi/full/10.1080/17538947.2020.1731617

**Relevansi:**
- perbandingan 2D map dan globe;
- perilaku pengguna;
- spatial task;
- eye-tracking.

---

### 3D Map Perception and Cognition

Literatur mengenai persepsi dan kognisi pada 3D maps.

https://www.tandfonline.com/doi/full/10.1080/15230406.2014.901901

**Relevansi:**
- interpretasi spatial information;
- readability;
- cognition;
- tantangan 3D geovisualization.

---

### 2D vs 3D User Behavior

Penelitian mengenai perilaku pengguna ketika menggunakan visualisasi 2D dan 3D untuk spatial/wayfinding tasks.

https://www.tandfonline.com/doi/full/10.1080/17538947.2021.1984595

**Relevansi:**
- perbedaan perilaku pengguna;
- task-dependent visualization;
- 2D vs 3D.

---

### Interactive Maps, Perception, Cognition and Usability

Literatur mengenai perception, cognition, dan usability dalam interactive maps.

https://www.tandfonline.com/doi/full/10.1080/23729333.2017.1288534

**Relevansi:**
- visual perception;
- cognitive aspects;
- usability;
- interactive cartography.

---

### Color and Visual Attention

MacDonald — penelitian mengenai penggunaan warna dalam computer graphics dan perhatian visual.

https://ieeexplore.ieee.org/iel5/38/16795/00773961.pdf

**Relevansi:**
- brightness;
- color saliency;
- dark background;
- visual attention.

---

### Eye-tracking untuk Interactive Geovisualization

Review mengenai penggunaan eye-tracking untuk mengevaluasi usability interactive geovisualizations.

https://www.tandfonline.com/doi/full/10.1080/10447318.2026.2618556

**Relevansi:**
- eye-tracking;
- usability evaluation;
- interactive geovisualization;
- visual attention.

---

### Eye-tracking dalam Map Use Research

Review tahun 2026 yang memetakan 110 studi empiris mengenai eye-tracking dalam penggunaan map.

https://www.tandfonline.com/doi/full/10.1080/00221341.2026.2635040

**Relevansi:**
- gaze behavior;
- map interaction;
- visual attention;
- cartographic usability.

---

# 30. Catatan Metodologis

Tidak semua keputusan desain dalam dokumen ini merupakan temuan ilmiah langsung.

Ada tiga kategori evidence:

### A. Direct evidence

Temuan yang secara langsung berasal dari penelitian, misalnya:

- perbedaan penggunaan 2D dan 3D;
- penggunaan eye-tracking;
- hubungan warna dan visual attention;
- usability interactive geovisualization.

### B. Design inference

Kesimpulan desain yang diturunkan dari evidence tersebut, misalnya:

- background harus low-saliency;
- stars sebaiknya minimal;
- geometry harus memiliki contrast lebih tinggi;
- atmosphere harus subtle.

### C. Product design recommendation

Keputusan yang masih perlu divalidasi melalui usability testing pada produk target, misalnya:

- mode Explore vs Edit;
- exact opacity atmosphere;
- jumlah stars;
- exact accent color;
- apakah day/night boundary perlu default;
- apakah coordinate HUD harus selalu terlihat.

Pemisahan ini penting agar hasil riset tidak menganggap setiap keputusan visual sebagai "fakta ilmiah".

---

# 31. Prinsip Akhir

```text
                    USER TASK
                       │
                       ▼
                ┌─────────────┐
                │   GEOJSON   │
                │    DATA     │
                └──────┬──────┘
                       │
                       ▼
                  Globe Surface
                       │
                       ▼
                  Atmosphere
                       │
                       ▼
                   Background
```

Aturan utamanya:

> **Semakin jauh sebuah elemen dari task utama pengguna, semakin rendah visual saliency-nya.**

Dengan prinsip tersebut, background, atmosphere, stars, lighting, globe surface, dan GeoJSON dapat membentuk satu sistem visual yang konsisten.

---

**Status:** Research synthesis / UX design foundation  
**Scope:** geojson.io-inspired 3D globe interface  
**Fokus:** Globe, background, atmosphere, lighting, visual hierarchy, 2D/3D interaction, dan scientific evidence
