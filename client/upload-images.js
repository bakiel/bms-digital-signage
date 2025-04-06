// upload-images.js
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Replace these with your actual Supabase URL and keys
const supabaseUrl = 'https://rwsjbkedgztplwzxoxks.supabase.co'
// Supabase anon key for regular client operations
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3c2pia2VkZ3p0cGx3enhveGtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2Njg1MzAsImV4cCI6MjA1OTI0NDUzMH0.cfd5F50Yu3Kmu-ipJzPjHWeLe6bcmk4MzXCw91PI_Jg'
// Service role key for admin operations (bypasses RLS)
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3c2pia2VkZ3p0cGx3enhveGtzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzY2ODUzMCwiZXhwIjoyMDU5MjQ0NTMwfQ.-GlVk5BWIhkAtRXY4WJdbz7qp_6f4MFKe3iFZ09SNKI'

// Create regular client
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Create admin client with service role key
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
})

// Function to determine which bucket to use based on filename
const getBucketForFile = (filename) => {
  const lowercaseFilename = filename.toLowerCase()

  // Branding files
  if (lowercaseFilename.includes('logo') || lowercaseFilename.includes('favicon')) {
    return 'branding'
  }
  // Uniform items
  else if (
    lowercaseFilename.includes('shirt') ||
    lowercaseFilename.includes('jersey') ||
    lowercaseFilename.includes('tunic') ||
    lowercaseFilename.includes('hat') ||
    lowercaseFilename.includes('pants') ||
    lowercaseFilename.includes('shorts')
  ) {
    return 'uniforms'
  }
  // UI elements
  else if (lowercaseFilename.includes('placeholder') || lowercaseFilename.includes('icon')) {
    return 'ui-elements'
  }
  // Default to products
  else {
    return 'products'
  }
}

// Format filename to be URL-friendly (lowercase, hyphens)
const formatFilename = (filename) => {
  // Keep the file extension
  const ext = path.extname(filename)

  // Get the base name without extension
  const baseName = path.basename(filename, ext)

  // Replace spaces with hyphens, remove special chars, convert to lowercase
  // Ensure consecutive hyphens are reduced to one
  return `${baseName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-')}${ext.toLowerCase()}`
}
// Function to ensure buckets exist
const ensureBucketsExist = async () => {
  const requiredBuckets = ['branding', 'products', 'uniforms', 'ui-elements'];
  
  console.log('Checking if required storage buckets exist...');
  
  for (const bucketName of requiredBuckets) {
    try {
      // Check if bucket exists using admin client
      const { data: buckets, error } = await supabaseAdmin.storage.listBuckets();
      
      if (error) {
        console.error(`Error checking buckets: ${error.message}`);
        continue;
      }
      
      const bucketExists = buckets.some(bucket => bucket.name === bucketName);
      
      if (!bucketExists) {
        console.log(`Creating bucket: ${bucketName}`);
        const { error: createError } = await supabaseAdmin.storage.createBucket(bucketName, {
          public: true // Make bucket public
        });
        
        if (createError) {
          console.error(`Error creating bucket ${bucketName}: ${createError.message}`);
        } else {
          console.log(`Successfully created bucket: ${bucketName}`);
        }
      } else {
        console.log(`Bucket already exists: ${bucketName}`);
      }
    } catch (err) {
      console.error(`Error processing bucket ${bucketName}: ${err.message}`);
    }
  }
}

// Main upload function
const uploadImages = async () => {
  try {
    console.log('Starting image upload process...')

    // Using service role key for admin operations
    console.log('Using service role key for admin operations...')
    
    // Ensure buckets exist
    await ensureBucketsExist();
    console.log('Proceeding with image upload process...')

    // 2. Define the source directory
    // Define the source directory using an absolute path
    const sourceDir = '/Users/mac/Downloads/BMS_Digital_Signage/images'

    console.log(`Reading images from: ${sourceDir}`)

    // Check if source directory exists
    if (!fs.existsSync(sourceDir)) {
        throw new Error(`Source directory not found: ${sourceDir}. Make sure the 'images' folder exists at the project root.`);
    }

    // 3. Get list of files
    const files = fs.readdirSync(sourceDir)

    // Initialize counters for stats
    const stats = {
      total: 0,
      success: 0,
      failed: 0,
      skipped: 0,
      byBucket: {
        branding: 0,
        products: 0,
        uniforms: 0,
        'ui-elements': 0
      }
    }

    // 4. Process each file
    for (const filename of files) {
      const filePath = path.join(sourceDir, filename)

      // Skip directories and hidden files (like .DS_Store)
      if (fs.statSync(filePath).isDirectory() || filename.startsWith('.')) {
          console.log(`Skipping directory or hidden file: ${filename}`)
          stats.skipped++
          continue
      }

      const ext = path.extname(filename).toLowerCase()
      if (!['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'].includes(ext)) {
          console.log(`Skipping non-image file: ${filename}`)
          stats.skipped++
          continue
      }

      stats.total++

      try {
        // Determine which bucket to use
        const bucket = getBucketForFile(filename)

        // Format the filename
        const formattedFilename = formatFilename(filename)

        console.log(`Uploading ${filename} to ${bucket} bucket as ${formattedFilename}...`)

        // Read file
        const fileBuffer = fs.readFileSync(filePath)

        // Determine content type
        let contentType
        switch (ext) {
          case '.png': contentType = 'image/png'; break
          case '.jpg':
          case '.jpeg': contentType = 'image/jpeg'; break
          case '.gif': contentType = 'image/gif'; break
          case '.svg': contentType = 'image/svg+xml'; break
          case '.webp': contentType = 'image/webp'; break
          default: contentType = 'application/octet-stream'
        }

        // Upload file to Supabase using admin client
        const { data, error } = await supabaseAdmin.storage
          .from(bucket)
          .upload(formattedFilename, fileBuffer, {
            contentType,
            upsert: true // Overwrite if exists
          })

        if (error) {
          console.error(`Error uploading ${filename}: ${error.message}`)
          stats.failed++
        } else {
          console.log(`Successfully uploaded ${filename} to ${bucket}`)
          stats.success++
          stats.byBucket[bucket]++

          // Get public URL using admin client
          const { data: urlData } = supabaseAdmin.storage
            .from(bucket)
            .getPublicUrl(formattedFilename)

          console.log(`Public URL: ${urlData.publicUrl}`)
          console.log(`Database reference: ${bucket}/${formattedFilename}`)
        }
      } catch (err) {
        console.error(`Error processing ${filename}: ${err.message}`)
        stats.failed++
      }

      console.log('-----------------------------------')
    }

    // Print stats
    console.log('\nUpload complete! Summary:')
    console.log(`Total image files found: ${stats.total}`)
    console.log(`Successfully uploaded: ${stats.success}`)
    console.log(`Failed: ${stats.failed}`)
    console.log(`Skipped (non-image/hidden/dir): ${stats.skipped}`)
    console.log('\nFiles uploaded by bucket:')
    for (const [bucket, count] of Object.entries(stats.byBucket)) {
      if (count > 0) { // Only show buckets with uploads
        console.log(`- ${bucket}: ${count} files`)
      }
    }

  } catch (error) {
    console.error('Image upload process failed:', error.message)
  } finally {
    console.log('Image upload process completed.')
  }
}

// Run the upload
uploadImages()