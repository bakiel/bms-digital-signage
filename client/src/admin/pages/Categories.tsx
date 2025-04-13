import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient'; // Use alias
import CategoryForm from '../components/CategoryForm'; // Relative path is correct here
// import ProductImage from '@/components/ProductImage'; // No longer needed for the list view

type Category = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  icon: string | null;
  color: string | null;
  display_order: number | null;
  created_at: string;
};

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true, nullsFirst: false }) // Sort nulls last
        .order('name');

      if (categoriesError) {
        throw new Error(`Error fetching categories: ${categoriesError.message}`);
      }

      setCategories(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle creating a new category
  const handleCreateCategory = () => {
    setEditingCategoryId(null);
    setShowForm(true);
  };

  // Handle editing a category
  const handleEditCategory = (categoryId: string) => {
    setEditingCategoryId(categoryId);
    setShowForm(true);
  };

  // Handle deleting a category
  const handleDeleteCategory = async (categoryId: string) => {
     if (!window.confirm('Are you sure you want to delete this category? Deleting a category might affect associated products.')) {
       return;
     }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) {
        if (error.code === '23503') { // Foreign key violation
             throw new Error('Cannot delete category: It is currently associated with one or more products.');
        }
        throw new Error(`Error deleting category: ${error.message}`);
      }
      await fetchCategories(); // Refresh list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error deleting category:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle form save
  const handleFormSave = () => {
    setShowForm(false);
    setEditingCategoryId(null);
    fetchCategories(); // Refresh list
  };

  // Handle form cancel
  const handleFormCancel = () => {
    setShowForm(false);
    setEditingCategoryId(null);
  };

  // Render loading state
  if (loading && !showForm) {
    return (
      <div className="loading-indicator"> {/* Reusable custom class */}
        {/* Loading Spinner SVG */}
        <svg className="loading-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="loading-text">Loading categories...</p> {/* Reusable custom class */}
      </div>
    );
  }

  // Render form
  if (showForm) {
    return (
      // Form container might need specific padding/margin if not handled by layout
      <div> 
        <CategoryForm
          categoryId={editingCategoryId || undefined}
          onSave={handleFormSave}
          onCancel={handleFormCancel}
        />
      </div>
    );
  }

  // Render categories list
  return (
    <div className="category-page-container"> {/* Custom class */}
      <div className="page-header"> {/* Reusable custom class */}
        <h1 className="page-title">Categories</h1> {/* Reusable custom class */}
        <button
          onClick={handleCreateCategory}
          className="admin-button admin-button-primary" /* Use existing button style */
        >
          {/* Add icon? */}
          Add New Category
        </button>
      </div>

      {error && (
        <div className="alert alert-error mb-6"> {/* Reusable custom class + margin */}
          {/* Icon could be added here */}
          <div className="alert-content">
            <p>{error}</p>
          </div>
        </div>
      )}

      {categories.length === 0 ? (
        <div className="empty-state"> {/* Reusable custom class */}
          {/* Add appropriate icon */}
          <h3 className="empty-state-title">No categories found</h3>
          <p className="empty-state-message">Click "Add New Category" to create one.</p>
          {/* Optionally repeat the button here */}
        </div>
      ) : (
        <div className="admin-table-container"> {/* Custom class */}
          <table className="admin-table"> {/* Custom class */}
            <thead className="admin-table-header"> {/* Custom class */}
              <tr>
                <th>Order</th>
                <th>Image</th>
                <th>Name</th>
                <th>Description</th>
                <th>Icon/Color</th>
                <th className="text-right">Actions</th> {/* Keep text-right utility for now */}
              </tr>
            </thead>
            <tbody className="admin-table-body"> {/* Custom class */}
              {categories.map((category) => {
                console.log('Rendering category:', category); // Add diagnostic log
                return (
                <tr key={category.id}>
                   <td>
                    {category.display_order ?? '-'}
                  </td>
                  <td>
                     <div className="category-image-container"> {/* Use class from admin.css */}
                        {category.image_url ? (
                          <img
                            src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${category.image_url}`}
                            alt={category.name}
                            className="category-image" /* Use class from admin.css */
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none'; // Hide broken image
                              // Optionally, show a placeholder SVG or text here if needed
                              const placeholder = target.parentElement?.querySelector('.category-image-placeholder');
                              if (placeholder instanceof HTMLElement) placeholder.style.display = 'flex'; // Check if it's an HTMLElement
                            }}
                          />
                        ) : (
                          // Keep placeholder div, but hide it initially if image exists
                          <div className="category-image-placeholder" style={{ display: category.image_url ? 'none' : 'flex' }}> {/* Use class from admin.css */}
                            {/* Placeholder Icon SVG (copied from Products.tsx) */}
                            <svg xmlns="http://www.w3.org/2000/svg" className="product-image-placeholder-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ height: '1.5rem', width: '1.5rem', color: '#9ca3af' }}>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                  </td>
                  <td>
                    <div className="category-name">{category.name}</div> {/* Custom class */}
                  </td>
                  <td>
                    <div className="category-description"> {/* Custom class */}
                      {category.description || '-'}
                    </div>
                  </td>
                   <td>
                     {/* Assuming FontAwesome is globally available */}
                     {category.icon && <i className={`category-icon fas fa-${category.icon}`}></i>} {/* Custom class */}
                     {category.color && <span className="category-color-swatch" style={{ backgroundColor: category.color }}></span>} {/* Custom class */}
                     {!category.icon && !category.color && '-'}
                  </td>
                  <td className="text-right"> {/* Keep text-right utility */}
                    <button
                      onClick={() => handleEditCategory(category.id)}
                      className="admin-button-link admin-button-edit-link" /* Custom classes */
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="admin-button-link admin-button-delete-link" /* Custom classes */
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Categories;