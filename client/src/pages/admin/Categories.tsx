import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import CategoryForm from '../../components/admin/CategoryForm'; // Import the form
import ProductImage from '../../components/ProductImage'; // Use ProductImage for category images too

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

  // Handle deleting a category (Add confirmation and check for associated products later)
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
        // Handle potential foreign key constraint errors if products reference this category
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        <button
          onClick={handleCreateCategory}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add New Category
        </button>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {categories.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No categories found. Click "Add New Category" to create one.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Image
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Icon/Color
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((category) => (
                <tr key={category.id}>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {category.display_order ?? '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                     <div className="h-10 w-10 flex-shrink-0">
                        {category.image_url ? (
                          <ProductImage
                            src={category.image_url}
                            alt={category.name}
                            category={category.image_url.includes('/') ? category.image_url.split('/')[0] : 'products'} // Assume products bucket if not specified
                            className="h-10 w-10 object-contain"
                          />
                        ) : (
                          <div className="h-10 w-10 bg-gray-100 flex items-center justify-center rounded">
                            <span className="text-xs text-gray-400">No image</span>
                          </div>
                        )}
                      </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{category.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {category.description || '-'}
                      </div>
                  </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                     {category.icon && <i className={`fas fa-${category.icon} mr-2`}></i>} {/* Assuming FontAwesome */}
                     {category.color && <span className="inline-block w-4 h-4 rounded-full" style={{ backgroundColor: category.color }}></span>}
                     {!category.icon && !category.color && '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditCategory(category.id)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
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

export default Categories;