'use client';

import { useEffect, useState, useRef } from 'react';
import { Map, MapBrowserEvent } from 'ol';
import { toLonLat } from 'ol/proj';
import { ScaleLine } from 'ol/control';

interface StatusBarProps {
  map: Map | null;
  projection: string;
  is3d?: boolean;
}

export default function StatusBar({ map, projection, is3d = false }: StatusBarProps) {
  const [zoom, setZoom] = useState<number>(2);
  const [coords, setCoords] = useState<string>('0.0000, 0.0000');
  const [altitude, setAltitude] = useState<string>('12,000 km');
  const scaleLineRef = useRef<ScaleLine | null>(null);

  useEffect(() => {
    if (!map) return;

    // Update zoom and estimated camera altitude on view change
    const view = map.getView();
    const updateZoomAndAlt = () => {
      const z = view.getZoom();
      if (z !== undefined) {
        setZoom(Math.round(z * 100) / 100);
        // Estimate camera altitude from zoom level
        const res = view.getResolution();
        if (res !== undefined) {
          const altMeters = res * 1000;
          if (altMeters >= 1000000) {
            setAltitude(`${(altMeters / 1000000).toFixed(1)}k km`);
          } else if (altMeters >= 1000) {
            setAltitude(`${Math.round(altMeters / 1000).toLocaleString()} km`);
          } else {
            setAltitude(`${Math.round(altMeters)} m`);
          }
        }
      }
    };
    view.on('change:resolution', updateZoomAndAlt);
    updateZoomAndAlt();

    // Track mouse coordinates
    const handlePointerMove = (evt: MapBrowserEvent<PointerEvent>) => {
      if (evt.dragging) return;
      const lonLat = toLonLat(evt.coordinate);
      setCoords(`${lonLat[1].toFixed(4)}, ${lonLat[0].toFixed(4)}`);
    };
    map.on('pointermove', handlePointerMove);

    // Add scale line
    if (!scaleLineRef.current) {
      scaleLineRef.current = new ScaleLine({
        units: 'metric',
        bar: false,
        minWidth: 100,
      });
      map.addControl(scaleLineRef.current);
    }

    return () => {
      view.un('change:resolution', updateZoomAndAlt);
      map.un('pointermove', handlePointerMove);
    };
  }, [map]);

  return (
    <div className="status-bar fixed flex items-center justify-between z-40 px-3 py-1.5 text-muted-foreground gap-6 text-xs">
      <div className="flex items-center gap-3">
        {/* Mode Role Indicator */}
        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-[var(--radius)] font-medium text-[10px] bg-primary/15 text-primary border border-primary/30">
          {is3d ? '3D Globe (Context)' : '2D Map (Precision)'}
        </span>

        <span className="opacity-30">│</span>

        <span className="flex items-center gap-1.5">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="opacity-60"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          {coords}
        </span>

        <span className="opacity-30">│</span>

        {is3d ? (
          <span className="flex items-center gap-1">
            <span className="text-[10px] uppercase text-muted-foreground opacity-60">Alt:</span>
            <span>{altitude}</span>
          </span>
        ) : (
          <span className="flex items-center gap-1.5">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="opacity-60"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
            z{zoom}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <span className="text-[10px] uppercase tracking-wider opacity-60 font-mono">
          {is3d ? 'Cesium WGS84' : projection}
        </span>
      </div>
    </div>
  );
}
