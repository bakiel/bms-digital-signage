import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Read environment variables from .env.local
const envContent = fs.readFileSync('./.env.local', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or key is missing in .env.local');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function setupSupabase() {
  try {
    console.log('Starting Supabase setup...');

    // 1. Create admin user first (if doesn't exist)
    console.log('Creating admin user...');
    try {
      const { data: signUpData, error: userError } = await supabase.auth.signUp({
        email: 'admin@bms.com',
        password: 'admin123',
        options: {
          data: {
            role: 'admin'
          }
        }
      });
      
      if (userError && !userError.message.includes('already exists')) {
        console.error('Error creating admin user:', userError);
      } else {
        console.log('Admin user created successfully or already exists!');
        console.log('Email: admin@bms.com');
        console.log('Password: admin123');
        console.log('Note: You may need to manually confirm the email in the Supabase dashboard.');
      }
    } catch (error) {
      console.error('Error creating admin user:', error);
    }

    // 2. Try to sign in as admin
    console.log('Signing in as admin user...');
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'admin@bms.com',
        password: 'admin123'
      });

      if (authError) {
        console.error('Authentication error:', authError.message);
        console.error('You need to confirm the admin email in the Supabase dashboard before proceeding.');
        console.error('After confirming, run this script again to create the storage buckets.');
        process.exit(1);
      }

      console.log('Successfully signed in as admin user');
    } catch (error) {
      console.error('Error signing in as admin:', error.message);
      process.exit(1);
    }

    // 3. Create storage buckets
    console.log('Creating storage buckets...');
    
    // Define the buckets we need according to image-management.md
    const buckets = [
      { name: 'branding', description: 'BMS logos and branding materials' },
      { name: 'products', description: 'All product images' },
      { name: 'uniforms', description: 'School uniform images' },
      { name: 'ui-elements', description: 'UI-related images and icons' }
    ];
    
    // Create each bucket
    for (const bucket of buckets) {
      try {
        console.log(`Creating ${bucket.name} bucket...`);
        const { error: bucketError } = await supabase.storage.createBucket(bucket.name, {
          public: true,
          fileSizeLimit: 10485760 // 10MB
        });
        
        if (bucketError) {
          if (bucketError.message && bucketError.message.includes('already exists')) {
            console.log(`${bucket.name} bucket already exists.`);
          } else {
            console.error(`Error creating ${bucket.name} bucket:`, bucketError);
          }
        } else {
          console.log(`${bucket.name} bucket created successfully!`);
        }
      } catch (error) {
        console.error(`Error creating ${bucket.name} bucket:`, error);
      }
    }
    
    console.log('Supabase setup completed!');
    console.log('Note: You still need to set up the database schema and sample data manually.');
    console.log('Please follow the instructions in README-SETUP.md for the complete setup process.');
  } catch (error) {
    console.error('Error setting up Supabase:', error);
  }
}

setupSupabase();