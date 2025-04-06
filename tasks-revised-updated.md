# BMS Digital Signage - Task Tracking

## Project Setup

- [x] Initialize React project (Vite + TypeScript)
- [x] Configure Supabase connection (`client/src/utils/supabaseClient.ts`)
- [x] Setup TypeScript configuration (`client/tsconfig.json`)
- [x] Install dependencies (`client/package.json`)
- [ ] Configure Git repository
- [x] Create basic project structure (`client/src/`)
- [x] Define environment variables (`client/.env`)

## Supabase Backend Setup

- [x] Create Supabase project
- [x] Set up database tables
  - [x] products table
  - [x] product_prices table
  - [x] categories table
  - [x] announcements table
  - [x] settings table
- [x] Configure Row Level Security (Initial setup, may need refinement)
- [x] Create storage buckets for images (`branding`, `products`, `uniforms`, `ui-elements` - via Supabase dashboard or script)
- [x] Set up authentication for admin (`client/src/context/AuthContext.tsx`, `client/src/pages/admin/Login.tsx`)
- [x] Add sample data for development (via Supabase dashboard or `supabase/schema/sample_data.sql`)

## Display Frontend (Customer View)

- [x] Create main slideshow container (`client/src/components/SlideShow.tsx`)
- [x] Implement slide transition system (using Framer Motion in `SlideShow.tsx`)
- [x] Build product slide component (`client/src/components/slides/ProductSlide.tsx`)
  - [x] Product image display (`client/src/components/ProductImage.tsx`)
  - [x] Product details layout
  - [x] Price display with optional "was" price
- [x] Create category showcase slide (`client/src/components/slides/CategorySlide.tsx`)
- [x] Build special announcement slide (`client/src/components/slides/AnnouncementSlide.tsx`)
- [x] Implement information bar (`client/src/components/InfoBar.tsx`)
  - [x] Clock and date component
  - [x] Weather display for Botswana cities (requires `VITE_WEATHER_API_KEY`)
  - [x] Scrolling announcement ticker (CSS in `index.css`)
- [x] Add background animation system (`client/src/components/animations/ParticleBackground.tsx`)
  - [x] Particle effects (using `react-tsparticles`)
  - [ ] Gradient animations (Partially done in slide backgrounds)
  - [ ] Product hover effects (Not implemented)
- [ ] Create "Today's Specials" section (Logic for `special: true` exists, but no dedicated section)
- [x] Implement fullscreen functionality (in `SlideShow.tsx`)
- [x] Add motion detection for admin controls (in `SlideShow.tsx`)
- [x] Create auto-hiding controls (in `SlideShow.tsx`)
- [x] Optimize for viewing distance (via CSS in `index.css`)
- [x] Ensure readability from shopping aisles (via CSS in `index.css`)
- [ ] **Fix Image Display:** Update `image_url` in Supabase DB tables (`products`, `categories`, `announcements`) using `image-urls.txt` (Manual Step Required)

---

## Customer Screen Polish & Optimization (Current Priority)

- [ ] Polish slide designs for a more modern, visually appealing look
  - [~] Refine typography, spacing, and color consistency (Partially done - card colors/text/borders)
  - [ ] Add subtle hover/touch effects where appropriate
  - [~] Improve announcement slide styling and animations (Partially done - added logo)
  - [~] Enhance category grid layout and responsiveness (Partially done - fixed banner, added watermark, adjusted image bg)
  - [~] Optimize product slide discount/special offer visuals (Partially done - added watermark)
- [ ] Improve background visuals
  - [x] Add optional gradient overlays or animated gradients (Adjusted main background gradient)
  - [x] Tune particle animation for performance and aesthetics (Adjusted speed, colors, opacity, density, links, background contrast)
- [ ] Enhance InfoBar
  - [ ] Improve ticker animation smoothness
  - [ ] Add optional icons or highlights for important announcements
  - [ ] Make weather widget more visually integrated
- [ ] Add smooth slide transition effects (e.g., slide, zoom, fade combos)
- [ ] Implement dedicated "Today's Specials" section or highlight
- [ ] Test and optimize for Mi TV Stick display clarity and performance
- [~] Add accessibility improvements (contrast, font size options) (Partially done - addressed contrast)
- [ ] Finalize image URL updates in Supabase for all content
- [ ] Document design guidelines for customer-facing UI consistency
- [ ] Note dependencies (weather API key, Supabase image URLs)

## Admin Interface

- [x] Create admin login page (`client/src/pages/admin/Login.tsx` exists)
- [ ] Build dashboard layout (`client/src/pages/admin/Dashboard.tsx` exists, needs UI improvement)
- [ ] **Add Branding to Admin:** Incorporate BMS logo/branding into the admin interface header/layout.
- [ ] **Improve Admin UI/UX:** Enhance visual design and usability of all admin pages (Dashboard, Products, Categories, Announcements).
- [ ] Implement product management
  - [ ] Product listing with filters
  - [ ] Add/edit product form
  - [ ] Image upload interface
  - [ ] Multi-tier pricing editor
  - [ ] Delete confirmation
- [ ] Build category management
  - [ ] Category listing
  - [ ] Add/edit category form
  - [ ] Category ordering
  - [ ] Icon selection
- [ ] Create announcement management
  - [ ] Announcement listing
  - [ ] Add/edit announcement form
  - [ ] Ticker vs. slide type selector
  - [ ] Scheduling options
- [ ] Implement settings page
  - [ ] Display settings
  - [ ] Weather city configuration
  - [ ] Animation settings
  - [ ] System preferences
- [ ] Add media library
  - [ ] Image upload
  - [ ] Image browser
  - [ ] Usage tracking
- [ ] Build preview functionality
- [ ] Create quick toggle between admin/display
- [ ] Implement CSV import/export

---

## Admin UI Polish & Branding (Upcoming Priority)

- [ ] Add BMS logo prominently on login page
- [ ] Add consistent BMS branding/logo to admin header and sidebar
- [ ] Use BMS color scheme throughout admin interface
- [ ] Improve login page design and UX
- [ ] Polish dashboard layout with branding and better navigation
- [ ] Enhance product/category/announcement management pages for better usability
- [ ] Improve form layouts, validation, and feedback
- [ ] Build a WordPress-style media library
  - [ ] Drag-and-drop image upload
  - [ ] Thumbnail previews
  - [ ] Image metadata editing (title, alt text, description)
  - [ ] Organize images by folders/tags
  - [ ] Search and filter images
  - [ ] Reuse images across products/categories/announcements
- [ ] Add image cropping/resizing options
- [ ] Ensure responsive design for tablets/admin devices
- [ ] Add tooltips/help text for admin features
- [ ] Test admin UX with real data and refine

## Integration Features

- [ ] Set up Supabase realtime subscriptions
- [ ] Implement data caching for offline support
- [ ] Add error handling and recovery
- [ ] Create update notification system
- [ ] Build automatic content refresh
- [ ] Implement secure deployment
- [ ] Add basic analytics for usage tracking

## Security & Store Environment

- [ ] Implement IP restriction for admin
- [ ] Add password protection
- [ ] Create session timeout for security
- [ ] Build access logging
- [ ] Configure store-only network access
- [ ] Implement hardware binding (if needed)
- [ ] Add tamper protection for display mode

## Performance Optimization

- [ ] Optimize image loading and caching
- [ ] Implement code splitting
- [ ] Add lazy loading for components
- [ ] Optimize animation performance
- [ ] Create adaptive quality based on hardware
- [ ] Reduce bundle size
- [ ] Implement memory management

## Testing & Deployment

- [ ] Test on Mi TV Stick hardware
- [ ] Verify browser compatibility
- [ ] Test with large product catalogs
- [ ] Validate offline functionality
- [ ] Create deployment package
- [ ] Set up hosting configuration
- [x] Create user documentation (Initial README, guides created/updated)

## Weekly Targets

### Week 1
- Complete project setup
- Implement basic slideshow
- Create Supabase schema
- Build core display components

### Week 2
- Complete admin interface
- Implement all animations
- Connect realtime updates
- Test on actual hardware

## Implementation Notes
- Use standard development tools and practices.
- Reference the 15 sample projects as needed.
- Prioritize speed and functionality over perfection.
