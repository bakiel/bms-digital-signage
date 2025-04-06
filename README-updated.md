# BMS Digital Signage System

A digital signage solution for BMS in-store product displays, optimized for Mi TV Stick devices.

## Overview

The BMS Digital Signage System creates animated product showcases for in-store displays. Built with React and Supabase, it features:

- Dynamic slideshow with animated transitions
- Real-time information bar (clock, weather, announcements)
- Today's specials and promotional content
- Hidden admin controls (appear on mouse movement)
- Secure store-only system

## Tech Stack

- **Frontend:** React with TypeScript
- **Backend:** Supabase
- **Animation:** Framer Motion
- **Styling:** TailwindCSS
- **Deployment:** GitHub, Vercel/Netlify

## Project Structure

```
bms-digital-signage/
├── README-updated.md   # This file
├── image-management.md # Image handling guide
├── image-link-reference.md # List of image URLs/Refs
├── mi-tv-setup.md      # Mi TV Stick specific setup
├── planning-revised.md # Project planning notes
├── tasks-revised-updated.md # Task tracking
│
├── client/             # React frontend (Vite + TypeScript)
│   ├── public/         # Static assets (e.g., placeholder.svg)
│   └── src/
│       ├── assets/     # Other static assets like react.svg
│       ├── components/ # UI components
│       │   ├── admin/
│       │   ├── animations/
│       │   └── slides/
│       ├── context/    # React context (e.g., AuthContext)
│       ├── pages/      # Page components (Display, Admin pages)
│       ├── types.ts    # Shared TypeScript types
│       ├── utils/      # Utility functions (supabaseClient, currencyUtils)
│       ├── App.tsx     # Main application component
│       ├── main.tsx    # Entry point
│       └── index.css   # Global styles
│   ├── .env            # Environment variables (VITE_...) - **DO NOT COMMIT**
│   ├── vite.config.ts  # Vite configuration
│   └── package.json    # Frontend dependencies
│
├── images/             # Source image files (before upload)
│
├── supabase/           # Supabase configuration
│   ├── schema/         # Database schema (.sql files)
│   └── SETUP_GUIDE.md  # Detailed Supabase setup instructions
│
├── get-image-urls.js   # Script to list image URLs from Supabase
├── generate-update-sql.js # Script to generate SQL for updating image URLs
└── image-urls.txt      # Output of get-image-urls.js (JSON list) - **DO NOT COMMIT**
```

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd bms-digital-signage
```

### 2. Install Dependencies

```bash
cd client
npm install
```

### 3. Set Up Supabase

Follow the detailed instructions in [supabase/SETUP_GUIDE.md](supabase/SETUP_GUIDE.md) to:
- Set up the database schema
- Import sample data
- Configure storage for images
- Set up authentication
- Create an admin user

### 4. Configure Environment Variables

Create a `.env` file in the `client/` directory (copy from `.env.example` if it exists) and add your Supabase credentials and any other required keys (like the Weather API key):

```dotenv
# client/.env
VITE_SUPABASE_URL=https://rwsjbkedgztplwzxoxks.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3c2pia2VkZ3p0cGx3enhveGtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2Njg1MzAsImV4cCI6MjA1OTI0NDUzMH0.cfd5F50Yu3Kmu-ipJzPjHWeLe6bcmk4MzXCw91PI_Jg
VITE_WEATHER_API_KEY=your_openweathermap_api_key 
```
**Important:** Add `client/.env` to your `.gitignore` file to avoid committing secrets.

### 5. Start the Development Server

From the `client/` directory:
```bash
npm run dev
```
The application should be accessible at `http://localhost:5173` (or the port specified by Vite).

## In-Store Deployment

1. Connect Mi TV Stick to store TV's HDMI port
2. Connect to store WiFi
3. Open browser and navigate to the app URL
4. Enter fullscreen mode
5. For admin access, move cursor to show controls

## Admin Guide

1. Move cursor to reveal admin button
2. Click admin and enter credentials
3. Update products/categories/specials
4. Preview changes
5. Publish and return to display mode

## Supabase Project Details

- **Project Name:** bms-digital-signage
- **Project URL:** https://rwsjbkedgztplwzxoxks.supabase.co
- **Project ID:** rwsjbkedgztplwzxoxks

## Additional Documentation

- [image-management.md](image-management.md) - Guide on handling images and Supabase storage.
- [image-link-reference.md](image-link-reference.md) - Reference list of image URLs/paths in Supabase.
- [mi-tv-setup.md](mi-tv-setup.md) - Notes on setting up and optimizing for Mi TV Stick.
- [planning-revised.md](planning-revised.md) - Project planning details.
- [tasks-revised-updated.md](tasks-revised-updated.md) - Task tracking.
- [supabase/SETUP_GUIDE.md](supabase/SETUP_GUIDE.md) - Detailed Supabase setup instructions.
