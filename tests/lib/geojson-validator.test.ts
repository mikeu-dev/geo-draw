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

  it('should validate minified single-line GeoJSON datasets correctly', () => {
    const minified =
      '{"type":"FeatureCollection","crs":{"type":"name","properties":{"name":"EPSG:4326"}},"features":[{"type":"Feature","id":1,"geometry":{"type":"Point","coordinates":[107.464227,-6.543408]},"properties":{"NAMOBJ":"Balai Desa Citalang"}}]}';
    const result = validateGeoJSONDeterministic(minified);
    expect(result.isValid).toBe(true);
    expect(result.stats?.featureCount).toBe(1);

    const formatted = JSON.stringify(JSON.parse(minified), null, 2);
    expect(formatted.split('\n').length).toBeGreaterThan(5);
  });
});
