import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import ProductForm from '../../components/admin/ProductForm';
import ProductImage from '../../components/ProductImage';
import { formatCurrency } from '../../utils/currencyUtils';

type Product = {
  id: string;
  name: string;
  description: string;
  category_id: string;
  image_url: string;
  active: boolean;
  featured: boolean;
  special: boolean;
  category: {
    name: string;
  };
  prices: {
    tier_name: string | null;
    price: number;
    original_price: number | null;
  }[];
};

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  
  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch products with their categories
      const { data, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(name),
          prices:product_prices(tier_name, price, original_price)
        `)
        .order('name');
      
      if (productsError) {
        throw new Error(`Error fetching products: ${productsError.message}`);
      }
      
      setProducts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);
  
  // Handle creating a new product
  const handleCreateProduct = () => {
    setEditingProductId(null);
    setShowForm(true);
  };
  
  // Handle editing a product
  const handleEditProduct = (productId: string) => {
    setEditingProductId(productId);
    setShowForm(true);
  };
  
  // Handle deleting a product
  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Delete product
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
      
      if (error) {
        throw new Error(`Error deleting product: ${error.message}`);
      }
      
      // Refresh products list
      await fetchProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error deleting product:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle form save
  const handleFormSave = () => {
    setShowForm(false);
    setEditingProductId(null);
    fetchProducts();
  };
  
  // Handle form cancel
  const handleFormCancel = () => {
    setShowForm(false);
    setEditingProductId(null);
  };
  
  // Render loading state
  if (loading && !showForm) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }
  
  // Render form
  if (showForm) {
    return (
      <div className="p-6">
        <ProductForm
          productId={editingProductId || undefined}
          onSave={handleFormSave}
          onCancel={handleFormCancel}
        />
      </div>
    );
  }
  
  // Render products list
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <button
          onClick={handleCreateProduct}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add New Product
        </button>
      </div>
      
      {error && (
        <div className="mb-6 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {products.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No products found. Click "Add New Product" to create one.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-12 w-12 flex-shrink-0 mr-4">
                        {product.image_url ? (
                          <ProductImage
                            src={product.image_url}
                            alt={product.name}
                            category={product.image_url.includes('/') ? product.image_url.split('/')[0] : 'products'}
                            className="h-12 w-12 object-contain"
                          />
                        ) : (
                          <div className="h-12 w-12 bg-gray-100 flex items-center justify-center rounded">
                            <span className="text-xs text-gray-400">No image</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{product.name}</div>
                        {product.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {product.description.length > 50
                              ? `${product.description.substring(0, 50)}...`
                              : product.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{product.category?.name || 'Uncategorized'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.prices && product.prices.length > 0 ? (
                      <div>
                        {product.prices.map((price, index) => (
                          <div key={index} className="text-sm">
                            {price.tier_name && <span className="text-gray-500">{price.tier_name}: </span>}
                            <span className="font-medium">
                              {formatCurrency(price.price)}
                            </span>
                            {price.original_price && (
                              <span className="text-gray-500 line-through ml-2">
                                {formatCurrency(price.original_price)}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">No price set</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      {product.active ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          Inactive
                        </span>
                      )}
                      
                      {product.featured && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          Featured
                        </span>
                      )}
                      
                      {product.special && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Special
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditProduct(product.id)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Products;