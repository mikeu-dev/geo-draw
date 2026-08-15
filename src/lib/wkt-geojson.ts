import WKT from 'ol/format/WKT';
import GeoJSON from 'ol/format/GeoJSON';
import type { FeatureCollection, Geometry } from 'geojson';

const wktFormat = new WKT();
const geojsonFormat = new GeoJSON();

/**
 * Convert WKT string (single geometry or multiline WKT) to GeoJSON FeatureCollection
 */
export function wktToGeoJson(wktString: string): FeatureCollection {
  const trimmed = wktString.trim();
  if (!trimmed) {
    throw new Error('String WKT tidak boleh kosong.');
  }

  // Support multiline WKT or single WKT geometry
  const lines = trimmed
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('#') && !l.startsWith('--'));

  const features = lines.map((line, idx) => {
    try {
      const olFeature = wktFormat.readFeature(line, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:4326',
      });
      const geojsonObj = geojsonFormat.writeFeatureObject(olFeature);
      geojsonObj.id = `wkt_feature_${idx + 1}`;
      return geojsonObj;
    } catch {
      // Try reading as raw geometry if readFeature fails
      const olGeom = wktFormat.readGeometry(line, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:4326',
      });
      return {
        type: 'Feature' as const,
        id: `wkt_feature_${idx + 1}`,
        properties: {},
        geometry: JSON.parse(geojsonFormat.writeGeometry(olGeom)) as Geometry,
      };
    }
  });

  return {
    type: 'FeatureCollection',
    features,
  };
}

/**
 * Convert GeoJSON FeatureCollection to WKT string (one WKT per feature geometry)
 */
export function geoJsonToWkt(geojson: FeatureCollection | string): string {
  const parsed: FeatureCollection =
    typeof geojson === 'string' ? JSON.parse(geojson) : geojson;

  if (!parsed || !Array.isArray(parsed.features) || parsed.features.length === 0) {
    return '';
  }

  const wktLines: string[] = [];

  parsed.features.forEach((feature) => {
    if (feature.geometry) {
      const olFeature = geojsonFormat.readFeature(feature, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:4326',
      });
      const wkt = wktFormat.writeFeature(olFeature, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:4326',
      });
      wktLines.push(wkt);
    }
  });

  return wktLines.join('\n');
}
