import React, { useEffect } from 'react';
import { MapPin, Navigation, Users, Lightbulb, Heart } from 'lucide-react';

export function AboutPage() {
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
    <main className="max-w-7xl mx-auto px-4 py-16">
      {/* Hero Section */}
      <div className="text-center mb-20 animate-on-scroll opacity-0 transition-all duration-1000 -translate-y-10">
        <div className="inline-block p-3 bg-blue-100 rounded-full mb-8 hover:scale-110 transition-transform duration-300">
          <MapPin className="h-8 w-8 text-blue-600" />
        </div>
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-8 leading-[1.4] pb-1">
            Our Journey to RouteStops
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Every great idea starts with a simple problem. Ours began with a ski trip and a dinner plan.
          </p>
        </div>
      </div>

      {/* Story Cards */}
      <div className="grid md:grid-cols-2 gap-8 mb-20">
        <div className="group animate-on-scroll opacity-0 transition-all duration-700 -translate-x-10">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="flex items-center mb-6">
              <div className="bg-white p-2 rounded-lg shadow-sm group-hover:scale-110 transition-transform duration-300">
                <Navigation className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold ml-4 leading-relaxed">The Route Mode Story</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              It all started during a ski trip planning session. As a New Rochelle native, I was mapping out the journey when the age-old question came up: "Where should we stop for dinner?" That's when it hit me – wouldn't it be great to discover amazing restaurants that are actually along our route, not just nearby random points?
            </p>
          </div>
        </div>

        <div className="group animate-on-scroll opacity-0 transition-all duration-700 translate-x-10">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="flex items-center mb-6">
              <div className="bg-white p-2 rounded-lg shadow-sm group-hover:scale-110 transition-transform duration-300">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold ml-4 leading-relaxed">The Meetup Mode Inspiration</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              The second breakthrough came when my dad needed to meet with a client. They both wanted a fair meeting point, but finding the perfect spot between two locations proved challenging. This sparked the idea for Meetup Mode – a simple way to find great places exactly halfway between two points.
            </p>
          </div>
        </div>
      </div>

      {/* What Drives Us Section */}
      <div className="animate-on-scroll opacity-0 transition-all duration-700 scale-95">
        <div className="bg-white rounded-2xl shadow-lg p-12 mb-20 hover:shadow-xl transition-all duration-300">
          <h2 className="text-3xl font-bold text-center mb-12 leading-[1.4] pb-1">What Drives Us</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="group flex items-start transition-all duration-300 hover:-translate-y-1">
              <div className="bg-blue-100 p-3 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <Lightbulb className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-semibold mb-2 leading-relaxed">Simple Solutions</h3>
                <p className="text-gray-600 leading-relaxed">
                  We believe the best tools are the ones that solve real problems in intuitive ways. No complexity, just helpful solutions.
                </p>
              </div>
            </div>
            <div className="group flex items-start transition-all duration-300 hover:-translate-y-1">
              <div className="bg-blue-100 p-3 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <Heart className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-semibold mb-2 leading-relaxed">Community First</h3>
                <p className="text-gray-600 leading-relaxed">
                  Whether it's a family road trip or a business meeting, we're here to make connections easier and journeys more enjoyable.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Founder Section */}
      <div className="animate-on-scroll opacity-0 transition-all duration-700 translate-y-10 text-center max-w-3xl mx-auto">
        <div className="group">
          <img
            src="/founder.jpg"
            alt="John Taylor"
            className="w-32 h-32 rounded-full mx-auto mb-6 object-cover shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105"
          />
          <h2 className="text-2xl font-bold mb-4 leading-relaxed">John Taylor</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Founder, RouteStops
          </p>
          <p className="text-gray-700 italic leading-relaxed">
            "Every journey has its stops, and every stop has its story. We're here to help you make those stories better."
          </p>
        </div>
      </div>
    </main>
  );
}