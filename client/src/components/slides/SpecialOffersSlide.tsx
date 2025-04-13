import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../utils/supabaseClient';
import { formatCurrency } from '../../utils/currencyUtils'; // Removed unused formatDiscountedPrice

interface Product {
  id: string;
  name: string;
  description: string;
  category_id: string;
  image_url: string;
  active: boolean;
  featured: boolean;
  special: boolean;
  prices?: {
    id: string;
    tier_name: string | null;
    price: number;
    original_price: number | null;
    currency: string;
  }[];
  category?: {
    name: string;
  };
}

interface SpecialOffersSlideProps {
  layout?: 'grid' | 'showcase' | 'banner';
  maxItems?: number;
}

const SpecialOffersSlide: React.FC<SpecialOffersSlideProps> = ({ 
  layout = 'grid',
  maxItems = 4
}) => {
  const [specialProducts, setSpecialProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpecialProducts = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            prices:product_prices(*),
            category:categories(name)
          `)
          .eq('special', true)
          .eq('active', true)
          .order('created_at', { ascending: false })
          .limit(maxItems);
          
        if (error) throw new Error(error.message);
        if (data) {
          setSpecialProducts(data);
        }
      } catch (err: any) {
        console.error('Error fetching special products:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSpecialProducts();
  }, [maxItems]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        duration: 0.5, 
        when: "beforeChildren",
        staggerChildren: 0.1 
      } 
    },
    exit: { 
      opacity: 0, 
      transition: { duration: 0.3 } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  // Get image URL
  const getImageUrl = (imagePath: string | null) => {
    if (!imagePath) return '/placeholder.svg';
    
    // Check if the URL already has the bucket prefix
    if (imagePath.includes('/')) {
      // URL already has a path structure (e.g., "products/image.png")
      return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${imagePath}`;
    } else {
      // Legacy URL format (just filename)
      return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/products/${imagePath}`;
    }
  };

  // Get product price with savings
  const getProductPrices = (product: Product) => {
    if (!product.prices || product.prices.length === 0) {
      return { current: "No price", original: null, savings: null, percentage: null };
    }
    
    const price = product.prices[0];
    if (!price.original_price) {
      return { 
        current: formatCurrency(price.price), 
        original: null, 
        savings: null, 
        percentage: null 
      };
    }
    
    const savings = price.original_price - price.price;
    const percentage = Math.round((savings / price.original_price) * 100);
    
    return {
      current: formatCurrency(price.price),
      original: formatCurrency(price.original_price),
      savings: formatCurrency(savings),
      percentage
    };
  };

  // Multiple tier prices display
  const getTierPrices = (product: Product) => {
    if (!product.prices || product.prices.length <= 1) return null;
    
    return (
      <div className="text-xs text-gray-600 mt-1">
        {product.prices.map((price, index) => (
          <div key={index}>
            {price.tier_name}: {formatCurrency(price.price)}
            {price.original_price && (
              <span className="line-through ml-1 text-gray-400">
                {formatCurrency(price.original_price)}
              </span>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Renders for different layouts
  const renderGrid = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-full">
      {specialProducts.map((product) => {
        const prices = getProductPrices(product);
        
        return (
          <motion.div 
            key={product.id}
            variants={itemVariants}
            className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col relative"
          >
            {/* Discount Badge */}
            {prices.percentage && (
              <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                Save {prices.percentage}%
              </div>
            )}
            
            {/* Product Image */}
            <div className="h-40 bg-gray-100 p-4 flex items-center justify-center">
              <img 
                src={getImageUrl(product.image_url)}
                alt={product.name}
                className="h-full w-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder.svg"; // Fallback
                }}
              />
            </div>
            
            {/* Product Info */}
            <div className="p-4 flex-1 flex flex-col">
              <div className="text-xs text-blue-600 font-medium mb-1">
                {product.category?.name || 'Uncategorized'}
              </div>
              
              <h3 className="text-gray-900 font-bold mb-1 line-clamp-2">
                {product.name}
              </h3>
              
              <p className="text-gray-500 text-xs mb-2 line-clamp-2">
                {product.description}
              </p>
              
              <div className="mt-auto">
                {prices.original && (
                  <div className="text-gray-500 line-through text-xs">
                    Was: {prices.original}
                  </div>
                )}
                
                <div className="text-red-600 font-bold text-lg">
                  Now: {prices.current}
                </div>
                
                {getTierPrices(product)}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );

  const renderShowcase = () => (
    <div className="flex flex-col h-full">
      <motion.div 
        className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 items-center"
        variants={itemVariants}
      >
        {specialProducts.length > 0 && (
          <>
            {/* Large Feature Product */}
            <div className="h-full flex items-center justify-center p-8">
              <img 
                src={getImageUrl(specialProducts[0].image_url)}
                alt={specialProducts[0].name}
                className="max-h-full max-w-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder.svg"; // Fallback
                }}
              />
            </div>
            
            {/* Product Details */}
            <div className="flex flex-col p-6">
              <div className="text-sm text-blue-600 font-medium mb-2">
                {specialProducts[0].category?.name || 'Special Offer'}
              </div>
              
              <h2 className="text-4xl font-bold mb-4 text-gray-900">
                {specialProducts[0].name}
              </h2>
              
              <p className="text-lg text-gray-600 mb-6">
                {specialProducts[0].description}
              </p>
              
              {/* Price Information */}
              <div className="bg-gray-100 p-6 rounded-lg">
                {(() => {
                  const prices = getProductPrices(specialProducts[0]);
                  return (
                    <>
                      {prices.original && (
                        <div className="text-gray-600 line-through text-xl mb-1">
                          Was: {prices.original}
                        </div>
                      )}
                      
                      <div className="text-red-600 font-bold text-3xl mb-2">
                        Now: {prices.current}
                      </div>
                      
                      {prices.savings && prices.percentage && (
                        <div className="bg-red-600 text-white py-2 px-4 rounded text-center text-lg font-bold">
                          Save {prices.percentage}% ({prices.savings})
                        </div>
                      )}
                      
                      {getTierPrices(specialProducts[0])}
                    </>
                  );
                })()}
              </div>
              
              {/* BMS Watermark */}
              <div className="mt-auto pt-4 flex justify-end opacity-50">
                <img 
                  src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/branding/2-bms-logo.svg`} 
                  alt="BMS Logo" 
                  className="h-8 w-auto"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            </div>
          </>
        )}
      </motion.div>
      
      {/* Additional Products */}
      {specialProducts.length > 1 && (
        <div className="h-20 bg-blue-900 text-white flex items-center">
          <div className="flex-shrink-0 font-bold px-6 text-lg">
            More Special Offers:
          </div>
          <div className="flex-1 flex space-x-6 overflow-x-auto px-4">
            {specialProducts.slice(1).map((product /*, index */) => ( // index is unused
              <motion.div 
                key={product.id}
                variants={itemVariants}
                className="flex-shrink-0 flex items-center space-x-2"
              >
                <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center">
                  <img 
                    src={getImageUrl(product.image_url)}
                    alt={product.name}
                    className="h-8 w-8 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder.svg"; // Fallback
                    }}
                  />
                </div>
                <div>
                  <div className="font-semibold text-sm line-clamp-1">{product.name}</div>
                  <div className="text-xs text-blue-200">
                    {getProductPrices(product).current}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderBanner = () => (
    <div className="h-full w-full bg-gradient-to-r from-blue-900 to-blue-700 flex items-center overflow-hidden relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <pattern id="pattern-circles" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="3" fill="white"></circle>
          </pattern>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#pattern-circles)"></rect>
        </svg>
      </div>
      
      <div className="container mx-auto px-4 py-8 z-10">
        <motion.div
          className="flex flex-col items-center mb-6"
          variants={itemVariants}
        >
          <img 
            src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/branding/1-bms-white-logo.svg`} 
            alt="BMS Logo" 
            className="h-14 w-auto mb-4"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
          <h2 className="text-white text-4xl md:text-5xl font-bold text-center">
            SPECIAL OFFERS
          </h2>
          <div className="w-24 h-1 bg-yellow-400 mt-4"></div>
        </motion.div>
        
        {/* Products Display */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {specialProducts.map((product) => {
            const prices = getProductPrices(product);
            
            return (
              <motion.div 
                key={product.id}
                variants={itemVariants}
                className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col relative group"
              >
                {/* Discount Tag */}
                {prices.percentage && (
                  <div className="absolute top-0 left-0 bg-red-600 text-white px-4 py-1 font-bold">
                    SAVE {prices.percentage}%
                  </div>
                )}
                
                {/* Product Image */}
                <div className="h-36 bg-gray-100 p-4 flex items-center justify-center">
                  <img 
                    src={getImageUrl(product.image_url)}
                    alt={product.name}
                    className="h-full max-w-full object-contain transform group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder.svg"; // Fallback
                    }}
                  />
                </div>
                
                {/* Product Info */}
                <div className="p-4 bg-gradient-to-b from-white to-gray-50 flex-1 flex flex-col">
                  <h3 className="text-gray-900 font-bold text-lg mb-1 line-clamp-1">
                    {product.name}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  
                  <div className="mt-auto">
                    {prices.original && (
                      <div className="text-gray-500 line-through font-medium">
                        Was: {prices.original}
                      </div>
                    )}
                    
                    <div className="text-red-600 font-bold text-xl">
                      Now: {prices.current}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-3 text-gray-600">Loading special offers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-red-50">
        <div className="text-center p-6">
          <svg className="h-12 w-12 text-red-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-3 text-lg font-medium text-red-800">Error Loading Special Offers</h3>
          <p className="mt-1 text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (specialProducts.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100">
        <div className="text-center p-6">
          <svg className="h-12 w-12 text-gray-400 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h3 className="mt-3 text-lg font-medium text-gray-800">No Special Offers</h3>
          <p className="mt-1 text-gray-600">There are currently no special offers available.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="h-full w-full"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {layout === 'grid' && renderGrid()}
      {layout === 'showcase' && renderShowcase()}
      {layout === 'banner' && renderBanner()}
    </motion.div>
  );
};

export default SpecialOffersSlide;
