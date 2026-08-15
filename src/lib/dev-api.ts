import type { Feature } from 'ol';
import type { Geometry } from 'ol/geom';

export interface GeovaraDevApi {
  version: string;
  getGeoJSON: () => string;
  setGeoJSON: (geojson: string | object) => void;
  getFeatures: () => Feature<Geometry>[];
  getFeaturesCount: () => number;
  addFeature: (geometryOrGeojson: object, properties?: Record<string, unknown>) => void;
  clear: () => void;
  fitBounds: () => void;
  setBasemap: (basemapId: string) => void;
  setProjection: (projection: 'EPSG:4326' | 'EPSG:3857') => void;
}

declare global {
  interface Window {
    geovara?: GeovaraDevApi;
  }
}

/**
 * Registers global `window.geovara` console debugging API.
 */
export function registerGeovaraDevApi(api: GeovaraDevApi): void {
  if (typeof window === 'undefined') return;
  window.geovara = api;
}

/**
 * Unregisters global `window.geovara` API on unmount.
 */
export function unregisterGeovaraDevApi(): void {
  if (typeof window === 'undefined') return;
  delete window.geovara;
}
