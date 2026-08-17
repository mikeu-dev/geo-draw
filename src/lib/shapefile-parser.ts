import JSZip from 'jszip';
import proj4 from 'proj4';
import type {
  Feature,
  FeatureCollection,
  Geometry,
  Polygon,
  MultiPolygon,
  LineString,
  MultiLineString,
  Point,
  MultiPoint,
} from 'geojson';

export interface ShapefileParseResult {
  geojson: FeatureCollection;
  featureCount: number;
  fileName?: string;
  shapeType: string;
  projection?: string;
}

export type CoordinateTransformer = (x: number, y: number) => [number, number];

/**
 * Shape Types as defined in the ESRI Shapefile Technical Description
 */
const SHAPE_TYPES: Record<number, string> = {
  0: 'Null Shape',
  1: 'Point',
  3: 'PolyLine',
  5: 'Polygon',
  8: 'MultiPoint',
  11: 'PointZ',
  13: 'PolyLineZ',
  15: 'PolygonZ',
  18: 'MultiPointZ',
  21: 'PointM',
  23: 'PolyLineM',
  25: 'PolygonM',
  28: 'MultiPointM',
};

/**
 * Creates a coordinate transformer function from an ESRI .prj WKT or proj string to EPSG:4326 (WGS84).
 */
export function createProjTransformer(prjText?: string): CoordinateTransformer {
  if (!prjText || !prjText.trim()) {
    return (x: number, y: number) => [x, y];
  }

  const trimmed = prjText.trim();
  // Check if projection is already standard geographic WGS84
  if (
    trimmed === 'EPSG:4326' ||
    trimmed === 'WGS84' ||
    trimmed === '+proj=longlat +datum=WGS84 +no_defs'
  ) {
    return (x: number, y: number) => [x, y];
  }

  try {
    const projConverter = proj4(trimmed, 'EPSG:4326');
    return (x: number, y: number): [number, number] => {
      try {
        const [lng, lat] = projConverter.forward([x, y]);
        if (Number.isFinite(lng) && Number.isFinite(lat)) {
          return [lng, lat];
        }
        return [x, y];
      } catch {
        return [x, y];
      }
    };
  } catch (err) {
    console.warn('Could not initialize projection with proj4, falling back to raw coordinates:', err);
    return (x: number, y: number) => [x, y];
  }
}

/**
 * Parses binary .shp buffer into GeoJSON Geometries with optional coordinate reprojection.
 */
export function parseShpBuffer(
  buffer: ArrayBuffer,
  transformCoord: CoordinateTransformer = (x, y) => [x, y]
): { type: string; geometries: Geometry[] } {
  const view = new DataView(buffer);
  if (buffer.byteLength < 100) {
    throw new Error('File buffer terlalu kecil untuk format ESRI Shapefile yang valid.');
  }

  // File Code (Big Endian): 9994
  const fileCode = view.getInt32(0, false);
  if (fileCode !== 9994) {
    throw new Error('Header Shapefile tidak valid (File Code bukan 9994).');
  }

  // Shape Type (Little Endian at offset 32)
  const shapeTypeInt = view.getInt32(32, true);
  const shapeTypeName = SHAPE_TYPES[shapeTypeInt] || `Unknown (${shapeTypeInt})`;

  const geometries: Geometry[] = [];
  let offset = 100; // Start of records

  while (offset < buffer.byteLength) {
    if (offset + 8 > buffer.byteLength) break;
    // Record header: Record Number (4 bytes big-endian), Content Length (4 bytes big-endian in 16-bit words)
    const contentLength = view.getInt32(offset + 4, false) * 2;
    const recordContentOffset = offset + 8;
    offset += 8;

    if (recordContentOffset + contentLength > buffer.byteLength) break;
    if (contentLength <= 4) {
      offset += contentLength;
      continue;
    }

    const recordShapeType = view.getInt32(recordContentOffset, true);

    if (recordShapeType === 1 || recordShapeType === 11 || recordShapeType === 21) {
      // Point (X, Y)
      const rawX = view.getFloat64(recordContentOffset + 4, true);
      const rawY = view.getFloat64(recordContentOffset + 12, true);
      const [lng, lat] = transformCoord(rawX, rawY);
      const pointGeom: Point = {
        type: 'Point',
        coordinates: [lng, lat],
      };
      geometries.push(pointGeom);
    } else if (recordShapeType === 8 || recordShapeType === 18 || recordShapeType === 28) {
      // MultiPoint
      const numPoints = view.getInt32(recordContentOffset + 36, true);
      const coords: [number, number][] = [];
      let ptOffset = recordContentOffset + 40;
      for (let i = 0; i < numPoints; i++) {
        const rawX = view.getFloat64(ptOffset, true);
        const rawY = view.getFloat64(ptOffset + 8, true);
        coords.push(transformCoord(rawX, rawY));
        ptOffset += 16;
      }
      const multiPt: MultiPoint = {
        type: 'MultiPoint',
        coordinates: coords,
      };
      geometries.push(multiPt);
    } else if (recordShapeType === 3 || recordShapeType === 13 || recordShapeType === 23) {
      // PolyLine (LineString or MultiLineString)
      const numParts = view.getInt32(recordContentOffset + 36, true);
      const numPoints = view.getInt32(recordContentOffset + 40, true);
      const parts: number[] = [];
      let partOffset = recordContentOffset + 44;
      for (let i = 0; i < numParts; i++) {
        parts.push(view.getInt32(partOffset, true));
        partOffset += 4;
      }

      const points: [number, number][] = [];
      let ptOffset = recordContentOffset + 44 + numParts * 4;
      for (let i = 0; i < numPoints; i++) {
        const rawX = view.getFloat64(ptOffset, true);
        const rawY = view.getFloat64(ptOffset + 8, true);
        points.push(transformCoord(rawX, rawY));
        ptOffset += 16;
      }

      if (numParts === 1) {
        const lineGeom: LineString = {
          type: 'LineString',
          coordinates: points,
        };
        geometries.push(lineGeom);
      } else {
        const lines: [number, number][][] = [];
        for (let i = 0; i < numParts; i++) {
          const start = parts[i];
          const end = i < numParts - 1 ? parts[i + 1] : numPoints;
          lines.push(points.slice(start, end));
        }
        const multiLine: MultiLineString = {
          type: 'MultiLineString',
          coordinates: lines,
        };
        geometries.push(multiLine);
      }
    } else if (recordShapeType === 5 || recordShapeType === 15 || recordShapeType === 25) {
      // Polygon or MultiPolygon
      const numParts = view.getInt32(recordContentOffset + 36, true);
      const numPoints = view.getInt32(recordContentOffset + 40, true);
      const parts: number[] = [];
      let partOffset = recordContentOffset + 44;
      for (let i = 0; i < numParts; i++) {
        parts.push(view.getInt32(partOffset, true));
        partOffset += 4;
      }

      const points: [number, number][] = [];
      let ptOffset = recordContentOffset + 44 + numParts * 4;
      for (let i = 0; i < numPoints; i++) {
        const rawX = view.getFloat64(ptOffset, true);
        const rawY = view.getFloat64(ptOffset + 8, true);
        points.push(transformCoord(rawX, rawY));
        ptOffset += 16;
      }

      const rings: [number, number][][] = [];
      for (let i = 0; i < numParts; i++) {
        const start = parts[i];
        const end = i < numParts - 1 ? parts[i + 1] : numPoints;
        const ring = points.slice(start, end);
        // Ensure closure
        if (ring.length > 0) {
          const first = ring[0];
          const last = ring[ring.length - 1];
          if (first[0] !== last[0] || first[1] !== last[1]) {
            ring.push([first[0], first[1]]);
          }
        }
        rings.push(ring);
      }

      if (numParts === 1) {
        const polyGeom: Polygon = {
          type: 'Polygon',
          coordinates: rings,
        };
        geometries.push(polyGeom);
      } else {
        const polyGeom: MultiPolygon = {
          type: 'MultiPolygon',
          coordinates: rings.map((r) => [r]),
        };
        geometries.push(polyGeom);
      }
    }

    offset += contentLength;
  }

  return { type: shapeTypeName, geometries };
}

/**
 * Parses binary .dbf buffer into an array of property record objects with optional encoding.
 */
export function parseDbfBuffer(buffer: ArrayBuffer, encoding = 'utf-8'): Record<string, unknown>[] {
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);
  if (buffer.byteLength < 32) return [];

  const recordCount = view.getInt32(4, true);
  const headerLength = view.getInt16(8, true);
  const recordLength = view.getInt16(10, true);

  // Field descriptors (32 bytes each) start at offset 32
  const fields: { name: string; type: string; length: number }[] = [];
  let fieldOffset = 32;

  while (fieldOffset < headerLength - 1 && bytes[fieldOffset] !== 0x0d) {
    let name = '';
    for (let i = 0; i < 11; i++) {
      const charCode = bytes[fieldOffset + i];
      if (charCode === 0) break;
      name += String.fromCharCode(charCode);
    }
    const type = String.fromCharCode(bytes[fieldOffset + 11]);
    const length = bytes[fieldOffset + 16];

    fields.push({ name: name.trim(), type, length });
    fieldOffset += 32;
  }

  // Resolve encoding (e.g. '1252' -> 'windows-1252', 'utf-8', etc.)
  let cleanEncoding = encoding.trim().toLowerCase();
  if (cleanEncoding === '1252' || cleanEncoding === 'cp1252') {
    cleanEncoding = 'windows-1252';
  } else if (cleanEncoding === 'latin1' || cleanEncoding === 'iso-8859-1') {
    cleanEncoding = 'iso-8859-1';
  }

  let decoder: TextDecoder;
  try {
    decoder = new TextDecoder(cleanEncoding);
  } catch {
    decoder = new TextDecoder('utf-8');
  }

  const records: Record<string, unknown>[] = [];
  let rowOffset = headerLength;

  for (let r = 0; r < recordCount; r++) {
    if (rowOffset + recordLength > buffer.byteLength) break;
    // 1st byte is deleted flag (0x20 = valid, 0x2a = deleted)
    const isDeleted = bytes[rowOffset] === 0x2a;
    if (!isDeleted) {
      const rowProps: Record<string, unknown> = {};
      let colOffset = rowOffset + 1;

      for (const field of fields) {
        const slice = bytes.subarray(colOffset, colOffset + field.length);
        const rawStr = decoder.decode(slice).replace(/\0/g, '').trim();

        if (field.type === 'N' || field.type === 'F') {
          const num = Number(rawStr);
          rowProps[field.name] = isNaN(num) ? rawStr : num;
        } else if (field.type === 'L') {
          rowProps[field.name] = rawStr.toUpperCase() === 'Y' || rawStr.toUpperCase() === 'T';
        } else {
          rowProps[field.name] = rawStr;
        }

        colOffset += field.length;
      }
      records.push(rowProps);
    }
    rowOffset += recordLength;
  }

  return records;
}

/**
 * Parses a zipped Shapefile (.zip) containing .shp, .dbf, and optional .prj and .cpg files.
 */
export async function parseZippedShapefile(zipData: ArrayBuffer | Blob): Promise<ShapefileParseResult> {
  const zip = await JSZip.loadAsync(zipData);
  let shpFile: JSZip.JSZipObject | null = null;
  let dbfFile: JSZip.JSZipObject | null = null;
  let prjFile: JSZip.JSZipObject | null = null;
  let cpgFile: JSZip.JSZipObject | null = null;

  zip.forEach((relativePath, file) => {
    const lower = relativePath.toLowerCase();
    if (lower.endsWith('.shp') && !lower.startsWith('__macosx') && !file.dir) {
      shpFile = file;
    } else if (lower.endsWith('.dbf') && !lower.startsWith('__macosx') && !file.dir) {
      dbfFile = file;
    } else if (lower.endsWith('.prj') && !lower.startsWith('__macosx') && !file.dir) {
      prjFile = file;
    } else if (lower.endsWith('.cpg') && !lower.startsWith('__macosx') && !file.dir) {
      cpgFile = file;
    }
  });

  if (!shpFile) {
    throw new Error('Tidak ditemukan file biner .shp di dalam arsip ZIP.');
  }

  let prjText: string | undefined;
  if (prjFile) {
    try {
      prjText = await (prjFile as JSZip.JSZipObject).async('text');
    } catch (err) {
      console.warn('Gagal membaca file proyeksi .prj:', err);
    }
  }

  let cpgText: string | undefined;
  if (cpgFile) {
    try {
      cpgText = await (cpgFile as JSZip.JSZipObject).async('text');
    } catch (err) {
      console.warn('Gagal membaca file encoding .cpg:', err);
    }
  }

  const transformer = createProjTransformer(prjText);
  const shpBuffer = await (shpFile as JSZip.JSZipObject).async('arraybuffer');
  const { type: shapeType, geometries } = parseShpBuffer(shpBuffer, transformer);

  let propertiesList: Record<string, unknown>[] = [];
  if (dbfFile) {
    try {
      const dbfBuffer = await (dbfFile as JSZip.JSZipObject).async('arraybuffer');
      propertiesList = parseDbfBuffer(dbfBuffer, cpgText);
    } catch (err) {
      console.warn('Gagal membaca atribut .dbf shapefile:', err);
    }
  }

  const features: Feature[] = geometries.map((geom, idx) => ({
    type: 'Feature',
    id: `shp_${idx + 1}`,
    geometry: geom,
    properties: propertiesList[idx] || {},
  }));

  return {
    geojson: {
      type: 'FeatureCollection',
      features,
    },
    featureCount: features.length,
    fileName: (shpFile as JSZip.JSZipObject).name,
    shapeType,
    projection: prjText?.trim(),
  };
}
