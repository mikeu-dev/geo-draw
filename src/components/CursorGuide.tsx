'use client';

import { useEffect, useState } from 'react';
import type { DrawType } from '@/hooks/useMap';
import { MapPin, Spline, Pentagon, Square, Circle, Ruler, Maximize, Magnet, Scissors } from 'lucide-react';

interface CursorGuideProps {
  drawType: DrawType | null;
  snappingEnabled?: boolean;
}

const GUIDE_MESSAGES: Record<string, { icon: typeof MapPin; title: string; instruction: string }> = {
  Point: {
    icon: MapPin,
    title: 'Draw Point',
    instruction: 'Klik pada peta untuk menempatkan titik koordinat',
  },
  LineString: {
    icon: Spline,
    title: 'Draw Line',
    instruction: 'Klik untuk menambah simpul (vertex) • Klik ganda untuk menyelesaikan garis',
  },
  Polygon: {
    icon: Pentagon,
    title: 'Draw Polygon',
    instruction: 'Klik untuk menambah sudut • Klik titik awal atau klik ganda untuk menutup bidang',
  },
  Rectangle: {
    icon: Square,
    title: 'Draw Rectangle',
    instruction: 'Klik dan tahan lalu seret untuk menentukan luas persegi empat',
  },
  Circle: {
    icon: Circle,
    title: 'Draw Circle',
    instruction: 'Klik titik pusat lalu seret keluar untuk menentukan radius lingkaran',
  },
  Slice: {
    icon: Scissors,
    title: 'Knife / Slice Polygon',
    instruction: 'Tarik garis pemotong melintasi poligon • Klik ganda untuk membelah poligon',
  },
  MeasureDistance: {
    icon: Ruler,
    title: 'Measure Distance',
    instruction: 'Klik untuk mengukur segmen jarak geodesic • Klik ganda untuk selesai',
  },
  MeasureArea: {
    icon: Maximize,
    title: 'Measure Area',
    instruction: 'Klik titik-titik area pengukuran • Klik titik awal untuk kalkulasi luas',
  },
};

export default function CursorGuide({ drawType, snappingEnabled = false }: CursorGuideProps) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);

  const isActive = Boolean(drawType && GUIDE_MESSAGES[drawType]);

  useEffect(() => {
    if (!isActive) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isActive]);

  if (!isActive || !drawType || !GUIDE_MESSAGES[drawType] || !position) {
    return null;
  }

  const guide = GUIDE_MESSAGES[drawType];
  const IconComponent = guide.icon;

  return (
    <div
      className="fixed pointer-events-none z-50 transition-transform duration-75 ease-out select-none hidden sm:block"
      style={{
        left: `${position.x + 16}px`,
        top: `${position.y + 16}px`,
      }}
    >
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background/90 backdrop-blur-md border border-border/70 shadow-lg text-xs animate-in fade-in zoom-in-95 duration-100">
        <IconComponent className="w-3.5 h-3.5 text-primary shrink-0 animate-pulse" />
        <div className="flex flex-col">
          <span className="font-semibold text-foreground flex items-center gap-1">
            {guide.title}
            {snappingEnabled && (
              <span className="inline-flex items-center gap-0.5 text-[10px] bg-primary/10 text-primary px-1 py-0.2 rounded font-normal">
                <Magnet className="w-2.5 h-2.5" /> Snap Active
              </span>
            )}
          </span>
          <span className="text-muted-foreground text-[11px] leading-tight">
            {guide.instruction}
          </span>
        </div>
      </div>
    </div>
  );
}
