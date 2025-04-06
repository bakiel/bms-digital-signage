import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; 
import { supabase } from '../utils/supabaseClient';
import { Product, Category, Announcement } from '../types';
import ProductSlide from './slides/ProductSlide';
import CategorySlide from './slides/CategorySlide';
import AnnouncementSlide from './slides/AnnouncementSlide';
import InfoBar from './InfoBar';

type Slide = {
  id: string;
  type: 'product' | 'category' | 'announcement';
  data: Product | Category | Announcement;
  priority?: number;
};

// Animation variants for a more dynamic "transformer-like" effect
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 0.7, 
    rotateY: direction > 0 ? -60 : 60, 
    filter: "blur(10px)" 
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1, 
    rotateY: 0,
    filter: "blur(0px)" 
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 0.7, 
    rotateY: direction < 0 ? 60 : -60, 
    filter: "blur(10px)" 
  })
};

const SlideShow: React.FC = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [[page, direction], setPage] = useState([0, 0]); 
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement); 
  const [isLoading, setIsLoading] = useState(true);
  const [cursorMoved, setCursorMoved] = useState(false); // State for cursor activity
  
  // Fetch slides
  useEffect(() => {
    const fetchSlides = async () => {
      setIsLoading(true);
      // ... (fetch logic remains the same) ...
       // Fetch products
      const { data: products } = await supabase
        .from('products')
        .select('*, category:categories(*), product_prices(*)')
        .eq('active', true)
        .eq('featured', true);
      
      // Fetch categories
      const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true, nullsFirst: false });
      
      // Fetch announcements
      const { data: announcements } = await supabase
        .from('announcements')
        .select('*')
        .eq('active', true)
        .eq('type', 'slide');
      
      // Create slides array
      const productSlides: Slide[] = (products || []).map(product => ({
        id: `product-${product.id}`,
        type: 'product',
        data: product,
        priority: product.special ? 2 : 1
      }));
      
      const categorySlides: Slide[] = (categories || []).map(category => ({
        id: `category-${category.id}`,
        type: 'category',
        data: category,
        priority: 0
      }));
      
      const announcementSlides: Slide[] = (announcements || []).map(announcement => ({
        id: `announcement-${announcement.id}`,
        type: 'announcement',
        data: announcement,
        priority: 3
      }));
      
      // Combine all slides
      const allSlides = [...productSlides, ...categorySlides, ...announcementSlides];
      
      // Sort by priority (higher numbers first)
      allSlides.sort((a, b) => (b.priority || 0) - (a.priority || 0));
      
      setSlides(allSlides);
      // Simulate loading time if needed for testing animation
      // setTimeout(() => setIsLoading(false), 1500); 
      setIsLoading(false); 
    };
    
    fetchSlides();
    
    // ... (subscriptions remain the same) ...
    const productsSubscription = supabase
      .channel('public:products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, fetchSlides)
      .subscribe();
    
    const announcementsSubscription = supabase
      .channel('public:announcements')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, fetchSlides)
      .subscribe();
    
    return () => {
      productsSubscription.unsubscribe();
      announcementsSubscription.unsubscribe();
    };
  }, []);
  
  // Auto-advance slides
  useEffect(() => {
    if (isLoading || slides.length === 0) return; 
    
    const slideDuration = 8000; 
    
    const interval = setInterval(() => {
      const nextPage = (page + 1) % slides.length;
      setPage([nextPage, 1]); 
    }, slideDuration);
    
    return () => clearInterval(interval);
  }, [isLoading, slides, page]); 
  
  // Show/hide admin controls on cursor movement
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    const handleMouseMove = () => {
      setCursorMoved(true);
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setCursorMoved(false), 3000); // Hide after 3s
    };

    window.addEventListener('mousemove', handleMouseMove);
    // Initial move to show controls briefly on load
    handleMouseMove(); 

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []); // Run once on mount

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLoading) return; 

      if (e.key === 'ArrowRight' && slides.length > 0) {
        const nextPage = (page + 1) % slides.length;
        setPage([nextPage, 1]); 
      } else if (e.key === 'ArrowLeft' && slides.length > 0) {
        const prevPage = (page - 1 + slides.length) % slides.length;
        setPage([prevPage, -1]); 
      } else if (e.key === 'f') {
        toggleFullscreen();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLoading, slides.length, page]); 

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.error('Error attempting to enable fullscreen:', err));
    } else {
      document.exitFullscreen().catch(err => console.error('Error attempting to exit fullscreen:', err));
    }
  };
  
  // Update fullscreen state on change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Render current slide
  const renderSlide = (slide: Slide) => {
    switch (slide.type) {
      case 'product':
        return <ProductSlide product={slide.data as Product} />;
      case 'category':
        return <CategorySlide category={slide.data as Category} />;
      case 'announcement':
        return <AnnouncementSlide announcement={slide.data as Announcement} />;
      default:
        return null;
    }
  };
  
  // Loading State
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="fading-blocks-loader">
            {[...Array(9)].map((_, i) => <div key={i} className="block"></div>)}
          </div>
          <div className="loading-text">Loading Display...</div>
        </div>
      </div>
    );
  }
  
  // Empty State
  if (slides.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-blue-50">
        <div className="text-2xl text-blue-900">No content available</div>
      </div>
    );
  }
  
  // Main Render using Flexbox Layout
  return (
    <div className="signage-layout"> {/* New top-level container */}
      {/* Info Bar (Header) */}
      <InfoBar />
      
      {/* Main Content Area (Slideshow) */}
      <main className="signage-main-content"> {/* Flex-grow area */}
        <AnimatePresence initial={false} custom={direction} mode="wait"> 
          <motion.div
            key={page} 
            custom={direction} 
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              type: "spring", 
              stiffness: 150, 
              damping: 20,    
              opacity: { duration: 0.4 }, 
              filter: { duration: 0.4 }
            }}
            className="slide-wrapper" /* Wrapper for positioning */
          >
            {renderSlide(slides[page])} 
          </motion.div>
        </AnimatePresence> 
      </main>
      
      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          BMS Digital Signage — Powered by Aleph Creative-Hub
        </div>
        <div className="slide-indicators">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`slide-indicator ${index === page ? 'active' : ''}`} 
              onClick={() => {
                const newDirection = index > page ? 1 : -1;
                setPage([index, newDirection]); 
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
        <div className={`admin-controls ${cursorMoved ? 'controls-visible' : ''}`}>
          <button 
            className="admin-button"
            onClick={() => window.location.href = '/admin'}
          >
            Admin
          </button>
          <button 
            className="admin-button"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'} 
          </button>
        </div>
      </footer>
    </div>
  );
};

export default SlideShow;
