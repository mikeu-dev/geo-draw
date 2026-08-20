'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  BookOpen,
  MapPin,
  PenTool,
  TableProperties,
  Sparkles,
  Code2,
  Globe,
  Layout,
  Keyboard,
  Download,
  Terminal,
  Search,
  CheckCircle2,
} from 'lucide-react';

export type HelpSectionId =
  | 'overview'
  | 'drawing'
  | 'table'
  | 'spatial'
  | 'editor'
  | 'projections'
  | 'workspace'
  | 'shortcuts'
  | 'export'
  | 'api';

interface HelpSection {
  id: HelpSectionId;
  title: string;
  shortTitle: string;
  icon: React.ElementType;
  badge?: string;
}

const SECTIONS: HelpSection[] = [
  {
    id: 'overview',
    title: 'Overview & Supported Formats',
    shortTitle: 'Overview & Formats',
    icon: MapPin,
  },
  {
    id: 'drawing',
    title: 'Drawing & Vector Tools',
    shortTitle: 'Drawing & Vectors',
    icon: PenTool,
  },
  {
    id: 'table',
    title: 'Attribute Table & Field Calculations',
    shortTitle: 'Table & Fields',
    icon: TableProperties,
    badge: 'Batch',
  },
  {
    id: 'spatial',
    title: 'Spatial Analysis Toolkit (Turf.js)',
    shortTitle: 'Spatial Toolkit',
    icon: Sparkles,
  },
  {
    id: 'editor',
    title: 'Monaco Code Editor & Validation',
    shortTitle: 'Editor & Validation',
    icon: Code2,
  },
  {
    id: 'projections',
    title: 'Projections, Basemaps & 3D Globe',
    shortTitle: 'Projections & 3D',
    icon: Globe,
  },
  {
    id: 'workspace',
    title: 'Workspace & Layout Customization',
    shortTitle: 'Workspace Layout',
    icon: Layout,
  },
  {
    id: 'shortcuts',
    title: 'Keyboard Shortcuts & Hotkeys',
    shortTitle: 'Shortcuts',
    icon: Keyboard,
  },
  {
    id: 'export',
    title: 'Export Formats & Downloads',
    shortTitle: 'Export Data',
    icon: Download,
  },
  {
    id: 'api',
    title: 'Developer & Console API',
    shortTitle: 'Developer API',
    icon: Terminal,
    badge: 'window.geovara',
  },
];

interface HelpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function HelpModal({ open, onOpenChange }: HelpModalProps) {
  const [activeSection, setActiveSection] = useState<HelpSectionId>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSections = SECTIONS.filter(
    (sec) =>
      sec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sec.shortTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[88vh] max-h-[850px] p-0 flex flex-col gap-0 overflow-hidden bg-background border-border shadow-2xl">
        {/* Modal Header */}
        <DialogHeader className="px-6 py-4 border-b border-border/80 bg-card/60 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 border border-primary/20">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg font-bold tracking-tight">
                Geovara Documentation & User Guide
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Panduan komprehensif fitur, alat pemetaan, analisis spasial, tabel atribut, dan API Geovara.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* 2-Column Body Layout */}
        <div className="flex flex-1 min-h-0 divide-x divide-border overflow-hidden">
          {/* Sidebar Left: Navigation Tabs */}
          <div className="w-56 sm:w-64 flex-shrink-0 bg-muted/20 flex flex-col h-full border-r border-border">
            {/* Search Filter Box */}
            <div className="p-3 border-b border-border/60">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Cari topik panduan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground/60"
                />
              </div>
            </div>

            {/* Topic List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredSections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all text-left group ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 flex-shrink-0 transition-colors ${
                          isActive
                            ? 'text-primary-foreground'
                            : 'text-muted-foreground group-hover:text-foreground'
                        }`}
                      />
                      <span className="truncate">{section.shortTitle}</span>
                    </div>
                    {section.badge && (
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded ml-1 flex-shrink-0 ${
                          isActive
                            ? 'bg-primary-foreground/20 text-primary-foreground'
                            : 'bg-muted text-muted-foreground border border-border'
                        }`}
                      >
                        {section.badge}
                      </span>
                    )}
                  </button>
                );
              })}
              {filteredSections.length === 0 && (
                <div className="text-center py-6 text-xs text-muted-foreground">
                  Topik tidak ditemukan
                </div>
              )}
            </div>
          </div>

          {/* Content Area Right */}
          <div className="flex-1 h-full overflow-y-auto p-6 bg-card/20">
            <div className="max-w-3xl space-y-6 text-sm text-foreground leading-relaxed">
              {activeSection === 'overview' && (
                <section className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-border">
                    <MapPin className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-bold">Overview & Supported Formats</h3>
                  </div>
                  <p>
                    <strong>Geovara</strong> adalah platform geospasial profesional untuk membuat,
                    memvisualisasikan, menganalisis, mengedit, dan membagikan data geografis secara
                    instan di peramban web (*browser*) tanpa perlu instalasi server.
                  </p>

                  <div className="bg-muted/40 p-4 rounded-lg border border-border space-y-3">
                    <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                      Format Berkas yang Didukung (Drag & Drop)
                    </h4>
                    <div className="grid sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-2.5 rounded bg-background border border-border space-y-1">
                        <div className="font-semibold text-primary">GeoJSON (.geojson, .json)</div>
                        <div className="text-muted-foreground text-[11px]">
                          Standar RFC 7946 FeatureCollection, Poligon, Titik, Garis, dan Geometri Kompleks.
                        </div>
                      </div>
                      <div className="p-2.5 rounded bg-background border border-border space-y-1">
                        <div className="font-semibold text-primary">ESRI Shapefile (.zip, .shp)</div>
                        <div className="text-muted-foreground text-[11px]">
                          Parser Shapefile bawaan dengan reprojeksi otomatis <code>proj4</code> (misal UTM Zone 48S) dan decoding DBF <code>.cpg</code>.
                        </div>
                      </div>
                      <div className="p-2.5 rounded bg-background border border-border space-y-1">
                        <div className="font-semibold text-primary">CSV (.csv)</div>
                        <div className="text-muted-foreground text-[11px]">
                          Deteksi otomatis kolom koordinat (lat, lon, latitude, longitude, x, y, wkt).
                        </div>
                      </div>
                      <div className="p-2.5 rounded bg-background border border-border space-y-1">
                        <div className="font-semibold text-primary">WKT (.wkt, .txt)</div>
                        <div className="text-muted-foreground text-[11px]">
                          Well-Known Text geometry standar PostGIS, QGIS, dan spatial database.
                        </div>
                      </div>
                      <div className="p-2.5 rounded bg-background border border-border space-y-1">
                        <div className="font-semibold text-primary">TopoJSON (.topojson, .json)</div>
                        <div className="text-muted-foreground text-[11px]">
                          Format vektor terkompresi dengan topologi berbagi-busur (*arc-shared*).
                        </div>
                      </div>
                      <div className="p-2.5 rounded bg-background border border-border space-y-1">
                        <div className="font-semibold text-primary">KML / KMZ (.kml, .kmz)</div>
                        <div className="text-muted-foreground text-[11px]">
                          Format standar Google Earth dengan styling dan parsing atribut lengkap.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-secondary/40 rounded-lg text-xs space-y-1">
                    <span className="font-semibold text-foreground">Pencarian Lokasi Global:</span>
                    <p className="text-muted-foreground">
                      Gunakan bilah pencarian lokasi di bagian atas peta untuk terbang (*flyTo*) ke
                      alamat, kota, koordinat, atau landmark mana pun di seluruh dunia, dengan opsi
                      menambahkan hasil sebagai fitur titik pada kanvas.
                    </p>
                  </div>
                </section>
              )}

              {activeSection === 'drawing' && (
                <section className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-border">
                    <PenTool className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-bold">Drawing & Vector Tools</h3>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Gunakan bilah alat gambar di sebelah kanan kanvas untuk membuat geometri vektor dengan presisi tinggi:
                  </p>

                  <div className="space-y-2.5 text-xs">
                    <div className="p-3 rounded-lg border border-border bg-card/60 flex items-start gap-3">
                      <div className="font-bold text-primary w-24 flex-shrink-0">Point</div>
                      <div className="text-muted-foreground">Membuat penanda titik koordinat tunggal dengan warna dan ukuran marker kustom.</div>
                    </div>
                    <div className="p-3 rounded-lg border border-border bg-card/60 flex items-start gap-3">
                      <div className="font-bold text-primary w-24 flex-shrink-0">LineString</div>
                      <div className="text-muted-foreground">Menggambar segmen garis terhubung, rute jalan, batas aliran sungai, atau trajektori.</div>
                    </div>
                    <div className="p-3 rounded-lg border border-border bg-card/60 flex items-start gap-3">
                      <div className="font-bold text-primary w-24 flex-shrink-0">Polygon</div>
                      <div className="text-muted-foreground">Menggambar poligon bebas untuk membatasi zonasi wilayah, kavling, atau tutupan lahan.</div>
                    </div>
                    <div className="p-3 rounded-lg border border-border bg-card/60 flex items-start gap-3">
                      <div className="font-bold text-primary w-24 flex-shrink-0">Rectangle</div>
                      <div className="text-muted-foreground">Membuat kotak pembatas persegi (*Bounding Box / BBox*) dengan orientasi sumbu geografis.</div>
                    </div>
                    <div className="p-3 rounded-lg border border-border bg-card/60 flex items-start gap-3">
                      <div className="font-bold text-primary w-24 flex-shrink-0">Circle</div>
                      <div className="text-muted-foreground">Membuat lingkaran geodetik akurat yang otomatis didekati sebagai poligon resolusi tinggi.</div>
                    </div>
                    <div className="p-3 rounded-lg border border-border bg-card/60 flex items-start gap-3">
                      <div className="font-bold text-primary w-24 flex-shrink-0">Knife / Slice</div>
                      <div className="text-muted-foreground">Tarik garis pemotong melintasi poligon untuk membelah poligon menjadi beberapa geometri valid secara instan.</div>
                    </div>
                    <div className="p-3 rounded-lg border border-border bg-card/60 flex items-start gap-3">
                      <div className="font-bold text-primary w-24 flex-shrink-0">Magnetic Snap</div>
                      <div className="text-muted-foreground">Mengaktifkan snapping otomatis agar verteks menempel secara presisi pada simpul dan tepi fitur lain.</div>
                    </div>
                  </div>
                </section>
              )}

              {activeSection === 'table' && (
                <section className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-border">
                    <TableProperties className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-bold">Attribute Table & Batch Calculations</h3>
                  </div>
                  <p>
                    Buka tab <strong>Table</strong> di sidebar untuk menginspeksi, mengedit, dan memanipulasi atribut fitur dalam tabel data interaktif berkinerja tinggi.
                  </p>

                  <div className="grid sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg border border-border bg-background space-y-1.5">
                      <div className="font-semibold text-primary">Inline Cell Editing</div>
                      <div className="text-muted-foreground">
                        Klik pada sel atribut mana saja untuk mengubah nilainya secara langsung tanpa membuka dialog terpisah.
                      </div>
                    </div>
                    <div className="p-3 rounded-lg border border-border bg-background space-y-1.5">
                      <div className="font-semibold text-primary">Multi-Select Row Action</div>
                      <div className="text-muted-foreground">
                        Pilih baris secara selektif dengan checkbox atau centang *Select All* untuk melakukan operasi massal.
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-muted/40 border border-border space-y-2">
                    <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                      Kalkulasi Geometris Otomatis (Batch Field Calculation)
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Klik <strong>Batch Edit</strong> untuk menyuntikkan kalkulasi geometris deterministik ke seluruh dataset:
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
                      <div className="p-1.5 bg-background rounded border border-border"><code>$area_ha</code> (Hektar)</div>
                      <div className="p-1.5 bg-background rounded border border-border"><code>$area_m2</code> (Meter²)</div>
                      <div className="p-1.5 bg-background rounded border border-border"><code>$area_km2</code> (Km²)</div>
                      <div className="p-1.5 bg-background rounded border border-border"><code>$length_m</code> (Panjang)</div>
                      <div className="p-1.5 bg-background rounded border border-border"><code>$centroid_lat</code> (Lintang)</div>
                      <div className="p-1.5 bg-background rounded border border-border"><code>$centroid_lon</code> (Bujur)</div>
                    </div>
                  </div>
                </section>
              )}

              {activeSection === 'spatial' && (
                <section className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-border">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-bold">Spatial Analysis Toolkit</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Akses operasi analisis spasial canggih berbasis algoritma Turf.js langsung di sisi klien (*client-side*):
                  </p>

                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded border border-border bg-card/60">
                      <div className="font-semibold text-primary mb-0.5">Buffer Generator</div>
                      <div className="text-muted-foreground">Membuat zona penyangga geodetik dengan radius fleksibel (meter, kilometer, mil, kaki).</div>
                    </div>
                    <div className="p-2.5 rounded border border-border bg-card/60">
                      <div className="font-semibold text-primary mb-0.5">Multi-Ring Reachability</div>
                      <div className="text-muted-foreground">Menghasilkan zonasi jangkauan radial bertingkat dengan gradasi warna (*heat spectrum*) untuk aksesibilitas fasilitas.</div>
                    </div>
                    <div className="p-2.5 rounded border border-border bg-card/60">
                      <div className="font-semibold text-primary mb-0.5">Simplify Geometry</div>
                      <div className="text-muted-foreground">Mengurangi kerapatan simpul menggunakan algoritma Douglas-Peucker dengan preservasi topologi berkualitas tinggi.</div>
                    </div>
                    <div className="p-2.5 rounded border border-border bg-card/60">
                      <div className="font-semibold text-primary mb-0.5">Convex Hull</div>
                      <div className="text-muted-foreground">Menghitung selubung poligon cembung terluar (*Minimum Bounding Convex Envelope*) yang mengelilingi titik.</div>
                    </div>
                    <div className="p-2.5 rounded border border-border bg-card/60">
                      <div className="font-semibold text-primary mb-0.5">Centroids Generator</div>
                      <div className="text-muted-foreground">Mengekstrak titik pusat massa geometris (*Center of Mass*) dari poligon atau kumpulan data.</div>
                    </div>
                    <div className="p-2.5 rounded border border-border bg-card/60">
                      <div className="font-semibold text-primary mb-0.5">Unkink Polygons</div>
                      <div className="text-muted-foreground">Memperbaiki dan memecah poligon kompleks dengan simpul bersilangan sendiri (*self-intersecting*) menjadi poligon sederhana valid.</div>
                    </div>
                    <div className="p-2.5 rounded border border-border bg-card/60">
                      <div className="font-semibold text-primary mb-0.5">Boolean Union</div>
                      <div className="text-muted-foreground">Menyatukan beberapa poligon yang bertumpukan menjadi satu kesatuan poligon tanpa batas internal.</div>
                    </div>
                  </div>
                </section>
              )}

              {activeSection === 'editor' && (
                <section className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-border">
                    <Code2 className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-bold">Monaco Code Editor & RFC 7946 Validation</h3>
                  </div>
                  <p>
                    Pada tab <strong>JSON</strong>, seluruh struktur data GeoJSON dapat diedit langsung menggunakan mesin editor Monaco (VS Code engine).
                  </p>

                  <div className="space-y-3 text-xs">
                    <div className="p-3 bg-muted/40 rounded-lg border border-border space-y-1">
                      <div className="font-semibold text-foreground flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        Validasi RFC 7946 Deterministik (0ms)
                      </div>
                      <p className="text-muted-foreground">
                        Memeriksa sintaks JSON, struktur FeatureCollection, cincin poligon tertutup, dan rentang koordinat WGS 84 secara real-time tanpa konsumsi token AI.
                      </p>
                    </div>

                    <div className="p-3 bg-muted/40 rounded-lg border border-border space-y-1">
                      <div className="font-semibold text-foreground">Interactive Error Locator</div>
                      <p className="text-muted-foreground">
                        Jika terdapat kesalahan sintaks atau geometri, banner error akan menampilkan nomor baris & kolom. Mengklik tombol banner akan langsung melompatkan kursor editor ke baris yang bermasalah.
                      </p>
                    </div>

                    <div className="p-3 bg-muted/40 rounded-lg border border-border space-y-1">
                      <div className="font-semibold text-foreground">Tombol Rapikan / Format JSON</div>
                      <p className="text-muted-foreground">
                        Gunakan tombol kode (<Code2 className="w-3.5 h-3.5 inline mx-0.5" />) di pojok kanan atas editor untuk merapikan indentasi JSON minified seketika.
                      </p>
                    </div>
                  </div>
                </section>
              )}

              {activeSection === 'projections' && (
                <section className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-border">
                    <Globe className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-bold">Projections, Basemaps & 3D Globe</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Beralih antara dimensi proyeksi 2D dan visualisasi bola bumi 3D dengan satu klik pada bilah alat atas:
                  </p>

                  <div className="grid sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg border border-border bg-background space-y-1">
                      <div className="font-semibold text-primary">Web Mercator (EPSG:3857)</div>
                      <div className="text-muted-foreground">Standar proyeksi web tile datar untuk navigasi peta interaktif.</div>
                    </div>
                    <div className="p-3 rounded-lg border border-border bg-background space-y-1">
                      <div className="font-semibold text-primary">WGS 84 (EPSG:4326)</div>
                      <div className="text-muted-foreground">Sistem koordinat geografis bujur/lintang datar (*equirectangular*).</div>
                    </div>
                    <div className="p-3 rounded-lg border border-border bg-background space-y-1 sm:col-span-2">
                      <div className="font-semibold text-primary">Realistic 3D Globe (CesiumJS)</div>
                      <div className="text-muted-foreground">
                        Visualisasi bola bumi interaktif WebGL 3D dengan pencahayaan matahari realistis, peta bintang angkasa, atmosfer dinamis, dan label kartografi hibrida (Google Earth style).
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-secondary/40 rounded-lg text-xs space-y-1">
                    <span className="font-semibold text-foreground">Sinkronisasi Peta Dasar (Basemaps):</span>
                    <p className="text-muted-foreground">
                      Pilihan peta dasar (OpenStreetMap, Esri Satellite, OpenTopoMap, CartoDB Dark Matter) tersinkronisasi secara mulus antara tampilan 2D dan 3D Globe.
                    </p>
                  </div>
                </section>
              )}

              {activeSection === 'workspace' && (
                <section className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-border">
                    <Layout className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-bold">Workspace & Layout Customization</h3>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-lg border border-border bg-card/60 space-y-1">
                      <div className="font-semibold text-primary">Horizontal Drag Resize</div>
                      <p className="text-muted-foreground">
                        Klik dan geser tepi kanan sidebar secara horizontal untuk memperlebar area kerja editor hingga 50% lebar layar monitor.
                      </p>
                    </div>
                    <div className="p-3 rounded-lg border border-border bg-card/60 space-y-1">
                      <div className="font-semibold text-primary">Drag to Collapse</div>
                      <p className="text-muted-foreground">
                        Tarik sidebar ke arah tepi kiri layar untuk melipat sidebar sepenuhnya dan memaksimalkan tampilan peta.
                      </p>
                    </div>
                    <div className="p-3 rounded-lg border border-border bg-card/60 space-y-1">
                      <div className="font-semibold text-primary">Floating Restore Toggle</div>
                      <p className="text-muted-foreground">
                        Ketika sidebar terlipat, tombol toggle minimalis akan muncul otomatis di tepi kiri untuk membuka kembali sidebar ke ukuran sebelumnya.
                      </p>
                    </div>
                  </div>
                </section>
              )}

              {activeSection === 'shortcuts' && (
                <section className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-border">
                    <Keyboard className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-bold">Keyboard Shortcuts & Hotkeys</h3>
                  </div>
                  <div className="border border-border rounded-lg overflow-hidden bg-background">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-border bg-muted/50 text-left">
                          <th className="py-2.5 px-3.5 font-semibold text-muted-foreground">Kategori</th>
                          <th className="py-2.5 px-3.5 font-semibold text-muted-foreground">Pintasan Keyboard</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        <tr>
                          <td className="py-2 px-3.5 font-medium text-muted-foreground">Menggambar</td>
                          <td className="py-2 px-3.5 space-x-1">
                            <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-[11px] font-mono">V</kbd> <span>Select</span> ·{' '}
                            <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-[11px] font-mono">P</kbd> <span>Point</span> ·{' '}
                            <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-[11px] font-mono">L</kbd> <span>Line</span> ·{' '}
                            <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-[11px] font-mono">G</kbd> <span>Polygon</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3.5 font-medium text-muted-foreground">Bentuk Geometri</td>
                          <td className="py-2 px-3.5 space-x-1">
                            <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-[11px] font-mono">R</kbd> <span>Rectangle</span> ·{' '}
                            <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-[11px] font-mono">C</kbd> <span>Circle</span> ·{' '}
                            <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-[11px] font-mono">E</kbd> <span>Edit</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3.5 font-medium text-muted-foreground">Pengukuran</td>
                          <td className="py-2 px-3.5 space-x-1">
                            <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-[11px] font-mono">M</kbd> <span>Jarak (Distance)</span> ·{' '}
                            <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-[11px] font-mono">A</kbd> <span>Luas (Area)</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3.5 font-medium text-muted-foreground">Riwayat Edit</td>
                          <td className="py-2 px-3.5 space-x-1">
                            <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-[11px] font-mono">Ctrl+Z</kbd> <span>Undo</span> ·{' '}
                            <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-[11px] font-mono">Ctrl+Y</kbd> <span>Redo</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3.5 font-medium text-muted-foreground">Geovara AI</td>
                          <td className="py-2 px-3.5 space-x-1">
                            <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-[11px] font-mono">Ctrl+K</kbd> / <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-[11px] font-mono">Cmd+K</kbd> <span>Buka Prompt AI</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3.5 font-medium text-muted-foreground">Navigasi Umum</td>
                          <td className="py-2 px-3.5 space-x-1">
                            <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-[11px] font-mono">Esc</kbd> <span>Batal Seleksi</span> ·{' '}
                            <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-[11px] font-mono">Del</kbd> / <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-[11px] font-mono">Backspace</kbd> <span>Hapus Fitur</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {activeSection === 'export' && (
                <section className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-border">
                    <Download className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-bold">Export Formats & Downloads</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Klik ikon unduh pada header sidebar untuk mengekspor dataset ke berbagai format GIS standar:
                  </p>

                  <div className="grid sm:grid-cols-2 gap-2.5 text-xs">
                    <div className="p-2.5 rounded border border-border bg-card/60">
                      <div className="font-semibold text-primary">GeoJSON (.geojson)</div>
                      <div className="text-muted-foreground text-[11px]">Format standar web dan aplikasi GIS modern (RFC 7946).</div>
                    </div>
                    <div className="p-2.5 rounded border border-border bg-card/60">
                      <div className="font-semibold text-primary">CSV (.csv)</div>
                      <div className="text-muted-foreground text-[11px]">Tabel spreadsheet dengan kolom bujur, lintang, dan atribut.</div>
                    </div>
                    <div className="p-2.5 rounded border border-border bg-card/60">
                      <div className="font-semibold text-primary">WKT (.wkt)</div>
                      <div className="text-muted-foreground text-[11px]">Format teks geometri untuk query SQL database spasial.</div>
                    </div>
                    <div className="p-2.5 rounded border border-border bg-card/60">
                      <div className="font-semibold text-primary">TopoJSON (.topojson)</div>
                      <div className="text-muted-foreground text-[11px]">Vektor terkompresi dengan topologi berbagi busur.</div>
                    </div>
                    <div className="p-2.5 rounded border border-border bg-card/60 sm:col-span-2">
                      <div className="font-semibold text-primary">KML / KMZ (.kml, .kmz)</div>
                      <div className="text-muted-foreground text-[11px]">Format standar Google Earth dan aplikasi GPS genggam.</div>
                    </div>
                  </div>
                </section>
              )}

              {activeSection === 'api' && (
                <section className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-border">
                    <Terminal className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-bold">Developer & Console API</h3>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="space-y-1">
                      <div className="font-semibold text-foreground">1. Remote Public GeoJSON Loader (URL Param)</div>
                      <div className="p-2 bg-muted rounded font-mono text-[11px] break-all border border-border">
                        /?url=https://raw.githubusercontent.com/.../data.geojson
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="font-semibold text-foreground">2. Deep Linking & State Sharing (Hash Param)</div>
                      <div className="p-2 bg-muted rounded font-mono text-[11px] break-all border border-border">
                        /#data=N4KABGBEAuCe...&amp;map=8/51.5/-0.1
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2">
                      <div className="font-semibold text-foreground">3. Browser Console API (<code>window.geovara</code>)</div>
                      <div className="p-3 bg-muted/60 rounded-lg border border-border font-mono text-[11px] space-y-1">
                        <div><span className="text-primary">geovara.getGeoJSON()</span> — Mendapatkan objek FeatureCollection aktif.</div>
                        <div><span className="text-primary">geovara.setGeoJSON(data)</span> — Mengganti data peta dengan objek/string GeoJSON baru.</div>
                        <div><span className="text-primary">geovara.addFeature(geom, props)</span> — Menambahkan 1 fitur baru ke kanvas.</div>
                        <div><span className="text-primary">geovara.clear()</span> — Menghapus semua fitur pada peta dan editor.</div>
                        <div><span className="text-primary">geovara.zoomToExtent()</span> — Menyesuaikan viewport kamera ke seluruh data (*fitBounds*).</div>
                        <div><span className="text-primary">geovara.getMap()</span> — Mengakses instansi OpenLayers Map secara langsung.</div>
                      </div>
                    </div>
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
