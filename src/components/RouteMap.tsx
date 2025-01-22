import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { Icon, latLngBounds, DivIcon } from 'leaflet';
import { InfoWindowContent } from './InfoWindow';
import type { Restaurant, Location } from '../types';

interface RouteMapProps {
  center: Location;
  restaurants: Restaurant[];
  route?: { coordinates: [number, number][] };
  defaultZoom?: number;
  originLocation?: [number, number];
  destinationLocation?: [number, number];
}

const mapContainerStyle = {
  width: '100%',
  height: '500px'
};

const restaurantIcon = new DivIcon({
  className: 'custom-marker',
  html: `
    <div class="marker-container">
      <img src="https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png" />
      <img src="https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png" class="marker-shadow" />
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});

const startIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNSIgaGVpZ2h0PSI0MSIgdmlld0JveD0iMCAwIDI1IDQxIj48cGF0aCBmaWxsPSIjMTBiOTgxIiBkPSJNMTIuNSAwQzUuNiAwIDAgNS42IDAgMTIuNWMwIDYuOSAxMi41IDI4LjUgMTIuNSAyOC41UzI1IDE5LjQgMjUgMTIuNUMyNSA1LjYgMTkuNCA0LjcgMTIuNSAweiIvPjxjaXJjbGUgZmlsbD0iI2ZmZiIgY3g9IjEyLjUiIGN5PSIxMi41IiByPSI0LjUiLz48L3N2Zz4=',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

const endIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNSIgaGVpZ2h0PSI0MSIgdmlld0JveD0iMCAwIDI1IDQxIj48cGF0aCBmaWxsPSIjZWY0NDQ0IiBkPSJNMTIuNSAwQzUuNiAwIDAgNS42IDAgMTIuNWMwIDYuOSAxMi41IDI4LjUgMTIuNSAyOC41UzI1IDE5LjQgMjUgMTIuNUMyNSA1LjYgMTkuNCA0LjcgMTIuNSAweiIvPjxjaXJjbGUgZmlsbD0iI2ZmZiIgY3g9IjEyLjUiIGN5PSIxMi41IiByPSI0LjUiLz48L3N2Zz4=',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

function FitBounds({ route, restaurants, originLocation, destinationLocation }: Pick<RouteMapProps, 'route' | 'restaurants' | 'originLocation' | 'destinationLocation'>) {
  const map = useMap();

  React.useEffect(() => {
    if (!map) return;

    const bounds = latLngBounds([]);
    let hasPoints = false;

    if (route?.coordinates?.length) {
      route.coordinates.forEach(coord => {
        bounds.extend(coord);
        hasPoints = true;
      });
    }

    if (restaurants?.length) {
      restaurants.forEach(restaurant => {
        bounds.extend([restaurant.lat, restaurant.lon]);
        hasPoints = true;
      });
    }

    if (originLocation) {
      bounds.extend(originLocation);
      hasPoints = true;
    }
    if (destinationLocation) {
      bounds.extend(destinationLocation);
      hasPoints = true;
    }

    if (hasPoints) {
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 15
      });
    }
  }, [map, route, restaurants, originLocation, destinationLocation]);

  return null;
}

export function RouteMap({
  center,
  restaurants,
  route,
  defaultZoom = 10,
  originLocation,
  destinationLocation
}: RouteMapProps) {
  const [selectedPlace, setSelectedPlace] = useState<Restaurant | null>(null);

  return (
    <div className="map-container">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={defaultZoom}
        style={mapContainerStyle}
        scrollWheelZoom={true}
      >
        <TileLayer
          url={`https://maps.geoapify.com/v1/tile/osm-carto/{z}/{x}/{y}.png?api_key=${import.meta.env.VITE_GEOAPIFY_API_KEY}`}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          style="osm-carto"
          eventHandlers={{
            error: () => {
              console.log('Geoapify tiles failed, falling back to OpenStreetMap');
              return (
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
              );
            }
          }}
        />

        <FitBounds
          route={route}
          restaurants={restaurants}
          originLocation={originLocation}
          destinationLocation={destinationLocation}
        />

        {route && (
          <Polyline
            positions={route.coordinates}
            color="#2563eb"
            weight={4}
            opacity={0.8}
          />
        )}

        {originLocation && (
          <Marker
            position={originLocation}
            icon={startIcon}
          >
            <Popup>Starting Point</Popup>
          </Marker>
        )}

        {destinationLocation && (
          <Marker
            position={destinationLocation}
            icon={endIcon}
          >
            <Popup>Destination</Popup>
          </Marker>
        )}

        {restaurants.map((restaurant) => (
          <Marker
            key={restaurant.place_id}
            position={[restaurant.lat, restaurant.lon]}
            icon={restaurantIcon}
            eventHandlers={{
              click: () => setSelectedPlace(restaurant)
            }}
          >
            {selectedPlace?.place_id === restaurant.place_id && (
              <Popup>
                <InfoWindowContent restaurant={selectedPlace} />
              </Popup>
            )}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}