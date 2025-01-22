import React, { useEffect } from 'react';
import { Introduction } from '../components/Introduction';
import { SearchForm } from '../components/SearchForm';
import { RestaurantCard } from '../components/RestaurantCard';
import { Map } from '../components/Map';
import { LoadingScreen } from '../components/LoadingScreen';
import { useSearch } from '../hooks/useSearch';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import type { SearchParams } from '../types';

export function RoutePage() {
  useScrollAnimation();
  const {
    search,
    isSearching,
    searchResult,
    error,
  } = useSearch();

  // Debug state changes
  useEffect(() => {
    if (searchResult) {
      console.log('Route Page - Search Result:', searchResult);
      console.log('Route Page - Places:', searchResult.places);
    }
  }, [searchResult]);

  const handleSearch = async (
    origin: string,
    destination: string,
    placeType: string,
    distanceOffRoute: number,
    skipFromStart: number,
    maxLocations: number
  ) => {
    try {
      console.log('Route Page - Starting search with:', {
        origin,
        destination,
        placeType,
        distanceOffRoute,
        skipFromStart,
        maxLocations
      });

      const params: SearchParams = {
        origin,
        destination,
        placeType,
        distanceOffRoute,
        skipFromStart,
        maxLocations
      };

      await search(params, 'route');
    } catch (err) {
      console.error('Route Page - Search failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white fade-in">
      <Introduction />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-on-scroll">
          <SearchForm onSearch={handleSearch} isLoaded={true} mode="route" />
        </div>

        <div className="mt-8 space-y-8">
          {/* Map Section - Always render the map */}
          <div className="animate-on-scroll">
            <Map
              mode="route"
              center={searchResult?.center || { lat: 39.8283, lng: -98.5795 }}
              restaurants={searchResult?.places || []}
              route={searchResult?.route}
              defaultZoom={searchResult ? undefined : 4}
              originLocation={searchResult?.originLocation}
              destinationLocation={searchResult?.destinationLocation}
            />
          </div>

          {/* Results Section */}
          {searchResult?.places && searchResult.places.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">
                Places Along Your Route
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResult.places.map((restaurant, index) => {
                  console.log('Rendering restaurant:', {
                    name: restaurant.name,
                    rating: restaurant.rating,
                    reviews: restaurant.reviews,
                    priceLevel: restaurant.priceLevel
                  });
                  return (
                    <div
                      key={restaurant.locationId || restaurant.place_id || index}
                      className="fade-in"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <RestaurantCard restaurant={restaurant} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {isSearching && (
          <LoadingScreen
            message="Searching for the best places..."
            subMessage="We're finding the perfect stops along your route"
          />
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}
      </main>
    </div>
  );
}