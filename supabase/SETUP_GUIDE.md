# Supabase Setup Guide for BMS Digital Signage

This guide will walk you through the process of setting up your Supabase project for the BMS Digital Signage system.

## Prerequisites

- Supabase account (already created)
- Supabase project (already created with the following details):
  - Project Name: bms-digital-signage
  - Project ID: rwsjbkedgztplwzxoxks
  - Project URL: https://rwsjbkedgztplwzxoxks.supabase.co

## Step 1: Set Up Database Schema

1. Sign in to your Supabase account at [https://app.supabase.com](https://app.supabase.com)
2. Navigate to your project: bms-digital-signage
3. In the left sidebar, click on "SQL Editor"
4. Click "New Query" to create a new SQL query
5. Copy the contents of the `schema.sql` file (located in the `supabase/schema` directory) and paste it into the SQL Editor
6. Click "Run" to execute the SQL and create the database schema
7. Verify that the tables have been created by checking the "Table Editor" in the left sidebar

## Step 2: Import Sample Data

1. In the SQL Editor, click "New Query" again to create another SQL query
2. Copy the contents of the `sample_data.sql` file (located in the `supabase/schema` directory) and paste it into the SQL Editor
3. Click "Run" to execute the SQL and import the sample data
4. Verify that the data has been imported by checking the "Table Editor" and viewing the data in each table

## Step 3: Set Up Storage for Images

1. In the left sidebar, click on "Storage"
2. Click "Create a new bucket"
3. Enter "images" as the bucket name
4. Enable "Public bucket" to make the images publicly accessible
5. Click "Create bucket"

## Step 4: Upload Images

1. In the Storage section, click on the "images" bucket
2. Click "Upload" to upload images
3. Select all the images from the `images` directory in the project
4. Click "Upload" to upload the images to the bucket
5. Note: You can also use the Supabase Storage API to upload images programmatically

## Step 5: Configure Authentication

1. In the left sidebar, click on "Authentication"
2. Go to the "Settings" tab
3. Under "Email Auth", make sure it's enabled
4. Optionally, you can configure additional authentication providers as needed

## Step 6: Create an Admin User

1. In the left sidebar, click on "Authentication"
2. Go to the "Users" tab
3. Click "Add User"
4. Enter the admin email and password
5. Click "Create User"

## Step 7: Verify Environment Variables

1. Make sure the `.env.local` file in the client directory contains the correct Supabase URL and anon key:
```
REACT_APP_SUPABASE_URL=https://rwsjbkedgztplwzxoxks.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3c2pia2VkZ3p0cGx3enhveGtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2Njg1MzAsImV4cCI6MjA1OTI0NDUzMH0.cfd5F50Yu3Kmu-ipJzPjHWeLe6bcmk4MzXCw91PI_Jg
```

## Step 8: Start the Development Server

1. Navigate to the client directory:
```bash
cd client
```

2. Start the development server:
```bash
npm start
```

3. Open your browser and navigate to [http://localhost:3000](http://localhost:3000) to see the application

## Troubleshooting

If you encounter any issues during the setup process, here are some common solutions:

- **SQL Errors**: Make sure you're running the schema.sql file before the sample_data.sql file
- **Authentication Issues**: Check that your Supabase URL and anon key are correct in the .env.local file
- **Storage Issues**: Ensure that the images bucket is set to public
- **React App Issues**: Make sure all dependencies are installed by running `npm install` in the client directory

## Next Steps

Once you've completed the setup, you can:

1. Access the admin interface at [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
2. Use the admin credentials you created to log in
3. Start managing products, categories, and announcements
4. View the display interface at [http://localhost:3000](http://localhost:3000)