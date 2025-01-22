import { Restaurant } from '../../types';

const PROXY_URL = '/.netlify/functions/tripadvisor-proxy';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

interface TripAdvisorLocation {
  location_id: string;
  name: string;
  rating: number;
  num_reviews: number;
  address_obj: {
    street1: string;
    street2: string;
    city: string;
    state: string;
    country: string;
    address_string: string;
  };
  website: string;
  phone: string;
  latitude: string;
  longitude: string;
  photos?: any[];
  details?: {
    rating: number;
    num_reviews: number;
    website: string;
    phone: string;
    address_obj: {
      address_string: string;
    };
    photos?: any[];
  };
}

interface TripAdvisorResponse {
  data: {
    location_id: string;
    name: string;
    latitude?: string;
    longitude?: string;
    distance?: string;
    address_obj?: {
      street1: string;
      city: string;
      address_string: string;
    };
    website?: string;
    phone?: string;
    details: {
      rating: string;
      num_reviews: string;
      price_level?: string;
      website?: string;
      phone?: string;
      address_obj?: {
        address_string: string;
      };
      photo_count?: number;
      cuisine?: Array<{ name: string }>;
    };
  };
}

export class TripAdvisorClient {
  private static async delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private static async makeRequest(method: string, path: string, body?: any): Promise<any> {
    try {
      const response = await fetch(path, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  static async searchLocation(name: string, lat: number, lon: number): Promise<TripAdvisorResponse | null> {
    try {
      const response = await this.makeRequest('POST', PROXY_URL, {
        name,
        lat,
        lon
      });

      if (!response) {
        console.log('No TripAdvisor results found for:', name);
        return null;
      }

      return response as TripAdvisorResponse;
    } catch (error) {
      console.error('TripAdvisor search failed:', error);
      return null;
    }
  }

  static async enrichRestaurantData(restaurant: Restaurant): Promise<Restaurant> {
    try {
      if (!restaurant.lat || !restaurant.lon) {
        console.error('Missing coordinates for restaurant:', restaurant.name);
        return restaurant;
      }

      const tripAdvisorData = await this.searchLocation(restaurant.name, restaurant.lat, restaurant.lon);

      if (!tripAdvisorData || !tripAdvisorData.data) {
        return restaurant;
      }

      console.log('TripAdvisor raw data:', tripAdvisorData);

      const data = tripAdvisorData.data;
      // Get the data from the details object which contains the enriched information
      const details = data.details;
      if (!details) {
        console.log('No details found in response for:', restaurant.name);
        return restaurant;
      }

      // Create enriched restaurant data
      const enrichedRestaurant: Restaurant = {
        ...restaurant,
        locationId: data.location_id,
        rating: details.rating ? parseFloat(details.rating) : undefined,
        reviews: details.num_reviews ? parseInt(details.num_reviews) : undefined,
        priceLevel: details.price_level,
        website: details.website || data.website,
        phoneNumber: details.phone || data.phone,
        address: details.address_obj?.address_string || (data.address_obj ? `${data.address_obj.street1}, ${data.address_obj.city}` : undefined),
        photos: details.photo_count || 0,
        cuisine: details.cuisine?.map(c => ({ name: c.name })) || [],
        businessStatus: 'OPERATIONAL',
        location: {
          lat: parseFloat(data.latitude || restaurant.lat.toString()),
          lng: parseFloat(data.longitude || restaurant.lon.toString())
        }
      };

      console.log('Successfully enriched restaurant:', {
        name: enrichedRestaurant.name,
        rating: enrichedRestaurant.rating,
        reviews: enrichedRestaurant.reviews,
        priceLevel: enrichedRestaurant.priceLevel,
        website: enrichedRestaurant.website,
        address: enrichedRestaurant.address,
        cuisine: enrichedRestaurant.cuisine
      });

      return enrichedRestaurant;
    } catch (error) {
      console.error('Failed to enrich restaurant data:', restaurant.name, error);
      return restaurant;
    }
  }
}