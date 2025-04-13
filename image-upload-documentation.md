# BMS Digital Signage - Image Upload Documentation

This document provides comprehensive information about the image upload process for the BMS Digital Signage project, including storage structure, upload procedures, and naming conventions.

## Supabase Storage Structure

The project uses Supabase Storage for managing all images. Images are organized into the following buckets:

| Bucket Name | Purpose | Content Types |
|-------------|---------|---------------|
| `branding` | Brand assets | Logos, favicons, brand identity elements |
| `products` | Product images | Photos of stationery, calculators, and other merchandise |
| `uniforms` | Uniform items | School uniforms, sportswear, and accessories |
| `announcements` | Promotional banners | Sale announcements, event promotions, seasonal offers |
| `ui-elements` | Interface elements | Placeholders, icons, and UI components |

## Image Upload Process

### Automatic Upload Script

The project includes an automated script (`upload-images-modified.js`) that:

1. Scans the `client/public/images` directory
2. Categorizes images based on filename patterns
3. Creates storage buckets if they don't exist
4. Uploads images to the appropriate buckets
5. Generates standardized filenames for consistency
6. Provides detailed upload statistics

### Running the Upload Script

To upload images to Supabase:

```bash
cd client
npm run upload-images-modified
```

This script requires proper Supabase credentials in the `.env` file:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key (optional)
```

## Image Categorization Logic

The script automatically categorizes images based on filename patterns:

| Category | Filename Pattern | Destination Bucket |
|----------|------------------|-------------------|
| Branding | Contains "logo" or "favicon" | `branding` |
| Uniforms | Contains "shirt", "jersey", "tunic", "hat", "pants", or "shorts" | `uniforms` |
| UI Elements | Contains "placeholder" or "icon" | `ui-elements` |
| Announcements | Contains "exam", "sale", or "term supplies" | `announcements` |
| Other Products | All other images | `products` (default) |

## Filename Standardization

The upload script standardizes filenames for consistency:

1. Converts to lowercase
2. Replaces spaces with hyphens
3. Removes special characters
4. Ensures consistent formatting

Example transformations:
- `Back to School Sale.png` → `back-to-school-sale.png`
- `JERSEY NAVY WHITE STRIPES GIS HS.png` → `jersey-navy-white-stripes-gis-hs.png`

## Accessing Images in the Application

### URL Structure

Images can be accessed using the Supabase public URL pattern:

```
https://[PROJECT_ID].supabase.co/storage/v1/object/public/[BUCKET_NAME]/[FILENAME]
```

### Database References

When storing image references in the database, use the format:

```
[BUCKET_NAME]/[FILENAME]
```

Example: `announcements/back-to-school-sale.png`

## Current Image Inventory

The project currently has 31 images uploaded across 5 storage buckets:

- **Branding**: 4 files (logos and favicons)
- **Products**: 14 files (stationery and school supplies)
- **Uniforms**: 7 files (school uniform items)
- **UI Elements**: 1 file (placeholder)
- **Announcements**: 5 files (promotional banners)

## Troubleshooting

If you encounter issues with the upload process:

1. Verify your Supabase credentials in the `.env` file
2. Ensure the Supabase project has storage enabled
3. Check that the service role key has proper permissions
4. Verify that the image files exist in the correct directory
5. Check the console output for specific error messages

## Adding New Images

To add new images to the project:

1. Place image files in the `client/public/images` directory
2. Follow the naming conventions to ensure proper categorization
3. Run the upload script to process the new images
4. Update database references as needed

## Maintaining Image Quality

For optimal performance:

- Keep image file sizes under 2MB
- Use PNG format for images requiring transparency
- Use JPEG format for photographs
- Optimize images before uploading
- Maintain consistent aspect ratios for similar content types
