import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import { parseShpBuffer, parseDbfBuffer, parseZippedShapefile } from '@/lib/shapefile-parser';

describe('shapefile-parser', () => {
  /**
   * Helper to create a valid synthetic Point SHP buffer
   */
  function createMockPointShpBuffer(points: [number, number][]): ArrayBuffer {
    const recordLengthBytes = 8 + 20; // 8 bytes header + 4 byte shapeType + 16 byte coords = 28 bytes
    const totalBytes = 100 + points.length * recordLengthBytes;
    const buffer = new ArrayBuffer(totalBytes);
    const view = new DataView(buffer);

    // 100-byte Main Header
    view.setInt32(0, 9994, false); // File code Big-Endian
    view.setInt32(24, totalBytes / 2, false); // File length in 16-bit words Big-Endian
    view.setInt32(28, 1000, true); // Version Little-Endian
    view.setInt32(32, 1, true); // Shape type: 1 (Point)

    // Records
    let offset = 100;
    points.forEach(([x, y], idx) => {
      view.setInt32(offset, idx + 1, false); // Record number Big-Endian
      view.setInt32(offset + 4, 10, false); // Content length (20 bytes = 10 words) Big-Endian
      view.setInt32(offset + 8, 1, true); // Shape type: 1 (Point)
      view.setFloat64(offset + 12, x, true); // X Little-Endian
      view.setFloat64(offset + 20, y, true); // Y Little-Endian
      offset += recordLengthBytes;
    });

    return buffer;
  }

  /**
   * Helper to create a mock DBF buffer with 'NAME' column
   */
  function createMockDbfBuffer(names: string[]): ArrayBuffer {
    const headerLength = 32 + 32 + 1; // Main header (32) + 1 Field (32) + Terminator (1) = 65 bytes
    const recordLength = 1 + 20; // Delete flag (1) + NAME string (20) = 21 bytes
    const totalBytes = headerLength + names.length * recordLength;
    const buffer = new ArrayBuffer(totalBytes);
    const view = new DataView(buffer);
    const bytes = new Uint8Array(buffer);

    view.setUint8(0, 3); // dBase III version
    view.setInt32(4, names.length, true); // Record count
    view.setInt16(8, headerLength, true); // Header length
    view.setInt16(10, recordLength, true); // Record length

    // Field 1: NAME (type 'C', length 20)
    const fieldName = 'NAME';
    for (let i = 0; i < fieldName.length; i++) {
      bytes[32 + i] = fieldName.charCodeAt(i);
    }
    bytes[32 + 11] = 'C'.charCodeAt(0);
    bytes[32 + 16] = 20; // Length

    // Header terminator
    bytes[64] = 0x0d;

    // Records
    let offset = headerLength;
    names.forEach((name) => {
      bytes[offset] = 0x20; // Not deleted
      for (let i = 0; i < Math.min(name.length, 20); i++) {
        bytes[offset + 1 + i] = name.charCodeAt(i);
      }
      offset += recordLength;
    });

    return buffer;
  }

  it('should parse binary Point SHP buffer into GeoJSON points', () => {
    const mockPoints: [number, number][] = [
      [106.8271, -6.1754],
      [107.6191, -6.9175],
    ];

    const shpBuffer = createMockPointShpBuffer(mockPoints);
    const result = parseShpBuffer(shpBuffer);

    expect(result.type).toBe('Point');
    expect(result.geometries.length).toBe(2);
    expect(result.geometries[0].type).toBe('Point');
    if (result.geometries[0].type === 'Point') {
      expect(result.geometries[0].coordinates[0]).toBeCloseTo(106.8271, 4);
      expect(result.geometries[0].coordinates[1]).toBeCloseTo(-6.1754, 4);
    }
  });

  it('should parse binary DBF buffer into property records', () => {
    const mockNames = ['Jakarta Monas', 'Bandung Gedung Sate'];
    const dbfBuffer = createMockDbfBuffer(mockNames);
    const records = parseDbfBuffer(dbfBuffer);

    expect(records.length).toBe(2);
    expect(records[0].NAME).toBe('Jakarta Monas');
    expect(records[1].NAME).toBe('Bandung Gedung Sate');
  });

  it('should parse a zipped Shapefile archive into a FeatureCollection', async () => {
    const mockPoints: [number, number][] = [
      [106.8271, -6.1754],
      [107.6191, -6.9175],
    ];
    const mockNames = ['Jakarta Monas', 'Bandung Gedung Sate'];

    const shpBuffer = createMockPointShpBuffer(mockPoints);
    const dbfBuffer = createMockDbfBuffer(mockNames);

    const zip = new JSZip();
    zip.file('monuments.shp', shpBuffer);
    zip.file('monuments.dbf', dbfBuffer);
    const zipArrayBuffer = await zip.generateAsync({ type: 'arraybuffer' });

    const parsed = await parseZippedShapefile(zipArrayBuffer);
    expect(parsed.featureCount).toBe(2);
    expect(parsed.geojson.type).toBe('FeatureCollection');
    expect(parsed.geojson.features.length).toBe(2);
    expect(parsed.geojson.features[0].properties?.NAME).toBe('Jakarta Monas');
  });
});
