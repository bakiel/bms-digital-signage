# BMS Digital Signage - Server Setup Documentation

This document provides comprehensive information about setting up and running the BMS Digital Signage application server.

## Architecture Overview

The BMS Digital Signage application uses a modern web architecture:

- **Frontend**: React application built with Vite
- **Backend**: Supabase (PostgreSQL database, authentication, storage, and serverless functions)
- **Hosting**: Client-side application with backend-as-a-service

## Prerequisites

Before running the server, ensure you have:

1. **Node.js** (v16.x or higher)
2. **npm** (v8.x or higher)
3. **Supabase Project** (see [Supabase Setup](supabase/README.md))
4. **.env** file with proper configuration

## Environment Setup

### 1. Install Dependencies

First, install all required dependencies:

```bash
# Install root project dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### 2. Configure Environment Variables

Create or update the `.env` file in the `client` directory with your Supabase credentials:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key (optional)
```

You can find these values in your Supabase project dashboard under Project Settings > API.

### 3. Database Setup

Ensure your Supabase database is properly set up:

1. Run the schema creation script from `supabase/schema/schema.sql`
2. Load sample data using `supabase/schema/sample_data.sql`
3. Apply settings migration if needed with `supabase/schema/settings_migration.sql`

## Running the Development Server

### Starting the Client Server

The client application runs on a local development server using Vite:

```bash
# From the project root
npm run start-client

# OR from the client directory
cd client
npm run dev
```

This will start the development server, typically at http://localhost:5173.

### Server Scripts

The project includes several npm scripts in the `package.json` file:

| Script | Description |
|--------|-------------|
| `start-client` | Starts the client development server |
| `build-client` | Builds the client for production |
| `upload-images` | Uploads images to Supabase storage |
| `update-image-urls` | Updates image URLs in the database |

## Accessing the Application

Once the server is running, you can access:

- **Digital Signage Display**: http://localhost:5173/
- **Admin Interface**: http://localhost:5173/admin

### Default Admin Credentials

For the admin interface, use the credentials created during Supabase setup:

- **Email**: The email you configured in Supabase Authentication
- **Password**: The password you set during admin user creation

## Supabase Integration

The application connects to Supabase for:

1. **Authentication**: User login and session management
2. **Database**: Storing and retrieving product, category, and announcement data
3. **Storage**: Managing images for products, categories, and announcements
4. **Edge Functions**: Serverless functions for specific operations

## Troubleshooting

### Common Issues

1. **Server won't start**:
   - Verify Node.js and npm versions
   - Check for errors in the console output
   - Ensure all dependencies are installed

2. **Authentication errors**:
   - Verify Supabase URL and anon key in `.env` file
   - Check Supabase authentication settings

3. **Missing images**:
   - Run the image upload script
   - Verify Supabase storage buckets exist
   - Check image paths in the database

4. **Database connection issues**:
   - Verify Supabase is running
   - Check network connectivity
   - Ensure RLS policies are correctly configured

### Logs and Debugging

For detailed logs:

- Check the terminal where the server is running
- Use browser developer tools for frontend issues
- Check Supabase logs for backend issues

## Production Deployment

For production deployment:

1. Build the client application:
   ```bash
   cd client
   npm run build
   ```

2. Deploy the built files to your hosting provider
3. Ensure environment variables are properly set in your production environment
4. Configure your Supabase project for production use

## Additional Resources

- [Supabase Documentation](https://supabase.io/docs)
- [Vite Documentation](https://vitejs.dev/guide/)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Image Upload Documentation](image-upload-documentation.md)
