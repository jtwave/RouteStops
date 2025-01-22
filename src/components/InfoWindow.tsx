import React from 'react';
import type { Restaurant } from '../types';
import { Star, ExternalLink } from 'lucide-react';

interface InfoWindowProps {
  restaurant: Restaurant;
}

export function InfoWindowContent({ restaurant }: InfoWindowProps) {
  return (
    <div className="min-w-[300px] max-w-[350px] bg-white rounded-lg overflow-hidden">
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{restaurant.name}</h3>
        
        <div className="flex items-center mb-2">
          {restaurant.rating && (
            <div className="flex items-center text-yellow-500">
              <Star className="h-4 w-4 fill-current" />
              <span className="ml-1 font-medium">{restaurant.rating}</span>
              {restaurant.user_ratings_total && (
                <span className="text-gray-500 text-sm ml-1">
                  ({restaurant.user_ratings_total})
                </span>
              )}
            </div>
          )}
        </div>

        <p className="text-gray-600 text-sm mb-3">
          {restaurant.address_line1}
          {restaurant.address_line2 && <>, {restaurant.address_line2}</>}
        </p>

        {restaurant.website && (
          <a
            href={restaurant.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            Visit Website
            <ExternalLink className="h-3 w-3 ml-1" />
          </a>
        )}
      </div>
    </div>
  );
}