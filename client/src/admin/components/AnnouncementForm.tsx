import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { supabase } from '@/utils/supabaseClient'; // Use alias
import ImageUploader from './ImageUploader'; 
import ImageManager from './ImageManager'; // Import ImageManager
// import ProductImage from '@/components/ProductImage'; // No longer needed for preview here

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

  // Handle image upload completion from ImageUploader
  const handleImageUpload = useCallback((filePath: string) => {
    // filePath from ImageUploader already includes the bucket name
    setAnnouncement(prev => ({ ...prev, image_url: filePath }));
    setSuccess('Image uploaded successfully!');
    setTimeout(() => setSuccess(null), 3000);
  }, []);

  // Handle image selection from ImageManager
  const handleImageSelection = useCallback((imagePath: string) => {
    // imagePath from ImageManager already includes the bucket name
    setAnnouncement(prev => ({ ...prev, image_url: imagePath }));
    setSuccess('Image selected successfully!');
    setTimeout(() => setSuccess(null), 3000);
  }, []);

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
      let startDateISO: string | null = null;
      let endDateISO: string | null = null;

      try {
        startDateISO = announcement.start_date ? new Date(announcement.start_date).toISOString() : null;
        endDateISO = announcement.end_date ? new Date(announcement.end_date).toISOString() : null;
      } catch (dateError) {
        console.error("Date parsing error:", dateError);
        throw new Error('Invalid date format. Please use YYYY-MM-DD.');
      }

      // Define the type for the update payload explicitly
      type AnnouncementUpdatePayload = {
        title?: string;
        content?: string | null;
        image_url?: string | null;
        type?: string;
        active?: boolean;
        start_date?: string | null;
        end_date?: string | null;
        updated_at?: string;
      };

      // Construct payload carefully with only updatable fields
      const announcementData: AnnouncementUpdatePayload = {
        title: announcement.title,
        content: announcement.content, // Keep null if it's null in state
        image_url: announcement.image_url, // Keep null if it's null in state
        type: announcement.type,
        active: announcement.active,
        start_date: startDateISO, // Already handles null
        end_date: endDateISO, // Already handles null
      };

      if (isEditing) {
        announcementData.updated_at = new Date().toISOString();

        // Update existing announcement
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

    } catch (err: unknown) { // Type err as unknown for safer handling
      console.error('--- Error Saving Announcement ---');
      console.error('Raw Error Object:', err); // Log the raw object

      let errorMessage = 'An unknown error occurred while saving the announcement.';
      
      if (err instanceof Error) {
        console.error('Error Name:', err.name);
        console.error('Error Message:', err.message);
        console.error('Error Stack:', err.stack);
        errorMessage = err.message; // Default to standard error message
      }

      // Attempt to log potential Supabase-specific details
      if (err && typeof err === 'object') {
        if ('details' in err) console.error('Error Details:', (err as any).details);
        if ('hint' in err) console.error('Error Hint:', (err as any).hint);
        if ('code' in err) console.error('Error Code:', (err as any).code);
        
        // Try stringifying for full structure inspection
        try {
          console.error('Error JSON:', JSON.stringify(err));
        } catch (stringifyError) {
          console.error('Could not stringify error object:', stringifyError);
        }

        // Refine error message if specific Supabase fields exist
        if ('message' in err && typeof (err as any).message === 'string') {
           errorMessage = (err as any).message;
           if ('details' in err && typeof (err as any).details === 'string') {
               errorMessage += ` Details: ${(err as any).details}`;
           }
           if ('hint' in err && typeof (err as any).hint === 'string') {
               errorMessage += ` Hint: ${(err as any).hint}`;
           }
        }
      }
      
      // Set the error state for the UI
      // Prioritize specific date error message if applicable
      if (errorMessage.includes('Invalid Date') || errorMessage.includes('RangeError')) {
         setError('Invalid date format. Please use YYYY-MM-DD.');
      } else {
        setError(`Failed to save: ${errorMessage}`); // Add context
      }
      
    } finally {
      setSaving(false);
    }
  };

   if (loading) {
    return <div className="p-4">Loading announcement data...</div>;
  }

  return (
    <div className="announcement-form-container">
      <h2 className="announcement-form-title">{isEditing ? 'Edit Announcement' : 'Create New Announcement'}</h2>

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
        <div className="announcement-form-grid">
          {/* Left Column */}
          <div>
            <div className="announcement-form-group">
              <label htmlFor="title" className="announcement-form-label">
                Title*
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={announcement.title}
                onChange={handleInputChange}
                className="announcement-form-input"
                required
              />
            </div>

            <div className="announcement-form-group">
              <label htmlFor="content" className="announcement-form-label">
                Content (Optional)
              </label>
              <textarea
                id="content"
                name="content"
                value={announcement.content || ''}
                onChange={handleInputChange}
                rows={4}
                className="announcement-form-textarea"
              />
            </div>

            <div className="announcement-form-group">
              <label htmlFor="type" className="announcement-form-label">
                Type*
              </label>
              <select
                id="type"
                name="type"
                value={announcement.type}
                onChange={handleInputChange}
                className="announcement-form-select"
                required
              >
                <option value="slide">Slide</option>
                <option value="ticker">Ticker</option>
                <option value="popup">Popup</option>
              </select>
            </div>

            <div className="announcement-form-group">
              <label className="announcement-form-label">
                Schedule (Optional)
              </label>
              <div className="announcement-form-dates">
                <div className="announcement-form-date-group">
                  <label htmlFor="start_date" className="announcement-form-date-label">Start Date</label>
                  <input
                    type="date"
                    id="start_date"
                    name="start_date"
                    value={announcement.start_date || ''}
                    onChange={handleInputChange}
                    className="announcement-form-input"
                  />
                </div>
                <div className="announcement-form-date-group">
                  <label htmlFor="end_date" className="announcement-form-date-label">End Date</label>
                  <input
                    type="date"
                    id="end_date"
                    name="end_date"
                    value={announcement.end_date || ''}
                    onChange={handleInputChange}
                    className="announcement-form-input"
                  />
                </div>
              </div>
            </div>

            <div className="announcement-form-group">
              <div className="announcement-form-checkbox">
                <input
                  type="checkbox"
                  id="active"
                  name="active"
                  checked={announcement.active}
                  onChange={handleInputChange}
                />
                <label htmlFor="active" className="announcement-form-label">
                  Active
                </label>
              </div>
            </div>
          </div>

          {/* Right Column - Image */}
          <div>
            <div className="form-section"> {/* Reuse form section class */}
              <h3 className="form-section-title">Image (Optional)</h3>
              
              {/* Let ImageManager handle preview and selection button */}
              <div className="form-group">
                  <label className="form-label">Select or Upload Image</label>
                  <ImageManager 
                     currentImage={announcement.image_url} 
                     onSelect={handleImageSelection} 
                     onDelete={() => setAnnouncement(prev => ({ ...prev, image_url: null }))} // Add onDelete handler
                     bucket="announcements" 
                  /> 
               </div>

              {/* Separator or distinct section for Upload */}
              <div className="form-group" style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
                 <label className="form-label">Upload New Image</label>
                 <ImageUploader 
                    bucket="announcements" 
                    onUploadComplete={handleImageUpload} 
                 />
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="announcement-form-buttons">
          <button
            type="button"
            onClick={onCancel}
            className="announcement-form-button announcement-form-button-cancel"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="announcement-form-button announcement-form-button-save"
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
