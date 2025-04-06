// generate-update-sql.js
import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises'; // Use promises version of fs
import path from 'path';

// --- Configuration ---
const supabaseUrl = 'https://rwsjbkedgztplwzxoxks.supabase.co';
// Use ANON key - we only need to read data to generate SQL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3c2pia2VkZ3p0cGx3enhveGtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2Njg1MzAsImV4cCI6MjA1OTI0NDUzMH0.cfd5F50Yu3Kmu-ipJzPjHWeLe6bcmk4MzXCw91PI_Jg';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const imageUrlsFile = 'image-urls.txt';
const outputSqlFile = 'update-image-urls.sql';

// Tables to update and the field to match against image names
const tablesToUpdate = [
  { tableName: 'products', nameField: 'name' },
  { tableName: 'categories', nameField: 'name' },
  { tableName: 'announcements', nameField: 'title' },
  // Add other tables if needed
];
// --- End Configuration ---

// Helper function to format names like the upload script does
const formatNameForMatching = (name) => {
  if (!name) return '';
  // Basic formatting: lowercase, replace non-alphanumeric with hyphen, reduce multiple hyphens
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
};

async function generateUpdateSql() {
  console.log(`Reading image references from ${imageUrlsFile}...`);
  let imageUrlsData;
  try {
    const fileContent = await fs.readFile(imageUrlsFile, 'utf-8');
    imageUrlsData = JSON.parse(fileContent);
  } catch (err) {
    console.error(`Error reading or parsing ${imageUrlsFile}:`, err);
    process.exit(1);
  }

  let sqlStatements = `-- SQL statements to update image_url fields\n`;
  sqlStatements += `-- Generated on: ${new Date().toISOString()}\n`;
  sqlStatements += `-- PLEASE REVIEW THESE STATEMENTS CAREFULLY BEFORE EXECUTING!\n\n`;

  let updatesGenerated = 0;

  for (const config of tablesToUpdate) {
    const { tableName, nameField } = config;
    // Determine the corresponding bucket name (simple pluralization, adjust if needed)
    const bucketName = tableName === 'categories' ? 'products' : tableName; // Assuming category images are in 'products' bucket? Or maybe 'ui-elements'? Adjust as needed. Let's assume 'products' for now. Or maybe skip categories if unclear.
    // Let's refine: map table names to expected bucket names more explicitly
    const bucketMap = {
        'products': 'products',
        'categories': 'ui-elements', // Example: Assuming category images are in ui-elements
        'announcements': 'ui-elements' // Example: Assuming announcement images are in ui-elements
    };
    const relevantBucket = bucketMap[tableName];

    if (!relevantBucket || !imageUrlsData[relevantBucket]) {
        console.warn(`Skipping table "${tableName}": No corresponding image bucket found or bucket data missing in ${imageUrlsFile}.`);
        continue;
    }

    console.log(`\nProcessing table: ${tableName} (using images from bucket: ${relevantBucket})`);
    sqlStatements += `-- Updates for table: ${tableName}\n`;

    // Fetch records from the database table
    const { data: records, error: fetchError } = await supabase
      .from(tableName)
      .select(`id, ${nameField}, image_url`);

    if (fetchError) {
      console.error(`Error fetching records from ${tableName}:`, fetchError.message);
      sqlStatements += `-- ERROR fetching records for ${tableName}: ${fetchError.message}\n`;
      continue;
    }

    if (!records || records.length === 0) {
      console.log(`No records found in ${tableName}.`);
      sqlStatements += `-- No records found in ${tableName}.\n`;
      continue;
    }

    // Get the list of images for the relevant bucket
    const imagesInBucket = imageUrlsData[relevantBucket];

    // Iterate through database records
    for (const record of records) {
      const recordName = record[nameField];
      if (!recordName) continue; // Skip if name field is empty

      const formattedRecordName = formatNameForMatching(recordName);

      // Find a matching image in the bucket data
      let bestMatch = null;
      for (const imageInfo of imagesInBucket) {
        const imageNameWithoutExt = path.parse(imageInfo.name).name; // e.g., 'black-pants-with-side-stripes'
        // Check if the formatted record name is part of the image filename (heuristic match)
        if (imageNameWithoutExt.includes(formattedRecordName)) {
          bestMatch = imageInfo;
          break; // Take the first plausible match
        }
      }

      if (bestMatch) {
        const expectedImageUrl = bestMatch.databaseReference;
        // Check if update is needed
        if (record.image_url !== expectedImageUrl) {
          console.log(`  Match found for "${recordName}" (ID: ${record.id}). Needs update.`);
          console.log(`    Current URL: ${record.image_url}`);
          console.log(`    New URL:     ${expectedImageUrl}`);
          // Escape single quotes in the URL for SQL safety
          const escapedImageUrl = expectedImageUrl.replace(/'/g, "''");
          sqlStatements += `UPDATE public.${tableName} SET image_url = '${escapedImageUrl}' WHERE id = '${record.id}'; -- Matched "${recordName}" with ${bestMatch.name}\n`;
          updatesGenerated++;
        } else {
          // console.log(`  Match found for "${recordName}" (ID: ${record.id}). URL already correct.`);
        }
      } else {
         // console.log(`  No image match found for "${recordName}" (ID: ${record.id}).`);
      }
    }
     sqlStatements += `\n`;
  }

  console.log(`\nGenerated ${updatesGenerated} potential SQL UPDATE statements.`);

  try {
    await fs.writeFile(outputSqlFile, sqlStatements);
    console.log(`SQL statements saved to ${outputSqlFile}`);
    console.log(`\nIMPORTANT: Please open ${outputSqlFile}, carefully review the generated SQL statements, and execute them in your Supabase SQL Editor if they look correct.`);
  } catch (err) {
    console.error(`Error writing SQL file ${outputSqlFile}:`, err);
  }
}

generateUpdateSql().catch(err => {
  console.error("\nScript failed:", err);
  process.exit(1);
});
