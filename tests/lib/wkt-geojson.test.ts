import { describe, it, expect } from 'vitest';
import { wktToGeoJson, geoJsonToWkt } from '@/lib/wkt-geojson';
import type { FeatureCollection, Polygon, Point } from 'geojson';

describe('wkt-geojson utility', () => {
  it('should convert WKT Point to GeoJSON FeatureCollection', () => {
    const wkt = 'POINT(106.8272 -6.1754)';
    const result = wktToGeoJson(wkt);

    expect(result.type).toBe('FeatureCollection');
    expect(result.features).toHaveLength(1);
    expect(result.features[0].geometry.type).toBe('Point');
    expect((result.features[0].geometry as Point).coordinates).toEqual([106.8272, -6.1754]);
  });

  it('should convert WKT Polygon to GeoJSON FeatureCollection', () => {
    const wkt = 'POLYGON((100 0, 101 0, 101 1, 100 1, 100 0))';
    const result = wktToGeoJson(wkt);

    expect(result.type).toBe('FeatureCollection');
    expect(result.features[0].geometry.type).toBe('Polygon');
    expect((result.features[0].geometry as Polygon).coordinates[0]).toHaveLength(5);
  });

  it('should convert GeoJSON to WKT string', () => {
    const geojson: FeatureCollection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Point',
            coordinates: [107.5, -6.5],
          },
        },
      ],
    };

    const wkt = geoJsonToWkt(geojson);
    expect(wkt).toContain('POINT(107.5 -6.5)');
  });
});
