import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import ProductImage from './ProductImage';

type Product = {
  id: string;
  name: string;
  description: string;
  image_url: string;
  category_id: string;
};

type Category = {
  id: string;
  name: string;
  image_url: string;
};

const TestProductImage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .limit(5);
        
        if (productsError) {
          throw new Error(`Error fetching products: ${productsError.message}`);
        }
        
        setProducts(productsData || []);
        
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .limit(3);
        
        if (categoriesError) {
          throw new Error(`Error fetching categories: ${categoriesError.message}`);
        }
        
        setCategories(categoriesData || []);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Test Product Images</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Products</h2>
        {products.length === 0 ? (
          <p>No products found</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="border rounded-lg p-4 shadow-sm">
                <h3 className="font-medium mb-2">{product.name}</h3>
                <div className="h-48 flex items-center justify-center bg-gray-100 rounded mb-2">
                  {product.image_url ? (
                    <ProductImage 
                      src={product.image_url} 
                      alt={product.name}
                      // Extract bucket from image_url if it contains a slash
                      category={product.image_url.includes('/') ? product.image_url.split('/')[0] : 'products'}
                      className="max-h-40 object-contain"
                    />
                  ) : (
                    <div className="text-gray-400">No image</div>
                  )}
                </div>
                <p className="text-sm text-gray-600">Image path: {product.image_url || 'None'}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Categories</h2>
        {categories.length === 0 ? (
          <p>No categories found</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <div key={category.id} className="border rounded-lg p-4 shadow-sm">
                <h3 className="font-medium mb-2">{category.name}</h3>
                <div className="h-48 flex items-center justify-center bg-gray-100 rounded mb-2">
                  {category.image_url ? (
                    <ProductImage 
                      src={category.image_url} 
                      alt={category.name}
                      // Extract bucket from image_url if it contains a slash
                      category={category.image_url.includes('/') ? category.image_url.split('/')[0] : 'products'}
                      className="max-h-40 object-contain"
                    />
                  ) : (
                    <div className="text-gray-400">No image</div>
                  )}
                </div>
                <p className="text-sm text-gray-600">Image path: {category.image_url || 'None'}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestProductImage;