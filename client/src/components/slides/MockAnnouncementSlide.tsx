import React from 'react';
import { motion } from 'framer-motion';
import MockProductImage from '../MockProductImage';

type Announcement = {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  type: 'ticker' | 'slide' | 'popup';
  active: boolean;
  start_date: string | null;
  end_date: string | null;
};

type MockAnnouncementSlideProps = {
  announcement: Announcement;
};

const MockAnnouncementSlide: React.FC<MockAnnouncementSlideProps> = ({ announcement }) => {
  // Format dates if they exist
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-BW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const startDate = formatDate(announcement.start_date);
  const endDate = formatDate(announcement.end_date);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12
      }
    }
  };

  // Determine if this is a time-limited announcement
  const isTimeLimited = announcement.start_date || announcement.end_date;

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-blue-900/90 to-indigo-800/90 text-white slide-container">
      {/* Announcement Header */}
      <motion.div
        className="p-4 flex items-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <i className="fas fa-bullhorn text-4xl mr-4"></i>
        <div>
          <h2 className="text-3xl font-bold">Announcement</h2>
          {isTimeLimited && (
            <p className="text-sm opacity-80">
              {startDate && endDate ? (
                `Valid from ${startDate} to ${endDate}`
              ) : startDate ? (
                `Starting from ${startDate}`
              ) : endDate ? (
                `Valid until ${endDate}`
              ) : null}
            </p>
          )}
        </div>
      </motion.div>

      {/* Announcement Content */}
      <motion.div
        className="flex-1 p-4 flex flex-col md:flex-row items-center justify-center gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {announcement.image_url && (
          <motion.div 
            className="w-full md:w-1/2 flex justify-center"
            variants={itemVariants}
          >
            <div className="bg-white/10 p-4 rounded-lg shadow-lg backdrop-blur-sm">
              <MockProductImage
                src={announcement.image_url}
                alt={announcement.title}
                className="max-h-64 object-contain rounded"
              />
            </div>
          </motion.div>
        )}
        
        <motion.div 
          className={`w-full ${announcement.image_url ? 'md:w-1/2' : 'md:w-3/4'} flex flex-col`}
          variants={itemVariants}
        >
          <h3 className="text-2xl font-bold mb-3">{announcement.title}</h3>
          
          <div className="bg-white/10 p-4 rounded-lg shadow-lg backdrop-blur-sm">
            <div
              className="text-lg leading-relaxed max-h-[30vh] overflow-y-auto"
              dangerouslySetInnerHTML={{ __html: announcement.content }}
            />
          </div>
        </motion.div>
      </motion.div>

      {/* Announcement Footer */}
      <motion.div
        className="p-2 bg-black/20 flex justify-between items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="text-sm font-semibold">
          <i className="fas fa-info-circle mr-2"></i>
          Important Notice
        </div>
        <div className="text-sm opacity-80">
          {new Date().toLocaleDateString('en-BW')}
        </div>
      </motion.div>
    </div>
  );
};

export default MockAnnouncementSlide;