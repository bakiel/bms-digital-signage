import React, { useState, useEffect } from 'react'; // Import useEffect
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
  const [hasError, setHasError] = useState(!src); // Initialize error based on initial src

  // Reset error state when src prop changes
  useEffect(() => {
    setHasError(!src); // Reset error if src changes (becomes valid or invalid)
  }, [src]);

  // Construct URLs directly from src prop or placeholder
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const actualSrcPath = src || PLACEHOLDER_IMAGE_PATH; // Use src if valid, else placeholder path
  const isFullUrl = actualSrcPath.startsWith('http');
  const imageUrl = isFullUrl ? actualSrcPath : `${supabaseUrl}/storage/v1/object/public/${actualSrcPath}`;

  const placeholderUrl = `${supabaseUrl}/storage/v1/object/public/${PLACEHOLDER_IMAGE_PATH}`;

  // Determine display URL based ONLY on hasError state and the original src prop
  const displayUrl = hasError && src ? placeholderUrl : imageUrl; // If error AND src was provided, show placeholder, else show constructed URL

  // console.log('ProductImage src prop:', src);
  // console.log('ProductImage hasError:', hasError);
  // console.log('ProductImage display URL:', displayUrl);

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

  // Check if this is an announcement image (based on path)
  const isAnnouncementImage = src && (src.includes('announcements/') || src.startsWith('http'));

  // For announcement images, render just the image without container but with glow effect
  if (isAnnouncementImage) {
    return (
      <motion.div
        className="relative"
        initial="initial"
        animate="animate"
        variants={{
          initial: { opacity: 0 },
          animate: { opacity: 1, transition: { duration: 0.5 } }
        }}
      >
        {/* White background glow for contrast */}
        <div className="absolute inset-0 bg-white/5 rounded-full filter blur-[50px] scale-[1.5] z-0"></div>

        {/* First glow layer - wide spread */}
        <div className="absolute inset-0 filter blur-[40px] opacity-80 scale-[1.3] z-1 mix-blend-lighten">
          <img
            src={displayUrl}
            alt=""
            className={className}
            style={{ visibility: hasError ? 'hidden' : 'visible', filter: 'brightness(1.7) contrast(1.3)' }}
          />
        </div>

        {/* Second glow layer - medium spread */}
        <div className="absolute inset-0 filter blur-[20px] opacity-90 scale-[1.15] z-2 mix-blend-screen">
          <img
            src={displayUrl}
            alt=""
            className={className}
            style={{ visibility: hasError ? 'hidden' : 'visible', filter: 'brightness(1.5)' }}
          />
        </div>

        {/* Third glow layer - tight, very bright */}
        <div className="absolute inset-0 filter blur-[8px] opacity-100 scale-[1.05] z-3">
          <img
            src={displayUrl}
            alt=""
            className={className}
            style={{ visibility: hasError ? 'hidden' : 'visible', filter: 'brightness(1.3)' }}
          />
        </div>

        {/* Main image */}
        <motion.img
          key={src} // Add key prop based on src to force re-mount on src change
          src={displayUrl}
          alt={alt}
          className={`${className} relative z-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]`}
          onError={() => {
            if (!hasError && src) {
              console.warn('Image failed to load, switching to placeholder:', imageUrl);
              setHasError(true);
            }
          }}
          onLoad={() => {
            if (hasError && src) {
              setHasError(false);
            }
          }}
        />
      </motion.div>
    );
  }

  // For regular product images, use the original container style
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
        key={src} // Add key prop based on src to force re-mount on src change
        src={displayUrl}
        alt={alt}
        className={className}
        initial="initial"
        animate="animate"
        whileHover="hover"
        variants={floatingAnimation}
        onError={() => {
          if (!hasError && src) { // Only set error if we weren't already in an error state AND src was provided
            console.warn('Image failed to load, switching to placeholder:', imageUrl);
            setHasError(true);
          }
        }}
        // Reset error state if src prop changes and is valid
        onLoad={() => {
           if (hasError && src) { // If we were in an error state but the image loaded (could be placeholder or actual image now)
             // If the intended src is valid, reset error state.
             setHasError(false);
           }
        }}
      />
    </motion.div>
  );
};

export default ProductImage;
