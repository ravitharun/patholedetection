import 'leaflet/dist/leaflet.css';
import { createRoot } from 'react-dom/client';
import './index.css';
import { registerSW } from "virtual:pwa-register";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React, { lazy, Suspense } from 'react';
import Loader from './Loader.jsx';

const App = lazy(() => import('./App.jsx'));
const Addnearby = lazy(() => import('./Addnearby.jsx'));
const Userprofile = lazy(() => import('./Userprofile.jsx'));
registerSW({ immediate: true });

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Suspense fallback={<Loader />}>
        <App />
      </Suspense>} />
      <Route path="/nearby" element={<Suspense fallback={<Loader />}>
    
        <Addnearby />
      </Suspense>} />
      <Route path="/profile" element={<Suspense fallback={<Loader />}>
    
        <Userprofile />
      </Suspense>} />
    </Routes>

  </BrowserRouter>
);