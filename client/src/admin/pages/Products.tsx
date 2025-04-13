import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Removed unused useNavigate
import { supabase } from '@/utils/supabaseClient'; // Use alias
// import AdminLayout from '../../components/admin/AdminLayout'; // Unused import
import { formatCurrency } from '@/utils/currencyUtils'; // Use alias

// Define types
interface Product {
  id: string;
  name: string;
  description: string;
  category_id: string;
  image_url: string;
  active: boolean;
  featured: boolean;
  special: boolean;
  created_at: string;
  category?: {
    name: string;
  };
  prices?: ProductPrice[];
}

interface ProductPrice {
  id: string;
  product_id: string;
  tier_name: string | null;
  price: number;
  original_price: number | null;
  currency: string;
}

interface Category {
  id: string;
  name: string;
}

const Products: React.FC = () => {
  // const navigate = useNavigate(); // Unused variable
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        // Fetch categories first
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('id, name')
          .order('name');

        if (categoriesError) throw new Error(categoriesError.message);
        if (categoriesData) {
          setCategories(categoriesData);
        }

        // Fetch products with category name and prices
        const { data, error: productsError } = await supabase
          .from('products')
          .select(`
            *,
            category:categories(name),
            prices:product_prices(*)
          `)
          .order('name');

        if (productsError) throw new Error(productsError.message);
        if (data) {
          setProducts(data);
        }
      } catch (err: any) {
        console.error('Error fetching products:', err);
        setError(err.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products based on search term and filters
  const filteredProducts = products.filter(product => {
    const matchesSearch = searchTerm === '' || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === '' || product.category_id === categoryFilter;
    
    let matchesStatus = true;
    if (statusFilter === 'active') {
      matchesStatus = product.active === true;
    } else if (statusFilter === 'inactive') {
      matchesStatus = product.active === false;
    } else if (statusFilter === 'featured') {
      matchesStatus = product.featured === true;
    } else if (statusFilter === 'special') {
      matchesStatus = product.special === true;
    }
    
    return matchesSearch && matchesCategory && matchesStatus;
  });
  
  // Get primary price for each product (first price or lowest tier price)
  const getProductMainPrice = (product: Product): string => {
    if (!product.prices || product.prices.length === 0) {
      return formatCurrency(0);
    }
    
    if (product.prices.length === 1) {
      return formatCurrency(product.prices[0].price);
    }
    
    // If multiple prices, show range or first tier
    const lowestPrice = Math.min(...product.prices.map(p => p.price));
    const highestPrice = Math.max(...product.prices.map(p => p.price));
    
    if (lowestPrice !== highestPrice) {
      return `${formatCurrency(lowestPrice)} - ${formatCurrency(highestPrice)}`;
    }
    
    return formatCurrency(lowestPrice);
  };
  
  // Format special price display
  const getSpecialPriceDisplay = (product: Product): React.ReactNode => {
    if (!product.special || !product.prices || product.prices.length === 0) {
       // If not special or no prices, return the standard price display
       return <span className="product-price-current">{getProductMainPrice(product)}</span>;
    }
    
    const price = product.prices[0]; // Assuming first price is the relevant one for special
    if (!price.original_price) {
      // If no original price, just show the current price
      return <span className="product-price-current">{formatCurrency(price.price)}</span>;
    }
    
    const discount = Math.round(((price.original_price - price.price) / price.original_price) * 100);
    
    return (
      <div className="product-price-special"> {/* Custom class */}
        <span className="product-price-current">{formatCurrency(price.price)}</span> {/* Custom class */}
        <span className="product-price-original">{formatCurrency(price.original_price)}</span> {/* Custom class */}
        {discount > 0 && <span className="product-price-discount">Save {discount}%</span>} {/* Custom class */}
      </div>
    );
  };
  
  // Toggle product status (active, featured, special)
  const toggleProductStatus = async (productId: string, field: 'active' | 'featured' | 'special', currentValue: boolean) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('products')
        .update({ [field]: !currentValue })
        .eq('id', productId);
        
      if (error) throw new Error(error.message);
      
      // Update local state
      setProducts(products.map(product => 
        product.id === productId 
          ? { ...product, [field]: !currentValue } 
          : product
      ));
    } catch (err: any) {
      console.error(`Error toggling product ${field}:`, err);
      setError(`Failed to update product: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle product deletion
  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }
    
    try {
      setIsDeleting(true);
      
      // Delete product (the foreign key constraint should handle deleting associated prices)
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
        
      if (error) throw new Error(error.message);
      
      // Update local state
      setProducts(products.filter(product => product.id !== productId));
    } catch (err: any) {
      console.error('Error deleting product:', err);
      setError(`Failed to delete product: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Status badge component
  const StatusBadge = ({ label, color }: { label: string, color: string }) => (
    <span className={`status-badge ${color}`}> {/* Custom base class */}
      {label}
    </span>
  );

  return (
      <div className="product-page-container"> {/* Custom class */}
        {/* Page Header */}
        <div className="page-header"> {/* Reusable custom class */}
          <h1 className="page-title">Products</h1> {/* Reusable custom class */}
          <Link 
            to="/admin/products/new" 
            className="admin-button admin-button-primary" /* Use existing button style */
          >
            {/* Icon can be added via CSS ::before if needed, or keep SVG */}
            {/* SVG removed, icon added via CSS ::before */}
            Add New Product
          </Link>
        </div>

        {/* Filters */}
        <div className="product-filter-bar"> {/* Custom class */}
          {/* Search */}
          <div className="product-filter-search"> {/* Custom class for grid span */}
            <label htmlFor="search" className="form-label">Search</label> {/* Reusable custom class */}
            <div className="form-input-wrapper form-input-with-icon"> {/* Reusable custom classes */}
              <div className="form-input-icon"> {/* Reusable custom class */}
                {/* Search Icon SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                name="search"
                id="search"
                className="form-input" /* Reusable custom class */
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label htmlFor="category" className="form-label">Category</label> {/* Reusable custom class */}
            <select
              id="category"
              name="category"
              className="form-select" /* Reusable custom class */
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label htmlFor="status" className="form-label">Status</label> {/* Reusable custom class */}
            <select
              id="status"
              name="status"
              className="form-select" /* Reusable custom class */
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Products</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
              <option value="featured">Featured Only</option>
              <option value="special">Special Offers Only</option>
            </select>
          </div>
        </div>

        {/* Status message */}
        {error && (
          <div className="alert alert-error"> {/* Reusable custom class */}
            <div className="alert-icon"> {/* Reusable custom class */}
              {/* Error Icon SVG */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="alert-content"> {/* Reusable custom class */}
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Products List */}
        <div className="product-list-container"> {/* Custom class */}
          {loading ? (
            <div className="loading-indicator"> {/* Reusable custom class */}
              {/* Loading Spinner SVG */}
              <svg className="loading-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="loading-text">Loading products...</p> {/* Reusable custom class */}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="empty-state"> {/* Reusable custom class */}
              {/* Empty State Icon SVG */}
              <svg xmlns="http://www.w3.org/2000/svg" className="empty-state-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3 className="empty-state-title">No products found</h3> {/* Reusable custom class */}
              <p className="empty-state-message"> {/* Reusable custom class */}
                {searchTerm || categoryFilter || statusFilter ? 'Try adjusting your filters.' : 'Get started by creating a new product.'}
              </p>
              <div className="mt-6"> {/* Keep margin utility for now */}
                <Link
                  to="/admin/products/new"
                  className="admin-button admin-button-primary" /* Use existing button style */
                >
                  {/* Icon can be added via CSS ::before if needed, or keep SVG */}
                  <svg className="admin-button-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  New Product
                </Link>
              </div>
            </div>
          ) : (
            <div className="product-list"> {/* Custom class */}
              {filteredProducts.map((product) => (
                <div key={product.id} className="product-card"> {/* Custom class */}
                  <div className="product-card-grid"> {/* Custom class */}
                    {/* Image column */}
                    <div className="product-image-column"> {/* Custom class */}
                      <div className="product-image-container"> {/* Custom class */}
                        {product.image_url ? (
                          <img 
                            src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${product.image_url}`} 
                            alt={product.name}
                            className="product-image" /* Custom class */
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "/placeholder.svg"; // Fallback to placeholder
                            }}
                          />
                        ) : (
                          /* Placeholder Icon SVG */
                          <svg xmlns="http://www.w3.org/2000/svg" className="product-image-placeholder-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        )}
                      </div>
                    </div>
                    
                    {/* Product info column */}
                    <div className="product-info-column"> {/* Custom class */}
                      <div className="product-info"> {/* Custom class */}
                        <div className="product-info-header"> {/* Custom class */}
                          <h3 className="product-name">{product.name}</h3> {/* Custom class */}
                          <div className="product-status-badges"> {/* Custom class */}
                            {product.active && <StatusBadge label="Active" color="bg-green-100 text-green-800" />}
                            {!product.active && <StatusBadge label="Inactive" color="bg-gray-100 text-gray-800" />}
                            {product.featured && <StatusBadge label="Featured" color="bg-blue-100 text-blue-800" />}
                            {product.special && <StatusBadge label="Special" color="bg-red-100 text-red-800" />}
                          </div>
                        </div>
                        <p className="product-description"> {/* Custom class */}
                          {product.description || 'No description provided'}
                        </p>
                        <div className="product-category-info"> {/* Custom class */}
                          Category: <span className="product-category-name">{product.category?.name || 'Uncategorized'}</span> {/* Custom class */}
                        </div>
                      </div>
                    </div>
                    
                    {/* Price column */}
                    <div className="product-price-column"> {/* Custom class */}
                      {getSpecialPriceDisplay(product)}
                    </div>
                    
                    {/* Actions column */}
                    <div className="product-actions-column"> {/* Custom class */}
                      <div className="product-actions"> {/* Custom class */}
                        <Link
                          to={`/admin/products/edit/${product.id}`}
                          className="admin-button-icon admin-button-edit" /* Custom classes */
                        title="Edit Product"
                        >
                          {/* Edit Icon SVG */}
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                          <span className="sr-only">Edit</span>
                        </Link>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          disabled={isDeleting}
                          className="admin-button-icon admin-button-delete" /* Custom classes */
                        title="Delete Product"
                        >
                          {/* Delete Icon SVG */}
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <span className="sr-only">Delete</span>
                        </button>
                        <div className="product-status-toggles"> {/* Custom class */}
                          <button
                            onClick={() => toggleProductStatus(product.id, 'active', product.active)}
                            className={`status-toggle ${product.active ? 'status-toggle-active bg-green-500' : 'bg-gray-200'}`} /* Custom classes */
                          title={product.active ? 'Deactivate Product' : 'Activate Product'}
                          >
                            <div className={`status-toggle-knob ${product.active ? 'status-toggle-knob-active' : ''}`} /> {/* Custom classes */}
                            <span className="sr-only">Toggle active status</span>
                          </button>
                          <button
                            onClick={() => toggleProductStatus(product.id, 'featured', product.featured)}
                            className={`status-toggle ${product.featured ? 'status-toggle-active bg-blue-500' : 'bg-gray-200'}`} /* Custom classes */
                          title={product.featured ? 'Remove from Featured' : 'Mark as Featured'}
                          >
                            <div className={`status-toggle-knob ${product.featured ? 'status-toggle-knob-active' : ''}`} /> {/* Custom classes */}
                            <span className="sr-only">Toggle featured status</span>
                          </button>
                          <button
                            onClick={() => toggleProductStatus(product.id, 'special', product.special)}
                            className={`status-toggle ${product.special ? 'status-toggle-active bg-red-500' : 'bg-gray-200'}`} /* Custom classes */
                          title={product.special ? 'Remove Special Offer' : 'Mark as Special Offer'}
                          >
                            <div className={`status-toggle-knob ${product.special ? 'status-toggle-knob-active' : ''}`} /> {/* Custom classes */}
                            <span className="sr-only">Toggle special status</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
  );
};

export default Products;