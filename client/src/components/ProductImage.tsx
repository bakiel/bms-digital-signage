import React, { useState } from 'react';
import { motion } from 'framer-motion';

type ProductImageProps = {
  src: string; // Expects Supabase DB Ref path like 'bucket/image.png'
  alt: string;
  className?: string;
};

const PLACEHOLDER_IMAGE_PATH = 'ui-elements/placeholder.svg'; // DB Ref path for placeholder

const ProductImage: React.FC<ProductImageProps> = ({ 
  src, 
  alt, 
  className = "max-h-80 object-contain" // Default class, adjust as needed
}) => {
  const [imagePath, setImagePath] = useState(src || PLACEHOLDER_IMAGE_PATH);
  const [hasError, setHasError] = useState(!src); // Start with error if no src provided

  // Construct the full URL from the Supabase path, ONLY if src is not already a full URL
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const isFullUrl = imagePath.startsWith('http');
  const imageUrl = isFullUrl ? imagePath : `${supabaseUrl}/storage/v1/object/public/${imagePath}`;
  
  // Use placeholder if the original src was invalid or loading failed
  const placeholderUrl = `${supabaseUrl}/storage/v1/object/public/${PLACEHOLDER_IMAGE_PATH}`;
  const displayUrl = hasError ? placeholderUrl : imageUrl;

  // console.log('ProductImage src prop:', src);
  // console.log('ProductImage current path:', imagePath);
  // console.log('ProductImage display URL:', displayUrl);
  // console.log('ProductImage error state:', hasError);
  
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
            console.warn('Image failed to load, switching to placeholder:', imageUrl);
            setHasError(true);
            setImagePath(PLACEHOLDER_IMAGE_PATH); // Ensure we use placeholder path
          }
        }}
        // Reset error state if src prop changes and is valid
        onLoad={() => {
          if (hasError && src && imagePath !== src) {
             setHasError(false);
             setImagePath(src);
          }
        }}
      />
    </motion.div>
  );
};

export default ProductImage;
