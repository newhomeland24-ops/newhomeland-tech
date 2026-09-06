import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const PublicApp = React.lazy(() => import('./PublicApp'));
const AdminApp = React.lazy(() => import('./AdminApp'));

function App() {
  return (
    <Router>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
        <Routes>
          <Route path="/admin/*" element={<AdminApp />} />
          <Route path="/*" element={<PublicApp />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
