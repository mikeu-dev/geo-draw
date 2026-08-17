'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useToast } from '@/hooks/use-toast';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from '@/components/ui/menubar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Copy,
  Trash2,
  CheckCircle,
  AlertTriangle,
  FileDown,
  Check,
  Map as MapIcon,
  Crosshair,
  Share2,
  Undo2,
  Redo2,
  Layers,
  Eye,
  EyeOff,
  ChevronRight,
  Grid,
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import {
  validateGeoJSONDeterministic,
  ValidationResult,
} from '@/lib/geojson-validator';
import { GisService } from '@/lib/spatial';
import { FeatureCollection } from 'geojson';
import { Skeleton } from './ui/skeleton';
import GeoJSON from 'ol/format/GeoJSON';
import KML from 'ol/format/KML';
import JSZip from 'jszip';
import { Feature } from 'ol';
import { Geometry } from 'ol/geom';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import HelpContent from './HelpContent';
import FileDropZone from './FileDropZone';
import AttributeTable from './AttributeTable';
import { getArea, getLength } from 'ol/sphere';
import { parseGeoJsonStringInWorker, shouldParseGeoJsonInWorker } from '@/lib/geojson-worker-parse';
import { geoJsonToCsv } from '@/lib/csv-geojson';
import { geoJsonToWkt } from '@/lib/wkt-geojson';
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

const Editor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-full" />,
});

interface SidebarProps {
  geojsonString: string;
  onGeojsonChange: (value: string | undefined) => void;
  featuresCount: number;
  onClear: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  features: Feature<Geometry>[];
  onDeleteFeature: (id: string | number | undefined) => void;
  onZoomToFeature: (id: string | number) => void;
  onFeatureSelect: (feature: Feature<Geometry> | null) => void;
  onFeaturePropertyChange?: (featureId: string | number, key: string, value: unknown) => void;
  onHeavyParseChange?: (busy: boolean) => void;
  vectorOpacity: number;
  onVectorOpacityChange: (value: number) => void;
  vectorVisible: boolean;
  onVectorVisibleChange: (value: boolean) => void;
  basemapOpacity: number;
  onBasemapOpacityChange: (value: number) => void;
  showGraticule?: boolean;
  onToggleGraticule?: () => void;
  theme?: 'light' | 'dark';
}

const geojsonFormat = new GeoJSON({
  featureProjection: 'EPSG:3857',
  dataProjection: 'EPSG:4326',
});

const kmlFormat = new KML({
  extractStyles: true,
  showPointNames: true,
});

interface MonacoCodeEditor {
  revealLineInCenter: (lineNumber: number) => void;
  setPosition: (position: { lineNumber: number; column: number }) => void;
  focus: () => void;
}

export default function Sidebar({
  geojsonString,
  onGeojsonChange,
  featuresCount,
  onClear,
  undo,
  redo,
  canUndo,
  canRedo,
  features,
  onDeleteFeature,
  onZoomToFeature,
  onFeatureSelect,
  onFeaturePropertyChange,
  onHeavyParseChange,
  vectorOpacity,
  onVectorOpacityChange,
  vectorVisible,
  onVectorVisibleChange,
  basemapOpacity,
  onBasemapOpacityChange,
  showGraticule = false,
  onToggleGraticule,
  theme = 'light',
}: SidebarProps) {
  const { toast } = useToast();
  const editorRef = useRef<MonacoCodeEditor | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState<number>(380);
  const [lastWidth, setLastWidth] = useState<number>(380);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [featureToDelete, setFeatureToDelete] = useState<string | number | null>(null);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const handleExpandSidebar = useCallback(() => {
    setIsCollapsed(false);
    const targetWidth = lastWidth >= 160 ? lastWidth : 380;
    const maxWidth = Math.floor(window.innerWidth * 0.5);
    const clamped = Math.min(targetWidth, maxWidth);
    setSidebarWidth(clamped);
    setLastWidth(clamped);
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
  }, [lastWidth]);

  // Handle live horizontal drag resize
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const maxWidth = Math.floor(window.innerWidth * 0.5);
      const newWidth = e.clientX;

      if (newWidth < 140) {
        // Dragged past left threshold -> collapse completely
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

  // Adjust max width when browser window resizes
  useEffect(() => {
    const handleWindowResize = () => {
      const maxWidth = Math.floor(window.innerWidth * 0.5);
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

  // Automatic real-time GeoJSON validation (0ms, offline RFC 7946)
  useEffect(() => {
    if (!geojsonString || !geojsonString.trim()) {
      setValidationResult(null);
      return;
    }
    const timer = setTimeout(() => {
      const res = validateGeoJSONDeterministic(geojsonString);
      setValidationResult(res);
    }, 150);
    return () => clearTimeout(timer);
  }, [geojsonString]);

  const handleJumpToError = (line?: number, column?: number) => {
    if (!editorRef.current || !line) return;
    editorRef.current.revealLineInCenter(line);
    editorRef.current.setPosition({ lineNumber: line, column: column || 1 });
    editorRef.current.focus();
  };

  const handleClear = () => {
    onClear();
    setValidationResult(null);
    setIsClearConfirmOpen(false);
  };

  const handleConfirmDeleteFeature = (id: string | number | null) => {
    if (id !== null && id !== undefined) {
      onDeleteFeature(id);
      setFeatureToDelete(null);
    }
  };

  const handleCopy = () => {
    if (!geojsonString) {
      toast({
        variant: 'destructive',
        title: 'Nothing to copy',
        description: 'The editor is empty.',
      });
      return;
    }
    navigator.clipboard.writeText(geojsonString).then(
      () => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
        toast({
          title: 'Copied to clipboard!',
        });
      },
      (err) => {
        console.error('Could not copy text: ', err);
        toast({
          variant: 'destructive',
          title: 'Failed to copy',
          description: 'Could not copy GeoJSON to clipboard.',
        });
      }
    );
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(
      () => {
        setIsLinkCopied(true);
        setTimeout(() => setIsLinkCopied(false), 2000);
        toast({
          title: 'Shareable link copied!',
          description: 'Anyone with this link can view your map.',
        });
      },
      (err) => {
        console.error('Could not copy link: ', err);
        toast({
          variant: 'destructive',
          title: 'Failed to copy link',
        });
      }
    );
  };

  const handleDownload = async (
    format: 'geojson' | 'kml' | 'kmz' | 'topojson' | 'csv' | 'wkt'
  ) => {
    if (format === 'topojson') {
      if (!geojsonString) return;
      try {
        const geojson = JSON.parse(geojsonString) as FeatureCollection;
        const topo = GisService.toTopoJSON(geojson);
        const blob = new Blob([JSON.stringify(topo)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'map.topojson';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast({ title: 'Successfully downloaded TopoJSON' });
      } catch {
        toast({ title: 'Failed to generate TopoJSON', variant: 'destructive' });
      }
      return;
    }

    if (format === 'csv') {
      if (!geojsonString) return;
      try {
        const csv = geoJsonToCsv(geojsonString);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'map.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast({ title: 'Successfully downloaded CSV' });
      } catch {
        toast({ title: 'Failed to generate CSV', variant: 'destructive' });
      }
      return;
    }

    if (format === 'wkt') {
      if (!geojsonString) return;
      try {
        const wkt = geoJsonToWkt(geojsonString);
        const blob = new Blob([wkt], { type: 'text/plain;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'map.wkt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast({ title: 'Successfully downloaded WKT' });
      } catch {
        toast({ title: 'Failed to generate WKT', variant: 'destructive' });
      }
      return;
    }

    if (!geojsonString) {
      toast({ title: 'No data to save', variant: 'destructive' });
      return;
    }

    try {
      const olFeatures = geojsonFormat.readFeatures(geojsonString) as Feature<Geometry>[];
      let data: string | Blob = '';
      let filename = '';
      let mimeType = '';

      switch (format) {
        case 'geojson':
          data = geojsonString;
          filename = 'map.geojson';
          mimeType = 'application/vnd.geo+json';
          break;
        case 'kml':
          data = kmlFormat.writeFeatures(olFeatures);
          filename = 'map.kml';
          mimeType = 'application/vnd.google-earth.kml+xml';
          break;
        case 'kmz':
          const kmlData = kmlFormat.writeFeatures(olFeatures, {
            featureProjection: 'EPSG:4326',
            dataProjection: 'EPSG:4326',
          });
          const zip = new JSZip();
          zip.file('doc.kml', kmlData);
          data = await zip.generateAsync({ type: 'blob' });
          filename = 'map.kmz';
          mimeType = 'application/vnd.google-earth.kmz';
          break;
      }

      const blob = new Blob([data], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: `Successfully downloaded ${filename}` });
    } catch (error) {
      console.error('Error during download:', error);
      toast({
        title: 'Download failed',
        description: 'Could not generate file.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="relative flex-shrink-0 h-full z-40">
      <aside
        style={{
          width: isCollapsed ? 0 : `${sidebarWidth}px`,
          maxWidth: '50vw',
        }}
        className={`
          relative flex flex-col border-r border-border h-full bg-background
          ${isResizing ? '' : 'transition-[width,opacity] duration-300 ease-in-out'}
          overflow-hidden
          ${
            isCollapsed
              ? 'w-0 opacity-0 border-r-0 pointer-events-none'
              : 'opacity-100'
          }
        `}
      >
        <div
          style={{ width: `${sidebarWidth}px`, maxWidth: '50vw' }}
          className="h-full flex flex-col min-h-0 overflow-hidden sidebar-panel"
        >
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col p-3 min-h-0 overflow-hidden">
            <TooltipProvider>
              <Menubar className="mb-2 h-auto p-1 justify-between flex-shrink-0">
                <div className="flex items-center">
                  <MenubarMenu>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <MenubarTrigger className="w-9 h-9" disabled={!canUndo} onClick={undo}>
                          <Undo2 className="h-4 w-4" />
                        </MenubarTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Undo</p>
                      </TooltipContent>
                    </Tooltip>
                  </MenubarMenu>

                  <MenubarMenu>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <MenubarTrigger className="w-9 h-9" disabled={!canRedo} onClick={redo}>
                          <Redo2 className="h-4 w-4" />
                        </MenubarTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Redo</p>
                      </TooltipContent>
                    </Tooltip>
                  </MenubarMenu>

                  <MenubarSeparator className="h-6 mx-1" />

                  <MenubarMenu>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <MenubarTrigger
                          className={`w-9 h-9 ${showGraticule ? 'bg-accent text-accent-foreground' : ''}`}
                          onClick={onToggleGraticule}
                        >
                          <Grid className="h-4 w-4" />
                        </MenubarTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{showGraticule ? 'Sembunyikan Graticule (Lat/Lon Grid)' : 'Tampilkan Graticule (Lat/Lon Grid)'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </MenubarMenu>

                  <MenubarMenu>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <MenubarTrigger className="w-9 h-9" onClick={handleCopyLink}>
                          {isLinkCopied ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Share2 className="h-4 w-4" />
                          )}
                        </MenubarTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{isLinkCopied ? 'Link Copied!' : 'Share Map Link'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </MenubarMenu>
                  <MenubarMenu>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <MenubarTrigger className="w-9 h-9" disabled={!geojsonString}>
                          <FileDown className="h-4 w-4" />
                        </MenubarTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Save File</p>
                      </TooltipContent>
                    </Tooltip>
                    <MenubarContent>
                      <MenubarItem onClick={() => handleDownload('geojson')}>
                        Save as GeoJSON
                      </MenubarItem>
                      <MenubarItem onClick={() => handleDownload('topojson')}>
                        Save as TopoJSON
                      </MenubarItem>
                      <MenubarItem onClick={() => handleDownload('csv')}>Save as CSV</MenubarItem>
                      <MenubarItem onClick={() => handleDownload('wkt')}>Save as WKT</MenubarItem>
                      <MenubarItem onClick={() => handleDownload('kml')}>Save as KML</MenubarItem>
                      <MenubarItem onClick={() => handleDownload('kmz')}>Save as KMZ</MenubarItem>
                    </MenubarContent>
                  </MenubarMenu>
                </div>
              </Menubar>

              <Tabs defaultValue="json" className="flex-1 flex flex-col min-h-0 overflow-hidden">
                <TabsList className="w-full grid grid-cols-5 flex-shrink-0">
                  <TabsTrigger value="json" className="text-xs">
                    JSON
                  </TabsTrigger>
                  <TabsTrigger value="table" className="text-xs">
                    Table
                  </TabsTrigger>
                  <TabsTrigger value="features" className="text-xs">
                    Features ({features.length})
                  </TabsTrigger>
                  <TabsTrigger value="layers" className="text-xs">
                    Layers
                  </TabsTrigger>
                  <TabsTrigger value="help" className="text-xs">
                    Help
                  </TabsTrigger>
                </TabsList>
                <TabsContent
                  value="json"
                  className="flex-1 relative mt-2 rounded-md border border-input overflow-hidden min-h-0"
                >
                {geojsonString && (
                  <TooltipProvider>
                    <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive transition-colors"
                            onClick={() => setIsClearConfirmOpen(true)}
                            disabled={featuresCount === 0 && (!geojsonString || !geojsonString.trim())}
                            aria-label="Hapus semua fitur"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Hapus Semua Fitur</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={handleCopy}
                          >
                            {isCopied ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{isCopied ? 'Copied!' : 'Copy to clipboard'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TooltipProvider>
                )}
                <Editor
                  height="100%"
                  language="json"
                  value={geojsonString}
                  onChange={onGeojsonChange}
                  onMount={(editor) => {
                    editorRef.current = editor;
                  }}
                  beforeMount={(monaco) => {
                    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
                      validate: true,
                      allowComments: false,
                      schemas: [
                        {
                          uri: 'http://json.schemastore.org/geojson.json',
                          fileMatch: ['*'],
                        },
                      ],
                    });
                  }}
                  theme={theme === 'dark' ? 'vs-dark' : 'light'}
                  options={{
                    readOnly: false,
                    minimap: { enabled: false },
                    fontSize: 12,
                    lineNumbers: 'on',
                    wordWrap: 'on',
                    tabSize: 2,
                    insertSpaces: true,
                    formatOnPaste: true,
                    formatOnType: true,
                    autoClosingBrackets: 'always',
                    autoClosingQuotes: 'always',
                    autoSurround: 'languageDefined',
                    suggestOnTriggerCharacters: true,
                    acceptSuggestionOnEnter: 'on',
                    tabCompletion: 'on',
                    quickSuggestions: { other: true, comments: false, strings: true },
                    bracketPairColorization: { enabled: true },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    renderLineHighlight: 'all',
                    cursorBlinking: 'smooth',
                  }}
                />
                {validationResult && !validationResult.isValid && (
                  <button
                    type="button"
                    onClick={() =>
                      handleJumpToError(validationResult.line, validationResult.column)
                    }
                    className="absolute bottom-0 left-0 right-0 p-2 bg-destructive/90 hover:bg-destructive text-destructive-foreground backdrop-blur-md text-xs flex items-center justify-between gap-2 border-t border-destructive transition-colors text-left group shadow-lg z-10"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <AlertTriangle className="h-4 w-4 flex-shrink-0 text-white animate-pulse" />
                      <span className="font-medium truncate">
                        {validationResult.line
                          ? `Baris ${validationResult.line}${validationResult.column ? `:${validationResult.column}` : ''} — `
                          : ''}
                        {validationResult.feedback}
                      </span>
                    </div>
                    {validationResult.line && (
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-black/20 group-hover:bg-black/30 rounded border border-white/20 flex-shrink-0">
                        Lompat ke Line {validationResult.line} →
                      </span>
                    )}
                  </button>
                )}
                {validationResult && validationResult.isValid && (
                  <div className="absolute bottom-0 left-0 right-0 py-1 px-2.5 bg-background/80 backdrop-blur-sm text-muted-foreground text-[11px] flex items-center justify-between border-t z-10">
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>GeoJSON Valid (RFC 7946)</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {validationResult.stats?.featureCount ?? features.length} Fitur
                    </span>
                  </div>
                )}
              </TabsContent>
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
                        }
                        onGeojsonChange(geojsonStr);
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
                    <div className="text-center py-6 text-muted-foreground italic text-sm">
                      No features drawn yet.
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
                        stat = len > 1000 ? `${(len / 1000).toFixed(2)} km` : `${len.toFixed(0)} m`;
                      }
                      return (
                        <div
                          key={feature.getId() || idx}
                          className="p-2.5 mb-1.5 rounded-[var(--radius)] border border-border/60 bg-card hover:bg-accent/50 transition-all duration-150 cursor-pointer"
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
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7"
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
                              </TooltipProvider>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </TabsContent>
              <TabsContent value="layers" className="flex-1 mt-2 overflow-y-auto min-h-0">
                <div className="space-y-6 pt-2 px-1">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-accent" />
                        <span className="text-sm font-semibold">Vector Data</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onVectorVisibleChange(!vectorVisible)}
                        >
                          {vectorVisible ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                        <span>Opacity</span>
                        <span>{Math.round(vectorOpacity * 100)}%</span>
                      </div>
                      <Slider
                        value={[vectorOpacity * 100]}
                        max={100}
                        step={1}
                        onValueChange={(vals) => onVectorOpacityChange(vals[0] / 100)}
                        className="py-2"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border/40 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapIcon className="h-4 w-4 text-primary" />
                        <span className="text-sm font-semibold">Current Basemap</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                        <span>Opacity</span>
                        <span>{Math.round(basemapOpacity * 100)}%</span>
                      </div>
                      <Slider
                        value={[basemapOpacity * 100]}
                        max={100}
                        step={1}
                        onValueChange={(vals) => onBasemapOpacityChange(vals[0] / 100)}
                        className="py-2"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent
                value="table"
                className="flex-1 mt-2 rounded-md border border-input overflow-hidden min-h-0 data-[state=active]:flex data-[state=active]:flex-col"
              >
                <AttributeTable
                  features={features}
                  onPropertyChange={onFeaturePropertyChange || (() => {})}
                  onZoomToFeature={onZoomToFeature}
                  onFeatureSelect={onFeatureSelect}
                  onDeleteFeature={onDeleteFeature}
                />
              </TabsContent>
              <TabsContent value="help" className="flex-1 mt-2 overflow-y-auto min-h-0">
                <HelpContent />
              </TabsContent>
            </Tabs>
          </TooltipProvider>
        </div>
      </div>

        {/* Right Edge Resizable Handle (Trigger klik dan tahan pada tepi sidebar kanan) */}
        {!isCollapsed && (
          <div
            onMouseDown={startResizing}
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize sidebar width"
            className={`
              absolute top-0 right-0 w-2 h-full z-50 cursor-col-resize
              hover:bg-primary/40 active:bg-primary/60 transition-colors
              flex items-center justify-center group select-none
              ${isResizing ? 'bg-primary/50' : 'bg-transparent'}
            `}
            title="Klik dan tahan untuk mengubah lebar sidebar (geser ke kiri untuk menutup)"
          >
            <div className="w-[2px] h-10 bg-border/80 group-hover:bg-primary group-active:bg-primary rounded-full transition-colors" />
          </div>
        )}
      </aside>

      {/* Protruding Sidebar Toggle Button - HANYA MUNCUL KETIKA SIDEBAR BENAR-BENAR MENGHILANG */}
      {isCollapsed && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={handleExpandSidebar}
                className="
                  absolute top-1/2 -translate-y-1/2 left-0 z-50
                  flex items-center justify-center
                  w-5 h-12 rounded-r-[calc(var(--radius)+2px)] border border-l-0 border-[hsl(var(--glass-border))]
                  bg-[hsl(var(--glass-bg))] hover:bg-secondary text-muted-foreground hover:text-foreground
                  backdrop-blur-md shadow-md
                  transition-all duration-300 ease-in-out group cursor-pointer
                "
                aria-label="Buka sidebar"
              >
                <ChevronRight className="h-3.5 w-3.5 group-hover:scale-125 transition-transform" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p className="text-xs">Buka Sidebar</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Modal Konfirmasi Hapus Semua Data Spasial */}
      <AlertDialog open={isClearConfirmOpen} onOpenChange={setIsClearConfirmOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-foreground">
              Hapus Semua Data Spasial?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              Tindakan ini akan mengosongkan seluruh fitur dari peta serta menghapus konten dari editor GeoJSON. Anda dapat membatalkan tindakan ini sewaktu-waktu menggunakan tombol <strong>Undo</strong> (Ctrl+Z).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel onClick={() => setIsClearConfirmOpen(false)}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleClear}
            >
              Hapus Semua
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal Konfirmasi Hapus Fitur Tunggal */}
      <AlertDialog
        open={featureToDelete !== null}
        onOpenChange={(open) => !open && setFeatureToDelete(null)}
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-foreground">
              Hapus Fitur Ini?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              Apakah Anda yakin ingin menghapus fitur <strong className="font-mono text-foreground">{String(featureToDelete || '')}</strong> dari peta dan editor data?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel onClick={() => setFeatureToDelete(null)}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => handleConfirmDeleteFeature(featureToDelete)}
            >
              Hapus Fitur
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
