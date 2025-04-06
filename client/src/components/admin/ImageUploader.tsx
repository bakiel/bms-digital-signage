import React, { useState } from 'react';
import { supabase } from '../../utils/supabaseClient';

type ImageUploaderProps = {
  bucket: string;
  onUploadComplete: (filePath: string) => void;
};

const ImageUploader: React.FC<ImageUploaderProps> = ({ bucket, onUploadComplete }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setError(null);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      
      // Normalize filename - convert to lowercase and replace spaces with hyphens
      const originalName = file.name.split('.')[0].toLowerCase().replace(/\s+/g, '-');
      const fileName = `${originalName}_${Math.random().toString(36).substring(2, 11)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Get the public URL
      const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
      
      onUploadComplete(fileName);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error uploading file');
      console.error('Error uploading image:', error);
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="image-uploader">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload to {bucket} bucket
        </label>
        <div className="flex items-center">
          <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded">
            {uploading ? 'Uploading...' : 'Select Image'}
            <input
              type="file"
              disabled={uploading}
              onChange={handleUpload}
              accept="image/*"
              className="hidden"
            />
          </label>
          {uploading && (
            <div className="ml-4">
              <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
        </div>
      </div>
      
      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;