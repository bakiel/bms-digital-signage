import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../utils/supabaseClient';
import { getSettings, Settings as SettingsData } from '../utils/settingsUtils';
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

// Simplified cross-fade animation variants
const slideVariants = {
  enter: {
    opacity: 0,
  },
  center: {
    zIndex: 1,
    opacity: 1,
  },
  exit: {
    zIndex: 0,
    opacity: 0,
  }
};

const SlideShow: React.FC = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [[page, direction], setPage] = useState([0, 0]);
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);
  const [isLoading, setIsLoading] = useState(true);
  const [cursorMoved, setCursorMoved] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [settings, setSettings] = useState<SettingsData | null>(null); // State for settings
  const [transitionDuration, setTransitionDuration] = useState(0.4); // Default transition duration

  // Ref to track mount status
  const isMounted = useRef(true);
  const navigate = useNavigate(); // Get navigate function

  // Effect for fetching data, settings, subscriptions, and auto-advance
  useEffect(() => {
    // Set mount status to true when component mounts
    isMounted.current = true;

    let intervalId: NodeJS.Timeout | null = null;
    let productsSubscription: ReturnType<typeof supabase.channel> | null = null;
    let announcementsSubscription: ReturnType<typeof supabase.channel> | null = null;

    const fetchDataAndSettings = async () => {
      if (isFetching || !isMounted.current) return;

      console.log("Fetching slides and settings...");
      setIsFetching(true);
      setIsLoading(true); // Ensure loading state is true during fetch

      try {
        const [settingsResult, productsResult, categoriesResult, announcementsResult] = await Promise.all([
          getSettings(),
          supabase.from('products').select('*, category:categories(*), product_prices(*)').eq('active', true).eq('featured', true),
          supabase.from('categories').select('*').order('display_order', { ascending: true, nullsFirst: false }),
          supabase.from('announcements').select('*').eq('active', true).eq('type', 'slide')
        ]);

        // Check mount status after promises resolve
        if (!isMounted.current) {
          console.log("Component unmounted after fetch, aborting state update.");
          return;
        }
        
        console.log("Raw Settings:", settingsResult);
        console.log("Raw Products:", productsResult);
        console.log("Raw Categories:", categoriesResult);
        console.log("Raw Announcements:", announcementsResult);

        // Process Settings
        console.log("Processing settings...");
        setSettings(settingsResult);
        setTransitionDuration(settingsResult.transition_duration);
        console.log("Settings processed.");

        // Check for data fetching errors
        if (productsResult.error) {
          console.error("Product fetch error:", productsResult.error);
          throw productsResult.error;
        }
        if (categoriesResult.error) {
           console.error("Category fetch error:", categoriesResult.error);
           throw categoriesResult.error;
        }
        if (announcementsResult.error) {
           console.error("Announcement fetch error:", announcementsResult.error);
           throw announcementsResult.error;
        }

        console.log("Processing fetched data...");
        const products = productsResult.data || [];
        const categories = categoriesResult.data || [];
        const announcements = announcementsResult.data || [];
        console.log(`Found ${products.length} products, ${categories.length} categories, ${announcements.length} announcements.`);

        // Create and sort slides
        console.log("Creating slides...");
        const productSlides: Slide[] = products.map(p => ({ id: `product-${p.id}`, type: 'product', data: p, priority: p.special ? 2 : 1 }));
        const categorySlides: Slide[] = categories.map(c => ({ id: `category-${c.id}`, type: 'category', data: c, priority: 0 }));
        const announcementSlides: Slide[] = announcements.map(a => ({ id: `announcement-${a.id}`, type: 'announcement', data: a, priority: 3 }));
        
        console.log(`Created ${productSlides.length} product slides, ${categorySlides.length} category slides, ${announcementSlides.length} announcement slides.`);
        
        const allSlides = [...productSlides, ...categorySlides, ...announcementSlides];
        console.log(`Total slides before sort: ${allSlides.length}`);
        allSlides.sort((a, b) => (b.priority || 0) - (a.priority || 0));
        console.log(`Total slides after sort: ${allSlides.length}`);

        setSlides(allSlides);
        console.log("Slides state updated.");
        setIsLoading(false); // Set loading to false after data is processed
        console.log("isLoading set to false.");

      } catch (error) {
        console.error("Error during fetchDataAndSettings try block:", error);
        if (isMounted.current) {
          setIsLoading(false); // Ensure loading stops on error
          console.log("isLoading set to false in catch block.");
        }
      } finally {
        if (isMounted.current) {
          setIsFetching(false);
          console.log("isFetching set to false in finally block.");
        }
        console.log("fetchDataAndSettings finally block executed.");
      }
    };

    // Initial fetch
    fetchDataAndSettings();

    // Setup subscriptions
    productsSubscription = supabase
      .channel('public:products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        console.log("Product change detected, refetching...");
        fetchDataAndSettings(); // Refetch all data on changes
      })
      .subscribe();

    announcementsSubscription = supabase
      .channel('public:announcements')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, () => {
        console.log("Announcement change detected, refetching...");
        fetchDataAndSettings(); // Refetch all data on changes
      })
      .subscribe();

    // Cleanup function
    return () => {
      console.log("Cleaning up SlideShow effect...");
      isMounted.current = false; // Set mount status to false on unmount
      if (intervalId) clearInterval(intervalId);
      if (productsSubscription) supabase.removeChannel(productsSubscription);
      if (announcementsSubscription) supabase.removeChannel(announcementsSubscription);
    };
  }, []); // Run only on mount

  // Effect for setting up auto-advance based on settings and slides
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    const setupAutoAdvance = () => {
      if (!isMounted.current || isLoading || !settings || slides.length === 0) {
         if (intervalId) clearInterval(intervalId); // Clear any existing interval if conditions not met
         console.log("Auto-advance setup skipped (loading, no settings, no slides, or unmounted).");
         return;
      }

      const autoRotationEnabled = settings.enable_auto_rotation;
      const slideDuration = settings.display_duration * 1000;

      // Clear existing interval before setting a new one
      if (intervalId) clearInterval(intervalId);

      if (autoRotationEnabled) {
        console.log(`Setting up auto-advance with duration: ${slideDuration}ms`);
        intervalId = setInterval(() => {
          if (isMounted.current) { // Check mount status before setting state
            setPage(prevPage => [(prevPage[0] + 1) % slides.length, 1]);
          }
        }, slideDuration);
      } else {
        console.log("Auto-advance disabled.");
      }
    };

    setupAutoAdvance(); // Call setup

    // Cleanup for this effect specifically
    return () => {
      if (intervalId) {
         clearInterval(intervalId);
         console.log("Cleared auto-advance interval on settings/slides/loading change.");
      }
    };
  // Rerun when loading state, settings, or slides change
  }, [isLoading, settings, slides]);


  // Show/hide admin controls on cursor movement
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    const handleMouseMove = () => {
      setCursorMoved(true);
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setCursorMoved(false), 3000); // Hide after 3s
    };

    window.addEventListener('mousemove', handleMouseMove);
    handleMouseMove(); // Initial move

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLoading || slides.length === 0) return;

      if (e.key === 'ArrowRight') {
        const nextPage = (page + 1) % slides.length;
        setPage([nextPage, 1]);
      } else if (e.key === 'ArrowLeft') {
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
    <div className="signage-layout">
      <InfoBar />
      <main className="signage-main-content">
        {/* Restored slide animation */}
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={page}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              opacity: { duration: transitionDuration }
            }}
            className="slide-wrapper"
          >
            {renderSlide(slides[page])}
          </motion.div>
        </AnimatePresence>
        {/* Removed test content */}
      </main>
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
            onClick={() => navigate('/admin')} // Use navigate for SPA routing
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
