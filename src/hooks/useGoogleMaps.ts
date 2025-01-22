import { useState } from 'react';
import type { SearchResult } from '../types';

export function useGoogleMaps() {
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);

  return {
    isSearching,
    setIsSearching,
    isLoaded: true, // Always true since we don't need to load Google Maps anymore
    loadError: null,
    error,
    setError,
    searchResult,
    setSearchResult,
  };
}