# BMS Digital Signage CSV Import/Export Demonstration

This guide demonstrates how to use the CSV import/export functionality in the BMS Digital Signage system with practical examples.

## Prerequisites

- Access to the BMS Digital Signage admin interface
- Basic understanding of CSV files
- A spreadsheet application (Microsoft Excel, Google Sheets, LibreOffice Calc, etc.)

## Step 1: Download Sample Data

First, let's download the current data from the system to see what's already there.

1. Log in to the BMS Digital Signage admin interface
2. Navigate to the "Import & Export" page
3. In the "Export Data" section, click the "Export Products" button
4. The system will generate a CSV file and download it to your computer
5. Open the downloaded file in your spreadsheet application

You should see a list of products with their details, including:
- Name
- Description
- Category ID
- Image URL
- Active status
- Featured status
- Special status
- Price
- Original price
- Tier name
- Currency

## Step 2: Modify the Data

Now, let's make some changes to the data:

### Example 1: Update Existing Products

1. Find the "GIS Sky Blue Shirt" product
2. Change its price from 149.99 to 159.99
3. Update its original price from 169.99 to 179.99

### Example 2: Add a New Product

Add a new row at the end of the file with the following details:

```
Northside Primary Bucket Hat,Bucket hat for Northside Primary School,1,uniforms/bucket-hat-northside-primary.png,true,false,false,89.99,,Medium,BWP
```

### Example 3: Save Your Changes

1. Save the file as "updated_products.csv"
2. Make sure to save it in CSV format (not Excel format)

## Step 3: Upload the Modified Data

Now, let's upload the modified data back to the system:

1. Go back to the "Import & Export" page in the admin interface
2. In the "Import Data" section, select "Products" from the dropdown
3. Either drag and drop your "updated_products.csv" file into the drop zone or click to select the file
4. Click the "Import Data" button
5. Wait for the import to complete

## Step 4: Verify the Changes

After the import completes, you should see a success message. Let's verify that our changes were applied:

1. Navigate to the "Products" page in the admin interface
2. Find the "GIS Sky Blue Shirt" product - it should now show the updated price of 159.99
3. Look for the new "Northside Primary Bucket Hat" product - it should be listed with all the details we provided

## Additional Examples

### Example: Updating Categories

1. Export the current categories by clicking "Export Categories"
2. Open the downloaded file in your spreadsheet application
3. Update the description of "School Uniforms" to "Complete range of uniforms for all local schools"
4. Add a new category:
   ```
   Sports Equipment,Sports gear and equipment for physical education,sports/category-sports.png,ball,#8b5cf6,6
   ```
5. Save as "updated_categories.csv"
6. Import the file by selecting "Categories" and uploading the file
7. Verify the changes on the "Categories" page

### Example: Updating Announcements

1. Export the current announcements by clicking "Export Announcements"
2. Open the downloaded file in your spreadsheet application
3. Update the "Back to School Sale" announcement:
   - Change "Get up to 25% off" to "Get up to 30% off"
   - Extend the end date from 2025-02-28 to 2025-03-15
4. Add a new announcement:
   ```
   Back to School Workshop,Join our free back to school preparation workshop on January 15th!,announcements/workshop.png,popup,true,2025-01-05,2025-01-16
   ```
5. Save as "updated_announcements.csv"
6. Import the file by selecting "Announcements" and uploading the file
7. Verify the changes on the "Announcements" page

## Common Issues and Troubleshooting

### Issue: Import Fails with CSV Parsing Errors

**Solution:** Check that your CSV file is properly formatted:
- Make sure there are no extra commas in text fields
- If a text field needs to contain commas, make sure it's properly quoted
- Check that all required fields are present

### Issue: Products Not Updating

**Solution:** Make sure the name field exactly matches the existing product name, as this is used as the unique identifier for updates.

### Issue: Images Not Showing After Import

**Solution:** Verify that the image_url field contains the correct path to the image. The path should be relative to the images directory in the system.

## Best Practices

1. **Always export first** before making changes to ensure you have the correct format and current data
2. **Make a backup** of the exported file before making changes
3. **Test with a small set of changes** before making large-scale updates
4. **Verify your changes** after import to ensure everything was applied correctly
5. **Use descriptive filenames** for your CSV files to keep track of different versions

## Conclusion

The CSV import/export functionality provides a powerful way to manage your data in bulk. By following this demonstration, you should now be able to:
- Export existing data
- Make changes to the data
- Add new items
- Import the updated data
- Verify that your changes were applied correctly
