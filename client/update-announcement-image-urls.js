import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("Supabase URL or Service Role Key is missing. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY are set in your .env file.");
  process.exit(1);
}

// Create a Supabase client with the service role key
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Main function to update announcement image URLs
async function updateAnnouncementImageUrls() {
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
      
      // Check if the image_url already has the bucket prefix
      if (announcement.image_url.includes('/')) {
        console.log(`Announcement ${announcement.id} (${announcement.title}) already has a properly formatted image URL: ${announcement.image_url}`);
        continue;
      }
      
      // Update the image_url to include the bucket prefix
      const newImageUrl = `announcements/${announcement.image_url}`;
      
      // Update the announcement in the database
      const { error: updateError } = await supabase
        .from('announcements')
        .update({ image_url: newImageUrl })
        .eq('id', announcement.id);
      
      if (updateError) {
        console.error(`Error updating announcement ${announcement.id}:`, updateError);
      } else {
        console.log(`Updated announcement ${announcement.id} (${announcement.title}) image URL to ${newImageUrl}`);
      }
    }
    
    console.log('Image URL update completed');
  } catch (error) {
    console.error('Error updating image URLs:', error);
  }
}

// Run the main function
updateAnnouncementImageUrls();
