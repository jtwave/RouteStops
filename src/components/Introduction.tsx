import React from 'react';
import { Navigation2, Search, Star, MapPin } from 'lucide-react';

export function Introduction() {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto bg-white/50 backdrop-blur-sm rounded-2xl p-12 shadow-lg animate-on-scroll">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-8 leading-[1.4] pb-1">
              Find Perfect Stops Along Your Route
            </h1>
            <p className="text-xl text-gray-700 mb-6 leading-relaxed">
              Discover the best restaurants, attractions, and places to visit that are perfectly spaced along your journey.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <FeatureCard
                icon={<MapPin className="h-6 w-6 text-blue-600" />}
                title="Enter Route"
                description="Input your starting point and destination"
              />
              <FeatureCard
                icon={<Search className="h-6 w-6 text-blue-600" />}
                title="Set Preferences"
                description="Choose stop types and distance from route"
              />
              <FeatureCard
                icon={<Star className="h-6 w-6 text-blue-600" />}
                title="Get Results"
                description="Find the best-rated places to stop"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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