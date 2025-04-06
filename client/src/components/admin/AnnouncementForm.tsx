import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import ImageUploader from './ImageUploader';
import ProductImage from '../ProductImage'; // Re-use for displaying current image

type Announcement = {
  id?: string;
  title: string;
  content: string | null;
  image_url: string | null;
  type: 'ticker' | 'slide' | 'popup';
  active: boolean;
  start_date: string | null; // Store as ISO string or YYYY-MM-DD
  end_date: string | null;   // Store as ISO string or YYYY-MM-DD
};

type AnnouncementFormProps = {
  announcementId?: string;
  onSave: () => void;
  onCancel: () => void;
};

const AnnouncementForm: React.FC<AnnouncementFormProps> = ({ announcementId, onSave, onCancel }) => {
  const [announcement, setAnnouncement] = useState<Announcement>({
    title: '',
    content: null,
    image_url: null,
    type: 'slide', // Default type
    active: true,
    start_date: null,
    end_date: null,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isEditing = !!announcementId;

  // Helper to format date for input[type=date] (YYYY-MM-DD)
   const formatDateForInput = (isoDate: string | null): string => {
    if (!isoDate) return '';
    try {
      // Extract only the date part
      return isoDate.split('T')[0];
    } catch {
      return ''; // Handle potential errors if format is unexpected
    }
  };

  // Fetch announcement data if editing
  useEffect(() => {
    if (isEditing) {
      const fetchAnnouncement = async () => {
        try {
          setLoading(true);
          setError(null);
          const { data, error } = await supabase
            .from('announcements')
            .select('*')
            .eq('id', announcementId)
            .single();

          if (error) {
            throw new Error(`Error fetching announcement: ${error.message}`);
          }
          if (data) {
             // Format dates correctly for the form state if they exist
            setAnnouncement({
              ...data,
              start_date: data.start_date ? formatDateForInput(data.start_date) : null,
              end_date: data.end_date ? formatDateForInput(data.end_date) : null,
            });
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred');
          console.error('Error fetching announcement data:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchAnnouncement();
    } else {
      // Reset form for new announcement
      setAnnouncement({
        title: '',
        content: null,
        image_url: null,
        type: 'slide',
        active: true,
        start_date: null,
        end_date: null,
      });
    }
  }, [announcementId, isEditing]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

     if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setAnnouncement(prev => ({ ...prev, [name]: checked }));
    } else {
       setAnnouncement(prev => ({
        ...prev,
        // Store empty strings as null for optional fields, except for title/type
        [name]: (name !== 'title' && name !== 'type' && value === '') ? null : value
      }));
    }
  };

  // Handle image upload completion
  const handleImageUpload = (filePath: string) => {
    // Announcements images go into 'products' bucket based on current setup
    const bucket = 'products';
    setAnnouncement(prev => ({ ...prev, image_url: `${bucket}/${filePath}` }));
    setSuccess('Image uploaded successfully!');
    setTimeout(() => setSuccess(null), 3000);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      if (!announcement.title) {
        throw new Error('Announcement title is required');
      }
      if (!announcement.type) {
        throw new Error('Announcement type is required');
      }

       // Prepare data for Supabase (handle dates correctly)
      const announcementData = {
        ...announcement,
        // Convert dates back to ISO strings or null for Supabase
        start_date: announcement.start_date ? new Date(announcement.start_date).toISOString() : null,
        end_date: announcement.end_date ? new Date(announcement.end_date).toISOString() : null,
        // Ensure updated_at is set on updates
        ...(isEditing && { updated_at: new Date().toISOString() })
      };


      if (isEditing) {
        // Update existing announcement
        const { error: updateError } = await supabase
          .from('announcements')
          .update(announcementData)
          .eq('id', announcementId);

        if (updateError) {
          throw new Error(`Error updating announcement: ${updateError.message}`);
        }
      } else {
        // Create new announcement
        const { error: insertError } = await supabase
          .from('announcements')
          .insert(announcementData);

        if (insertError) {
          throw new Error(`Error creating announcement: ${insertError.message}`);
        }
      }

      setSuccess('Announcement saved successfully!');
      onSave(); // Call the callback

    } catch (err) {
      // Handle potential date parsing errors
      if (err instanceof Error && (err.message.includes('Invalid Date') || err.message.includes('RangeError'))) {
         setError('Invalid date format. Please use YYYY-MM-DD.');
      } else {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      }
      console.error('Error saving announcement:', err);
    } finally {
      setSaving(false);
    }
  };

   if (loading) {
    return <div className="p-4">Loading announcement data...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">{isEditing ? 'Edit Announcement' : 'Create New Announcement'}</h2>

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
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title*
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={announcement.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                Content (Optional)
              </label>
              <textarea
                id="content"
                name="content"
                value={announcement.content || ''}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

             <div className="mb-4">
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Type*
              </label>
              <select
                id="type"
                name="type"
                value={announcement.type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="slide">Slide</option>
                <option value="ticker">Ticker</option>
                <option value="popup">Popup</option>
              </select>
            </div>

             <div className="mb-4">
               <label className="block text-sm font-medium text-gray-700 mb-1">
                Schedule (Optional)
              </label>
               <div className="flex items-center space-x-4">
                 <div>
                    <label htmlFor="start_date" className="block text-xs text-gray-500 mb-1">Start Date</label>
                    <input
                      type="date"
                      id="start_date"
                      name="start_date"
                      value={announcement.start_date || ''}
                      onChange={handleInputChange}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                 </div>
                  <div>
                    <label htmlFor="end_date" className="block text-xs text-gray-500 mb-1">End Date</label>
                    <input
                      type="date"
                      id="end_date"
                      name="end_date"
                      value={announcement.end_date || ''}
                      onChange={handleInputChange}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                 </div>
               </div>
            </div>

             <div className="mb-4">
               <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  name="active"
                  checked={announcement.active}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="active" className="ml-2 text-sm text-gray-700">
                  Active
                </label>
              </div>
            </div>
          </div>

          {/* Right Column - Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image (Optional)
            </label>
            <div className="mb-4">
              {announcement.image_url ? (
                <div className="mb-2">
                  <div className="h-32 w-32 bg-gray-100 rounded flex items-center justify-center mb-2">
                    <ProductImage
                      src={announcement.image_url}
                      alt={announcement.title}
                      category="products" // Assuming 'products' bucket
                      className="max-h-28 max-w-full object-contain"
                    />
                  </div>
                  <p className="text-sm text-gray-600">Current: {announcement.image_url}</p>
                </div>
              ) : (
                <div className="h-32 w-32 bg-gray-100 rounded flex items-center justify-center mb-2">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
            </div>
            <ImageUploader
              bucket="products" // Announcements images go here for now
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
            {saving ? 'Saving...' : isEditing ? 'Update Announcement' : 'Create Announcement'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AnnouncementForm;