import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { shouldParseGeoJsonInWorker, parseGeoJsonStringInWorker } from '@/lib/geojson-worker-parse';

describe('geojson-worker-parse helper', () => {
  const originalWorker = global.Worker;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.Worker = originalWorker;
  });

  describe('shouldParseGeoJsonInWorker', () => {
    it('should return false if Worker is not defined in the environment', () => {
      // @ts-expect-error: Mock undefined Worker
      delete global.Worker;

      expect(shouldParseGeoJsonInWorker(500000)).toBe(false);
    });

    it('should return false if Worker is defined but length is below threshold', () => {
      global.Worker = vi.fn() as unknown as typeof Worker;
      const threshold = 256 * 1024;

      expect(shouldParseGeoJsonInWorker(threshold - 1)).toBe(false);
    });

    it('should return true if Worker is defined and length is above or equal to threshold', () => {
      global.Worker = vi.fn() as unknown as typeof Worker;
      const threshold = 256 * 1024;

      expect(shouldParseGeoJsonInWorker(threshold)).toBe(true);
      expect(shouldParseGeoJsonInWorker(threshold + 1000)).toBe(true);
    });
  });

  describe('parseGeoJsonStringInWorker', () => {
    let mockWorkerInstance: {
      postMessage: ReturnType<typeof vi.fn>;
      terminate: ReturnType<typeof vi.fn>;
      onmessage: ((e: MessageEvent) => void) | null;
      onerror: ((e: ErrorEvent) => void) | null;
    };

    beforeEach(() => {
      mockWorkerInstance = {
        postMessage: vi.fn(),
        terminate: vi.fn(),
        onmessage: null,
        onerror: null,
      };

      global.Worker = vi.fn().mockImplementation(() => mockWorkerInstance) as unknown as typeof Worker;
    });

    it('should resolve with data when worker reports success', async () => {
      const geojsonString = '{"type":"FeatureCollection","features":[]}';
      const parsedData = { type: 'FeatureCollection', features: [] };

      const promise = parseGeoJsonStringInWorker(geojsonString);

      expect(mockWorkerInstance.postMessage).toHaveBeenCalledWith(geojsonString);

      if (mockWorkerInstance.onmessage) {
        mockWorkerInstance.onmessage({
          data: { success: true, data: parsedData },
        } as MessageEvent);
      }

      const result = await promise;
      expect(result).toEqual(parsedData);
      expect(mockWorkerInstance.terminate).toHaveBeenCalled();
    });

    it('should reject with error message when worker reports failure', async () => {
      const promise = parseGeoJsonStringInWorker('invalid geojson');

      if (mockWorkerInstance.onmessage) {
        mockWorkerInstance.onmessage({
          data: { success: false, error: 'Invalid JSON' },
        } as MessageEvent);
      }

      await expect(promise).rejects.toThrow('Invalid JSON');
      expect(mockWorkerInstance.terminate).toHaveBeenCalled();
    });

    it('should reject with general error when worker message is malformed', async () => {
      const promise = parseGeoJsonStringInWorker('{}');

      if (mockWorkerInstance.onmessage) {
        mockWorkerInstance.onmessage({
          data: {},
        } as MessageEvent);
      }

      await expect(promise).rejects.toThrow('Worker parse failed');
      expect(mockWorkerInstance.terminate).toHaveBeenCalled();
    });

    it('should reject when worker encounters onerror', async () => {
      const promise = parseGeoJsonStringInWorker('{}');

      if (mockWorkerInstance.onerror) {
        mockWorkerInstance.onerror(new ErrorEvent('error', { message: 'Worker crashed' }));
      }

      await expect(promise).rejects.toThrow('Worker crashed');
      expect(mockWorkerInstance.terminate).toHaveBeenCalled();
    });
  });
});
