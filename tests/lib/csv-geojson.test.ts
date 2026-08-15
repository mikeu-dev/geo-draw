import { describe, it, expect } from 'vitest';
import { csvToGeoJson, geoJsonToCsv } from '@/lib/csv-geojson';
import type { FeatureCollection, Point } from 'geojson';

describe('csv-geojson utility', () => {
  it('should convert standard CSV with lat/lon to GeoJSON Point FeatureCollection', () => {
    const csv = `name,latitude,longitude,category
"Monas",-6.1754,106.8272,"Monument"
"Bundaran HI",-6.1950,106.8230,"Landmark"`;

    const result = csvToGeoJson(csv);
    expect(result.type).toBe('FeatureCollection');
    expect(result.features).toHaveLength(2);

    const f1 = result.features[0];
    expect(f1.geometry.type).toBe('Point');
    expect(f1.geometry.coordinates).toEqual([106.8272, -6.1754]);
    expect(f1.properties?.name).toBe('Monas');
    expect(f1.properties?.category).toBe('Monument');
  });

  it('should support alternative header aliases (lat/lng, x/y, bujur/lintang)', () => {
    const csv = `title,lat,lng
"Location A",-6.5,107.5`;

    const result = csvToGeoJson(csv);
    expect(result.features).toHaveLength(1);
    expect(result.features[0].geometry.coordinates).toEqual([107.5, -6.5]);
  });

  it('should throw helpful error when coordinate headers are missing', () => {
    const csv = `name,city,country
"Test",Jakarta,Indonesia`;

    expect(() => csvToGeoJson(csv)).toThrowError(/Kolom Latitude dan Longitude tidak ditemukan/);
  });

  it('should convert GeoJSON FeatureCollection to CSV string', () => {
    const geojson: FeatureCollection<Point> = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          id: 'point_1',
          properties: { name: 'Bandung', elevation: 768 },
          geometry: {
            type: 'Point',
            coordinates: [107.6191, -6.9175],
          },
        },
      ],
    };

    const csv = geoJsonToCsv(geojson);
    expect(csv).toContain('id,geometry_type,latitude,longitude,name,elevation');
    expect(csv).toContain('"point_1"');
    expect(csv).toContain('"-6.9175"');
    expect(csv).toContain('"107.6191"');
    expect(csv).toContain('"Bandung"');
  });
});
