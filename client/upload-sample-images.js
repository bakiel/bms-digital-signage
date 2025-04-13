// client/upload-sample-images.js
import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises'; // Use promise-based fs
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env file in the client directory
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Supabase URL or Anon Key not found in .env file.');
  console.error('Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to upload a single file
async function uploadFile(bucketName, localFilePath) {
  const fileName = path.basename(localFilePath);
  // Normalize filename for storage (lowercase, hyphens for spaces/special chars)
  const storageFileName = fileName
    .split('.')
    .slice(0, -1) // Get name without extension
    .join('.')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-') // Replace non-alphanumeric/hyphen with hyphen
    .replace(/-+/g, '-'); // Replace multiple hyphens
  const fileExt = path.extname(fileName).toLowerCase();
  const finalStoragePath = `${storageFileName}${fileExt}`;

  console.log(`Attempting to upload '${fileName}' as '${finalStoragePath}' to bucket '${bucketName}'...`);

  try {
    const fileBuffer = await fs.readFile(localFilePath);
    
    // Determine content type (basic check)
    let contentType = 'application/octet-stream'; // Default
    if (fileExt === '.png') contentType = 'image/png';
    else if (fileExt === '.jpg' || fileExt === '.jpeg') contentType = 'image/jpeg';
    else if (fileExt === '.gif') contentType = 'image/gif';
    else if (fileExt === '.svg') contentType = 'image/svg+xml';
    else if (fileExt === '.webp') contentType = 'image/webp';

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(finalStoragePath, fileBuffer, {
        cacheControl: '3600',
        upsert: true, // Overwrite if exists
        contentType: contentType,
      });

    if (error) {
      console.error(`Error uploading ${fileName}:`, error.message);
      return false;
    }

    console.log(`Successfully uploaded ${fileName} to ${bucketName}/${finalStoragePath}`);
    return true;

  } catch (err) {
    console.error(`Failed to read or upload ${fileName}:`, err.message);
    return false;
  }
}

// Main execution logic
async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('Usage: node upload-sample-images.js <bucketName> <localFilePath1> [localFilePath2] ...');
    process.exit(1);
  }

  const bucketName = args[0];
  const filePaths = args.slice(1);

  console.log(`\nUploading ${filePaths.length} file(s) to bucket: ${bucketName}`);
  console.log('------------------------------------------');

  let successCount = 0;
  let failureCount = 0;

  for (const filePath of filePaths) {
    // Construct full path relative to the script's location (client/)
    const fullPath = path.resolve(process.cwd(), filePath); 
    
    // Check if file exists before attempting upload
    try {
        await fs.access(fullPath); // Check file existence
        const success = await uploadFile(bucketName, fullPath);
        if (success) {
          successCount++;
        } else {
          failureCount++;
        }
    } catch (accessError) {
        console.error(`Error accessing file ${filePath}: File not found at ${fullPath}`);
        failureCount++;
    }
    console.log('---'); // Separator between files
  }

  console.log('------------------------------------------');
  console.log(`Upload Summary:`);
  console.log(`  Bucket: ${bucketName}`);
  console.log(`  Successful uploads: ${successCount}`);
  console.log(`  Failed uploads: ${failureCount}`);
  console.log('------------------------------------------\n');

  if (failureCount > 0) {
    process.exit(1); // Exit with error code if any uploads failed
  }
}

main();
