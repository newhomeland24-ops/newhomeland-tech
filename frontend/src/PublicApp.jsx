import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ErrorBoundary from './public/components/ErrorBoundary';
import Header from './public/components/Header';
import Footer from './public/components/Footer';
import BottomStickyBar from './public/components/BottomStickyBar';
import HomePage from './public/pages/HomePage';
import PropertyDetailPage from './public/pages/PropertyDetailPage';

function PublicApp() {
  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/property/:id" element={<PropertyDetailPage />} />
        </Routes>
        <Footer />
        <BottomStickyBar />
      </div>
    </ErrorBoundary>
  );
}

export default PublicApp;
