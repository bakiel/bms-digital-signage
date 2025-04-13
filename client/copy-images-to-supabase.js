import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or Anon Key is missing. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Directory containing the images
const imagesDir = path.join(process.cwd(), 'public', 'images');

// Function to upload a file to Supabase Storage
async function uploadFile(filePath, fileName, bucket) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    
    // Check if file already exists in the bucket
    const { data: existingFiles, error: listError } = await supabase
      .storage
      .from(bucket)
      .list();
    
    if (listError) {
      console.error(`Error listing files in ${bucket} bucket:`, listError);
      return false;
    }
    
    const fileExists = existingFiles.some(file => file.name === fileName);
    if (fileExists) {
      console.log(`File ${fileName} already exists in ${bucket} bucket. Skipping.`);
      return true;
    }
    
    // Upload the file
    const { error: uploadError } = await supabase
      .storage
      .from(bucket)
      .upload(fileName, fileBuffer, {
        contentType: 'image/png', // Adjust based on file type
        upsert: true
      });
    
    if (uploadError) {
      console.error(`Error uploading ${fileName} to ${bucket} bucket:`, uploadError);
      return false;
    }
    
    console.log(`Successfully uploaded ${fileName} to ${bucket} bucket`);
    return true;
  } catch (error) {
    console.error(`Error processing ${fileName}:`, error);
    return false;
  }
}

// Main function to process all images
async function processImages() {
  try {
    // Get all files in the images directory
    const files = fs.readdirSync(imagesDir);
    
    // Filter for image files
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.png', '.jpg', '.jpeg', '.gif', '.svg'].includes(ext);
    });
    
    console.log(`Found ${imageFiles.length} image files to process`);
    
    // Get all announcements from the database
    const { data: announcements, error: dbError } = await supabase
      .from('announcements')
      .select('id, title, image_url');
    
    if (dbError) {
      console.error('Error fetching announcements:', dbError);
      return;
    }
    
    console.log(`Found ${announcements.length} announcements in the database`);
    
    // Process each announcement
    for (const announcement of announcements) {
      if (!announcement.image_url) {
        console.log(`Announcement ${announcement.id} (${announcement.title}) has no image URL`);
        continue;
      }
      
      // Extract the filename from the image_url
      const fileName = announcement.image_url.split('/').pop();
      
      // Check if the file exists in our local images directory
      const localFilePath = path.join(imagesDir, fileName);
      
      if (fs.existsSync(localFilePath)) {
        console.log(`Found local file for ${fileName}, uploading to Supabase...`);
        await uploadFile(localFilePath, fileName, 'announcements');
      } else {
        console.log(`Local file not found for ${fileName}`);
      }
    }
    
    // Also upload "Back to School Sale.png" specifically since we know it's needed
    const backToSchoolFile = 'Back to School Sale.png';
    const backToSchoolPath = path.join(imagesDir, backToSchoolFile);
    
    if (fs.existsSync(backToSchoolPath)) {
      console.log(`Found ${backToSchoolFile}, uploading to Supabase...`);
      await uploadFile(backToSchoolPath, backToSchoolFile, 'announcements');
    } else {
      console.log(`${backToSchoolFile} not found in local directory`);
    }
    
    console.log('Image processing completed');
  } catch (error) {
    console.error('Error processing images:', error);
  }
}

// Run the main function
processImages();
