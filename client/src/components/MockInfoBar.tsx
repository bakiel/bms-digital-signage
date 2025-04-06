import React, { useState, useEffect } from 'react';
import { useMockData } from '../utils/MockDataProvider';

const MockInfoBar: React.FC = () => {
  const { announcements } = useMockData();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Format date and time for Botswana
  const formattedTime = currentTime.toLocaleTimeString('en-BW', {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const formattedDate = currentTime.toLocaleDateString('en-BW', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });

  // Filter ticker announcements
  const tickerAnnouncements = announcements.filter(a => a.type === 'ticker');

  // Combine all announcements into a single string for the ticker
  const tickerText = tickerAnnouncements.length > 0
    ? tickerAnnouncements.map(a => a.content).join(' • ')
    : 'Welcome to BMS Digital Signage';

  return (
    <div className="bg-blue-900 text-white p-2 flex items-center justify-between shadow-md">
      {/* Logo and Time Section */}
      <div className="flex items-center space-x-4">
        {/* BMS Logo */}
        <div className="text-xl font-bold">BMS</div>
        
        {/* Time and Date */}
        <div className="flex flex-col">
          <div className="text-xl font-bold">{formattedTime}</div>
          <div className="text-xs opacity-80">{formattedDate}</div>
        </div>
      </div>
      
      {/* Weather Section */}
      <div className="flex items-center px-4">
        <div className="flex items-center">
          {/* Weather Icon */}
          <div className="w-10 h-10 mr-1 flex items-center justify-center">
            <i className="fas fa-sun text-yellow-300 text-2xl"></i>
          </div>
          
          {/* Temperature and Location */}
          <div className="flex flex-col">
            <div className="text-xl font-bold">
              28°C
            </div>
            <div className="text-xs opacity-80">
              Gaborone
            </div>
          </div>
        </div>
      </div>
      
      {/* Announcements Ticker */}
      <div className="flex-1 overflow-hidden">
        <div className="relative w-full h-6 overflow-hidden">
          <div className="absolute whitespace-nowrap animate-marquee">
            {tickerText}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockInfoBar;