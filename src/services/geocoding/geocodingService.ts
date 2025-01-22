import { geoapifyClient } from '../api/geoapifyClient';
import type { Location, GeocodeResponse } from '../../types';

export class GeocodingService {
  static async geocodeAddress(address: string): Promise<Location> {
    try {
      const decodedAddress = decodeURIComponent(address);
      
      const response = await geoapifyClient.get<GeocodeResponse>({
        endpoint: 'geocode/search',
        params: {
          text: decodedAddress,
          format: 'json',
          filter: 'countrycode:us,ca',
          bias: 'countrycode:us,ca',
          limit: '1',
          lang: 'en'
        }
      });

      if (!response?.results?.length) {
        throw new Error(`No results found for address: ${decodedAddress}`);
      }

      const result = response.results[0];
      
      return {
        lat: result.lat,
        lng: result.lon
      };
    } catch (error) {
      throw new Error(`Geocoding failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static calculateMidpoint(point1: Location, point2: Location): Location {
    const lat1 = point1.lat * Math.PI / 180;
    const lon1 = point1.lng * Math.PI / 180;
    const lat2 = point2.lat * Math.PI / 180;
    const lon2 = point2.lng * Math.PI / 180;

    const Bx = Math.cos(lat2) * Math.cos(lon2 - lon1);
    const By = Math.cos(lat2) * Math.sin(lon2 - lon1);

    const midLat = Math.atan2(
      Math.sin(lat1) + Math.sin(lat2),
      Math.sqrt((Math.cos(lat1) + Bx) * (Math.cos(lat1) + Bx) + By * By)
    );
    const midLon = lon1 + Math.atan2(By, Math.cos(lat1) + Bx);

    return {
      lat: midLat * 180 / Math.PI,
      lng: midLon * 180 / Math.PI
    };
  }
}