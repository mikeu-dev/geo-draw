'use client';

import { useState } from 'react';
import type TileLayer from 'ol/layer/Tile';
import type { OSM, XYZ } from 'ol/source';
import { Layers, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import OSM_Source from 'ol/source/OSM';
import XYZ_Source from 'ol/source/XYZ';

export interface BasemapOption {
  id: string;
  name: string;
  tag: string;
  source: OSM_Source | XYZ_Source;
  renderPreview: () => React.ReactNode;
}

export const basemaps: BasemapOption[] = [
  {
    id: 'osm',
    name: 'OpenStreetMap',
    tag: 'Standard',
    source: new OSM_Source({ crossOrigin: 'anonymous' }),
    renderPreview: () => (
      <svg className="w-full h-full" viewBox="0 0 100 60" preserveAspectRatio="none">
        {/* Background land */}
        <rect width="100" height="60" fill="#f4f1eb" />
        {/* Green park zone */}
        <path d="M 5,5 Q 25,2 35,18 T 10,32 Z" fill="#cdebb0" />
        <rect x="55" y="8" width="38" height="18" rx="3" fill="#d5eed1" />
        {/* Blue river stream */}
        <path
          d="M 0,52 Q 28,42 55,50 T 100,42"
          stroke="#aadaff"
          strokeWidth="9"
          fill="none"
          strokeLinecap="round"
        />
        {/* Major roads */}
        <path d="M 0,22 L 100,22 M 48,0 L 48,60" stroke="#ffffff" strokeWidth="5" />
        <path d="M 0,22 L 100,22 M 48,0 L 48,60" stroke="#fcd890" strokeWidth="2.5" />
        {/* Secondary street */}
        <path d="M 10,0 L 90,60" stroke="#ffffff" strokeWidth="2.5" />
        <path d="M 10,0 L 90,60" stroke="#ffb978" strokeWidth="1.2" />
        {/* Buildings */}
        <rect x="18" y="10" width="8" height="6" fill="#ded8cb" rx="1" />
        <rect x="62" y="32" width="10" height="7" fill="#ded8cb" rx="1" />
      </svg>
    ),
  },
  {
    id: 'satellite',
    name: 'Satelit Esri',
    tag: 'Hybrid + Label',
    source: new XYZ_Source({
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      maxZoom: 19,
      crossOrigin: 'anonymous',
      attributions: 'Tiles © Esri',
    }),
    renderPreview: () => (
      <svg className="w-full h-full" viewBox="0 0 100 60" preserveAspectRatio="none">
        {/* Deep Ocean */}
        <rect width="100" height="60" fill="#0c1e38" />
        {/* Continent landmasses */}
        <path
          d="M 0,15 Q 18,5 32,22 T 15,48 Q 5,42 0,35 Z"
          fill="#2d5229"
          stroke="#3d6c38"
          strokeWidth="1"
        />
        <path
          d="M 45,5 Q 75,0 95,15 T 78,55 Q 52,48 42,32 Z"
          fill="#3b582b"
          stroke="#4e7339"
          strokeWidth="1"
        />
        {/* Mountain relief texture */}
        <path d="M 52,18 Q 62,25 72,16 T 85,28" stroke="#5d4c38" strokeWidth="3" fill="none" />
        {/* Cloud wisps */}
        <path
          d="M 10,28 Q 30,22 50,30 T 90,20"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="3.5"
          fill="none"
          strokeLinecap="round"
        />
        {/* Yellow/White Boundary Labels line */}
        <path
          d="M 20,18 L 30,30 M 55,20 L 70,35"
          stroke="#fbbf24"
          strokeWidth="1.2"
          strokeDasharray="2,2"
        />
      </svg>
    ),
  },
  {
    id: 'topo',
    name: 'Topografi',
    tag: 'Relief Kontur',
    source: new XYZ_Source({
      url: 'https://{a-c}.tile.opentopomap.org/{z}/{x}/{y}.png',
      maxZoom: 17,
      crossOrigin: 'anonymous',
      attributions: '© OpenTopoMap',
    }),
    renderPreview: () => (
      <svg className="w-full h-full" viewBox="0 0 100 60" preserveAspectRatio="none">
        {/* Base elevation tint */}
        <rect width="100" height="60" fill="#eaf0e0" />
        {/* Hillshade relief gradients */}
        <path d="M 0,60 Q 30,20 60,35 T 100,10 L 100,60 Z" fill="#dbe6cb" />
        <path d="M 20,60 Q 45,30 75,42 T 100,30 L 100,60 Z" fill="#ccdcb8" />
        {/* Contour lines */}
        <path
          d="M 0,45 Q 35,18 70,30 T 100,15"
          stroke="#8f9f77"
          strokeWidth="0.9"
          fill="none"
        />
        <path
          d="M 5,55 Q 40,28 75,38 T 100,25"
          stroke="#7d8d66"
          strokeWidth="0.9"
          fill="none"
        />
        <path
          d="M 0,32 Q 25,10 55,20 T 100,5"
          stroke="#9faf86"
          strokeWidth="0.8"
          fill="none"
        />
        {/* Peak summit indicator */}
        <polygon points="50,16 53,22 47,22" fill="#52633e" />
      </svg>
    ),
  },
  {
    id: 'dark',
    name: 'Dark Matter',
    tag: 'CartoDB',
    source: new XYZ_Source({
      url: 'https://{a-d}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      maxZoom: 20,
      crossOrigin: 'anonymous',
      attributions: '© CARTO',
    }),
    renderPreview: () => (
      <svg className="w-full h-full" viewBox="0 0 100 60" preserveAspectRatio="none">
        {/* Charcoal Dark Background */}
        <rect width="100" height="60" fill="#0f172a" />
        {/* Water body dark blue-grey */}
        <path
          d="M 0,48 Q 30,38 55,45 T 100,38"
          stroke="#1e293b"
          strokeWidth="8"
          fill="none"
        />
        {/* Neon illuminated road grid */}
        <path d="M 0,22 L 100,22 M 52,0 L 52,60" stroke="#334155" strokeWidth="4" />
        <path d="M 0,22 L 100,22 M 52,0 L 52,60" stroke="#38bdf8" strokeWidth="1.2" opacity="0.85" />
        <path d="M 12,0 L 88,60" stroke="#818cf8" strokeWidth="1" opacity="0.6" />
        {/* City light node dots */}
        <circle cx="52" cy="22" r="2.5" fill="#38bdf8" />
        <circle cx="28" cy="12" r="1.5" fill="#a78bfa" />
        <circle cx="75" cy="40" r="1.5" fill="#38bdf8" />
      </svg>
    ),
  },
];

interface BasemapSwitcherProps {
  tileLayer: TileLayer<OSM | XYZ> | null;
  activeBasemap?: string;
  onBasemapChange?: (basemapId: string) => void;
}

export default function BasemapSwitcher({
  tileLayer,
  activeBasemap = 'osm',
  onBasemapChange,
}: BasemapSwitcherProps) {
  const [currentBasemap, setCurrentBasemap] = useState<string>(activeBasemap);
  const [opacity, setOpacity] = useState<number>(1);

  const handleSelectBasemap = (basemapId: string) => {
    const selected = basemaps.find((b) => b.id === basemapId);
    if (selected && tileLayer) {
      tileLayer.setSource(selected.source as OSM_Source | XYZ_Source);
    }
    setCurrentBasemap(basemapId);
    onBasemapChange?.(basemapId);
  };

  const handleOpacityChange = (value: number) => {
    setOpacity(value);
    if (tileLayer) {
      tileLayer.setOpacity(value);
    }
  };

  if (!tileLayer) return null;

  const effectiveActive = activeBasemap || currentBasemap;

  return (
    <TooltipProvider>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-8 h-8 rounded-[var(--radius)] p-0 flex items-center justify-center hover:bg-secondary transition-colors"
                aria-label="Basemap & Opacity"
              >
                <Layers className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Pilih Basemap (Sinkron 2D & 3D)</p>
          </TooltipContent>
        </Tooltip>

        <DropdownMenuContent
          side="top"
          align="end"
          className="w-72 p-3 bg-card/95 backdrop-blur-xl border border-border/80 shadow-2xl rounded-lg"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/50">
            <div>
              <DropdownMenuLabel className="p-0 text-xs font-bold tracking-tight text-foreground">
                Gaya Peta (Basemap)
              </DropdownMenuLabel>
              <p className="text-[10px] text-muted-foreground">
                Tersinkronisasi ke 2D & 3D Globe
              </p>
            </div>
          </div>

          {/* 2x2 Mini Preview Cards Grid */}
          <div className="grid grid-cols-2 gap-2 my-1">
            {basemaps.map((b) => {
              const isSelected = effectiveActive === b.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => handleSelectBasemap(b.id)}
                  className={`
                    relative group flex flex-col rounded-md overflow-hidden border text-left transition-all duration-150 cursor-pointer
                    ${
                      isSelected
                        ? 'border-primary ring-2 ring-primary/30 shadow-md bg-accent/30'
                        : 'border-border/60 hover:border-primary/50 hover:bg-accent/20 bg-muted/20'
                    }
                  `}
                >
                  {/* Thumbnail Mini Preview */}
                  <div className="relative w-full h-12 bg-muted overflow-hidden">
                    {b.renderPreview()}

                    {/* Active Selected Check Badge */}
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-4 h-4 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-md animate-in zoom-in duration-150">
                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  {/* Card Label */}
                  <div className="p-1.5 flex flex-col">
                    <span
                      className={`text-[11px] font-semibold truncate ${
                        isSelected ? 'text-primary' : 'text-foreground'
                      }`}
                    >
                      {b.name}
                    </span>
                    <span className="text-[9px] text-muted-foreground truncate">{b.tag}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <DropdownMenuSeparator className="my-2 bg-border/50" />

          {/* Opacity Slider */}
          <div className="pt-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                Opasitas Basemap
              </span>
              <span className="text-[10px] text-foreground font-mono font-medium">
                {Math.round(opacity * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={opacity}
              onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            />
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  );
}
