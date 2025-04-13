# CSV Import/Export Guide for BMS Digital Signage

This guide explains how to use the CSV import/export functionality to manage your data in bulk.

## Accessing the Import/Export Page

1. Log in to the BMS Digital Signage admin interface
2. Click on "Import & Export" in the left navigation menu

## Exporting Data

1. In the "Export Data" section, click one of the export buttons:
   - Export Products
   - Export Categories
   - Export Announcements
2. The system will generate a CSV file and download it to your computer
3. Open the file in a spreadsheet application like Microsoft Excel, Google Sheets, or LibreOffice Calc

## Importing Data

### Step 1: Prepare Your CSV File

You can either:
- Modify an exported CSV file with your changes
- Download a template by clicking "Download Template" and fill it with your data
- Create a new CSV file following the required format

### Step 2: Upload Your CSV File

1. In the "Import Data" section, select the type of data you want to import:
   - Products
   - Categories
   - Announcements
2. Either drag and drop your CSV file into the drop zone or click to select the file
3. Click the "Import Data" button
4. Wait for the import to complete and review the results

## CSV File Formats

### Products CSV Format

```
name,description,category_id,image_url,active,featured,special,price,original_price,tier_name,currency
GIS Sky Blue Shirt,Short sleeve sky blue shirt for GIS,1,uniforms/shirt-ssleeve-gis-sky-blue.png,true,true,false,149.99,169.99,Size 4,BWP
```

Required fields:
- name: Product name (used as unique identifier for updates)
- price: Product price

### Categories CSV Format

```
name,description,image_url,icon,color,display_order
School Uniforms,Complete range of uniforms for local schools,uniforms/category-uniforms.png,shirt,#4b5563,1
```

Required fields:
- name: Category name (used as unique identifier for updates)

### Announcements CSV Format

```
title,content,image_url,type,active,start_date,end_date
Back to School Sale,Get up to 25% off on all school uniforms!,,ticker,true,2025-01-01,2025-02-28
```

Required fields:
- title: Announcement title (used as unique identifier for updates)
- content: Announcement content
- type: Must be one of: ticker, slide, popup

## Important Notes

1. **Unique Identifiers**: The system uses the following fields as unique identifiers:
   - Products: name
   - Categories: name
   - Announcements: title
   
   If a record with the same identifier exists, it will be updated. Otherwise, a new record will be created.

2. **Image URLs**: Image URLs should be relative paths to images in the system. For example:
   - uniforms/shirt-ssleeve-gis-sky-blue.png
   - announcements/back-to-school-sale.png

3. **Boolean Values**: For fields like active, featured, and special, use "true" or "false" (without quotes).

4. **Date Format**: Use YYYY-MM-DD format for dates (e.g., 2025-01-01).

5. **Required Fields**: Make sure all required fields are included in your CSV file.

## Troubleshooting

### Import Fails with CSV Parsing Errors

**Solution:** Check that your CSV file is properly formatted:
- Make sure there are no extra commas in text fields
- If a text field needs to contain commas, make sure it's properly quoted
- Check that all required fields are present

### Products Not Updating

**Solution:** Make sure the name field exactly matches the existing product name, as this is used as the unique identifier for updates.

### Images Not Showing After Import

**Solution:** Verify that the image_url field contains the correct path to the image. The path should be relative to the images directory in the system.

## Sample Files

The following sample files are available for reference:
- sample_products.csv
- sample_categories.csv
- sample_announcements.csv

You can also refer to the updated versions of these files to see examples of how to modify data:
- updated_products.csv
- updated_categories.csv
- updated_announcements.csv

For a detailed demonstration of the import/export process, see the [CSV Import/Export Demonstration](csv-import-export-demo.md) guide.
