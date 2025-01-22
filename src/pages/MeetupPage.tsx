import React from 'react';
import { SearchForm } from '../components/SearchForm';
import { RestaurantCard } from '../components/RestaurantCard';
import { Map } from '../components/Map';
import { AdUnit } from '../components/AdUnit';
import { LoadingScreen } from '../components/LoadingScreen';
import { useGoogleMaps } from '../hooks/useGoogleMaps';
import { searchPlaces } from '../services/searchService';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { Users, Search, Star } from 'lucide-react';
import type { SearchParams } from '../types';

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="group bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-gray-800">{title}</h3>
      <p className="mt-2 text-gray-600">{description}</p>
    </div>
  );
}

export function MeetupPage() {
  useScrollAnimation();
  const {
    isLoaded,
    loadError,
    isSearching,
    setIsSearching,
    error,
    setError,
    searchResult,
    setSearchResult,
  } = useGoogleMaps();

  const handleSearch = async (
    origin: string,
    destination: string,
    placeType: google.maps.places.PlaceType,
    _: number,
    __: number,
    maxLocations: number,
    radius: number
  ) => {
    if (!isLoaded) return;

    setIsSearching(true);
    setError(null);

    try {
      const params: SearchParams = {
        origin,
        destination,
        placeType,
        maxLocations,
        radius
      };

      const result = await searchPlaces(params, 'meetup');
      setSearchResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-xl">Error loading maps</p>
          <p className="text-gray-600 mt-2">Please try again later</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading maps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white fade-in">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto bg-white/50 backdrop-blur-sm rounded-2xl p-12 shadow-lg animate-on-scroll">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-8 leading-[1.4] pb-1">
                Find the Perfect Meeting Point
              </h1>
              <p className="text-xl text-gray-700 mb-6 leading-relaxed">
                Discover ideal halfway points between two locations. Perfect for meetups, business meetings, or catching up with friends.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Let us find the best restaurants, cafes, and venues that are equidistant from both locations.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <FeatureCard
                icon={<Users className="h-6 w-6 text-blue-600" />}
                title="Enter Locations"
                description="Input both starting points"
              />
              <FeatureCard
                icon={<Search className="h-6 w-6 text-blue-600" />}
                title="Set Preferences"
                description="Choose venue type and distance"
              />
              <FeatureCard
                icon={<Star className="h-6 w-6 text-blue-600" />}
                title="Find Midpoint"
                description="Get perfect meetup spots"
              />
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-on-scroll">
          <SearchForm onSearch={handleSearch} isLoaded={isLoaded} mode="meetup" />
        </div>
        
        <div className="mt-8 animate-on-scroll">
          <Map
            mode="meetup"
            center={searchResult?.center || { lat: 39.8283, lng: -98.5795 }}
            restaurants={searchResult?.places || []}
            defaultZoom={searchResult ? undefined : 4}
            originLocation={searchResult?.originLocation}
            destinationLocation={searchResult?.destinationLocation}
          />
        </div>

        {searchResult?.places.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 animate-on-scroll">
              Perfect Meetup Spots
            </h2>
            <AdUnit slot="2131252628" className="mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResult.places.map((restaurant, index) => (
                <div
                  key={restaurant.place_id}
                  className="animate-on-scroll"
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <RestaurantCard restaurant={restaurant} />
                </div>
              ))}
            </div>
            <AdUnit slot="2131252628" className="mt-8" />
          </div>
        )}

        {isSearching && (
          <LoadingScreen 
            message="Finding the perfect meetup spots..."
            subMessage="We're calculating the ideal locations for both parties"
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