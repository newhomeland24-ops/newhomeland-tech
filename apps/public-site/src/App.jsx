import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Header from './components/Header';
import Footer from './components/Footer';
import BottomStickyBar from './components/BottomStickyBar';
import HomePage from './pages/HomePage';
import PropertyDetailPage from './pages/PropertyDetailPage';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Header />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/property/:id" element={<PropertyDetailPage />} />
          </Routes>
          <Footer />
          <BottomStickyBar />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
