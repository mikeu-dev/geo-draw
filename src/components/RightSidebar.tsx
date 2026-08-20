'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  Layers,
  Eye,
  EyeOff,
  Map as MapIcon,
  Crosshair,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Grid,
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import FileDropZone from './FileDropZone';
import GeoJSON from 'ol/format/GeoJSON';
import KML from 'ol/format/KML';
import { Feature } from 'ol';
import { Geometry } from 'ol/geom';
import { getArea, getLength } from 'ol/sphere';
import { GisService } from '@/lib/spatial';
import {
  parseGeoJsonStringInWorker,
  shouldParseGeoJsonInWorker,
} from '@/lib/geojson-worker-parse';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const kmlFormat = new KML({
  extractStyles: true,
  showPointNames: true,
});

interface RightSidebarProps {
  features: Feature<Geometry>[];
  onGeojsonChange: (geojsonStr: string) => void;
  onDeleteFeature: (featureId: string | number) => void;
  onZoomToFeature: (featureId: string | number) => void;
  onFeatureSelect: (feature: Feature<Geometry> | null) => void;
  onHeavyParseChange?: (isParsing: boolean) => void;
  vectorOpacity: number;
  onVectorOpacityChange: (opacity: number) => void;
  vectorVisible: boolean;
  onVectorVisibleChange: (visible: boolean) => void;
  basemapOpacity: number;
  onBasemapOpacityChange: (opacity: number) => void;
  showGraticule?: boolean;
  onToggleGraticule?: () => void;
}

export default function RightSidebar({
  features,
  onGeojsonChange,
  onDeleteFeature,
  onZoomToFeature,
  onFeatureSelect,
  onHeavyParseChange,
  vectorOpacity,
  onVectorOpacityChange,
  vectorVisible,
  onVectorVisibleChange,
  basemapOpacity,
  onBasemapOpacityChange,
  showGraticule = false,
  onToggleGraticule,
}: RightSidebarProps) {
  const { toast } = useToast();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState<number>(340);
  const [lastWidth, setLastWidth] = useState<number>(340);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [featureToDelete, setFeatureToDelete] = useState<string | number | null>(null);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const handleExpandSidebar = useCallback(() => {
    setIsCollapsed(false);
    const targetWidth = lastWidth >= 160 ? lastWidth : 340;
    const maxWidth = Math.floor(window.innerWidth * 0.45);
    const clamped = Math.min(targetWidth, maxWidth);
    setSidebarWidth(clamped);
    setLastWidth(clamped);
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
  }, [lastWidth]);

  // Handle live horizontal drag resize from left edge of right sidebar
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const maxWidth = Math.floor(window.innerWidth * 0.45);
      const newWidth = window.innerWidth - e.clientX;

      if (newWidth < 140) {
        // Dragged past right threshold -> collapse completely
        setIsCollapsed(true);
        setSidebarWidth(0);
      } else {
        setIsCollapsed(false);
        const clampedWidth = Math.min(newWidth, maxWidth);
        setSidebarWidth(clampedWidth);
        setLastWidth(clampedWidth);
      }
      window.dispatchEvent(new Event('resize'));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.dispatchEvent(new Event('resize'));
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  // Adjust max width on window resize
  useEffect(() => {
    const handleWindowResize = () => {
      const maxWidth = Math.floor(window.innerWidth * 0.45);
      setSidebarWidth((prev) => (prev > maxWidth ? maxWidth : prev));
    };
    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
  }, []);

  // Synchronize map viewport whenever sidebar is toggled or resized
  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 320);
    return () => clearTimeout(timer);
  }, [isCollapsed]);

  const handleConfirmDeleteFeature = (id: string | number | null) => {
    if (id !== null && id !== undefined) {
      onDeleteFeature(id);
      setFeatureToDelete(null);
    }
  };

  return (
    <>
      {/* Floating Restore Button on Right Canvas Edge when Collapsed */}
      {isCollapsed && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                onClick={handleExpandSidebar}
                className="absolute top-3 right-3 z-30 h-8 w-8 shadow-md border border-border/80 bg-card/90 backdrop-blur-sm hover:bg-accent text-foreground transition-transform hover:scale-105"
                aria-label="Buka Sidebar Kanan (Features & Layers)"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Buka Features & Layers</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Main Right Sidebar Container */}
      <div
        style={{
          width: isCollapsed ? 0 : `${sidebarWidth}px`,
          minWidth: isCollapsed ? 0 : '160px',
        }}
        className={`
          flex-shrink-0 border-l border-border bg-card/95 backdrop-blur-md
          flex flex-col h-full relative overflow-hidden select-none
          ${isResizing ? 'transition-none' : 'transition-[width] duration-300 ease-in-out'}
          ${isCollapsed ? 'border-none' : ''}
        `}
      >
        {/* Left Edge Resizable Handle */}
        {!isCollapsed && (
          <div
            onMouseDown={startResizing}
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize right sidebar width"
            className={`
              absolute top-0 left-0 w-2 h-full z-50 cursor-col-resize
              hover:bg-primary/40 active:bg-primary/60 transition-colors
              flex items-center justify-center group select-none
              ${isResizing ? 'bg-primary/50' : 'bg-transparent'}
            `}
          >
            <div
              className={`
                w-0.5 h-8 rounded-full bg-muted-foreground/30
                group-hover:bg-primary group-hover:h-12 transition-all duration-200
                ${isResizing ? 'bg-primary h-12' : ''}
              `}
            />
          </div>
        )}

        <div className="flex-1 flex flex-col p-3 min-h-0 overflow-hidden">
          <TooltipProvider>
            {/* Header Toolbar */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/60">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold tracking-tight text-foreground">
                  Manager Spasial
                </span>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setIsCollapsed(true);
                      setSidebarWidth(0);
                    }}
                    aria-label="Lipat Sidebar Kanan"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Lipat Sidebar Kanan</p>
                </TooltipContent>
              </Tooltip>
            </div>

            <Tabs defaultValue="features" className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <TabsList className="w-full grid grid-cols-2 flex-shrink-0">
                <TabsTrigger value="features" className="text-xs">
                  Features ({features.length})
                </TabsTrigger>
                <TabsTrigger value="layers" className="text-xs">
                  Layers
                </TabsTrigger>
              </TabsList>

              {/* Features Tab */}
              <TabsContent value="features" className="flex-1 mt-2 overflow-y-auto min-h-0">
                <div className="space-y-2">
                  <FileDropZone
                    onFileLoad={async (content, filename) => {
                      const lower = filename.toLowerCase();
                      const isTopo = lower.endsWith('.topojson');
                      const isKml = lower.endsWith('.kml');
                      const canTryWorker =
                        !isKml && !isTopo && shouldParseGeoJsonInWorker(content.length);

                      onHeavyParseChange?.(true);
                      await new Promise<void>((r) => requestAnimationFrame(() => r()));

                      try {
                        let geojsonStr = content;
                        if (isKml) {
                          const kmlFeatures = kmlFormat.readFeatures(content, {
                            featureProjection: 'EPSG:3857',
                          });
                          const gjFormat = new GeoJSON({
                            featureProjection: 'EPSG:3857',
                            dataProjection: 'EPSG:4326',
                          });
                          geojsonStr = gjFormat.writeFeatures(kmlFeatures as Feature<Geometry>[]);
                        } else if (isTopo) {
                          const topology = JSON.parse(content);
                          const fc = GisService.fromTopoJSON(topology);
                          geojsonStr = JSON.stringify(fc, null, 2);
                        } else if (canTryWorker) {
                          const parsed = await parseGeoJsonStringInWorker(content);
                          geojsonStr = JSON.stringify(parsed, null, 2);
                        } else {
                          try {
                            const parsed = JSON.parse(content);
                            geojsonStr = JSON.stringify(parsed, null, 2);
                          } catch {
                            geojsonStr = content;
                          }
                        }
                        onGeojsonChange(geojsonStr);
                        setTimeout(() => {
                          window.dispatchEvent(new CustomEvent('map:fitbounds'));
                        }, 60);
                        toast({ title: `Imported ${filename}` });
                      } catch {
                        toast({
                          title: 'Import failed',
                          description: 'Could not parse the file.',
                          variant: 'destructive',
                        });
                      } finally {
                        onHeavyParseChange?.(false);
                      }
                    }}
                  />

                  {features.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground italic text-xs">
                      Belum ada fitur digambar atau diimpor.
                    </div>
                  ) : (
                    features.map((feature, idx) => {
                      const geom = feature.getGeometry();
                      const geomType = geom?.getType();
                      let stat = '';
                      if (geom && (geomType === 'Polygon' || geomType === 'MultiPolygon')) {
                        const area = getArea(geom);
                        stat =
                          area > 1e6 ? `${(area / 1e6).toFixed(2)} km²` : `${area.toFixed(0)} m²`;
                      } else if (
                        geom &&
                        (geomType === 'LineString' || geomType === 'MultiLineString')
                      ) {
                        const len = getLength(geom);
                        stat =
                          len > 1000 ? `${(len / 1000).toFixed(2)} km` : `${len.toFixed(0)} m`;
                      }

                      return (
                        <div
                          key={feature.getId() || idx}
                          className="p-2.5 mb-1.5 rounded-[var(--radius)] border border-border/60 bg-card hover:bg-accent/40 transition-all duration-150 cursor-pointer"
                          onClick={() => onFeatureSelect(feature)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5 overflow-hidden">
                              <div
                                className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                                  geomType?.includes('Polygon')
                                    ? 'bg-accent'
                                    : geomType?.includes('Line')
                                      ? 'bg-blue-500'
                                      : 'bg-emerald-500'
                                }`}
                              />
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs font-medium truncate w-28">
                                  {String(feature.getId() || `Feature ${idx}`)}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] text-muted-foreground uppercase">
                                    {geomType}
                                  </span>
                                  {stat && (
                                    <span className="text-[10px] text-accent font-medium">
                                      · {stat}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-0.5">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onZoomToFeature(feature.getId()!);
                                    }}
                                  >
                                    <Crosshair className="h-3.5 w-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Zoom to</p>
                                </TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setFeatureToDelete(feature.getId() ?? null);
                                    }}
                                    aria-label={`Hapus fitur ${String(feature.getId() || '')}`}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Hapus Fitur</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </TabsContent>

              {/* Layers Tab */}
              <TabsContent value="layers" className="flex-1 mt-2 overflow-y-auto min-h-0">
                <div className="space-y-5 pt-2 px-1">
                  {/* Vector Layer Controls */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-accent" />
                        <span className="text-xs font-semibold text-foreground">Vector Data</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onVectorVisibleChange(!vectorVisible)}
                        aria-label="Toggle Vector Visibility"
                      >
                        {vectorVisible ? (
                          <Eye className="h-3.5 w-3.5 text-primary" />
                        ) : (
                          <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </Button>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                        <span>Opacity</span>
                        <span>{Math.round(vectorOpacity * 100)}%</span>
                      </div>
                      <Slider
                        value={[vectorOpacity * 100]}
                        max={100}
                        step={1}
                        onValueChange={(vals) => onVectorOpacityChange(vals[0] / 100)}
                        className="py-1.5"
                      />
                    </div>
                  </div>

                  {/* Basemap Controls */}
                  <div className="pt-4 border-t border-border/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapIcon className="h-4 w-4 text-primary" />
                        <span className="text-xs font-semibold text-foreground">Current Basemap</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                        <span>Opacity</span>
                        <span>{Math.round(basemapOpacity * 100)}%</span>
                      </div>
                      <Slider
                        value={[basemapOpacity * 100]}
                        max={100}
                        step={1}
                        onValueChange={(vals) => onBasemapOpacityChange(vals[0] / 100)}
                        className="py-1.5"
                      />
                    </div>
                  </div>

                  {/* Graticule Grid Controls */}
                  {onToggleGraticule && (
                    <div className="pt-4 border-t border-border/40 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Grid className="h-4 w-4 text-primary" />
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-foreground">
                              Coordinate Grid (Graticule)
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              Garis lintang & bujur pada kanvas
                            </span>
                          </div>
                        </div>
                        <Switch
                          checked={showGraticule}
                          onCheckedChange={() => onToggleGraticule()}
                          aria-label="Toggle Coordinate Grid (Graticule)"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </TooltipProvider>
        </div>
      </div>

      {/* Delete Single Feature Confirmation Dialog */}
      <AlertDialog
        open={featureToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setFeatureToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Fitur?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan menghapus fitur <code>{String(featureToDelete ?? '')}</code> dari peta
              dan editor secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => handleConfirmDeleteFeature(featureToDelete)}
            >
              Hapus Fitur
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
