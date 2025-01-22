import React, { useState, useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';
import { geoapifyClient } from '../services/api/geoapifyClient';

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

interface Suggestion {
  properties: {
    formatted: string;
    lat: number;
    lon: number;
  };
}

export function AddressAutocomplete({ value, onChange, placeholder }: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimer = useRef<number>();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async (text: string) => {
    if (!text.trim()) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await geoapifyClient.get<{ features: Suggestion[] }>({
        endpoint: 'geocode/autocomplete',
        params: {
          text,
          format: 'geojson',
          filter: 'countrycode:us,ca',
          bias: 'countrycode:us,ca',
          limit: '5',
          lang: 'en',
          type: 'locality'
        }
      });

      if (!response.features) {
        throw new Error('Invalid response format');
      }

      setSuggestions(response.features);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch suggestions');
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    onChange(text);
    setShowSuggestions(true);

    if (debounceTimer.current) {
      window.clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = window.setTimeout(() => {
      fetchSuggestions(text);
    }, 300);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    onChange(suggestion.properties.formatted);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => value && setShowSuggestions(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
          autoComplete="off"
        />
      </div>

      {showSuggestions && (suggestions.length > 0 || loading || error) && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading suggestions...</div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">{error}</div>
          ) : (
            <ul className="py-1">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-gray-700 text-sm transition-colors duration-150"
                >
                  {suggestion.properties.formatted}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}