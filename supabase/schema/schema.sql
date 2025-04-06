-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories Table
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  image_url text,
  icon text,
  color text,
  display_order integer,
  created_at timestamp with time zone DEFAULT now()
);

-- Products Table
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  category_id uuid REFERENCES categories(id),
  image_url text,
  active boolean DEFAULT true,
  featured boolean DEFAULT false,
  special boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Product Prices Table
CREATE TABLE product_prices (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  tier_name text,
  price numeric(10,2) NOT NULL,
  original_price numeric(10,2),
  currency text DEFAULT 'BWP',
  created_at timestamp with time zone DEFAULT now()
);

-- Announcements Table
CREATE TABLE announcements (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  content text,
  image_url text,
  type text NOT NULL CHECK (type IN ('ticker', 'slide', 'popup')),
  active boolean DEFAULT true,
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Settings Table
CREATE TABLE settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL,
  description text,
  updated_at timestamp with time zone DEFAULT now()
);

-- Row Level Security Policies
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous access (read-only)
CREATE POLICY "Allow anonymous read access to categories" 
  ON categories FOR SELECT USING (true);

CREATE POLICY "Allow anonymous read access to products" 
  ON products FOR SELECT USING (active = true);

CREATE POLICY "Allow anonymous read access to product_prices" 
  ON product_prices FOR SELECT USING (true);

CREATE POLICY "Allow anonymous read access to announcements" 
  ON announcements FOR SELECT 
  USING (
    active = true AND 
    (start_date IS NULL OR start_date <= now()) AND 
    (end_date IS NULL OR end_date >= now())
  );

CREATE POLICY "Allow anonymous read access to settings" 
  ON settings FOR SELECT USING (true);

-- Create policies for authenticated users (full access)
CREATE POLICY "Allow authenticated full access to categories" 
  ON categories FOR ALL 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated full access to products" 
  ON products FOR ALL 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated full access to product_prices" 
  ON product_prices FOR ALL 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated full access to announcements" 
  ON announcements FOR ALL 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated full access to settings" 
  ON settings FOR ALL 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');