import { geoapifyClient } from '../api/geoapifyClient';
import type { Location, RoutingResponse } from '../../types';

export class RoutingService {
  static async getRoute(origin: Location, destination: Location): Promise<{ coordinates: [number, number][] }> {
    try {
      const waypoints = `${origin.lat},${origin.lng}|${destination.lat},${destination.lng}`;
      
      const response = await geoapifyClient.get<RoutingResponse>({
        endpoint: 'routing',
        params: {
          waypoints,
          mode: 'drive',
          format: 'geojson',
          details: 'route_details'
        }
      });

      if (!response?.features?.[0]?.geometry?.coordinates) {
        throw new Error('No valid route found');
      }

      const routeCoordinates = response.features[0].geometry.coordinates;

      if (!Array.isArray(routeCoordinates) || routeCoordinates.length === 0) {
        throw new Error('Invalid route coordinates');
      }

      let coordinates: [number, number][];
      
      if (Array.isArray(routeCoordinates[0][0])) {
        coordinates = (routeCoordinates as [number, number][][])[0];
      } else {
        coordinates = routeCoordinates as [number, number][];
      }

      const convertedCoordinates = coordinates.map(
        ([lon, lat]): [number, number] => [lat, lon]
      );

      return { coordinates: convertedCoordinates };
    } catch (error) {
      throw new Error(`Routing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static getPointsAlongRoute(coordinates: [number, number][], numPoints: number): Location[] {
    if (!coordinates || coordinates.length < 2) {
      throw new Error('Not enough coordinates to generate points');
    }

    const points: Location[] = [];
    const step = Math.max(1, Math.floor(coordinates.length / numPoints));

    points.push({ lat: coordinates[0][0], lng: coordinates[0][1] });

    for (let i = step; i < coordinates.length - step; i += step) {
      points.push({
        lat: coordinates[i][0],
        lng: coordinates[i][1]
      });
    }

    const last = coordinates[coordinates.length - 1];
    if (!points.find(p => p.lat === last[0] && p.lng === last[1])) {
      points.push({ lat: last[0], lng: last[1] });
    }

    return points;
  }
}