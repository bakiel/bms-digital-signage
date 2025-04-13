# MI TV Stick Backend Optimization Guide

This document provides specific recommendations for optimizing the BMS Digital Signage backend for deployment on MI TV Stick devices, focusing on performance considerations for digital signage applications.

## Table of Contents
1. [Performance Considerations](#performance-considerations)
2. [Data Loading Strategies](#data-loading-strategies)
3. [Image Optimization](#image-optimization)
4. [Caching Strategies](#caching-strategies)
5. [Error Handling & Recovery](#error-handling--recovery)
6. [Offline Capabilities](#offline-capabilities)
7. [Memory Management](#memory-management)
8. [Network Optimization](#network-optimization)

## Performance Considerations

### MI TV Stick Hardware Limitations
- **CPU**: Quad-core ARM Cortex-A53
- **RAM**: 1GB (limited memory for browser operations)
- **Storage**: 8GB (limited local storage)
- **Network**: WiFi 802.11 a/b/g/n/ac (potentially unstable in retail environments)

### Browser Performance
- Chrome/Android WebView has limited resources on MI TV Stick
- Rendering large DOM trees can cause performance issues
- Heavy JavaScript execution can cause UI freezes
- Memory leaks can accumulate over time in long-running applications

### Optimization Targets
- Initial load time under 5 seconds
- Smooth transitions between slides (60fps)
- Minimal memory growth over time
- Graceful handling of network interruptions
- Automatic recovery from errors

## Data Loading Strategies

### Initial Data Load
```typescript
// Implement progressive loading strategy
const loadInitialData = async () => {
  // 1. Load essential settings first
  const { data: settings } = await supabase
    .from('settings')
    .select('*')
    .eq('key', 'display_settings')
    .single();
    
  // 2. Load categories (small dataset)
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('display_order');
    
  // 3. Load active announcements (small dataset)
  const now = new Date().toISOString();
  const { data: announcements } = await supabase
    .from('announcements')
    .select('*')
    .eq('active', true)
    .lte('start_date', now)
    .gte('end_date', now);
    
  // 4. Load featured products first (limited set)
  const { data: featuredProducts } = await supabase
    .from('products')
    .select(`
      *,
      categories(id, name),
      product_prices(*)
    `)
    .eq('active', true)
    .eq('featured', true);
    
  // 5. Start displaying content with what we have
  initializeDisplay(settings, categories, announcements, featuredProducts);
    
  // 6. Load remaining products in background
  loadRemainingProducts();
};
```

### Background Loading
```typescript
const loadRemainingProducts = async () => {
  // Load products by category in sequence to avoid overwhelming the device
  const { data: categories } = await supabase
    .from('categories')
    .select('id')
    .order('display_order');
    
  for (const category of categories) {
    const { data: products } = await supabase
      .from('products')
      .select(`
        *,
        product_prices(*)
      `)
      .eq('active', true)
      .eq('category_id', category.id);
      
    // Update display with new products as they load
    updateProductsForCategory(category.id, products);
    
    // Small delay between category loads to prevent UI freezing
    await new Promise(resolve => setTimeout(resolve, 100));
  }
};
```

### Incremental Updates
```typescript
// Subscribe only to essential changes
const setupRealTimeUpdates = () => {
  // Listen for announcement changes (high priority)
  const announcementSubscription = supabase
    .channel('public:announcements')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'announcements',
      filter: 'active=eq.true'
    }, handleAnnouncementUpdate)
    .subscribe();
    
  // Listen for featured product changes (medium priority)
  const featuredProductSubscription = supabase
    .channel('public:products:featured')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'products',
      filter: 'featured=eq.true'
    }, handleProductUpdate)
    .subscribe();
    
  // Listen for settings changes (low frequency)
  const settingsSubscription = supabase
    .channel('public:settings')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'settings'
    }, handleSettingsUpdate)
    .subscribe();
    
  return {
    announcementSubscription,
    featuredProductSubscription,
    settingsSubscription
  };
};
```

## Image Optimization

### Image Sizing Guidelines
- **Product Images**: 800x800px maximum (optimize for 400x400px display)
- **Category Images**: 600x400px maximum
- **Announcement Images**: 1280x720px maximum (16:9 ratio for TV display)

### Image Loading Strategy
```typescript
// Progressive image loading component
const OptimizedImage = ({ 
  path, 
  alt, 
  width, 
  height, 
  priority = false 
}) => {
  const [loaded, setLoaded] = useState(false);
  const imageUrl = getImageUrl(path);
  
  // For high-priority images, preload
  useEffect(() => {
    if (priority) {
      const img = new Image();
      img.src = imageUrl;
      img.onload = () => setLoaded(true);
    }
  }, [imageUrl, priority]);
  
  return (
    <div 
      className={`image-container ${!loaded ? 'loading' : ''}`}
      style={{ width, height }}
    >
      {/* Low-quality placeholder */}
      {!loaded && <div className="image-placeholder" />}
      
      {/* Actual image with lazy loading for non-priority images */}
      <img
        src={imageUrl}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={() => setLoaded(true)}
        className={loaded ? 'loaded' : ''}
      />
    </div>
  );
};
```

### Supabase Image Transformations
```typescript
// Utilize Supabase image transformations for optimal sizing
const getOptimizedImageUrl = (path, width, height, quality = 80) => {
  const baseUrl = supabase.storage.from('images').getPublicUrl(path).data.publicUrl;
  
  // Add transformation parameters
  return `${baseUrl}?width=${width}&height=${height}&quality=${quality}&resize=contain`;
};
```

## Caching Strategies

### Local Storage Caching
```typescript
// Cache essential data in localStorage
const cacheData = (key, data, expiryMinutes = 60) => {
  const item = {
    data,
    expiry: new Date().getTime() + (expiryMinutes * 60 * 1000)
  };
  
  try {
    localStorage.setItem(`bms_cache_${key}`, JSON.stringify(item));
    return true;
  } catch (error) {
    console.error('Cache storage error:', error);
    return false;
  }
};

const getCachedData = (key) => {
  try {
    const item = JSON.parse(localStorage.getItem(`bms_cache_${key}`));
    
    if (!item) return null;
    
    // Check if expired
    if (new Date().getTime() > item.expiry) {
      localStorage.removeItem(`bms_cache_${key}`);
      return null;
    }
    
    return item.data;
  } catch (error) {
    console.error('Cache retrieval error:', error);
    return null;
  }
};
```

### Hybrid Loading Pattern
```typescript
// Load data with cache fallback
const loadCategoriesWithCache = async () => {
  // Try to show cached data immediately
  const cachedCategories = getCachedData('categories');
  if (cachedCategories) {
    // Use cached data for immediate display
    updateCategoriesDisplay(cachedCategories);
  }
  
  try {
    // Fetch fresh data
    const { data: freshCategories, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order');
      
    if (error) throw error;
    
    // Update display with fresh data
    updateCategoriesDisplay(freshCategories);
    
    // Update cache
    cacheData('categories', freshCategories, 120); // 2 hour expiry
    
    return freshCategories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    
    // If we have cached data, use it as fallback
    if (cachedCategories) {
      return cachedCategories;
    }
    
    // Otherwise return empty array
    return [];
  }
};
```

### Image Caching
```typescript
// Implement service worker for image caching
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('ServiceWorker registered with scope:', registration.scope);
    } catch (error) {
      console.error('ServiceWorker registration failed:', error);
    }
  }
};

// In sw.js
const CACHE_NAME = 'bms-image-cache-v1';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

self.addEventListener('fetch', (event) => {
  // Only cache image requests from our storage bucket
  if (event.request.url.includes('/storage/v1/object/public/images/')) {
    event.respondWith(cacheFirst(event.request));
  }
});

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  
  // Check cache first
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    // Check if cache is still valid
    const cachedDate = new Date(cachedResponse.headers.get('date'));
    if ((new Date() - cachedDate) < CACHE_DURATION) {
      return cachedResponse;
    }
  }
  
  // If not in cache or expired, fetch from network
  try {
    const networkResponse = await fetch(request);
    
    // Cache the new response
    cache.put(request, networkResponse.clone());
    
    return networkResponse;
  } catch (error) {
    // If network fails but we have a cached version (even expired), use it
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Otherwise, fail
    throw error;
  }
}
```

## Error Handling & Recovery

### Network Error Recovery
```typescript
// Implement exponential backoff for API requests
const fetchWithRetry = async (
  fetchFn, 
  maxRetries = 5, 
  initialDelay = 1000
) => {
  let retries = 0;
  let delay = initialDelay;
  
  while (retries < maxRetries) {
    try {
      return await fetchFn();
    } catch (error) {
      retries++;
      
      // If we've reached max retries, throw the error
      if (retries >= maxRetries) {
        throw error;
      }
      
      console.log(`Retry ${retries}/${maxRetries} after ${delay}ms`);
      
      // Wait for the delay period
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Exponential backoff with jitter
      delay = delay * 1.5 * (0.9 + Math.random() * 0.2);
    }
  }
};
```

### Application Error Boundary
```typescript
// React error boundary for display components
class DisplayErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorCount: 0 };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Display error:", error, errorInfo);
    
    // Track error count
    this.setState(prevState => ({
      errorCount: prevState.errorCount + 1
    }));
    
    // Log error to monitoring service
    logErrorToService(error, errorInfo);
  }
  
  componentDidUpdate(prevProps, prevState) {
    // If we've had multiple errors, refresh the page
    if (this.state.errorCount >= 3 && prevState.errorCount < 3) {
      setTimeout(() => {
        window.location.reload();
      }, 5000); // Wait 5 seconds before refresh
    }
    
    // Try to recover from single errors
    if (this.state.hasError && this.state.errorCount < 3) {
      setTimeout(() => {
        this.setState({ hasError: false });
      }, 10000); // Try to recover after 10 seconds
    }
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="error-container">
          <h2>Display Temporarily Unavailable</h2>
          <p>The system is recovering...</p>
          {this.state.errorCount >= 3 && (
            <p>Refreshing page in a few seconds...</p>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Automatic Refresh Strategy
```typescript
// Implement periodic refresh to prevent memory issues
const setupAutoRefresh = () => {
  // Refresh every 4 hours
  const REFRESH_INTERVAL = 4 * 60 * 60 * 1000;
  
  // Schedule refresh during likely inactive hours (e.g., 3 AM)
  const scheduleRefresh = () => {
    const now = new Date();
    const refreshTime = new Date();
    
    // Set to 3 AM
    refreshTime.setHours(3, 0, 0, 0);
    
    // If it's already past 3 AM, schedule for tomorrow
    if (now > refreshTime) {
      refreshTime.setDate(refreshTime.getDate() + 1);
    }
    
    const timeUntilRefresh = refreshTime.getTime() - now.getTime();
    
    // Set timeout for refresh
    setTimeout(() => {
      // Save any important state to localStorage
      saveStateBeforeRefresh();
      
      // Reload the page
      window.location.reload();
    }, timeUntilRefresh);
  };
  
  // Also set a maximum uptime
  setTimeout(() => {
    saveStateBeforeRefresh();
    window.location.reload();
  }, REFRESH_INTERVAL);
  
  // Schedule the next refresh
  scheduleRefresh();
};
```

## Offline Capabilities

### Essential Offline Content
```typescript
// Store essential content for offline display
const prepareOfflineContent = async () => {
  try {
    // 1. Cache essential settings
    const { data: settings } = await supabase
      .from('settings')
      .select('*')
      .eq('key', 'display_settings')
      .single();
      
    cacheData('settings', settings, 24 * 60); // 24 hour expiry
    
    // 2. Cache featured products
    const { data: featuredProducts } = await supabase
      .from('products')
      .select(`
        *,
        categories(id, name),
        product_prices(*)
      `)
      .eq('active', true)
      .eq('featured', true);
      
    cacheData('featured_products', featuredProducts, 24 * 60);
    
    // 3. Cache active announcements
    const now = new Date().toISOString();
    const { data: announcements } = await supabase
      .from('announcements')
      .select('*')
      .eq('active', true)
      .lte('start_date', now)
      .gte('end_date', now);
      
    cacheData('announcements', announcements, 24 * 60);
    
    // 4. Preload and cache images for featured products
    if (featuredProducts) {
      for (const product of featuredProducts) {
        if (product.image_url) {
          const img = new Image();
          img.src = getImageUrl(product.image_url);
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error preparing offline content:', error);
    return false;
  }
};
```

### Offline Detection & Handling
```typescript
// Detect and handle offline status
const setupOfflineDetection = () => {
  const updateOfflineStatus = () => {
    const isOffline = !navigator.onLine;
    document.body.classList.toggle('offline-mode', isOffline);
    
    if (isOffline) {
      console.log('Network connection lost. Switching to offline mode.');
      activateOfflineMode();
    } else {
      console.log('Network connection restored. Resuming online mode.');
      deactivateOfflineMode();
    }
  };
  
  // Initial check
  updateOfflineStatus();
  
  // Listen for changes
  window.addEventListener('online', updateOfflineStatus);
  window.addEventListener('offline', updateOfflineStatus);
  
  return () => {
    window.removeEventListener('online', updateOfflineStatus);
    window.removeEventListener('offline', updateOfflineStatus);
  };
};

const activateOfflineMode = () => {
  // Switch to cached content
  const cachedProducts = getCachedData('featured_products') || [];
  const cachedAnnouncements = getCachedData('announcements') || [];
  
  // Update UI to show offline status
  showOfflineBanner();
  
  // Use cached data for display
  updateProductsDisplay(cachedProducts);
  updateAnnouncementsDisplay(cachedAnnouncements);
};

const deactivateOfflineMode = async () => {
  // Hide offline banner
  hideOfflineBanner();
  
  // Refresh data from server
  await loadInitialData();
  
  // Update offline cache with fresh data
  prepareOfflineContent();
};
```

## Memory Management

### Component Optimization
```typescript
// Optimize React components to minimize memory usage
// Use React.memo for pure components
const ProductCard = React.memo(({ product }) => {
  // Component implementation
});

// Use useCallback for event handlers
const SlideControls = () => {
  const handleNext = useCallback(() => {
    // Handle next slide
  }, []);
  
  const handlePrev = useCallback(() => {
    // Handle previous slide
  }, []);
  
  return (
    <div className="slide-controls">
      <button onClick={handlePrev}>Previous</button>
      <button onClick={handleNext}>Next</button>
    </div>
  );
};

// Use useMemo for expensive calculations
const ProductGrid = ({ products, categoryId }) => {
  const filteredProducts = useMemo(() => {
    return categoryId 
      ? products.filter(p => p.category_id === categoryId)
      : products;
  }, [products, categoryId]);
  
  return (
    <div className="product-grid">
      {filteredProducts.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
```

### Memory Leak Prevention
```typescript
// Properly clean up resources to prevent memory leaks
const useSubscription = (setupFn) => {
  useEffect(() => {
    const subscription = setupFn();
    
    // Return cleanup function
    return () => {
      if (subscription) {
        if (Array.isArray(subscription)) {
          subscription.forEach(sub => {
            if (sub && typeof sub.unsubscribe === 'function') {
              sub.unsubscribe();
            }
          });
        } else if (typeof subscription.unsubscribe === 'function') {
          subscription.unsubscribe();
        }
      }
    };
  }, []);
};

// Usage
const ProductDisplay = () => {
  useSubscription(() => {
    return supabase
      .channel('public:products')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'products'
      }, handleProductUpdate)
      .subscribe();
  });
  
  // Rest of component
};
```

### Garbage Collection Hints
```typescript
// Periodically hint to garbage collector
const setupMemoryManagement = () => {
  // Every 30 minutes, try to free up memory
  setInterval(() => {
    // Clear any internal caches
    clearInternalCaches();
    
    // Remove old items from localStorage
    cleanupLocalStorage();
    
    // Force image unloading for off-screen slides
    unloadOffscreenImages();
    
    // In some browsers, this can help trigger GC
    if (window.gc) {
      window.gc();
    }
  }, 30 * 60 * 1000);
};

const unloadOffscreenImages = () => {
  // Find all images that are not currently visible
  const offscreenSlides = document.querySelectorAll('.slide:not(.active)');
  
  offscreenSlides.forEach(slide => {
    const images = slide.querySelectorAll('img');
    
    images.forEach(img => {
      // Save the original src
      if (!img.dataset.src && img.src) {
        img.dataset.src = img.src;
        // Clear the src to unload the image
        img.src = '';
      }
    });
  });
  
  // When a slide becomes active, restore its images
  const activeSlide = document.querySelector('.slide.active');
  if (activeSlide) {
    const images = activeSlide.querySelectorAll('img');
    
    images.forEach(img => {
      if (img.dataset.src && !img.src) {
        img.src = img.dataset.src;
      }
    });
  }
};
```

## Network Optimization

### Request Batching
```typescript
// Batch multiple requests together
const batchRequests = async (requests) => {
  try {
    // Execute all requests in parallel
    const results = await Promise.all(requests);
    return results;
  } catch (error) {
    console.error('Batch request error:', error);
    throw error;
  }
};

// Usage
const loadDashboardData = async () => {
  try {
    const [
      { data: categories },
      { data: featuredProducts },
      { data: announcements }
    ] = await batchRequests([
      supabase.from('categories').select('*').order('display_order'),
      supabase.from('products').select('*').eq('featured', true),
      supabase.from('announcements').select('*').eq('active', true)
    ]);
    
    // Use the data
    updateDashboard(categories, featuredProducts, announcements);
  } catch (error) {
    console.error('Failed to load dashboard data:', error);
    // Handle error
  }
};
```

### Connection Monitoring
```typescript
// Monitor connection quality and adapt
const setupConnectionMonitoring = () => {
  // Check connection type if available
  if ('connection' in navigator) {
    const connection = navigator.connection;
    
    const updateConnectionQuality = () => {
      const isSlow = connection.downlink < 1.5 || connection.rtt > 500;
      
      if (isSlow) {
        enableLowBandwidthMode();
      } else {
        disableLowBandwidthMode();
      }
    };
    
    // Initial check
    updateConnectionQuality();
    
    // Listen for changes
    connection.addEventListener('change', updateConnectionQuality);
    
    return () => {
      connection.removeEventListener('change', updateConnectionQuality);
    };
  }
  
  // Fallback: monitor request performance
  let slowRequestCount = 0;
  
  // Intercept fetch to monitor performance
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const startTime = Date.now();
    try {
      const response = await originalFetch(...args);
      const duration = Date.now() - startTime;
      
      // If request took more than 3 seconds, consider it slow
      if (duration > 3000) {
        slowRequestCount++;
        
        // If we've had 3 slow requests in a row, enable low bandwidth mode
        if (slowRequestCount >= 3) {
          enableLowBandwidthMode();
        }
      } else {
        // Reset counter on fast request
        slowRequestCount = 0;
        
        // If we've had 5 fast requests in a row, disable low bandwidth mode
        if (slowRequestCount <= -5) {
          disableLowBandwidthMode();
        } else {
          slowRequestCount--;
        }
      }
      
      return response;
    } catch (error) {
      // Network error, increment slow count
      slowRequestCount++;
      throw error;
    }
  };
};

const enableLowBandwidthMode = () => {
  document.body.classList.add('low-bandwidth-mode');
  
  // Reduce image quality
  setImageQuality('low');
  
  // Increase cache duration
  setCacheDuration('long');
  
  // Disable animations
  disableAnimations();
  
  // Reduce polling frequency
  adjustPollingFrequency('low');
};

const disableLowBandwidthMode = () => {
  document.body.classList.remove('low-bandwidth-mode');
  
  // Restore image quality
  setImageQuality('high');
  
  // Reset cache duration
  setCacheDuration('normal');
  
  // Enable animations
  enableAnimations();
  
  // Restore polling frequency
  adjustPollingFrequency('normal');
};
```

By implementing these optimizations, the BMS Digital Signage backend will be well-suited for deployment on MI TV Stick devices, providing a smooth and reliable digital signage experience even with the hardware limitations of these devices.