'use client';

import { Check, Globe, Map as MapIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SceneViewSwitcherProps {
  is3d: boolean;
  onToggle3d: () => void;
  projection: 'EPSG:4326' | 'EPSG:3857';
  onProjectionChange: (proj: 'EPSG:4326' | 'EPSG:3857') => void;
}

export default function SceneViewSwitcher({
  is3d,
  onToggle3d,
  projection,
  onProjectionChange,
}: SceneViewSwitcherProps) {
  const handleSelectMode = (mode: '3d' | '3857' | '4326') => {
    if (mode === '3d') {
      if (!is3d) onToggle3d();
    } else {
      if (is3d) onToggle3d(); // Turn off 3D
      const fullProj: 'EPSG:3857' | 'EPSG:4326' = mode === '3857' ? 'EPSG:3857' : 'EPSG:4326';
      onProjectionChange(fullProj);
    }
  };

  const getActiveLabel = () => {
    if (is3d) return '3D';
    return projection.split(':')[1];
  };

  return (
    <TooltipProvider>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-8 h-8 rounded-[var(--radius)] flex items-center justify-center p-0 hover:bg-secondary"
                aria-label={`Map View & Projection: ${is3d ? '3D Globe' : getActiveLabel()}`}
              >
                {is3d ? <Globe className="h-4 w-4" /> : <MapIcon className="h-4 w-4" />}
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p className="text-xs">
              {is3d ? '3D Globe — Konteks Spasial Global' : `2D Map (${projection}) — Edit Presisi`}
            </p>
          </TooltipContent>
        </Tooltip>

          <DropdownMenuContent side="right" align="start" className="w-56">
            <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
              Mode 2D (Edit Presisi & Simpul)
            </DropdownMenuLabel>
            <DropdownMenuItem
              onSelect={() => handleSelectMode('3857')}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <MapIcon className="w-3.5 h-3.5" />
                <span className="text-xs">Web Mercator (EPSG:3857)</span>
              </div>
              {!is3d && projection === 'EPSG:3857' && <Check className="w-3.5 h-3.5 ml-2 text-primary" />}
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => handleSelectMode('4326')}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <MapIcon className="w-3.5 h-3.5" />
                <span className="text-xs">WGS 84 (EPSG:4326)</span>
              </div>
              {!is3d && projection === 'EPSG:4326' && <Check className="w-3.5 h-3.5 ml-2 text-primary" />}
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
              Mode 3D (Konteks & Eksplorasi)
            </DropdownMenuLabel>
            <DropdownMenuItem
              onSelect={() => handleSelectMode('3d')}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-medium">
                <Globe className="w-3.5 h-3.5" />
                <span className="text-xs">Cesium 3D Globe</span>
              </div>
              {is3d && <Check className="w-3.5 h-3.5 ml-2 text-cyan-500" />}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TooltipProvider>
  );
}
