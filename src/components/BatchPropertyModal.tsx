'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { calculateGeometryMetrics } from '@/lib/spatial-operations';
import type { FeatureCollection, Feature, Geometry } from 'geojson';
import { useToast } from '@/hooks/use-toast';
import { Calculator, Edit3, Trash2, Tag, Layers } from 'lucide-react';

interface BatchPropertyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  geojson: FeatureCollection;
  onUpdateGeoJSON: (newGeoJSON: FeatureCollection) => void;
  selectedIds: (string | number)[];
}

export default function BatchPropertyModal({
  open,
  onOpenChange,
  geojson,
  onUpdateGeoJSON,
  selectedIds,
}: BatchPropertyModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'assign' | 'calculate' | 'rename' | 'delete'>('assign');

  // Assign state
  const [assignFieldName, setAssignFieldName] = useState('');
  const [assignValue, setAssignValue] = useState('');

  // Calculate state
  const [calcFormula, setCalcFormula] = useState<string>('area_ha');
  const [calcTargetField, setCalcTargetField] = useState('area_ha');

  // Rename state
  const [sourceRenameField, setSourceRenameField] = useState('');
  const [targetRenameField, setTargetRenameField] = useState('');

  // Delete state
  const [deleteFieldKey, setDeleteFieldKey] = useState('');

  // Extract all existing property keys
  const allKeys = Array.from(
    new Set(geojson.features.flatMap((f) => Object.keys(f.properties || {})))
  ).filter((k) => !k.startsWith('_'));

  const handleApply = () => {
    const updatedFeatures: Feature<Geometry>[] = JSON.parse(JSON.stringify(geojson.features));
    const targetFeatures = updatedFeatures.filter((f) =>
      selectedIds.length === 0 ? true : selectedIds.includes(f.id as string | number)
    );

    if (targetFeatures.length === 0) {
      toast({
        title: 'Tidak ada fitur yang dipilih',
        description: 'Pilih setidaknya satu fitur di tabel atau pilih seluruh dataset.',
        variant: 'destructive',
      });
      return;
    }

    try {
      switch (activeTab) {
        case 'assign': {
          const fieldKey = assignFieldName.trim();
          if (!fieldKey) {
            toast({ title: 'Nama kolom wajib diisi', variant: 'destructive' });
            return;
          }
          targetFeatures.forEach((f) => {
            if (!f.properties) f.properties = {};
            f.properties[fieldKey] = assignValue;
          });
          toast({
            title: 'Nilai Berhasil Ditetapkan',
            description: `Kolom '${fieldKey}' diatur ke '${assignValue}' pada ${targetFeatures.length} fitur.`,
          });
          break;
        }
        case 'calculate': {
          const fieldKey = calcTargetField.trim() || calcFormula;
          targetFeatures.forEach((f) => {
            if (!f.properties) f.properties = {};
            const metrics = calculateGeometryMetrics(f);
            switch (calcFormula) {
              case 'area_m2':
                f.properties[fieldKey] = metrics.areaM2;
                break;
              case 'area_ha':
                f.properties[fieldKey] = metrics.areaHa;
                break;
              case 'area_km2':
                f.properties[fieldKey] = metrics.areaKm2;
                break;
              case 'length_m':
                f.properties[fieldKey] = metrics.lengthM || metrics.perimeterM;
                break;
              case 'centroid_lon':
                f.properties[fieldKey] = metrics.centroid[0];
                break;
              case 'centroid_lat':
                f.properties[fieldKey] = metrics.centroid[1];
                break;
              case 'bbox':
                f.properties[fieldKey] = metrics.bbox.join(', ');
                break;
            }
          });
          toast({
            title: 'Kalkulasi Spasial Selesai',
            description: `Kolom '${fieldKey}' dihitung untuk ${targetFeatures.length} fitur.`,
          });
          break;
        }
        case 'rename': {
          if (!sourceRenameField || !targetRenameField.trim()) {
            toast({ title: 'Pilih kolom asal dan nama baru', variant: 'destructive' });
            return;
          }
          const newName = targetRenameField.trim();
          updatedFeatures.forEach((f) => {
            if (f.properties && sourceRenameField in f.properties) {
              f.properties[newName] = f.properties[sourceRenameField];
              delete f.properties[sourceRenameField];
            }
          });
          toast({
            title: 'Kolom Berhasil Diubah',
            description: `Mengubah nama kolom '${sourceRenameField}' menjadi '${newName}'.`,
          });
          break;
        }
        case 'delete': {
          if (!deleteFieldKey) {
            toast({ title: 'Pilih kolom yang akan dihapus', variant: 'destructive' });
            return;
          }
          updatedFeatures.forEach((f) => {
            if (f.properties && deleteFieldKey in f.properties) {
              delete f.properties[deleteFieldKey];
            }
          });
          toast({
            title: 'Kolom Berhasil Dihapus',
            description: `Kolom '${deleteFieldKey}' telah dihapus dari seluruh fitur.`,
          });
          break;
        }
      }

      onUpdateGeoJSON({
        ...geojson,
        features: updatedFeatures,
      });
      onOpenChange(false);
    } catch (err) {
      toast({
        title: 'Gagal memproses batch mutation',
        description: err instanceof Error ? err.message : String(err),
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Layers className="w-5 h-5 text-primary" />
            Batch Property & Field Engineering
          </DialogTitle>
          <DialogDescription>
            Ubah, kalkulasi nilai geometris, atau modifikasi kolom atribut pada{' '}
            <span className="font-semibold text-foreground">
              {selectedIds.length > 0
                ? `${selectedIds.length} fitur terpilih`
                : `seluruh dataset (${geojson.features.length} fitur)`}
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as typeof activeTab)} className="w-full">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="assign" className="text-xs">Set Nilai</TabsTrigger>
            <TabsTrigger value="calculate" className="text-xs">Kalkulasi</TabsTrigger>
            <TabsTrigger value="rename" className="text-xs">Rename</TabsTrigger>
            <TabsTrigger value="delete" className="text-xs">Hapus</TabsTrigger>
          </TabsList>

          {/* TAB SET VALUE */}
          <TabsContent value="assign" className="space-y-3 pt-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Tag className="w-4 h-4 text-primary" />
              Menetapkan nilai yang sama ke satu kolom untuk semua fitur target.
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Nama Kolom (Field Name)</Label>
              <Input
                placeholder="Contoh: status, zone, priority"
                value={assignFieldName}
                onChange={(e) => setAssignFieldName(e.target.value)}
                className="h-8 text-xs font-mono"
              />
              {allKeys.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  <span className="text-[10px] text-muted-foreground mr-1">Pilih cepat:</span>
                  {allKeys.slice(0, 6).map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setAssignFieldName(k)}
                      className="text-[10px] px-1.5 py-0.5 bg-muted rounded hover:bg-primary/20 text-muted-foreground hover:text-foreground"
                    >
                      {k}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Nilai yang Ditetapkan</Label>
              <Input
                placeholder="Contoh: Aktif, Zona Lindung, 100"
                value={assignValue}
                onChange={(e) => setAssignValue(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          </TabsContent>

          {/* TAB CALCULATE GEOMETRY */}
          <TabsContent value="calculate" className="space-y-3 pt-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calculator className="w-4 h-4 text-primary" />
              Menghitung atribut metrik geometris otomatis secara deterministik.
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Formula Metrik</Label>
              <Select
                value={calcFormula}
                onValueChange={(val) => {
                  setCalcFormula(val);
                  setCalcTargetField(val);
                }}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="area_ha">Luas Hektar ($area_ha)</SelectItem>
                  <SelectItem value="area_m2">Luas Meter Persegi ($area_m2)</SelectItem>
                  <SelectItem value="area_km2">Luas Kilometer Persegi ($area_km2)</SelectItem>
                  <SelectItem value="length_m">Panjang / Keliling Meter ($length_m)</SelectItem>
                  <SelectItem value="centroid_lon">Titik Pusat Bujur ($centroid_lon)</SelectItem>
                  <SelectItem value="centroid_lat">Titik Pusat Lintang ($centroid_lat)</SelectItem>
                  <SelectItem value="bbox">Bounding Box BBox ($bbox)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Simpan ke Nama Kolom</Label>
              <Input
                value={calcTargetField}
                onChange={(e) => setCalcTargetField(e.target.value)}
                className="h-8 text-xs font-mono"
              />
            </div>
          </TabsContent>

          {/* TAB RENAME */}
          <TabsContent value="rename" className="space-y-3 pt-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Edit3 className="w-4 h-4 text-primary" />
              Mengubah nama key kolom pada semua fitur yang memilikinya.
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Kolom Asal</Label>
              <Select value={sourceRenameField} onValueChange={setSourceRenameField}>
                <SelectTrigger className="h-8 text-xs font-mono">
                  <SelectValue placeholder="Pilih kolom yang ingin diganti" />
                </SelectTrigger>
                <SelectContent>
                  {allKeys.map((k) => (
                    <SelectItem key={k} value={k}>
                      {k}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Nama Kolom Baru</Label>
              <Input
                placeholder="Nama kolom pengganti"
                value={targetRenameField}
                onChange={(e) => setTargetRenameField(e.target.value)}
                className="h-8 text-xs font-mono"
              />
            </div>
          </TabsContent>

          {/* TAB DELETE */}
          <TabsContent value="delete" className="space-y-3 pt-3">
            <div className="flex items-center gap-2 text-xs text-destructive">
              <Trash2 className="w-4 h-4" />
              Menghapus satu kolom sepenuhnya dari seluruh fitur di dataset.
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Pilih Kolom untuk Dihapus</Label>
              <Select value={deleteFieldKey} onValueChange={setDeleteFieldKey}>
                <SelectTrigger className="h-8 text-xs font-mono text-destructive">
                  <SelectValue placeholder="Pilih kolom yang akan dihapus" />
                </SelectTrigger>
                <SelectContent>
                  {allKeys.map((k) => (
                    <SelectItem key={k} value={k}>
                      {k}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button size="sm" onClick={handleApply}>
            Terapkan Mutasi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
