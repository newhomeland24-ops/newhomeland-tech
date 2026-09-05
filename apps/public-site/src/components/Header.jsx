import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';

const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex flex-col">
            <span className="text-2xl font-bold text-gray-900 tracking-tight">NewHomeLand</span>
            <span className="text-xs font-medium text-primary-600 tracking-wider uppercase">Your Ground. Your Future.</span>
          </Link>
          
          <div className="hidden md:flex items-center">
            <a 
              href={`https://wa.me/`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-green-500 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-green-600 transition-colors shadow-md hover:shadow-lg"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Chat with Broker</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
