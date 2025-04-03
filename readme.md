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

- **Frontend:** React
- **Backend:** Supabase
- **Animation:** Framer Motion
- **Styling:** TailwindCSS
- **Deployment:** GitHub, Vercel/Netlify

## Implementation Notes for LLM

1. **Use Brave Browser** for all research, website visits, and searching needs
2. **Git MCP** is available for repository management
3. **Supabase MCP** is available for backend implementation
4. **15 sample projects** are available for reference
5. **Efficiency is critical** - implementation must be quick

## Project Structure

```
bms-digital-signage/
├── README.md           # Main documentation
├── PLANNING.md         # Implementation plan
├── TASKS.md            # Tracking with checkboxes
│
├── client/             # React frontend
│   ├── public/         # Static assets
│   └── src/
│       ├── components/ # UI components
│       ├── pages/      # Page components
│       ├── hooks/      # Custom React hooks
│       ├── context/    # React context providers
│       ├── animations/ # Animation definitions
│       ├── utils/      # Utility functions
│       ├── api/        # Supabase integration
│       ├── styles/     # CSS/styling files
│       └── App.js      # Main application component
│
└── supabase/           # Supabase configuration
    ├── schema/         # Database schema
    └── functions/      # Edge functions
```

## Quick Start

### Setup (Using Git & Supabase MCPs)

1. **Create React App**
   ```bash
   npx create-react-app bms-digital-signage
   cd bms-digital-signage
   ```

2. **Install dependencies**
   ```bash
   npm install @supabase/supabase-js framer-motion tailwindcss
   npm install @tailwindcss/forms dayjs react-router-dom
   ```

3. **Configure Supabase**
   - Create project in Supabase
   - Set up tables per PLANNING.md schema
   - Add environment variables
   ```bash
   echo "REACT_APP_SUPABASE_URL=your_supabase_url" > .env.local
   echo "REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key" >> .env.local
   ```

4. **Initialize Git repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

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

## Additional Documentation

See [PLANNING.md](PLANNING.md) and [TASKS.md](TASKS.md) for implementation details.
