'use client';

import { useState, useEffect, useRef, MouseEvent as ReactMouseEvent } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, GripVertical, Palette } from 'lucide-react';
import type { Feature } from 'ol';
import type { Geometry } from 'ol/geom';
import { Feature as GeoJSONFeature } from 'geojson';
import GeoJSON from 'ol/format/GeoJSON';
import { GisService } from '@/lib/spatial';
import {
  getDefaultSimpleStyle,
  isColorProperty,
  normalizeToHexColor,
} from '@/lib/simplestyle';

const geojsonFormat = new GeoJSON();

interface FeaturePropertiesPopupProps {
  feature: Feature<Geometry>;
  onDelete: (featureId: string | number | undefined) => void;
  onPropertyChange: (
    featureId: string | number,
    key: string,
    value: string | number | boolean | null | undefined | object
  ) => void;
  children: React.ReactNode;
  onOpenChange: (open: boolean) => void;
}

const getSanitizedProperties = (feature: Feature<Geometry>): [string, unknown][] => {
  const props = { ...feature.getProperties() };
  // Exclude internal OpenLayers geometry and system properties
  delete props.geometry;
  return Object.entries(props).filter(
    ([, value]) =>
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      value === null ||
      (typeof value === 'object' && value !== null && !Array.isArray(value))
  );
};

export default function FeaturePropertiesPopup({
  feature,
  onDelete,
  onPropertyChange,
  children,
  onOpenChange,
}: FeaturePropertiesPopupProps) {
  const [properties, setProperties] = useState<[string, unknown][]>(() =>
    getSanitizedProperties(feature)
  );
  const [prevFeature, setPrevFeature] = useState<Feature<Geometry>>(feature);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragStartRef = useRef({ x: 0, y: 0 });
  const popupRef = useRef<HTMLDivElement>(null);

  // Synchronize properties and reset position when feature instance changes
  if (feature !== prevFeature) {
    setPrevFeature(feature);
    setProperties(getSanitizedProperties(feature));
    setPosition({ x: 0, y: 0 });
  }

  const handleDragStart = (e: ReactMouseEvent<HTMLDivElement, MouseEvent>) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    document.body.style.cursor = 'move';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleDragMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y,
      });
    };

    const handleDragEnd = () => {
      setIsDragging(false);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };

    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleDragEnd);

    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };
  }, [isDragging]);

  const handlePropertyKeyChange = (oldKey: string, newKey: string) => {
    const trimmed = newKey.trim();
    if (!trimmed || trimmed === oldKey) return;

    const currentValue = feature.get(oldKey);
    onPropertyChange(feature.getId()!, oldKey, undefined); // Unset old
    onPropertyChange(feature.getId()!, trimmed, currentValue); // Set new

    setProperties((prev) =>
      prev.map(([k, v]) => (k === oldKey ? [trimmed, v] : [k, v]))
    );
  };

  const handlePropertyValueChange = (
    key: string,
    value: string | number | boolean | null | undefined | object
  ) => {
    onPropertyChange(feature.getId()!, key, value);
    setProperties((prev) =>
      prev.map(([propKey, propValue]) =>
        propKey === key ? [propKey, value] : [propKey, propValue]
      )
    );
  };

  const handleAddProperty = () => {
    let newKey = `new_property`;
    let i = 1;
    const existingKeys = properties.map(([k]) => k);
    while (existingKeys.includes(newKey)) {
      newKey = `new_property_${i}`;
      i++;
    }

    onPropertyChange(feature.getId()!, newKey, '');
    setProperties((prev) => [...prev, [newKey, '']]);
  };

  const handleRemoveProperty = (keyToRemove: string) => {
    onPropertyChange(feature.getId()!, keyToRemove, undefined);
    setProperties((prev) => prev.filter(([k]) => k !== keyToRemove));
  };

  const handleAddSimpleStyle = () => {
    const geometryType = feature.getGeometry()?.getType();
    const defaultStyles = getDefaultSimpleStyle(geometryType);

    const updatedPropsMap = new Map<string, unknown>(properties);

    for (const [key, value] of Object.entries(defaultStyles)) {
      onPropertyChange(feature.getId()!, key, value);
      updatedPropsMap.set(key, value);
    }

    setProperties(Array.from(updatedPropsMap.entries()));
  };

  const calculatedAnalysis = (() => {
    try {
      const geometry = feature.getGeometry();
      if (!geometry) return null;

      const type = geometry.getType();
      const geojson = geojsonFormat.writeFeatureObject(feature) as GeoJSONFeature;

      if (type === 'Polygon' || type === 'MultiPolygon' || type === 'Circle') {
        const area = GisService.calculateArea(geojson);
        return {
          label: 'Area',
          value:
            area > 1000000
              ? `${(area / 1000000).toFixed(4)} km²`
              : `${area.toFixed(2)} m²`,
        };
      } else if (type === 'LineString' || type === 'MultiLineString') {
        const length = GisService.calculateLength(geojson);
        return {
          label: 'Length',
          value:
            length > 1000
              ? `${(length / 1000).toFixed(4)} km`
              : `${length.toFixed(2)} m`,
        };
      }
      return null;
    } catch {
      return null;
    }
  })();

  return (
    <Popover open={true} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        ref={popupRef}
        className="w-84 cursor-default shadow-xl border-border bg-popover/95 backdrop-blur-md"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onPointerDownOutside={() => onOpenChange(false)}
        style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
      >
        <div className="grid gap-3">
          <div className="space-y-1">
            <div
              className="flex items-center justify-center cursor-move text-muted-foreground/60 hover:text-muted-foreground py-1"
              onMouseDown={handleDragStart}
              title="Drag to move popup"
            >
              <GripVertical className="h-4 w-4" />
            </div>
            <h4 className="font-semibold text-sm leading-none text-center">
              Feature Properties
            </h4>
            <p className="text-[11px] text-muted-foreground text-center">
              Edit properties, colors, or simplestyle attributes.
            </p>
          </div>

          <div className="grid gap-2 max-h-60 overflow-y-auto pr-1">
            {properties.map(([key, value]) => {
              const isColor = isColorProperty(key, value);
              return (
                <div key={key} className="flex items-center gap-1.5 group">
                  <Input
                    value={key}
                    className="font-mono text-xs w-28 flex-shrink-0 h-8"
                    onChange={(e) => {
                      const newK = e.target.value;
                      setProperties((prev) =>
                        prev.map(([k, v]) => (k === key ? [newK, v] : [k, v]))
                      );
                    }}
                    onBlur={(e) => handlePropertyKeyChange(key, e.target.value)}
                  />

                  {isColor ? (
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <input
                        type="color"
                        value={normalizeToHexColor(value)}
                        onChange={(e) =>
                          handlePropertyValueChange(key, e.target.value)
                        }
                        className="w-8 h-8 p-0.5 border border-border rounded cursor-pointer flex-shrink-0 bg-transparent"
                        title="Pick color"
                      />
                      <Input
                        value={
                          typeof value === 'object'
                            ? JSON.stringify(value)
                            : String(value ?? '')
                        }
                        className="font-mono text-xs h-8 flex-1 min-w-0"
                        onChange={(e) =>
                          handlePropertyValueChange(key, e.target.value)
                        }
                      />
                    </div>
                  ) : (
                    <Input
                      value={
                        typeof value === 'object'
                          ? JSON.stringify(value)
                          : String(value ?? '')
                      }
                      className="text-xs h-8 flex-1 min-w-0"
                      onChange={(e) =>
                        handlePropertyValueChange(key, e.target.value)
                      }
                    />
                  )}

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                    onClick={() => handleRemoveProperty(key)}
                    aria-label={`Remove property ${key}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-border/50">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddProperty}
              className="text-xs h-8"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Property
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleAddSimpleStyle}
              className="text-xs h-8 text-primary hover:text-primary font-medium"
            >
              <Palette className="h-3.5 w-3.5 mr-1.5 text-primary" /> Add simple style
            </Button>
          </div>

          {calculatedAnalysis && (
            <div className="p-2 bg-muted/60 rounded-md border border-dashed text-xs flex justify-between items-center">
              <span className="font-medium text-muted-foreground">
                {calculatedAnalysis.label}:
              </span>
              <span className="font-mono font-semibold">{calculatedAnalysis.value}</span>
            </div>
          )}

          <div className="flex justify-between items-center pt-2 border-t border-border">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(feature.getId())}
              className="text-xs h-8"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete Feature
            </Button>
            <Button size="sm" onClick={() => onOpenChange(false)} className="text-xs h-8">
              Done
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
