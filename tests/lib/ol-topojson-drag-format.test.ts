import { describe, it, expect } from 'vitest';
import { topoJsonDragFormat } from '@/lib/ol-topojson-drag-format';
import type { Feature } from 'ol';
import type { Geometry } from 'ol/geom';

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
    expect((topoJsonDragFormat as any).getType()).toBe('json');
  });

  describe('readFeatures', () => {
    it('should return empty array for invalid input', () => {
      expect((topoJsonDragFormat as any).readFeatures(null)).toEqual([]);
      expect((topoJsonDragFormat as any).readFeatures(undefined)).toEqual([]);
      expect((topoJsonDragFormat as any).readFeatures('invalid-json-string')).toEqual([]);
      expect((topoJsonDragFormat as any).readFeatures('{}')).toEqual([]);
    });

    it('should parse valid TopoJSON string correctly', () => {
      const features = (topoJsonDragFormat as any).readFeatures(
        validTopoString
      ) as Feature<Geometry>[];
      expect(features).toHaveLength(1);
      expect(features[0].get('id')).toBe(1);

      const geometry = features[0].getGeometry();
      expect(geometry).toBeDefined();
      expect(geometry?.getType()).toBe('Point');
    });

    it('should parse valid TopoJSON object correctly', () => {
      const features = (topoJsonDragFormat as any).readFeatures(validTopo) as Feature<Geometry>[];
      expect(features).toHaveLength(1);
      expect(features[0].get('id')).toBe(1);
    });

    it('should parse valid TopoJSON ArrayBuffer correctly', () => {
      const view = new TextEncoder().encode(validTopoString);
      const buffer = new ArrayBuffer(view.byteLength);
      new Uint8Array(buffer).set(view);

      const features = (topoJsonDragFormat as any).readFeatures(buffer) as Feature<Geometry>[];
      expect(features).toHaveLength(1);
      expect(features[0].get('id')).toBe(1);
    });
  });
});
