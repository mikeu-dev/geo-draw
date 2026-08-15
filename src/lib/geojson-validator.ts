import type { FeatureCollection, Feature, Geometry, Position } from 'geojson';

export interface ValidationResult {
  isValid: boolean;
  feedback: string;
  errors?: string[];
  stats?: {
    featureCount: number;
    geometryTypes: string[];
    hasProperties: boolean;
  };
}

const VALID_GEOM_TYPES = [
  'Point',
  'MultiPoint',
  'LineString',
  'MultiLineString',
  'Polygon',
  'MultiPolygon',
  'GeometryCollection',
];

/**
 * Validates a single 2D/3D coordinate pair against WGS 84 bounds.
 */
function validateCoordinate(coord: Position, path: string): string | null {
  if (!Array.isArray(coord) || coord.length < 2) {
    return `${path}: Koordinat harus berupa array minimal 2 angka [longitude, latitude].`;
  }
  const [lon, lat] = coord;
  if (typeof lon !== 'number' || typeof lat !== 'number' || isNaN(lon) || isNaN(lat)) {
    return `${path}: Nilai koordinat harus berupa angka numerik valid.`;
  }
  if (lon < -180 || lon > 180) {
    return `${path}: Longitude (${lon}) di luar batas wajar WGS 84 (-180 hingga 180).`;
  }
  if (lat < -90 || lat > 90) {
    return `${path}: Latitude (${lat}) di luar batas wajar WGS 84 (-90 hingga 90).`;
  }
  return null;
}

/**
 * Validates geometry according to RFC 7946 specification.
 */
function validateGeometry(geom: Geometry, path: string): string[] {
  const errors: string[] = [];
  if (!geom || typeof geom !== 'object') {
    return [`${path}: Objek geometri kosong atau tidak valid.`];
  }

  if (!VALID_GEOM_TYPES.includes(geom.type)) {
    return [`${path}: Tipe geometri '${geom.type}' tidak dikenali oleh standar RFC 7946.`];
  }

  if (geom.type === 'GeometryCollection') {
    if (!Array.isArray(geom.geometries)) {
      return [`${path}: GeometryCollection harus memiliki array 'geometries'.`];
    }
    geom.geometries.forEach((g, i) => {
      errors.push(...validateGeometry(g, `${path}.geometries[${i}]`));
    });
    return errors;
  }

  const coords = geom.coordinates;
  if (!coords || !Array.isArray(coords)) {
    return [`${path}: Properti 'coordinates' tidak valid atau hilang.`];
  }

  switch (geom.type) {
    case 'Point': {
      const err = validateCoordinate(coords as Position, path);
      if (err) errors.push(err);
      break;
    }
    case 'MultiPoint':
    case 'LineString': {
      if (geom.type === 'LineString' && coords.length < 2) {
        errors.push(`${path}: LineString harus memiliki minimal 2 titik koordinat.`);
      }
      (coords as Position[]).forEach((pt, i) => {
        const err = validateCoordinate(pt, `${path}[${i}]`);
        if (err) errors.push(err);
      });
      break;
    }
    case 'Polygon': {
      const rings = coords as Position[][];
      if (rings.length === 0) {
        errors.push(`${path}: Polygon harus memiliki minimal 1 cincin linear (outer ring).`);
      }
      rings.forEach((ring, rIdx) => {
        if (!Array.isArray(ring) || ring.length < 4) {
          errors.push(`${path}.ring[${rIdx}]: Cincin polygon harus memiliki minimal 4 titik koordinat.`);
          return;
        }
        // Check closed ring (first coordinate equals last coordinate)
        const first = ring[0];
        const last = ring[ring.length - 1];
        if (first[0] !== last[0] || first[1] !== last[1]) {
          errors.push(`${path}.ring[${rIdx}]: Cincin polygon tidak tertutup (titik awal [${first}] != titik akhir [${last}]).`);
        }
        ring.forEach((pt, i) => {
          const err = validateCoordinate(pt, `${path}.ring[${rIdx}][${i}]`);
          if (err) errors.push(err);
        });
      });
      break;
    }
    case 'MultiPolygon': {
      const polys = coords as Position[][][];
      polys.forEach((poly, pIdx) => {
        poly.forEach((ring, rIdx) => {
          if (!Array.isArray(ring) || ring.length < 4) {
            errors.push(`${path}.poly[${pIdx}].ring[${rIdx}]: Cincin polygon harus memiliki minimal 4 titik.`);
            return;
          }
          const first = ring[0];
          const last = ring[ring.length - 1];
          if (first[0] !== last[0] || first[1] !== last[1]) {
            errors.push(`${path}.poly[${pIdx}].ring[${rIdx}]: Cincin polygon tidak tertutup.`);
          }
        });
      });
      break;
    }
  }

  return errors;
}

/**
 * Fast, deterministic client-side/offline GeoJSON validator (RFC 7946).
 * Zero AI tokens, zero quota usage, 0ms latency.
 */
export function validateGeoJSONDeterministic(geojsonInput: string | object): ValidationResult {
  let parsed: unknown;

  // 1. JSON Syntax Check
  if (typeof geojsonInput === 'string') {
    try {
      parsed = JSON.parse(geojsonInput);
    } catch (err) {
      return {
        isValid: false,
        feedback: `Format JSON tidak valid: ${(err as Error).message}`,
        errors: [`Sintaks JSON error: ${(err as Error).message}`],
      };
    }
  } else {
    parsed = geojsonInput;
  }

  if (!parsed || typeof parsed !== 'object') {
    return {
      isValid: false,
      feedback: 'Data GeoJSON harus berupa object JSON valid.',
      errors: ['Root data bukan sebuah objek JSON.'],
    };
  }

  const root = parsed as Record<string, unknown>;
  const errors: string[] = [];
  const geomTypes = new Set<string>();

  // 2. Root Type Check
  if (!root.type || typeof root.type !== 'string') {
    return {
      isValid: false,
      feedback: "Objek GeoJSON wajib memiliki properti 'type' (misal: FeatureCollection, Feature, dsb).",
      errors: ["Properti 'type' tidak ditemukan pada root."],
    };
  }

  // 3. FeatureCollection Validation
  if (root.type === 'FeatureCollection') {
    const fc = root as unknown as FeatureCollection;
    if (!Array.isArray(fc.features)) {
      return {
        isValid: false,
        feedback: "FeatureCollection wajib memiliki properti 'features' berupa array.",
        errors: ["Properti 'features' bukan merupakan array."],
      };
    }

    let hasProps = false;
    fc.features.forEach((feature, i) => {
      const path = `features[${i}]`;
      if (!feature || typeof feature !== 'object') {
        errors.push(`${path}: Objek fitur tidak valid.`);
        return;
      }
      if (feature.type !== 'Feature') {
        errors.push(
          `${path}: Tipe objek harus 'Feature', ditemukan '${(feature as unknown as Record<string, unknown>).type}'.`
        );
      }
      if (feature.properties && Object.keys(feature.properties).length > 0) {
        hasProps = true;
      }
      if (feature.geometry) {
        geomTypes.add(feature.geometry.type);
        errors.push(...validateGeometry(feature.geometry, `${path}.geometry`));
      }
    });

    if (errors.length > 0) {
      return {
        isValid: false,
        feedback: `Ditemukan ${errors.length} masalah validasi pada GeoJSON.`,
        errors: errors.slice(0, 10), // Return top 10 errors
      };
    }

    return {
      isValid: true,
      feedback: `GeoJSON valid sempurna (RFC 7946). Berisi ${fc.features.length} fitur (${Array.from(geomTypes).join(', ') || 'Tanpa geometri'}).`,
      stats: {
        featureCount: fc.features.length,
        geometryTypes: Array.from(geomTypes),
        hasProperties: hasProps,
      },
    };
  }

  // 4. Single Feature Validation
  if (root.type === 'Feature') {
    const feat = root as unknown as Feature;
    if (feat.geometry) {
      geomTypes.add(feat.geometry.type);
      errors.push(...validateGeometry(feat.geometry, 'geometry'));
    }
    if (errors.length > 0) {
      return {
        isValid: false,
        feedback: `Fitur GeoJSON tidak valid: ${errors[0]}`,
        errors,
      };
    }
    return {
      isValid: true,
      feedback: `Fitur GeoJSON valid (${feat.geometry?.type || 'Geometry'}).`,
      stats: {
        featureCount: 1,
        geometryTypes: Array.from(geomTypes),
        hasProperties: Boolean(feat.properties && Object.keys(feat.properties).length > 0),
      },
    };
  }

  // 5. Standalone Geometry Validation
  if (VALID_GEOM_TYPES.includes(root.type)) {
    errors.push(...validateGeometry(root as unknown as Geometry, 'geometry'));
    if (errors.length > 0) {
      return {
        isValid: false,
        feedback: `Geometri tidak valid: ${errors[0]}`,
        errors,
      };
    }
    return {
      isValid: true,
      feedback: `Geometri '${root.type}' valid sesuai spesifikasi RFC 7946.`,
    };
  }

  return {
    isValid: false,
    feedback: `Tipe root '${root.type}' bukan GeoJSON yang valid (harus FeatureCollection, Feature, atau Geometry).`,
    errors: [`Tipe root tidak didukung: ${root.type}`],
  };
}
