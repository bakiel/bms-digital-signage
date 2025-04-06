import React from 'react';
import { motion } from 'framer-motion';
import MockProductImage from '../MockProductImage';
import { formatCurrency, formatDiscountedPrice, formatTieredPrice } from '../../utils/currencyUtils';

type Product = {
  id: string;
  name: string;
  description: string;
  category_id: string;
  image_url: string;
  active: boolean;
  featured: boolean;
  special: boolean;
  category?: {
    name: string;
    icon: string;
  };
  product_prices: {
    id: string;
    tier_name: string | null;
    price: number;
    original_price: number | null;
    currency: string;
  }[];
};

type MockProductSlideProps = {
  product: Product;
};

const MockProductSlide: React.FC<MockProductSlideProps> = ({ product }) => {
  // Check if product has multiple price tiers (like uniform sizes)
  const hasMultipleTiers = product.product_prices && product.product_prices.length > 1;
  
  // Check if product has a discount
  const hasDiscount = product.product_prices && 
    product.product_prices[0]?.original_price && 
    product.product_prices[0].original_price > product.product_prices[0].price;

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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12
      }
    }
  };

  // Calculate discount percentage if applicable
  const discountPercentage = hasDiscount && product.product_prices[0].original_price
    ? Math.round((1 - product.product_prices[0].price / product.product_prices[0].original_price) * 100)
    : 0;

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Product Header - Category Info */}
      {product.category && (
        <div className="bg-blue-900 text-white p-4 flex items-center">
          {product.category.icon && (
            <i className={`fas fa-${product.category.icon} mr-2`}></i>
          )}
          <span className="text-lg">{product.category.name}</span>
          
          {/* Special or Featured Tag */}
          {(product.special || product.featured) && (
            <div className="ml-auto">
              {product.special && (
                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold mr-2">
                  SPECIAL
                </span>
              )}
              {product.featured && (
                <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  FEATURED
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <motion.div 
        className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Product Image */}
        <motion.div
          className="flex items-center justify-center"
          variants={itemVariants}
          animate={{
            y: [0, -10, 0], // Subtle floating animation
            transition: {
              y: {
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }
            }
          }}
          whileHover={{
            scale: 1.03,
            transition: { duration: 0.3 }
          }}
        >
          <div className="relative product-image-container">
            <MockProductImage
              src={product.image_url}
              alt={product.name}
              className="max-h-96 object-contain"
            />
            
            {/* Discount Badge */}
            {hasDiscount && (
              <div className="absolute top-0 right-0 bg-red-600 text-white text-xl font-bold p-4 rounded-full transform translate-x-1/4 -translate-y-1/4">
                -{discountPercentage}%
              </div>
            )}
          </div>
        </motion.div>

        {/* Product Details */}
        <motion.div 
          className="flex flex-col justify-center"
          variants={itemVariants}
        >
          <h2 className="text-4xl font-bold text-gray-800 mb-4">{product.name}</h2>
          
          <p className="text-xl text-gray-600 mb-8">{product.description}</p>
          
          {/* Price Display */}
          <div className="mt-auto">
            {hasMultipleTiers ? (
              // Multiple price tiers (e.g., uniform sizes)
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4">Available Options</h3>
                <div className="space-y-3">
                  {product.product_prices.map(price => (
                    <div key={price.id} className="flex justify-between items-center">
                      <span className="text-lg">{price.tier_name}</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {formatCurrency(price.price)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // Single price with possible discount
              <div className="bg-white p-6 rounded-lg shadow-md">
                {hasDiscount ? (
                  <div className="flex flex-col">
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold text-blue-600">
                        {formatCurrency(product.product_prices[0].price)}
                      </span>
                      <span className="ml-3 text-xl line-through text-gray-500">
                        {formatCurrency(product.product_prices[0].original_price!)}
                      </span>
                    </div>
                    <div className="mt-2 text-red-600 font-semibold">
                      Save {discountPercentage}% off regular price
                    </div>
                  </div>
                ) : (
                  <span className="text-4xl font-bold text-blue-600">
                    {product.product_prices && product.product_prices.length > 0
                      ? formatCurrency(product.product_prices[0].price)
                      : 'Price not available'}
                  </span>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Product Footer */}
      <div className="p-4 bg-white border-t border-gray-200 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {product.category ? `Category: ${product.category.name}` : 'Uncategorized'}
        </div>
        <div className="text-sm text-gray-500">
          Swipe for more products
        </div>
      </div>
    </div>
  );
};

export default MockProductSlide;