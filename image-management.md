# BMS Digital Signage - Image Management

This document outlines how to organize and utilize the existing images in the BMS Digital Signage project, with considerations for the Botswana Pula (BWP) currency display and image categorization.

## Image Organization

### Current Image Assets

The `/Users/mac/Downloads/BMS_Digital_Signage/images` folder contains the following assets:

#### BMS Branding
- `1_BMS White Favicon.svg` - White version of favicon for dark backgrounds
- `1_BMS white Logo.svg` - White BMS logo for dark backgrounds
- `2_BMS favicon.svg` - Standard color favicon
- `2_BMS_Logo.svg` - Standard color BMS logo
- `placeholder.svg` - Placeholder image for missing product images

#### School Uniforms
- `Black_pants_with_side_stripes.png` - School uniform pants
- `bucket-hat-northside-primary.png` - School hat
- `gis-pe-shorts-blue-pipping.png` - PE shorts
- `golf-shirt-gis-sky-blue.png` - Golf shirt uniform
- `JERSEY NAVY_WHITE STRIPES GIS HS.png` - School jersey
- `SHIRT SSLEEVE GIS SKY BLUE.png` - Short sleeve shirt
- `TUNIC GIS.png` - School tunic

#### Office & School Supplies
- `calculator-casio-fx-82ms-sc3-dh-scientific.png` - Scientific calculator
- `Clear_plastic_sheet_protectors.png` - Sheet protectors
- `Colorful_plastic_folders_labeled.png` - Folders
- `crayons-coloured-24s-staedtler.png` - Staedtler colored crayons
- `desktop-casio.png` - Desktop calculator
- `Duracell_AAA_batteries_pack.png` - AAA batteries
- `Duracell_CR2016_battery_pack.png` - CR2016 batteries
- `Duracell_DL_CR2016_batteries_pack.png` - DL/CR2016 batteries
- `glue-stick-pritt-43g.png` - Pritt glue stick
- `Graphite_pencils_and_packaging.png` - Pencils
- `Lion_King_book_jacket_packaging.png` - Book jacket
- `Orange_sketchbook_with_tree_illustration.png` - Sketchbook
- `pen-bic-cristal-blue.png` - Blue BIC pen
- `Three_rolls_of_white_paper.png` - Paper rolls

## Currency Implementation (BWP - Botswana Pula)

### Currency Display Standards

Botswana Pula (BWP) should be displayed consistently throughout the application:

```typescript
// src/utils/currency.ts
export const formatCurrency = (amount: number): string => {
  return `BWP ${amount.toFixed(2)}`
}

// For discounted prices, show both original and current price
export const formatDiscountedPrice = (currentPrice: number, originalPrice: number): JSX.Element => {
  const discountPercentage = Math.round((1 - currentPrice / originalPrice) * 100)
  
  return (
    <div className="price-container">
      <div className="current-price">BWP {currentPrice.toFixed(2)}</div>
      <div className="original-price">BWP {originalPrice.toFixed(2)}</div>
      <div className="discount-badge">Save {discountPercentage}%</div>
    </div>
  )
}
```

### Image Organization in Supabase

1. Create the following storage buckets in Supabase:
   - `branding`: For BMS logos and branding materials
   - `products`: For all product images
   - `uniforms`: For school uniform images
   - `ui-elements`: For UI-related images and icons (e.g., placeholders)

2. **Upload Images:** Use the `client/upload-images.js` script. This script automatically determines the correct bucket based on keywords in the filename and formats the filename (lowercase, hyphens for spaces/special characters) before uploading.
3. **Update Database References:** After uploading, ensure the `image_url` field in your database tables (`products`, `categories`, `announcements`) uses the correct path format: `bucket_name/formatted_filename.ext`.
4. **Verify Paths:** You can generate a list of all uploaded image paths using the `get-image-urls.js` script (see `image-link-reference.md` for details and output). Use the `databaseReference` from this list to update your database.

## Image Categorization for Product Display

Based on the image assets, create the following product categories in the Supabase database:

### Categories Structure

```typescript
const categories = [
  {
    id: "school-uniforms",
    name: "School Uniforms",
    icon: "tshirt",
    description: "GIS and other school uniforms",
    image_url: "uniforms/shirt-ssleeve-gis-sky-blue.png" // Use formatted name
  },
  {
    id: "writing-instruments",
    name: "Writing Instruments",
    icon: "pen-nib",
    description: "Pens, pencils, and markers",
    image_url: "products/pen-bic-cristal-blue.png" // Use formatted name
  },
  {
    id: "art-supplies",
    name: "Art Supplies",
    icon: "palette",
    description: "Crayons, sketchbooks, and art materials",
    image_url: "products/crayons-coloured-24s-staedtler.png" // Use formatted name
  },
  {
    id: "office-supplies",
    name: "Office Supplies",
    icon: "paperclip",
    description: "Folders, paper, and general office supplies",
    image_url: "products/colorful-plastic-folders-labeled.png" // Use formatted name
  },
  {
    id: "electronics",
    name: "Electronics & Batteries",
    icon: "calculator",
    description: "Calculators, batteries, and electronic accessories",
    image_url: "products/calculator-casio-fx-82ms-sc3-dh-scientific.png" // Use formatted name
  }
]
```

## Image Component with Proper Handling

Create a reusable image component that properly handles images from Supabase storage:

```tsx
// src/components/ProductImage.tsx (Simplified example based on actual component)
import React, { useState } from 'react';

type ProductImageProps = {
  src: string; // Should be the databaseReference path, e.g., "products/pen-bic-cristal-blue.png"
  alt: string;
  className?: string;
};

const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  className = "max-h-80 object-contain"
}) => {
  const [error, setError] = useState(false);

  // Construct the full URL using the Vite environment variable and the provided src path
  // Assumes src is in the format "bucket/filename.ext"
  const imageUrl = src.startsWith('http')
    ? src
    : `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${src}`;

  return (
    <img
      src={error ? '/placeholder.svg' : imageUrl} // Fallback to placeholder on error
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  );
};

export default ProductImage;
```

## Sample Product Data Structure with Images

```typescript
const products = [
  {
    id: "pen-bic-blue",
    name: "BIC Cristal Blue Pen",
    description: "Smooth writing ballpoint pen for everyday use",
    category_id: "writing-instruments",
    image_url: "products/pen-bic-cristal-blue.png", // Correct DB reference format
    active: true,
    featured: true,
    special: false,
    prices: [
      {
        tier_name: "Retail",
        price: 3.75,
        currency: "BWP"
      },
      {
        tier_name: "Wholesale (10+)",
        price: 3.20,
        currency: "BWP"
      }
    ]
  },
  {
    id: "pritt-glue-stick",
    name: "Pritt Glue Stick 43g",
    description: "Strong adhesive perfect for paper projects",
    category_id: "office-supplies",
    image_url: "products/glue-stick-pritt-43g.png", // Correct DB reference format
    active: true,
    featured: false,
    special: true,
    prices: [
      {
        tier_name: "Retail",
        price: 42.50,
        original_price: 50.00,
        currency: "BWP"
      }
    ]
  },
  {
    id: "staedtler-crayons",
    name: "Staedtler Coloured Crayons 24s",
    description: "Vibrant colors for artistic expression",
    category_id: "art-supplies",
    image_url: "products/crayons-coloured-24s-staedtler.png", // Correct DB reference format
    active: true,
    featured: true,
    special: false,
    prices: [
      {
        tier_name: "Retail",
        price: 78.27,
        currency: "BWP"
      }
    ]
  },
  {
    id: "gis-sky-blue-shirt",
    name: "GIS Short Sleeve Sky Blue Shirt",
    description: "Official GIS uniform shirt",
    category_id: "school-uniforms",
    image_url: "uniforms/shirt-ssleeve-gis-sky-blue.png", // Correct DB reference format
    active: true,
    featured: true,
    special: false,
    prices: [
      {
        tier_name: "Small",
        price: 185.00,
        currency: "BWP"
      },
      {
        tier_name: "Medium",
        price: 195.00,
        currency: "BWP"
      },
      {
        tier_name: "Large",
        price: 205.00,
        currency: "BWP"
      }
    ]
  },
  {
    id: "casio-scientific-calculator",
    name: "Casio FX-82MS Scientific Calculator",
    description: "Advanced calculator for school and scientific use",
    category_id: "electronics",
    image_url: "products/calculator-casio-fx-82ms-sc3-dh-scientific.png", // Correct DB reference format
    active: true,
    featured: false,
    special: true,
    prices: [
      {
        tier_name: "Retail",
        price: 189.99,
        original_price: 210.00,
        currency: "BWP"
      }
    ]
  }
]
```

## Image Upload Process for Admin

Implement an image upload component for the admin interface:

```tsx
// src/components/admin/ImageUploader.tsx
import React, { useState } from 'react'
import { supabase } from '../../utils/supabaseClient'

type ImageUploaderProps = {
  bucket: string
  onUploadComplete: (filePath: string) => void
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ bucket, onUploadComplete }) => {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      setError(null)
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }
      
      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2, 11)}_${Date.now()}.${fileExt}`
      const filePath = `${fileName}`
      
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file)
      
      if (uploadError) {
        throw uploadError
      }
      
      onUploadComplete(filePath)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error uploading file')
      console.error('Error uploading image:', error)
    } finally {
      setUploading(false)
    }
  }
  
  return (
    <div className="image-uploader">
      <label className="button primary block">
        {uploading ? 'Uploading...' : 'Upload Image'}
        <input
          type="file"
          disabled={uploading}
          onChange={handleUpload}
          accept="image/*"
          className="hidden"
        />
      </label>
      
      {error && <div className="error">{error}</div>}
    </div>
  )
}

export default ImageUploader
```

## Implementation Steps

1. **Upload Branding Assets to Supabase**
   - Upload all BMS logos to the `branding` bucket
   - Use these consistently in the header and admin interface

2. **Organize Product Images**
   - Rename image files for consistency (lowercase, hyphens instead of spaces)
   - Upload to appropriate buckets in Supabase
   - Map images to products in the database

3. **Set Up Currency Formatting**
   - Implement the currency utility functions
   - Ensure all prices display with BWP and proper decimal formatting

4. **Create Product Categories**
   - Add the suggested categories to the database
   - Associate each product with the appropriate category

5. **Implement Image Components**
   - Use the ProductImage component for consistent display
   - Ensure proper fallbacks for missing images

By following this plan, you'll have a well-organized image management system that properly displays products with Botswana Pula currency formatting and appropriate categorization based on your existing images.

## Future Considerations / Tasks

*   **Database Update:** The most immediate task is to **manually update the `image_url` fields** in the Supabase database tables (`products`, `categories`, `announcements`) using the `databaseReference` values from `image-urls.txt`. This is required to fix the current image display issues.
*   **Admin Image Uploader:** Implement the `ImageUploader` component (example provided above) within the admin interface (e.g., in product/category/announcement forms) to allow users to upload images directly. Ensure this uploader uses the same filename formatting logic as the `client/upload-images.js` script for consistency.
*   **Branding Bucket Access:** Investigate why the `get-image-urls.js` script failed to list files in the `branding` bucket (potentially a permissions issue with the service key or bucket policy). Ensure all necessary branding images are present and correctly referenced.
*   **Image Optimization:** If display performance becomes an issue, consider implementing image optimization, either by resizing images before upload or by utilizing Supabase Storage image transformations via URL parameters in the `ProductImage` component.
*   **Media Library:** For easier management, consider building a dedicated media library within the admin interface, allowing browsing, uploading, and potentially deleting stored images.
