import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  registerGeovaraDevApi,
  unregisterGeovaraDevApi,
  defaultDevSpatial,
  GeovaraDevApi,
} from '@/lib/dev-api';

describe('dev-api utility', () => {
  beforeEach(() => {
    unregisterGeovaraDevApi();
  });

  afterEach(() => {
    unregisterGeovaraDevApi();
  });

  it('should register window.geovara API correctly with spatial operations', () => {
    const mockApi: GeovaraDevApi = {
      version: '1.0.0',
      getGeoJSON: () => '{"type":"FeatureCollection","features":[]}',
      setGeoJSON: () => {},
      getFeatures: () => [],
      getFeaturesCount: () => 0,
      addFeature: () => {},
      clear: () => {},
      fitBounds: () => {},
      zoomToExtent: () => {},
      setBasemap: () => {},
      setProjection: () => {},
      spatial: defaultDevSpatial,
    };

    registerGeovaraDevApi(mockApi);
    expect(window.geovara).toBeDefined();
    expect(window.geovara?.version).toBe('1.0.0');
    expect(window.geovara?.getFeaturesCount()).toBe(0);
    expect(typeof window.geovara?.spatial.buffer).toBe('function');
    expect(typeof window.geovara?.spatial.simplify).toBe('function');
    expect(typeof window.geovara?.spatial.convexHull).toBe('function');
    expect(typeof window.geovara?.spatial.centroids).toBe('function');
    expect(typeof window.geovara?.spatial.unkink).toBe('function');
    expect(typeof window.geovara?.spatial.metrics).toBe('function');
  });

  it('should unregister window.geovara API', () => {
    const mockApi = {
      version: '1.0.0',
      spatial: defaultDevSpatial,
    } as unknown as GeovaraDevApi;

    registerGeovaraDevApi(mockApi);
    expect(window.geovara).toBeDefined();

    unregisterGeovaraDevApi();
    expect(window.geovara).toBeUndefined();
  });
});
