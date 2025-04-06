import React from 'react';
import { motion } from 'framer-motion';
import MockProductImage from '../MockProductImage';
import { formatCurrency } from '../../utils/currencyUtils';

type Category = {
  id: string;
  name: string;
  description: string;
  image_url: string;
  icon: string;
  color: string;
  products?: Product[];
};

type Product = {
  id: string;
  name: string;
  description: string;
  image_url: string;
  product_prices: {
    price: number;
    original_price: number | null;
    tier_name: string;
  }[];
};

type MockCategorySlideProps = {
  category: Category;
};

const MockCategorySlide: React.FC<MockCategorySlideProps> = ({ category }) => {
  // Animation variants for staggered children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
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

  // Get background color from category or use default
  const bgColor = category.color || '#1e3a8a';
  
  // Get icon class from category or use default
  const iconClass = category.icon ? `fa-${category.icon}` : 'fa-folder';

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: `${bgColor}20` }}>
      {/* Category Header */}
      <div 
        className="p-6 text-white flex items-center"
        style={{ backgroundColor: bgColor }}
      >
        <i className={`fas ${iconClass} text-3xl mr-4`}></i>
        <div>
          <h2 className="text-4xl font-bold">{category.name}</h2>
          <p className="text-xl opacity-80">{category.description}</p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="flex-1 p-8 overflow-hidden">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {category.products && category.products.length > 0 ? (
            category.products.map(product => (
              <motion.div 
                key={product.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden"
                variants={itemVariants}
                whileHover={{
                  y: -5,
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)",
                  transition: { duration: 0.3 }
                }}
              >
                <motion.div
                  className="p-4 h-48 flex items-center justify-center bg-gray-50"
                  whileHover={{
                    backgroundColor: "#f0f9ff",
                    transition: { duration: 0.3 }
                  }}
                >
                  <MockProductImage
                    src={product.image_url}
                    alt={product.name}
                    className="max-h-40 object-contain"
                  />
                </motion.div>
                <div className="p-4">
                  <h3 className="text-xl font-bold text-gray-800">{product.name}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                  
                  {product.product_prices && product.product_prices.length > 0 && (
                    <div className="mt-2">
                      {product.product_prices[0].original_price ? (
                        <div className="flex items-center">
                          <span className="text-2xl font-bold text-blue-600">
                            {formatCurrency(product.product_prices[0].price)}
                          </span>
                          <span className="ml-2 text-lg line-through text-gray-500">
                            {formatCurrency(product.product_prices[0].original_price)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-2xl font-bold text-blue-600">
                          {formatCurrency(product.product_prices[0].price)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-3 text-center text-gray-500 py-12">
              <i className="fas fa-box-open text-5xl mb-4"></i>
              <p className="text-xl">No products available in this category</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Category Footer */}
      <div className="p-4 bg-white border-t border-gray-200 flex justify-between items-center">
        <div className="text-lg font-semibold text-gray-700">
          {category.products ? `${category.products.length} Products` : 'No Products'}
        </div>
        <div className="text-sm text-gray-500">
          Swipe for more categories
        </div>
      </div>
    </div>
  );
};

export default MockCategorySlide;