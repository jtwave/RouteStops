import type { Restaurant } from '../types';

const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes
const placeCache = new Map<string, { data: any, timestamp: number }>();
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

function getCachedData<T>(key: string): T | null {
  const cached = placeCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as T;
  }
  return null;
}

function setCachedData<T>(key: string, data: T): void {
  placeCache.set(key, { data, timestamp: Date.now() });
}

async function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function makeRequestWithRetry(
  path: string,
  body: any,
  retryCount = 0
): Promise<any> {
  try {
    const response = await fetch('/.netlify/functions/tripadvisor-proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    if (response.status === 429 && retryCount < MAX_RETRIES) {
      const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
      console.log(`Rate limited, retrying in ${delay}ms...`);
      await wait(delay);
      return makeRequestWithRetry(path, body, retryCount + 1);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`${path} response error:`, errorText);
      throw new Error(`Failed to make request: ${response.statusText}`);
    }

    const result = await response.json();
    console.log(`${path} raw response:`, result);
    return result;
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
      console.log(`Request failed, retrying in ${delay}ms...`, error);
      await wait(delay);
      return makeRequestWithRetry(path, body, retryCount + 1);
    }
    throw error;
  }
}

export async function getPlaceDetails(locationId: string): Promise<Partial<Restaurant>> {
  // Check cache first
  const cacheKey = `place_${locationId}`;
  const cached = getCachedData<Partial<Restaurant>>(cacheKey);
  if (cached) return cached;

  try {
    console.log(`Fetching details for location ID: ${locationId}`);

    const result = await makeRequestWithRetry('/location/details', {
      locationId,
      fetchDetails: true
    });

    // Check if we have valid data in the response
    if (result && result.data) {
      const data = result.data;
      const details = data.details || {};

      const placeData: Partial<Restaurant> = {
        locationId: data.location_id || locationId,
        name: data.name,
        location: {
          lat: parseFloat(data.latitude || details.latitude),
          lng: parseFloat(data.longitude || details.longitude)
        },
        rating: details.rating ? parseFloat(details.rating) : (data.rating ? parseFloat(data.rating) : undefined),
        reviews: details.num_reviews ? parseInt(details.num_reviews) : (data.num_reviews ? parseInt(data.num_reviews) : undefined),
        priceLevel: details.price_level,
        website: details.website || data.website,
        phoneNumber: details.phone || data.phone,
        address: details.address_obj?.address_string || data.address_obj?.address_string,
        photos: details.photos || data.photos || [],
        businessStatus: 'OPERATIONAL'
      };

      console.log(`Processed details with ratings for ${data.name}:`, {
        rating: placeData.rating,
        reviews: placeData.reviews
      });

      console.log(`Successfully processed details for: ${locationId}`, placeData);
      setCachedData(cacheKey, placeData);
      return placeData;
    } else {
      console.log(`No valid data structure found for: ${locationId}`, result);
      throw new Error('Invalid data structure received from TripAdvisor API');
    }
  } catch (error) {
    console.error('Error in getPlaceDetails:', error);
    throw error;
  }
}

async function searchSingleLocation(
  location: { lat: number, lng: number },
  placeType: string,
  radius: number,
  seenLocationIds: Set<string>,
  restaurantName?: string
): Promise<Restaurant[]> {
  const cacheKey = `search_${location.lat}_${location.lng}_${restaurantName || placeType}_${radius}`;
  const cached = getCachedData<Restaurant[]>(cacheKey);
  if (cached) {
    console.log('Found cached results for location:', location);
    const uniqueResults = cached.filter(place =>
      place.locationId &&
      !seenLocationIds.has(place.locationId) &&
      place.businessStatus !== 'CLOSED'
    );
    uniqueResults.forEach(place => {
      if (place.locationId) seenLocationIds.add(place.locationId);
    });
    return uniqueResults;
  }

  try {
    console.log('Fetching results for location:', location);

    // Add a small delay to avoid overwhelming the API
    await wait(500);

    // First, search for places using the name and location
    const searchData = await makeRequestWithRetry('/location/search', {
      name: restaurantName || '',
      latitude: location.lat,
      longitude: location.lng,
      type: placeType
    });

    // Check if we have a valid response with data
    if (!searchData?.data) {
      console.log('No data in search response for location:', location);
      return [];
    }

    // Extract the location data from the search results
    const item = searchData.data;
    const details = item.details || {};

    try {
      console.log('Processing search result:', { item, details });

      // Extract review counts from the review_rating_count object
      const reviewCounts = details.review_rating_count || {};
      const totalReviews = details.num_reviews ? parseInt(details.num_reviews) :
        item.num_reviews ? parseInt(item.num_reviews) : undefined;

      // Calculate average rating from review counts if not directly provided
      let rating = details.rating ? parseFloat(details.rating) :
        item.rating ? parseFloat(item.rating) : undefined;

      // Get subratings if available
      const subratings = details.subratings ? Object.values(details.subratings).map(
        (rating: any) => ({ name: rating.localized_name, value: rating.value })
      ) : [];

      const result: Restaurant = {
        locationId: item.location_id,
        name: item.name,
        location: {
          lat: parseFloat(details.latitude || item.latitude || '0'),
          lng: parseFloat(details.longitude || item.longitude || '0')
        },
        rating,
        reviews: totalReviews,
        reviewCounts: Object.entries(reviewCounts).reduce((acc: any, [key, value]) => {
          acc[key] = parseInt(value as string);
          return acc;
        }, {}),
        subratings,
        priceLevel: details.price_level,
        website: details.website || item.website,
        phoneNumber: details.phone || item.phone,
        address: details.address_obj?.address_string || item.address_obj?.address_string,
        photos: details.photo_count ? parseInt(details.photo_count) :
          item.photo_count ? parseInt(item.photo_count) : 0,
        businessStatus: 'OPERATIONAL',
        distanceInfo: item.distance ? {
          distance: `${parseFloat(item.distance).toFixed(1)} mi`
        } : undefined,
        description: details.description,
        features: details.features || [],
        cuisine: (details.cuisine || []).map((c: any) => c.localized_name),
        hours: details.hours?.weekday_text || [],
        ranking: details.ranking_data?.ranking_string
      };

      console.log('Processed restaurant data with full details:', {
        name: result.name,
        rating: result.rating,
        reviews: result.reviews,
        reviewCounts: result.reviewCounts,
        subratings: result.subratings,
        ranking: result.ranking
      });

      // Only add if it's not already seen and has required fields
      if (
        result.locationId &&
        result.name &&
        !seenLocationIds.has(result.locationId)
      ) {
        seenLocationIds.add(result.locationId);
        console.log(`Successfully processed result for ${result.name}`, result);
        setCachedData(cacheKey, [result]);
        return [result];
      }
    } catch (error) {
      console.error('Error processing search result:', error);
      console.error('Failed data:', { item, details });
    }

    return [];
  } catch (error) {
    console.error('Error searching locations:', error);
    return [];
  }
}

export async function searchNearbyPlaces(
  center: { lat: number, lng: number },
  placeType: string,
  radius: number,
  maxResults: number,
  restaurantNames: string[]
): Promise<Restaurant[]> {
  const seenLocationIds = new Set<string>();
  const allResults: Restaurant[] = [];

  try {
    console.log('Starting search for nearby places...');

    // Search for each restaurant name
    for (const name of restaurantNames) {
      console.log(`Searching for restaurant: ${name}`);
      const results = await searchSingleLocation(
        center,
        placeType,
        radius,
        seenLocationIds,
        name
      );

      if (results.length > 0) {
        console.log(`Found results for ${name}:`, results);
        allResults.push(...results);
      }
    }

    console.log(`Total results found before sorting: ${allResults.length}`);
    console.log('All results:', allResults);

    // Sort by rating and limit to maxResults
    const sortedResults = allResults
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, maxResults);

    console.log(`Getting details for ${sortedResults.length} places...`);

    // Get details for top results sequentially to avoid overwhelming the API
    const enrichedResults: Restaurant[] = [];
    for (const result of sortedResults) {
      if (result.locationId) {
        try {
          console.log(`Fetching details for ${result.name}...`);
          const details = await getPlaceDetails(result.locationId);
          const enrichedResult = {
            ...result,
            ...details,
            // Keep the best rating and review data
            rating: details.rating || result.rating,
            reviews: details.reviews || result.reviews,
            // Ensure we keep the distance info
            distanceInfo: result.distanceInfo
          };
          console.log(`Enriched result for ${result.name}:`, {
            rating: enrichedResult.rating,
            reviews: enrichedResult.reviews
          });
          enrichedResults.push(enrichedResult);
          console.log(`Successfully enriched ${result.name} with details:`, enrichedResult);
        } catch (error) {
          console.error(`Failed to get details for ${result.name}:`, error);
          enrichedResults.push(result); // Keep the original result if details fetch fails
        }
      }
    }

    console.log(`Successfully processed ${enrichedResults.length} places:`, enrichedResults);
    return enrichedResults;
  } catch (error) {
    console.error('Error in searchNearbyPlaces:', error);
    return [];
  }
}

export function calculateDistanceFromOrigin(
  location: { lat: number, lng: number },
  origin: { lat: number, lng: number }
): { distance: string } {
  // Using the Haversine formula to calculate distance
  const R = 6371e3; // Earth's radius in meters
  const φ1 = origin.lat * Math.PI / 180;
  const φ2 = location.lat * Math.PI / 180;
  const Δφ = (location.lat - origin.lat) * Math.PI / 180;
  const Δλ = (location.lng - origin.lng) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c;
  const distanceInMiles = distance * 0.000621371;
  return {
    distance: `${distanceInMiles.toFixed(1)} mi from start`
  };
}

export function calculateMidpoint(
  point1: { lat: number, lng: number },
  point2: { lat: number, lng: number }
): { lat: number, lng: number } {
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