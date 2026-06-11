import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('nominatim helper', () => {
  let getNominatimFetchInit: any;
  let nominatimSearchUrl: any;
  let fetchNominatim: any;
  let nominatimSearchResults: any;

  beforeEach(async () => {
    vi.resetModules();
    const nominatim = await import('@/lib/nominatim');
    getNominatimFetchInit = nominatim.getNominatimFetchInit;
    nominatimSearchUrl = nominatim.nominatimSearchUrl;
    fetchNominatim = nominatim.fetchNominatim;
    nominatimSearchResults = nominatim.nominatimSearchResults;

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      })
    );
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('getNominatimFetchInit', () => {
    it('should set default Accept-Language and User-Agent', () => {
      const init = getNominatimFetchInit();
      const headers = init.headers as Headers;

      expect(headers.get('Accept-Language')).toBe('en');
      expect(headers.get('User-Agent')).toContain('Geovara/0.1.0');
    });

    it('should respect custom Accept-Language and other headers', () => {
      const init = getNominatimFetchInit({
        'Accept-Language': 'id',
        'X-Custom': 'test-val',
      });
      const headers = init.headers as Headers;

      expect(headers.get('Accept-Language')).toBe('id');
      expect(headers.get('X-Custom')).toBe('test-val');
    });
  });

  describe('nominatimSearchUrl', () => {
    it('should construct search URL correctly', () => {
      const url = nominatimSearchUrl({ q: 'Jakarta', limit: 5 });
      expect(url).toBe('https://nominatim.openstreetmap.org/search?q=Jakarta&limit=5');
    });

    it('should ignore undefined values', () => {
      const url = nominatimSearchUrl({ q: 'Bandung', format: undefined, limit: 1 });
      expect(url).toBe('https://nominatim.openstreetmap.org/search?q=Bandung&limit=1');
    });
  });

  describe('fetchNominatim (throttling & queuing)', () => {
    it('should space consecutive requests by at least 1100ms', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch');

      // First call should run immediately
      const p1 = fetchNominatim('https://api/1');
      await vi.advanceTimersByTimeAsync(10);
      expect(fetchSpy).toHaveBeenCalledTimes(1);

      // Second call should wait
      const p2 = fetchNominatim('https://api/2');
      await vi.advanceTimersByTimeAsync(500);
      expect(fetchSpy).toHaveBeenCalledTimes(1);

      // Advance past 1100ms
      await vi.advanceTimersByTimeAsync(600);
      expect(fetchSpy).toHaveBeenCalledTimes(2);

      await Promise.all([p1, p2]);
    });
  });

  describe('nominatimSearchResults', () => {
    it('should return search results array when fetch is successful', async () => {
      const mockData = [{ place_id: 123, display_name: 'Jakarta' }];
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockData),
        })
      );

      const resPromise = nominatimSearchResults('https://api/search');
      await vi.advanceTimersByTimeAsync(10);
      const results = await resPromise;

      expect(results).toEqual(mockData);
    });

    it('should return empty array if response json is not an array', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ notAnArray: true }),
        })
      );

      const resPromise = nominatimSearchResults('https://api/search');
      await vi.advanceTimersByTimeAsync(10);
      const results = await resPromise;

      expect(results).toEqual([]);
    });

    it('should throw error if response is not ok', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          status: 500,
        })
      );

      const resPromise = nominatimSearchResults('https://api/search');
      const assertion = expect(resPromise).rejects.toThrow('Nominatim HTTP 500');

      // Advance timers after attaching the rejection handler to prevent Unhandled Rejection warning
      await vi.advanceTimersByTimeAsync(10);
      await assertion;
    });

    it('should throw error if json parsing fails', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.reject(new Error('SyntaxError')),
        })
      );

      const resPromise = nominatimSearchResults('https://api/search');
      const assertion = expect(resPromise).rejects.toThrow('Nominatim returned non-JSON');

      // Advance timers after attaching the rejection handler to prevent Unhandled Rejection warning
      await vi.advanceTimersByTimeAsync(10);
      await assertion;
    });
  });
});
