import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navigation2, Users, MapPin, Coffee, ShoppingBag, ChevronRight, Heart } from 'lucide-react';

export function HomePage() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting && !entry.target.classList.contains('hide')) {
            entry.target.classList.add('hide');
          }
          if (entry.isIntersecting) {
            entry.target.classList.remove('hide');
            entry.target.classList.add('show');
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -100px 0px'
      }
    );

    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      el.classList.add('hide');
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white fade-in">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-8 leading-[1.2]">
              Plan Perfect Stops Along Your Journey
            </h1>
            <p className="text-xl text-gray-700 mb-8 leading-relaxed max-w-3xl mx-auto">
              Whether you're planning a road trip, finding a meetup spot, or connecting with your long-distance partner, discover the best restaurants, attractions, and places to create memorable moments together.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                to="/route"
                className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 group"
              >
                <Navigation2 className="h-5 w-5 mr-2" />
                Plan Road Trip
                <ChevronRight className="h-5 w-5 ml-1 transform group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/meetup"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 group"
              >
                <Users className="h-5 w-5 mr-2" />
                Find Meetup Point
                <ChevronRight className="h-5 w-5 ml-1 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything You Need for the Perfect Journey</h2>
          <p className="text-lg text-gray-600">Discover amazing places and plan your stops with ease</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Navigation2 className="h-6 w-6 text-blue-600" />}
            title="Road Trip Planner"
            description="Find the best stops along your route, from restaurants to attractions"
            link="/route"
          />
          <FeatureCard
            icon={<Users className="h-6 w-6 text-blue-600" />}
            title="Halfway Point Finder"
            description="Perfect for meeting friends, dates, or your long-distance partner"
            link="/meetup"
          />
          <FeatureCard
            icon={<MapPin className="h-6 w-6 text-blue-600" />}
            title="Multiple Stop Types"
            description="Restaurants, shopping, attractions, and more"
            link="/route"
          />
        </div>
      </div>

      {/* Use Cases Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Perfect For Every Journey</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <UseCaseCard
              icon={<Heart />}
              title="Long Distance Dating"
              description="Find perfect meetup spots for quality time together"
            />
            <UseCaseCard
              icon={<Users />}
              title="Business Meetings"
              description="Meet clients at convenient halfway points"
            />
            <UseCaseCard
              icon={<Coffee />}
              title="Coffee Dates"
              description="Discover cozy cafes for memorable meetups"
            />
            <UseCaseCard
              icon={<MapPin />}
              title="Tourist Attractions"
              description="Don't miss must-see spots on your journey"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ 
  icon, 
  title, 
  description, 
  link 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  link: string;
}) {
  return (
    <Link to={link} className="group">
      <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">{title}</h3>
        <p className="text-gray-600 text-center">{description}</p>
      </div>
    </Link>
  );
}

function UseCaseCard({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) {
  return (
    <div className="bg-gray-50 p-6 rounded-lg hover:bg-gray-100 transition-all duration-300">
      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-4">
        {React.cloneElement(icon as React.ReactElement, { className: 'h-5 w-5 text-blue-600' })}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}