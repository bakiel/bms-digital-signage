#!/usr/bin/env node

/**
 * Create exec_sql Function Script
 * 
 * This script creates the exec_sql function in the Supabase database,
 * which is required for the settings migration.
 * 
 * Usage:
 *   node create-exec-sql-function.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, 'client/.env') });

// Validate environment variables
if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY must be set in client/.env file');
  process.exit(1);
}

// Initialize Supabase client with service role key for admin access
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function createExecSqlFunction() {
  try {
    console.log('Creating exec_sql function in Supabase...');
    
    // SQL to create the exec_sql function
    const sql = `
      CREATE OR REPLACE FUNCTION exec_sql(sql text)
      RETURNS void AS $$
      BEGIN
        EXECUTE sql;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;
    
    // Execute the SQL directly using the REST API
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      // If the function doesn't exist yet, we need to use a different approach
      console.log('Could not call exec_sql (as expected). Creating it using raw SQL...');
      
      // Use raw SQL query to create the function
      const { error: sqlError } = await supabase.from('_exec_sql_temp').select('*').limit(1).then(
        () => ({ error: null }), // This will fail, but we don't care
        async () => {
          // Use raw SQL query via the REST API
          const response = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.VITE_SUPABASE_SERVICE_ROLE_KEY}`,
              'apikey': process.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
              'Prefer': 'params=single-object',
              'X-Client-Info': 'supabase-js/2.0.0'
            },
            body: JSON.stringify({
              query: sql
            })
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            return { error: new Error(`Failed to execute SQL: ${JSON.stringify(errorData)}`) };
          }
          
          return { error: null };
        }
      );
      
      if (sqlError) {
        console.error('Error creating exec_sql function:', sqlError);
        console.log('\nPlease create the exec_sql function manually:');
        console.log('1. Go to the Supabase dashboard');
        console.log('2. Navigate to the SQL Editor');
        console.log('3. Run the following SQL:');
        console.log('\n----- SQL to create exec_sql function -----');
        console.log(sql);
        console.log('----- End of SQL -----\n');
        process.exit(1);
      }
    }
    
    console.log('exec_sql function created successfully!');
    console.log('You can now run the settings migration script:');
    console.log('node apply-settings-migration.js');
    
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

createExecSqlFunction();
