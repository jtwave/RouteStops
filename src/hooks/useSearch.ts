import { useState, useEffect } from 'react';
import { searchPlaces } from '../services/searchService';
import type { SearchMode, SearchParams, SearchResult } from '../types';

export function useSearch() {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Debug state changes
  useEffect(() => {
    console.log('Search Result State:', searchResult);
    if (searchResult?.places) {
      console.log('Places with ratings:', searchResult.places.map(place => ({
        name: place.name,
        rating: place.rating,
        reviews: place.reviews,
        priceLevel: place.priceLevel,
        website: place.website,
        address: place.address
      })));
    }
  }, [searchResult]);

  const search = async (params: SearchParams, mode: SearchMode) => {
    if (!params.origin || !params.destination) {
      setError('Please enter both origin and destination');
      return;
    }

    setIsSearching(true);
    setError(null);
    // Force clear previous results
    setSearchResult(null);

    try {
      console.log('Starting search with params:', params);
      const result = await searchPlaces(params, mode);
      console.log('Raw search result:', result);

      if (result.places) {
        // Process each place to ensure all fields are present
        const processedPlaces = result.places.map(place => {
          // Ensure rating is a number
          let rating = 0;
          if (typeof place.rating === 'string') {
            rating = parseFloat(place.rating);
          } else if (typeof place.rating === 'number') {
            rating = place.rating;
          }

          // Get reviews count
          const reviews = place.reviews || place.user_ratings_total || 0;

          // Get address
          const address = place.address ||
            place.address_obj?.address_string ||
            [place.address_line1, place.address_line2].filter(Boolean).join(', ');

          // Get cuisine
          const cuisine = Array.isArray(place.cuisine)
            ? place.cuisine
            : (place.categories || []).map(cat => ({ name: cat }));

          console.log('Processing place:', place.name, {
            rating,
            reviews,
            priceLevel: place.priceLevel,
            address,
            cuisine: cuisine.map(c => c.name)
          });

          return {
            ...place,
            rating,
            reviews,
            priceLevel: place.priceLevel || '',
            cuisine,
            photos: typeof place.photos === 'number' ? place.photos : 0,
            // Ensure these fields are always present
            locationId: place.locationId || place.place_id || '',
            address,
            website: place.website || '',
            phoneNumber: place.phoneNumber || place.phone || ''
          };
        });

        console.log('Processed places:', processedPlaces.map(place => ({
          name: place.name,
          rating: place.rating,
          reviews: place.reviews,
          priceLevel: place.priceLevel,
          website: place.website,
          address: place.address
        })));

        // Force a new object to trigger state update
        setSearchResult({
          ...result,
          places: processedPlaces
        });
      } else {
        setSearchResult(result);
      }
    } catch (err) {
      console.error('Search error details:', err);
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  return {
    search,
    isSearching,
    searchResult,
    error,
    clearResults: () => setSearchResult(null),
  };
}