import React from 'react';

const AboutPage = () => {
  return (
    <main className="flex-grow bg-gray-50 py-12 min-h-[60vh]">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">About Us</span>
          <h2 className="section-title">NewHomeLand</h2>
          <p className="section-subtitle">
            Your Ground. Your Future.
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-12 shadow-sm text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Our Story</h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We are dedicated to providing the best real estate services, ensuring 100% legal title clearance and securing your future with verified plots, villas, and commercial land.
          </p>
        </div>
      </div>
    </main>
  );
};

export default AboutPage;
