export interface Location {
  lat: number;
  lng: number;
}

export interface Restaurant {
  locationId?: string;
  name: string;
  lat: number;
  lon: number;
  rating?: number;
  reviews?: number;
  priceLevel?: string;
  website?: string;
  phoneNumber?: string;
  address?: string;
  photos?: number;
  cuisine?: { name: string }[];
  businessStatus?: string;
  location?: {
    lat: number;
    lng: number;
  };
  distance?: string;
  distanceInfo?: {
    distance: string;
  };
  // Legacy fields for Geoapify compatibility
  place_id?: string;
  address_line1?: string;
  address_line2?: string;
  categories?: string[];
  user_ratings_total?: number;
  // TripAdvisor specific fields
  address_obj?: {
    address_string: string;
  };
  phone?: string;
}

export interface GeocodeResponse {
  results: Array<{
    lat: number;
    lon: number;
    formatted: string;
  }>;
}

export interface RoutingResponse {
  features: Array<{
    type: string;
    geometry: {
      type: string;
      coordinates: Array<[number, number]>;
    };
  }>;
}

export interface PlacesResponse {
  features: Array<{
    properties: {
      place_id: string;
      name: string;
      lat: number;
      lon: number;
      rating?: number;
      user_ratings?: number;
      address_line1?: string;
      address_line2?: string;
      categories?: string[];
      website?: string;
      datasource?: {
        raw?: {
          price_level?: number;
          opening_hours?: string[];
          phone?: string;
        };
      };
    };
  }>;
}

export interface TripAdvisorResponse {
  location_id: string;
  name: string;
  latitude: string;
  longitude: string;
  rating: number;
  num_reviews: number;
  price_level: string;
  website: string;
  phone: string;
  address_obj: {
    address_string: string;
  };
  photo_count: number;
  cuisine?: Array<{ name: string }>;
  details?: TripAdvisorResponse;
}

export class GeoapifyError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'GeoapifyError';
  }
}

export type SearchMode = 'route' | 'meetup';

export interface SearchParams {
  origin: string;
  destination: string;
  placeType: string;
  distanceOffRoute?: number;
  skipFromStart?: number;
  maxLocations?: number;
  radius?: number;
}

export interface SearchResult {
  places: Restaurant[];
  route?: { coordinates: [number, number][] };
  center: Location;
  mode?: SearchMode;
  originLocation?: [number, number];
  destinationLocation?: [number, number];
}

export const PLACE_CATEGORIES = [
  { id: "catering.restaurant", label: "Restaurants", icon: "utensils" },
  { id: "commercial.shopping_mall", label: "Shopping", icon: "shopping-bag" },
  { id: "leisure.park", label: "Parks", icon: "mountain" },
  { id: "tourism.attraction", label: "Attractions", icon: "map-pin" },
  { id: "tourism.museum", label: "Museums", icon: "building" },
  { id: "catering.cafe", label: "Cafes", icon: "coffee" }
];