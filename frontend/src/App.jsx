import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsContext';
import { Toaster } from 'react-hot-toast';

const PublicApp = React.lazy(() => import('./PublicApp'));
const AdminApp = React.lazy(() => import('./AdminApp'));

function App() {
  return (
    <SettingsProvider>
      <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
      <Router>
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center w-full max-w-full overflow-x-hidden">Loading...</div>}>
          <Routes>
            <Route path="/admin/*" element={<AdminApp />} />
            <Route path="/*" element={<PublicApp />} />
          </Routes>
        </Suspense>
      </Router>
    </SettingsProvider>
  );
}

export default App;

