# BMS Digital Signage Admin Interface Documentation

This document provides detailed information about the enhanced admin interface for the BMS Digital Signage system, including the new components, their functionality, and how to use them.

## Table of Contents

1. [Admin Layout](#admin-layout)
2. [Image Management](#image-management)
3. [CSV Import/Export](#csv-import-export)
4. [Enhanced Product Form](#enhanced-product-form)
5. [Troubleshooting](#troubleshooting)

## Admin Layout

The `AdminLayout` component provides a consistent layout wrapper for all admin pages, ensuring a unified look and feel throughout the admin interface.

### Features

- **Header**: Contains the BMS Admin Dashboard title and user information with a sign-out button
- **Navigation**: Horizontal navigation bar with links to all admin sections
- **Main Content Area**: Flexible content area for page-specific content
- **Footer**: Consistent footer with copyright information

### Usage

Wrap any admin page component with the `AdminLayout` component:

```tsx
import AdminLayout from '../../components/admin/AdminLayout';

const YourAdminPage: React.FC = () => {
  return (
    <AdminLayout>
      {/* Your page content here */}
    </AdminLayout>
  );
};
```

## Image Management

The `ImageManager` component provides a WordPress-style media library interface for managing images across the application.

### Features

- **Media Library Modal**: Browse and select images from different storage buckets
- **Image Preview**: Preview images before selection
- **Image Upload**: Upload new images directly from the interface
- **Image Search**: Search for images by filename
- **Bucket Organization**: Images are organized into different buckets (branding, products, uniforms, ui-elements)

### Usage

```tsx
import ImageManager from '../../components/admin/ImageManager';

// In your component
const [imageUrl, setImageUrl] = useState<string | null>(null);

// Then in your JSX
<ImageManager
  currentImage={imageUrl}
  onSelect={(path) => setImageUrl(path)}
  bucket="products" // Default bucket, can be changed in the modal
/>
```

### Buckets

The system uses the following storage buckets:

- **branding**: Logo, favicon, and other branding assets
- **products**: Product images
- **uniforms**: School uniform images
- **ui-elements**: UI elements like icons, backgrounds, etc.

## CSV Import/Export

The `ImportExport` component provides functionality for importing and exporting data in CSV format.

### Features

- **Import**: Import products, categories, and announcements from CSV files
- **Export**: Export existing data to CSV files for backup or editing
- **Validation**: Validate imported data to ensure it meets the required format
- **Error Handling**: Display detailed error messages for failed imports

### CSV Templates

#### Products CSV Format

```
name,description,category_id,image_url,active,featured,special,price,original_price,tier_name,currency
```

Example:
```
GIS Sky Blue Shirt,Short sleeve sky blue shirt for GIS,1,uniforms/shirt-ssleeve-gis-sky-blue.png,true,true,false,149.99,,Size 4,BWP
```

#### Categories CSV Format

```
name,description,image_url,icon,color,display_order
```

Example:
```
School Uniforms,School uniforms for various schools,,shirt,#3b82f6,1
```

#### Announcements CSV Format

```
title,content,image_url,type,active,start_date,end_date
```

Example:
```
Back to School Sale,Get up to 20% off on all school uniforms!,,ticker,true,2025-01-01,2025-02-28
```

### Usage

Navigate to the Import/Export page from the admin navigation menu. From there, you can:

1. Select the type of data to import/export
2. For imports, select a CSV file and click the import button
3. For exports, click the export button for the desired data type

## Enhanced Product Form

The product form has been enhanced to use the new `ImageManager` component for better image selection.

### Features

- **Image Selection**: Select product images from the media library
- **Multiple Price Tiers**: Add multiple price tiers for different sizes or variants
- **Validation**: Validate form inputs before submission
- **Error Handling**: Display detailed error messages for failed submissions

### Price Tiers

Products can have multiple price tiers, which are useful for items that come in different sizes or variants. Each price tier can have:

- **Tier Name**: Optional name for the tier (e.g., "Size 4", "Small", etc.)
- **Price**: Required price for the tier
- **Original Price**: Optional original price for discounted items
- **Currency**: Currency code (defaults to BWP)

## Troubleshooting

### Styling Issues

If Tailwind CSS styles are not being applied correctly:

1. Check that the PostCSS configuration is correct in `postcss.config.js`:
   ```js
   export default {
     plugins: {
       'tailwindcss': {},
       autoprefixer: {},
     },
   }
   ```

2. Ensure that Tailwind CSS is properly imported in `index.css`:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

3. Verify that the Tailwind configuration is correct in `tailwind.config.js`

### Authentication Issues

For development purposes, authentication can be bypassed by modifying the `ProtectedRoute` component. In production, this should be removed to ensure proper authentication.

### Image Upload Issues

If image uploads are failing:

1. Check that the Supabase storage buckets are properly configured
2. Ensure that the correct permissions are set for the buckets
3. Verify that the Supabase URL and API key are correctly configured in the environment variables

### CSV Import Issues

If CSV imports are failing:

1. Check that the CSV file follows the correct format
2. Ensure that required fields are provided
3. Verify that foreign key references (e.g., category_id) exist in the database