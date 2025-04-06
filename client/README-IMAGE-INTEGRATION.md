# BMS Digital Signage - Image Integration Guide

This guide explains how to work with images in the BMS Digital Signage system after successfully uploading them to Supabase storage.

## Image Storage Structure

Images are stored in Supabase Storage in the following buckets:

1. **branding** - Logo files and brand assets
2. **uniforms** - School uniform images
3. **products** - General product images
4. **ui-elements** - UI elements like placeholders and icons

## Image References in Database

Images are referenced in the database using the format: `bucket/filename.ext`

For example:
- `uniforms/shirt-ssleeve-gis-sky-blue.png`
- `products/calculator-casio-fx-82ms-sc3-dh-scientific.png`
- `branding/bms-logo.svg`

## Components for Working with Images

### ProductImage Component

The `ProductImage` component is used to display images from Supabase storage. It handles both full URLs and storage paths.

```tsx
import ProductImage from '../components/ProductImage';

// Usage with storage path
<ProductImage 
  src="uniforms/shirt-ssleeve-gis-sky-blue.png" 
  alt="GIS Sky Blue Shirt"
  category="uniforms"
  className="max-h-40 object-contain"
/>

// The component will automatically extract the bucket from the path if it contains a slash
<ProductImage 
  src="uniforms/shirt-ssleeve-gis-sky-blue.png" 
  alt="GIS Sky Blue Shirt"
  className="max-h-40 object-contain"
/>

// Usage with full URL
<ProductImage 
  src="https://rwsjbkedgztplwzxoxks.supabase.co/storage/v1/object/public/uniforms/shirt-ssleeve-gis-sky-blue.png" 
  alt="GIS Sky Blue Shirt"
  className="max-h-40 object-contain"
/>
```

### ImageUploader Component

The `ImageUploader` component is used in admin interfaces to upload images to Supabase storage.

```tsx
import ImageUploader from '../components/admin/ImageUploader';

// Usage
<ImageUploader
  bucket="uniforms"
  onUploadComplete={(filePath) => {
    console.log(`File uploaded to: ${filePath}`);
    // Update your form state or database record with the file path
  }}
/>
```

## Testing Image Integration

A test page is available at `/test-images` to verify that images are being correctly fetched and displayed from Supabase storage. This page shows a sample of products and categories with their images.

## Updating Database Records

If you need to update existing database records to use the new Supabase storage paths, you can use the `update-image-references.js` script:

```bash
cd client
node update-image-references.js
```

This script will:

1. Fetch all products, categories, and announcements from the database
2. For each record with an image_url, convert the old path to the new Supabase storage path format
3. Update the database records with the new paths

## Admin Interface for Managing Products

The admin interface for managing products is available at `/admin/products`. This interface allows you to:

1. View all products with their images, prices, and other details
2. Create new products
3. Edit existing products
4. Delete products
5. Upload and manage product images

### Product Form

The product form allows you to:

1. Enter product details (name, description, category, etc.)
2. Set product status (active, featured, special)
3. Upload and preview product images
4. Manage product prices, including tiered pricing for items like uniforms
5. Set original prices for discounted items

## Troubleshooting

If images are not displaying correctly:

1. Check that the image path in the database is correct (should be in the format `bucket/filename.ext`)
2. Verify that the image exists in the correct Supabase storage bucket
3. Check the browser console for any errors related to image loading
4. Ensure that the Supabase URL and API keys are correctly set in your environment variables
5. Verify that the buckets are set to public access in Supabase

## Next Steps

1. Implement image optimization for TV display
2. Add image cropping and resizing functionality to the admin interface
3. Implement bulk image upload for multiple products
4. Add image gallery functionality for products with multiple images