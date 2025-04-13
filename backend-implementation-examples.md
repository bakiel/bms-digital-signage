# BMS Digital Signage - Backend Implementation Examples

This document provides practical code examples for implementing common backend operations in the BMS Digital Signage system using Supabase.

## Table of Contents
1. [Authentication Operations](#authentication-operations)
2. [Product Management](#product-management)
3. [Category Management](#category-management)
4. [Announcement Management](#announcement-management)
5. [Settings Management](#settings-management)
6. [Image Storage Operations](#image-storage-operations)
7. [Real-time Subscriptions](#real-time-subscriptions)
8. [Advanced Query Patterns](#advanced-query-patterns)

## Authentication Operations

### User Sign Up (Admin Only)
```typescript
const signUpAdmin = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: 'admin'
      }
    }
  });
  
  return { data, error };
};
```

### User Sign In
```typescript
const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  return { data, error };
};
```

### User Sign Out
```typescript
const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};
```

### Get Current User
```typescript
const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};
```

### Reset Password
```typescript
const resetPassword = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'https://your-site.com/reset-password',
  });
  
  return { error };
};
```

## Product Management

### Fetch All Products
```typescript
const getAllProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories(id, name),
      product_prices(*)
    `)
    .order('name');
    
  return { data, error };
};
```

### Fetch Active Products
```typescript
const getActiveProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories(id, name),
      product_prices(*)
    `)
    .eq('active', true)
    .order('name');
    
  return { data, error };
};
```

### Fetch Featured Products
```typescript
const getFeaturedProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories(id, name),
      product_prices(*)
    `)
    .eq('active', true)
    .eq('featured', true)
    .order('name');
    
  return { data, error };
};
```

### Fetch Products by Category
```typescript
const getProductsByCategory = async (categoryId: string) => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories(id, name),
      product_prices(*)
    `)
    .eq('active', true)
    .eq('category_id', categoryId)
    .order('name');
    
  return { data, error };
};
```

### Create Product
```typescript
const createProduct = async (product: any, prices: any[]) => {
  // Start a transaction
  const { data: productData, error: productError } = await supabase
    .from('products')
    .insert([product])
    .select()
    .single();
    
  if (productError) return { error: productError };
  
  // Add prices with the new product ID
  const pricesWithProductId = prices.map(price => ({
    ...price,
    product_id: productData.id
  }));
  
  const { error: pricesError } = await supabase
    .from('product_prices')
    .insert(pricesWithProductId);
    
  if (pricesError) return { error: pricesError };
  
  return { data: productData, error: null };
};
```

### Update Product
```typescript
const updateProduct = async (id: string, updates: any) => {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
    
  return { data, error };
};
```

### Delete Product
```typescript
const deleteProduct = async (id: string) => {
  // This will also delete related product_prices due to ON DELETE CASCADE
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);
    
  return { error };
};
```

## Category Management

### Fetch All Categories
```typescript
const getAllCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order');
    
  return { data, error };
};
```

### Create Category
```typescript
const createCategory = async (category: any) => {
  const { data, error } = await supabase
    .from('categories')
    .insert([category])
    .select()
    .single();
    
  return { data, error };
};
```

### Update Category
```typescript
const updateCategory = async (id: string, updates: any) => {
  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
    
  return { data, error };
};
```

### Delete Category
```typescript
const deleteCategory = async (id: string) => {
  // Note: This will fail if there are products with this category_id
  // You may want to update those products first or implement a cascade strategy
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);
    
  return { error };
};
```

## Announcement Management

### Fetch Active Announcements
```typescript
const getActiveAnnouncements = async () => {
  const now = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('active', true)
    .lte('start_date', now)
    .gte('end_date', now)
    .order('created_at', { ascending: false });
    
  return { data, error };
};
```

### Fetch Announcements by Type
```typescript
const getAnnouncementsByType = async (type: 'ticker' | 'slide' | 'popup') => {
  const now = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('active', true)
    .eq('type', type)
    .lte('start_date', now)
    .gte('end_date', now)
    .order('created_at', { ascending: false });
    
  return { data, error };
};
```

### Create Announcement
```typescript
const createAnnouncement = async (announcement: any) => {
  const { data, error } = await supabase
    .from('announcements')
    .insert([announcement])
    .select()
    .single();
    
  return { data, error };
};
```

### Update Announcement
```typescript
const updateAnnouncement = async (id: string, updates: any) => {
  const { data, error } = await supabase
    .from('announcements')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
    
  return { data, error };
};
```

### Delete Announcement
```typescript
const deleteAnnouncement = async (id: string) => {
  const { error } = await supabase
    .from('announcements')
    .delete()
    .eq('id', id);
    
  return { error };
};
```

## Settings Management

### Fetch Settings
```typescript
const getSettings = async (key: string) => {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('key', key)
    .single();
    
  return { data, error };
};
```

### Update Settings
```typescript
const updateSettings = async (key: string, value: any) => {
  // Upsert - insert if not exists, update if exists
  const { data, error } = await supabase
    .from('settings')
    .upsert({
      key,
      value,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();
    
  return { data, error };
};
```

## Image Storage Operations

### Upload Image
```typescript
const uploadImage = async (file: File, path: string) => {
  const { data, error } = await supabase.storage
    .from('images')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true
    });
    
  return { data, error };
};
```

### Get Image URL
```typescript
const getImageUrl = (path: string) => {
  const { data } = supabase.storage
    .from('images')
    .getPublicUrl(path);
    
  return data.publicUrl;
};
```

### Delete Image
```typescript
const deleteImage = async (path: string) => {
  const { error } = await supabase.storage
    .from('images')
    .remove([path]);
    
  return { error };
};
```

### List Images in Directory
```typescript
const listImages = async (directory: string) => {
  const { data, error } = await supabase.storage
    .from('images')
    .list(directory);
    
  return { data, error };
};
```

## Real-time Subscriptions

### Subscribe to Product Changes
```typescript
const subscribeToProducts = (callback: (payload: any) => void) => {
  const subscription = supabase
    .channel('public:products')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'products'
    }, callback)
    .subscribe();
    
  return subscription;
};
```

### Subscribe to Announcement Changes
```typescript
const subscribeToAnnouncements = (callback: (payload: any) => void) => {
  const subscription = supabase
    .channel('public:announcements')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'announcements'
    }, callback)
    .subscribe();
    
  return subscription;
};
```

### Subscribe to Settings Changes
```typescript
const subscribeToSettings = (callback: (payload: any) => void) => {
  const subscription = supabase
    .channel('public:settings')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'settings'
    }, callback)
    .subscribe();
    
  return subscription;
};
```

## Advanced Query Patterns

### Full-Text Search
```typescript
const searchProducts = async (query: string) => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories(id, name),
      product_prices(*)
    `)
    .textSearch('name', query, {
      type: 'websearch',
      config: 'english'
    });
    
  return { data, error };
};
```

### Pagination
```typescript
const getProductsPaginated = async (page: number, pageSize: number) => {
  const from = page * pageSize;
  const to = from + pageSize - 1;
  
  const { data, error, count } = await supabase
    .from('products')
    .select(`
      *,
      categories(id, name),
      product_prices(*)
    `, { count: 'exact' })
    .order('name')
    .range(from, to);
    
  return { data, error, count, page, pageSize };
};
```

### Filtering with Multiple Conditions
```typescript
const getFilteredProducts = async (filters: any) => {
  let query = supabase
    .from('products')
    .select(`
      *,
      categories(id, name),
      product_prices(*)
    `);
    
  // Apply filters
  if (filters.categoryId) {
    query = query.eq('category_id', filters.categoryId);
  }
  
  if (filters.active !== undefined) {
    query = query.eq('active', filters.active);
  }
  
  if (filters.featured !== undefined) {
    query = query.eq('featured', filters.featured);
  }
  
  if (filters.special !== undefined) {
    query = query.eq('special', filters.special);
  }
  
  if (filters.minPrice !== undefined) {
    query = query.gte('product_prices.price', filters.minPrice);
  }
  
  if (filters.maxPrice !== undefined) {
    query = query.lte('product_prices.price', filters.maxPrice);
  }
  
  // Execute query
  const { data, error } = await query.order('name');
  
  return { data, error };
};
```

### Transactions with Multiple Operations
```typescript
const updateProductWithPrices = async (
  productId: string, 
  productUpdates: any, 
  pricesToAdd: any[], 
  pricesToUpdate: any[], 
  priceIdsToDelete: string[]
) => {
  // Start a transaction
  const { error: productError } = await supabase
    .from('products')
    .update(productUpdates)
    .eq('id', productId);
    
  if (productError) return { error: productError };
  
  // Add new prices
  if (pricesToAdd.length > 0) {
    const newPrices = pricesToAdd.map(price => ({
      ...price,
      product_id: productId
    }));
    
    const { error: addError } = await supabase
      .from('product_prices')
      .insert(newPrices);
      
    if (addError) return { error: addError };
  }
  
  // Update existing prices
  for (const price of pricesToUpdate) {
    const { error: updateError } = await supabase
      .from('product_prices')
      .update({
        tier_name: price.tier_name,
        price: price.price,
        original_price: price.original_price
      })
      .eq('id', price.id);
      
    if (updateError) return { error: updateError };
  }
  
  // Delete prices
  if (priceIdsToDelete.length > 0) {
    const { error: deleteError } = await supabase
      .from('product_prices')
      .delete()
      .in('id', priceIdsToDelete);
      
    if (deleteError) return { error: deleteError };
  }
  
  // Get the updated product with prices
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories(id, name),
      product_prices(*)
    `)
    .eq('id', productId)
    .single();
    
  return { data, error };
};