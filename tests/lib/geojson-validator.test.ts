import { describe, it, expect } from 'vitest';
import { validateGeoJSONDeterministic } from '@/lib/geojson-validator';

describe('geojson-validator deterministic', () => {
  it('should validate empty FeatureCollection as valid', () => {
    const geojson = '{"type":"FeatureCollection","features":[]}';
    const result = validateGeoJSONDeterministic(geojson);

    expect(result.isValid).toBe(true);
    expect(result.feedback).toContain('GeoJSON valid sempurna');
  });

  it('should validate valid Point and Polygon features', () => {
    const geojson = JSON.stringify({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { name: 'Jakarta' },
          geometry: {
            type: 'Point',
            coordinates: [106.8272, -6.1754],
          },
        },
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [100, 0],
                [101, 0],
                [101, 1],
                [100, 1],
                [100, 0],
              ],
            ],
          },
        },
      ],
    });

    const result = validateGeoJSONDeterministic(geojson);
    expect(result.isValid).toBe(true);
    expect(result.stats?.featureCount).toBe(2);
  });

  it('should catch invalid JSON syntax', () => {
    const invalidJson = '{"type": "FeatureCollection", features: }';
    const result = validateGeoJSONDeterministic(invalidJson);

    expect(result.isValid).toBe(false);
    expect(result.feedback).toContain('Format JSON tidak valid');
  });

  it('should catch unclosed Polygon rings', () => {
    const unclosedPoly = JSON.stringify({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [100, 0],
                [101, 0],
                [101, 1],
                [100, 1], // missing closing point [100, 0]
              ],
            ],
          },
        },
      ],
    });

    const result = validateGeoJSONDeterministic(unclosedPoly);
    expect(result.isValid).toBe(false);
    expect(result.errors?.[0]).toContain('Cincin polygon tidak tertutup');
  });

  it('should catch coordinates out of WGS 84 bounds', () => {
    const outOfBounds = JSON.stringify({
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [250, -100], // invalid lon > 180 and lat < -90
      },
    });

    const result = validateGeoJSONDeterministic(outOfBounds);
    expect(result.isValid).toBe(false);
    expect(result.feedback).toContain('di luar batas wajar WGS 84');
  });
});
