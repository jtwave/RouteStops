import React, { useState, useEffect } from 'react';
import { MapPin, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export function Header() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2 group">
              <MapPin className="h-6 w-6 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                RouteStops
              </h1>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-4">
              <NavLink to="/route" current={location.pathname === '/route'}>
                Route Mode
              </NavLink>
              <NavLink to="/meetup" current={location.pathname === '/meetup'}>
                Meetup Mode
              </NavLink>
              <NavLink to="/faq" current={location.pathname === '/faq'}>
                FAQ
              </NavLink>
              <NavLink to="/about" current={location.pathname === '/about'}>
                About
              </NavLink>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-gray-600" />
              ) : (
                <Menu className="h-6 w-6 text-gray-600" />
              )}
            </button>
          </div>

          {/* Mobile Navigation Dropdown */}
          <div 
            className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
              isMenuOpen ? 'max-h-64 mt-4' : 'max-h-0'
            }`}
          >
            <nav className="flex flex-col space-y-1 bg-white rounded-lg p-2 shadow-lg relative z-10">
              <MobileNavLink 
                to="/route" 
                current={location.pathname === '/route'}
                onClick={() => setIsMenuOpen(false)}
              >
                Route Mode
              </MobileNavLink>
              <MobileNavLink 
                to="/meetup" 
                current={location.pathname === '/meetup'}
                onClick={() => setIsMenuOpen(false)}
              >
                Meetup Mode
              </MobileNavLink>
              <MobileNavLink 
                to="/faq" 
                current={location.pathname === '/faq'}
                onClick={() => setIsMenuOpen(false)}
              >
                FAQ
              </MobileNavLink>
              <MobileNavLink 
                to="/about" 
                current={location.pathname === '/about'}
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </MobileNavLink>
            </nav>
          </div>
        </div>
      </header>

      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black transition-all duration-300 md:hidden ${
          isMenuOpen ? 'opacity-50 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{ zIndex: 40 }}
        onClick={() => setIsMenuOpen(false)}
      />
    </>
  );
}

function NavLink({ to, current, children }: { to: string; current: boolean; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className={`px-4 py-2 rounded-md transition-all duration-300 ${
        current
          ? 'bg-blue-100 text-blue-600 shadow-sm'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ 
  to, 
  current, 
  children,
  onClick
}: { 
  to: string; 
  current: boolean; 
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`px-4 py-3 rounded-md transition-all duration-300 ${
        current
          ? 'bg-blue-100 text-blue-600'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {children}
    </Link>
  );
}