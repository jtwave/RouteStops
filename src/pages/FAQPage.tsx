import React from 'react';
import { Search, Navigation2, Users, Settings, Map } from 'lucide-react';

interface FAQ {
  category: string;
  question: string;
  answer: string;
  icon?: React.ReactNode;
}

export function FAQPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white fade-in">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600">
            Everything you need to know about using RouteStops
          </p>
        </div>

        <div className="space-y-8">
          {Object.entries(groupedFaqs).map(([category, questions]) => (
            <section key={category} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  {questions[0].icon}
                  <h2 className="text-2xl font-semibold text-gray-900">{category}</h2>
                </div>
                <div className="space-y-6">
                  {questions.map((faq, index) => (
                    <div key={index} className="group">
                      <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                        {faq.question}
                      </h3>
                      <p className="mt-2 text-gray-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ))}
        </div>

        {/* Schema.org FAQ markup */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs.map(faq => ({
              "@type": "Question",
              "name": faq.question,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
              }
            }))
          })}
        </script>
      </div>
    </div>
  );
}

// Group FAQs by category with icons
const groupedFaqs = {
  "Getting Started": [
    {
      question: "What is RouteStops?",
      answer: "RouteStops is a smart journey planner that helps you discover perfect stops along your route or find ideal halfway meeting points between two locations. Whether you're planning a road trip or meeting someone, we'll help you find the best restaurants, attractions, and places to visit.",
      icon: <Search className="h-6 w-6 text-blue-600" />
    },
    {
      question: "Do I need exact addresses?",
      answer: "No! You can enter cities, landmarks, or business names - whatever's easiest for you. Our smart location search works with everything from exact addresses to general locations like 'Downtown Chicago'.",
    },
    {
      question: "Is RouteStops free to use?",
      answer: "Yes! Our route planner and halfway point finder are completely free to use on any device.",
    }
  ],
  "Route Planning": [
    {
      question: "How do I plan a route with stops?",
      answer: "Simply enter your start and end points, then choose what type of stops you're interested in (restaurants, attractions, etc.). We'll show you the best-rated places along your route, perfectly spaced for your journey.",
      icon: <Navigation2 className="h-6 w-6 text-blue-600" />
    },
    {
      question: "Can I customize my search?",
      answer: "Yes! You can adjust how far off your route to search (up to 10 miles), filter by type of place, and set how many stops you want to see. You can also skip the first portion of your route if you're not ready for a stop right away.",
    }
  ],
  "Meeting Points": [
    {
      question: "How does the halfway finder work?",
      answer: "Enter both locations, and we'll calculate the perfect midpoint. You'll get recommendations for restaurants, cafes, and other meeting spots that are equally convenient for both parties. Perfect for dates, business meetings, or catching up with friends.",
      icon: <Users className="h-6 w-6 text-blue-600" />
    },
    {
      question: "Can I adjust the meeting area?",
      answer: "Yes! You can expand the search radius up to 25 miles around the midpoint to find more options. This is especially useful in rural areas or when you're looking for specific types of places.",
    }
  ],
  "Features & Settings": [
    {
      question: "What types of places can I find?",
      answer: "We help you discover restaurants, cafes, shopping centers, tourist attractions, parks, and museums. All results are ranked based on Google ratings and reviews to ensure you find the best spots.",
      icon: <Settings className="h-6 w-6 text-blue-600" />
    },
    {
      question: "How do I navigate to a place?",
      answer: "Every place in our results can be opened directly in Google Maps or Apple Maps for turn-by-turn navigation. Just click the place you're interested in, and you'll see options to get directions.",
      icon: <Map className="h-6 w-6 text-blue-600" />
    }
  ]
};

// Create faqs array for schema markup
const faqs: FAQ[] = Object.entries(groupedFaqs).flatMap(([category, questions]) =>
  questions.map(q => ({ ...q, category }))
);