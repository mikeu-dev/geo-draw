import { describe, it, expect, vi, beforeEach } from 'vitest';
import { encodeGeoJSON, decodeGeoJSON, getEncodedFromHash, updateUrlHash } from '@/lib/url-state';

describe('url-state helper', () => {
  const geojson = JSON.stringify({ type: 'FeatureCollection', features: [] });

  beforeEach(() => {
    window.location.hash = '';
    vi.restoreAllMocks();
  });

  describe('encodeGeoJSON & decodeGeoJSON', () => {
    it('should encode and decode GeoJSON string successfully', () => {
      const encoded = encodeGeoJSON(geojson);
      expect(encoded).toBeTruthy();
      expect(typeof encoded).toBe('string');

      const decoded = decodeGeoJSON(encoded);
      expect(decoded).toBe(geojson);
    });

    it('should return empty string if decoding invalid data', () => {
      const decoded = decodeGeoJSON('invalid-encoded-string!!!');
      expect(decoded).toBe('');
    });
  });

  describe('getEncodedFromHash', () => {
    it('should return null if no hash is present', () => {
      window.location.hash = '';
      expect(getEncodedFromHash()).toBeNull();
    });

    it('should return null if hash exists but does not contain data=', () => {
      window.location.hash = '#map=12/34/56';
      expect(getEncodedFromHash()).toBeNull();
    });

    it('should return the encoded data if data= is present in hash', () => {
      window.location.hash = '#data=someEncodedString';
      expect(getEncodedFromHash()).toBe('someEncodedString');
    });

    it('should parse data= correctly when combined with other segments', () => {
      window.location.hash = '#map=12/34/56&data=someEncodedString&other=val';
      expect(getEncodedFromHash()).toBe('someEncodedString');
    });
  });

  describe('updateUrlHash', () => {
    it('should update hash with encoded data while preserving other segments', () => {
      window.location.hash = '#map=12/34/56&other=val';
      const replaceStateSpy = vi.spyOn(window.history, 'replaceState');

      updateUrlHash('newEncodedData');

      expect(replaceStateSpy).toHaveBeenCalled();
      const updatedUrl = replaceStateSpy.mock.calls[0][2] as string;
      expect(updatedUrl).toContain('map=12/34/56');
      expect(updatedUrl).toContain('other=val');
      expect(updatedUrl).toContain('data=newEncodedData');
    });

    it('should remove data= from hash if updateUrlHash is called with empty string', () => {
      window.location.hash = '#map=12/34/56&data=oldEncodedData';
      const replaceStateSpy = vi.spyOn(window.history, 'replaceState');

      updateUrlHash('');

      expect(replaceStateSpy).toHaveBeenCalled();
      const updatedUrl = replaceStateSpy.mock.calls[0][2] as string;
      expect(updatedUrl).toContain('map=12/34/56');
      expect(updatedUrl).not.toContain('data=');
    });
  });
});
