# BMS Digital Signage - Implementation Plan

## System Architecture

```
Display Client (Mi TV) <----> Supabase Backend <----> Admin Interface
```

## Database Schema (Supabase)

### Tables

**products**
```sql
create table products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  category_id uuid references categories(id),
  image_url text,
  active boolean default true,
  featured boolean default false,
  special boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

**product_prices**
```sql
create table product_prices (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references products(id) on delete cascade,
  tier_name text,
  price numeric(10,2) not null,
  original_price numeric(10,2),
  currency text default 'BWP',
  created_at timestamp with time zone default now()
);
```

**categories**
```sql
create table categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  image_url text,
  icon text,
  color text,
  display_order integer,
  created_at timestamp with time zone default now()
);
```

**announcements**
```sql
create table announcements (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  content text,
  image_url text,
  type text not null check (type in ('ticker', 'slide', 'popup')),
  active boolean default true,
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  created_at timestamp with time zone default now()
);
```

**settings**
```sql
create table settings (
  id uuid primary key default uuid_generate_v4(),
  key text not null unique,
  value jsonb not null,
  description text,
  updated_at timestamp with time zone default now()
);
```

## Implementation Phases

### Phase 1: Rapid Setup (1-2 days)
- Initialize React project with TypeScript
- Set up Supabase tables and relationships
- Create basic authentication for admin
- Set up Git repository structure
- Configure TailwindCSS

### Phase 2: Display Interface (2-3 days)
- Implement slideshow engine
- Create product display components
- Build information bar (time, weather, announcements)
- Add particle backgrounds with animations
- Implement fullscreen toggle
- Create motion detection for admin controls

### Phase 3: Admin Interface (2-3 days)
- Build admin dashboard
- Create product management (CRUD)
- Implement category management
- Build announcements editor
- Create settings configuration
- Implement media library for images

### Phase 4: Integration & Polish (1-2 days)
- Connect realtime updates
- Add CSV import/export
- Optimize for Mi TV Stick performance
- Implement security restrictions
- Add offline support
- Test on actual hardware

## Display Layout

### Customer View
```
┌─────────────────────────────────────────────────┐
│ [LOGO] | 10:45 AM | 28°C Gaborone | NEWS TICKER │
├─────────────────────────────────────────────────┤
│                                                 │
│                                                 │
│                                                 │
│                PRODUCT DISPLAY                  │
│              (WITH ANIMATIONS)                  │
│                                                 │
│                                                 │
│                                                 │
├─────────────────────────────────────────────────┤
│ [TODAY'S SPECIALS]                              │
└─────────────────────────────────────────────────┘
```

### Admin Controls (Appear on Mouse Movement)
```
┌─────────────────────────────────────────────────┐
│ [LOGO] | 10:45 AM | 28°C Gaborone | NEWS TICKER │
├─────────────────────────────────────────────────┤
│                                                 │
│                                                 │
│                                                 │
│                PRODUCT DISPLAY                  │
│                                                 │
│                                                 │
│                                                 │
│                                                 │
├─────────────────────────────────────────────────┤
│ [CATEGORIES] [TODAY'S SPECIALS]    [ADMIN] [FS] │
└─────────────────────────────────────────────────┘
```

## Component Architecture

### Core Components
- `<SlideShow />` - Main container
- `<InfoBar />` - Top information display
- `<ProductSlide />` - Product display
- `<CategorySlide />` - Category showcase
- `<AnnouncementSlide />` - Special announcements
- `<AdminButton />` - Hidden admin access
- `<AdminPanel />` - Admin interface
- `<ParticleBackground />` - Animated background

### Animation Strategy
- CSS transitions for simple effects
- Framer Motion for complex animations
- tsParticles for background effects
- Hardware acceleration for performance
- Adaptive complexity based on device

## External Integrations

### Weather API
- OpenWeatherMap for Botswana cities
- Cached data to minimize API calls
- Fallback for offline operation

### Image Management
- Supabase Storage for product images
- Client-side image optimization
- Lazy loading to improve performance

## Security Considerations

- IP restriction for admin access
- Store-only network access
- Password protection for admin interface
- Session timeout for security
- Role-based permissions if needed
