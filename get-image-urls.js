// get-image-urls.js
import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises'; // Use promises version of fs
import path from 'path';

// Supabase URL and Service Role Key (use service role for listing)
const supabaseUrl = 'https://rwsjbkedgztplwzxoxks.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3c2pia2VkZ3p0cGx3enhveGtzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzY2ODUzMCwiZXhwIjoyMDU5MjQ0NTMwfQ.-GlVk5BWIhkAtRXY4WJdbz7qp_6f4MFKe3iFZ09SNKI'; // Use Service Role Key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false } // Recommended for server-side clients
});

// Buckets to search
const buckets = ['branding', 'products', 'uniforms', 'ui-elements'];

async function getAllImageUrls() {
  console.error('Retrieving all image URLs from Supabase storage...'); // Use console.error for logs

  const allImageUrls = {};

  for (const bucket of buckets) {
    console.error(`\nFetching images from ${bucket} bucket:`); // Use console.error

    const { data, error } = await supabase
      .storage
      .from(bucket)
      .list(undefined, { limit: 1000 }); // Fetch up to 1000 files per bucket

    if (error) {
      console.error(`Error fetching from ${bucket}:`, error.message); // Use console.error
      allImageUrls[bucket] = [];
      continue;
    }

    if (!data) {
        console.error(`No data returned for bucket ${bucket}.`); // Use console.error
        allImageUrls[bucket] = [];
        continue;
    }

    allImageUrls[bucket] = [];

    for (const file of data) {
      // Check if it's a file (not a directory placeholder)
      if (file.name && file.id) {
        const { data: urlData } = supabase
          .storage
          .from(bucket)
          .getPublicUrl(file.name);

        if (urlData && urlData.publicUrl) {
            const publicUrl = urlData.publicUrl;
            const databaseReference = `${bucket}/${file.name}`;

            console.error(`- ${file.name}`); // Use console.error for filename log

            allImageUrls[bucket].push({
              name: file.name,
              publicUrl,
              databaseReference
            });
        } else {
             console.error(`  Could not get public URL for ${file.name}`); // Use console.error
        }
      }
    }
  }

  console.error('\n--- SUMMARY ---'); // Use console.error
  console.error(`Summary of images found:`);
  for (const bucket of buckets) {
    console.error(`${bucket}: ${allImageUrls[bucket]?.length || 0} images`);
  }
  console.error(`\nFull list will be saved to image-urls.txt`);

  // Output the structured data as JSON to stdout (this goes to the file)
  process.stdout.write(JSON.stringify(allImageUrls, null, 2));

  return allImageUrls;
}

getAllImageUrls().catch(err => {
    console.error("\nScript failed:", err); // Use console.error
    process.exit(1);
});
