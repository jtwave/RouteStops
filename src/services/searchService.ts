import { GeocodingService } from './geocoding/geocodingService';
import { RoutingService } from './routing/routingService';
import { PlacesService } from './places/placesService';
import type { SearchParams, SearchResult, SearchMode } from '../types';

export async function searchPlaces(
  params: SearchParams,
  mode: SearchMode
): Promise<SearchResult> {
  try {
    // 1. Geocode both addresses
    const [originLocation, destinationLocation] = await Promise.all([
      GeocodingService.geocodeAddress(params.origin),
      GeocodingService.geocodeAddress(params.destination)
    ]);

    if (mode === 'meetup') {
      // Calculate midpoint for meetup mode
      const center = GeocodingService.calculateMidpoint(originLocation, destinationLocation);

      // Search for places around the midpoint
      const places = await PlacesService.searchNearby(
        center,
        params.placeType,
        params.radius || 5,
        params.maxLocations || 20,
        originLocation
      ).catch(error => {
        console.error('Places search failed:', error);
        return [];
      });

      return {
        places,
        center,
        mode: 'meetup',
        originLocation: [originLocation.lat, originLocation.lng],
        destinationLocation: [destinationLocation.lat, destinationLocation.lng]
      };
    } else {
      // Get route for route mode
      const route = await RoutingService.getRoute(originLocation, destinationLocation);

      // Get points along the route for searching
      const searchPoints = RoutingService.getPointsAlongRoute(
        route.coordinates,
        Math.min(5, Math.ceil(params.maxLocations! / 2))
      );

      // Skip initial portion if specified
      if (params.skipFromStart) {
        const skipRatio = params.skipFromStart / 100;
        searchPoints.splice(0, Math.floor(searchPoints.length * skipRatio));
      }

      // Search for places near each point with error handling
      const placesPromises = searchPoints.map(point =>
        PlacesService.searchNearby(
          point,
          params.placeType,
          params.distanceOffRoute || 2,
          Math.ceil(params.maxLocations! / searchPoints.length),
          originLocation,
          'route',
          route
        ).catch(error => {
          console.error('Places search failed for point:', point, error);
          return [];
        })
      );

      const placesArrays = await Promise.all(placesPromises);
      const allPlaces = placesArrays.flat();

      // Deduplicate places and sort by rating
      const seenPlaceIds = new Set<string>();
      const uniquePlaces = allPlaces
        .filter(place => {
          if (!place.place_id || seenPlaceIds.has(place.place_id)) return false;
          seenPlaceIds.add(place.place_id);
          return true;
        })
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, params.maxLocations);

      // Calculate center point for map
      const centerPoint = searchPoints[Math.floor(searchPoints.length / 2)];

      return {
        places: uniquePlaces,
        route,
        center: centerPoint,
        mode: 'route',
        originLocation: [originLocation.lat, originLocation.lng],
        destinationLocation: [destinationLocation.lat, destinationLocation.lng]
      };
    }
  } catch (error) {
    console.error('Search failed:', error);
    throw new Error(
      error instanceof Error
        ? error.message
        : 'Failed to search for places. Please try again.'
    );
  }
}