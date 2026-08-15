import type { Feature, FeatureCollection, Point } from 'geojson';

const LAT_KEYS = ['lat', 'latitude', 'y', 'lat_deg', 'latitude_deg', 'lintang'];
const LON_KEYS = ['lon', 'lng', 'long', 'longitude', 'x', 'lon_deg', 'longitude_deg', 'bujur'];

/**
 * Split CSV line respecting quoted commas
 */
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (insideQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Convert CSV string containing lat/lon columns to a GeoJSON FeatureCollection of Points
 */
export function csvToGeoJson(csvString: string): FeatureCollection<Point> {
  const lines = csvString
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) {
    throw new Error('File CSV harus memiliki minimal 1 baris header dan 1 baris data.');
  }

  const headers = parseCsvLine(lines[0]).map((h) => h.replace(/^["']|["']$/g, '').trim());
  const lowerHeaders = headers.map((h) => h.toLowerCase());

  const latIndex = lowerHeaders.findIndex((h) => LAT_KEYS.includes(h));
  const lonIndex = lowerHeaders.findIndex((h) => LON_KEYS.includes(h));

  if (latIndex === -1 || lonIndex === -1) {
    throw new Error(
      `Kolom Latitude dan Longitude tidak ditemukan pada header CSV. Pastikan ada header seperti 'lat'/'latitude' dan 'lon'/'lng'/'longitude'.`
    );
  }

  const features: Feature<Point>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    if (values.length < headers.length && values.every((v) => v === '')) continue;

    const latRaw = values[latIndex];
    const lonRaw = values[lonIndex];
    const lat = parseFloat(latRaw);
    const lon = parseFloat(lonRaw);

    if (isNaN(lat) || isNaN(lon)) {
      continue; // Skip invalid coordinates
    }

    const properties: Record<string, unknown> = {};
    headers.forEach((header, idx) => {
      let val: unknown = values[idx] ?? '';
      // Try parsing numeric values
      if (typeof val === 'string') {
        val = val.replace(/^["']|["']$/g, '');
        if (val !== '' && !isNaN(Number(val))) {
          val = Number(val);
        }
      }
      properties[header] = val;
    });

    features.push({
      type: 'Feature',
      id: `csv_row_${i}`,
      properties,
      geometry: {
        type: 'Point',
        coordinates: [lon, lat],
      },
    });
  }

  return {
    type: 'FeatureCollection',
    features,
  };
}

/**
 * Convert GeoJSON FeatureCollection to CSV string
 */
export function geoJsonToCsv(geojson: FeatureCollection | string): string {
  const parsed: FeatureCollection =
    typeof geojson === 'string' ? JSON.parse(geojson) : geojson;

  if (!parsed || !Array.isArray(parsed.features) || parsed.features.length === 0) {
    return 'id,geometry_type,latitude,longitude\n';
  }

  // Collect all unique property keys
  const propKeysSet = new Set<string>();
  parsed.features.forEach((feature) => {
    if (feature.properties) {
      Object.keys(feature.properties).forEach((k) => propKeysSet.add(k));
    }
  });

  const propKeys = Array.from(propKeysSet);
  const headers = ['id', 'geometry_type', 'latitude', 'longitude', ...propKeys];

  const rows = parsed.features.map((feature, idx) => {
    const id = feature.id !== undefined ? String(feature.id) : `feature_${idx + 1}`;
    const geomType = feature.geometry?.type ?? 'None';
    let lat = '';
    let lon = '';

    if (feature.geometry?.type === 'Point') {
      const coords = (feature.geometry as Point).coordinates;
      lon = String(coords[0]);
      lat = String(coords[1]);
    }

    const propValues = propKeys.map((k) => {
      const v = feature.properties?.[k];
      if (v === undefined || v === null) return '""';
      const str = String(v).replace(/"/g, '""');
      return `"${str}"`;
    });

    return [`"${id}"`, `"${geomType}"`, `"${lat}"`, `"${lon}"`, ...propValues].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}
