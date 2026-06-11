import { describe, it, expect } from 'vitest';
import { topoJsonDragFormat } from '@/lib/ol-topojson-drag-format';
import type { Feature } from 'ol';
import type { Geometry } from 'ol/geom';

interface DragFormat {
  getType(): string;
  readFeatures(source: unknown, options?: unknown): unknown[];
}

const format = topoJsonDragFormat as unknown as DragFormat;

describe('topoJsonDragFormat', () => {
  const validTopo = {
    type: 'Topology',
    objects: {
      data: {
        type: 'GeometryCollection',
        geometries: [
          {
            type: 'Point',
            coordinates: [106, -6],
            properties: { id: 1 },
          },
        ],
      },
    },
    arcs: [],
  };

  const validTopoString = JSON.stringify(validTopo);

  it('should return correct type', () => {
    expect(format.getType()).toBe('json');
  });

  describe('readFeatures', () => {
    it('should return empty array for invalid input', () => {
      expect(format.readFeatures(null)).toEqual([]);
      expect(format.readFeatures(undefined)).toEqual([]);
      expect(format.readFeatures('invalid-json-string')).toEqual([]);
      expect(format.readFeatures('{}')).toEqual([]);
    });

    it('should parse valid TopoJSON string correctly', () => {
      const features = format.readFeatures(validTopoString) as Feature<Geometry>[];
      expect(features).toHaveLength(1);
      expect(features[0].get('id')).toBe(1);

      const geometry = features[0].getGeometry();
      expect(geometry).toBeDefined();
      expect(geometry?.getType()).toBe('Point');
    });

    it('should parse valid TopoJSON object correctly', () => {
      const features = format.readFeatures(validTopo) as Feature<Geometry>[];
      expect(features).toHaveLength(1);
      expect(features[0].get('id')).toBe(1);
    });

    it('should parse valid TopoJSON ArrayBuffer correctly', () => {
      const view = new TextEncoder().encode(validTopoString);
      const buffer = new ArrayBuffer(view.byteLength);
      new Uint8Array(buffer).set(view);

      const features = format.readFeatures(buffer) as Feature<Geometry>[];
      expect(features).toHaveLength(1);
      expect(features[0].get('id')).toBe(1);
    });
  });
});
