'use client';

import { useState, useCallback, DragEvent } from 'react';
import { FileUp } from 'lucide-react';
import { csvToGeoJson } from '@/lib/csv-geojson';
import { wktToGeoJson } from '@/lib/wkt-geojson';

interface FileDropZoneProps {
  onFileLoad: (content: string, filename: string) => void | Promise<void>;
}

export default function FileDropZone({ onFileLoad }: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const processFileContent = useCallback(
    (content: string, filename: string) => {
      const ext = '.' + filename.split('.').pop()?.toLowerCase();

      try {
        if (ext === '.csv') {
          const geojson = csvToGeoJson(content);
          void Promise.resolve(onFileLoad(JSON.stringify(geojson, null, 2), filename));
          return;
        }

        if (ext === '.wkt') {
          const geojson = wktToGeoJson(content);
          void Promise.resolve(onFileLoad(JSON.stringify(geojson, null, 2), filename));
          return;
        }

        // Standard GeoJSON, KML, TopoJSON
        void Promise.resolve(onFileLoad(content, filename));
      } catch (err) {
        console.error('File parsing error in FileDropZone:', err);
        // Fallback to raw content if custom conversion fails
        void Promise.resolve(onFileLoad(content, filename));
      }
    },
    [onFileLoad]
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer?.files;
      if (!files || files.length === 0) return;

      const file = files[0];
      const validExtensions = ['.geojson', '.json', '.kml', '.topojson', '.csv', '.wkt'];
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();

      if (!validExtensions.includes(ext)) {
        return; // silently ignore invalid files
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          processFileContent(content, file.name);
        }
      };
      reader.readAsText(file);
    },
    [processFileContent]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          processFileContent(content, file.name);
        }
      };
      reader.readAsText(file);
      e.target.value = ''; // reset so same file can be re-imported
    },
    [processFileContent]
  );

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer
        transition-all duration-200 ease-out
        ${
          isDragging
            ? 'border-accent bg-accent/10 scale-[1.02]'
            : 'border-border hover:border-muted-foreground/40 hover:bg-muted/50'
        }
      `}
    >
      <input
        type="file"
        accept=".geojson,.json,.kml,.topojson,.csv,.wkt"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        aria-label="Import file"
      />
      <div className="flex flex-col items-center gap-1.5 pointer-events-none">
        <FileUp
          className={`h-5 w-5 transition-colors ${isDragging ? 'text-accent' : 'text-muted-foreground'}`}
        />
        <p className="text-xs text-muted-foreground">
          {isDragging ? 'Drop file here' : 'Drop or click to import'}
        </p>
        <p className="text-[10px] text-muted-foreground/60">GeoJSON, KML, TopoJSON, CSV, WKT</p>
      </div>
    </div>
  );
}
