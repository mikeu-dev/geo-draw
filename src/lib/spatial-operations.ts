import * as turf from '@turf/turf';
import type { Feature, FeatureCollection, Geometry, Polygon, MultiPolygon, LineString, MultiLineString } from 'geojson';

export type SpatialUnit = 'meters' | 'kilometers' | 'miles' | 'feet';

export interface GeometryMetrics {
  areaM2: number;
  areaHa: number;
  areaKm2: number;
  lengthM: number;
  perimeterM: number;
  centroid: [number, number]; // [lon, lat]
  bbox: [number, number, number, number]; // [minX, minY, maxX, maxY]
}

/**
 * Calculates metric properties of a GeoJSON Feature or Geometry in EPSG:4326
 */
export function calculateGeometryMetrics(
  featureOrGeom: Feature<Geometry> | Geometry
): GeometryMetrics {
  const geom: Geometry = featureOrGeom.type === 'Feature' ? featureOrGeom.geometry : featureOrGeom;
  let areaM2 = 0;
  let lengthM = 0;
  let perimeterM = 0;

  try {
    if (geom.type === 'Polygon' || geom.type === 'MultiPolygon') {
      areaM2 = turf.area(geom);
      // Perimeter
      perimeterM = turf.length(turf.feature(geom as Polygon | MultiPolygon), { units: 'meters' });
    } else if (geom.type === 'LineString' || geom.type === 'MultiLineString') {
      lengthM = turf.length(turf.feature(geom as LineString | MultiLineString), { units: 'meters' });
    }
  } catch {
    // Graceful fallback for non-polygon/line types
  }

  let centerCoord: [number, number] = [0, 0];
  try {
    const centerPoint = turf.centroid(featureOrGeom as turf.AllGeoJSON);
    centerCoord = centerPoint.geometry.coordinates as [number, number];
  } catch {
    // Centroid calculation fallback
  }

  let bbox: [number, number, number, number] = [0, 0, 0, 0];
  try {
    bbox = turf.bbox(featureOrGeom as turf.AllGeoJSON) as [number, number, number, number];
  } catch {
    // Bbox fallback
  }

  return {
    areaM2: Math.round(areaM2 * 100) / 100,
    areaHa: Math.round((areaM2 / 10000) * 1000) / 1000,
    areaKm2: Math.round((areaM2 / 1000000) * 10000) / 10000,
    lengthM: Math.round(lengthM * 100) / 100,
    perimeterM: Math.round(perimeterM * 100) / 100,
    centroid: [Math.round(centerCoord[0] * 1000000) / 1000000, Math.round(centerCoord[1] * 1000000) / 1000000],
    bbox,
  };
}

/**
 * Generates buffer polygons around features in a GeoJSON dataset
 */
export function generateBuffer(
  geojson: FeatureCollection | Feature<Geometry>,
  distance: number,
  units: SpatialUnit = 'meters'
): FeatureCollection<Polygon | MultiPolygon> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffered = turf.buffer(geojson as any, distance, { units });
  if (!buffered) {
    return { type: 'FeatureCollection', features: [] };
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((buffered as any).type === 'Feature') {
    return {
      type: 'FeatureCollection',
      features: [buffered as Feature<Polygon | MultiPolygon>],
    };
  }
  return buffered as unknown as FeatureCollection<Polygon | MultiPolygon>;
}

/**
 * Simplifies geometries using the Douglas-Peucker algorithm
 */
export function simplifyGeoJSON<T extends FeatureCollection | Feature<Geometry>>(
  geojson: T,
  tolerance: number = 0.001,
  highQuality: boolean = false
): T {
  return turf.simplify(geojson as turf.AllGeoJSON, {
    tolerance,
    highQuality,
    mutate: false,
  }) as T;
}

/**
 * Generates the Convex Hull polygon encompassing all features in a collection
 */
export function generateConvexHull(
  geojson: FeatureCollection
): Feature<Polygon> | null {
  return turf.convex(geojson);
}

/**
 * Extracts centroids as Point features from all geometries in a collection
 */
export function generateCentroids(
  geojson: FeatureCollection
): FeatureCollection {
  const points = geojson.features.map((f, i) => {
    const pt = turf.centroid(f);
    pt.properties = {
      ...(f.properties || {}),
      _originalId: f.id ?? i,
      _type: 'centroid',
    };
    pt.id = `centroid_${f.id ?? i}_${Date.now()}`;
    return pt;
  });

  return {
    type: 'FeatureCollection',
    features: points,
  };
}

/**
 * Solves self-intersecting polygon kinks by splitting into valid sub-polygons
 */
export function unkinkPolygons(
  geojson: FeatureCollection
): FeatureCollection<Polygon> {
  const cleanFeatures: Feature<Polygon>[] = [];

  for (const f of geojson.features) {
    if (f.geometry && (f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon')) {
      try {
        const unkinked = turf.unkinkPolygon(f as Feature<Polygon | MultiPolygon>);
        cleanFeatures.push(...unkinked.features);
      } catch {
        // If unkink fails, retain the original if it is a polygon
        if (f.geometry.type === 'Polygon') {
          cleanFeatures.push(f as Feature<Polygon>);
        }
      }
    }
  }

  return {
    type: 'FeatureCollection',
    features: cleanFeatures,
  };
}

/**
 * Merges multiple overlapping or adjacent polygons into a single unified geometry
 */
export function booleanUnionPolygons(
  geojson: FeatureCollection
): Feature<Polygon | MultiPolygon> | null {
  const polygons = geojson.features.filter(
    (f) => f.geometry && (f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon')
  ) as Feature<Polygon | MultiPolygon>[];

  if (polygons.length === 0) return null;
  if (polygons.length === 1) return polygons[0];

  try {
    return turf.union(turf.featureCollection(polygons));
  } catch (err) {
    console.error('Failed to compute boolean union:', err);
    return null;
  }
}

/**
 * Computes intersection between two polygon features
 */
export function booleanIntersectPolygons(
  poly1: Feature<Polygon | MultiPolygon>,
  poly2: Feature<Polygon | MultiPolygon>
): Feature<Polygon | MultiPolygon> | null {
  try {
    return turf.intersect(turf.featureCollection([poly1, poly2]));
  } catch (err) {
    console.error('Failed to compute boolean intersect:', err);
    return null;
  }
}

/**
 * Computes geometric difference (poly1 minus poly2)
 */
export function booleanDifferencePolygons(
  poly1: Feature<Polygon | MultiPolygon>,
  poly2: Feature<Polygon | MultiPolygon>
): Feature<Polygon | MultiPolygon | Geometry> | null {
  try {
    return turf.difference(turf.featureCollection([poly1, poly2]));
  } catch (err) {
    console.error('Failed to compute boolean difference:', err);
    return null;
  }
}
