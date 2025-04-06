# BMS Digital Signage - Key Code Snippets

Essential code samples for quick implementation of the BMS Digital Signage System.

## Supabase Client Setup

```typescript
// src/utils/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

// Use Vite's way of accessing environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL or Anon Key is missing. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

## Main Application Structure

```typescript
// src/App.tsx
import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Display from './pages/Display'
import Login from './pages/admin/Login'
import Dashboard from './pages/admin/Dashboard'
import Products from './pages/admin/Products'
import Categories from './pages/admin/Categories'
import Settings from './pages/admin/Settings'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Display />} />
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/products" element={
            <ProtectedRoute>
              <Products />
            </ProtectedRoute>
          } />
          <Route path="/admin/categories" element={
            <ProtectedRoute>
              <Categories />
            </ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
```

## Slideshow Component

```typescript
## Slideshow Component (Simplified Example)

```typescript
// src/components/SlideShow.tsx
// Note: This is a simplified representation. See actual file for full implementation.
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../utils/supabaseClient';
import { Product, Category, Announcement } from '../types';
import ProductSlide from './slides/ProductSlide';
import CategorySlide from './slides/CategorySlide';
import AnnouncementSlide from './slides/AnnouncementSlide';
import InfoBar from './InfoBar';
import ParticleBackground from './animations/ParticleBackground';

type Slide = { /* ... Slide type definition ... */ };

const SlideShow: React.FC = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  // ... other state variables (isFullscreen, cursorMoved, isLoading)

  const fetchSlides = useCallback(async () => {
    // ... logic to fetch products, categories, announcements from Supabase ...
    // ... logic to combine and sort slides ...
    setSlides(allSlides);
  }, []);

  useEffect(() => {
    fetchSlides();
    // ... logic for realtime subscriptions ...
  }, [fetchSlides]);

  useEffect(() => {
    // ... logic for auto-advancing slides ...
  }, [slides]);

  useEffect(() => {
    // ... logic for cursor movement detection ...
  }, []);

  useEffect(() => {
    // ... logic for keyboard navigation ...
  }, [slides.length]);

  const toggleFullscreen = () => { /* ... fullscreen logic ... */ };

  const renderSlide = (slide: Slide) => { /* ... logic to render correct slide type ... */ };

  // ... Loading and No Slides states ...

  return (
    <div className="relative h-screen overflow-hidden">
      <ParticleBackground />
      <div className="absolute top-0 left-0 right-0 z-20"><InfoBar /></div>
      <div className="absolute top-14 left-0 right-0 bottom-0 z-10">
        <AnimatePresence mode="wait">
          <motion.div key={currentIndex} /* ... animation props ... */ >
            {renderSlide(slides[currentIndex])}
          </motion.div>
        </AnimatePresence>
      </div>
      {/* ... Admin Controls ... */}
      {/* ... Slide Indicators ... */}
    </div>
  );
};

export default SlideShow;
```

## Information Bar Component (Simplified Example)

```typescript
// src/components/InfoBar.tsx
// Note: This is a simplified representation. See actual file for full implementation.
import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Announcement } from '../types';

const InfoBar: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => { /* ... logic to update time ... */ }, []);
  useEffect(() => { /* ... logic to fetch weather using VITE_WEATHER_API_KEY ... */ }, []);
  useEffect(() => { /* ... logic to fetch ticker announcements ... */ }, []);

  const formattedTime = /* ... time formatting ... */;
  const formattedDate = /* ... date formatting ... */;
  const tickerText = /* ... join announcement content ... */;

  return (
    <div className="bg-blue-900 text-white p-3 shadow-lg flex items-center justify-between h-14">
      {/* Logo & Time */}
      <div className="flex items-center space-x-4">
        <img src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/branding/2-bms-logo.svg`} alt="BMS Logo" className="h-8" />
        {/* ... Time/Date display ... */}
      </div>

      {/* Weather */}
      {weather && ( /* ... Weather display logic ... */ )}

      {/* Announcements Ticker */}
      <div className="flex-1 ml-6 overflow-hidden">
        {announcements.length > 0 && (
          <div className="ticker-wrap"><div className="ticker">{tickerText}</div></div>
        )}
      </div>
    </div>
  );
};

export default InfoBar;
```

## Product Slide Component (Structure Example)

```typescript
// src/components/slides/ProductSlide.tsx
// Note: See actual file for full implementation details and styling.
import React from 'react';
import { motion } from 'framer-motion';
import { Product } from '../../types';
import ProductImage from '../ProductImage';
import { formatCurrency } from '../../utils/currencyUtils';

type ProductSlideProps = { product: Product };

const ProductSlide: React.FC<ProductSlideProps> = ({ product }) => {
  // ... logic to check for discounts, multiple tiers ...

  return (
    <div className="h-full w-full flex flex-col">
      {/* Header */}
      <motion.div /* ... */ >{/* ... Category Name ... */}</motion.div>
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="grid grid-cols-2">
          {/* Product Image */}
          <motion.div /* ... */ >
            <ProductImage src={product.image_url || ''} alt={product.name} />
          </motion.div>
          {/* Product Details */}
          <div className="flex flex-col justify-center">
            <motion.div /* ... */ >
              <h1 className="product-name">{product.name}</h1>
              <p>{product.description}</p>
              {/* Price Display Logic (Discounted/Tiered/Regular) */}
              {/* ... using formatCurrency ... */}
            </motion.div>
          </div>
        </div>
      </div>
      {/* Special Tag (Optional) */}
      {product.special && <motion.div /* ... */ >SPECIAL OFFER</motion.div>}
    </div>
  );
};

export default ProductSlide;
```
