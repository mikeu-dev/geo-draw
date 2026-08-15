import LZString from 'lz-string';

/**
 * Compresses a GeoJSON string into a URL-safe encoded string.
 */
export function encodeGeoJSON(geojson: string): string {
  try {
    return LZString.compressToEncodedURIComponent(geojson);
  } catch (error) {
    console.error('Failed to encode GeoJSON:', error);
    return '';
  }
}

/**
 * Decompresses an encoded string back into a GeoJSON string.
 */
export function decodeGeoJSON(encoded: string): string {
  try {
    const decompressed = LZString.decompressFromEncodedURIComponent(encoded);
    return decompressed || '';
  } catch (error) {
    console.error('Failed to decode GeoJSON from URL:', error);
    return '';
  }
}

function hashQuerySegments(): string[] {
  const raw = window.location.hash.replace(/^#/, '');
  return raw ? raw.split('&').filter(Boolean) : [];
}

/**
 * Merges `data=` into the URL hash without dropping other segments (e.g. `map=` from OpenLayers).
 */
export function updateUrlHash(encoded: string) {
  if (typeof window === 'undefined') return;

  const kept = hashQuerySegments().filter((p) => !p.startsWith('data='));
  if (encoded) {
    kept.push(`data=${encoded}`);
  }

  const url = new URL(window.location.href);
  url.hash = kept.length > 0 ? kept.join('&') : '';
  window.history.replaceState(null, '', url.toString());
}

/**
 * Reads compressed GeoJSON from `data=` when the hash is combined (e.g. `data=…&map=…`).
 */
export function getEncodedFromHash(): string | null {
  if (typeof window === 'undefined') return null;

  const dataPart = hashQuerySegments().find((p) => p.startsWith('data='));
  if (!dataPart) return null;
  return dataPart.slice(5);
}

/**
 * Checks for a remote GeoJSON URL specified in search params (`?url=...`)
 * or hash format (`#data=data:text/x-url,...`).
 */
export function getRemoteUrlFromParams(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const searchParams = new URLSearchParams(window.location.search);
    const queryUrl = searchParams.get('url');
    if (queryUrl) return queryUrl;

    const hash = window.location.hash.replace(/^#/, '');
    const segments = hash.split('&');
    for (const segment of segments) {
      if (segment.startsWith('data=data:text/x-url,')) {
        return decodeURIComponent(segment.replace('data=data:text/x-url,', ''));
      }
    }
  } catch (error) {
    console.error('Error parsing remote URL from params:', error);
  }

  return null;
}

/**
 * Fetches a remote GeoJSON file with timeout and error handling.
 */
export async function fetchRemoteGeoJSON(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json, application/geo+json, text/plain',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
    }

    const text = await response.text();
    // Validate JSON format
    JSON.parse(text);
    return text;
  } finally {
    clearTimeout(timeout);
  }
}

