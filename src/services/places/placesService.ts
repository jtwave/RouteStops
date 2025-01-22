import { geoapifyClient } from '../api/geoapifyClient';
import { TripAdvisorClient } from '../api/tripAdvisorClient';
import type { Location, Restaurant, PlacesResponse, SearchMode } from '../../types';

export class PlacesService {
  private static validateCategory(category: string): string {
    const validCategories = [
      'catering.restaurant',
      'catering.restaurant.pizza',
      'catering.restaurant.italian',
      'catering.restaurant.chinese',
      'catering.restaurant.sushi',
      'commercial.shopping_mall',
      'leisure.park',
      'tourism.attraction',
      'tourism.museum',
      'catering.cafe'
    ];

    if (validCategories.includes(category)) {
      return category;
    }

    return 'catering.restaurant';
  }

  static async searchNearby(
    location: Location,
    category: string,
    radius: number,
    limit: number,
    originLocation: Location,
    mode: SearchMode = 'route',
    route?: { coordinates: [number, number][] }
  ): Promise<Restaurant[]> {
    try {
      if (!location || isNaN(location.lat) || isNaN(location.lng)) {
        throw new Error("Invalid location coordinates");
      }

      // Convert radius from miles to meters (1 mile ≈ 1609.34 meters)
      const radiusInMeters = radius * 1609.34;
      const baseRadius = Math.min(radiusInMeters, 5000);
      const validCategory = this.validateCategory(category);
      const searchPoints: Location[] = [location];

      if (radiusInMeters > baseRadius) {
        const gridSize = Math.ceil(radiusInMeters / baseRadius);
        const latStep = 0.05;
        const lngStep = 0.05;

        for (let i = -gridSize; i <= gridSize; i++) {
          for (let j = -gridSize; j <= gridSize; j++) {
            if (i === 0 && j === 0) continue;
            searchPoints.push({
              lat: location.lat + (i * latStep),
              lng: location.lng + (j * lngStep)
            });
          }
        }
      }

      const searchPromises = searchPoints.map(point => {
        const params = {
          categories: validCategory,
          filter: `circle:${point.lng},${point.lat},${baseRadius}`,
          bias: `proximity:${point.lng},${point.lat}`,
          limit: Math.min(limit, 50).toString(),
          lang: 'en',
          conditions: 'named',
          fields: 'formatted,name,place_id,lat,lon,categories,details,datasource,website,address_line1,address_line2'
        };

        return geoapifyClient.get<PlacesResponse>({
          endpoint: 'places',
          params
        }).catch(error => {
          console.error('Places API error:', error);
          return { features: [] };
        });
      });

      const responses = await Promise.all(searchPromises);
      const seenPlaceIds = new Set<string>();
      const places: Restaurant[] = [];

      // Process places
      for (const response of responses) {
        if (response?.features) {
          for (const feature of response.features) {
            const props = feature.properties;
            if (props && props.name && props.lat && props.lon && !seenPlaceIds.has(props.place_id)) {
              seenPlaceIds.add(props.place_id);

              // Create restaurant object without rating (will be added by TripAdvisor)
              const restaurant: Restaurant = {
                place_id: props.place_id,
                locationId: props.place_id,
                name: props.name,
                lat: props.lat,
                lon: props.lon,
                location: {
                  lat: props.lat,
                  lng: props.lon
                },
                address_line1: props.address_line1,
                address_line2: props.address_line2,
                categories: props.categories,
                website: props.website,
                photos: 0,
                businessStatus: 'OPERATIONAL',
                distance: mode === 'route' && route
                  ? this.calculateRouteDistance(
                    { lat: props.lat, lng: props.lon },
                    route.coordinates
                  )
                  : this.calculateDistanceFromOrigin(
                    { lat: props.lat, lng: props.lon },
                    originLocation
                  )
              };

              places.push(restaurant);
            }
          }
        }
      }

      // Enrich with TripAdvisor data
      const enrichedPlaces = await Promise.all(
        places.map(async place => {
          try {
            const originalDistance = place.distance;  // Save original distance
            const enrichedPlace = await TripAdvisorClient.enrichRestaurantData(place);
            console.log('Enriched place data:', {
              name: enrichedPlace.name,
              rating: enrichedPlace.rating,
              reviews: enrichedPlace.reviews,
              priceLevel: enrichedPlace.priceLevel,
              website: enrichedPlace.website,
              address: enrichedPlace.address,
              cuisine: enrichedPlace.cuisine,
              distance: originalDistance  // Log the preserved distance
            });
            return {
              ...place,
              ...enrichedPlace,
              // Ensure these fields are explicitly set
              rating: enrichedPlace.rating || 0,
              reviews: enrichedPlace.reviews || 0,
              priceLevel: enrichedPlace.priceLevel || '',
              website: enrichedPlace.website || '',
              address: enrichedPlace.address || place.address_line1,
              cuisine: enrichedPlace.cuisine || [],
              distance: originalDistance  // Preserve our original distance
            };
          } catch (error) {
            console.error('Failed to enrich place:', place.name, error);
            return place;
          }
        })
      );

      // Sort by TripAdvisor rating and distance
      const sortedPlaces = enrichedPlaces
        .filter(place => place !== null)
        .sort((a, b) => {
          const ratingA = parseFloat(a.rating?.toString() || '0');
          const ratingB = parseFloat(b.rating?.toString() || '0');
          const distanceA = parseFloat(a.distance || '0');
          const distanceB = parseFloat(b.distance || '0');
          return (ratingB - ratingA) * 2 + (distanceA - distanceB);
        })
        .slice(0, limit);

      console.log('Final sorted places:', sortedPlaces.map(place => ({
        name: place.name,
        rating: place.rating,
        reviews: place.reviews,
        priceLevel: place.priceLevel,
        website: place.website,
        address: place.address,
        cuisine: place.cuisine
      })));

      return sortedPlaces;
    } catch (error) {
      console.error('Search failed:', error);
      throw error;
    }
  }

  static calculateRouteDistance(point: Location, routeCoordinates: [number, number][]): string {
    // Find the closest point on the route to the restaurant
    let minDistance = Infinity;
    let closestSegmentIndex = 0;
    let closestPoint: Location | null = null;
    let prevPoint = routeCoordinates[0];

    // First find which segment of the route is closest to the restaurant
    for (let i = 1; i < routeCoordinates.length; i++) {
      const currentPoint = routeCoordinates[i];
      const projectedPoint = this.projectPointOnSegment(
        point,
        { lat: prevPoint[0], lng: prevPoint[1] },
        { lat: currentPoint[0], lng: currentPoint[1] }
      );

      const distanceToSegment = this.calculateHaversineDistance(point, projectedPoint);

      if (distanceToSegment < minDistance) {
        minDistance = distanceToSegment;
        closestSegmentIndex = i - 1;
        closestPoint = projectedPoint;
      }

      prevPoint = currentPoint;
    }

    // Now calculate the distance along the route from start to the closest point
    let totalDistance = 0;

    // Add up distances for all complete segments before the closest one
    for (let i = 0; i < closestSegmentIndex; i++) {
      totalDistance += this.calculateHaversineDistance(
        { lat: routeCoordinates[i][0], lng: routeCoordinates[i][1] },
        { lat: routeCoordinates[i + 1][0], lng: routeCoordinates[i + 1][1] }
      );
    }

    // Add the partial distance to the projected point on the closest segment
    if (closestPoint) {
      totalDistance += this.calculateHaversineDistance(
        { lat: routeCoordinates[closestSegmentIndex][0], lng: routeCoordinates[closestSegmentIndex][1] },
        closestPoint
      );
    }

    return `${totalDistance.toFixed(1)} mi`;
  }

  private static calculateHaversineDistance(point1: Location, point2: Location): number {
    const R = 3959; // Earth's radius in miles
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLon = (point2.lng - point1.lng) * Math.PI / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static projectPointOnSegment(point: Location, start: Location, end: Location): Location {
    const dx = end.lng - start.lng;
    const dy = end.lat - start.lat;
    const len2 = dx * dx + dy * dy;

    if (len2 === 0) {
      return start;
    }

    const t = Math.max(0, Math.min(1, ((point.lng - start.lng) * dx + (point.lat - start.lat) * dy) / len2));

    return {
      lat: start.lat + t * dy,
      lng: start.lng + t * dx
    };
  }

  static calculateDistanceFromOrigin(point: Location, origin: Location): string {
    const distance = this.calculateHaversineDistance(point, origin);
    return `${distance.toFixed(1)} mi`;
  }
}