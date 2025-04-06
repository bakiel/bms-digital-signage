import React, { useEffect } from 'react';
import MockSlideShow from '../components/MockSlideShow';
import MockInfoBar from '../components/MockInfoBar';
import ErrorBoundary from '../components/ErrorBoundary';
import { MockDataProvider } from '../utils/MockDataProvider';

/**
 * MockDisplay component for the BMS Digital Signage system
 * This version uses mock data instead of Supabase for testing
 */
const MockDisplay: React.FC = () => {
  // Set up memory management for long-running sessions
  useEffect(() => {
    // Refresh the page every 4 hours to prevent memory issues
    const refreshTimer = setTimeout(() => {
      window.location.reload();
    }, 4 * 60 * 60 * 1000); // 4 hours

    return () => clearTimeout(refreshTimer);
  }, []);

  return (
    <MockDataProvider>
      <div className="flex flex-col h-screen overflow-hidden">
        {/* Top information bar */}
        <ErrorBoundary>
          <MockInfoBar />
        </ErrorBoundary>
        
        {/* Main slideshow area */}
        <div className="flex-1 overflow-hidden">
          <ErrorBoundary>
            <MockSlideShow />
          </ErrorBoundary>
        </div>
      </div>
    </MockDataProvider>
  );
};

export default MockDisplay;