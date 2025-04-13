#!/usr/bin/env node

/**
 * Apply Settings Migration Script
 * 
 * This script applies the settings migration SQL to the Supabase database.
 * It reads the SQL file and executes it using the Supabase client.
 * 
 * Usage:
 *   node apply-settings-migration.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { createInterface } from 'readline';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, 'client/.env') });

// Validate environment variables
if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
  console.error('Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in client/.env file');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function applyMigration() {
  try {
    console.log('Reading migration SQL file...');
    const sqlFilePath = path.resolve(__dirname, 'supabase/schema/settings_migration.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('Authenticating with Supabase...');
    // Check if we have service role key for admin access
    const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
    let client = supabase;
    
    if (!serviceRoleKey) {
      console.log('No service role key found. Will attempt to use authenticated user session.');
      
      // Prompt for credentials if not using service role
      const readline = createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const email = await new Promise(resolve => {
        readline.question('Enter your Supabase admin email: ', resolve);
      });
      
      const password = await new Promise(resolve => {
        readline.question('Enter your Supabase admin password: ', resolve);
      });
      
      readline.close();
      
      // Sign in with credentials
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (signInError) {
        console.error('Authentication failed:', signInError.message);
        process.exit(1);
      }
      
      console.log('Authentication successful.');
    } else {
      console.log('Using service role key for admin access.');
      // Create a new client with the service role key
      client = createClient(
        process.env.VITE_SUPABASE_URL,
        serviceRoleKey
      );
    }
    
    console.log('Applying settings migration...');
    const { error } = await client.rpc('exec_sql', { sql });
    
    if (error) {
      console.error('Error applying migration:', error.message);
      
      // If the error is about the exec_sql function not existing, provide instructions
      if (error.message.includes('function exec_sql') && error.message.includes('does not exist')) {
        console.log('\nThe exec_sql function does not exist in your Supabase instance.');
        console.log('You need to create this function first. Run the following SQL in the Supabase SQL editor:');
        console.log('\n----- SQL to create exec_sql function -----');
        console.log(`
CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS void AS $$
BEGIN
  EXECUTE sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
        `);
        console.log('----- End of SQL -----\n');
        console.log('After creating the function, run this migration script again.');
      }
      
      // Alternative manual instructions
      console.log('\nAlternatively, you can apply the migration manually:');
      console.log('1. Go to the Supabase dashboard');
      console.log('2. Navigate to the SQL Editor');
      console.log('3. Copy the contents of supabase/schema/settings_migration.sql');
      console.log('4. Paste and execute the SQL in the editor');
      
      process.exit(1);
    }
    
    console.log('Settings migration applied successfully!');
    console.log('The settings table has been created or updated with the required structure.');
    console.log('A default settings record has been created if none existed.');
    console.log('If multiple settings records existed, only the first one has been kept.');
    
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

applyMigration();
