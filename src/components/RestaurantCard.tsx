import React from 'react';
import type { Restaurant } from '../types';
import { StarIcon } from '@heroicons/react/20/solid';

interface RestaurantCardProps {
  restaurant: Restaurant;
  className?: string;
}

export function RestaurantCard({ restaurant, className = '' }: RestaurantCardProps) {
  // Ensure rating is a number
  const rating = typeof restaurant.rating === 'string'
    ? parseFloat(restaurant.rating)
    : (restaurant.rating || 0);

  const formattedRating = rating > 0 ? rating.toFixed(1) : 'No rating';

  // Get review count, prioritize TripAdvisor reviews
  const reviewCount = restaurant.reviews || restaurant.user_ratings_total || 0;

  // Format address
  const address = restaurant.address ||
    [restaurant.address_line1, restaurant.address_line2].filter(Boolean).join(', ');

  console.log('Rendering restaurant card:', {
    name: restaurant.name,
    rating,
    formattedRating,
    reviews: reviewCount,
    address,
    priceLevel: restaurant.priceLevel,
    cuisine: restaurant.cuisine
  });

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-900 flex-grow">
            {restaurant.name}
          </h3>
          {restaurant.priceLevel && (
            <span className="text-gray-600 text-sm ml-2">
              {restaurant.priceLevel}
            </span>
          )}
        </div>

        <div className="mt-2 flex items-center">
          {rating > 0 && (
            <>
              <div className="flex items-center">
                <StarIcon className="h-5 w-5 text-yellow-400" />
                <span className="ml-1 text-sm font-medium text-gray-900">
                  {formattedRating}
                </span>
              </div>
              {reviewCount > 0 && (
                <span className="ml-2 text-sm text-gray-600">
                  ({reviewCount} reviews)
                </span>
              )}
            </>
          )}
        </div>

        {address && (
          <p className="mt-2 text-sm text-gray-600">
            {address}
          </p>
        )}

        {restaurant.cuisine && restaurant.cuisine.length > 0 && (
          <p className="mt-1 text-sm text-gray-500">
            {restaurant.cuisine.map(c => c.name || c).join(', ')}
          </p>
        )}

        {(restaurant.distance || restaurant.distanceInfo?.distance) && (
          <p className="mt-1 text-sm text-gray-600">
            {restaurant.distance || restaurant.distanceInfo?.distance}
          </p>
        )}

        {restaurant.website && (
          <a
            href={restaurant.website}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-sm text-blue-600 hover:text-blue-800"
          >
            Visit Website
          </a>
        )}

        {restaurant.phoneNumber && (
          <p className="mt-1 text-sm text-gray-600">
            {restaurant.phoneNumber}
          </p>
        )}
      </div>
    </div>
  );
}