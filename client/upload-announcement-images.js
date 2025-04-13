import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import the Supabase MCP client
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("Supabase URL or Service Role Key is missing. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY are set in your .env file.");
  process.exit(1);
}

// Create a Supabase client with the service role key
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Directory containing the images
const imagesDir = path.join(__dirname, 'public', 'images');

// Function to upload a file to Supabase Storage
async function uploadFile(filePath, fileName, bucket) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    
    // Upload the file
    const { data, error } = await supabase
      .storage
      .from(bucket)
      .upload(fileName, fileBuffer, {
        contentType: 'image/png', // Adjust based on file type
        upsert: true
      });
    
    if (error) {
      console.error(`Error uploading ${fileName} to ${bucket} bucket:`, error);
      return false;
    }
    
    console.log(`Successfully uploaded ${fileName} to ${bucket} bucket`);
    return true;
  } catch (error) {
    console.error(`Error processing ${fileName}:`, error);
    return false;
  }
}

// Main function to upload announcement images
async function uploadAnnouncementImages() {
  try {
    // Get all announcements from the database
    const { data: announcements, error: fetchError } = await supabase
      .from('announcements')
      .select('id, title, image_url');
    
    if (fetchError) {
      console.error('Error fetching announcements:', fetchError);
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
    
    // Also upload specific announcement images we know we need
    const imageFiles = [
      'Back to School Sale.png',
      'Exam Essentials.png',
      'New Term Supplies 2.png'
    ];
    
    for (const fileName of imageFiles) {
      const localFilePath = path.join(imagesDir, fileName);
      
      if (fs.existsSync(localFilePath)) {
        console.log(`Found ${fileName}, uploading to Supabase...`);
        await uploadFile(localFilePath, fileName, 'announcements');
      } else {
        console.log(`${fileName} not found in local directory`);
      }
    }
    
    console.log('Image upload completed');
  } catch (error) {
    console.error('Error uploading images:', error);
  }
}

// Run the main function
uploadAnnouncementImages();
