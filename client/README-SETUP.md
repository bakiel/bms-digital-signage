# BMS Digital Signage - Setup Guide

This guide will walk you through the process of setting up the BMS Digital Signage project.

## Prerequisites

- Node.js (v18 or higher)
- npm (v8 or higher)
- Supabase account and project (already created)

## Installation

1. Install dependencies:

```bash
cd client
npm install
```

## Supabase Setup

The project requires a Supabase backend for data storage and authentication. Follow these steps to set up Supabase:

### 1. Set Up Database Schema

Due to permission limitations, you'll need to set up the database schema manually using the Supabase dashboard:

1. Sign in to your Supabase account at [https://app.supabase.com](https://app.supabase.com)
2. Navigate to your project: bms-digital-signage
3. In the left sidebar, click on "SQL Editor"
4. Click "New Query" to create a new SQL query
5. Copy the contents of the `supabase/schema/schema.sql` file and paste it into the SQL Editor
6. Click "Run" to execute the SQL and create the database schema
7. Verify that the tables have been created by checking the "Table Editor" in the left sidebar

### 2. Import Sample Data

1. In the SQL Editor, click "New Query" again to create another SQL query
2. Copy the contents of the `supabase/schema/sample_data.sql` file and paste it into the SQL Editor
3. Click "Run" to execute the SQL and import the sample data
4. Verify that the data has been imported by checking the "Table Editor" and viewing the data in each table

### 3. Create Admin User

Run the Supabase setup script to create an admin user:

```bash
cd client
npm run setup-supabase
```

This will create an admin user with the following credentials:
- Email: admin@bms.com
- Password: admin123

### 2. Upload Images to Supabase Storage

This script will upload all images from the `images` directory to the Supabase storage bucket:

```bash
cd client
npm run upload-images
```

## Running the Development Server

### Fix for Node.js `uv_cwd` Error

If you encounter a Node.js `uv_cwd` error when trying to run the development server, use the following command instead:

```bash
cd client
npm run dev:fix
```

This script sets the correct working directory before starting the Vite development server.

### Regular Development Server

If you don't encounter any errors, you can use the regular development server command:

```bash
cd client
npm run dev
```

## Accessing the Application

- **Customer Display**: [http://localhost:5173/](http://localhost:5173/)
- **Admin Interface**: [http://localhost:5173/admin/login](http://localhost:5173/admin/login)

### Admin Credentials

- **Email**: admin@bms.com
- **Password**: admin123

## Building for Production

To build the application for production:

```bash
cd client
npm run build
```

The built files will be in the `dist` directory.

## Troubleshooting

### Supabase Connection Issues

- Check that your `.env.local` file contains the correct Supabase URL and anon key.
- Verify that your Supabase project is active and accessible.

### Node.js Errors

- If you encounter Node.js errors, try using the `dev:fix` script instead of the regular `dev` script.
- Make sure you're using a compatible version of Node.js (v18 or higher).

### Image Upload Issues

- If images fail to upload, check that the `images` bucket exists in your Supabase storage.
- Verify that the images in the `images` directory are valid image files.