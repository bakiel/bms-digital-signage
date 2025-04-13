import React, { useState, useEffect, useCallback } from 'react'; // Import useCallback
import { supabase } from '@/utils/supabaseClient'; // Use alias
import ImageUploader from './ImageUploader';
import ImageManager from './ImageManager'; // Import ImageManager
// import ProductImage from '@/components/ProductImage'; // No longer needed

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

  // Removed duplicate handleNumberInputChange

  // Handle image upload completion from ImageUploader
  const handleImageUpload = useCallback((filePath: string) => {
    // filePath from ImageUploader already includes the bucket name
    setCategory(prev => ({ ...prev, image_url: filePath }));
    setSuccess('Image uploaded successfully!');
    setTimeout(() => setSuccess(null), 3000);
  }, []);

  // Handle image selection from ImageManager
  const handleImageSelection = useCallback((imagePath: string) => {
    // imagePath from ImageManager already includes the bucket name
    setCategory(prev => ({ ...prev, image_url: imagePath }));
    setSuccess('Image selected successfully!');
    setTimeout(() => setSuccess(null), 3000);
  }, []);
  
  // Handle clearing the image (e.g., when deleted in manager)
  const handleClearImage = useCallback(() => {
     setCategory(prev => ({ ...prev, image_url: null }));
  }, []);

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
        display_order: category.display_order
        // Remove updated_at - let the database handle it or add column later
        // ...(isEditing && { updated_at: new Date().toISOString() }) 
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
    // Use reusable loading indicator styles
    return (
        <div className="loading-indicator"> 
            <svg className="loading-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="loading-text">Loading category data...</p>
        </div>
    );
  }

  return (
    <div className="form-container"> {/* Custom class */}
      <h2 className="form-title">{isEditing ? 'Edit Category' : 'Create New Category'}</h2> {/* Custom class */}

      {error && (
        <div className="alert alert-error"> {/* Reusable custom class */}
           <div className="alert-content"><p>{error}</p></div>
        </div>
      )}

      {success && (
         <div className="alert alert-success"> {/* Reusable custom class */}
           <div className="alert-content"><p>{success}</p></div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-grid"> {/* Custom class */}
          {/* Left Column */}
          <div className="form-column"> {/* Custom class */}
            <div className="form-group"> {/* Custom class */}
              <label htmlFor="name" className="form-label">
                Category Name*
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={category.name}
                onChange={handleInputChange}
                className="form-input" /* Reusable custom class */
                required
              />
            </div>

            <div className="form-group"> {/* Custom class */}
              <label htmlFor="description" className="form-label">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={category.description || ''}
                onChange={handleInputChange}
                rows={3}
                className="form-textarea" /* Custom class */
              />
            </div>

             <div className="form-group"> {/* Custom class */}
              <label htmlFor="display_order" className="form-label">
                Display Order (Optional)
              </label>
              <input
                type="number"
                id="display_order"
                name="display_order"
                value={category.display_order ?? ''} // Handle null value
                onChange={handleNumberInputChange}
                className="form-input" /* Reusable custom class */
                placeholder="Lower numbers appear first"
              />
            </div>

             <div className="form-group"> {/* Custom class */}
              <label htmlFor="icon" className="form-label">
                Icon (FontAwesome class, e.g., 'tshirt')
              </label>
              <input
                type="text"
                id="icon"
                name="icon"
                value={category.icon || ''}
                onChange={handleInputChange}
                className="form-input" /* Reusable custom class */
                placeholder="e.g., pen-nib, palette"
              />
            </div>

             <div className="form-group"> {/* Custom class */}
              <label htmlFor="color" className="form-label">
                Color (Hex code, e.g., #3b82f6)
              </label>
               <div className="form-color-input-wrapper"> {/* Custom class */}
                 <input
                    type="color"
                    id="color-picker"
                    value={category.color || '#ffffff'} // Default to white if null
                    onChange={(e) => setCategory(prev => ({ ...prev, color: e.target.value }))}
                    className="form-color-picker" /* Custom class */
                  />
                  <input
                    type="text"
                    id="color"
                    name="color"
                    value={category.color || ''}
                    onChange={handleInputChange}
                    className="form-input" /* Reusable custom class */
                    placeholder="#RRGGBB"
                  />
               </div>
            </div>
          </div>

          {/* Right Column - Image */}
          <div className="form-column"> 
             <div className="form-section"> {/* Wrap in form-section */}
                <h3 className="form-section-title">Category Image (Optional)</h3>
                
                {/* ImageManager for selection/preview */}
                <div className="form-group">
                   <label className="form-label">Select or Upload Image</label>
                   <ImageManager 
                      currentImage={category.image_url} 
                      onSelect={handleImageSelection} 
                      onDelete={handleClearImage} // Use the new handler
                      bucket="categories" // Specify categories bucket
                   /> 
                </div>

                {/* ImageUploader for new uploads */}
                <div className="form-group" style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
                   <label className="form-label">Upload New Image</label>
                   <ImageUploader 
                      bucket="categories" 
                      onUploadComplete={handleImageUpload} 
                   />
                </div>
             </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="form-actions"> {/* Custom class */}
          <button
            type="button"
            onClick={onCancel}
            className="admin-button admin-button-secondary" /* Custom classes */
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="admin-button admin-button-primary" /* Custom classes */
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
