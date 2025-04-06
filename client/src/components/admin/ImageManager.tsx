import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';

type ImageManagerProps = {
  onSelect: (imagePath: string) => void;
  currentImage?: string;
  bucket?: string;
};

const ImageManager: React.FC<ImageManagerProps> = ({ 
  onSelect, 
  currentImage, 
  bucket = 'products' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBucket, setSelectedBucket] = useState(bucket);
  const [preview, setPreview] = useState<string | null>(null);
  
  const buckets = ['branding', 'products', 'uniforms', 'ui-elements'];

  // Fetch images when modal opens or bucket changes
  useEffect(() => {
    if (isOpen) {
      fetchImages();
    }
  }, [isOpen, selectedBucket]);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .storage
        .from(selectedBucket)
        .list();

      if (error) {
        throw error;
      }

      if (data) {
        // Filter out folders
        const files = data.filter(item => !item.id.endsWith('/'));
        setImages(files);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    
    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    // Create a normalized filename
    const fileName = `${file.name.split('.')[0].toLowerCase().replace(/\s+/g, '-')}.${fileExt}`;
    
    setUploading(true);
    
    try {
      const { error } = await supabase.storage
        .from(selectedBucket)
        .upload(fileName, file, {
          upsert: true,
        });

      if (error) {
        throw error;
      }

      fetchImages();
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleImageSelect = (fileName: string) => {
    const imagePath = `${selectedBucket}/${fileName}`;
    onSelect(imagePath);
    setIsOpen(false);
  };

  const handleImageHover = (fileName: string) => {
    const url = supabase.storage.from(selectedBucket).getPublicUrl(fileName).data.publicUrl;
    setPreview(url);
  };

  const handleImageLeave = () => {
    setPreview(null);
  };

  const filteredImages = images.filter(image => 
    image.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* Current Image Display */}
      <div className="mb-4">
        {currentImage ? (
          <div className="relative border rounded-lg overflow-hidden mb-2">
            <img 
              src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${currentImage}`} 
              alt="Selected image" 
              className="max-h-40 object-contain"
            />
            <button
              onClick={() => onSelect('')}
              className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full"
              title="Remove image"
            >
              &times;
            </button>
          </div>
        ) : (
          <div className="border rounded-lg p-4 mb-2 text-center bg-gray-100">
            <p className="text-gray-500">No image selected</p>
          </div>
        )}
      </div>

      {/* Image selection button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
      >
        Select Image
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[80vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-bold">Media Library</h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
                &times;
              </button>
            </div>
            
            <div className="flex border-b">
              <div className="w-3/4 p-4">
                <div className="flex justify-between mb-4">
                  <div className="flex space-x-2">
                    {buckets.map(b => (
                      <button
                        key={b}
                        onClick={() => setSelectedBucket(b)}
                        className={`px-3 py-1 rounded ${
                          selectedBucket === b 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 hover:bg-gray-300'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Search images..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="border rounded px-2 py-1"
                  />
                </div>
                
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <p>Loading images...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-4 overflow-auto" style={{ maxHeight: '400px' }}>
                    {filteredImages.map(image => (
                      <div 
                        key={image.id} 
                        className="border rounded cursor-pointer hover:border-blue-500"
                        onClick={() => handleImageSelect(image.name)}
                        onMouseEnter={() => handleImageHover(image.name)}
                        onMouseLeave={handleImageLeave}
                      >
                        <div className="h-24 flex items-center justify-center bg-gray-100">
                          <img
                            src={supabase.storage.from(selectedBucket).getPublicUrl(image.name).data.publicUrl}
                            alt={image.name}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                        <div className="p-2 text-xs truncate">{image.name}</div>
                      </div>
                    ))}
                    
                    {filteredImages.length === 0 && (
                      <div className="col-span-4 text-center py-10">
                        <p>No images found.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="w-1/4 border-l p-4">
                <div className="mb-4">
                  <h3 className="font-medium mb-2">Upload New Image</h3>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUpload}
                    disabled={uploading}
                    className="w-full"
                  />
                  {uploading && <p className="text-sm mt-2">Uploading...</p>}
                </div>
                
                {preview && (
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">Preview</h3>
                    <div className="border rounded bg-gray-100 flex items-center justify-center h-40">
                      <img src={preview} alt="Preview" className="max-h-full max-w-full object-contain" />
                    </div>
                  </div>
                )}
                
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Tips</h3>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
                    <li>Use descriptive filenames</li>
                    <li>Optimize image size before uploading</li>
                    <li>Recommended formats: JPG, PNG, SVG</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded mr-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageManager;