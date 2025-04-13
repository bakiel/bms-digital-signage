import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: './.env' }); // Load environment variables from .env in the current directory (client/)

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL or Anon Key is missing. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function updateImageUrls() {
  try {
    const { data: announcements, error } = await supabase
      .from('announcements')
      .select('*');

    if (error) {
      throw new Error(`Error fetching announcements: ${error.message}`);
    }

    if (announcements) {
      for (const announcement of announcements) {
        let imageUrl = announcement.image_url;
        // Check for the specific pattern with double slashes
        if (imageUrl && imageUrl.includes('announcements//')) {
          // Replace double slash with single slash
          const newImageUrl = imageUrl.replace('announcements//', 'announcements/');
          console.log(`Updating image URL for announcement ${announcement.id} from ${imageUrl} to ${newImageUrl}`);

          const { error: updateError } = await supabase
            .from('announcements')
            .update({ image_url: newImageUrl })
            .eq('id', announcement.id);

          if (updateError) {
            console.error(`Error updating announcement ${announcement.id}: ${updateError.message}`);
          }
        } else if (imageUrl && !imageUrl.startsWith('announcements/')) {
           // Handle cases where the bucket prefix might be missing entirely
           // Assuming the filename itself is correct in the DB
           const filename = imageUrl.split('/').pop(); // Get the filename part
           if (filename) {
             const newImageUrl = `announcements/${filename}`;
             console.log(`Updating image URL for announcement ${announcement.id} from ${imageUrl} to ${newImageUrl}`);
             const { error: updateError } = await supabase
               .from('announcements')
               .update({ image_url: newImageUrl })
               .eq('id', announcement.id);

             if (updateError) {
               console.error(`Error updating announcement ${announcement.id}: ${updateError.message}`);
             }
           }
        }
      }
    }

    console.log('Image URLs update process completed!');
  } catch (error) {
    console.error('Error updating image URLs:', error);
  }
}

updateImageUrls();
