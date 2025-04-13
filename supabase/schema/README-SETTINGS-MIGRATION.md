# Settings Migration Guide

This guide explains how to apply the settings migration to your Supabase database to fix the "JSON object requested, multiple (or no) rows returned" error in the Settings page.

## What This Migration Does

The `settings_migration.sql` script performs the following actions:

1. Creates the `settings` table if it doesn't exist with the proper structure
2. Adds any missing columns to the table if it already exists
3. Ensures there is exactly one settings record in the database
4. Sets up Row Level Security (RLS) policies for the settings table

## How to Apply the Migration

### Option 1: Using the Migration Script (Recommended)

We've provided a Node.js script that automates the migration process:

1. Make sure you have Node.js installed
2. Ensure your Supabase credentials are in the `client/.env` file
3. Run the migration script:

```bash
# Install dependencies if needed
npm install @supabase/supabase-js dotenv

# Run the migration script
node apply-settings-migration.js
```

The script will:
- Read the SQL migration file
- Connect to your Supabase database
- Apply the migration
- Provide feedback on the process

### Option 2: Manual SQL Execution

If you prefer to apply the migration manually:

1. Go to the Supabase dashboard for your project
2. Navigate to the SQL Editor
3. Copy the contents of `supabase/schema/settings_migration.sql`
4. Paste the SQL into the editor and execute it

## Troubleshooting

### Error: "function exec_sql does not exist"

If you get this error when running the migration script, you need to create the `exec_sql` function first:

1. Go to the Supabase SQL Editor
2. Run the following SQL:

```sql
CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS void AS $$
BEGIN
  EXECUTE sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

3. Run the migration script again

### Error: "Permission denied"

If you encounter permission issues:

1. Make sure you're using the correct Supabase credentials
2. Consider using the service role key for admin access by adding `SUPABASE_SERVICE_ROLE_KEY` to your `.env` file
3. Alternatively, apply the migration manually through the Supabase dashboard

## After Migration

After successfully applying the migration:

1. The settings table will have the correct structure
2. There will be exactly one settings record in the database
3. The "JSON object requested, multiple (or no) rows returned" error should be resolved
4. The Settings page should load and function correctly

## Settings Table Structure

The migration ensures the settings table has the following columns:

- `id`: Primary key (always 1 for the single settings record)
- `display_duration`: How long each slide is displayed (seconds)
- `transition_duration`: Duration of transition animation (seconds)
- `enable_auto_rotation`: Whether slides rotate automatically
- `default_currency`: Default currency code (e.g., 'BWP')
- `store_timezone`: Store timezone (e.g., 'Africa/Gaborone')
- `store_location`: Store location (e.g., 'Gaborone, Botswana')
- `logo_url`: URL to the store logo
- `primary_color`: Primary brand color (hex code)
- `secondary_color`: Secondary brand color (hex code)
- `updated_at`: Last update timestamp
- `created_at`: Creation timestamp
