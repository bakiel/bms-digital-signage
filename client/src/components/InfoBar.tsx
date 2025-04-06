import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Announcement } from '../types';

const InfoBar: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  
  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Fetch weather data
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // If you have a weather API key set up:
        // const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
        // const response = await fetch(
        //   `https://api.openweathermap.org/data/2.5/weather?q=Gaborone,BW&units=metric&appid=${apiKey}`
        // );
        // const data = await response.json();
        // setWeather(data);
        
        // Placeholder weather data if API key is unavailable:
        setWeather({
          main: { temp: 28 },
          weather: [{ description: 'Sunny', main: 'Clear' }] // Added main for emoji mapping
        });
      } catch (error) {
        console.error('Error fetching weather:', error);
      }
    };
    
    fetchWeather();
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Fetch ticker announcements
  useEffect(() => {
    const fetchAnnouncements = async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('type', 'ticker')
        .eq('active', true);
      
      if (!error && data) {
        setAnnouncements(data);
      }
    };
    
    fetchAnnouncements();
    
    const subscription = supabase
      .channel('public:announcements')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, 
        () => fetchAnnouncements())
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Format date according to Botswana standards (DD Month YYYY)
  const formattedDate = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(currentTime);
  
  // Format time with 12-hour clock
  const formattedTime = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(currentTime);
  
  return (
    <div className="info-bar">
      {/* Logo */}
      <img src="/images/1_BMS white Logo.svg" alt="BMS Logo" className="info-bar-logo" />
      
      {/* Time & Date */}
      <div className="info-bar-datetime">
        <div className="info-bar-time">{formattedTime}</div>
        <div className="info-bar-date">{formattedDate}</div>
      </div>
      
      {/* Weather */}
      {weather && (
        <div className="info-bar-weather">
          {getWeatherEmoji(weather.weather[0]?.main)} {Math.round(weather.main.temp)}°C, Gaborone
        </div>
      )}
      
      {/* Announcements Ticker */}
      <div className="info-bar-ticker-container">
        {announcements.length > 0 && (
          <div className="ticker-wrap">
            <div className="ticker">
              {announcements.map(a => a.content).join(' • ')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to get emoji based on weather condition (can be expanded)
const getWeatherEmoji = (condition: string | undefined): string => {
  if (!condition) return '🌡️'; // Default
  const lowerCondition = condition.toLowerCase();
  if (lowerCondition.includes('clear')) return '☀️';
  if (lowerCondition.includes('clouds')) return '☁️';
  if (lowerCondition.includes('rain')) return '🌧️';
  if (lowerCondition.includes('drizzle')) return '🌦️';
  if (lowerCondition.includes('thunderstorm')) return '⛈️';
  if (lowerCondition.includes('snow')) return '❄️';
  if (lowerCondition.includes('mist') || lowerCondition.includes('fog')) return '🌫️';
  return '🌡️'; // Default for other conditions
};

export default InfoBar;
