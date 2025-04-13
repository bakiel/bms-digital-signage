import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { supabase } from '@/utils/supabaseClient'; 
import { 
  FiImage, FiUpload, FiX, FiSearch, FiLoader, FiAlertCircle, FiCheck, FiTrash2 // Added FiTrash2
} from 'react-icons/fi';
import './ImageManager.css'; // Import dedicated CSS for the modal

interface ImageManagerProps {
  currentImage?: string | null;
  onSelect: (path: string) => void;
  onDelete?: (deletedPath: string) => void; // Add optional onDelete callback
  bucket?: string;
}

// Update Bucket type to include 'announcements' and 'categories'
type Bucket = 'branding' | 'products' | 'uniforms' | 'ui-elements' | 'announcements' | 'categories';

interface ImageFile {
  name: string; id: string; size: number; url: string; bucketPath: string; created_at: string;
  metadata: { size: number; mimetype: string; };
}

// Add 'announcements' and 'categories' to the list of browsable buckets
const BUCKETS: Bucket[] = ['branding', 'products', 'uniforms', 'ui-elements', 'announcements', 'categories']; 

const ImageManager: React.FC<ImageManagerProps> = ({
  currentImage = null,
  onSelect,
  onDelete, // Destructure onDelete prop
  bucket = 'products' // Default bucket
}) => {
  const [isOpen, setIsOpen] = useState(false); // State to control modal visibility
  const [activeBucket, setActiveBucket] = useState<Bucket>(bucket as Bucket);
  const [images, setImages] = useState<ImageFile[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  // New handler for changing bucket
  const handleBucketChange = (newBucket: Bucket) => {
    setActiveBucket(newBucket);
    setSelectedImage(null); // Reset selection when bucket changes
    setSearchTerm(''); // Optionally reset search term too
    // The useEffect hook below will automatically trigger the fetch
  };

  // Fetch images when modal opens or active bucket changes
  useEffect(() => {
    const fetchImages = async () => {
      if (!isOpen) return; // Only fetch if modal is open
      // Reset loading/error state before fetching
      setIsLoading(true); 
      setError(null); 
      // Note: selectedImage is reset in handleBucketChange

      try {
        const { data, error } = await supabase.storage.from(activeBucket).list('', { sortBy: { column: 'name', order: 'asc' } });
        if (error) throw error;
        if (data) {
          const baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${activeBucket}`;
          const imageFiles: ImageFile[] = data
            .filter(item => item.id && !item.id.endsWith('/')) // Ensure item.id exists and filter out potential folders
            .map((item, index) => {
              if (!item.id) {
                console.warn(`ImageManager: Item at index ${index} is missing an ID in bucket ${activeBucket}. Skipping.`);
                return null; // Skip items without an ID
              }
              return {
                name: item.name, 
                id: item.id, // ID is now guaranteed to exist here
                size: item.metadata?.size || 0, 
                url: `${baseUrl}/${item.name}`,
                bucketPath: `${activeBucket}/${item.name}`, 
                created_at: item.created_at || '', 
                metadata: item.metadata as any || {}
              };
            })
            .filter((item): item is ImageFile => item !== null); // Filter out the nulls
          setImages(imageFiles);
          // Preselect if currentImage matches
          if (currentImage) {
            const currentPath = currentImage.includes('/') ? currentImage : `${activeBucket}/${currentImage}`;
            const preselected = imageFiles.find(img => img.bucketPath === currentPath);
            if (preselected) setSelectedImage(preselected);
            else setSelectedImage(null); // Deselect if current image not in this bucket
          } else {
             setSelectedImage(null); // Clear selection if no current image
          }
        }
      } catch (err: any) { 
        console.error(`ImageManager Error fetching images from ${activeBucket}:`, err); // More specific log
        setError(`Failed to load images from bucket "${activeBucket}": ${err.message}`); 
      } 
      finally { setIsLoading(false); }
    };
    fetchImages();
  // Dependencies: only trigger fetch on bucket change or modal open
  }, [activeBucket, isOpen]); // Removed currentImage dependency here

  // Add separate effect for preselection based on currentImage, only when modal opens or images list updates
  useEffect(() => {
    if (isOpen && currentImage && images.length > 0) { // Ensure images are loaded
      const currentPath = currentImage.includes('/') ? currentImage : `${activeBucket}/${currentImage}`;
      // Find in the *currently loaded* images for the active bucket
      const preselected = images.find(img => img.bucketPath === currentPath);
      if (preselected) {
        // Only set if the image is actually in the *current* active bucket
        if (preselected.bucketPath.startsWith(activeBucket + '/')) {
           setSelectedImage(preselected);
        } else {
           // If currentImage belongs to a different bucket than the active one, don't select it
           setSelectedImage(null); 
        }
      } else {
         // If currentImage is not found in the loaded images for this bucket, clear selection
         setSelectedImage(null);
      }
    } else if (isOpen && !currentImage) {
      // Clear selection if modal opens without a currentImage
      setSelectedImage(null);
    }
    // This effect runs when the modal opens, currentImage changes, or the images list itself updates
  }, [isOpen, currentImage, images, activeBucket]); 


  const filteredImages = images.filter(image => image.name.toLowerCase().includes(searchTerm.toLowerCase()));
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    try {
      setUploading(true); setError(null);
      const formattedFilename = file.name.toLowerCase().replace(/[^a-z0-9.]/g, '-').replace(/-+/g, '-');
      const { data, error } = await supabase.storage.from(activeBucket).upload(formattedFilename, file, { upsert: true });
      if (error) throw error;
      if (data) { // Refresh list and select new image
        const { data: listData, error: listError } = await supabase.storage.from(activeBucket).list('', { sortBy: { column: 'name', order: 'asc' } });
        if (listError) throw listError;
        const baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${activeBucket}`;
        const imageFiles: ImageFile[] = (listData || [])
          .filter(item => !item.id?.endsWith('/'))
          .map(item => ({
            name: item.name, id: item.id!, size: item.metadata?.size || 0, url: `${baseUrl}/${item.name}`,
            bucketPath: `${activeBucket}/${item.name}`, created_at: item.created_at || '', metadata: item.metadata as any || {}
          }));
        setImages(imageFiles);
        const uploaded = imageFiles.find(img => img.name === formattedFilename);
        if (uploaded) setSelectedImage(uploaded);
      }
    } catch (err: any) { setError(`Upload failed: ${err.message}`); } 
    finally { setUploading(false); }
  };
  
  const handleSelectImage = (image: ImageFile) => setSelectedImage(image);

  // --- START: Delete Image Logic ---
  const handleDeleteImage = useCallback(async (imageToDelete: ImageFile, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering image selection

    if (!window.confirm(`Are you sure you want to delete "${imageToDelete.name}"? This cannot be undone.`)) {
      return;
    }

    try {
      setError(null); // Clear previous errors
      // Call Supabase storage to remove the file
      const { error: deleteError } = await supabase.storage
        .from(activeBucket)
        .remove([imageToDelete.name]); // Pass the file name in an array

      if (deleteError) {
        throw deleteError;
      }

      // Remove the image from the local state to update UI immediately
      setImages(prevImages => prevImages.filter(img => img.id !== imageToDelete.id));

      // If the deleted image was selected, clear the selection
      if (selectedImage?.id === imageToDelete.id) {
        setSelectedImage(null);
      }

      // Optionally show a success message (could be added to state)
      console.log(`Successfully deleted ${imageToDelete.name}`);

      // If the deleted image was the one currently displayed by the parent, call onDelete callback
      if (onDelete && currentImage === imageToDelete.bucketPath) {
        onDelete(imageToDelete.bucketPath);
      }

    } catch (err: any) {
      console.error('Error deleting image:', err);
      setError(`Failed to delete image: ${err.message}`);
    }
  }, [activeBucket, selectedImage, currentImage, onDelete]); // Add currentImage and onDelete to dependencies
  // --- END: Delete Image Logic ---
  
  const handleConfirmSelection = () => {
    if (selectedImage) {
      onSelect(selectedImage.bucketPath);
      setIsOpen(false); // Close modal on selection
    }
  };
  
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024, sizes = ['Bytes', 'KB', 'MB', 'GB'], i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  return (
    <div className="image-manager-container"> {/* Use a container class */}
      {/* Preview and Button - Use admin.css classes */}
      <div className="form-image-preview-container"> {/* Reuse form class */}
        <div className="form-image-preview"> {/* Reuse form class */}
          <div style={{ height: '8rem', width: '8rem', backgroundColor: '#f3f4f6', borderRadius: '0.375rem', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
            {currentImage ? (
              <img 
                src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${currentImage}`} 
                alt="Selected"
                style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
              />
            ) : (
              <FiImage style={{ height: '2.5rem', width: '2.5rem', color: '#9ca3af' }} />
            )}
          </div>
        </div>
        <button
          type="button"
          className="admin-button admin-button-secondary" // Use button class from admin.css
          style={{ marginTop: '0.5rem' }}
          onClick={() => setIsOpen(true)} // This button now opens the modal
        >
          Select Image
        </button>
        {currentImage && (
          <p className="form-image-preview-text" style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>{currentImage}</p>
        )}
      </div>

      {/* Modal Dialog - Use dedicated CSS classes from ImageManager.css */}
      {isOpen && (
        <div className="image-manager-modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="image-manager-modal-content" onClick={(e) => e.stopPropagation()}> {/* Prevent closing on content click */}
            {/* Modal Header */}
            <div className="image-manager-modal-header">
              <h3>Media Library</h3>
              <button onClick={() => setIsOpen(false)} className="image-manager-modal-close-btn">
                <FiX />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="image-manager-modal-body">
              {/* Bucket Tabs */}
              <div className="image-manager-tabs">
                {BUCKETS.map((bucketName) => (
                  <button
                    key={bucketName}
                    onClick={() => handleBucketChange(bucketName)} // Use the new handler
                    className={`image-manager-tab ${activeBucket === bucketName ? 'active' : ''}`}
                  >
                    {bucketName.charAt(0).toUpperCase() + bucketName.slice(1)}
                  </button>
                ))}
              </div>
              
              {/* Toolbar */}
              <div className="image-manager-toolbar">
                <div className="image-manager-search">
                  <FiSearch />
                  <input
                    type="text"
                    placeholder="Search images..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <label className="admin-button admin-button-primary" style={{ cursor: 'pointer' }}> {/* Style upload as button */}
                  <FiUpload style={{ marginRight: '0.5rem' }}/> Upload
                  <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} style={{ display: 'none' }}/>
                </label>
              </div>
              {/* Error Display - Make it more prominent */}
              {error && (
                <div className="alert alert-error" style={{ margin: '1rem 0' }}> {/* Added margin */}
                  <div className="alert-icon"><FiAlertCircle/></div>
                  <div className="alert-content">
                     <p><strong>Error loading images:</strong></p> 
                     <p>{error}</p>
                  </div>
                </div>
              )}
              {/* Main Content Area: Grid and Details Side-by-Side */}
              <div className="image-manager-main-content"> {/* This div needs CSS for layout */}
                {/* Image Grid (Left Column) */}
                <div className="image-manager-grid"> 
                  {isLoading ? (
                    <div className="loading-indicator"><FiLoader className="loading-spinner"/></div>
                ) : filteredImages.length === 0 ? (
                  <div className="empty-state"><FiImage className="empty-state-icon"/><p>{searchTerm ? 'No images match search' : 'No images in bucket'}</p></div>
                ) : (
                  filteredImages.map((image) => (
                    <div
                      key={image.id}
                      onClick={() => handleSelectImage(image)}
                      className={`image-manager-grid-item ${selectedImage?.id === image.id ? 'selected' : ''}`}
                    >
                       {/* Delete Button - Positioned top-left */}
                       <button 
                          className="image-manager-delete-btn" 
                          title={`Delete ${image.name}`}
                          onClick={(e) => handleDeleteImage(image, e)} // Pass event to stop propagation
                        >
                          <FiTrash2 size={10} /> {/* Reduced size */}
                        </button>
                       
                        {/* Image Preview */}
                      <img
                        src={image.url} alt={image.name}
                        onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                       />
                       
                       {/* Selection Checkmark - Positioned top-right */}
                       {selectedImage?.id === image.id && <FiCheck className="selected-icon" size={12}/>} {/* Reduced size */}
                       
                       {/* Image Name Overlay - Bottom */}
                      <div className="image-name">{image.name}</div>
                    </div>
                    ))
                  )}
                </div> {/* End of image-manager-grid */}

                {/* Selected Image Details Sidebar (Right Column) */}
                <div className="image-manager-details-sidebar"> 
                  {selectedImage ? (
                    <> 
                      <h4>Selected Image</h4>
                      <img 
                         src={selectedImage.url} 
                         alt="Preview" 
                         className="details-preview-image"
                         onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                      />
                      <div className="details-info">
                        <p><strong>Name:</strong> {selectedImage.name}</p>
                        <p><strong>Size:</strong> {formatFileSize(selectedImage.size)}</p>
                        <p><strong>Path:</strong> {selectedImage.bucketPath}</p>
                      </div>
                     </>
                   ) : (
                     <div className="details-placeholder">
                        <FiImage size={32} /> {/* Slightly smaller placeholder */}
                        <p>Select an image to see details</p>
                     </div>
                  )}
                </div> {/* End of image-manager-details-sidebar */}
              </div> {/* End of image-manager-main-content */}
            </div> {/* End of image-manager-modal-body */}
            
            {/* Modal Footer */}
            <div className="image-manager-modal-footer"> {/* Footer should be outside modal-body */}
              <button onClick={() => setIsOpen(false)} className="admin-button admin-button-secondary">Cancel</button>
              <button onClick={handleConfirmSelection} disabled={!selectedImage || uploading} className="admin-button admin-button-primary">
                {uploading ? 'Uploading...' : 'Select Image'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageManager;
