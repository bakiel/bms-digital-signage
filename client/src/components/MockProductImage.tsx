import React, { useState } from 'react';
import { motion } from 'framer-motion';

type MockProductImageProps = {
  src: string;
  alt: string;
  className?: string;
};

const MockProductImage: React.FC<MockProductImageProps> = ({ 
  src, 
  alt, 
  className = "max-h-80 object-contain"
}) => {
  const [hasError, setHasError] = useState(!src); // Start with error if no src provided

  // Determine the image URL to use (prioritize http, then local paths starting with /)
  let initialImageUrl = '/placeholder.svg'; // Default to local placeholder
  if (src) {
    if (src.startsWith('http')) {
      initialImageUrl = src;
    } else if (src.startsWith('/')) { // Assume local path relative to public dir
      initialImageUrl = src;
    }
    // Note: This mock component doesn't handle Supabase paths like 'bucket/image.png'
  }
  
  const displayUrl = hasError ? '/placeholder.svg' : initialImageUrl;

  // console.log('MockProductImage src prop:', src);
  // console.log('MockProductImage display URL:', displayUrl);
  // console.log('MockProductImage error state:', hasError);

  // Animation variants for the floating effect
  const floatingAnimation = {
    initial: { y: 0 },
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        repeatType: "reverse" as const,
        ease: "easeInOut"
      }
    },
    hover: {
      scale: 1.05,
      rotate: [0, -1, 1, -1, 0],
      transition: {
        duration: 0.3,
        scale: { duration: 0.2 }
      }
    }
  };

  return (
    <motion.div
      className="product-image-container w-full h-full flex items-center justify-center bg-white/90 rounded-lg shadow-md overflow-hidden p-4"
      whileHover={{
        boxShadow: "0 15px 30px rgba(0, 0, 0, 0.15)",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        y: -5
      }}
      transition={{ duration: 0.3 }}
    >
      <motion.img
        src={displayUrl}
        alt={alt}
        className={className}
        initial="initial"
        animate="animate"
        whileHover="hover"
        variants={floatingAnimation}
        onError={() => {
          if (!hasError) { // Prevent infinite loop if placeholder also fails
             console.warn('Mock image failed to load, switching to placeholder:', initialImageUrl);
             setHasError(true);
          }
        }}
        // Reset error state if src prop changes and is valid
        onLoad={() => {
          if (hasError && src && initialImageUrl !== '/placeholder.svg') {
             setHasError(false);
          }
        }}
      />
    </motion.div>
  );
};

export default MockProductImage;
