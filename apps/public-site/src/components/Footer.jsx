import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-dark text-gray-300 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            <h3 className="text-xl font-bold text-white mb-4">NewHomeLand</h3>
            <p className="text-gray-400 leading-relaxed mb-6">
              Your trusted partner in premium land and real estate brokerage. Your Ground. Your Future.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                <span className="text-gray-400">123 Real Estate Avenue, Business District, City 10001</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <span className="text-gray-400">+1 234 567 8900</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <span className="text-gray-400">contact@newhomeland.com</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Legal Disclaimer</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              All property details are provided for information purposes only. Boundaries and municipal approvals must be independently verified by the buyer before any transaction.
            </p>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} NewHomeLand Brokerage. All rights reserved.
          </p>
          <a href="http://localhost:5174" className="text-gray-700 hover:text-gray-500 text-xs transition-colors mt-4 md:mt-0">
            Staff Portal
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
