import { describe, it, expect } from 'vitest';
import { GisService } from '@/lib/spatial';
import { Feature, Polygon, Point } from 'geojson';

describe('GisService', () => {
  const point: Feature<Point> = {
    type: 'Feature',
    properties: { name: 'Test Point' },
    geometry: {
      type: 'Point',
      coordinates: [106.827153, -6.175392], // Jakarta
    },
  };

  const square1: Feature<Polygon> = {
    type: 'Feature',
    properties: { id: 1 },
    geometry: {
      type: 'Polygon',
      coordinates: [[[0, 0], [2, 0], [2, 2], [0, 2], [0, 0]]],
    },
  };

  const square2: Feature<Polygon> = {
    type: 'Feature',
    properties: { id: 2 },
    geometry: {
      type: 'Polygon',
      coordinates: [[[1, 1], [3, 1], [3, 3], [1, 3], [1, 1]]],
    },
  };

  const square3: Feature<Polygon> = {
    type: 'Feature',
    properties: { id: 3 },
    geometry: {
      type: 'Polygon',
      coordinates: [[[4, 4], [6, 4], [6, 6], [4, 6], [4, 4]]],
    },
  };

  describe('calculateArea', () => {
    it('should return area greater than 0 for a valid polygon', () => {
      const area = GisService.calculateArea(square1);
      expect(area).toBeGreaterThan(0);
      expect(typeof area).toBe('number');
    });

    it('should return 0 for a point', () => {
      const area = GisService.calculateArea(point);
      expect(area).toBe(0);
    });
  });

  describe('calculateCentroid', () => {
    it('should calculate the centroid of a polygon correctly', () => {
      const centroid = GisService.calculateCentroid(square1);
      expect(centroid.type).toBe('Feature');
      expect(centroid.geometry.type).toBe('Point');
      // Centroid of square [0,0] to [2,2] is [1,1]
      expect(centroid.geometry.coordinates).toEqual([1, 1]);
    });
  });

  describe('createBuffer', () => {
    it('should create a buffer polygon around a feature', () => {
      const buffered = GisService.createBuffer(point, 1, 'kilometers');
      expect(buffered.type).toBe('Feature');
      expect(buffered.geometry.type).toBe('Polygon');
    });
  });

  describe('checkIntersection', () => {
    it('should return true for intersecting polygons', () => {
      const intersects = GisService.checkIntersection(square1, square2);
      expect(intersects).toBe(true);
    });

    it('should return false for disjoint polygons', () => {
      const intersects = GisService.checkIntersection(square1, square3);
      expect(intersects).toBe(false);
    });
  });

  describe('toTopoJSON & fromTopoJSON', () => {
    it('should convert FeatureCollection to TopoJSON and back successfully', () => {
      const fc = {
        type: 'FeatureCollection' as const,
        features: [square1, square2],
      };

      const topo = GisService.toTopoJSON(fc);
      expect(topo).toBeDefined();
      expect(topo.type).toBe('Topology');
      expect(topo.objects).toHaveProperty('data');

      const backToGj = GisService.fromTopoJSON(topo);
      expect(backToGj.type).toBe('FeatureCollection');
      expect(backToGj.features).toHaveLength(2);
      expect(backToGj.features[0].geometry.type).toBe('Polygon');
    });

    it('should throw error when converting invalid TopoJSON', () => {
      expect(() => GisService.fromTopoJSON({})).toThrow('Invalid TopoJSON: missing objects');
      expect(() => GisService.fromTopoJSON({ objects: {} })).toThrow('Invalid TopoJSON: empty objects');
    });
  });

  describe('simplifyGeometry', () => {
    it('should simplify complex geometry', () => {
      const simplified = GisService.simplifyGeometry(square1, 0.1);
      expect(simplified).toBeDefined();
      expect(simplified.type).toBe('Feature');
    });
  });

  describe('unionFeatures', () => {
    it('should return combined geometry for intersecting polygons', () => {
      const union = GisService.unionFeatures([square1, square2]);
      expect(union).not.toBeNull();
      expect(union?.geometry.type).toBe('Polygon');
    });

    it('should return null if less than two features provided', () => {
      const union = GisService.unionFeatures([square1]);
      expect(union).toBeNull();
    });
  });
});
