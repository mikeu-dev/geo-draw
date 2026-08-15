'use client';

import { useState, useMemo } from 'react';
import type { Feature } from 'ol';
import type { Geometry } from 'ol/geom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Trash2, Crosshair, Search, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AttributeTableProps {
  features: Feature<Geometry>[];
  onPropertyChange: (featureId: string | number, key: string, value: unknown) => void;
  onZoomToFeature: (id: string | number) => void;
  onFeatureSelect: (feature: Feature<Geometry> | null) => void;
  onDeleteFeature: (id: string | number | undefined) => void;
}

export default function AttributeTable({
  features,
  onPropertyChange,
  onZoomToFeature,
  onFeatureSelect,
  onDeleteFeature,
}: AttributeTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [newColumnName, setNewColumnName] = useState('');
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [editingCell, setEditingCell] = useState<{ id: string | number; key: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const { toast } = useToast();

  // Extract all unique property keys across all features
  const propertyKeys = useMemo(() => {
    const keysSet = new Set<string>();
    features.forEach((feature) => {
      const props = feature.getProperties();
      Object.keys(props).forEach((key) => {
        if (key !== 'geometry') {
          keysSet.add(key);
        }
      });
    });
    return Array.from(keysSet);
  }, [features]);

  // Filter features based on search query
  const filteredFeatures = useMemo(() => {
    if (!searchTerm.trim()) return features;
    const term = searchTerm.toLowerCase();
    return features.filter((feature) => {
      const id = String(feature.getId() || '').toLowerCase();
      const geomType = feature.getGeometry()?.getType().toLowerCase() || '';
      if (id.includes(term) || geomType.includes(term)) return true;

      const props = feature.getProperties();
      return Object.entries(props).some(
        ([key, val]) =>
          key !== 'geometry' &&
          (key.toLowerCase().includes(term) || String(val).toLowerCase().includes(term))
      );
    });
  }, [features, searchTerm]);

  const handleAddColumn = (e: React.FormEvent) => {
    e.preventDefault();
    const col = newColumnName.trim();
    if (!col) return;

    if (propertyKeys.includes(col) || col === 'geometry' || col === 'id') {
      toast({
        title: 'Nama kolom sudah ada',
        description: `Kolom '${col}' sudah digunakan.`,
        variant: 'destructive',
      });
      return;
    }

    // Initialize property on first feature or all features
    if (features.length > 0) {
      features.forEach((f) => {
        const id = f.getId();
        if (id) {
          onPropertyChange(id, col, '');
        }
      });
      toast({
        title: 'Kolom berhasil ditambahkan',
        description: `Kolom '${col}' telah ditambahkan ke semua fitur.`,
      });
    }

    setNewColumnName('');
    setIsAddingColumn(false);
  };

  const handleStartEdit = (id: string | number, key: string, initialValue: unknown) => {
    setEditingCell({ id, key });
    setEditValue(initialValue !== undefined && initialValue !== null ? String(initialValue) : '');
  };

  const handleSaveEdit = () => {
    if (!editingCell) return;
    const { id, key } = editingCell;
    onPropertyChange(id, key, editValue);
    setEditingCell(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  if (features.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center text-muted-foreground">
        <Database className="h-10 w-10 mb-3 opacity-40 text-accent animate-pulse" />
        <p className="text-sm font-semibold">Tabel Atribut Kosong</p>
        <p className="text-xs mt-1 text-muted-foreground/70">
          Gambar fitur di peta atau import GeoJSON untuk melihat tabel data atribut.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Top Toolbar */}
      <div className="p-2 border-b border-border bg-card/50 flex items-center justify-between gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Cari atribut atau ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 pl-8 text-xs bg-background/80"
          />
        </div>

        {isAddingColumn ? (
          <form onSubmit={handleAddColumn} className="flex items-center gap-1">
            <Input
              type="text"
              placeholder="Nama kolom..."
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              className="h-8 w-28 text-xs"
              autoFocus
            />
            <Button type="submit" size="sm" className="h-8 text-xs px-2">
              Simpan
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-xs px-2"
              onClick={() => setIsAddingColumn(false)}
            >
              Batal
            </Button>
          </form>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddingColumn(true)}
            className="h-8 text-xs flex items-center gap-1.5 flex-shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Tambah Field</span>
          </Button>
        )}
      </div>

      {/* Table Container */}
      <ScrollArea className="flex-1 w-full h-full">
        <div className="min-w-full">
          <Table>
            <TableHeader className="sticky top-0 bg-muted/90 backdrop-blur z-10">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12 text-center text-[11px] font-bold">Aksi</TableHead>
                <TableHead className="w-24 text-[11px] font-bold">Feature ID</TableHead>
                <TableHead className="w-20 text-[11px] font-bold">Geometri</TableHead>
                {propertyKeys.map((key) => (
                  <TableHead key={key} className="text-[11px] font-bold min-w-[100px]">
                    <div className="flex items-center justify-between gap-1">
                      <span>{key}</span>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFeatures.map((feature) => {
                const id = feature.getId() || 'unknown';
                const geomType = feature.getGeometry()?.getType() || 'None';
                const props = feature.getProperties();

                return (
                  <TableRow
                    key={String(id)}
                    className="hover:bg-accent/5 transition-colors cursor-pointer group"
                    onClick={() => onFeatureSelect(feature)}
                  >
                    <TableCell className="p-1 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onZoomToFeature(id)}
                          className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-accent transition-colors"
                          title="Zoom to feature"
                        >
                          <Crosshair className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteFeature(id)}
                          className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                          title="Delete feature"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </TableCell>

                    <TableCell className="font-mono text-[10px] text-muted-foreground py-2 max-w-[120px] truncate">
                      {String(id)}
                    </TableCell>

                    <TableCell className="text-[11px] font-medium py-2">
                      <span className="px-1.5 py-0.5 rounded bg-muted text-[9px] font-mono">
                        {geomType}
                      </span>
                    </TableCell>

                    {propertyKeys.map((key) => {
                      const isEditing = editingCell?.id === id && editingCell?.key === key;
                      const val = props[key];
                      const displayVal = val !== undefined && val !== null ? String(val) : '-';

                      return (
                        <TableCell
                          key={key}
                          className="text-xs py-1.5 min-w-[100px]"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEdit(id, key, val);
                          }}
                        >
                          {isEditing ? (
                            <Input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={handleSaveEdit}
                              onKeyDown={handleKeyDown}
                              className="h-7 text-xs px-1.5 py-0.5"
                              autoFocus
                            />
                          ) : (
                            <div className="min-h-[1.5rem] flex items-center px-1 rounded hover:bg-white/10 text-foreground/90 truncate">
                              {displayVal}
                            </div>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Footer Info */}
      <div className="px-3 py-1.5 border-t border-border bg-card/40 text-[10px] text-muted-foreground flex justify-between items-center">
        <span>Menampilkan {filteredFeatures.length} dari {features.length} fitur</span>
        <span className="italic">Klik sel untuk mengedit nilai</span>
      </div>
    </div>
  );
}
