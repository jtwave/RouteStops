import React, { useState } from 'react';
import { PLACE_CATEGORIES, SearchMode } from '../types';
import { AddressAutocomplete } from './AddressAutocomplete';
import { RequestLimiter } from '../services/requestLimiter';

interface SearchFormProps {
  onSearch: (
    origin: string,
    destination: string,
    category: string,
    distanceOffRoute: number,
    skipFromStart: number,
    maxLocations: number,
    radius: number
  ) => void;
  isLoaded: boolean;
  mode: SearchMode;
}

export function SearchForm({ onSearch, mode }: SearchFormProps) {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [category, setCategory] = useState<string>('catering.restaurant');
  const [distanceOffRoute, setDistanceOffRoute] = useState(2);
  const [skipFromStart, setSkipFromStart] = useState(0);
  const [radius, setRadius] = useState(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (origin && destination) {
      onSearch(
        origin,
        destination,
        category,
        distanceOffRoute,
        skipFromStart,
        RequestLimiter.getMaxPlaces(),
        radius
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
      <div className="space-y-6">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 mb-2">
            Enter cities, landmarks, or general locations - our smart search will handle the rest. While specific street addresses work too, they're not required for great results!
          </p>
          <AddressAutocomplete
            value={origin}
            onChange={setOrigin}
            placeholder={mode === 'meetup' ? "Person A's location" : "Starting point"}
          />
          <AddressAutocomplete
            value={destination}
            onChange={setDestination}
            placeholder={mode === 'meetup' ? "Person B's location" : "Destination"}
          />
        </div>

        {mode === 'route' ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Distance off route: {distanceOffRoute} miles
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={distanceOffRoute}
                onChange={(e) => setDistanceOffRoute(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Skip from start: {skipFromStart} miles
              </label>
              <input
                type="range"
                min="0"
                max="150"
                value={skipFromStart}
                onChange={(e) => setSkipFromStart(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Search radius from midpoint: {radius} miles
            </label>
            <input
              type="range"
              min="1"
              max="25"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        )}

        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {PLACE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              className={`group flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-300 ${
                category === cat.id
                  ? 'bg-blue-100 text-blue-600 border-2 border-blue-600 shadow-sm'
                  : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:bg-gray-100'
              }`}
            >
              <span className="text-xs font-medium mt-1 group-hover:scale-105 transition-transform duration-300">
                {cat.label}
              </span>
            </button>
          ))}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-all duration-300 font-medium transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          disabled={!origin || !destination}
        >
          {mode === 'meetup' ? 'Find Meetup Spots' : 'Find Places'}
        </button>
      </div>
    </form>
  );
}