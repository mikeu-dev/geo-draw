import { SpatialIntentOutput } from '@/ai/flows/spatial-intent';

/**
 * In-memory LRU-like cache for spatial intent responses.
 */
const intentCache = new Map<string, SpatialIntentOutput>();
const MAX_CACHE_SIZE = 50;

export function getCachedIntent(prompt: string, featureContext?: string): SpatialIntentOutput | null {
  const key = `${prompt.trim().toLowerCase()}::${featureContext || ''}`;
  return intentCache.get(key) || null;
}

export function setCachedIntent(prompt: string, result: SpatialIntentOutput, featureContext?: string): void {
  if (intentCache.size >= MAX_CACHE_SIZE) {
    const firstKey = intentCache.keys().next().value;
    if (firstKey) intentCache.delete(firstKey);
  }
  const key = `${prompt.trim().toLowerCase()}::${featureContext || ''}`;
  intentCache.set(key, result);
}

export function clearIntentCache(): void {
  intentCache.clear();
}

/**
 * Fast client-side regex matcher for instant spatial commands.
 * Bypasses network and Gemini API calls to save quota and provide 0ms latency.
 */
export function matchQuickSpatialIntent(prompt: string): SpatialIntentOutput | null {
  const trimmed = prompt.trim();
  const p = trimmed.toLowerCase();

  // Fly to / Go to / Navigate to (preserve original casing in query parameter)
  const flyMatch = trimmed.match(/^(?:fly\s+to|go\s+to|navigate\s+to|zoom\s+to|cari|menuju\s+ke)\s+(.+)$/i);
  if (flyMatch && flyMatch[1]) {
    const query = flyMatch[1].trim();
    return {
      action: 'flyTo',
      params: { query },
      narrative: `Navigating to ${query}...`,
    };
  }

  // Basemap switcher
  if (/\b(satellite|satelit|citra)\b/i.test(p)) {
    return {
      action: 'setBasemap',
      params: { basemap: 'satellite' },
      narrative: 'Switched to Satellite basemap.',
    };
  }
  if (/\b(dark\s*mode|dark\s*map|tema\s*gelap)\b/i.test(p)) {
    return {
      action: 'setBasemap',
      params: { basemap: 'dark' },
      narrative: 'Switched to Dark basemap.',
    };
  }
  if (/\b(topo|topographic|topografi)\b/i.test(p)) {
    return {
      action: 'setBasemap',
      params: { basemap: 'topo' },
      narrative: 'Switched to Topographic basemap.',
    };
  }
  if (/\b(osm|street|open\s*street\s*map|jalan)\b/i.test(p)) {
    return {
      action: 'setBasemap',
      params: { basemap: 'osm' },
      narrative: 'Switched to OpenStreetMap.',
    };
  }

  // Projection / CRS switcher
  if (/\b(epsg\s*:?\s*4326|wgs\s*84|wgs84)\b/i.test(p)) {
    return {
      action: 'setProjection',
      params: { projection: 'EPSG:4326' },
      narrative: 'Switched coordinate system to WGS 84 (EPSG:4326).',
    };
  }
  if (/\b(epsg\s*:?\s*3857|web\s*mercator|mercator)\b/i.test(p)) {
    return {
      action: 'setProjection',
      params: { projection: 'EPSG:3857' },
      narrative: 'Switched coordinate system to Web Mercator (EPSG:3857).',
    };
  }

  // Buffer
  const bufferMatch = p.match(/\bbuffer\b.*?(?:by\s+)?(\d+(?:\.\d+)?)\s*(km|kilometer|m|meter|miles)?/i);
  if (bufferMatch) {
    const val = parseFloat(bufferMatch[1]);
    const rawUnit = bufferMatch[2]?.toLowerCase();
    const units = rawUnit === 'm' || rawUnit === 'meter' ? 'meters' : rawUnit === 'miles' ? 'miles' : 'kilometers';
    return {
      action: 'buffer',
      params: { radius: val || 1, units },
      narrative: `Creating ${val || 1} ${units} buffer...`,
    };
  }
  if (/\b(buffer|buat\s*buffer)\b/i.test(p)) {
    return {
      action: 'buffer',
      params: { radius: 1, units: 'kilometers' },
      narrative: 'Creating 1 km buffer...',
    };
  }

  // Convex Hull
  if (/\b(convex\s*hull|amplop\s*cembung|wrap\s*points)\b/i.test(p)) {
    return {
      action: 'convexHull',
      narrative: 'Computing convex hull envelope...',
    };
  }

  // Bounding Box
  if (/\b(bounding\s*box|bbox|envelope|kotak\s*batas)\b/i.test(p)) {
    return {
      action: 'bbox',
      narrative: 'Generating bounding box polygon...',
    };
  }

  // Centroid
  if (/\b(centroid|center|titik\s*tengah|pusat)\b/i.test(p)) {
    return {
      action: 'centroid',
      narrative: 'Calculating center point / centroid...',
    };
  }

  // Simplify
  if (/\b(simplify|sederhanakan|less\s*complex)\b/i.test(p)) {
    return {
      action: 'simplify',
      narrative: 'Simplifying geometry...',
    };
  }

  // Unkink / Fix self-intersecting polygon
  if (/\b(unkink|fix\s*kink|perbaiki\s*poligon|self\s*-?\s*intersect\w*)\b/i.test(p)) {
    return {
      action: 'unkink',
      narrative: 'Repairing self-intersecting polygons...',
    };
  }

  // Calculate field (area / length)
  if (/\b(hitung\s*luas|calculate\s*area|hitung\s*keliling|calculate\s*length)\b/i.test(p)) {
    return {
      action: 'calculateField',
      params: { propKey: 'area_ha' },
      narrative: 'Calculating geometric metrics for features...',
    };
  }

  // Union
  if (/\b(union|merge\s*polygons|combine\s*features|gabung)\b/i.test(p)) {
    return {
      action: 'union',
      narrative: 'Combining intersecting polygons...',
    };
  }

  // Clear
  if (/\b(clear\s*all|clear\s*map|hapus\s*semua|reset\s*map)\b/i.test(p)) {
    return {
      action: 'clear',
      narrative: 'Clearing all features from the map.',
    };
  }

  // Delete
  if (/\b(delete\s*selected|delete\s*feature|hapus\s*fitur)\b/i.test(p)) {
    return {
      action: 'delete',
      narrative: 'Deleting selected feature.',
    };
  }

  // Export CSV
  if (/\b(export|download|simpan|save)\b.*\b(csv)\b/i.test(p)) {
    return {
      action: 'export',
      params: { exportFormat: 'csv' },
      narrative: 'Exporting data as CSV spreadsheet...',
    };
  }

  // Export WKT
  if (/\b(export|download|simpan|save)\b.*\b(wkt|well\s*known\s*text)\b/i.test(p)) {
    return {
      action: 'export',
      params: { exportFormat: 'wkt' },
      narrative: 'Exporting data as WKT (Well-Known Text)...',
    };
  }

  // Export TopoJSON / GeoJSON / KML / KMZ
  if (/\b(export|download|simpan|save)\b.*\b(topojson)\b/i.test(p)) {
    return {
      action: 'export',
      params: { exportFormat: 'topojson' },
      narrative: 'Exporting data as TopoJSON...',
    };
  }
  if (/\b(export|download|simpan|save)\b.*\b(geojson)\b/i.test(p)) {
    return {
      action: 'export',
      params: { exportFormat: 'geojson' },
      narrative: 'Exporting data as GeoJSON...',
    };
  }
  if (/\b(export|download|simpan|save)\b.*\b(kmz)\b/i.test(p)) {
    return {
      action: 'export',
      params: { exportFormat: 'kmz' },
      narrative: 'Exporting data as KMZ...',
    };
  }
  if (/\b(export|download|simpan|save)\b.*\b(kml)\b/i.test(p)) {
    return {
      action: 'export',
      params: { exportFormat: 'kml' },
      narrative: 'Exporting data as KML...',
    };
  }

  // Remote URL loading
  const urlMatch = trimmed.match(/(?:load|buka|fetch|ambil|open)\s+(?:url|link|data)?\s*(https?:\/\/[^\s]+)/i);
  if (urlMatch && urlMatch[1]) {
    const url = urlMatch[1].trim();
    return {
      action: 'loadUrl',
      params: { url },
      narrative: `Fetching remote GeoJSON from ${url}...`,
    };
  }

  return null;
}
