import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import ImageUploader from './ImageUploader';
import ProductImage from '../ProductImage'; // Re-use for displaying current image

type Category = {
  id?: string;
  name: string;
  description: string | null;
  image_url: string | null;
  icon: string | null;
  color: string | null;
  display_order: number | null;
};

type CategoryFormProps = {
  categoryId?: string;
  onSave: () => void;
  onCancel: () => void;
};

const CategoryForm: React.FC<CategoryFormProps> = ({ categoryId, onSave, onCancel }) => {
  const [category, setCategory] = useState<Category>({
    name: '',
    description: null,
    image_url: null,
    icon: null,
    color: null,
    display_order: null,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isEditing = !!categoryId;

  // Fetch category data if editing
  useEffect(() => {
    if (isEditing) {
      const fetchCategory = async () => {
        try {
          setLoading(true);
          setError(null);
          const { data, error } = await supabase
            .from('categories')
            .select('*')
            .eq('id', categoryId)
            .single();

          if (error) {
            throw new Error(`Error fetching category: ${error.message}`);
          }
          if (data) {
            setCategory(data);
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred');
          console.error('Error fetching category data:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchCategory();
    } else {
      // Reset form for new category
      setCategory({
        name: '',
        description: null,
        image_url: null,
        icon: null,
        color: null,
        display_order: null,
      });
    }
  }, [categoryId, isEditing]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCategory(prev => ({
      ...prev,
      [name]: value === '' ? null : value // Store empty strings as null for optional fields
    }));
  };

   const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCategory(prev => ({
      ...prev,
      [name]: value === '' ? null : parseInt(value, 10) || null // Parse to int or null
    }));
  };

  // Handle image upload completion
  const handleImageUpload = (filePath: string) => {
    // Categories images likely go into 'products' or a dedicated 'categories' bucket
    // Let's assume 'products' for now, adjust if a 'categories' bucket is preferred
    const bucket = 'products'; // Or 'categories' if created
    setCategory(prev => ({ ...prev, image_url: `${bucket}/${filePath}` }));
    setSuccess('Image uploaded successfully!');
    setTimeout(() => setSuccess(null), 3000);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      if (!category.name) {
        throw new Error('Category name is required');
      }

      const categoryData = {
        name: category.name,
        description: category.description,
        image_url: category.image_url,
        icon: category.icon,
        color: category.color,
        display_order: category.display_order,
        // Ensure updated_at is set on updates
        ...(isEditing && { updated_at: new Date().toISOString() })
      };

      if (isEditing) {
        // Update existing category
        const { error: updateError } = await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', categoryId);

        if (updateError) {
          throw new Error(`Error updating category: ${updateError.message}`);
        }
      } else {
        // Create new category
        const { error: insertError } = await supabase
          .from('categories')
          .insert(categoryData);

        if (insertError) {
          throw new Error(`Error creating category: ${insertError.message}`);
        }
      }

      setSuccess('Category saved successfully!');
      onSave(); // Call the callback to refresh list/close form

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error saving category:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading category data...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">{isEditing ? 'Edit Category' : 'Create New Category'}</h2>

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
          {/* Left Column */}
          <div>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Category Name*
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={category.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={category.description || ''}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

             <div className="mb-4">
              <label htmlFor="display_order" className="block text-sm font-medium text-gray-700 mb-1">
                Display Order (Optional)
              </label>
              <input
                type="number"
                id="display_order"
                name="display_order"
                value={category.display_order ?? ''} // Handle null value
                onChange={handleNumberInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Lower numbers appear first"
              />
            </div>

             <div className="mb-4">
              <label htmlFor="icon" className="block text-sm font-medium text-gray-700 mb-1">
                Icon (FontAwesome class, e.g., 'tshirt')
              </label>
              <input
                type="text"
                id="icon"
                name="icon"
                value={category.icon || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., pen-nib, palette"
              />
            </div>

             <div className="mb-4">
              <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
                Color (Hex code, e.g., #3b82f6)
              </label>
               <div className="flex items-center">
                 <input
                    type="color"
                    id="color-picker"
                    value={category.color || '#ffffff'} // Default to white if null
                    onChange={(e) => setCategory(prev => ({ ...prev, color: e.target.value }))}
                    className="h-10 w-10 p-1 border border-gray-300 rounded-md cursor-pointer mr-2"
                  />
                  <input
                    type="text"
                    id="color"
                    name="color"
                    value={category.color || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="#RRGGBB"
                  />
               </div>
            </div>
          </div>

          {/* Right Column - Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category Image (Optional)
            </label>
            <div className="mb-4">
              {category.image_url ? (
                <div className="mb-2">
                  <div className="h-32 w-32 bg-gray-100 rounded flex items-center justify-center mb-2">
                    <ProductImage
                      src={category.image_url}
                      alt={category.name}
                      category={category.image_url.includes('/') ? category.image_url.split('/')[0] : 'products'}
                      className="max-h-28 max-w-full object-contain"
                    />
                  </div>
                  <p className="text-sm text-gray-600">Current: {category.image_url}</p>
                </div>
              ) : (
                <div className="h-32 w-32 bg-gray-100 rounded flex items-center justify-center mb-2">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
            </div>
            <ImageUploader
              bucket="products" // Or 'categories' - decide on bucket strategy
              onUploadComplete={handleImageUpload}
            />
          </div>
        </div>

        {/* Buttons */}
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
            {saving ? 'Saving...' : isEditing ? 'Update Category' : 'Create Category'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CategoryForm;