'use client';

import type { Map } from 'ol';
import type { DrawType } from '@/app/page';
import { Toggle } from '@/components/ui/toggle';
import { Separator } from '@/components/ui/separator';
import {
  MapPin,
  Spline,
  Square,
  Circle,
  Pointer,
  Pencil,
  Trash2,
  Pentagon,
  Ruler,
  Maximize,
  Magnet,
  Scissors,
  FlaskConical,
  Layers,
} from 'lucide-react';
import BasemapSwitcher from './BasemapSwitcher';
import MapScreenshot from './MapScreenshot';
import TileLayer from 'ol/layer/Tile';
import { OSM, XYZ } from 'ol/source';
import SceneViewSwitcher from './SceneViewSwitcher';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface DrawingToolsProps {
  map: Map | null;
  drawType: DrawType | null;
  setDrawType: (type: DrawType | null) => void;
  featuresCount: number;
  tileLayer: TileLayer<OSM | XYZ> | null;
  activeBasemap?: string;
  onBasemapChange?: (basemapId: string) => void;
  is3d: boolean;
  onToggle3d: () => void;
  projection: 'EPSG:4326' | 'EPSG:3857';
  onProjectionChange: (proj: 'EPSG:4326' | 'EPSG:3857') => void;
  snappingEnabled?: boolean;
  onToggleSnapping?: () => void;
  onOpenSpatialTools?: () => void;
  onOpenUsabilityLab?: () => void;
}

export default function DrawingTools({
  map,
  drawType,
  setDrawType,
  featuresCount,
  tileLayer,
  activeBasemap,
  onBasemapChange,
  is3d,
  onToggle3d,
  projection,
  onProjectionChange,
  snappingEnabled = true,
  onToggleSnapping,
  onOpenSpatialTools,
  onOpenUsabilityLab,
}: DrawingToolsProps) {
  const handleDrawTypeChange = (type: DrawType) => {
    setDrawType(drawType === type ? null : type);
  };

  return (
    <div className="drawing-tools">
      <div className="drawing-controls">
        <SceneViewSwitcher
          is3d={is3d}
          onToggle3d={onToggle3d}
          projection={projection}
          onProjectionChange={onProjectionChange}
        />
        <BasemapSwitcher
          tileLayer={tileLayer}
          activeBasemap={activeBasemap}
          onBasemapChange={onBasemapChange}
        />
        <MapScreenshot map={map} />
        {onOpenUsabilityLab && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={onOpenUsabilityLab}
                  className="w-8 h-8 rounded-[var(--radius)] flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  aria-label="Usability & Evaluation Lab"
                >
                  <FlaskConical className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Usability Lab (Eksperimen A, B, C & SUS)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className="drawing-controls">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                aria-label="Select feature"
                pressed={drawType === null}
                onPressedChange={() => setDrawType(null)}
              >
                <Pointer className="h-4 w-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Select</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                aria-label="Draw a point"
                pressed={drawType === 'Point'}
                onPressedChange={() => handleDrawTypeChange('Point')}
              >
                <MapPin className="h-4 w-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Draw point</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                aria-label="Draw a line"
                pressed={drawType === 'LineString'}
                onPressedChange={() => handleDrawTypeChange('LineString')}
              >
                <Spline className="h-4 w-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Draw line</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                aria-label="Draw a polygon"
                pressed={drawType === 'Polygon'}
                onPressedChange={() => handleDrawTypeChange('Polygon')}
              >
                <Pentagon className="h-4 w-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Draw polygon</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                aria-label="Draw a rectangle"
                pressed={drawType === 'Rectangle'}
                onPressedChange={() => handleDrawTypeChange('Rectangle')}
              >
                <Square className="h-4 w-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Draw rectangle</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                aria-label="Draw a circle"
                pressed={drawType === 'Circle'}
                onPressedChange={() => handleDrawTypeChange('Circle')}
              >
                <Circle className="h-4 w-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Draw circle</p>
            </TooltipContent>
          </Tooltip>

          {/* Knife / Split Tool */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                aria-label="Split polygon (Knife Tool)"
                pressed={drawType === 'Slice'}
                onPressedChange={() => handleDrawTypeChange('Slice')}
              >
                <Scissors className="h-4 w-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Split polygon (Knife Tool)</p>
            </TooltipContent>
          </Tooltip>

          <Separator orientation="horizontal" className="my-1 bg-border" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                aria-label="Measure distance"
                pressed={drawType === 'MeasureDistance'}
                onPressedChange={() => handleDrawTypeChange('MeasureDistance')}
              >
                <Ruler className="h-4 w-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Measure distance</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                aria-label="Measure area"
                pressed={drawType === 'MeasureArea'}
                onPressedChange={() => handleDrawTypeChange('MeasureArea')}
              >
                <Maximize className="h-4 w-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Measure area</p>
            </TooltipContent>
          </Tooltip>

          <Separator orientation="horizontal" className="my-1 bg-border" />

          {/* Snapping Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                aria-label="Toggle Snapping"
                pressed={snappingEnabled}
                onPressedChange={() => onToggleSnapping && onToggleSnapping()}
                className={snappingEnabled ? 'text-primary bg-primary/10' : ''}
              >
                <Magnet className="h-4 w-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Magnetic snapping ({snappingEnabled ? 'on' : 'off'})</p>
            </TooltipContent>
          </Tooltip>

          {/* Spatial Tools Dialog Trigger */}
          {onOpenSpatialTools && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle
                  aria-label="Spatial analysis tools"
                  pressed={false}
                  onPressedChange={() => onOpenSpatialTools()}
                  className="hover:text-primary"
                >
                  <Layers className="h-4 w-4" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Spatial analysis (Turf.js)</p>
              </TooltipContent>
            </Tooltip>
          )}

          {featuresCount > 0 && (
            <>
              <Separator orientation="horizontal" className="my-1 bg-border" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle
                    aria-label="Edit feature"
                    pressed={drawType === 'Edit'}
                    onPressedChange={() => handleDrawTypeChange('Edit')}
                  >
                    <Pencil className="h-4 w-4" />
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Edit feature</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle
                    aria-label="Delete feature"
                    pressed={drawType === 'Delete'}
                    onPressedChange={() => handleDrawTypeChange('Delete')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Delete feature</p>
                </TooltipContent>
              </Tooltip>
            </>
          )}
        </TooltipProvider>
      </div>
    </div>
  );
}
