# BMS Digital Signage - Backend Design Notes

## 1. Current Backend Architecture

### Supabase Integration
- **Platform**: Supabase (PostgreSQL database with RESTful API)
- **Project Details**:
  - Project Name: bms-digital-signage
  - Project URL: https://rwsjbkedgztplwzxoxks.supabase.co
- **Key Components**:
  - PostgreSQL Database
  - Authentication System
  - Storage Buckets for Images
  - Row-Level Security Policies

### Client-Server Communication
- **Client**: React-based web application
- **API**: Supabase JavaScript client
- **Authentication**: Email/password via Supabase Auth
- **Data Access**: Direct database access via Supabase API

## 2. Data Models

### Core Tables
1. **Categories**
   ```sql
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
   ```

2. **Products**
   ```sql
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
   ```

3. **Product Prices**
   ```sql
   CREATE TABLE product_prices (
     id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
     product_id uuid REFERENCES products(id) ON DELETE CASCADE,
     tier_name text,
     price numeric(10,2) NOT NULL,
     original_price numeric(10,2),
     currency text DEFAULT 'BWP',
     created_at timestamp with time zone DEFAULT now()
   );
   ```

4. **Announcements**
   ```sql
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
   ```

5. **Settings**
   ```sql
   CREATE TABLE settings (
     id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
     key text NOT NULL UNIQUE,
     value jsonb NOT NULL,
     description text,
     updated_at timestamp with time zone DEFAULT now()
   );
   ```

### Relationships
- Products belong to Categories (many-to-one)
- Product Prices belong to Products (many-to-one)
- Settings and Announcements are standalone entities

## 3. Authentication & Authorization

### Authentication System
- **Provider**: Supabase Auth
- **Method**: Email/password authentication
- **User Management**: Admin users created through Supabase dashboard
- **Session Handling**: JWT tokens managed by Supabase client

### Authorization (Row-Level Security)
- **Anonymous Users**: Read-only access to active products, categories, prices, and current announcements
- **Authenticated Users**: Full CRUD access to all tables
- **RLS Policies**: Implemented at the database level for each table

```sql
-- Example RLS policy for products
CREATE POLICY "Allow anonymous read access to products" 
  ON products FOR SELECT USING (active = true);

CREATE POLICY "Allow authenticated full access to products" 
  ON products FOR ALL 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
```

## 4. API Endpoints & Data Access

### Supabase Client Integration
```typescript
// supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Key API Operations

#### Authentication
```typescript
// Sign In
const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ 
    email, 
    password 
  });
  return { data, error };
};

// Sign Out
const signOut = async () => {
  await supabase.auth.signOut();
};
```

#### Data Operations
```typescript
// Fetch Categories
const getCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order');
  return { data, error };
};

// Fetch Products with Category and Prices
const getProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories(*),
      product_prices(*)
    `)
    .eq('active', true);
  return { data, error };
};

// Create/Update Product
const upsertProduct = async (product) => {
  const { data, error } = await supabase
    .from('products')
    .upsert(product)
    .select();
  return { data, error };
};
```

## 5. Storage System

### Image Storage
- **Bucket**: "images" bucket in Supabase Storage
- **Access**: Public bucket for anonymous access
- **Organization**: Images stored in subdirectories (products/, uniforms/)
- **URL Construction**: `${supabaseUrl}/storage/v1/object/public/images/${imagePath}`

### Image Management
- Upload via Supabase Storage API
- Reference in database via relative path (e.g., "products/pen-bic-cristal-blue.png")
- Optimization for TV display recommended (appropriate dimensions and file sizes)

## 6. Deployment Considerations

### MI TV Stick Implementation
- Web-based application accessed via browser
- Optimized for TV display with appropriate CSS
- Fullscreen mode and keyboard navigation
- Periodic page refresh for memory management

### Performance Optimization
- Image size optimization
- Simple animations for smooth performance
- Caching strategies for frequently accessed data

## 7. Recommendations for Backend Improvements

### Data Model Enhancements
1. **Inventory Management**:
   ```sql
   CREATE TABLE inventory (
     id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
     product_id uuid REFERENCES products(id) ON DELETE CASCADE,
     tier_name text,
     quantity integer NOT NULL DEFAULT 0,
     low_stock_threshold integer DEFAULT 5,
     updated_at timestamp with time zone DEFAULT now()
   );
   ```

2. **Store Locations**:
   ```sql
   CREATE TABLE stores (
     id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
     name text NOT NULL,
     location text,
     contact_info jsonb,
     created_at timestamp with time zone DEFAULT now()
   );
   ```

3. **Store-Specific Settings**:
   ```sql
   CREATE TABLE store_settings (
     id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
     store_id uuid REFERENCES stores(id) ON DELETE CASCADE,
     key text NOT NULL,
     value jsonb NOT NULL,
     updated_at timestamp with time zone DEFAULT now(),
     UNIQUE(store_id, key)
   );
   ```

### API Enhancements
1. **Serverless Functions**:
   - Create Supabase Edge Functions for complex operations
   - Example: Inventory update with notification triggers

2. **Real-time Updates**:
   - Implement Supabase Realtime for live updates
   ```typescript
   const productsSubscription = supabase
     .channel('public:products')
     .on('postgres_changes', { 
       event: '*', 
       schema: 'public', 
       table: 'products' 
     }, (payload) => {
       // Handle real-time updates
     })
     .subscribe();
   ```

3. **Batch Operations**:
   - Create functions for bulk product updates
   - Implement transaction support for related data

### Security Enhancements
1. **Role-Based Access Control**:
   - Create different user roles (admin, store manager, staff)
   - Implement RLS policies based on user roles

2. **API Rate Limiting**:
   - Implement rate limiting for API requests
   - Add monitoring for suspicious activities

3. **Audit Logging**:
   ```sql
   CREATE TABLE audit_logs (
     id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
     user_id uuid REFERENCES auth.users(id),
     action text NOT NULL,
     table_name text NOT NULL,
     record_id uuid,
     old_data jsonb,
     new_data jsonb,
     created_at timestamp with time zone DEFAULT now()
   );
   ```

### Performance Optimizations
1. **Database Indexes**:
   ```sql
   CREATE INDEX idx_products_category_id ON products(category_id);
   CREATE INDEX idx_product_prices_product_id ON product_prices(product_id);
   CREATE INDEX idx_announcements_active_dates ON announcements(active, start_date, end_date);
   ```

2. **Caching Strategy**:
   - Implement client-side caching for frequently accessed data
   - Consider Redis integration for server-side caching

3. **Query Optimization**:
   - Use specific column selection instead of '*'
   - Implement pagination for large result sets

## 8. Implementation Plan

### Phase 1: Core Backend Enhancements
1. Add missing indexes to existing tables
2. Implement audit logging system
3. Create store-specific settings table

### Phase 2: Advanced Features
1. Develop inventory management system
2. Implement real-time updates for display
3. Create store management functionality

### Phase 3: Optimization & Scaling
1. Implement caching strategy
2. Optimize image storage and delivery
3. Add performance monitoring

## 9. Testing Strategy

### Unit Testing
- Test individual API operations
- Validate data model constraints
- Verify authentication flows

### Integration Testing
- Test end-to-end workflows
- Verify RLS policies
- Test real-time updates

### Performance Testing
- Measure API response times
- Test with large datasets
- Verify TV display performance

## 10. Documentation

### API Documentation
- Document all API endpoints
- Include request/response examples
- Document error handling

### Database Schema
- Maintain up-to-date schema documentation
- Document relationships and constraints
- Include sample queries

### Deployment Guide
- Update Supabase setup instructions
- Document environment variables
- Include backup and recovery procedures