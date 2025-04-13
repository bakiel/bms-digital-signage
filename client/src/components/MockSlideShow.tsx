import React, { useState, useEffect } from 'react'; // Removed unused useCallback
import { motion, AnimatePresence } from 'framer-motion';
import MockProductSlide from './slides/MockProductSlide';
import MockCategorySlide from './slides/MockCategorySlide';
import MockAnnouncementSlide from './slides/MockAnnouncementSlide';
import ParticleBackground from './ParticleBackground';
import { useMockData } from '../utils/MockDataProvider';

// Define slide types
type SlideType = 'product' | 'category' | 'announcement';

// Define slide data structure
type Slide = {
  id: string;
  type: SlideType;
  data: any;
};

const MockSlideShow: React.FC = () => {
  const { products, categories, announcements } = useMockData();
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [cursorMoved, setCursorMoved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Transform mock data into slides
  useEffect(() => {
    try {
      // Transform data into slides
      const productSlides = products.map(product => ({
        id: `product-${product.id}`,
        type: 'product' as SlideType,
        data: product
      }));

      const categorySlides = categories.map(category => ({
        id: `category-${category.id}`,
        type: 'category' as SlideType,
        data: category
      }));

      const announcementSlides = announcements
        .filter(announcement => announcement.type === 'slide')
        .map(announcement => ({
          id: `announcement-${announcement.id}`,
          type: 'announcement' as SlideType,
          data: announcement
        }));

      // Combine all slides and shuffle featured products with categories
      const allSlides = [
        ...productSlides.filter(slide => slide.data.featured),
        ...categorySlides,
        ...announcementSlides
      ];

      // Add special products at the beginning
      const specialProducts = productSlides.filter(slide => slide.data.special);
      
      setSlides([...specialProducts, ...allSlides]);
      setLoading(false);
    } catch (err: any) {
      console.error('Error processing slides:', err);
      setError(err.message || 'Failed to process slides');
      setLoading(false);
    }
  }, [products, categories, announcements]);

  // Advance slides automatically
  useEffect(() => {
    if (slides.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex(current => (current + 1) % slides.length);
    }, 10000); // 10 seconds per slide

    return () => clearInterval(interval);
  }, [slides]);

  // Handle cursor movement to show admin controls
  useEffect(() => {
    const handleMouseMove = () => {
      setCursorMoved(true);
      // Hide controls after 3 seconds of inactivity
      setTimeout(() => setCursorMoved(false), 3000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setCurrentIndex(current => (current + 1) % slides.length);
      } else if (e.key === 'ArrowLeft') {
        setCurrentIndex(current => (current - 1 + slides.length) % slides.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slides.length]);

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(err => console.error('Error attempting to enable fullscreen:', err));
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
          .then(() => setIsFullscreen(false))
          .catch(err => console.error('Error attempting to exit fullscreen:', err));
      }
    }
  };

  // Navigate to previous slide
  const prevSlide = () => {
    setCurrentIndex(current => (current - 1 + slides.length) % slides.length);
  };

  // Navigate to next slide
  const nextSlide = () => {
    setCurrentIndex(current => (current + 1) % slides.length);
  };

  // Render current slide based on type
  const renderSlide = (slide: Slide) => {
    switch (slide.type) {
      case 'product':
        return <MockProductSlide product={slide.data} />;
      case 'category':
        return <MockCategorySlide category={slide.data} />;
      case 'announcement':
        return <MockAnnouncementSlide announcement={slide.data} />;
      default:
        return null;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-xl text-gray-700">Loading slides...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-lg">
          <h3 className="text-xl font-bold mb-2">Error Loading Slides</h3>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No slides state
  if (slides.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center max-w-lg">
          <i className="fas fa-images text-5xl text-gray-400 mb-4"></i>
          <h3 className="text-2xl font-bold text-gray-700 mb-2">No Content Available</h3>
          <p className="text-gray-600">
            There are no products, categories, or announcements to display. 
            Please add content through the admin interface.
          </p>
          <button 
            onClick={() => window.location.href = '/admin'}
            className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Go to Admin
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full overflow-hidden bg-gray-100">
      {/* Animated Background */}
      <ParticleBackground
        variant={slides[currentIndex]?.type === 'announcement' ? 'blue' : 'light'}
        density="medium"
      />
      
      {/* Main Slideshow */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="h-full w-full"
        >
          {renderSlide(slides[currentIndex])}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Dots */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full ${
              index === currentIndex ? 'bg-blue-600' : 'bg-gray-400'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Navigation Arrows - Always visible on large screens, visible on hover on small screens */}
      <div className="hidden md:block">
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full"
          aria-label="Previous slide"
        >
          <i className="fas fa-chevron-left text-xl"></i>
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full"
          aria-label="Next slide"
        >
          <i className="fas fa-chevron-right text-xl"></i>
        </button>
      </div>

      {/* Admin Controls - Appear on mouse movement */}
      {cursorMoved && (
        <div className="absolute bottom-4 right-4 flex space-x-2 bg-black/70 p-2 rounded-lg backdrop-blur-sm">
          <button
            onClick={() => window.location.href = '/admin'}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center"
            aria-label="Go to admin panel"
          >
            <i className="fas fa-cog mr-2"></i>
            Admin
          </button>
          <button
            onClick={toggleFullscreen}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded flex items-center"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            <i className={`fas ${isFullscreen ? 'fa-compress' : 'fa-expand'} mr-2`}></i>
            {isFullscreen ? 'Exit' : 'Fullscreen'}
          </button>
        </div>
      )}

      {/* Memory Management - Auto refresh after 4 hours */}
      <div className="hidden">
        {(() => {
          // Set up auto-refresh after 4 hours to prevent memory issues
          setTimeout(() => {
            window.location.reload();
          }, 4 * 60 * 60 * 1000);
          return null;
        })()}
      </div>
    </div>
  );
};

export default MockSlideShow;