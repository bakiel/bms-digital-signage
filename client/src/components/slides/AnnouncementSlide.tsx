import React from 'react';
import { Announcement } from '../../types';

type AnnouncementSlideProps = {
  announcement: Announcement;
};

const AnnouncementSlide: React.FC<AnnouncementSlideProps> = ({ announcement }) => {
  return (
    <div className="slide announcement-slide relative"> {/* Add relative positioning for absolute children */}
      {/* BMS Logo */}
      <img
        src="/images/1_BMS white Logo.svg"
        alt="BMS Logo"
        className="absolute top-4 right-6 h-10 w-auto" // Position top-right, fixed height
      />
      <h2 className="announcement-title">{announcement.title}</h2>
      
      {/* Image Display - Handles both full URLs and relative paths in image_url */}
      {announcement.image_url && (() => {
        const imageUrlFromDb = announcement.image_url;
        const isFullUrl = imageUrlFromDb.startsWith('http');
        
        const src = isFullUrl
          ? imageUrlFromDb // Use the full URL directly from DB
          : `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${imageUrlFromDb}`; // Construct URL if relative path

        return (
          <img
            src={src}
            alt={announcement.title || ''}
            // Adjusted classes: limit width, ensure height adjusts, keep object-contain
            className="announcement-image mb-8 max-h-[50vh] max-w-[80%] w-auto h-auto object-contain mx-auto"
            onError={(e) => {
              console.error(`Error loading image: ${e.currentTarget.src}`);
              // e.currentTarget.src = '/images/placeholder.svg';
            }}
          />
        );
      })()}
      
      <div className="announcement-content">
        {announcement.content}
      </div>
    </div>
  );
};

export default AnnouncementSlide;
