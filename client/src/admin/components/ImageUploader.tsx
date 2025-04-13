import React, { useState, useRef } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { 
  FiUpload, 
  FiImage, 
  FiAlertCircle, 
  FiCheck, 
  FiLoader 
} from 'react-icons/fi';

type ImageUploaderProps = {
  bucket: string;
  onUploadComplete: (filePath: string) => void;
};

const ImageUploader: React.FC<ImageUploaderProps> = ({ bucket, onUploadComplete }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    
    if (!event.target.files || event.target.files.length === 0) {
      setSelectedFile(null);
      return;
    }
    
    const file = event.target.files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      setSelectedFile(null);
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB.');
      setSelectedFile(null);
      return;
    }
    
    setSelectedFile(file);
  };
  
  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select an image to upload.');
      return;
    }
    
    try {
      setUploading(true);
      setError(null);
      setUploadProgress(0);
      
      const fileExt = selectedFile.name.split('.').pop()?.toLowerCase();
      
      // Validate file extension
      const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
      if (!fileExt || !validExtensions.includes(fileExt)) {
        throw new Error('Invalid file type. Please upload a JPG, PNG, GIF, or WebP image.');
      }
      
      // Normalize filename - convert to lowercase and replace spaces with hyphens
      const originalName = selectedFile.name.split('.')[0].toLowerCase().replace(/\s+/g, '-');
      const timestamp = new Date().getTime();
      const fileName = `${originalName}_${timestamp}.${fileExt}`;
      
      // Upload to Supabase storage with simulated progress
      const uploadProgressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + Math.random() * 15;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 300);
      
      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: true
        });
      
      clearInterval(uploadProgressInterval);
      setUploadProgress(100);
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Pass the full bucket path to the parent component
      onUploadComplete(`${bucket}/${fileName}`);
      
      // Reset the file input and selected file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setSelectedFile(null);
      
      // Reset progress after a short delay to show 100%
      setTimeout(() => {
        setUploadProgress(0);
      }, 1000);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error uploading file');
      console.error('Detailed upload error object:', error);
    } finally {
      setUploading(false);
    }
  };
  
  const cancelUpload = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <div className="image-uploader">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload Image
        </label>
        
        <div className="mt-1 flex flex-col space-y-4">
          {/* File selection area */}
          <div className={`flex justify-center px-6 pt-5 pb-6 border-2 ${selectedFile ? 'border-blue-300 bg-blue-50' : 'border-gray-300 border-dashed'} rounded-md transition-colors duration-200 hover:bg-gray-50`}>
            <div className="space-y-1 text-center">
              <FiImage className="mx-auto h-12 w-12 text-gray-400" />
              
              <div className="flex text-sm text-gray-600">
                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                  <span>Select a file</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    onChange={handleFileSelect}
                    accept="image/*"
                    disabled={uploading}
                    ref={fileInputRef}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF, WebP up to 5MB
              </p>
              
              {selectedFile && (
                <div className="mt-2 text-sm text-gray-900 font-medium">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                </div>
              )}
            </div>
          </div>
          
          {/* Upload progress bar */}
          {uploadProgress > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}
          
          {/* Action buttons */}
          {selectedFile && !uploading && (
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleUpload}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FiUpload className="h-5 w-5 mr-2" />
                Upload
              </button>
              
              <button
                type="button"
                onClick={cancelUpload}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
            </div>
          )}
          
          {/* Loading indicator */}
          {uploading && (
            <div className="flex items-center justify-center text-sm text-gray-600">
              <FiLoader className="animate-spin h-5 w-5 text-blue-600 mr-2" />
              <span>Uploading image...</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mt-2 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiAlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
