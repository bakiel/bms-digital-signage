#!/usr/bin/env node

/**
 * Direct Apply Settings Migration Script
 * 
 * This script applies the settings migration SQL directly to the Supabase database
 * without relying on the exec_sql function.
 * 
 * Usage:
 *   node direct-apply-settings-migration.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

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

async function applyMigration() {
  try {
    console.log('Applying settings migration directly...');
    
    // Check if settings table exists using pg_catalog
    const { data: tableExistsData, error: tableCheckError } = await supabase
      .rpc('sql', { query: `SELECT EXISTS (SELECT FROM pg_catalog.pg_tables WHERE schemaname = 'public' AND tablename = 'settings');` });

    if (tableCheckError) {
      console.error('Error checking if settings table exists:', tableCheckError);
      // Attempt to proceed assuming table might not exist
      console.log('Could not verify table existence, attempting creation...');
      // Fall through to creation logic
    }
    
    const tableExists = tableExistsData?.exists;

    if (!tableExists) {
      console.log('Creating settings table...');
      
      // Create settings table using raw SQL via REST API as the primary method
      console.log('Using direct SQL approach via REST API...');
      const createTableSQL = `
        CREATE TABLE public.settings (
          id SERIAL PRIMARY KEY,
          display_duration INTEGER NOT NULL DEFAULT 10,
          transition_duration NUMERIC(3,1) NOT NULL DEFAULT 1.0,
          enable_auto_rotation BOOLEAN NOT NULL DEFAULT TRUE,
          default_currency VARCHAR(3) NOT NULL DEFAULT 'BWP',
          store_timezone VARCHAR(50) NOT NULL DEFAULT 'Africa/Gaborone',
          store_location VARCHAR(255) NOT NULL DEFAULT 'Gaborone, Botswana',
          logo_url TEXT DEFAULT '',
          primary_color VARCHAR(7) NOT NULL DEFAULT '#1e3a8a',
          secondary_color VARCHAR(7) NOT NULL DEFAULT '#2563eb',
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Add RLS policies
        ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
        
        -- Create policy to allow authenticated users to read settings
        CREATE POLICY "Allow authenticated users to read settings" 
            ON public.settings FOR SELECT 
            USING (auth.role() = 'authenticated');
        
        -- Create policy to allow authenticated users to insert/update settings
        CREATE POLICY "Allow authenticated users to insert/update settings" 
            ON public.settings FOR ALL 
            USING (auth.role() = 'authenticated');
      `;

      const response = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/rpc/sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.VITE_SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': process.env.VITE_SUPABASE_SERVICE_ROLE_KEY, // Use service key as apikey for admin operations
          'Prefer': 'params=single-object'
        },
        body: JSON.stringify({ query: createTableSQL })
      });

      if (!response.ok) {
        const errorData = await response.text(); // Get raw text for better debugging
        console.error('Error creating settings table via REST API:', response.status, errorData);
        console.log('\nPlease apply the migration manually:');
        console.log('1. Go to the Supabase dashboard');
        console.log('2. Navigate to the SQL Editor');
        console.log('3. Copy the contents of supabase/schema/settings_migration.sql');
        console.log('4. Paste and execute the SQL in the editor');
        process.exit(1);
      }
      console.log('Settings table created successfully.');

    } else {
      console.log('Settings table already exists, checking columns...');
      
      // Check and add missing columns if needed
      const columnsToCheck = [
        { name: 'display_duration', type: 'INTEGER', default: '10' },
        { name: 'transition_duration', type: 'NUMERIC(3,1)', default: '1.0' },
        { name: 'enable_auto_rotation', type: 'BOOLEAN', default: 'TRUE' },
        { name: 'default_currency', type: 'VARCHAR(3)', default: "'BWP'" },
        { name: 'store_timezone', type: 'VARCHAR(50)', default: "'Africa/Gaborone'" },
        { name: 'store_location', type: 'VARCHAR(255)', default: "'Gaborone, Botswana'" },
        { name: 'logo_url', type: 'TEXT', default: "''" },
        { name: 'primary_color', type: 'VARCHAR(7)', default: "'#1e3a8a'" },
        { name: 'secondary_color', type: 'VARCHAR(7)', default: "'#2563eb'" },
        { name: 'updated_at', type: 'TIMESTAMP WITH TIME ZONE', default: 'NOW()' },
        { name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', default: 'NOW()' }
      ];
      
      for (const column of columnsToCheck) {
        // Check column existence using pg_catalog
        const { data: columnExistsData, error: columnCheckError } = await supabase
          .rpc('sql', { query: `
            SELECT EXISTS (
              SELECT 1
              FROM pg_catalog.pg_attribute att
              JOIN pg_catalog.pg_class cls ON cls.oid = att.attrelid
              JOIN pg_catalog.pg_namespace nsp ON nsp.oid = cls.relnamespace
              WHERE nsp.nspname = 'public'
                AND cls.relname = 'settings'
                AND att.attname = '${column.name}'
                AND NOT att.attisdropped
            );
          `});

        if (columnCheckError) {
          console.error(`Error checking if column ${column.name} exists:`, columnCheckError);
          continue;
        }

        const columnExists = columnExistsData?.exists;
        
        if (!columnExists) {
          console.log(`Adding missing column ${column.name}...`);
          const addColumnSQL = `ALTER TABLE public.settings ADD COLUMN ${column.name} ${column.type} NOT NULL DEFAULT ${column.default};`;
          
          const response = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/rpc/sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.VITE_SUPABASE_SERVICE_ROLE_KEY}`,
              'apikey': process.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
              'Prefer': 'params=single-object'
            },
            body: JSON.stringify({ query: addColumnSQL })
          });

          if (!response.ok) {
            const errorData = await response.text();
            console.error(`Error adding column ${column.name} via REST API:`, response.status, errorData);
          } else {
            console.log(`Column ${column.name} added successfully.`);
          }
        }
      }
    }
    
    // Check if there's at least one settings record
    const { count, error: countError } = await supabase
      .from('settings')
      .select('id', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Error checking settings count:', countError);
    } else {
      
      if (count === 0) {
        console.log('Creating default settings record...');
        
        const { error: insertError } = await supabase
          .from('settings')
          .insert({
            // id: 1, // Let SERIAL handle the ID generation
            display_duration: 10,
            transition_duration: 1.0,
            enable_auto_rotation: true,
            default_currency: 'BWP',
            store_timezone: 'Africa/Gaborone',
            store_location: 'Gaborone, Botswana',
            logo_url: '',
            primary_color: '#1e3a8a',
            secondary_color: '#2563eb'
          });
        
        if (insertError) {
          console.error('Error creating default settings record:', insertError);
        } else {
          console.log('Default settings record created.');
        }
      } else if (count > 1) {
        console.log('Multiple settings records found, keeping only the first one...');
        
        // Get the ID of the first record
        const { data: firstRecord, error: firstRecordError } = await supabase
          .from('settings')
          .select('id')
          .order('id', { ascending: true })
          .limit(1)
          .single();
        
        if (firstRecordError) {
          console.error('Error getting first settings record:', firstRecordError);
        } else {
          const firstId = firstRecord.id;
          console.log(`Keeping settings record with ID: ${firstId}`);
          
          // Delete all other records
          const { error: deleteError } = await supabase
            .from('settings')
            .delete()
            .neq('id', firstId);
          
          if (deleteError) {
            console.error('Error deleting duplicate settings records:', deleteError);
          } else {
            console.log('Duplicate settings records removed.');
          }
        }
      } else {
         console.log('Single settings record found, no action needed.');
      }
    }
    
    console.log('Settings migration applied successfully!');
    
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

applyMigration();
