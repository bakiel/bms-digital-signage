import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import ImageManager from './ImageManager'; // Import the new ImageManager
import { Product, Category, ProductPrice } from '../../types'; // Import shared types

// Remove local type definitions, use imported ones

type ProductFormProps = {
  productId?: string;
  onSave: () => void;
  onCancel: () => void;
};

const ProductForm: React.FC<ProductFormProps> = ({ productId, onSave, onCancel }) => {
  // Initialize state using the imported Product type
  // Note: image_url can be null according to the shared type
  const [product, setProduct] = useState<Partial<Product>>({ // Use Partial for initial state
    name: '',
    description: '',
    category_id: '',
    image_url: null, // Initialize as null
    active: true,
    featured: false,
    special: false,
  });
  
  // Initialize state using the imported ProductPrice type
  const [prices, setPrices] = useState<Partial<ProductPrice>[]>([ // Use Partial for initial state
    { tier_name: null, price: 0, original_price: null, currency: 'BWP' }
  ]);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Determine if we're editing or creating
  const isEditing = !!productId;
  
  // Fetch categories and product data if editing
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*') // Select all fields to match the Category type
          .order('name');
        
        if (categoriesError) {
          throw new Error(`Error fetching categories: ${categoriesError.message}`);
        }
        
        setCategories((categoriesData as Category[]) || []); // Cast to Category[]
        
        // If editing, fetch product data
        if (isEditing) {
          const { data: productData, error: productError } = await supabase
            .from('products')
            .select('*, product_prices(*)') // Fetch prices along with product
            .eq('id', productId)
            .single();
          
          if (productError) {
            throw new Error(`Error fetching product: ${productError.message}`);
          }
          
          if (productData) {
            setProduct(productData as Product); // Cast to Product type
            
            // Prices are now fetched with the product data
            if (productData.product_prices && productData.product_prices.length > 0) {
              setPrices(productData.product_prices);
            } else {
              // Reset to default if no prices found
              setPrices([{ tier_name: null, price: 0, original_price: null, currency: 'BWP' }]);
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [productId, isEditing]);
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle checkboxes
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setProduct(prev => ({ ...prev, [name]: checked }));
    } else {
      setProduct(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // Handle price changes
  const handlePriceChange = (index: number, field: keyof ProductPrice, value: any) => {
    const newPrices = [...prices];
    newPrices[index] = { ...newPrices[index], [field]: value };
    setPrices(newPrices);
  };
  
  // Add a new price tier
  const addPriceTier = () => {
    setPrices([...prices, { tier_name: '', price: 0, original_price: null, currency: 'BWP' }]);
  };
  
  // Remove a price tier
  const removePriceTier = (index: number) => {
    if (prices.length > 1) {
      const newPrices = [...prices];
      newPrices.splice(index, 1);
      setPrices(newPrices);
    }
  };
  
  // Function to handle image selection from ImageManager
  const handleImageSelect = (imagePath: string | null) => {
    setProduct(prev => ({ ...prev, image_url: imagePath }));
    if (imagePath) {
      setSuccess('Image selected.');
      setTimeout(() => setSuccess(null), 3000);
    } else {
       setSuccess('Image removed.');
       setTimeout(() => setSuccess(null), 3000);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      
      // Validate form
      if (!product.name) {
        throw new Error('Product name is required');
      }
      
      if (!product.category_id) {
        throw new Error('Category is required');
      }
      
      // Check if at least one price is valid
      const hasValidPrice = prices.some(p => p.price !== undefined && p.price > 0); // Check if price is defined
      if (!hasValidPrice) {
        throw new Error('At least one valid price is required');
      }
      
      // Save product
      let currentProductId = product.id; // Use a different variable name to avoid conflict
      
      if (isEditing) {
        // Update existing product
        const { error: updateError } = await supabase
          .from('products')
          .update({
            name: product.name,
            description: product.description,
            category_id: product.category_id,
            image_url: product.image_url,
            active: product.active,
            featured: product.featured,
            special: product.special,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentProductId); // Use the correct ID
        
        if (updateError) {
          throw new Error(`Error updating product: ${updateError.message}`);
        }
      } else {
        // Create new product
        const { data: newProduct, error: insertError } = await supabase
          .from('products')
          .insert({
            name: product.name,
            description: product.description,
            category_id: product.category_id,
            image_url: product.image_url,
            active: product.active,
            featured: product.featured,
            special: product.special
          })
          .select()
          .single();
        
        if (insertError) {
          throw new Error(`Error creating product: ${insertError.message}`);
        }
        
        currentProductId = newProduct.id; // Assign the new ID
      }
      
      // Save prices
      if (currentProductId) { // Check using the correct ID variable
        // Delete existing prices if editing
        if (isEditing) {
          await supabase
            .from('product_prices')
            .delete()
            .eq('product_id', currentProductId); // Use the correct ID
        }
        
        // Insert new prices
        const pricesToInsert = prices
          .filter(p => p.price !== undefined && p.price > 0) // Check if price is defined
          .map(p => ({
            product_id: currentProductId, // Use the correct ID
            tier_name: p.tier_name,
            price: p.price,
            original_price: p.original_price,
            currency: p.currency || 'BWP'
          }));
        
        if (pricesToInsert.length > 0) {
          const { error: pricesError } = await supabase
            .from('product_prices')
            .insert(pricesToInsert);
          
          if (pricesError) {
            throw new Error(`Error saving product prices: ${pricesError.message}`);
          }
        }
      }
      
      setSuccess('Product saved successfully!');
      
      // Call the onSave callback
      onSave();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error saving product:', err);
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return <div className="p-4">Loading...</div>;
  }
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">{isEditing ? 'Edit Product' : 'Create New Product'}</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name*
              </label>
              <input
                type="text"
                name="name"
                value={product.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={product.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category*
              </label>
              <select
                name="category_id"
                value={product.category_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4 flex space-x-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  name="active"
                  checked={product.active}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="active" className="ml-2 text-sm text-gray-700">
                  Active
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  name="featured"
                  checked={product.featured}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="featured" className="ml-2 text-sm text-gray-700">
                  Featured
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="special"
                  name="special"
                  checked={product.special}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="special" className="ml-2 text-sm text-gray-700">
                  Special
                </label>
              </div>
            </div>
          </div>
          
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Image
              </label>
              
              {/* Replace with ImageManager */}
              <ImageManager
                currentImage={product.image_url || undefined} // Pass current image path
                onSelect={handleImageSelect} // Pass the handler function
                bucket="products" // Default to 'products', user can change in modal
              />
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-3">Pricing</h3>
          
          {prices.map((price, index) => (
            <div key={index} className="mb-4 p-4 border border-gray-200 rounded">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Size/Tier (optional)
                  </label>
                  <input
                    type="text"
                    value={price.tier_name || ''}
                    onChange={(e) => handlePriceChange(index, 'tier_name', e.target.value || '')} // Use empty string instead of null for input value
                    placeholder="e.g., Size 4, Small, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (BWP)*
                  </label>
                  <input
                    type="number"
                    value={price.price}
                    onChange={(e) => handlePriceChange(index, 'price', e.target.value ? parseFloat(e.target.value) : 0)} // Handle empty string case
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Original Price (BWP)
                  </label>
                  <input
                    type="number"
                    value={price.original_price || ''}
                    onChange={(e) => handlePriceChange(index, 'original_price', e.target.value ? parseFloat(e.target.value) : null)} // Keep null for optional field
                    min="0"
                    step="0.01"
                    placeholder="For discounted items"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              {prices.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePriceTier(index)}
                  className="mt-2 text-sm text-red-600 hover:text-red-800"
                >
                  Remove this price tier
                </button>
              )}
            </div>
          ))}
          
          <button
            type="button"
            onClick={addPriceTier}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
          >
            + Add another price tier
          </button>
        </div>
        
        <div className="mt-8 flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            disabled={saving}
          >
            Cancel
          </button>
          
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            disabled={saving}
          >
            {saving ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;