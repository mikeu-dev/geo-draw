import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { registerGeovaraDevApi, unregisterGeovaraDevApi, GeovaraDevApi } from '@/lib/dev-api';

describe('dev-api utility', () => {
  beforeEach(() => {
    unregisterGeovaraDevApi();
  });

  afterEach(() => {
    unregisterGeovaraDevApi();
  });

  it('should register window.geovara API correctly', () => {
    const mockApi: GeovaraDevApi = {
      version: '1.0.0',
      getGeoJSON: () => '{"type":"FeatureCollection","features":[]}',
      setGeoJSON: () => {},
      getFeatures: () => [],
      getFeaturesCount: () => 0,
      addFeature: () => {},
      clear: () => {},
      fitBounds: () => {},
      setBasemap: () => {},
      setProjection: () => {},
    };

    registerGeovaraDevApi(mockApi);
    expect(window.geovara).toBeDefined();
    expect(window.geovara?.version).toBe('1.0.0');
    expect(window.geovara?.getFeaturesCount()).toBe(0);
  });

  it('should unregister window.geovara API', () => {
    const mockApi = {
      version: '1.0.0',
    } as unknown as GeovaraDevApi;

    registerGeovaraDevApi(mockApi);
    expect(window.geovara).toBeDefined();

    unregisterGeovaraDevApi();
    expect(window.geovara).toBeUndefined();
  });
});
