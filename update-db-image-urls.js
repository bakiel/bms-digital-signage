// update-db-image-urls.js
import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';

// --- Configuration ---
const supabaseUrl = 'https://rwsjbkedgztplwzxoxks.supabase.co';
// !! Use Service Role Key for database updates !!
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3c2pia2VkZ3p0cGx3enhveGtzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzY2ODUzMCwiZXhwIjoyMDU5MjQ0NTMwfQ.-GlVk5BWIhkAtRXY4WJdbz7qp_6f4MFKe3iFZ09SNKI';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false } // Recommended for server-side clients
});

const imageUrlsFile = 'image-urls.txt';

// Tables to update and the field to match against image names
const tablesToUpdate = [
  { tableName: 'products', nameField: 'name', relevantBuckets: ['products', 'uniforms'] }, // Products could be in products or uniforms bucket
  { tableName: 'categories', nameField: 'name', relevantBuckets: ['products', 'ui-elements'] }, // Guessing category images might be in products or ui-elements
  { tableName: 'announcements', nameField: 'title', relevantBuckets: ['products', 'ui-elements'] }, // Guessing announcement images might be in products or ui-elements
];

// Buckets listed in image-urls.txt that contain images
const availableImageBuckets = ['products', 'uniforms', 'ui-elements']; // Exclude 'branding' as it was empty/inaccessible

// --- End Configuration ---

// Helper function to format names like the upload script does
const formatNameForMatching = (name) => {
  if (!name) return '';
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
};

async function updateDatabaseImageUrls() {
  console.log(`Reading image references from ${imageUrlsFile}...`);
  let imageUrlsData;
  try {
    const fileContent = await fs.readFile(imageUrlsFile, 'utf-8');
    imageUrlsData = JSON.parse(fileContent);
  } catch (err) {
    console.error(`Error reading or parsing ${imageUrlsFile}:`, err);
    process.exit(1);
  }

  console.warn("\nWARNING: This script attempts to automatically match database records to image files based on names.");
  console.warn("Review the output carefully. Incorrect matches are possible if names differ significantly.\n");

  let updatesAttempted = 0;
  let updatesSucceeded = 0;
  let updatesFailed = 0;

  for (const config of tablesToUpdate) {
    const { tableName, nameField, relevantBuckets } = config;

    console.log(`\nProcessing table: ${tableName}`);

    // Fetch records from the database table
    const { data: records, error: fetchError } = await supabaseAdmin
      .from(tableName)
      .select(`id, ${nameField}, image_url`);

    if (fetchError) {
      console.error(`  Error fetching records from ${tableName}:`, fetchError.message);
      continue;
    }

    if (!records || records.length === 0) {
      console.log(`  No records found in ${tableName}.`);
      continue;
    }

    // Iterate through database records
    for (const record of records) {
      const recordName = record[nameField];
      if (!recordName) {
        // console.log(`  Skipping record ID ${record.id} in ${tableName} (missing name/title).`);
        continue;
      }

      const formattedRecordName = formatNameForMatching(recordName);
      if (!formattedRecordName) continue;

      // Find the best matching image across relevant buckets
      let bestMatch = null;
      for (const bucketName of relevantBuckets) {
          // Only check buckets that actually have images listed
          if (!availableImageBuckets.includes(bucketName) || !imageUrlsData[bucketName]) continue;

          const imagesInBucket = imageUrlsData[bucketName];
          for (const imageInfo of imagesInBucket) {
              const imageNameWithoutExt = path.parse(imageInfo.name).name;
              // Heuristic match: check if formatted record name is part of the image filename
              if (imageNameWithoutExt.includes(formattedRecordName)) {
                  bestMatch = imageInfo;
                  // console.log(`    Potential match for "${recordName}" (ID: ${record.id}): ${bestMatch.databaseReference}`);
                  break; // Take first plausible match within this bucket
              }
          }
          if (bestMatch) break; // Found a match in this bucket, stop searching other buckets
      }


      if (bestMatch) {
        const expectedImageUrl = bestMatch.publicUrl;
        // Check if update is needed
        if (record.image_url !== expectedImageUrl) {
          updatesAttempted++;
          console.log(`  Updating record "${recordName}" (ID: ${record.id}).`);
          console.log(`    Old URL: ${record.image_url}`);
          console.log(`    New URL: ${expectedImageUrl} (Matched with: ${bestMatch.name})`);

          const { error: updateError } = await supabaseAdmin
            .from(tableName)
            .update({ image_url: expectedImageUrl })
            .eq('id', record.id);

          if (updateError) {
            console.error(`    ERROR updating record ID ${record.id}:`, updateError.message);
            updatesFailed++;
          } else {
            console.log(`    SUCCESS.`);
            updatesSucceeded++;
          }
        } else {
          // console.log(`  Record "${recordName}" (ID: ${record.id}) already has correct URL: ${record.image_url}`);
        }
      } else {
         // console.log(`  No image match found for "${recordName}" (ID: ${record.id}).`);
      }
    }
  }

  console.log("\n--- Update Summary ---");
  console.log(`Updates Attempted: ${updatesAttempted}`);
  console.log(`Updates Succeeded: ${updatesSucceeded}`);
  console.log(`Updates Failed:    ${updatesFailed}`);
  if (updatesAttempted === 0) {
      console.log("No records required updating based on the matching logic.");
  }
  console.log("----------------------");
}

updateDatabaseImageUrls().catch(err => {
  console.error("\nScript failed unexpectedly:", err);
  process.exit(1);
});
