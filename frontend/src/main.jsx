import React from 'react'
import ReactDOM from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.jsx'
import './config/axios'
import './index.css'
import './assets/css/index.css'
import './assets/css/public.css'
import './assets/css/property.css'
import './assets/css/admin.css'
import './assets/css/responsive.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>,
)
