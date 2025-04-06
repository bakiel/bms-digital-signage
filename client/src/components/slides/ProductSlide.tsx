import React from 'react';
import { motion } from 'framer-motion'; // Import motion
import { Product } from '../../types';
import { formatCurrency } from '../../utils/currencyUtils';

type ProductSlideProps = {
  product: Product;
};

const ProductSlide: React.FC<ProductSlideProps> = ({ product }) => {
  const defaultPrice = product.product_prices?.[0];
  const hasMultipleTiers = product.product_prices && product.product_prices.length > 1;
  const hasDiscount = defaultPrice?.original_price && defaultPrice.original_price > defaultPrice.price;
  
  if (!defaultPrice) return null;

  // Animation variants for container and children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, // Slightly faster stagger
        delayChildren: 0.1 // Slightly faster delay
      }
    }
  };

  const itemVariants = {
    hidden: { y: 15, opacity: 0, filter: "blur(4px)" }, // Adjusted values
    visible: { 
      y: 0, 
      opacity: 1, 
      filter: "blur(0px)",
      transition: { type: "spring", stiffness: 120, damping: 15 } // Adjusted spring
    }
  };
  
  const imageVariants = {
    hidden: { scale: 0.6, opacity: 0, rotate: -8 }, // Adjusted values
    visible: { 
      scale: 1, 
      opacity: 1, 
      rotate: 0,
      transition: { type: "spring", stiffness: 90, damping: 12, delay: 0.1 } // Adjusted spring
    }
  };
  
  return (
    // Apply container variants to the main slide div
    <motion.div 
      className="slide product-slide" /* Remove relative positioning */
      variants={containerVariants}
      initial="hidden"
      animate="visible" 
      exit="hidden" 
    >
      <div className="product-content"> {/* This div wraps image and details */}
        
        {/* Product Image - Apply image variants */}
        <motion.div className="product-image-container" variants={imageVariants}>
          <img 
            src={product.image_url ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${product.image_url}` : '/placeholder.svg'} 
            alt={product.name}
            className="product-image"
          />
        </motion.div> 
        
        {/* Product Details - Apply item variants to container */}
        {/* NOTE: Applying variants directly to this container might not stagger children as expected if children also have variants. 
            Applying variants to individual children instead. */}
        <motion.div className="product-details"> 
          <motion.div className="product-category" variants={itemVariants}>{product.category?.name}</motion.div>
          <motion.h2 className="product-name" variants={itemVariants}>{product.name}</motion.h2>
          <motion.p className="product-description" variants={itemVariants}>{product.description}</motion.p>
          
          {/* Price Display */}
          {hasDiscount ? (
            <motion.div variants={itemVariants}> {/* Wrap price block */}
              <div className="product-price">{formatCurrency(defaultPrice.price)}</div>
              <div className="product-original-price">{formatCurrency(defaultPrice.original_price!)}</div>
              <div className="product-discount">
                Save {Math.round((1 - defaultPrice.price / defaultPrice.original_price!) * 100)}%
              </div>
            </motion.div> // Correctly closed motion.div
          ) : (
            <motion.div variants={itemVariants}> {/* Wrap price block */}
              <div className="product-price">{formatCurrency(defaultPrice.price)}</div>
              {hasMultipleTiers && defaultPrice.tier_name && (
                <div className="text-gray-600">{defaultPrice.tier_name}</div>
              )}
            </motion.div> // Correctly closed motion.div
          )} {/* Correctly closed ternary */}
          
          {/* Size Options for Uniforms */}
          {hasMultipleTiers && ( 
            // Apply container variants here to stagger the tiers themselves
            <motion.div 
              className="product-tiers" 
              variants={containerVariants} // Use container to stagger children
            > 
              <motion.div className="col-span-full text-xl font-medium mb-2" variants={itemVariants}> 
                Available Options:
              </motion.div>
              {product.product_prices?.map(price => (
                // Apply item variants to each tier
                <motion.div key={price.id} className="product-tier" variants={itemVariants}> 
                  <div className="product-tier-name">{price.tier_name}</div>
                  <div className="product-tier-price">{formatCurrency(price.price)}</div>
                </motion.div> // Close motion.div for each tier
              ))}
            </motion.div> // Close motion.div for product-tiers
          )} {/* Correctly closed hasMultipleTiers check */}
        </motion.div> {/* Close motion.div for product-details */}
        
      </div> {/* Close div for product-content */}
      
      {/* Special Tag - Apply item variants */}
      {product.special && (
        <motion.div className="product-special-banner" variants={itemVariants}>
          LIMITED TIME SPECIAL OFFER
        </motion.div>
      )}
    </motion.div> /* Close main slide motion div */
  );
};

export default ProductSlide;
