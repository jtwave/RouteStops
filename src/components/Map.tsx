import React from 'react';
import { RouteMap } from './RouteMap';
import { MeetupMap } from './MeetupMap';
import type { Restaurant, Location } from '../types';

interface MapProps {
  center: Location;
  restaurants: Restaurant[];
  route?: { coordinates: [number, number][] };
  defaultZoom?: number;
  originLocation?: [number, number];
  destinationLocation?: [number, number];
  mode?: 'route' | 'meetup';
}

export function Map(props: MapProps) {
  if (props.mode === 'meetup') {
    return (
      <MeetupMap
        key="meetup-map"
        center={props.center}
        restaurants={props.restaurants}
        defaultZoom={props.defaultZoom}
        originLocation={props.originLocation}
        destinationLocation={props.destinationLocation}
      />
    );
  }

  return (
    <RouteMap
      key="route-map"
      center={props.center}
      restaurants={props.restaurants}
      route={props.route}
      defaultZoom={props.defaultZoom}
    />
  );
}