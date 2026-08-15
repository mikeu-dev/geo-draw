import { describe, it, expect, beforeEach } from 'vitest';
import {
  matchQuickSpatialIntent,
  getCachedIntent,
  setCachedIntent,
  clearIntentCache,
} from '@/lib/ai-intent-cache';
import { SpatialIntentOutput } from '@/ai/flows/spatial-intent';

describe('ai-intent-cache', () => {
  beforeEach(() => {
    clearIntentCache();
  });

  describe('matchQuickSpatialIntent', () => {
    it('should match fly to command', () => {
      const intent = matchQuickSpatialIntent('Fly to Paris');
      expect(intent).not.toBeNull();
      expect(intent?.action).toBe('flyTo');
      expect(intent?.params?.query).toBe('Paris');
    });

    it('should match basemap commands', () => {
      const satellite = matchQuickSpatialIntent('Switch to satellite basemap');
      expect(satellite?.action).toBe('setBasemap');
      expect(satellite?.params?.basemap).toBe('satellite');

      const dark = matchQuickSpatialIntent('Turn on dark mode');
      expect(dark?.action).toBe('setBasemap');
      expect(dark?.params?.basemap).toBe('dark');
    });

    it('should match projection switch commands', () => {
      const epsg4326 = matchQuickSpatialIntent('Switch to EPSG:4326');
      expect(epsg4326?.action).toBe('setProjection');
      expect(epsg4326?.params?.projection).toBe('EPSG:4326');

      const mercator = matchQuickSpatialIntent('Use Web Mercator');
      expect(mercator?.action).toBe('setProjection');
      expect(mercator?.params?.projection).toBe('EPSG:3857');
    });

    it('should match buffer commands with radius and units', () => {
      const buffer = matchQuickSpatialIntent('Buffer by 500 meters');
      expect(buffer?.action).toBe('buffer');
      expect(buffer?.params?.radius).toBe(500);
      expect(buffer?.params?.units).toBe('meters');

      const defaultBuffer = matchQuickSpatialIntent('Create buffer');
      expect(defaultBuffer?.action).toBe('buffer');
      expect(defaultBuffer?.params?.radius).toBe(1);
    });

    it('should match convex hull, bbox, and centroid commands', () => {
      const hull = matchQuickSpatialIntent('Make convex hull');
      expect(hull?.action).toBe('convexHull');

      const bbox = matchQuickSpatialIntent('Create bounding box');
      expect(bbox?.action).toBe('bbox');

      const centroid = matchQuickSpatialIntent('Find centroid');
      expect(centroid?.action).toBe('centroid');
    });

    it('should return null for complex or unrecognized commands', () => {
      const unknown = matchQuickSpatialIntent('Explain the historical topography of this region');
      expect(unknown).toBeNull();
    });
  });

  describe('intent cache storage', () => {
    it('should store and retrieve cached intent', () => {
      const mockResult: SpatialIntentOutput = {
        action: 'flyTo',
        params: { query: 'Jakarta' },
        narrative: 'Navigating to Jakarta...',
      };

      expect(getCachedIntent('Fly to Jakarta')).toBeNull();
      setCachedIntent('Fly to Jakarta', mockResult);

      const cached = getCachedIntent('Fly to Jakarta');
      expect(cached).toEqual(mockResult);
    });
  });
});
