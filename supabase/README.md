# Supabase Setup for BMS Digital Signage

This directory contains the database schema and sample data for the BMS Digital Signage project.

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com/) and sign up or log in
2. Create a new project
3. Note your project URL and anon key (you'll need these later)

### 2. Set Up Database Schema

1. In your Supabase project, go to the SQL Editor
2. Copy the contents of `schema/schema.sql` and run it to create the tables and security policies
3. Copy the contents of `schema/sample_data.sql` and run it to populate the database with sample data

### 3. Configure Storage

1. In your Supabase project, go to Storage
2. Create a new bucket called `images` with public access
3. Upload the images from the `images` directory to the `images` bucket

### 4. Set Up Authentication

1. In your Supabase project, go to Authentication
2. Configure email authentication
3. Create an admin user with email and password

### 5. Update Environment Variables

1. Update the `.env.local` file in the client directory with your Supabase URL and anon key:

```
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Schema

The database schema consists of the following tables:

- `categories`: Store product categories
- `products`: Store product information
- `product_prices`: Store product pricing information (supports multi-tier pricing)
- `announcements`: Store announcements for the display
- `settings`: Store application settings

## Row Level Security

Row Level Security (RLS) is enabled on all tables with the following policies:

- Anonymous users can only read active products, announcements, and other public data
- Authenticated users (admins) have full access to all tables

## Storage

The storage is organized as follows:

- `images`: Public bucket for storing product and category images