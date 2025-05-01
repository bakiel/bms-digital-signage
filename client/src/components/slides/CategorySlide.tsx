import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion'; // Import motion
import { Category, Product } from '../../types';
import { supabase } from '../../utils/supabaseClient';
import { formatCurrency } from '../../utils/currencyUtils';

type CategorySlideProps = {
  category: Category;
};

const CategorySlide: React.FC<CategorySlideProps> = ({ category }) => {
  // Animation variants 
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 } // Faster stagger
    }
  };

  const headerVariants = {
    hidden: { y: -25, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { type: "spring", stiffness: 110, damping: 18 } 
    }
  };

  const itemVariants = {
    hidden: { y: 18, opacity: 0, scale: 0.95 }, // Adjusted values
    visible: { 
      y: 0, 
      opacity: 1, 
      scale: 1,
      transition: { type: "spring", stiffness: 110, damping: 15 } // Adjusted spring
    }
  };

  const [products, setProducts] = useState<Product[]>([]);
  
  useEffect(() => {
    // 4. Define fetchCategoryProducts function
    const fetchCategoryProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, product_prices(*), category:categories(*)')
        .eq('category_id', category.id)
        .eq('active', true)
        .limit(4); // Limit to 4 products for the grid

      if (!error && data) {
        setProducts(data);
      } else if (error) {
        console.error(`Error fetching products for category ${category.id}:`, error);
      }
    };

    // Call the function immediately
    fetchCategoryProducts();

    // 5. Add real-time subscription
    const channel = supabase
      .channel(`category-products-${category.id}`) // Unique channel name
      .on(
        'postgres_changes',
        {
          event: 'UPDATE', // Listen for UPDATE events
          schema: 'public',
          table: 'products',
          filter: `category_id=eq.${category.id}` // Filter by category ID
        },
        (payload) => {
          // 6. Subscription callback
          console.log('Product update received for category:', category.name, payload);
          // Refetch products to get the latest data
          fetchCategoryProducts();
        }
      )
      .subscribe();

    // 7. Cleanup function
    return () => {
      console.log('Removing channel subscription for category:', category.name);
      supabase.removeChannel(channel);
    };

  }, [category.id, category.name]); // Add category.name to dependency array for logging
  
  return (
    // Animate the overall slide container
    <motion.div 
      className="slide category-slide" /* Remove relative positioning */
      variants={containerVariants} // Use container to stagger header and grid
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      {/* Animate Category Header */}
      <motion.div className="category-header" variants={headerVariants}>
        <h2 className="category-title">{category.name}</h2>
        {category.description && (
          <p className="category-description">{category.description}</p>
        )}
      </motion.div> 
      
      {/* Animate Products Grid (stagger children) */}
      <motion.div className="category-products" variants={containerVariants}>
        {products.map((product) => (
          // Animate each product card individually
          <motion.div key={product.id} className="category-product" variants={itemVariants}>
            
            {/* Product Image */}
            <div className="category-product-image">
              <img
                src={product.image_url ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${product.image_url}` : '/placeholder.svg'}
                alt={product.name}
              />
            </div>
            
            {/* Product Details */}
            <div className="category-product-details">
              <h3 className="category-product-name">{product.name}</h3>
              <p className="category-product-description">{product.description}</p>
              
              {/* Price */}
              {product.product_prices && product.product_prices[0] && (
                <div className="category-product-price">
                  {formatCurrency(product.product_prices[0].price)}
                  {product.product_prices[0].original_price && (
                    <span className="ml-2 text-sm text-gray-500 line-through">
                      {formatCurrency(product.product_prices[0].original_price)}
                    </span>
                  )}
                </div>
              )}
            </div>
            
            {/* Special Tag */}
            {product.special && (
              <div className="product-special-banner text-sm">
                SPECIAL OFFER
              </div>
            )}
          </motion.div> // Close motion.div for category-product
        ))}
      </motion.div> {/* Close motion.div for category-products */}
      
    </motion.div> /* Close main slide motion div */
  );
};

export default CategorySlide;
