import { describe, it, expect } from 'vitest';
import {
  calculateGeometryMetrics,
  generateBuffer,
  simplifyGeoJSON,
  generateConvexHull,
  generateCentroids,
  unkinkPolygons,
  booleanUnionPolygons,
  booleanIntersectPolygons,
  booleanDifferencePolygons,
} from '@/lib/spatial-operations';
import type { Feature, FeatureCollection, Polygon, Point, LineString } from 'geojson';

describe('spatial-operations', () => {
  const samplePolygon: Feature<Polygon> = {
    type: 'Feature',
    id: 'poly_1',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [106.82, -6.17],
          [106.83, -6.17],
          [106.83, -6.18],
          [106.82, -6.18],
          [106.82, -6.17],
        ],
      ],
    },
    properties: { name: 'Jakarta Box' },
  };

  const samplePoint: Feature<Point> = {
    type: 'Feature',
    id: 'pt_1',
    geometry: {
      type: 'Point',
      coordinates: [106.8271, -6.1754],
    },
    properties: { name: 'Monas' },
  };

  const sampleLine: Feature<LineString> = {
    type: 'Feature',
    id: 'line_1',
    geometry: {
      type: 'LineString',
      coordinates: [
        [106.82, -6.17],
        [106.83, -6.17],
      ],
    },
    properties: { name: 'Thamrin' },
  };

  const sampleCollection: FeatureCollection = {
    type: 'FeatureCollection',
    features: [samplePolygon, samplePoint],
  };

  describe('calculateGeometryMetrics', () => {
    it('calculates polygon area and perimeter correctly', () => {
      const metrics = calculateGeometryMetrics(samplePolygon);
      expect(metrics.areaM2).toBeGreaterThan(1000000);
      expect(metrics.areaHa).toBeGreaterThan(100);
      expect(metrics.perimeterM).toBeGreaterThan(1000);
      expect(metrics.centroid[0]).toBeCloseTo(106.825, 2);
      expect(metrics.centroid[1]).toBeCloseTo(-6.175, 2);
    });

    it('calculates line length correctly', () => {
      const metrics = calculateGeometryMetrics(sampleLine);
      expect(metrics.lengthM).toBeGreaterThan(1000);
      expect(metrics.areaM2).toBe(0);
    });
  });

  describe('generateBuffer', () => {
    it('generates a buffer polygon around a point', () => {
      const buffer = generateBuffer(samplePoint, 100, 'meters');
      expect(buffer.type).toBe('FeatureCollection');
      expect(buffer.features.length).toBeGreaterThan(0);
      expect(buffer.features[0].geometry.type).toBe('Polygon');
    });

    it('generates buffer around a feature collection', () => {
      const buffer = generateBuffer(sampleCollection, 50, 'meters');
      expect(buffer.type).toBe('FeatureCollection');
      expect(buffer.features.length).toBeGreaterThan(0);
    });
  });

  describe('simplifyGeoJSON', () => {
    it('simplifies a polygon with tolerance', () => {
      const simplified = simplifyGeoJSON(samplePolygon, 0.01);
      expect(simplified.geometry.type).toBe('Polygon');
      expect(simplified.geometry.coordinates[0].length).toBeLessThanOrEqual(
        samplePolygon.geometry.coordinates[0].length
      );
    });
  });

  describe('generateConvexHull', () => {
    it('creates convex hull from multi-feature collection', () => {
      const hull = generateConvexHull(sampleCollection);
      expect(hull).not.toBeNull();
      if (hull) {
        expect(hull.geometry.type).toBe('Polygon');
      }
    });
  });

  describe('generateCentroids', () => {
    it('creates Point features for each geometry in the collection', () => {
      const centroids = generateCentroids(sampleCollection);
      expect(centroids.features.length).toBe(2);
      expect(centroids.features[0].geometry.type).toBe('Point');
      expect(centroids.features[1].geometry.type).toBe('Point');
    });
  });

  describe('unkinkPolygons', () => {
    it('handles self-intersecting polygon unkinking', () => {
      // Bowtie self-intersecting polygon
      const bowtiePolygon: Feature<Polygon> = {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [0, 0],
              [2, 2],
              [2, 0],
              [0, 2],
              [0, 0],
            ],
          ],
        },
        properties: {},
      };

      const result = unkinkPolygons({
        type: 'FeatureCollection',
        features: [bowtiePolygon],
      });

      expect(result.features.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('boolean operations', () => {
    const polyA: Feature<Polygon> = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [0, 0],
            [2, 0],
            [2, 2],
            [0, 2],
            [0, 0],
          ],
        ],
      },
      properties: { id: 'A' },
    };

    const polyB: Feature<Polygon> = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [1, 1],
            [3, 1],
            [3, 3],
            [1, 3],
            [1, 1],
          ],
        ],
      },
      properties: { id: 'B' },
    };

    it('unions two overlapping polygons', () => {
      const unionResult = booleanUnionPolygons({
        type: 'FeatureCollection',
        features: [polyA, polyB],
      });
      expect(unionResult).not.toBeNull();
      expect(unionResult?.geometry.type).toBeDefined();
    });

    it('computes intersection of two polygons', () => {
      const intersection = booleanIntersectPolygons(polyA, polyB);
      expect(intersection).not.toBeNull();
      expect(intersection?.geometry.type).toBe('Polygon');
    });

    it('computes difference of two polygons', () => {
      const diff = booleanDifferencePolygons(polyA, polyB);
      expect(diff).not.toBeNull();
      expect(diff?.geometry.type).toBe('Polygon');
    });
  });
});
