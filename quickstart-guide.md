# BMS Digital Signage - Quick Start Guide

This guide outlines the essential steps to set up and run the BMS Digital Signage project locally.

## Prerequisites

-   Node.js (v18 or later recommended) and npm
-   Git for version control
-   Access to the BMS Supabase project (URL, Anon Key, Service Key)
-   An OpenWeatherMap API key (optional, for the weather display in the InfoBar)
-   Mi TV Stick or similar device for target deployment testing (optional)

## 1. Project Setup

### Clone the Repository
If you haven't already, clone the project repository:
```bash
git clone <repository-url>
cd bms-digital-signage
```

### Install Frontend Dependencies
Navigate to the client directory and install the necessary packages:
```bash
cd client
npm install
```
Key dependencies include: `@supabase/supabase-js`, `react`, `react-dom`, `react-router-dom`, `framer-motion`, `tailwindcss`, `tsparticles-slim`, `react-tsparticles`.

### Configure Environment Variables
Create a `.env` file in the `client/` directory. You can copy `client/.env.example` if it exists. Add your Supabase credentials and OpenWeatherMap API key:
```dotenv
# client/.env
VITE_SUPABASE_URL=https://rwsjbkedgztplwzxoxks.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key # Replace with actual Anon Key
VITE_WEATHER_API_KEY=your_openweathermap_api_key # Replace with actual Weather Key
```
**Important:** Ensure `client/.env` is added to your `.gitignore` file.

## 2. Supabase Setup

Refer to the detailed instructions in `supabase/SETUP_GUIDE.md` for:
-   Setting up the database schema (using files in `supabase/schema/`).
-   Configuring Supabase Storage buckets (`branding`, `products`, `uniforms`, `ui-elements`) with appropriate public access policies.
-   Setting up authentication and creating an admin user if needed.

## 3. Image Handling

### Uploading Images
Images should be placed in the `/images` directory at the project root. The `client/upload-images.js` script can be used to upload these images to the correct Supabase storage buckets. This script also formats filenames (lowercase, hyphens).
```bash
# Run from project root
# node client/upload-images.js # (Ensure script is configured correctly first)
```
*(Note: Running this script requires Node.js environment and potentially adjustments)*

### Verifying Image Paths
The `get-image-urls.js` script (in the project root) can be used to generate a list of images currently in the storage buckets and their database reference paths. This uses the Supabase Service Role Key for access.
```bash
# Run from project root after npm install @supabase/supabase-js
node get-image-urls.js > image-urls.txt
```
The output is saved to `image-urls.txt`. Refer to `image-link-reference.md` for the structure of this file.

### Updating Database
Ensure the `image_url` fields in your Supabase tables (`products`, `categories`, `announcements`) match the `databaseReference` paths found in `image-urls.txt` (e.g., `products/formatted-product-name.png`). This usually needs to be done manually via the Supabase dashboard or using custom SQL/scripts. The `generate-update-sql.js` script can help create SQL statements for review.

## 4. Running the Application

### Start the Development Server
From the `client/` directory:
```bash
npm run dev
```
The application will typically be available at `http://localhost:5173`.

### Building for Production
From the `client/` directory:
```bash
npm run build
```
This will create a production-ready build in the `client/dist` folder.

## 5. Key Components & Structure

-   **`client/src/main.tsx`**: Application entry point.
-   **`client/src/App.tsx`**: Main application component, likely handles routing.
-   **`client/src/pages/Display.tsx`**: The main digital signage display page.
-   **`client/src/components/SlideShow.tsx`**: Core component managing slide fetching, transitions, and rendering.
-   **`client/src/components/InfoBar.tsx`**: Top bar displaying time, weather, ticker.
-   **`client/src/components/slides/`**: Contains individual slide type components (`ProductSlide.tsx`, `CategorySlide.tsx`, `AnnouncementSlide.tsx`).
-   **`client/src/components/animations/ParticleBackground.tsx`**: Animated background effect.
-   **`client/src/utils/supabaseClient.ts`**: Initializes the Supabase client using environment variables.
-   **`client/src/types.ts`**: Shared TypeScript type definitions.
-   **`client/src/pages/admin/`**: Contains components for the admin interface (Login, Dashboard, etc.).
-   **`client/src/context/AuthContext.tsx`**: Handles admin authentication state.

## 6. Deployment & Testing

-   Deploy the contents of `client/dist` to a static hosting provider (Vercel, Netlify, etc.).
-   Test the deployed URL on the target device (e.g., Mi TV Stick) connected to the store network.
-   Verify layout, readability, animations, and transitions on the target display.
