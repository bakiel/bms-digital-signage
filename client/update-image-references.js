// update-image-references.js
import { createClient } from '@supabase/supabase-js'
import path from 'path'

// Replace these with your actual Supabase URL and keys
const supabaseUrl = 'https://rwsjbkedgztplwzxoxks.supabase.co'
// Service role key for admin operations (bypasses RLS)
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3c2pia2VkZ3p0cGx3enhveGtzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzY2ODUzMCwiZXhwIjoyMDU5MjQ0NTMwfQ.-GlVk5BWIhkAtRXY4WJdbz7qp_6f4MFKe3iFZ09SNKI'

// Create admin client with service role key
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
})

// Function to determine which bucket an image belongs to based on filename
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

// Function to update product image references
const updateProductImageReferences = async () => {
  try {
    console.log('Starting product image reference update...')

    // Get all products
    const { data: products, error: productsError } = await supabaseAdmin
      .from('products')
      .select('*')

    if (productsError) {
      throw new Error(`Error fetching products: ${productsError.message}`)
    }

    console.log(`Found ${products.length} products to update`)

    // Update each product
    for (const product of products) {
      try {
        if (!product.image_url) {
          console.log(`Product ${product.id} (${product.name}) has no image_url, skipping`)
          continue
        }

        // Extract filename from the old path
        const oldPath = product.image_url
        const filename = path.basename(oldPath)

        // Determine bucket and format filename
        const bucket = getBucketForFile(filename)
        const formattedFilename = formatFilename(filename)

        // New reference format: bucket/filename
        const newReference = `${bucket}/${formattedFilename}`

        console.log(`Updating product ${product.id} (${product.name}):`)
        console.log(`  Old path: ${oldPath}`)
        console.log(`  New reference: ${newReference}`)

        // Update the product
        const { error: updateError } = await supabaseAdmin
          .from('products')
          .update({ image_url: newReference })
          .eq('id', product.id)

        if (updateError) {
          console.error(`Error updating product ${product.id}: ${updateError.message}`)
        } else {
          console.log(`Successfully updated product ${product.id}`)
        }
      } catch (err) {
        console.error(`Error processing product ${product.id}: ${err.message}`)
      }

      console.log('-----------------------------------')
    }

    // Now update categories
    const { data: categories, error: categoriesError } = await supabaseAdmin
      .from('categories')
      .select('*')

    if (categoriesError) {
      throw new Error(`Error fetching categories: ${categoriesError.message}`)
    }

    console.log(`Found ${categories.length} categories to update`)

    // Update each category
    for (const category of categories) {
      try {
        if (!category.image_url) {
          console.log(`Category ${category.id} (${category.name}) has no image_url, skipping`)
          continue
        }

        // Extract filename from the old path
        const oldPath = category.image_url
        const filename = path.basename(oldPath)

        // Determine bucket and format filename
        const bucket = getBucketForFile(filename)
        const formattedFilename = formatFilename(filename)

        // New reference format: bucket/filename
        const newReference = `${bucket}/${formattedFilename}`

        console.log(`Updating category ${category.id} (${category.name}):`)
        console.log(`  Old path: ${oldPath}`)
        console.log(`  New reference: ${newReference}`)

        // Update the category
        const { error: updateError } = await supabaseAdmin
          .from('categories')
          .update({ image_url: newReference })
          .eq('id', category.id)

        if (updateError) {
          console.error(`Error updating category ${category.id}: ${updateError.message}`)
        } else {
          console.log(`Successfully updated category ${category.id}`)
        }
      } catch (err) {
        console.error(`Error processing category ${category.id}: ${err.message}`)
      }

      console.log('-----------------------------------')
    }

    // Finally, update announcements
    const { data: announcements, error: announcementsError } = await supabaseAdmin
      .from('announcements')
      .select('*')

    if (announcementsError) {
      throw new Error(`Error fetching announcements: ${announcementsError.message}`)
    }

    console.log(`Found ${announcements.length} announcements to update`)

    // Update each announcement
    for (const announcement of announcements) {
      try {
        if (!announcement.image_url) {
          console.log(`Announcement ${announcement.id} (${announcement.title}) has no image_url, skipping`)
          continue
        }

        // Extract filename from the old path
        const oldPath = announcement.image_url
        const filename = path.basename(oldPath)

        // Determine bucket and format filename
        const bucket = getBucketForFile(filename)
        const formattedFilename = formatFilename(filename)

        // New reference format: bucket/filename
        const newReference = `${bucket}/${formattedFilename}`

        console.log(`Updating announcement ${announcement.id} (${announcement.title}):`)
        console.log(`  Old path: ${oldPath}`)
        console.log(`  New reference: ${newReference}`)

        // Update the announcement
        const { error: updateError } = await supabaseAdmin
          .from('announcements')
          .update({ image_url: newReference })
          .eq('id', announcement.id)

        if (updateError) {
          console.error(`Error updating announcement ${announcement.id}: ${updateError.message}`)
        } else {
          console.log(`Successfully updated announcement ${announcement.id}`)
        }
      } catch (err) {
        console.error(`Error processing announcement ${announcement.id}: ${err.message}`)
      }

      console.log('-----------------------------------')
    }

    console.log('Image reference update complete!')

  } catch (error) {
    console.error('Error updating image references:', error.message)
  }
}

// Run the update
updateProductImageReferences()