-- Settings table migration script
-- This script creates or updates the settings table structure
-- and ensures there's at least one default settings record

-- First, check if the settings table exists
DO $$
BEGIN
    -- Create the settings table if it doesn't exist
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'settings') THEN
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
            
        RAISE NOTICE 'Created settings table';
    ELSE
        -- Table exists, ensure it has all the required columns
        -- Add any missing columns
        
        -- Check for display_duration column
        IF NOT EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_schema = 'public' AND table_name = 'settings' AND column_name = 'display_duration') THEN
            ALTER TABLE public.settings ADD COLUMN display_duration INTEGER NOT NULL DEFAULT 10;
        END IF;
        
        -- Check for transition_duration column
        IF NOT EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_schema = 'public' AND table_name = 'settings' AND column_name = 'transition_duration') THEN
            ALTER TABLE public.settings ADD COLUMN transition_duration NUMERIC(3,1) NOT NULL DEFAULT 1.0;
        END IF;
        
        -- Check for enable_auto_rotation column
        IF NOT EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_schema = 'public' AND table_name = 'settings' AND column_name = 'enable_auto_rotation') THEN
            ALTER TABLE public.settings ADD COLUMN enable_auto_rotation BOOLEAN NOT NULL DEFAULT TRUE;
        END IF;
        
        -- Check for default_currency column
        IF NOT EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_schema = 'public' AND table_name = 'settings' AND column_name = 'default_currency') THEN
            ALTER TABLE public.settings ADD COLUMN default_currency VARCHAR(3) NOT NULL DEFAULT 'BWP';
        END IF;
        
        -- Check for store_timezone column
        IF NOT EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_schema = 'public' AND table_name = 'settings' AND column_name = 'store_timezone') THEN
            ALTER TABLE public.settings ADD COLUMN store_timezone VARCHAR(50) NOT NULL DEFAULT 'Africa/Gaborone';
        END IF;
        
        -- Check for store_location column
        IF NOT EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_schema = 'public' AND table_name = 'settings' AND column_name = 'store_location') THEN
            ALTER TABLE public.settings ADD COLUMN store_location VARCHAR(255) NOT NULL DEFAULT 'Gaborone, Botswana';
        END IF;
        
        -- Check for logo_url column
        IF NOT EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_schema = 'public' AND table_name = 'settings' AND column_name = 'logo_url') THEN
            ALTER TABLE public.settings ADD COLUMN logo_url TEXT DEFAULT '';
        END IF;
        
        -- Check for primary_color column
        IF NOT EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_schema = 'public' AND table_name = 'settings' AND column_name = 'primary_color') THEN
            ALTER TABLE public.settings ADD COLUMN primary_color VARCHAR(7) NOT NULL DEFAULT '#1e3a8a';
        END IF;
        
        -- Check for secondary_color column
        IF NOT EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_schema = 'public' AND table_name = 'settings' AND column_name = 'secondary_color') THEN
            ALTER TABLE public.settings ADD COLUMN secondary_color VARCHAR(7) NOT NULL DEFAULT '#2563eb';
        END IF;
        
        -- Check for updated_at column
        IF NOT EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_schema = 'public' AND table_name = 'settings' AND column_name = 'updated_at') THEN
            ALTER TABLE public.settings ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        END IF;
        
        -- Check for created_at column
        IF NOT EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_schema = 'public' AND table_name = 'settings' AND column_name = 'created_at') THEN
            ALTER TABLE public.settings ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        END IF;
        
        RAISE NOTICE 'Updated settings table structure';
    END IF;
    
    -- Ensure there's at least one settings record
    IF NOT EXISTS (SELECT FROM public.settings LIMIT 1) THEN
        INSERT INTO public.settings (
            id, 
            display_duration, 
            transition_duration, 
            enable_auto_rotation, 
            default_currency, 
            store_timezone, 
            store_location, 
            logo_url, 
            primary_color, 
            secondary_color
        ) VALUES (
            1, 
            10, 
            1.0, 
            TRUE, 
            'BWP', 
            'Africa/Gaborone', 
            'Gaborone, Botswana', 
            '', 
            '#1e3a8a', 
            '#2563eb'
        );
        RAISE NOTICE 'Created default settings record';
    END IF;
    
    -- If there are multiple settings records, keep only the first one
    IF (SELECT COUNT(*) FROM public.settings) > 1 THEN
        -- Get the ID of the first record
        DECLARE first_id INTEGER;
        BEGIN
            SELECT id INTO first_id FROM public.settings ORDER BY id LIMIT 1;
            
            -- Delete all other records
            DELETE FROM public.settings WHERE id != first_id;
            RAISE NOTICE 'Removed duplicate settings records, keeping only ID %', first_id;
        END;
    END IF;
END
$$;
